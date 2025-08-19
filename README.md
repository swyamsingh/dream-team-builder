# Dream Team Builder

> Torre API Technical Test - Full-Stack Product Engineer Position

A modern full-stack application for searching professionals and building dream teams using Torre's powerful API. This project demonstrates creativity, technical skills, and comprehensive API integration capabilities.

## 🌟 Features

- **People Search**: Real-time search using Torre's streaming API
- **Profile Analysis**: Detailed skill and experience analysis
- **Team Building**: Build and analyze team compositions
- **Skill Gap Analysis**: Identify missing skills and get recommendations
- **API Documentation**: Comprehensive reverse engineering documentation
- **Responsive Design**: Modern UI that works on all devices
- **Real-time Updates**: Streaming API integration for instant results

## 🚀 Live Demo

- **Production URL**: [Deploy URL will be here]
- **Demo Video**: [Video link will be here]

## 🏗️ Architecture

### Frontend (React + Vite)
- Modern React with hooks and state management
- Vite for fast development and building
- Lucide React for consistent icons
- Axios for API communication
- Responsive CSS with CSS Grid and Flexbox

### Backend (Node.js + Express)
- RESTful API design
- Torre API integration with error handling
- Streaming API support for real-time search
- Comprehensive team analysis algorithms
- Health checks and monitoring

### API Integration
- POST `/api/entities/_searchStream` - People search with streaming
- GET `/api/genome/bios/:username` - User genome and profile data
- Custom analysis endpoints for team building

## 📋 Requirements Met

- ✅ **People Search**: Implemented with Torre's streaming API
- ✅ **Additional Features**: Team building, skill analysis, API documentation
- ✅ **Creativity**: Unique team analysis and recommendation system
- ✅ **Code Quality**: Clean, modular, and well-documented code
- ✅ **UI/UX**: Modern, responsive design with excellent usability
- ✅ **API Analysis**: Comprehensive reverse engineering documentation

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start
```bash
# Clone the repository
git clone https://github.com/swyamsingh/dream-team-builder.git
cd dream-team-builder

# Install all dependencies
npm run install:all

# Start development servers (both frontend and backend)
npm run dev
```

### Manual Setup
```bash
# Install root dependencies
npm install

# Setup backend
cd server
npm install
npm run dev

# Setup frontend (in new terminal)
cd client
npm install
npm run dev
```

## 📡 API Endpoints

### Torre Integration
- `POST /api/torre/search` - Search for people
- `GET /api/torre/genome/:username` - Get user genome
- `GET /api/torre/profile/:username` - Get analyzed profile

### Analysis Features  
- `POST /api/analysis/build-team` - Analyze team composition
- `GET /api/analysis/torre-api` - API documentation

### Health & Monitoring
- `GET /health` - Service health check

## 🎯 Usage Examples

### Search for Professionals
```javascript
// Search for JavaScript developers
const results = await searchPeople("JavaScript developer", {
  limit: 20,
  filters: { excludeContacts: false }
});
```

### Build and Analyze Teams
```javascript
// Analyze team skills and get recommendations
const analysis = await analyzeTeam([
  "alexander-torrenegra",
  "john-doe", 
  "jane-smith"
], {
  requiredSkills: ["React", "Node.js", "Python"]
});
```

## 🔍 Torre API Analysis

This project includes comprehensive reverse engineering of Torre's API:

### People Search Stream API
- **Endpoint**: `POST https://torre.ai/api/entities/_searchStream`
- **Response**: NDJSON (Newline Delimited JSON) streaming
- **Features**: Real-time search with pagination and filtering

### User Genome API  
- **Endpoint**: `GET https://torre.ai/api/genome/bios/:username`
- **Data**: Complete professional profiles with skills, experience, and preferences
- **Analysis**: Automated skill extraction and weight calculation

## 🏁 Project Structure

```
dream-team-builder/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API integration
│   │   └── utils/         # Helper functions
├── server/                # Node.js backend  
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── utils/            # Server utilities
├── docs/                 # Documentation
└── package.json          # Root package configuration
```

## 🧪 Testing

```bash
# Run frontend tests
cd client && npm test

# Run backend tests  
cd server && npm test

# Run all tests
npm test
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Start production server
npm run server:start
```

### Environment Variables
```bash
# Client (.env.development)
VITE_API_URL=http://localhost:3001

# Server (.env)
PORT=3001
NODE_ENV=production
```

## 🤖 AI/LLM Usage Documentation

All AI prompts and tools used in this project are documented in `/docs/ai-prompts.md`:

### Tools Used:
- **GitHub Copilot**: Code completion and suggestions
- **Claude**: Architecture planning and code review
- **ChatGPT**: API analysis and documentation

### Key Prompts:
1. Torre API reverse engineering and analysis
2. React component architecture design
3. Node.js API integration patterns
4. CSS styling and responsive design

## 📊 Technical Highlights

### Performance Optimizations
- Vite for fast development builds
- React component optimization with proper state management
- API response caching and error handling
- Debounced search inputs

### Security Considerations
- Input validation and sanitization
- CORS configuration
- Rate limiting considerations
- Environment variable protection

### Code Quality
- ESLint and Prettier configuration
- Component-based architecture
- Separation of concerns
- Comprehensive error handling

## 🎨 Design Decisions

### UI/UX Choices
- Modern card-based layouts for better content organization
- Intuitive navigation with clear visual hierarchy
- Responsive design that works on mobile, tablet, and desktop
- Loading states and error handling for better user experience

### Technical Choices
- React with hooks for modern state management
- Express.js for lightweight backend API
- Axios for reliable API communication
- CSS Grid and Flexbox for responsive layouts

## 🔮 Future Enhancements

- [ ] Advanced filtering and sorting options
- [ ] Data visualization with charts and graphs
- [ ] User authentication and team saving
- [ ] Integration with more professional networks
- [ ] AI-powered team recommendations
- [ ] Export functionality for team reports

## 📝 Documentation

- [API Documentation](./docs/api.md)
- [AI Prompts Used](./docs/ai-prompts.md)
- [Development Guide](./docs/development.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

This is a technical test project, but feedback and suggestions are welcome!

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

**Dream Team Builder Development Team**
- Technical Test for Torre Engineering Position
- Demonstrating full-stack development capabilities
- Focus on creativity, code quality, and user experience

---

> Built with ❤️ for Torre's Technical Test - Showcasing modern full-stack development with React, Node.js, and Torre API integration.