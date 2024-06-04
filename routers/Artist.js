const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const RequireLogin = require("../middleware/RequireLogin");

const Auth = require("../models/AuthModel");
const Artist = require("../models/ArtistModel");
const mongoose = require("mongoose");

router.put("/:id", RequireLogin, async (req, res) => {
  const {id} = req.params;
  const userId = req.user._id; // Assume RequireLogin middleware adds user object to req
  console.log("%croutersAuth.js:10 req.params", "color: #26bfa5;", req.params);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({error: "Invalid artist ID"});
  }

  const {name, birthDate, workshop, profileImage, exhibition} = req.body;
  console.log("%croutersArtist.js:14 req.body", "color: #26bfa5;", req.body);

  if (!name || !birthDate || !workshop || !Array.isArray(exhibition)) {
    return res.status(422).json({error: "Please fill in all fields and provide exhibition as an array"});
  }

  console.log("%croutersArtist.js:20 id", "color: #26bfa5;", id);

  try {
    const result = await Artist.updateOne(
      {user: userId, _id: id},
      {
        $set: {
          name,
          birthDate,
          workshop,
          profileImage,
          exhibition,
          user: userId
        }
      },
      {new: true, runValidators: true, upsert: true}
    );

    if (result.nModified === 0 && result.upserted) {
      const newArtist = await Artist.findById(result.upserted[0]._id);
      return res.json({message: "Artist created successfully", artist: newArtist});
    }

    const updatedArtist = await Artist.findById(id);
    res.json({message: "Artist updated successfully", artist: updatedArtist});
  } catch (err) {
    console.error("Error updating or creating artist:", err);
    res.status(500).json({error: "Internal server error"});
  }
});

module.exports = router;

router.post("/change-password", RequireLogin, async (req, res) => {
  try {
    const {oldPassword, newPassword} = req.body;
    const userId = req.user._id;

    // Kullanıcının eski şifresini kontrol et
    const artist = await Auth.findById(userId);
    if (!artist) {
      return res.status(404).json({error: "Kullanıcı bulunamadı"});
    }

    const isPasswordCorrect = await bcrypt.compare(oldPassword, artist.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({error: "Eski şifre yanlış"});
    }

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Şifreyi güncelle
    artist.password = hashedPassword;
    await artist.save();

    res.json({message: "Şifre başarıyla değiştirildi"});
  } catch (error) {
    console.error("Şifre değiştirme hatası:", error);
    res.status(500).json({error: "Sunucu hatası"});
  }
});

module.exports = router;

router.get("/sanatcilar", async (req, res) => {
  try {
    const artists = await Artist.find(); // Tüm sanatçıları bul
    res.json(artists); // Sanatçıları JSON olarak dön
  } catch (error) {
    console.error("Sanatçıları alma hatası:", error);
    res.status(500).json({error: "Sunucu hatası"});
  }
});

module.exports = router;

router.get("/:id", RequireLogin, async (req, res) => {
  const {id} = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({error: "Invalid artist ID"});
  }

  try {
    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({error: "Artist not found"});
    }
    res.json(artist);
  } catch (err) {
    console.error("Error fetching artist profile:", err);
    res.status(500).json({error: "Internal server error"});
  }
});

router.get("/:id", async (req, res) => {
  const {id} = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({error: "Invalid artist ID"});
  }

  try {
    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({error: "Artist not found"});
    }
    res.json(artist);
  } catch (err) {
    console.error("Error fetching artist profile:", err);
    res.status(500).json({error: "Internal server error"});
  }
});
