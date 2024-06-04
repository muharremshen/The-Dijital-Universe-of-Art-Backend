const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Artist = require("./ArtistModel");

const AuthModelSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    }
  },
  {timestamps: true}
);

// "name" alanı güncellendiğinde Artist belgelerindeki ilgili alanları güncelle
AuthModelSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const docToUpdate = await this.model.findOne(this.getQuery());
    if (this._update.name && docToUpdate) {
      await Artist.updateMany({user: docToUpdate._id}, {$set: {name: this._update.name}});
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Auth", AuthModelSchema);
