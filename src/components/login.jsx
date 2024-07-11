import React, { useEffect, useState } from 'react'
import { Box, Button, TextField, Typography } from "@mui/material"
import axios from "axios"
import { Link } from 'react-router-dom'

function Login() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/login', { email, password });
      const { accessToken, email: userEmail, name, id } = response.data;

      // Store the access token, email, and name in local storage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userEmail', userEmail);
      localStorage.setItem('name', name);
      localStorage.setItem('userId', id )

      console.log(response.data)

      // Redirect the user to another page (e.g., dashboard)
      window.location.href = 'http://localhost:3000/home';
      console.log("Login Successful")
    } catch (error) {
      setError("Invalid email or password");
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      alignItems: "center",
      justifyContent: 'center',
      height: "100vh"
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: "center",
        justifyContent: 'center',
        flexDirection: "column",
        gap: "1rem",
        border: "1px solid grey",
        padding: "2rem",
      }}>
        <Typography variant='h5'>Login Page</Typography>
        <TextField onChange={(e) => setEmail(e.target.value)} id="outlined-basic" label="Email" variant="outlined" />
        <TextField onChange={(e) => setPassword(e.target.value)} id="outlined-basic" label="Password" variant="outlined" type='password' />
        {error ? <>
          <Typography variant='h5' color={'red'}>{error}</Typography>
        </> : null}
        <Button onClick={handleLogin} type='submit' variant='outlined'>Login</Button>
        <Link to={"/register"}>
        <Button type='submit' variant='outlined'>Register</Button>
        </Link>
      </Box>
    </Box>
  )
}

export default Login