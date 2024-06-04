const express = require("express");
const router = express.Router();
const Auth = require("./Auth");
const Artist = require("./Artist");
const ArtPiece = require("./ArtPiece");
const Auction = require("./Auction");
const Admin = require("./Admin");

router.use("/auth", Auth);
router.use("/artist", Artist);
router.use("/art-piece", ArtPiece);
router.use("/auction", Auction);
router.use("/admin", Admin);

module.exports = router;
