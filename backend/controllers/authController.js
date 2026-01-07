const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All input is required" });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    db.run(`INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'user')`,
        [email, hashedPassword],
        function(err) {
            if (err) {
                return res.status(500).json({ message: "User already exists or database error" });
            }
            const token = jwt.sign({ id: this.lastID, email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: "2h" });
            res.status(201).json({ message: "User registered successfully", token });
        }
    );
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ message: "User not found" });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password_hash);

        if (!passwordIsValid) {
            return res.status(401).json({ message: "Invalid Password" });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });

        res.status(200).json({
            id: user.id,
            email: user.email,
            role: user.role,
            accessToken: token
        });
    });
};

exports.updateProfile = (req, res) => {
    const userId = req.user.id;
    const { email, currentPassword, newPassword } = req.body;

    if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to save changes." });
    }

    db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, user) => {
        if (err || !user) return res.status(404).json({ message: "User not found" });

        const passwordIsValid = bcrypt.compareSync(currentPassword, user.password_hash);
        if (!passwordIsValid) {
            return res.status(401).json({ message: "Incorrect current password" });
        }

        let newPasswordHash = user.password_hash;
        if (newPassword && newPassword.trim() !== "") {
            newPasswordHash = bcrypt.hashSync(newPassword, 8);
        }

        const newEmail = email || user.email;

        const sql = `UPDATE users SET email = ?, password_hash = ? WHERE id = ?`;
        db.run(sql, [newEmail, newPasswordHash, userId], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ message: "Email already in use" });
                }
                return res.status(500).json({ error: err.message });
            }

            res.json({ message: "Profile updated successfully!" });
        });
    });
};