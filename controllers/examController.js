// examController.js
const db = require("../config/db");

// ===== GET all exams =====
exports.getExam = (req, res) => {
    const sql = `
        SELECT 
            e.exam_id,
            e.subject_id,
            s.name AS subject_name,
            e.title,
            e.description,
            e.duration,
            COUNT(eq.question_id) AS question_count
        FROM exam e
        LEFT JOIN exam_questions eq ON e.exam_id = eq.exam_id
        LEFT JOIN subjects s ON e.subject_id = s.subject_id
        GROUP BY e.exam_id, e.subject_id, s.name, e.title, e.description, e.duration
    `;
    db.query(sql, (err, result) => {
        if (err) {
            console.error("SQL Error GET exams:", err);
            return res.status(500).json({ message: "Lỗi lấy danh sách exam", err });
        }
        res.json(result);
    });
};

// ===== CREATE exam with optional questions =====
exports.createExamWithQuestions = (req, res) => {
    let { subject_id, title, description, duration, created_by, easy, medium, hard } = req.body;

    // Convert sang số, nếu undefined hoặc rỗng -> 0
    subject_id = Number(subject_id);
    duration = Number(duration) || 20;
    easy = Number(easy) || 0;
    medium = Number(medium) || 0;
    hard = Number(hard) || 0;

    // Validate dữ liệu
    if (!subject_id || !title?.trim()) {
        return res.status(400).json({ message: "Vui lòng chọn môn học và nhập tiêu đề" });
    }
    if (easy + medium + hard === 0) {
        return res.status(400).json({ message: "Số câu hỏi phải lớn hơn 0" });
    }

    // Chèn exam
    const insertExam = `
        INSERT INTO exam (subject_id, title, description, duration, created_by, created_time)
        VALUES (?, ?, ?, ?, ?, NOW())
    `;
    db.query(insertExam, [subject_id, title, description, duration, created_by], (err, result) => {
        if (err) {
            console.error("SQL Error insert exam:", err);
            return res.status(500).json({ message: "Lỗi tạo exam", err });
        }

        const examId = result.insertId;

        // Chỉ chọn câu hỏi nếu >0
        const questionQueries = [];
        const questionLimits = [];
        if (easy > 0) {
            questionQueries.push(`SELECT question_id FROM questions WHERE difficulty='EASY' ORDER BY RAND() LIMIT ?`);
            questionLimits.push(easy);
        }
        if (medium > 0) {
            questionQueries.push(`SELECT question_id FROM questions WHERE difficulty='MEDIUM' ORDER BY RAND() LIMIT ?`);
            questionLimits.push(medium);
        }
        if (hard > 0) {
            questionQueries.push(`SELECT question_id FROM questions WHERE difficulty='HARD' ORDER BY RAND() LIMIT ?`);
            questionLimits.push(hard);
        }

        const getQuestions = questionQueries.join(" UNION ALL ");
        if (!getQuestions) return res.json({ message: "Tạo exam thành công (không có câu hỏi)", examId });

        // Lấy question_id từ DB
        db.query(getQuestions, questionLimits, (err, questions) => {
            if (err) {
                console.error("SQL Error select questions:", err);
                return res.status(500).json({ message: "Lỗi lấy câu hỏi", err });
            }

            if (!questions || questions.length === 0) {
                return res.status(400).json({ message: "Không đủ câu hỏi trong DB" });
            }

            // Chèn vào exam_questions
            const values = questions.map(q => [examId, q.question_id]);
            const insertEQ = `INSERT INTO exam_questions (exam_id, question_id) VALUES ?`;

            db.query(insertEQ, [values], (err) => {
                if (err) {
                    console.error("SQL Error insert exam_questions:", err);
                    return res.status(500).json({ message: "Lỗi thêm câu hỏi vào exam", err });
                }
                res.json({ message: "Tạo đề thành công", examId, totalQuestions: values.length });
            });
        });
    });
};

// ===== PUT exam =====
exports.putExam = (req, res) => {
    let { subject_id, title, description, duration, created_by } = req.body;

    subject_id = Number(subject_id);
    duration = Number(duration) || 20;

    if (!subject_id || !title?.trim()) {
        return res.status(400).json({ message: "Vui lòng chọn môn học và nhập tiêu đề" });
    }

    const sql = `
        UPDATE exam
        SET subject_id=?, title=?, description=?, duration=?, created_by=?
        WHERE exam_id=?
    `;
    db.query(sql, [subject_id, title, description, duration, created_by, req.params.id], (err) => {
        if (err) {
            console.error("SQL Error update exam:", err);
            return res.status(500).json({ message: "Lỗi cập nhật exam", err });
        }
        res.json({ message: "Cập nhật exam thành công" });
    });
};

// ===== DELETE exam =====
exports.deleteExam = (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID exam không hợp lệ" });

    const sql = "DELETE FROM exam WHERE exam_id=?";
    db.query(sql, [id], (err) => {
        if (err) {
            console.error("SQL Error delete exam:", err);
            return res.status(500).json({ message: "Lỗi xóa exam", err });
        }
        res.json({ message: "Xóa exam thành công" });
    });
};