const mongoose = require("mongoose");

  const bookSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      set: value => value.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
    },
    authors: {
      type: [String],
      default: [],
      set: value => {
        if (!Array.isArray(value)) value = [value];
        
        return value.map(author => 
          author .split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
        );
      }
    },
    thumbnail: {
      type: String,
      default: ''
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    publishedDate: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Read', 'In Progress', 'Did Not Finish', 'To Be Read'],
      default: 'To Be Read',
      required: true,
    },
    review: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    source: {
      type: String,
      required: true,
      default: 'manual'
    }
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
  bookshelf: {
    type: [bookSchema],
    default: []
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
