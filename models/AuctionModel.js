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

module.exports = mongoose.model("Auction", auctionSchema);
