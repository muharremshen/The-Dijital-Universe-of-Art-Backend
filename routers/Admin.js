const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/AdminModel");

router.post("/login", async (req, res) => {
  try {
    const {username, password} = req.body;

    // Kullanıcıyı veritabanında bul
    const admin = await Admin.findOne({username});

    // Kullanıcı adı kontrolü
    if (!admin) {
      return res.status(400).json({error: "Kullanıcı adı veya şifre hatalı"});
    }

    // Şifre kontrolü
    const isPasswordCorrect = await Admin.findOne({password});
    if (!isPasswordCorrect) {
      return res.status(400).json({error: "Kullanıcı adı veya şifre hatalı"});
    }

    // JWT oluştur
    // const token = jwt.sign({id: admin._id}, process.env.JWT_SECRET, {
    //   expiresIn: "1h"
    // });

    res.json(admin);
  } catch (error) {
    console.error("Giriş hatası:", error);
    res.status(500).json({error: "Sunucu hatası"});
  }
});

module.exports = router;
