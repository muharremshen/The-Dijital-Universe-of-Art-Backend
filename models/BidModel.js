const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bidSchema = new Schema(
  {
    auction: {type: Schema.Types.ObjectId, ref: "Auction", required: true},
    user: {type: Schema.Types.ObjectId, ref: "User", required: true},
    amount: {type: Number, required: true}
  },
  {timestamps: true}
);

module.exports = mongoose.model("Bid", bidSchema);
