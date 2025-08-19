import React from 'react'
import { Users, Zap, Search } from 'lucide-react'

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Users className="logo-icon" />
          <h1>Dream Team Builder</h1>
        </div>
        <div className="header-subtitle">
          <Zap className="subtitle-icon" />
          <p>Torre API Technical Test - Full-Stack Engineer Position</p>
        </div>
      </div>
      <div className="header-description">
        <Search className="description-icon" />
        <p>Search for talented professionals, analyze their skills, and build your dream team using Torre's powerful API</p>
      </div>
    </header>
  )
}

export default Header