const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const db = require("./config/db");   // phải có dòng này

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

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
app.get("/", (req, res) => {
    res.send("SERVER DANG CHAY OK");
});
app.listen(3000, () => {
    console.log("Server chạy tại http://localhost:3000");
});