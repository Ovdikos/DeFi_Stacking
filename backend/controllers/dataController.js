const db = require('../config/db');

exports.getAllPools = (req, res) => {
    db.all(`SELECT * FROM pools`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ pools: rows });
    });
};

exports.createPool = (req, res) => {
    const { name, apy, lockPeriod, risk, desc } = req.body;

    if (!name || !apy || !lockPeriod) {
        return res.status(400).json({ message: "Missing required pool data" });
    }

    const sql = `INSERT INTO pools (name, apy_percentage, min_lock_period, risk_level, description) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [name, apy, lockPeriod, risk, desc], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Pool created", id: this.lastID });
    });
};

exports.stakeTokens = (req, res) => {
    const { pool_id, amount } = req.body;
    const user_id = req.user.id;

    if (amount <= 0) return res.status(400).json({ message: "Amount must be positive" });

    const sql = `INSERT INTO stakes (user_id, pool_id, amount) VALUES (?, ?, ?)`;
    db.run(sql, [user_id, pool_id, amount], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Staked successfully", stakeId: this.lastID });
    });
};

exports.getMyStakes = (req, res) => {
    const user_id = req.user.id;

    const sql = `
        SELECT stakes.id, stakes.amount, stakes.staked_at, stakes.status,
               pools.name as pool_name, pools.apy_percentage, pools.min_lock_period
        FROM stakes
                 JOIN pools ON stakes.pool_id = pools.id
        WHERE stakes.user_id = ?
    `;

    db.all(sql, [user_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const now = new Date();

        const processedRows = rows.map(row => {
            let dateString = row.staked_at;
            if (dateString && !dateString.includes('T')) {
                dateString = dateString.replace(' ', 'T') + 'Z';
            }

            const stakeDate = new Date(dateString);
            const lockPeriodDays = row.min_lock_period;

            const unlockDate = new Date(stakeDate);
            unlockDate.setDate(unlockDate.getDate() + lockPeriodDays);

            let currentStatus = row.status;

            if (currentStatus === 'active' && now > unlockDate) {
                currentStatus = 'completed';
            }

            const profit = (row.amount * (row.apy_percentage / 100) * (row.min_lock_period / 365)).toFixed(2);

            return {
                ...row,
                status: currentStatus,
                unlock_date: unlockDate.toISOString(),
                profit: profit
            };
        });

        res.json({ stakes: processedRows });
    });
};

exports.claimReward = (req, res) => {
    const { stakeId } = req.body;
    const user_id = req.user.id;

    const sql = `UPDATE stakes SET status = 'claimed' WHERE id = ? AND user_id = ?`;

    db.run(sql, [stakeId, user_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Stake not found or already claimed" });

        res.json({ message: "Rewards claimed successfully!" });
    });
};