const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "honganh@",
    database: "mydatabase",   // đúng theo ảnh
    port: 3307
});

db.connect((err) => {
    if (err) {
        console.log("Lỗi kết nối MySQL:", err);
    } else {
        console.log("Kết nối MySQL thành công");
    }
});

module.exports = db;