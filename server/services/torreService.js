const axios = require('axios');

class TorreAPIService {
  constructor() {
    this.baseURL = 'https://torre.ai/api';
    this.searchStreamURL = `${this.baseURL}/entities/_searchStream`;
    this.genomeURL = `${this.baseURL}/genome/bios`;
  }

  /**
   * Search for people and organizations using Torre's streaming API
   * Based on reverse engineering from torre.ai network requests
   */
  async searchPeople(query, options = {}) {
    try {
      const payload = {
        query,
        filters: {
          excludeContacts: false,
          excludeProspects: false,
          offset: options.offset || 0,
          limit: options.limit || 20,
          ...options.filters
        },
        meta: false
      };

      const response = await axios.post(this.searchStreamURL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Dream Team Builder API'
        },
        timeout: 10000
      });

      return this.parseStreamResponse(response.data);
    } catch (error) {
      console.error('Error searching people:', error.message);
      throw new Error(`Torre API search failed: ${error.message}`);
    }
  }

  /**
   * Get genome information for a specific user
   */
  async getUserGenome(username) {
    try {
      const response = await axios.get(`${this.genomeURL}/${username}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Dream Team Builder API'
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching genome for ${username}:`, error.message);
      if (error.response?.status === 404) {
        throw new Error(`User ${username} not found`);
      }
      throw new Error(`Torre API genome fetch failed: ${error.message}`);
    }
  }

  /**
   * Parse streaming response from Torre API
   * The API returns NDJSON (newline-delimited JSON)
   */
  parseStreamResponse(data) {
    if (typeof data === 'string') {
      const lines = data.split('\n').filter(line => line.trim());
      const results = [];
      
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.data) {
            results.push(...parsed.data);
          }
        } catch (e) {
          console.warn('Failed to parse line:', line);
        }
      }
      
      return results;
    }
    
    return data.data || data;
  }

  /**
   * Analyze a user's skills and experience
   */
  async analyzeUserProfile(username) {
    try {
      const genome = await this.getUserGenome(username);
      
      const analysis = {
        username: genome.person?.username || username,
        name: genome.person?.name,
        professionalHeadline: genome.person?.professionalHeadline,
        location: genome.person?.location,
        skills: this.extractSkills(genome),
        experience: this.extractExperience(genome),
        strengths: this.extractStrengths(genome),
        interests: this.extractInterests(genome),
        languages: this.extractLanguages(genome)
      };

      return analysis;
    } catch (error) {
      console.error(`Error analyzing profile for ${username}:`, error.message);
      throw error;
    }
  }

  extractSkills(genome) {
    const skills = genome.strengths?.filter(s => s.code && s.name) || [];
    return skills.map(skill => ({
      name: skill.name,
      code: skill.code,
      weight: skill.weight,
      recommendations: skill.recommendations
    }));
  }

  extractExperience(genome) {
    const experience = genome.experiences || [];
    return experience.map(exp => ({
      id: exp.id,
      category: exp.category,
      name: exp.name,
      organizations: exp.organizations,
      fromMonth: exp.fromMonth,
      fromYear: exp.fromYear,
      toMonth: exp.toMonth,
      toYear: exp.toYear,
      highlighted: exp.highlighted
    }));
  }

  extractStrengths(genome) {
    return genome.strengths?.map(s => ({
      name: s.name,
      weight: s.weight,
      recommendations: s.recommendations
    })) || [];
  }

  extractInterests(genome) {
    return genome.interests?.map(i => ({
      name: i.name,
      code: i.code
    })) || [];
  }

  extractLanguages(genome) {
    return genome.languages?.map(l => ({
      language: l.language,
      fluency: l.fluency,
      code: l.code
    })) || [];
  }
}

module.exports = new TorreAPIService();