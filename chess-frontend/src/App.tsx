import { useEffect } from 'react';
import './App.css';
import ChessGame from './ChessGame';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Layout from './components/Layout';
import SettingsScreen from './pages/settings';
import Lobby from './pages/lobby';
import MyGames from './pages/mygames';

function App() {
  useEffect(() => {
    document.title = import.meta.env.VITE_APP_TITLE; // vagy process.env.REACT_APP_TITLE
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/profile" element={<Layout><SettingsScreen /></Layout>} />
        <Route path="/lobby" element={<Layout><Lobby /></Layout>} />
        <Route path="/mygames" element={<Layout><MyGames /></Layout>} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/game/:gameId" element={<Layout><ChessGame /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
