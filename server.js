const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

//Đăng ký đang nhập Admin
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
const db = require("./config/db");   // phải có dòng này
//thêm đẻ lấy dữ liệu users
// const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
//dữ liệu users
// const userRoutes = require("./routes/userRouters");
app.use("/api/users", userRoutes);


//Home
const dashboardRoutes = require("./routes/dashboardRoutes")
app.use("/api/dashboard", dashboardRoutes)


//Thêm lấy dữ liệu quản lý môn học
const subjectRoutes = require("./routes/subjectRoutes");
app.use("/api/subjects", subjectRoutes);

//Thêm lấy dữ liệu quản lý chương
const chapterRoutes = require("./routes/chapterRoutes");
app.use("/api/chapters", chapterRoutes);

// Thêm lấy dữ liệu quản lý bài học theo chương
const lessonRoutes = require("./routes/lessonRoutes");
app.use("/api/lessons", lessonRoutes);

//Thêm lấy dữ liệu quản lý câu hỏi
const questionRoutes = require("./routes/questionRoutes")
app.use("/api/questions", questionRoutes);

//Thêm lấy dữ liệu quản lý đề thi
const examRoutes = require("./routes/examRoutes");
app.use("/api/exams", examRoutes);

//Thêm lấy dữ liệu quản lý đề thi user
const userExamRoutes = require("./routes/userExamRoutes");
app.use("/api/user-exam", userExamRoutes);






// API test database
// app.get("/test-db", (req, res) => {
//     db.query("SELECT 1", (err, result) => {
//         if (err) {
//             return res.json(err);
//         }
//         res.json("Database OK");
//     });
// });
// TEST HOME
app.get("/", (req, res) => {
    res.send("SERVER RUNNING OK 🚀");
});

// ERROR HANDLER
app.use((err, req, res, next) => {
    console.error("❌ SERVER ERROR:", err);
    res.status(500).json({ error: "Server error" });
});

// START SERVER
app.listen(3000, () => {
    // console.log("==================================");
    console.log("SERVER START SUCCESSFULLY");
    // console.log("🌐 http://localhost:3000");
    // console.log("==================================");
});