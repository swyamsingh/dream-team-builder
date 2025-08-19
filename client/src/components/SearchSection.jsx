import React, { useState } from 'react'
import { Search, User, MapPin, Plus, CheckCircle, Loader } from 'lucide-react'
import { searchPeople } from '../services/torreAPI'

const SearchSection = ({ searchResults, setSearchResults, onAddToTeam, teamMembers }) => {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) {
      setError('Please enter a search term')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const results = await searchPeople(query)
      setSearchResults(results)
      
      if (results.length === 0) {
        setError('No results found. Try a different search term.')
      }
    } catch (err) {
      setError(`Search failed: ${err.message}`)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const isInTeam = (username) => {
    return teamMembers.some(member => member.username === username)
  }

  return (
    <section className="search-section">
      <div className="search-header">
        <h2>Search for Professionals</h2>
        <p>Find talented individuals using Torre's comprehensive database</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <Search className="search-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for names, skills, or companies..."
            className="search-input"
          />
          <button type="submit" disabled={loading} className="search-button">
            {loading ? <Loader className="spinning" /> : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="search-results">
          <div className="results-header">
            <h3>Search Results ({searchResults.length})</h3>
            <p>Click "Add to Team" to build your dream team</p>
          </div>
          
          <div className="results-grid">
            {searchResults.map((person, index) => (
              <div key={person.username || index} className="person-card">
                <div className="person-header">
                  <User className="person-icon" />
                  <div className="person-info">
                    <h4>{person.name || 'Unknown Name'}</h4>
                    <p className="username">@{person.username}</p>
                  </div>
                </div>
                
                {person.professionalHeadline && (
                  <p className="professional-headline">{person.professionalHeadline}</p>
                )}
                
                {person.location && (
                  <div className="location">
                    <MapPin className="location-icon" />
                    <span>{person.location.name}</span>
                  </div>
                )}
                
                <div className="person-actions">
                  <button
                    onClick={() => onAddToTeam(person)}
                    disabled={isInTeam(person.username)}
                    className={`add-button ${isInTeam(person.username) ? 'added' : ''}`}
                  >
                    {isInTeam(person.username) ? (
                      <>
                        <CheckCircle size={16} />
                        Added to Team
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Add to Team
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default SearchSection