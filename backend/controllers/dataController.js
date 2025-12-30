const db = require('../config/db');

exports.getAllPools = (req, res) => {
    db.all(`SELECT * FROM pools`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ pools: rows });
    });
};

exports.createPool = (req, res) => {
    const { name, apy, lockPeriod, risk, desc } = req.body;

    // Server-side validation
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
    const user_id = req.user.id; // From JWT middleware

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
        SELECT stakes.id, stakes.amount, stakes.staked_at, stakes.status, pools.name as pool_name, pools.apy_percentage 
        FROM stakes 
        JOIN pools ON stakes.pool_id = pools.id 
        WHERE stakes.user_id = ?
    `;

    db.all(sql, [user_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ stakes: rows });
    });
};