# AI Resume Analyzer

A powerful AI-powered tool that helps job seekers optimize their resumes for specific job positions by providing detailed analysis and actionable insights.

## Project Purpose

The AI Resume Analyzer solves the critical problem of resume-job mismatch that many job seekers face. Traditional resume reviews are subjective and time-consuming, while ATS (Applicant Tracking Systems) automatically filter out resumes that don't meet specific criteria. Our tool bridges this gap by:

- **Objective Analysis**: Uses machine learning to provide unbiased resume scoring
- **ATS Optimization**: Ensures resumes pass automated screening systems
- **Skill Gap Identification**: Highlights missing skills for target positions
- **Market Insights**: Provides real-time job market data and salary expectations

## How It Solves the Problem

### For Job Seekers
- **Instant Feedback**: Get comprehensive resume analysis in seconds instead of waiting for human reviewers
- **Data-Driven Insights**: Understand exactly how your resume performs against job requirements
- **Actionable Recommendations**: Receive specific suggestions to improve your resume
- **Competitive Advantage**: Stand out with optimized resumes tailored to specific roles

### For Recruiters
- **Better Matches**: Receive resumes that are properly aligned with job requirements
- **Reduced Screening Time**: More qualified candidates pass initial screening
- **Higher Quality Hires**: Better job-fit leads to improved retention rates

## Tech Stack

### Backend
- **Flask** (Python): Lightweight web framework for API development
- **scikit-learn**: Machine learning algorithms for resume analysis and skill matching
- **PDFPlumber**: Advanced PDF text extraction and parsing
- **Requests**: HTTP client for external API integrations

### Frontend
- **React**: Modern JavaScript framework for interactive user interface
- **Vite**: Fast development server and build tool
- **TailwindCSS**: Utility-first CSS framework for responsive design
- **Framer Motion**: Smooth animations and transitions
- **jsPDF**: Client-side PDF generation for report downloads

## Key Features

- **Resume Analysis**: Upload PDF resume + job title for comprehensive scoring (0-100)
- **Skill Gap Analysis**: Visual comparison showing matched vs missing skills
- **Learning Recommendations**: Prioritized skill development paths with online learning platforms
- **Market Insights**: Real-time salary ranges, demand scores, and trending skills
- **Resume Comparison**: Compare two resumes for the same position
- **PDF Reports**: Download detailed analysis reports for sharing

## Quick Start

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m app.main
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```



## Impact

The AI Resume Analyzer transforms the job application process by replacing guesswork with data-driven insights, helping job seekers create resumes that actually work with modern hiring systems while saving recruiters valuable screening time.
