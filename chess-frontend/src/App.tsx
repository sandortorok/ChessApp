import { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/shared/components/layout';
import HomePage from './pages/HomePage';
import TestPage from './pages/TestPage';
import { LoginForm, RegisterForm } from '@/features/auth';
import { ChessGame } from '@/features/game';
import { LobbyPage } from '@/features/lobby';
import { MyGamesPage } from '@/features/game-history';
import { LeaderboardPage } from '@/features/player';
import { SettingsPage } from '@/features/settings';

function App() {
  useEffect(() => {
    document.title = import.meta.env.VITE_APP_TITLE; // vagy process.env.REACT_APP_TITLE
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/profile" element={<Layout><SettingsPage /></Layout>} />
        <Route path="/lobby" element={<Layout><LobbyPage /></Layout>} />
        <Route path="/mygames" element={<Layout><MyGamesPage /></Layout>} />
        <Route path="/leaderboard" element={<Layout><LeaderboardPage /></Layout>} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/test" element={<Layout><TestPage /></Layout>} />
        <Route path="/game/:gameId" element={<Layout><ChessGame /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
