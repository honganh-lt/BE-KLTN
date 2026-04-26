// Import thư viện express dùng đẻ tạo server và API
const express = require("express");

// Tạo một router riêng
// Router giống như “bộ định tuyến nhỏ” để quản lý API
const router = express.Router();

// Import file controller bạn vừa viết ; trong đó có hàm (getSubjects)
const subjectController = require("../controllers/subjectController");

// Tạo API với method GET ; URL: (/)
// Trong app.js(server.js): app.use("/api/subjects", subjectRoutes);
// GET /api/subjects

router.get("/", subjectController.getSubjects);

//POST
router.post("/", subjectController.postSubjects)
//PUT
router.put("/:id", subjectController.putSubjects)
//DELETE
router.delete("/:id", subjectController.deleteSubjects)

module.exports = router;