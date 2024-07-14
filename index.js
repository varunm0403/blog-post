const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3001;
const Item = require('./models/item.js');
const Post = require('./models/post.js');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();


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


app.get('/', (req, res) => {
  res.send('Hello, World!');
});


app.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    
    const itemNames = items.map(item => item);
  
    res.json(itemNames);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/get-posts', async (req, res) => {
  try {
    const post = await Post.find();
    
    const postNames = post.map(item => item);
    
    res.json(postNames);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await Item.findOne({ email });

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {  
        const accessTokenSecret = process.env.ACCESS_TOKEN; 
        const accessToken = jwt.sign({ id: user._id, email: user.email }, accessTokenSecret, { expiresIn: '1h' });

        
        res.json({ accessToken, email: user.email, name: user.name, id: user._id });
      } else {
        
        res.status(401).json({ error: 'Invalid email or password' });
      }
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await Item.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newUser = new Item({ email, password: hashedPassword, name });

    
    await newUser.save();

    const userDetails = { id: newUser._id, email: newUser.email, name: newUser.name };
    res.status(201).json(userDetails);
  } catch (error) {
  
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.post('/api/post-blog', upload.single('image'), async (req, res) => {
  const { name, email, caption, comment, like, dislike } = req.body;
  const image = req.file ? req.file.buffer.toString('base64') : null;

  try {
    const newPost = new Post({
      name,
      email,
      image,
      caption,
      comment,
      like,
      dislike
    });

    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/update-post/:postId', async (req, res) => {
  const { userId, like, dislike } = req.body;
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (like !== undefined) {
     
      const likedIndex = post.likedBy.indexOf(userId);

      if (likedIndex !== -1) {
      
        post.like -= 1;
        post.likedBy.splice(likedIndex, 1);
      } else {
        
        post.like += 1;
        post.likedBy.push(userId);

      
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
       
        post.dislike -= 1;
        post.dislikedBy.splice(dislikedIndex, 1);
      } else {
       
        post.dislike += 1;
        post.dislikedBy.push(userId);

       
        const likedIndex = post.likedBy.indexOf(userId);
        if (likedIndex !== -1) {
          post.like -= 1;
          post.likedBy.splice(likedIndex, 1);
        }
      }
    }

    
    await post.save();


    res.json(post);
  } catch (error) {
   
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/update-comment/:postId', async (req, res) => {
  const { commentLine, commentedAt, name } = req.body;

  try {
    const postId = req.params.postId;

   
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

   
    post.comment.push({
      commentLine,
      commentedAt,
      name
    });

   
    await post.save();

   
    res.json(post);
  } catch (error) {
    
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
