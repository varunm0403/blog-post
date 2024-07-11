const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3001;
const Item = require('./models/item.js');  // Correct path to the model
const Post = require('./models/post.js');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

// Generate a random secret of 64 bytes (512 bits)
const generateRandomSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};


const mongoURL = 'mongodb+srv://mishraji0689:iBXdzF3QAWZ3NjVG@frec.gvnjfno.mongodb.net/?retryWrites=true&w=majority&appName=frec';

app.use(express.json());
app.use(cors());

mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

// Define a route handler for the default home page
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Define a GET API to retrieve items
app.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    // Extract names from items array
    const itemNames = items.map(item => item);
    // Send names in the response
    res.json(itemNames);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send('Internal Server Error'); // Send an error response
  }
});

app.get('/get-posts', async (req, res) => {
  try {
    const post = await Post.find();
    // Extract names from items array
    const postNames = post.map(item => item);
    // Send names in the response
    res.json(postNames);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send('Internal Server Error'); // Send an error response
  }
});

// Login
// const accessTokenSecret = generateRandomSecret();
  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      // Find user by email
      const user = await Item.findOne({ email });

      // Check if user exists
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Compare the provided password with the hashed password
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {  
        // If login successful, generate JWT token
        const accessTokenSecret = process.env.ACCESS_TOKEN; // Replace with your own secret key
        const accessToken = jwt.sign({ id: user._id, email: user.email }, accessTokenSecret, { expiresIn: '1h' });

        // Return the JWT token in the response
        res.json({ accessToken, email: user.email, name: user.name, id: user._id });
      } else {
        // If login fails, return error message
        res.status(401).json({ error: 'Invalid email or password' });
      }
    } catch (error) {
      // Handle any errors
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


// Registrt
app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // Check if user with the given email already exists
    const existingUser = await Item.findOne({ email });

    if (existingUser) {
      // If user with the same email already exists, return an error
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds parameter

    // Create a new user document with hashed password
    const newUser = new Item({ email, password: hashedPassword, name });

    // Save the new user to the database
    await newUser.save();

    // Return the newly created user details
    const userDetails = { id: newUser._id, email: newUser.email, name: newUser.name };
    res.status(201).json(userDetails);
  } catch (error) {
    // Handle any errors
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Post
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint to handle blog post creation
app.post('/api/post-blog', upload.single('image'), async (req, res) => {
  const { name, email, caption, comment, like, dislike } = req.body;
  const image = req.file ? req.file.buffer.toString('base64') : null;

  try {
    // Create a new blog post
    const newPost = new Post({
      name,
      email,
      image,
      caption,
      comment,
      like,
      dislike
    });

    // Save the new post to the database
    await newPost.save();

    // Return the newly created post
    res.status(201).json(newPost);
  } catch (error) {
    // Handle any errors
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Post Like and Dislike
app.put('/api/update-post/:postId', async (req, res) => {
  const { userId, like, dislike } = req.body;
  try {
    const postId = req.params.postId;

    // Find the post by its ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (like !== undefined) {
      // Check if userId exists in likedBy
      const likedIndex = post.likedBy.indexOf(userId);

      if (likedIndex !== -1) {
        // User has already liked the post, remove userId from likedBy
        post.like -= 1;
        post.likedBy.splice(likedIndex, 1);
      } else {
        // User has not liked the post, add userId to likedBy
        post.like += 1;
        post.likedBy.push(userId);

        // Remove userId from dislikedBy if it exists
        const dislikedIndex = post.dislikedBy.indexOf(userId);
        if (dislikedIndex !== -1) {
          post.dislike -= 1;
          post.dislikedBy.splice(dislikedIndex, 1);
        }
      }
    }

    if (dislike !== undefined) {
      // Check if userId exists in dislikedBy
      const dislikedIndex = post.dislikedBy.indexOf(userId);

      if (dislikedIndex !== -1) {
        // User has already disliked the post, remove userId from dislikedBy
        post.dislike -= 1;
        post.dislikedBy.splice(dislikedIndex, 1);
      } else {
        // User has not disliked the post, add userId to dislikedBy
        post.dislike += 1;
        post.dislikedBy.push(userId);

        // Remove userId from likedBy if it exists
        const likedIndex = post.likedBy.indexOf(userId);
        if (likedIndex !== -1) {
          post.like -= 1;
          post.likedBy.splice(likedIndex, 1);
        }
      }
    }

    // Save the updated post to the database
    await post.save();

    // Return the updated post
    res.json(post);
  } catch (error) {
    // Handle any errors
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/update-comment/:postId', async (req, res) => {
  const { commentLine, commentedAt, name } = req.body;

  try {
    const postId = req.params.postId;

    // Find the post by its ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Add new comment to the comments array
    post.comment.push({
      commentLine,
      commentedAt,
      name
    });

    // Save the updated post to the database
    await post.save();

    // Return the updated post
    res.json(post);
  } catch (error) {
    // Handle any errors
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
