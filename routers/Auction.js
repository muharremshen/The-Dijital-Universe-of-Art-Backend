const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Auction = require("../models/AuctionModel");
const Bid = require("../models/BidModel");
const Auth = require("../models/AuthModel");

// Kalan süreyi hesaplama fonksiyonu
const calculateTimeLeft = endTime => {
  const now = new Date();
  const timeDifference = endTime - now;
  const minutes = Math.floor(timeDifference / (1000 * 60));
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
  return {minutes, seconds, isExpired: timeDifference <= 0};
};

router.get("/list", async (req, res) => {
  try {
    const auctions = await Auction.find();
    const auctionsWithTimeLeft = auctions.map(auction => {
      const endTime = auction.endTime;
      const {minutes, seconds, isExpired} = calculateTimeLeft(endTime);
      return {
        ...auction.toObject(),
        endTime,
        timeLeft: isExpired ? null : `${minutes}dk ${seconds}s`,
        isExpired
      };
    });
    res.json(auctionsWithTimeLeft);
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
  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    return res.status(400).json({error: "Invalid auction ID"});
  }

  try {
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({error: "Auction not found"});
    }

    if (amount > auction.currentBid) {
      auction.currentBid = amount;
      auction.highestBidder = userId;
      auction.bids.push({user: userId, price: amount});
      await auction.save();

      const newBid = new Bid({
        auction: auctionId,
        user: userId,
        amount
      });
      await newBid.save();

      const user = await Auth.findById(userId);
      const userName = user ? user.name : "Unknown";

      req.io.emit("bidUpdate", {
        auctionId: auctionId,
        newBid: amount,
        userName: userName
      });

      res.status(201).json({newBid, userName});
    } else {
      res.status(400).json({error: "Bid amount must be higher than current bid"});
    }
  } catch (error) {
    console.error("Error placing bid:", error);
    res.status(500).json({error: "Server error"});
  }
});

module.exports = router;
