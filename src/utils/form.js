import React, { useState } from 'react';
import { Container, Typography, Grid, TextField, Button, Card, CardMedia } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  caption: yup.string().required('Caption is required'),
});

const PostBlogForm = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState('');

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      imageFile: null,
      caption: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);
      setMessage('');
      try {
        // Create FormData object
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('email', values.email);
        formData.append('caption', values.caption);
        formData.append('image', values.imageFile);

        // Log the FormData entries
        for (let pair of formData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }

        // Make POST request to server
        const response = await axios.post('http://localhost:3001/api/post-blog', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Posted Blog:', response.data); // Optionally handle response
        setMessage('Blog post successfully created!');
        window.location.reload()
        resetForm();
        setImagePreview(null); // Clear image preview after submission
      } catch (error) {
        console.error('Error posting blog:', error);
        setMessage('Error posting blog. Please try again.');
        // Handle error state or show error message
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    formik.setFieldValue('imageFile', file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Post a Blog
      </Typography>
      {message && <Typography variant="body1">{message}</Typography>}
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>
          <Grid item xs={12}>
            <input
              accept="image/png, image/jpeg, image/jpg"
              id="imageFile"
              name="imageFile"
              type="file"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <label htmlFor="imageFile">
              <Button variant="contained" component="span">
                Upload Image
              </Button>
            </label>
            {imagePreview && (
              <Card sx={{ maxWidth: 400, marginTop: 1 }}>
                <CardMedia component="img" image={imagePreview} alt="Uploaded Preview" />
              </Card>
            )}
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="caption"
              name="caption"
              label="Caption"
              value={formik.values.caption}
              onChange={formik.handleChange}
              error={formik.touched.caption && Boolean(formik.errors.caption)}
              helperText={formik.touched.caption && formik.errors.caption}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Submitting...' : 'Post Blog'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default PostBlogForm;
