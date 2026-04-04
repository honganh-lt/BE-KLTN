const db = require("../config/db");

// ================= GET =================
exports.getQuestion = (req, res) => {
    const sql = `
        SELECT 
            q.question_id,
            q.content,
            q.difficulty,
            q.chapter_id,
            c.chapter_name,
            a.answer_id,
            a.content AS answer_content,
            a.is_correct
        FROM questions q
        JOIN chapters c ON q.chapter_id = c.chapter_id
        JOIN answers a ON q.question_id = a.question_id
        ORDER BY q.question_id
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);

        const map = {};

        result.forEach(row => {
            if (!map[row.question_id]) {
                map[row.question_id] = {
                    question_id: row.question_id,
                    content: row.content,
                    difficulty: row.difficulty,
                    chapter_id: row.chapter_id,
                    chapter_name: row.chapter_name,
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
    const { content, difficulty, chapter_id, answers } = req.body;

    if (!content || !difficulty || !chapter_id || !answers?.length) {
        return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const sqlQuestion = `
        INSERT INTO questions (content, difficulty, chapter_id)
        VALUES (?, ?, ?)
    `;

    db.query(sqlQuestion, [content, difficulty, chapter_id], (err, result) => {
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
    const { content, difficulty, chapter_id, answers } = req.body;

    const sqlUpdate = `
        UPDATE questions
        SET content=?, difficulty=?, chapter_id=?
        WHERE question_id=?
    `;

    db.query(sqlUpdate, [content, difficulty, chapter_id, id], (err) => {
        if (err) return res.status(500).json(err);

        db.query("DELETE FROM answers WHERE question_id=?", [id], (err2) => {
            if (err2) return res.status(500).json(err2);

            const sqlAnswer = `
                INSERT INTO answers (question_id, content, is_correct)
                VALUES ?
            `;

            const answerValues = answers.map(a => [
                id,
                a.content,
                a.is_correct
            ]);

            db.query(sqlAnswer, [answerValues], (err3) => {
                if (err3) return res.status(500).json(err3);

                res.json({ message: "Cập nhật thành công" });
            });
        });
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