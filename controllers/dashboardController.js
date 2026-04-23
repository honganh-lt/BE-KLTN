const db = require("../config/db");

//đây là cách dùng không có promise mà chỉ có mysql12 cách dễ hiểu nhất (callback thuần)
//callback thuần là gi????????????????


exports.getDashboardStats = (req, res) => {

    db.query("SELECT COUNT(*) AS total FROM subjects", (err, subjects) => {
        if (err) return res.status(500).json(err);

        db.query("SELECT COUNT(*) AS total FROM questions", (err, questions) => {
            if (err) return res.status(500).json(err);

            db.query("SELECT COUNT(*) AS total FROM exam", (err, exams) => {
                if (err) return res.status(500).json(err);

                db.query("SELECT COUNT(*) AS total FROM users", (err, users) => {
                    if (err) return res.status(500).json(err);

                    db.query(`
                        SELECT difficulty, COUNT(*) as total
                        FROM questions
                        GROUP BY difficulty
                    `, (err, difficultys) => {
                        if (err) return res.status(500).json(err);

                        const difficultyData = { easy: 0, medium: 0, hard: 0 };

                        difficultys.forEach(d => {
                            difficultyData[d.difficulty] = d.total;
                        });

                        res.json({
                            subjects: subjects[0].total,
                            questions: questions[0].total,
                            exams: exams[0].total,
                            users: users[0].total,
                            difficulty: difficultyData   // 👈 nhớ đồng bộ với FE
                        });
                    });

                });
            });
        });
    });

};