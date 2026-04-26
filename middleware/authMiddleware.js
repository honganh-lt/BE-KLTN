const jwt = require("jsonwebtoken")

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if(!authHeader) {
        return res.status(401).json({message: "Không có token"})
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) {
            return res.status(403).json({message: "Token không hợp lệ"});
        }

        req.user = decoded;
        next();
    })
}