const jwt = require("jsonwebtoken");
const AuthModel = require("../models/AuthModel");

module.exports = (req, res, next) => {
  const {authorization} = req.headers;
  if (!authorization) {
    return res.status(401).json({error: "You must log in"});
  }
  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({error: "You must log in"});
    }
    const {_id} = payload;
    AuthModel.findById(_id).then(userdata => {
      req.user = userdata;
      next();
    });
  });
};
