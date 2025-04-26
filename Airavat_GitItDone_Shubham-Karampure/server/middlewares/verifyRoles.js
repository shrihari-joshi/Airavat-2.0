const verifyRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            console.log(req.user.role);
            return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
        }
        next();
    };
};

module.exports = verifyRole;