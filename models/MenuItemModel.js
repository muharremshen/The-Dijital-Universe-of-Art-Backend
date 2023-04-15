const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: true
    },
    imageUrl: {
      type: String
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {timestamps: true}
);
module.exports = mongoose.model("MenuItem", MenuItemSchema);
