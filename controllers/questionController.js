const db = require("../config/db");

// ================= GET =================
exports.getQuestion = (req, res) => {
    const { lessonId } = req.query;

    let sql = `
    SELECT 
        q.question_id,
        q.content,
        q.difficulty,
        q.lesson_id,

        c.chapter_id,      -- ✅ thêm lí do nút sửa ở quản lý câu hỏi bị sai
        c.subject_id,      -- ✅ thêm

        s.subject_name,
        c.chapter_number,
        c.chapter_name,
        l.lesson_number,
        l.lesson_name,

        a.answer_id,
        a.content AS answer_content,
        a.is_correct

    FROM questions q
    JOIN lessons l ON q.lesson_id = l.lesson_id
    JOIN chapters c ON l.chapter_id = c.chapter_id
    JOIN subjects s ON c.subject_id = s.subject_id
    JOIN answers a ON q.question_id = a.question_id
    `;

    let params = [];

    // ✅ FIX WHERE (quan trọng)
    if (lessonId) {
        sql += " WHERE q.lesson_id = ?";
        params.push(lessonId);
    }

    sql += " ORDER BY q.question_id ASC, a.answer_id ASC";

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);

        const map = {};

        result.forEach(row => {
            if (!map[row.question_id]) {
                map[row.question_id] = {
                    question_id: row.question_id,
                    content: row.content,
                    difficulty: row.difficulty,
                    lesson_id: row.lesson_id,

                    chapter_id: row.chapter_id,   // ✅ thêm
                    subject_id: row.subject_id,   // ✅ thêm

                    subject_name: row.subject_name,
                    chapter_number: row.chapter_number,
                    chapter_name: row.chapter_name,
                    lesson_number: row.lesson_number,
                    lesson_name: row.lesson_name,

                    answers: []
                };
            }

            map[row.question_id].answers.push({
                answer_id: row.answer_id,
                content: row.answer_content,
                is_correct: row.is_correct
            });
        });

        res.json(Object.values(map));
    });
};

// ================= POST =================
exports.postQuestion = (req, res) => {
    const { content, difficulty, lesson_id, answers } = req.body;

    if (!content || !difficulty || !lesson_id || !answers?.length) {
        return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const sqlQuestion = `
        INSERT INTO questions (content, difficulty, lesson_id)
        VALUES (?, ?, ?)
    `;

    db.query(sqlQuestion, [content, difficulty, lesson_id], (err, result) => {
        if (err) return res.status(500).json(err);

        const questionId = result.insertId;

        const sqlAnswer = `
            INSERT INTO answers (question_id, content, is_correct)
            VALUES ?
        `;

        const answerValues = answers.map(a => [
            questionId,
            a.content,
            a.is_correct
        ]);

        db.query(sqlAnswer, [answerValues], (err2) => {
            if (err2) return res.status(500).json(err2);

            res.json({ message: "Thêm thành công" });
        });
    });
};

// ================= PUT =================
exports.putQuestion = (req, res) => {
    const { id } = req.params;
    const { content, difficulty, lesson_id, answers } = req.body;

    if (!content || !difficulty || !lesson_id) {
        return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ message: "Answers lỗi" });
    }

    db.beginTransaction(err => {
        if (err) return res.status(500).json(err);

        // 1. UPDATE QUESTION
        db.query(
            "UPDATE questions SET content=?, difficulty=?, lesson_id=? WHERE question_id=?",
            [content, difficulty, lesson_id, id],
            (err) => {
                if (err) {
                    return db.rollback(() => res.status(500).json(err));
                }

                // 2. LẤY ANSWERS CŨ
                db.query(
                    "SELECT answer_id FROM answers WHERE question_id=? ORDER BY answer_id ASC",
                    [id],
                    async (err, oldAnswers) => {
                        if (err) {
                            return db.rollback(() => res.status(500).json(err));
                        }

                        if (oldAnswers.length !== answers.length) {
                            return db.rollback(() =>
                                res.status(400).json({
                                    message: "Số lượng đáp án không khớp"
                                })
                            );
                        }

                        try {
                            // 3. UPDATE TỪNG ANSWER
                            for (let i = 0; i < answers.length; i++) {
                                await new Promise((resolve, reject) => {
                                    db.query(
                                        "UPDATE answers SET content=?, is_correct=? WHERE answer_id=?",
                                        [
                                            answers[i].content,
                                            answers[i].is_correct,
                                            oldAnswers[i].answer_id
                                        ],
                                        (err) => {
                                            if (err) reject(err);
                                            else resolve();
                                        }
                                    );
                                });
                            }

                            // 4. COMMIT
                            db.commit(err => {
                                if (err) {
                                    return db.rollback(() => res.status(500).json(err));
                                }

                                res.json({ message: "Cập nhật thành công" });
                            });

                        } catch (error) {
                            db.rollback(() => res.status(500).json(error));
                        }
                    }
                );
            }
        );
    });
};

// ================= DELETE =================
exports.deleteQuestion = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM answers WHERE question_id=?", [id], (err) => {
        if (err) return res.status(500).json(err);

        db.query("DELETE FROM questions WHERE question_id=?", [id], (err2) => {
            if (err2) return res.status(500).json(err2);

            res.json({ message: "Xóa thành công" });
        });
    });
};