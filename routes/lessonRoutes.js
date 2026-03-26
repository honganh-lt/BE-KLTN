//Import thư viện express
const express = require("express");
//Tạo 1 router riêng định tuyến API
const router = express.Router();
//import file controller
const lessonController = require("../controllers/lessonController");

//Tạo API method
//GET
router.get("/", lessonController.getLesson);

//POST
router.post("/", lessonController.postLesson);

//PUT
router.put("/:id", lessonController.putLesson);

//DELETE
router.delete("/:id", lessonController.deleteLesson);

module.exports = router;