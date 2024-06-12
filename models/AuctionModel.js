const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const auctionSchema = new Schema(
  {
    artName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    startPrice: {
      type: Number,
      required: true
    },
    currentBid: {
      type: Number,
      default: 0,
      required: true
    },
    highestBidder: {
      type: Schema.Types.ObjectId,
      ref: "Auth"
    },
    time: {
      type: Number,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    bids: {
      type: [
        {
          user: {type: Schema.Types.ObjectId, ref: "Auth"},
          price: {type: Number, required: true},
          timestamp: {type: Date, default: Date.now, required: true}
        }
      ],
      required: false
    }
  },
  {timestamps: true}
);
auctionSchema.virtual("endTime").get(function () {
  return new Date(this.createdAt.getTime() + this.time * 60000);
});
module.exports = mongoose.model("Auction", auctionSchema);
