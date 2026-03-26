const {json} = require("express");
const db = require("../config/db")

//GET
exports.getLesson = (req, res) => {
    //Lấy toàn bộ database
    const sql = "SELECT * FROM lessons";

    //Gửi câu sql lên Mysql
    db.query(sql, (err, result) => {
        if(err) {
            return res.status(500).json({error: "Database error"});
        }
        //Trả dữ liệu dưới dạng Json
        res.json(result);
    });
};

//POST
exports.postLesson = (req, res) => {
    //Lấy từng cột
    const {lesson_name, chapter_id, lesson_number} = req.body;
    const sql = "INSERT INTO lessons (lesson_name, chapter_id, lesson_number) VALUES (?,?,?)";

    db.query(sql, [lesson_name, chapter_id, lesson_number], (err, result) => {
        if(err) {
            return res.status(500).json(err);
        }
        res.json({message: "Creates"});
    })
}

//PUT
exports.putLesson = (req, res) => {
    const {lesson_name, chapter_id, lesson_number} = req.body;
    const sql = "UPDATE lessons SET lesson_name=?, chapter_id=?, lesson_number=? WHERE lesson_id=?";

    db.query(sql, [lesson_name, chapter_id, lesson_number, req.params.id], (err) => {
        if(err) {
            return res.status(500).json(err);
        }
        res.json({message: "Update"})
    })
}

//DELETE
exports.deleteLesson = (req,res) => {
    const {id} = req.params; //?????
    const sql = "DELETE FROM lessons WHERE lesson_id=?";

    db.query(sql, [id], (err) => {
        if(err) {
            return res.status(500).json(err);
        }
        res.json({message: "Xóa thành công"});
    })

}