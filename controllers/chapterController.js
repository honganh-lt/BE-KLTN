const {json} = require("express");
const db = require("../config/db");

// GET
exports.getChapters = (req, res) => {
    //Lấy toàn bộ
    const sql = "SELECT * FROM chapters";

    //Gửi câu sql lên Mysql
    db.query(sql, (err, result) => {
        //Nếu query lỗi trả về HTTP status 500 Gửi json
        if(err) {
            return res.status(500).json({error: "Database error"});
        }
        //Trả dữ liệu về cho FE dưới dạng JSON
        res.json(result);
    });
};

// POST
exports.postChapters = (req, res) => {
    const {subject_id, chapter_number, chapter_name} = req.body;
    const sql = "INSERT INTO chapters ()"

    db.query(sql, [subject_id, chapter_number, chapter_name], (err) => {
        if(err) {
            return res.status(500).json(err);
        }
        res.json({message: "Creates"});

    })
}

// PUT
exports.putChapters = (req, res) => {
    const {subject_id, chapter_number, chapter_name} = req.body;
    const sql = "UPDATE chapters SET ";

    db. query(sql, [subject_id, chapter_number, chapter_name, req.params.id], (err) => {
        if(err) {
            return res.status(500).json(err);
        }
        res.json({message: "Update"});
    })

}

// DELETE
exports.deleteChapters = (req, res) => {
    const {id} = req.params;
    const sql = "DELETE FROM chapters WHERE chapter_id=?";

    db.query(sql, [id], (err, result) => {
        if(err) {
            return res.status(500).json(err);
        }
        res.json({message: "Xóa thành công"})
    })
}