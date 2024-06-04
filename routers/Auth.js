const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AuthModel = require("../models/AuthModel");
const ArtPiece = require("../models/ArtPiece");

router.post("/register", (req, res) => {
  const {email, password, name, status} = req.body;
  console.log("%croutersAuth.js:10 req.body", "color: #26bfa5;", req.body);
  if (!name || !email || !password || !status) {
    return res.status(422).json({error: "Please fill in all fields"});
  }
  AuthModel.findOne({email: email})
    .then(savedUser => {
      if (savedUser) {
        return res.status(422).json({error: "Email is already registered"});
      }
      bcrypt.hash(password, 12).then(hashedpassword => {
        const user = new AuthModel({
          email: email,
          password: hashedpassword,
          name: name,
          status: status
        });
        user
          .save()
          .then(user => {
            res.json({message: "Record created"});
          })
          .catch(error => {
            console.log(error);
          });
      });
    })
    .catch(err => {
      console.log(err);
    });
});

router.post("/login", (req, res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return res.status(422).json({error: "Please enter email or password"});
  }
  AuthModel.findOne({email: email}).then(savedUser => {
    if (!savedUser) {
      return res.status(422).json({error: "Invalid email or password"});
    }
    bcrypt
      .compare(password, savedUser.password)
      .then(doMatch => {
        if (doMatch) {
          const token = jwt.sign({_id: savedUser._id}, process.env.JWT_SECRET, {expiresIn: "1h"});

          const {_id, email, status} = savedUser;
          res.json({token: token, user: {_id, email, status}});
        } else {
          return res.status(422).json({error: "Invalid email or password"});
        }
      })
      .catch(err => {
        console.log(err);
      });
  });
});

router.get("/users", async (req, res) => {
  try {
    const users = await AuthModel.find();
    if (!users) {
      return res.status(404).json({error: "users not found"});
    }
    res.json(users);
  } catch (err) {
    console.error("Error fetching art piece:", err);
    res.status(500).json({error: "Internal server error"});
  }
});
router.delete("/:id", async (req, res) => {
  const {id} = req.params;

  try {
    const users = await AuthModel.findById(id);
    if (!users) {
      return res.status(404).json({message: "Kullanıcı bulunamadı"});
    }

    await AuthModel.findByIdAndDelete(id);
    await ArtPiece.deleteMany({userId: id});
    res.json({message: "Kullanıcı başarıyla silindi"});
  } catch (error) {
    console.error("Error deleting art piece:", error);
    res.status(500).json({message: "Internal server error"});
  }
});

module.exports = router;
