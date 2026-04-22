import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { ThemeContext } from './context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

import Login from './pages/Login';
import Signup from './pages/Signup';
import ProjectDetails from './pages/ProjectDetails';
import IssueDetails from './pages/IssueDetails';
import WelcomePage from './pages/WelcomePage';
import HomePage from './pages/HomePage';
import Analytics from './pages/Analytics';
import TeamMemb from './pages/TeamMemb';
import ProjectInfo from './pages/ProjectInfo';
import Settings from './pages/Settings';

function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/WelcomePage" />;
}

function App() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <Router>
      <div className="min-h-screen flex flex-col transition-colors duration-200">
        

        <main className="">
          <Routes>
            { <Route path="/WelcomePage" element={user ? <Navigate to="/" /> : <WelcomePage  />} /> }
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
            <Route path="/Analytics" element={<Analytics />} />
            <Route path="/TeamMemb" element={<TeamMemb />} />
            <Route path="/ProjectInfo" element={<PrivateRoute><ProjectInfo /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
           
            
            
            <Route path="/" element={user ? <Navigate to="/HomePage" /> : <WelcomePage />} />
            <Route path="/HomePage" element=
            {<PrivateRoute><HomePage /></PrivateRoute>} />
             <Route path="/projects/:id" element={
              <PrivateRoute><ProjectDetails /></PrivateRoute>
            } />
             <Route path="/issues/:id" element={
              <PrivateRoute><IssueDetails /></PrivateRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
