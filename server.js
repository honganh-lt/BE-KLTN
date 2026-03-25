const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const db = require("./config/db");   // phải có dòng này
//thêm đẻ lấy dữ liệu users
// const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRouters");
app.use("/api/auth", authRoutes);
//dữ liệu users
app.use("/api/users", userRoutes);

//Thêm lấy dữ liệu quản lý môn học
const subjectRoutes = require("./routes/subjectRoutes");
app.use("/api/subjects", subjectRoutes);

//Thêm lấy dữ liệu quản lý chương
const chapterRoutes = require("./routes/chapterRoutes");
app.use("/api/chapters", chapterRoutes);
// Thêm lấy dữ liệu quản lý bài học theo chương

//Thêm lấy dữ liệu quản lý câu hỏi

//Thêm lấy dữ liệu quản lý đề thi







// API test database
// app.get("/test-db", (req, res) => {
//     db.query("SELECT 1", (err, result) => {
//         if (err) {
//             return res.json(err);
//         }
//         res.json("Database OK");
//     });
// });
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Server error" });
});
// app.get("/", (req, res) => {
//     res.send("SERVER DANG CHAY OK");
// });
app.listen(3000, () => {
    console.log("Server chạy tại http://localhost:3000");
});