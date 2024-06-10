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
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({error: "Kullanıcı adı veya şifre hatalı"});
    }

    // Admin'in _id bilgisini yanıt olarak döndür
    res.json({_id: admin._id});
  } catch (error) {
    console.error("Giriş hatası:", error);
    res.status(500).json({error: "Sunucu hatası"});
  }
});

module.exports = router;
