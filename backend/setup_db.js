const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const SALT_ROUNDS = 10;

const createTables = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT CHECK(role IN ('admin', 'user', 'guest')) DEFAULT 'user',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS pools (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                apy_percentage REAL NOT NULL,
                min_lock_period INTEGER NOT NULL,
                risk_level TEXT CHECK(risk_level IN ('Low', 'Medium', 'High')) NOT NULL,
                description TEXT
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS stakes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                pool_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                staked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT CHECK(status IN ('active', 'completed', 'unstaked', 'claimed')) DEFAULT 'active',
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (pool_id) REFERENCES pools (id)
            )`);

            console.log('Tables created successfully.');
            resolve();
        });
    });
};

const seedData = async () => {
    const adminPass = await bcrypt.hash('admin123', SALT_ROUNDS);
    const userPass = await bcrypt.hash('user123', SALT_ROUNDS);

    const stmtUser = db.prepare("INSERT OR IGNORE INTO users (email, password_hash, role) VALUES (?, ?, ?)");
    stmtUser.run('admin@defi.com', adminPass, 'admin');
    stmtUser.run('investor@defi.com', userPass, 'user');
    stmtUser.finalize();

    const stmtPool = db.prepare("INSERT INTO pools (name, apy_percentage, min_lock_period, risk_level, description) VALUES (?, ?, ?, ?, ?)");

    db.get("SELECT count(*) as count FROM pools", (err, row) => {
        if (row.count === 0) {
            stmtPool.run('Ethereum 2.0 Staking', 4.5, 30, 'Low', 'Safe staking for ETH holders.');
            stmtPool.run('Solana High Yield', 7.2, 14, 'Medium', 'Higher rewards with moderate risk.');
            stmtPool.run('Degen Farm Protocol', 45.0, 7, 'High', 'Experimental protocol with high volatility.');
            stmtPool.finalize();
            console.log('Sample data inserted.');
        }
    });
};

createTables()
    .then(() => seedData())
    .catch(err => console.error(err));

console.log(`Database initialized at: ${dbPath}`);