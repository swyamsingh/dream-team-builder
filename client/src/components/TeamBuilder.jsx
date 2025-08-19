import React, { useState, useEffect } from 'react'
import { Users, X, Eye, BarChart3, Star, MapPin, Loader } from 'lucide-react'
import { analyzeTeam, getUserProfile } from '../services/torreAPI'

const TeamBuilder = ({ teamMembers, onRemoveFromTeam }) => {
  const [teamAnalysis, setTeamAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [memberProfile, setMemberProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const handleAnalyzeTeam = async () => {
    if (teamMembers.length === 0) return
    
    setLoading(true)
    try {
      const usernames = teamMembers.map(member => member.username)
      const analysis = await analyzeTeam(usernames)
      setTeamAnalysis(analysis)
    } catch (error) {
      console.error('Team analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewProfile = async (username) => {
    setSelectedMember(username)
    setProfileLoading(true)
    try {
      const profile = await getUserProfile(username)
      setMemberProfile(profile)
    } catch (error) {
      console.error('Profile fetch failed:', error)
      setMemberProfile({ error: error.message })
    } finally {
      setProfileLoading(false)
    }
  }

  const closeProfileModal = () => {
    setSelectedMember(null)
    setMemberProfile(null)
  }

  useEffect(() => {
    if (teamMembers.length > 0) {
      handleAnalyzeTeam()
    } else {
      setTeamAnalysis(null)
    }
  }, [teamMembers])

  return (
    <section className="team-builder">
      <div className="team-header">
        <h2>Your Dream Team</h2>
        <p>Build and analyze your perfect team composition</p>
      </div>

      {teamMembers.length === 0 ? (
        <div className="empty-team">
          <Users className="empty-icon" />
          <h3>No team members yet</h3>
          <p>Start by searching for professionals and adding them to your team</p>
        </div>
      ) : (
        <div className="team-content">
          <div className="team-members">
            <h3>Team Members ({teamMembers.length})</h3>
            <div className="members-grid">
              {teamMembers.map((member) => (
                <div key={member.username} className="team-member-card">
                  <div className="member-header">
                    <div className="member-info">
                      <h4>{member.name}</h4>
                      <p className="username">@{member.username}</p>
                    </div>
                    <button
                      onClick={() => onRemoveFromTeam(member.username)}
                      className="remove-button"
                      title="Remove from team"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  {member.professionalHeadline && (
                    <p className="professional-headline">{member.professionalHeadline}</p>
                  )}
                  
                  {member.location && (
                    <div className="location">
                      <MapPin className="location-icon" />
                      <span>{member.location.name}</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleViewProfile(member.username)}
                    className="view-profile-button"
                  >
                    <Eye size={16} />
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="team-analysis">
            <div className="analysis-header">
              <BarChart3 className="analysis-icon" />
              <h3>Team Analysis</h3>
              {loading && <Loader className="spinning" />}
            </div>
            
            {teamAnalysis && (
              <div className="analysis-content">
                {teamAnalysis.teamSkillsCoverage && teamAnalysis.teamSkillsCoverage.length > 0 && (
                  <div className="skills-section">
                    <h4>Top Team Skills</h4>
                    <div className="skills-list">
                      {teamAnalysis.teamSkillsCoverage.slice(0, 10).map((skill, index) => (
                        <div key={skill.skill} className="skill-item">
                          <span className="skill-name">{skill.skill}</span>
                          <div className="skill-coverage">
                            <div className="coverage-bar">
                              <div 
                                className="coverage-fill" 
                                style={{ width: `${Math.min(skill.avgWeight, 100)}%` }}
                              ></div>
                            </div>
                            <span className="coverage-text">{skill.coverage.length} member(s)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {teamAnalysis.recommendations && teamAnalysis.recommendations.length > 0 && (
                  <div className="recommendations-section">
                    <h4>Recommendations</h4>
                    <div className="recommendations-list">
                      {teamAnalysis.recommendations.map((rec, index) => (
                        <div key={index} className={`recommendation ${rec.priority}`}>
                          <Star className="rec-icon" />
                          <span>{rec.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {teamAnalysis.languageCoverage && teamAnalysis.languageCoverage.length > 0 && (
                  <div className="languages-section">
                    <h4>Language Coverage</h4>
                    <div className="languages-list">
                      {teamAnalysis.languageCoverage.map((language, index) => (
                        <span key={index} className="language-tag">{language}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {selectedMember && (
        <div className="modal-overlay" onClick={closeProfileModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Profile: @{selectedMember}</h3>
              <button onClick={closeProfileModal} className="close-button">
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {profileLoading ? (
                <div className="loading-profile">
                  <Loader className="spinning" />
                  <p>Loading profile...</p>
                </div>
              ) : memberProfile ? (
                memberProfile.error ? (
                  <div className="profile-error">
                    <p>Error loading profile: {memberProfile.error}</p>
                  </div>
                ) : (
                  <div className="profile-details">
                    <div className="profile-basic">
                      <h4>{memberProfile.name}</h4>
                      <p className="professional-headline">{memberProfile.professionalHeadline}</p>
                      {memberProfile.location && (
                        <p className="location">
                          <MapPin size={16} />
                          {memberProfile.location.name}
                        </p>
                      )}
                    </div>

                    {memberProfile.skills && memberProfile.skills.length > 0 && (
                      <div className="profile-skills">
                        <h5>Top Skills</h5>
                        <div className="skills-grid">
                          {memberProfile.skills.slice(0, 12).map((skill, index) => (
                            <div key={index} className="skill-badge">
                              <span className="skill-name">{skill.name}</span>
                              {skill.weight && (
                                <span className="skill-weight">{Math.round(skill.weight)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {memberProfile.experience && memberProfile.experience.length > 0 && (
                      <div className="profile-experience">
                        <h5>Recent Experience</h5>
                        <div className="experience-list">
                          {memberProfile.experience.slice(0, 5).map((exp, index) => (
                            <div key={index} className="experience-item">
                              <p className="exp-name">{exp.name}</p>
                              <p className="exp-category">{exp.category}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              ) : null}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default TeamBuilder