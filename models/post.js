const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({ 
  name: String,
  email : String,
  createdAt: { type: Date, default: Date.now },
  image: String,
  caption: String,
  like: { type: Number, default: 0 },
  dislike: { type: Number, default: 0 },
  comment: [{
    commentLine: String,
    commentedAt: { type: Date, default: Date.now },
    name: String
  }],
  likedBy: Array,   // Array of user IDs who liked the post
  dislikedBy: { type: [String], default: [] } 
});

const Posts = mongoose.model('Posts', PostSchema);

module.exports = Posts;