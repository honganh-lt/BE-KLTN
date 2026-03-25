const { json } = require("express");
const db = require("../config/db"); 
// import dile db.js( nơi bạn cấu hình mysql)
// db là đối tượng dùng để: gửi câu lệnh SQL(query) ; kết nối DATABASE

// Xuất hàm để route gọi tới (req,res); req(request: dữ liệu từ client gửi lên); 
// res(response: dùng để trả dữ liệu về fe) => chính là controller function
exports.getSubjects = (req, res) => {
    // Lấy toàn bộ database từ bảng subjects; *=tất cả các cột
    const sql = "SELECT * FROM subjects";

    // gửi câu sql lên MYSQL => nhận kết quả trả về qua callback
    // callback có 2 tham sô: (err: lỗi(nếu có) ; result: dữ liệu trả về (mảng object))
    db.query(sql, (err, result) => {

        // Nếu query bị lỗi trả về HTTP status 500; gửi JSON("Database error")
        if(err) {
            return res.status(500).json({ error: "Database error"});
        }
        // Trả dữ liệu database về cho FE dưới dạng JSON
        res.json(result);
    });
};

//Post
exports.postSubjects = (req, res) => {
    const {subject_name, description} = req.body;
    const sql = "INSERT INTO subjects (subject_name, description) VALUES (?,?)";

    db.query(sql, [subject_name, description], (err) => {
        if (err) return res.status(500).json(err);
        res.json({message: "Created"});
    });
}

//PUT
exports.putSubjects = (req, res) => {
    const {subject_name, description} = req.body;
    const sql = "UPDATE subjects SET subject_name=?, description=? WHERE subject_id=?";

    db.query(sql, [subject_name, description, req.params.id], (err) => {
        if(err) return res.status(500).json(err);
        res.json({message: "Update"})
    })
}

//DELETE
exports.deleteSubjects = (req, res) => {
    // Check 
    // console.log("Delete id: ", req.params.id)
    const {id} = req.params;
    const sql = "DELETE FROM subjects WHERE subject_id=?";

    db.query(sql, [id], (err, result) => {
        if(err){
                return res.status(500).json(err);
            }
            res.json({
                message: "Xóa thành công"
            });
    })
}
// Dạng trả về JSON: 
// [
//   {
//     "subject_id": 1,
//     "subject_name": "Toán",
//     "description": "Môn học về số"
//   }
// ]

// Tóm tắt luồng chạy
// FE gọi API /api/subjects
// → vào getSubjects
// → chạy SQL lấy dữ liệu
// → nếu lỗi → trả lỗi
// → nếu OK → trả JSON về FE


// 💡 Nói dễ hiểu kiểu đời thường:
// db = người đi lấy dữ liệu
// sql = yêu cầu bạn đưa cho database
// query() = gửi yêu cầu
// result = dữ liệu nhận được
// res.json() = gửi lại cho frontend