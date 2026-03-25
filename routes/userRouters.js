const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { route } = require("./authRoutes");

//lấy danh sách users
router.get("/", (req,res) => {
    const sql = "SELECT id, username, email, role FROM users";

    db.query(sql, (err, result) => {
        if(err) {
            console.log(err);
            return res.status(500).json({error: "Database error"})
        }
        res.json(result);
    })
})

//Update User : hay ở FE dùng cổng PUT để lấy từ BE
// vì trong server.js app.use("/api/users", userRoutes); -thực tế: /api/users/users/:id - nên "/users/:id" là sai mà là "/:id"

router.put("/:id", (req,res) => {

    const {username, email, role} = req.body; //lý do? sai boby=body
    const {id} = req.params;

    const sql = "UPDATE users SET username=?, email=?, role=? WHERE id=?";

    db.query(sql, [username, email, role, id], (err, result) => {

        if(err){
            return res.status(500).json(err); //kiểm tra
        }

        res.json({
            message: "Cập nhật thành công" //hình như không chạy trên web
        });
    });
});

//Delete User: 
// vì trong server.js app.use("/api/users", userRoutes); -thực tế: /api/users/users/:id - nên "/users/:id" là sai mà là "/:id"
// không cần dùng async và await
router.delete("/:id", (req,res) => { 

    // console.log("Delete id", res.params.id);
    const { id } = req.params;

    const sql = "DELETE FROM users WHERE id = ? ";

         db.query(sql, [id], (err, result) => {
            if(err){
                return res.status(500).json(err);
            }
            res.json({
                message: "Xóa thành công"
            });
         });
});

module.exports = router;
