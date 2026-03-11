const db = require("../config/db"); //kết nối database mysql
const bcrypt = require("bcrypt"); //thư viện mã hóa password

//==================REGISTER==========================
exports.register = async (req, res) => {

    console.log("API REGISTER ĐƯỢC GỌI");   // thêm dòng này
    console.log("Dữ liệu nhận được:", req.body); // 👈 thêm dòng này

    const { username, email, password } = req.body;

    // if(!username || !email || !password){
    //     return res.status(400).json({
    //         message: "Thiếu thông tin đăng ký"
    //     });
    // }
    try {
        //mã hóa password
        //số 10 là độ phức tạp khi mã hóa (salt rounds)
        const hashedPassword = await bcrypt.hash(password, 10);

        //câu lệnh SQL thêm user vào bảng users
        const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

    db.query(sql, [username, email, hashedPassword], (err, result) => {
        
        //nếu có lỗi MySql
        if (err) {
            console.log("MYSQL ERROR:", err);   // 👈 lỗi thật sẽ hiện ở terminal
            return res.status(500).json({
                message: "Lỗi đăng ký",
                error: err
            });
        }

        //đăng ký thành công
        res.json({
            message: "Đăng ký thành công"
        });
    });
}catch(error){
    console.log("Lỗi bcrypt:", error);
}
};

//=================LOGIN========================
exports.login = async (req, res) => {

    //lấy username và password từ FE
    const { username, password } = req.body;

    //tìm user theo username
    const sql = "SELECT * FROM users WHERE username = ?";

    db.query(sql, [username], async (err, result) => {

        //lỗi dataname
        if (err) {
            return res.status(500).json(err);
        }

        //nếu không tìm thấy user
        if (result.length === 0) {
            return res.status(401).json({
                message: "Sai tài khoản hoặc mật khẩu"
            });
        }

        //lấy thông tin user đầu tiên tìm được
        const user = result[0];

        // so sánh password nhập với password đã mã hóa trong DB
        const isMatch = await bcrypt.compare(password, user.password);

        //nếu password không đúng
        if (!isMatch) {
            return res.status(401).json({
                message: "Sai tài khoản hoặc mật khẩu"
            });
        }

        //nếu password đúng -> đăng nhập thành công
        res.json({
            message: "Đăng nhập thành công",
            user: user
        });
    });
};