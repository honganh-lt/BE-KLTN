//dễ mở rộng

// check 1 role
exports.checkRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Chưa xác thực" });
        }

        if (req.user.role !== role) {
            return res.status(403).json({ message: "Không có quyền" });
        }

        next();
    };
};

// check nhiều role
exports.checkRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Chưa xác thực" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Không có quyền" });
        }

        next();
    };
};


// //check 1 role === phân quyền === admin only
// exports.isAdmin = (req, res, next) => {
//         if(!req.user) {
//             return res.status(401).json({message: "Chưa xác thực"})
//         }

//         if(req.user.role !== "admin") {
//             return res.status(403).json({message: "Không có quyền Admin"})
//         }

//         next();
//     };

// //check nhiều role === User hoặc admin đều được
// exports.isUserOrAdmin = (req, res, next) => {
//         if(!req.user) {
//             return res.status(401).json({message: "Chưa xác thực"})
//         }

//         if(!roles.includes(req.user.role)) {
//             return res.status(403).json({message: "Không có quyền"})
//         }

//         next();
//     }   