const express = require("express");

const router = express.Router();

const examController = require("../controllers/examController");
// const { get } = require("./authRoutes");

//Tạo API
//GET
router.get("/", examController.getExam);

// 👇 thêm ở đây
router.get("/:id", examController.getExamDetail);


//POST
// router.post("/", examController.postExam);
//POST tạo API: tạo đề + random câu hỏi
router.post('/', examController.createExamWithQuestions);

//PUT
router.put("/:id", examController.putExam);

//DELETE
router.delete("/:id", examController.deleteExam);

module.exports = router;