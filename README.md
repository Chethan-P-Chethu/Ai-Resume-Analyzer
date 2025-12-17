# AI Resume Analyzer

A powerful AI-powered resume analysis tool that helps job seekers optimize their resumes for specific job positions. Get detailed feedback on skills, keywords, ATS compatibility, and market insights.

## Features

### 🎯 Core Analysis
- **Resume Analysis**: Upload PDF resume + job title for comprehensive analysis
- **ATS Score**: Get match score (0-100) for job compatibility
- **Skill Gap Analysis**: Visual comparison of matched vs missing skills
- **Learning Recommendations**: Prioritized suggestions with online learning platforms
- **Market Insights**: Salary ranges, demand scores, trending skills

### 📊 Analysis Tabs
- **Overview**: Overall score and assessment
- **Skills**: Matched skills and coverage percentage
- **Keywords**: Relevant keywords for ATS optimization
- **Sections**: Resume structure analysis
- **Market Insights**: Real-time job market data
- **Skill Gap**: Detailed gap analysis with learning paths
- **Suggestions**: Actionable improvement recommendations

### 🚀 Advanced Features
- **Resume Comparison**: Compare two resumes for the same job
- **PDF Export**: Download comprehensive analysis reports
- **50+ Job Roles**: Pre-configured skill requirements
- **Real-time Data**: Market trends and salary insights

## Tech Stack

### Backend
- **Flask**: Python web framework
- **scikit-learn**: Machine learning for analysis
- **PDFPlumber**: Resume text extraction
- **Job Market API**: Mock market data with caching

### Frontend
- **React**: Modern UI framework
- **Vite**: Fast development server
- **TailwindCSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **jsPDF**: Client-side PDF generation

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd "AI Resume Analyzer"
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m app.main
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://127.0.0.1:8000

## Usage

### Analyze a Resume
1. Enter target job title (e.g., "Data Scientist", "Software Engineer")
2. Upload PDF resume file
3. Click "Analyze Resume"
4. Review detailed analysis across all tabs
5. Download PDF report for sharing

### Compare Resumes
1. Navigate to "Compare" feature
2. Enter target job title
3. Upload two PDF resumes
4. Click "Compare Resumes"
5. See side-by-side comparison with winner declaration

### Skill Gap Analysis
- View visual skill coverage percentage
- See critical vs important missing skills
- Get prioritized learning recommendations
- Access online learning platform suggestions

## Project Structure

```
AI Resume Analyzer/
├── backend/
│   ├── app/
│   │   ├── analyzer.py          # Core analysis engine
│   │   ├── job_market_api.py   # Market data API
│   │   ├── main.py             # Flask app entry point
│   │   ├── models.py           # Data models
│   │   └── roles.py            # Job role definitions
│   └── requirements.txt         # Python dependencies
└── frontend/
    ├── src/
    │   ├── components/          # React components
    │   ├── utils/              # Utility functions
    │   ├── App.jsx             # Main app component
    │   └── api.js              # API client
    ├── package.json             # Node.js dependencies
    └── vite.config.js           # Vite configuration
```

## API Endpoints

### POST `/api/analyze`
Analyzes a single resume against job title.

**Request:**
```json
{
  "file": "resume.pdf",
  "job_title": "Data Scientist"
}
```

**Response:**
```json
{
  "job_title": "Data Scientist",
  "overall_score": 75,
  "scores": {
    "similarity": 80,
    "skills": 70,
    "keywords": 75,
    "sections": 80
  },
  "skill_gap_analysis": {
    "skill_coverage_percentage": 65.5,
    "matched_skills": ["Python", "SQL", "Machine Learning"],
    "missing_skills": {
      "critical": ["AWS", "Docker"],
      "important": ["Kubernetes"],
      "nice_to_have": ["TensorFlow"]
    },
    "learning_recommendations": [...]
  },
  "market_insights": {
    "demand_score": 85,
    "salary_range": {"min": 85000, "max": 135000},
    "trending_skills": ["Python", "AWS", "Docker"]
  }
}
```

### POST `/api/compare`
Compares two resumes for the same job title.

**Request:**
```json
{
  "file1": "resume1.pdf",
  "file2": "resume2.pdf", 
  "job_title": "Software Engineer"
}
```

## Configuration

### Environment Variables
- No environment variables required for basic functionality

### Customization

### Adding New Job Roles
Edit `backend/app/roles.py` to add new job roles with specific skills and requirements.

### Modifying Analysis Weights
Update scoring algorithms in `backend/app/analyzer.py` to adjust analysis priorities.

## Development

### Running Tests
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests  
cd frontend
npm test
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build

# Backend deployment
# Use WSGI server like Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app.main:app
```

## Troubleshooting

### Common Issues

**"Failed to fetch" error**
- Ensure backend is running on http://127.0.0.1:8000
- Check CORS configuration
- Verify API endpoint is accessible

**PDF upload issues**
- Ensure PDF is not password protected
- Check file size limits
- Verify PDF contains text content

**Missing dependencies**
```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with clear commit messages
4. Test thoroughly
5. Submit pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please create an issue in the repository.

---

**AI Resume Analyzer** - Optimize your resume with AI-powered insights and land your dream job! 🚀
