//Import thư viện express dùng để tạo server và API
const express = require("express");
// Tạo 1 router riêng định tuyến quản lý API
const router = express.Router();
//Import file Controller 
const chapterControler = require("../controllers/chapterController");

// Tạo API method 
// GET
router.get("/", chapterControler.getChapters);

// POST
router.post("/", chapterControler.postChapter);

// PUT
router.put("/:id", chapterControler.putChapter);

// DELETE
router.delete("/:id", chapterControler.deleteChapter);

module.exports = router;
