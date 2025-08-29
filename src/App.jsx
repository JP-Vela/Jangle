import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import ManageLinks from './containers/Downloader/ManageLinks';
import { CssBaseline } from '@mui/material';
import './styles/layout.scss';



const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ed6c52', // 🔵 light blue by default
    },

    background: {
      default: '#1e1e1e',     // cards, modals, etc.
    }
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});


const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
        <title>YT Audio Downloader</title>
        <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<ManageLinks />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
