const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const RequireLogin = require("../middleware/RequireLogin");
const ArtPiece = require("../models/ArtPiece");

// Yeni bir sanat eseri oluşturma
router.post("/", RequireLogin, async (req, res) => {
  try {
    const {imageUrl, imageName, category, price, height, width, theme, technical, color} = req.body;
    const userId = req.user._id;

    if (!imageUrl || !imageName || !category || !price || !height || !width || !theme || !color) {
      return res.status(400).json({error: "Lütfen tüm alanları doldurun"});
    }

    const newArtPiece = new ArtPiece({
      imageUrl,
      imageName,
      category,
      price,
      height,
      width,
      theme,
      color,
      technical,
      userId
    });

    const savedArtPiece = await newArtPiece.save();
    res.status(201).json(savedArtPiece);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Bir hata oluştu"});
  }
});

// En son eklenen sanat eserlerini getirme
router.get("/latest", async (req, res) => {
  try {
    const latestArtPieces = await ArtPiece.find().sort({createdAt: -1}).limit(8);
    res.json(latestArtPieces);
  } catch (error) {
    console.error("Error fetching latest art pieces:", error);
    res.status(500).json({error: "Server error"});
  }
});

// Kategoriye göre sanat eserlerini getirme
router.get("/fotograf", async (req, res) => {
  try {
    const artPieces = await ArtPiece.find({category: "fotograf"});
    if (!artPieces || artPieces.length === 0) {
      return res.status(404).json({error: "Sanat eseri bulunamadı"});
    }
    res.json(artPieces);
  } catch (err) {
    console.error("Sanat eserleri çekilirken hata oluştu:", err);
    res.status(500).json({error: "Sunucu hatası"});
  }
});

router.get("/resim", async (req, res) => {
  try {
    const artPieces = await ArtPiece.find({category: "resim"});
    if (!artPieces || artPieces.length === 0) {
      return res.status(404).json({error: "Sanat eseri bulunamadı"});
    }
    res.json(artPieces);
  } catch (err) {
    console.error("Sanat eserleri çekilirken hata oluştu:", err);
    res.status(500).json({error: "Sunucu hatası"});
  }
});

router.get("/heykel", async (req, res) => {
  try {
    const artPieces = await ArtPiece.find({category: "heykel"});
    if (!artPieces || artPieces.length === 0) {
      return res.status(404).json({error: "Sanat eseri bulunamadı"});
    }
    res.json(artPieces);
  } catch (err) {
    console.error("Sanat eserleri çekilirken hata oluştu:", err);
    res.status(500).json({error: "Sunucu hatası"});
  }
});

// Sanat eseri ID'sine göre sanat eserini getirme
router.get("/:id", async (req, res) => {
  const {id} = req.params;
  console.log("routersArtPiece.js:127 id", id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({error: "Invalid art piece ID"});
  }

  try {
    const artPiece = await ArtPiece.findById(id);
    if (!artPiece) {
      return res.status(404).json({error: "Art piece not found"});
    }
    res.json(artPiece);
  } catch (err) {
    console.error("Error fetching art piece:", err);
    res.status(500).json({error: "Internal server error"});
  }
});

// Kullanıcı ID'sine göre sanat eserlerini getirme
router.get("/user/:userId", async (req, res) => {
  const {userId} = req.params;
  console.log("routersArtPiece.js:46 userId", userId);
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({error: "Invalid user ID"});
  }

  try {
    const artPieces = await ArtPiece.find({userId});
    if (!artPieces || artPieces.length === 0) {
      return res.status(404).json({error: "Art piece not found"});
    }
    res.json(artPieces);
  } catch (err) {
    console.error("Error fetching art pieces by user ID:", err);
    res.status(500).json({error: "Internal server error"});
  }
});

// Sanat eseri silme
router.delete("/:id", RequireLogin, async (req, res) => {
  const {id} = req.params;
  const userId = req.user.id; // JWT doğrulamasından sonra gelen kullanıcı ID

  try {
    const artPiece = await ArtPiece.findById(id);
    if (!artPiece) {
      return res.status(404).json({message: "Eser bulunamadı"});
    }

    if (artPiece.userId.toString() !== userId) {
      return res.status(403).json({message: "Bu eseri silmeye yetkiniz yok"});
    }

    await ArtPiece.findByIdAndDelete(id);
    res.json({message: "Eser başarıyla silindi"});
  } catch (error) {
    console.error("Error deleting art piece:", error);
    res.status(500).json({message: "Internal server error"});
  }
});

module.exports = router;
