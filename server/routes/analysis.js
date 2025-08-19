const express = require('express');
const router = express.Router();
const torreService = require('../services/torreService');

/**
 * API Analysis endpoint - Reverse engineer Torre API
 * GET /api/analysis/torre-api
 */
router.get('/torre-api', async (req, res) => {
  try {
    const apiAnalysis = {
      title: "Torre API Analysis - Reverse Engineering Results",
      timestamp: new Date().toISOString(),
      endpoints: [
        {
          name: "People Search Stream",
          method: "POST",
          url: "https://torre.ai/api/entities/_searchStream",
          description: "Searches for people and organizations using streaming responses",
          requestFormat: {
            query: "string (required) - Search term",
            filters: {
              excludeContacts: "boolean - Exclude contacts from results",
              excludeProspects: "boolean - Exclude prospects from results", 
              offset: "number - Pagination offset (default: 0)",
              limit: "number - Results limit (default: 20)"
            },
            meta: "boolean - Include metadata in response"
          },
          responseFormat: {
            type: "NDJSON (Newline Delimited JSON)",
            structure: "Stream of JSON objects with data arrays",
            fields: {
              data: "Array of people/organization objects",
              person: {
                username: "string - Unique username",
                name: "string - Full name",
                professionalHeadline: "string - Professional title",
                location: "object - Location details",
                verified: "boolean - Verification status"
              }
            }
          },
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "Browser identification"
          },
          exampleRequest: {
            query: "Alexander Torrenegra",
            filters: {
              excludeContacts: false,
              excludeProspects: false,
              offset: 0,
              limit: 20
            },
            meta: false
          }
        },
        {
          name: "User Genome",
          method: "GET", 
          url: "https://torre.ai/api/genome/bios/:username",
          description: "Retrieves detailed genome information for a specific user",
          parameters: {
            username: "string (required) - Torre username"
          },
          responseFormat: {
            type: "JSON",
            structure: "Complete user profile with skills, experience, and preferences",
            fields: {
              person: "Basic user information",
              strengths: "Array of skills with weights and recommendations",
              experiences: "Professional experience history",
              interests: "User interests and preferences",
              languages: "Known languages with fluency levels",
              education: "Educational background",
              awards: "Awards and recognitions"
            }
          },
          headers: {
            "Accept": "application/json",
            "User-Agent": "Browser identification"
          },
          exampleResponse: {
            person: {
              username: "example-user",
              name: "Example User",
              professionalHeadline: "Software Engineer",
              location: {
                name: "San Francisco, CA"
              }
            },
            strengths: [
              {
                name: "JavaScript",
                code: "javascript",
                weight: 95,
                recommendations: 15
              }
            ]
          }
        }
      ],
      analysisNotes: [
        "Torre API uses streaming responses for search to handle large result sets efficiently",
        "Authentication appears to be optional for public data access",
        "Rate limiting may apply but not explicitly documented",
        "Response formats are consistent and well-structured",
        "CORS is enabled for cross-origin requests"
      ],
      securityConsiderations: [
        "No API key required for basic searches",
        "User data appears to be publicly accessible",
        "Recommend implementing rate limiting on our side",
        "Consider caching responses to reduce API load"
      ]
    };

    res.json({
      success: true,
      analysis: apiAnalysis
    });
  } catch (error) {
    console.error('API analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to generate API analysis',
      message: error.message 
    });
  }
});

/**
 * Team building analysis endpoint
 * POST /api/analysis/build-team
 */
router.post('/build-team', async (req, res) => {
  try {
    const { usernames, requirements } = req.body;
    
    if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
      return res.status(400).json({ error: 'Array of usernames is required' });
    }

    // Analyze each team member
    const teamAnalysis = [];
    for (const username of usernames) {
      try {
        const profile = await torreService.analyzeUserProfile(username);
        teamAnalysis.push(profile);
      } catch (error) {
        console.warn(`Failed to analyze ${username}:`, error.message);
        teamAnalysis.push({
          username,
          error: error.message
        });
      }
    }

    // Aggregate team skills and strengths
    const teamSkills = {};
    const teamStrengths = {};
    const teamLanguages = new Set();

    teamAnalysis.forEach(member => {
      if (member.skills) {
        member.skills.forEach(skill => {
          if (!teamSkills[skill.name]) {
            teamSkills[skill.name] = [];
          }
          teamSkills[skill.name].push({
            username: member.username,
            weight: skill.weight
          });
        });
      }

      if (member.strengths) {
        member.strengths.forEach(strength => {
          if (!teamStrengths[strength.name]) {
            teamStrengths[strength.name] = [];
          }
          teamStrengths[strength.name].push({
            username: member.username,
            weight: strength.weight
          });
        });
      }

      if (member.languages) {
        member.languages.forEach(lang => {
          teamLanguages.add(lang.language);
        });
      }
    });

    const analysis = {
      teamMembers: teamAnalysis,
      teamSkillsCoverage: Object.keys(teamSkills).map(skill => ({
        skill,
        coverage: teamSkills[skill],
        avgWeight: teamSkills[skill].reduce((sum, member) => sum + (member.weight || 0), 0) / teamSkills[skill].length
      })).sort((a, b) => b.avgWeight - a.avgWeight),
      teamStrengths: Object.keys(teamStrengths).map(strength => ({
        strength,
        members: teamStrengths[strength],
        avgWeight: teamStrengths[strength].reduce((sum, member) => sum + (member.weight || 0), 0) / teamStrengths[strength].length
      })).sort((a, b) => b.avgWeight - a.avgWeight),
      languageCoverage: Array.from(teamLanguages),
      recommendations: generateTeamRecommendations(teamAnalysis, requirements)
    };

    res.json({
      success: true,
      teamAnalysis: analysis
    });
  } catch (error) {
    console.error('Team analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze team',
      message: error.message 
    });
  }
});

function generateTeamRecommendations(teamAnalysis, requirements) {
  const recommendations = [];
  
  // Check for skill gaps
  const allSkills = new Set();
  teamAnalysis.forEach(member => {
    if (member.skills) {
      member.skills.forEach(skill => allSkills.add(skill.name));
    }
  });

  if (requirements && requirements.requiredSkills) {
    requirements.requiredSkills.forEach(requiredSkill => {
      if (!allSkills.has(requiredSkill)) {
        recommendations.push({
          type: 'skill_gap',
          message: `Consider adding team member with ${requiredSkill} expertise`,
          priority: 'high'
        });
      }
    });
  }

  // Check team size
  if (teamAnalysis.length < 3) {
    recommendations.push({
      type: 'team_size',
      message: 'Consider expanding team size for better skill coverage',
      priority: 'medium'
    });
  }

  // Check for diverse experience levels
  const experienceLevels = teamAnalysis.map(m => m.experience?.length || 0);
  const avgExperience = experienceLevels.reduce((sum, exp) => sum + exp, 0) / experienceLevels.length;
  
  if (avgExperience < 2) {
    recommendations.push({
      type: 'experience',
      message: 'Consider adding more experienced team members',
      priority: 'medium'
    });
  }

  return recommendations;
}

module.exports = router;