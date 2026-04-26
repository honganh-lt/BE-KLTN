const db = require("../config/db");
 //Ramdom ở đây:

// ================= GET ALL =================
exports.getExams = (req, res) => {
    const sql = `
        SELECT 
            e.*,
            s.subject_name,
            COUNT(eq.question_id) AS question_count
        FROM exam e
        LEFT JOIN subjects s ON e.subject_id = s.subject_id
        LEFT JOIN exam_questions eq ON e.exam_id = eq.exam_id
        GROUP BY e.exam_id
        ORDER BY e.created_time ASC
    `;
    //DESC

    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
};


// ================= GET DETAIL =================
// exports.getExamDetail = (req, res) => {
//     const { id } = req.params;

//     const sql = `
//         SELECT q.*
//         FROM exam_questions eq
//         JOIN questions q ON eq.question_id = q.question_id
//         WHERE eq.exam_id = ?
//     `;
//     //  const sql = `
//     //     SELECT 
//     //         q.us
//     //     FROM exam_questions eq
//     //     JOIN questions q ON eq.question_id = q.question_id
//     //     WHERE eq.exam_id = ?
//     // `;

// db.query(sql, [id], (err) => {        
//     //subject_id, title, description, duration, req.params.id
//     if (err) return res.status(500).json(err); 
//     if (err) {
//             return res.status(500).json(err);
//         }

//         // trả data mới về FE
//         res.json({
//             exam_id: req.params.id,
//             subject_id,
//             title,
//             description,
//             duration
//         });
//     });
// };

exports.getExamDetail = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT 
            e.exam_id,
            e.title,
            e.description,
            e.duration,
            q.question_id,
            q.content,
            a.answer_id,
            a.content AS answer_content,
            a.is_correct
        FROM exam e
        JOIN exam_questions eq ON e.exam_id = eq.exam_id
        JOIN questions q ON eq.question_id = q.question_id
        JOIN answers a ON q.question_id = a.question_id
        WHERE e.exam_id = ?
    `;

    db.query(sql, [id], (err, rows) => {
        if (err) return res.status(500).json(err);

        if (!rows.length) {
            return res.status(404).json({ message: "Không tìm thấy exam" });
        }

        const result = {
            exam_id: rows[0].exam_id,
            title: rows[0].title,
            description: rows[0].description,
            duration: rows[0].duration,
            questions: []
        };

        rows.forEach(row => {
            let question = result.questions.find(
                q => q.question_id === row.question_id
            );

            if (!question) {
                question = {
                    question_id: row.question_id,
                    content: row.content,
                    answers: []
                };
                result.questions.push(question);
            }

            question.answers.push({
                answer_id: row.answer_id,
                content: row.answer_content,
                is_correct: row.is_correct
            });
        });

        res.json(result);
    });
};


// ================= CREATE MANUAL =================
//UpdateExam
exports.postExam = (req, res) => {
    const {
        title,
        description,
        duration,
        subject_id,
        questionIds = []
    } = req.body;

    const sqlExam = `
        INSERT INTO exam (title, description, duration, subject_id, created_time)
        VALUES (?, ?, ?, ?, NOW())
    `;

    db.query(sqlExam, [
        title,
        description,
        duration,
        subject_id
    ], (err, result) => {

        if (err) return res.status(500).json(err);

        const examId = result.insertId;

        // if (!questionIds.length) {
        //     return res.json({
        //         message: "Tạo exam thành công",
        //         examId
        //     });
        // }

        const values = questionIds.map(id => [examId, id]);

        const sqlQ = `
            INSERT INTO exam_questions (exam_id, question_id)
            VALUES ?
        `;

        db.query(sqlQ, [values], (err2) => {
            if (err2) return res.status(500).json(err2);

            res.json({
                message: "Tạo đề thủ công thành công",
                examId
            });
        });
    });
};


// ================= RANDOM EXAM =================
exports.createExamBySubject = (req, res) => {
    const {
        subject_id,
        title,
        description,
        duration,
        total_questions = 20
    } = req.body;

    // 1. lấy toàn bộ câu hỏi theo môn
    const sql = `
        SELECT q.question_id
        FROM questions q
        JOIN lessons l ON q.lesson_id = l.lesson_id
        JOIN chapters c ON l.chapter_id = c.chapter_id
        WHERE c.subject_id = ?
    `;

    db.query(sql, [subject_id], (err, questions) => {
        if (err) return res.status(500).json(err);

        if (!questions.length) {
            return res.status(400).json({
                error: "Không có câu hỏi trong môn học này"
            });
        }

        // 2. shuffle + lấy random
        const shuffled = questions.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, total_questions);

        // 3. tạo exam
        const sqlExam = `
            INSERT INTO exam (title, description, duration, subject_id, created_time)
            VALUES (?, ?, ?, ?, NOW())
        `;

        db.query(sqlExam, [
            title,
            description,
            duration,
            subject_id
        ], (err2, result) => {

            if (err2) return res.status(500).json(err2);

            const examId = result.insertId;

            const values = selected.map(q => [
                examId,
                q.question_id
            ]);

            const sqlInsertQ = `
                INSERT INTO exam_questions (exam_id, question_id)
                VALUES ?
            `;

            db.query(sqlInsertQ, [values], (err3) => {
                if (err3) return res.status(500).json(err3);

                res.json({
                    message: "Tạo đề random thành công",
                    examId,
                    total: selected.length
                });
            });
        });
    });
};

//PUT
exports.putExam = (req, res) => {
    const {subject_id, title, description, duration, } = req.body;
    const sql = "UPDATE exam SET subject_id=?, title=?, description=?, duration=? WHERE exam_id=?";

    db.query(sql, [subject_id, title, description, duration, req.params.id], (err) => {
        if(err) {
            return res.status(500).json(err);
        }
        res.json({
        message: "Cập nhật thành công",
        examId: req.params.id
        })
    })
}

// ================= DELETE =================
exports.deleteExam = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM exam_questions WHERE exam_id=?", [id], (err) => {
        if (err) return res.status(500).json(err);

        db.query("DELETE FROM exam WHERE exam_id=?", [id], (err2) => {
            if (err2) return res.status(500).json(err2);

            res.json({ message: "Xóa thành công" });
        });
    });
};