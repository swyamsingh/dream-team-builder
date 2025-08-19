import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import SearchSection from './components/SearchSection'
import APIAnalysis from './components/APIAnalysis'
import TeamBuilder from './components/TeamBuilder'
import Footer from './components/Footer'

function App() {
  const [activeSection, setActiveSection] = useState('search')
  const [searchResults, setSearchResults] = useState([])
  const [teamMembers, setTeamMembers] = useState([])

  const handleAddToTeam = (person) => {
    if (!teamMembers.find(member => member.username === person.username)) {
      setTeamMembers([...teamMembers, person])
    }
  }

  const handleRemoveFromTeam = (username) => {
    setTeamMembers(teamMembers.filter(member => member.username !== username))
  }

  return (
    <div className="App">
      <Header />
      
      <nav className="nav-tabs">
        <button 
          className={activeSection === 'search' ? 'active' : ''}
          onClick={() => setActiveSection('search')}
        >
          People Search
        </button>
        <button 
          className={activeSection === 'team' ? 'active' : ''}
          onClick={() => setActiveSection('team')}
        >
          Team Builder ({teamMembers.length})
        </button>
        <button 
          className={activeSection === 'analysis' ? 'active' : ''}
          onClick={() => setActiveSection('analysis')}
        >
          API Analysis
        </button>
      </nav>

      <main className="main-content">
        {activeSection === 'search' && (
          <SearchSection 
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            onAddToTeam={handleAddToTeam}
            teamMembers={teamMembers}
          />
        )}
        
        {activeSection === 'team' && (
          <TeamBuilder 
            teamMembers={teamMembers}
            onRemoveFromTeam={handleRemoveFromTeam}
          />
        )}
        
        {activeSection === 'analysis' && (
          <APIAnalysis />
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
