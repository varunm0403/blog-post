import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, CardMedia, TextField, Box } from '@mui/material';
import axios from 'axios';
import Nav from "./nav"

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [showAllComments, setShowAllComments] = useState(false);
  const userId = localStorage.getItem("userId");
  const name = localStorage.getItem("name");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:3001/get-posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        // Handle error state or show error message
      }
    };

    fetchPosts();
  }, []);

  const handleLike = async (postId, currentLikes) => {
    try {
      const response = await axios.put(`http://localhost:3001/api/update-post/${postId}`, { like: currentLikes + 1, userId: userId });
      // Update the local state to reflect the new like count
      setPosts(posts.map(post => post._id === postId ? response.data : post));
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleDislike = async (postId, currentDislikes) => {
    try {
      const response = await axios.put(`http://localhost:3001/api/update-post/${postId}`, { dislike: currentDislikes + 1, userId: userId });
      // Update the local state to reflect the new dislike count
      setPosts(posts.map(post => post._id === postId ? response.data : post));
    } catch (error) {
      console.error('Error updating dislike:', error);
    }
  };

  const handleAddComment = async (postId) => {
    try {
      const response = await axios.put(`http://localhost:3001/api/update-comment/${postId}`, {
        commentLine: commentInputs[postId],
        commentedAt: new Date(),
        name: name // You can modify this to get the user's name if logged in
      });
      // Update the local state to reflect the new comment
      setPosts(posts.map(post => post._id === postId ? response.data : post));

      // Clear the comment input for this post
      setCommentInputs({
        ...commentInputs,
        [postId]: ''
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCommentInputChange = (postId, value) => {
    setCommentInputs({
      ...commentInputs,
      [postId]: value
    });
  };

  const toggleShowAllComments = (postId) => {
    setShowAllComments({
      ...showAllComments,
      [postId]: !showAllComments[postId]
    });
  };


  return (
    <>
      <Nav />
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom>
          Blog Posts
        </Typography>
        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid item key={post._id} xs={12} sm={6} md={6}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={`data:image/jpeg;base64,${post.image}`} // Ensure your base64 string is prefixed correctly
                  alt={post.caption}
                />
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {post.caption}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" component="p">
                    {post.name} - {new Date(post.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" component="p">
                    Likes: {post.like} | Dislikes: {post.dislike} | Comments: {post.comment.length}
                  </Typography>
                </CardContent>
                <CardActions sx={{ display: 'flex', alignItems: "center", justifyContent: "center" }}>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleLike(post._id, post.like)}
                    disabled={post.likedBy.some(id => id === userId)}
                  >
                    Like
                  </Button>

                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleDislike(post._id, post.dislike)}
                    disabled={post.dislikedBy.some(id => id === userId)}
                  >
                    Dislike
                  </Button>
                </CardActions>
                <Box display={'flex'} alignItems={'center'} justifyContent={'space-around'} flexDirection={'column-reverse'}>
                  <Box display={'flex'} flexDirection={'column'} width={'100%'} padding={'1rem'} marginLeft={'1rem'} gap={1}>
                    <Typography variant="subtitle1">Comments:</Typography>
                    {showAllComments[post._id] ? (
                      post.comment.map((comment, index) => (
                        <Typography key={index} variant="body2" fontWeight={'800'}>
                          {comment.name}: {comment.commentLine}
                        </Typography>
                      ))
                    ) : (
                      post.comment.slice(0, 3).map((comment, index) => (
                        <Typography key={index} variant="body2" fontWeight={'800'}>
                          {comment.name}: {comment.commentLine}
                        </Typography>
                      ))
                    )}
                    {post.comment.length > 3 && (
                      <Button size="small" color="primary" onClick={() => toggleShowAllComments(post._id)}>
                        {showAllComments[post._id] ? 'Show Less' : 'Show More'}
                      </Button>
                    )}
                  </Box>
                  <Box>
                    <TextField
                      label="Add Comment"
                      variant="outlined"
                      size="small"
                      value={commentInputs[post._id]}
                      onChange={(e) => handleCommentInputChange(post._id, e.target.value)}
                    />
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleAddComment(post._id)}
                    >
                      Add
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default BlogList;
