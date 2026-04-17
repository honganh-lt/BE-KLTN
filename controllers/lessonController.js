const {json} = require("express");
const db = require("../config/db")

//GET
exports.getLesson = (req, res) => {
    const { chapter_id } = req.query;

    let sql = `
    SELECT 
        l.*,                 
        c.chapter_number,
        c.chapter_name,
        s.subject_name       
    FROM lessons l
    JOIN chapters c ON l.chapter_id = c.chapter_id
    JOIN subjects s ON c.subject_id = s.subject_id
    `;

    if (chapter_id) {
        sql += " WHERE l.chapter_id = ?";
    }

    sql += " ORDER BY l.lesson_id ASC"; // 👈 chuyển xuống dưới

    db.query(sql, chapter_id ? [chapter_id] : [], (err, result) => {
        if(err) return res.status(500).json({error: "Database error"});
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