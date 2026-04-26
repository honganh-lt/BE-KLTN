const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ================= REGISTER =================
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

        db.query(sql, [username, email, hashedPassword], (err) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ message: "Username hoặc email đã tồn tại" });
                }
                return res.status(500).json({ message: "Lỗi server" });
            }

            res.status(201).json({ message: "Đăng ký thành công" });
        });

    } catch (error) {
        res.status(500).json({ message: "Lỗi bcrypt" });
    }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Thiếu username hoặc password" });
    }

    const sql = "SELECT * FROM users WHERE username = ?";

    db.query(sql, [username], async (err, result) => {
        if (err) return res.status(500).json({ message: "Server error" });

        if (result.length === 0) {
            return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
        }

        const user = result[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
        }

        // 🔥 ACCESS TOKEN
        const accessToken = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // 🔥 REFRESH TOKEN
        const refreshToken = crypto.randomBytes(64).toString("hex");

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        const insertSql = `
            INSERT INTO refresh_tokens (token, user_id, expiry_date)
            VALUES (?, ?, ?)
        `;

        db.query(insertSql, [refreshToken, user.user_id, expiryDate], (err) => {
            if (err) {
                return res.status(500).json({ message: "Lỗi lưu refresh token" });
            }

            res.json({
                access_token: accessToken,
                refresh_token: refreshToken,
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    role: user.role
                }
            });
        });
    });
};

// ================= REFRESH TOKEN =================
exports.refreshToken = (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(401).json({ message: "Không có refresh token" });
    }

    const sql = `
        SELECT * FROM refresh_tokens
        WHERE token = ? AND revoked = FALSE
    `;

    db.query(sql, [refresh_token], (err, result) => {
        if (err) return res.status(500).json({ message: "Server error" });

        if (result.length === 0) {
            return res.status(403).json({ message: "Token không hợp lệ" });
        }

        const tokenData = result[0];

        if (new Date(tokenData.expiry_date) < new Date()) {
            return res.status(403).json({ message: "Token đã hết hạn" });
        }

        // 🔥 Lấy role từ users
        const userSql = "SELECT role FROM users WHERE user_id = ?";

        db.query(userSql, [tokenData.user_id], (err, userResult) => {
            if (err) return res.status(500).json({ message: "Server error" });

            const user = userResult[0];

            const newAccessToken = jwt.sign(
                { user_id: tokenData.user_id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "15m" }
                //Access token sốn 15 phút -> sau 15p sẽ hết hạn
                //hết hạn -> trong middleware sẽ trả về "403: TokenExpiredError"
            );

            res.json({ access_token: newAccessToken });
        });
    });
};

// ================= LOGOUT =================
exports.logout = (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(400).json({ message: "Thiếu refresh token" });
    }

    const sql = `
        UPDATE refresh_tokens
        SET revoked = TRUE
        WHERE token = ?
    `;

    db.query(sql, [refresh_token], (err) => {
        if (err) return res.status(500).json({ message: "Server error" });

        res.json({ message: "Logout thành công" });
    });
};