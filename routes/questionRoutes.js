//import thư viện express
const express = require("express");

//Tạo router
const router = express.Router();

//import file
const questionController = require("../controllers/questionController");

//Tạo API method
//GET
router.get("/", questionController.getQuestion);

//POST
router.post("/", questionController.postQuestion);

//PUT
router.put("/:id", questionController.putQuestion);

//DELETE
router.delete("/:id", questionController.deleteQuestion);

module.exports = router;