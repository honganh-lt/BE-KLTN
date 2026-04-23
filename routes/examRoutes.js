const express = require("express");

const router = express.Router();

const examController = require("../controllers/examController");
// const { get } = require("./authRoutes");

//Tạo API
//GET=========Lấy danh sách đề thi============
router.get("/", examController.getExams);

//Lấy chi tiết đề
router.get("/:id", examController.getExamDetail);


//POST =========Tạo đề thi============
// router.post("/", examController.postExam);
//POST tạo API: tạo đề + random câu hỏi
router.post('/', examController.postExam); //tạo thủ công
router.post("/subject", examController.createExamBySubject); // 👈 QUAN TRỌNG

//PUT
router.put("/:id", examController.putExam);

//DELETE
router.delete("/:id", examController.deleteExam);

module.exports = router;