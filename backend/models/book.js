const mongoose = require("mongoose");

//SCHEMA D'UN LIVRE
const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [
    {
      userId: String,
      grade: Number,
    },
  ],
  averageRating: { type: Number },
  imageUrl: { type: String, required: true },
});

module.exports = mongoose.model("Book", bookSchema);