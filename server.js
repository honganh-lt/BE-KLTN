// const express = require("express");
// const cors = require("cors");

// const app = express();

// app.use(cors());
// app.use(express.json());

// //Đăng ký đang nhập Admin
// const authRoutes = require("./routes/authRoutes");
// app.use("/api/auth", authRoutes);
// const db = require("./config/db");   // phải có dòng này
// //thêm đẻ lấy dữ liệu users
// // const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");
// //dữ liệu users
// // const userRoutes = require("./routes/userRouters");
// app.use("/api/users", userRoutes);


// //Home
// const dashboardRoutes = require("./routes/dashboardRoutes")
// app.use("/api/dashboard", dashboardRoutes)


// //Thêm lấy dữ liệu quản lý môn học
// const subjectRoutes = require("./routes/subjectRoutes");
// app.use("/api/subjects", subjectRoutes);

// //Thêm lấy dữ liệu quản lý chương
// const chapterRoutes = require("./routes/chapterRoutes");
// app.use("/api/chapters", chapterRoutes);

// // Thêm lấy dữ liệu quản lý bài học theo chương
// const lessonRoutes = require("./routes/lessonRoutes");
// app.use("/api/lessons", lessonRoutes);

// //Thêm lấy dữ liệu quản lý câu hỏi
// const questionRoutes = require("./routes/questionRoutes")
// app.use("/api/questions", questionRoutes);

// //Thêm lấy dữ liệu quản lý đề thi
// const examRoutes = require("./routes/examRoutes");
// app.use("/api/exams", examRoutes);

// //Thêm lấy dữ liệu quản lý đề thi user
// const userExamRoutes = require("./routes/userExamRoutes");
// app.use("/api/user-exam", userExamRoutes);

// // TEST HOME
// app.get("/", (req, res) => {
//     res.send("SERVER RUNNING OK 🚀");
// });

// // ERROR HANDLER
// app.use((err, req, res, next) => {
//     console.error("❌ SERVER ERROR:", err);
//     res.status(500).json({ error: "Server error" });
// });

// // START SERVER
// app.listen(3000, () => {
//     // console.log("==================================");
//     console.log("SERVER START SUCCESSFULLY");
//     // console.log("🌐 http://localhost:3000");
//     // console.log("==================================");
// });

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// ===== MIDDLEWARE =====
app.use(cors({
    origin: [
        "http://localhost:5173", // user
        "http://localhost:5174"  // admin
    ],
    credentials: true
}));

app.use(express.json());

// 👉 log request (debug)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// ===== ROUTES =====
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const questionRoutes = require("./routes/questionRoutes");
const examRoutes = require("./routes/examRoutes");
const userExamRoutes = require("./routes/userExamRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/user-exam", userExamRoutes);

// ===== HOME =====
app.get("/", (req, res) => {
    res.send("SERVER RUNNING OK 🚀");
});

// ===== 404 =====
app.use((req, res) => {
    res.status(404).json({ message: "API không tồn tại" });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
    console.error("❌ SERVER ERROR:", err);
    res.status(err.status || 500).json({
        message: err.message || "Server error"
    });
});

// ===== START =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});