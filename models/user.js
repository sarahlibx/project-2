const mongoose = require("mongoose");

  const bookSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Read', 'In Progress', 'Did Not Finish', 'To Be Read'], 
      required: true,
    },
  });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  bookshelf: [bookSchema],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
