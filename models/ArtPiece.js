const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const artPieceSchema = new Schema(
  {
    imageUrl: {type: String, required: true},
    imageName: {type: String, required: true},
    category: {type: String, required: true},
    price: {type: Number, required: true},
    height: {type: Number, required: true},
    width: {type: Number, required: true},
    theme: {type: String},
    color: {type: String},
    technical: {type: String},
    userId: {type: Schema.Types.ObjectId, ref: "Auth", required: true}
  },
  {timestamps: true}
);

module.exports = mongoose.model("ArtPiece", artPieceSchema);
