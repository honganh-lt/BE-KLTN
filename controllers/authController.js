const db = require("../config/db"); //kết nối database mysql
const bcrypt = require("bcrypt"); //thư viện mã hóa password

//==================REGISTER==========================
exports.register = async (req, res) => {

    console.log("API REGISTER ĐƯỢC GỌI");   // thêm dòng này
    console.log("Dữ liệu nhận được:", req.body); // 👈 thêm dòng này

    const { username, email, password } = req.body;

   try {
        // 🔐 Mã hóa password
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

        db.query(sql, [username, email, hashedPassword], (err, result) => {

            // ❌ Nếu có lỗi MySQL
            if (err) {
                console.log("MYSQL ERROR:", err);

                // 🔥 Lỗi trùng dữ liệu (UNIQUE)
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({
                        message: "Username hoặc email đã tồn tại"
                    });
                }

                // 🔥 Lỗi thiếu dữ liệu (NOT NULL)
                if (err.code === 'ER_BAD_NULL_ERROR') {
                    return res.status(400).json({
                        message: "Thiếu dữ liệu bắt buộc"
                    });
                }

                // ❌ Lỗi khác
                return res.status(500).json({
                    message: "Lỗi server"
                });
            }

            // ✅ Thành công
            return res.status(201).json({
                message: "Đăng ký thành công"
            });
        });

    } catch (error) {
        console.log("Lỗi bcrypt:", error);
        return res.status(500).json({
            message: "Lỗi mã hóa password"
        });
    }
};

//=================LOGIN========================
exports.login = async (req, res) => {

    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ?";

    db.query(sql, [username], async (err, result) => {

        if (err) {
            console.log("MYSQL ERROR:", err); //khác
            return res.status(500).json({ error: "Server error" }); //khác
        }

        if (result.length === 0) {
            return res.status(401).json({
                message: "Sai tài khoản hoặc mật khẩu"
            });
        }

        const user = result[0];

        console.log("User trong DB:", user);

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Sai tài khoản hoặc mật khẩu"
            });
        }

        // ✅ FIX QUAN TRỌNG
        res.json({
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    });
};