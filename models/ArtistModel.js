// ArtistModel.js

const mongoose = require("mongoose");

const ArtistModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    birthDate: {
      type: String,
      required: true,
      trim: true
    },
    workshop: {
      type: String,
      required: true,
      trim: true
    },
    profileImage: {
      type: String,
      trim: true
    },
    exhibition: {
      type: [String],
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true
    }
  },
  {timestamps: true}
);

module.exports = mongoose.model("Artist", ArtistModelSchema);
