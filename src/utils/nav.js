import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
// import IconButton from '@mui/material/IconButton';
// import MenuIcon from '@mui/icons-material/Menu';

export default function ButtonAppBar() {
  const logout = () => {
    localStorage.removeItem("name")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("accessToken")
    window.location.href = "http://localhost:3000/login"
  }
  return (
    <Box sx={{ flexGrow: 1, }}>
      <AppBar position="static" sx ={{background:"white", boxShadow:"none", color:"black"}}>
        <Toolbar>
          {/* <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton> */}
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }} fontWeight={700}>
            BLOG POST
          </Typography>
          <Box display={'flex'} alignItems={'center'} justifyContent={'center'} gap={1}>
          <Link to={'/home'}>
          <Button>Home</Button>
          </Link>
          <Link to={'/'}>
          <Button>Blogs</Button>
          </Link>
           <Button onClick={logout}>Logout</Button>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
