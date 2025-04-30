import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <nav style={{ background: '#eee', padding: '10px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Link to="/" style={{ marginRight: '15px', textDecoration: 'none', color: '#333' }}>EMR Home</Link>
        {user && (
          <>
             {/* Common Links */}
            <Link to="/patients" style={{ marginRight: '15px', textDecoration: 'none', color: '#333' }}>Patients</Link>
            <Link to="/schedule" style={{ marginRight: '15px', textDecoration: 'none', color: '#333' }}>Schedule</Link>

             {/* Admin Only Links */}
            {user.role === 'admin' && (
              <>
                <Link to="/users" style={{ marginRight: '15px', textDecoration: 'none', color: '#333' }}>Users</Link>
                <Link to="/settings" style={{ marginRight: '15px', textDecoration: 'none', color: '#333' }}>Settings</Link>
              </>
            )}
          </>
        )}
      </div>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: '15px' }}>Welcome, {user.username} ({user.role})</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">
            <button>Login</button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;