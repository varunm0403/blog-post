import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/register', { email, password, name });
      console.log('Registration successful:', response.data);
      window.location.href = "http://localhost:3000/login";
    } catch (error) {
      console.error('Registration error:', error);
  
      if (error.response) {
        // The request was made and the server responded with a status code outside the range of 2xx
        if (error.response.data && error.response.data.error) {
          setError("Error Backend : " + error.response.data.error);
        } else {
          setError('Server responded with an error but no specific message was provided.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response received from the server. Please check your network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('An error occurred while setting up the request: ' + error.message);
      }
    }
  };
  
  

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem',
          border: '1px solid grey',
          padding: '2rem',
        }}
      >
        <Typography variant="h5">Register</Typography>
        <TextField
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          id="email"
          label="Email"
          variant="outlined"
        />
        <TextField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          id="password"
          label="Password"
          variant="outlined"
          type="password"
        />
        <TextField
          value={name}
          onChange={(e) => setName(e.target.value)}
          id="name"
          label="Name"
          variant="outlined"
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button onClick={handleRegister} variant="outlined">
          Register
        </Button>
        <Link to="/">
          <Button type='submit' variant='outlined'>Login</Button>
        </Link>
      </Box>
    </Box>
  );
}

export default Register;
