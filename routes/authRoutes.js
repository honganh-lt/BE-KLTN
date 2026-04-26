const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");
const { checkRoles, checkRole } = require("../middleware/roleMiddleware");

//==============Public=========
router.post("/register", authController.register);
router.post("/login", authController.login);


//==========USER (user + admin login cũng vào được)==========
router.get("/profile", 
        verifyToken, 
        checkRoles(["user", "admin"]),
        (req, res) => {
    res.json({message: "OK", user: req.user});
})
//ví dụ API cho client
router.get("/user-data",
        verifyToken,
        checkRoles(["user", "admin"]),
        (req, res) => {
        res.json({ message: "Dữ liệu user" });
    }
)
//========== ADMIN ONLY ==========
router.get(
    "/admin",
    verifyToken,
    checkRole("admin"),
    (req, res) => {
        res.json({ message: "Chào admin 🔥" });
    }
);

//=============TOKEN============
router.post("/refresh-token", authController.refreshToken);

router.post("/logout", authController.logout)

//========Admin only=======

module.exports = router;