const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const auctionSchema = new Schema(
  {
    image: {type: String, required: true},
    description: {type: String},
    artName: {type: Schema.Types.ObjectId, required: true},
    time: {type: Date, required: true},
    startPrice: {type: Number, required: true},
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
