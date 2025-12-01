import React from 'react'
import { Navigate } from 'react-router-dom'
import Navbar from './Navbar'

function ProtectedRoute({ user, onLogout, children }) {
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="app-container">
        {children}
      </div>
    </>
  )
}

export default ProtectedRoute

