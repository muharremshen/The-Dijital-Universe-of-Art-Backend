const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Auction = require("../models/AuctionModel");

router.get("/list", async (req, res) => {
  try {
    console.log("%crouters/Auction.js:8 dasdaaddasdasdsa ", "color: #26bfa5;");
    const auctions = await Auction.find();
    res.json(auctions);
  } catch (error) {
    console.error("Error fetching auction details:", error);
    res.status(500).json({error: "Server error"});
  }
});

router.post("/start", async (req, res) => {
  const {image, description, artName, time, startPrice} = req.body;
  try {
    const newAuction = new Auction({
      image,
      description,
      artName,
      time,
      startPrice
    });
    await newAuction.save();
    res.status(201).json(newAuction);
  } catch (error) {
    console.error("Error starting auction:", error);
    res.status(500).json({error: "Server error"});
  }
});
router.delete("/:id", async (req, res) => {
  const {id} = req.params;
  try {
    const auction = await Auction.findByIdAndDelete(id);
    if (!auction) {
      return res.status(404).json({error: "Auction not found"});
    }
    res.status(200).json({message: "Auction deleted successfully"});
  } catch (error) {
    console.error("Error deleting auction:", error);
    res.status(500).json({error: "Server error"});
  }
});

// Teklif verme
router.post("/bid", async (req, res) => {
  const {auctionId, userId, amount} = req.body;

  // auctionId'nin geçerli bir ObjectId olup olmadığını kontrol edin
  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    return res.status(400).json({error: "Invalid auction ID"});
  }

  try {
    // auctionId'yi ObjectId'ye dönüştür
    const auctionObjectId = mongoose.Types.ObjectId(auctionId);

    const auction = await Auction.findById(auctionObjectId);
    if (!auction) {
      return res.status(404).json({error: "Auction not found"});
    }

    if (amount > auction.currentBid) {
      auction.currentBid = amount;
      auction.highestBidder = userId;
      auction.bids.push({user: userId, amount});
      await auction.save();

      const newBid = new Bid({
        auction: auctionObjectId,
        user: userId,
        amount
      });
      await newBid.save();
      res.status(201).json(newBid);
    } else {
      res.status(400).json({error: "Bid amount must be higher than current bid"});
    }
  } catch (error) {
    console.error("Error placing bid:", error);
    res.status(500).json({error: "Server error"});
  }
});

// Müzayede detayları
router.get("/:auctionId", async (req, res) => {
  const {auctionId} = req.params;

  // auctionId'nin geçerli bir ObjectId olup olmadığını kontrol edin
  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    return res.status(400).json({error: "Invalid auction ID"});
  }

  try {
    const auction = await Auction.findById(auctionId).populate("artPiece").populate("bids.user");
    if (!auction) {
      return res.status(404).json({error: "Auction not found"});
    }
    res.json(auction);
  } catch (error) {
    console.error("Error fetching auction details:", error);
    res.status(500).json({error: "Server error"});
  }
});

module.exports = router;
