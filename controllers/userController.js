const db = require("../config/db");
// const { route } = require("./authRoutes");

//lấy danh sách users
exports.getUser = (req,res) => {
    const sql = "SELECT * FROM users";

    db.query(sql, (err, result) => {
        if(err) {
            console.log(err);
            return res.status(500).json({error: "Database error"})
        }
        res.json(result);
    })
};

//POST
const bcrypt = require("bcrypt");

exports.postUser = async (req, res) => {
    console.log("BODY:", req.body);

    const { username, email, password, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // 🔐 hash

        const sql = `
            INSERT INTO users (username, email, password, role)
            VALUES (?, ?, ?, ?)
        `;

        db.query(sql, [username, email, hashedPassword, role], (err) => {
            if (err) {
                console.log("DB ERROR:", err);

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({
                        message: "Username hoặc email đã tồn tại"
                    });
                }

                return res.status(500).json(err);
            }

            res.json({ message: "Created" });
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

//Update User : hay ở FE dùng cổng PUT để lấy từ BE
// vì trong server.js app.use("/api/users", userRoutes); -thực tế: /api/users/users/:id - nên "/users/:id" là sai mà là "/:id"

exports.putUser = (req,res) => {

    const {username, email, role} = req.body; //lý do? sai boby=body
    // const {id} = req.params;

    const sql = "UPDATE users SET username=?, email=?, role=? WHERE user_id=?";

    db.query(sql, [username, email, role, req.params.id], (err, result) => {

        if(err){
            return res.status(500).json(err); //kiểm tra
        }

        res.json({
            message: "Update" //hình như không chạy trên web
        });
    });
};

//Delete User: 
// vì trong server.js app.use("/api/users", userRoutes); -thực tế: /api/users/users/:id - nên "/users/:id" là sai mà là "/:id"
// không cần dùng async và await
exports.deleteUser = (req,res) => { 

    // console.log("Delete id", res.params.id);
    const { id } = req.params;

    const sql = "DELETE FROM users WHERE user_id = ? ";

         db.query(sql, [id], (err) => {
            if(err){
                return res.status(500).json(err);
            }
            res.json({
                message: "Xóa thành công"
            });
         });
};


