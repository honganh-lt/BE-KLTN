const db = require("../config/db")


//Get lấy dữ liệu đổ vào bảng
exports.getAllUserExams = (req, res) => {
    const sql = `
    SELECT 
      ue.user_exam_id,
      s.subject_name,
      e.title AS exam_title,
      ue.start_time,
      ue.end_time,
      ue.score,
      u.username
    FROM user_exam ue
    JOIN users u ON ue.user_id = u.user_id
    JOIN exam e ON ue.exam_id = e.exam_id
    JOIN subjects s ON e.subject_id = s.subject_id
    ORDER BY ue.start_time ASC 
    `;

    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    })
}

//Số lần thi
exports.getExamAttempts = (req, res) => {
    const { user_id } = req.query;

    const sql = `
        SELECT 
            e.exam_id,
            e.title,
            COUNT(ue.user_exam_id) AS attempt_count
        FROM exam e
        LEFT JOIN user_exam ue 
            ON e.exam_id = ue.exam_id 
            AND ue.user_id = ?
        GROUP BY e.exam_id, e.title
    `;

    db.query(sql, [user_id], (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
};

// Start exam
exports.startExam = (req, res) => {
    const { user_id, exam_id } = req.body;

    const sql = `
        INSERT INTO user_exam (user_id, exam_id, start_time)
        VALUES (?,?,NOW())
    `;

    db.query(sql, [user_id, exam_id], (err, result) => {
        if(err) return res.status(500).json(err);

        res.json({
            user_exam_id: result.insertId
        });
    });
};

//Submit
exports.submitExam = (req, res) => {
    const { user_exam_id, answers } = req.body;

    //Check đã submit chưa
    db.query(
        "SELECT status FROM user_exam WHERE user_exam_id=?",
        [user_exam_id],
        (err, result) => {

            // 🔥 FIX: check tồn tại
        if (!result || result.length === 0) {
            return res.status(400).json({
                message: "user_exam_id không tồn tại hoặc sai"
            });
        }

            if(result[0].status === "submitted") {
                return res.json({message: "Bài đã nộp"});
            }

            db.beginTransaction(err => {
                if(err) return res.status(500).json(err);

                let done = 0;

                answers.forEach(ans => {
                    db.query(
                        `INSERT INTO user_answer (user_exam_id, question_id, answer_id)
                        VALUES (?,?,?)
                        `,
                        [user_exam_id, ans.question_id, ans.answer_id],
                        (err) => {
                            if(err) {
                                return db.rollback(() => res.status(500).json(err));
                            }

                            done++;

                            if(done === answers.length) {

                                //tính điểm
                                db.query(
                                    `
                                    SELECT 
                                        COUNT(*) total,
                                        SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) correct
                                    FROM user_answer ua
                                    JOIN answers a ON ua.answer_id = a.answer_id
                                    WHERE ua.user_exam_id = ?
                                    `, [user_exam_id], (err, result) => {
                                        if(err) return db.rollback(() => res.status(500).json(err));

                                        const total = result[0].total;
                                        const correct = result[0].correct || 0;
                                        const score = (correct / total) *10;

                                            db.query(
                                                `
                                                UPDATE user_exam 
                                                SET score=?, end_time=NOW(), status='submitted'
                                                WHERE user_exam_id=?
                                                `, [score, user_exam_id], (err) => {

                                                if (err) return db.rollback(() => res.status(500).json(err));

                                                db.commit(err => {
                                                if (err) return db.rollback(() => res.status(500).json(err));

                                                res.json({ score, correct, total });
                                                });
                                            }
                                        )
                                    }
                                )
                            }
                        }
                    )
                })
            })
        }
    )
}

//History (hồ sơ user)
// exports.getHistory = (req, res) => {
//     const {user_id} = req.params;

//     const sql = `
//         SELECT 
//             ue.user_exam_id,
//             ue.exam_id, -- 🔥 THÊM DÒNG NÀY để hiển thị lần thi User phía người dung
//             ue.score,
//             ue.start_time,
//             ue.end_time,
//             ue.status,         --thêm cho nút làm tiếp
//             e.exam_id,          -- 🔥 THÊM cho nút làm tiếp
//             s.subject_id,       -- 🔥 THÊM cho nút làm tiếp
//             e.title,
//             s.subject_name
//         FROM user_exam ue
//         JOIN exam e ON ue.exam_id = e.exam_id
//         JOIN subjects s ON e.subject_id = s.subject_id
//         WHERE ue.user_id = ?
//         ORDER BY ue.start_time ASC
//     `;

//     db.query(sql, [user_id], (err, rows) => {
//         if(err) return res.status(500).json(err);
        
//         res.json(rows);
//     });
// };
exports.getHistory = (req, res) => {
    const { user_id } = req.params;

    const sql = `
        SELECT 
            ue.user_exam_id,
            ue.exam_id,
            ue.score,
            ue.start_time,
            ue.end_time,
            ue.status,
            e.exam_id,
            s.subject_id,
            e.title,
            s.subject_name
        FROM user_exam ue
        JOIN exam e ON ue.exam_id = e.exam_id
        JOIN subjects s ON e.subject_id = s.subject_id
        WHERE ue.user_id = ?
        ORDER BY ue.start_time ASC
    `;

    db.query(sql, [user_id], (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
};

//review bài đã làm(qt)
exports.reviewExam = (req, res) => {
    const { user_exam_id } = req.params;

    const sql = `
        SELECT -- sửa ở đây nút làm lại 
            q.question_id,
            q.content AS question,
            ue.exam_id,
            e.subject_id,
            a.answer_id,
            a.content AS answer,
            a.is_correct,
            ua.answer_id AS user_answer_id
        FROM user_exam ue
        JOIN exam e ON ue.exam_id = e.exam_id
        JOIN user_answer ua ON ue.user_exam_id = ua.user_exam_id
        JOIN questions q ON ua.question_id = q.question_id
        JOIN answers a ON q.question_id = a.question_id
        WHERE ue.user_exam_id = ?
        ORDER BY q.question_id
    `;

    db.query(sql, [user_exam_id], (err, rows) => {
        if (err) return res.status(500).json(err);

        const result = [];

        rows.forEach(row => {
            let question = result.find(q => q.question_id === row.question_id);

            if (!question) {
                question = {
                    question_id: row.question_id,
                    question: row.question,
                    exam_id: row.exam_id,
                    subject_id: row.subject_id,
                    answers: []
                };
                result.push(question);
            }

            question.answers.push({
                answer_id: row.answer_id,
                answer: row.answer,
                is_correct: row.is_correct,
                user_answer_id: row.user_answer_id
            });
        });

        res.json(result);
    });
};