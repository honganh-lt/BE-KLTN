// examController.js
const db = require("../config/db");

// ===== GET all exams =====
exports.getExam = (req, res) => {
    const sql = "SELECT * FROM exam ORDER BY created_time DESC";

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};
//Lấy full thông tin đề + câu hỏi
exports.getExamDetail = (req, res) => {
    const id = req.params.id;

    const sql = `
        SELECT e.title, e.duration,
               q.question_id, q.content, q.difficulty
        FROM exam e
        JOIN exam_questions eq ON e.exam_id = eq.exam_id
        JOIN questions q ON eq.question_id = q.question_id
        WHERE e.exam_id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

// ===== CREATE exam with optional questions =====
exports.createExamWithQuestions = (req, res) => {
    const {
        title,
        subject_id,
        description,
        duration,
        created_by,
        number_of_questions
    } = req.body;

    // 1. Tạo đề thi
    const insertExamSql = `
        INSERT INTO exam (title, subject_id, description, duration, created_by)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertExamSql, [title, subject_id, description, duration, created_by], (err, examResult) => {
        if (err) return res.status(500).json(err);

        const examId = examResult.insertId;

        // 2. Random câu hỏi
        const randomQuestionSql = `
            SELECT question_id FROM questions
            ORDER BY RAND()
            LIMIT ?
        `;

        db.query(randomQuestionSql, [number_of_questions], (err, questions) => {
            if (err) return res.status(500).json(err);

            if (questions.length === 0) {
                return res.status(400).json({ message: "Không có câu hỏi" });
            }

            // 3. Insert vào bảng exam_questions
            const values = questions.map(q => [examId, q.question_id]);

            const insertMappingSql = `
                INSERT INTO exam_questions (exam_id, question_id)
                VALUES ?
            `;

            db.query(insertMappingSql, [values], (err) => {
                if (err) return res.status(500).json(err);

                res.json({
                    message: "Tạo đề thành công",
                    exam_id: examId
                });
            });
        });
    });
};

// ===== PUT exam =====
exports.putExam = (req, res) => {
    const id = req.params.id;
    const { title, subject_id, description, duration} = req.body;

    const sql = `
    UPDATE exam 
    SET title = ?, subject_id = ?, description = ?, duration = ?
    WHERE exam_id = ?
`;

    db.query(sql, [title, subject_id, description, duration, id], (err) => {
        if (err) return res.status(500).json(err);

        res.json({ message: "Cập nhật thành công" });
    });
};

// ===== DELETE exam =====
exports.deleteExam = (req, res) => {
    const id = req.params.id;

    // 1. Xóa liên kết trước
    const deleteMapping = "DELETE FROM exam_questions WHERE exam_id = ?";

    db.query(deleteMapping, [id], (err) => {
        if (err) return res.status(500).json(err);

        // 2. Xóa đề
        const deleteExam = "DELETE FROM exam WHERE exam_id = ?";

        db.query(deleteExam, [id], (err) => {
            if (err) return res.status(500).json(err);

            res.json({ message: "Xóa thành công" });
        });
    });
};