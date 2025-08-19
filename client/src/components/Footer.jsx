import React from 'react'
import { Github, ExternalLink, Code, Video } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Dream Team Builder</h4>
          <p>Torre API Technical Test - Full-Stack Engineering Position</p>
          <p>Built with React, Node.js, and Torre API integration</p>
        </div>
        
        <div className="footer-section">
          <h4>Features</h4>
          <ul>
            <li>People Search with Torre API</li>
            <li>Real-time Profile Analysis</li>
            <li>Team Building & Recommendations</li>
            <li>API Reverse Engineering</li>
            <li>Responsive Design</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Resources</h4>
          <div className="footer-links">
            <a href="https://torre.ai" target="_blank" rel="noopener noreferrer">
              <ExternalLink size={16} />
              Torre.ai
            </a>
            <a href="https://github.com/swyamsingh/dream-team-builder" target="_blank" rel="noopener noreferrer">
              <Github size={16} />
              Source Code
            </a>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <Video size={16} />
              Demo Video
            </a>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <Code size={16} />
              API Documentation
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 Dream Team Builder. Created for Torre Engineering Technical Test.</p>
        <p>Showcasing creativity, technical skills, and API integration capabilities.</p>
      </div>
    </footer>
  )
}

export default Footer