import React from 'react';
import Login from './components/login';
import Home from './components/home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/register';
import BlogList from './utils/BlogList';

function App() {
  const accessToken = localStorage.getItem("accessToken");

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={accessToken ? <Home /> : <Login />} />
        <Route path="/" element={accessToken ? <BlogList /> : <Login />} />
      </Routes>
    </Router>
  );
}

export default App;
