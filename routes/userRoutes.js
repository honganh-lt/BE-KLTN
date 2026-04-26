const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");

//Taoj API
router.get("/", userController.getUser);

//POST
router.post("/", userController.postUser);

//PUT
router.put("/:id", userController.putUser);

//DELETE
router.delete("/:id", userController.deleteUser);

module.exports = router;