module.exports.uploadFiles = (req, res) => {
    const token = req.headers["token"];
    const T = "599bc66dae126c0bf453c3e1e91284b5";
    if (token == T) return res.send({ link: req.file.location });
    return res.send({ message: "AUTH needed" });
};
