const express = require("express");

const router = express.Router();

const userExamController = require("../controllers/userExamController");

//GET
router.get("/",userExamController.getAllUserExams);

router.get("/",userExamController.getExamAttempts);

//Start Exam
router.post("/start", userExamController.startExam);

//Submit
router.post("/submit", userExamController.submitExam);

//History
router.get("/history/:user_id", userExamController.getHistory);

//Review
router.get("/review/:user_exam_id", userExamController.reviewExam);


module.exports = router;