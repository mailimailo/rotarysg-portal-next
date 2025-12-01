import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

function Navbar({ user, onLogout }) {
  const location = useLocation()

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/">🔄 Rotary Portal</Link>
          <span className="navbar-subtitle">St.Gallen 2026-2027</span>
        </div>
        
        <div className="navbar-menu">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            Dashboard
          </Link>
          <Link 
            to="/lunches" 
            className={location.pathname === '/lunches' ? 'active' : ''}
          >
            Lunches
          </Link>
          <Link 
            to="/speakers" 
            className={location.pathname === '/speakers' ? 'active' : ''}
          >
            Speaker
          </Link>
          <Link 
            to="/calendar" 
            className={location.pathname === '/calendar' ? 'active' : ''}
          >
            Kalender
          </Link>
          <Link 
            to="/speaker-requests" 
            className={location.pathname === '/speaker-requests' ? 'active' : ''}
          >
            Speaker anfragen
          </Link>
        </div>
        
        <div className="navbar-user">
          <span>👤 {user?.username}</span>
          <button onClick={onLogout} className="btn-logout">Abmelden</button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

