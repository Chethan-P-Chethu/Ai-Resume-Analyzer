import json
import requests
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import os


@dataclass
class JobMarketData:
    title: str
    demand_score: float
    salary_range: Dict[str, int]
    trending_skills: List[str]
    growth_rate: float
    market_insights: List[str]


class JobMarketAPI:
    """Integration with job market APIs for real-time skill trends and insights"""
    
    def __init__(self):
        self.cache = {}
        self.cache_duration = timedelta(hours=1)  # Cache for 1 hour instead of 24
        
    def _get_from_cache(self, job_title: str) -> Optional[JobMarketData]:
        """Get cached data if available and not expired"""
        if job_title in self.cache:
            cached_data, timestamp = self.cache[job_title]
            if datetime.now() - timestamp < self.cache_duration:
                return cached_data
        return None
    
    def _cache_data(self, job_title: str, data: JobMarketData):
        """Cache job market data with timestamp"""
        self.cache[job_title] = (data, datetime.now())
    
    def get_job_market_data(self, job_title: str) -> JobMarketData:
        """Get job market data for a given job title"""
        # Normalize job title for cache key
        normalized_title = job_title.strip().lower()
        
        # Check cache first
        cached_data = self._get_from_cache(normalized_title)
        if cached_data:
            return cached_data
        
        # Generate mock data for now (can be replaced with real API calls)
        data = self._generate_mock_market_data(job_title)
        self._cache_data(normalized_title, data)
        return data
    
    def _generate_mock_market_data(self, job_title: str) -> JobMarketData:
        """Generate realistic mock job market data (replace with real API calls)"""
        job_title_lower = job_title.lower()
        
        # Specific matching for different job roles
        if "ai engineer" in job_title_lower or ("ai" in job_title_lower and "engineer" in job_title_lower):
            return JobMarketData(
                title=job_title,
                demand_score=9.2,
                salary_range={"min": 120000, "max": 200000, "median": 160000},
                trending_skills=["python", "tensorflow", "pytorch", "mlops", "kubernetes", "aws", "nlp", "computer vision"],
                growth_rate=0.34,
                market_insights=[
                    "AI roles have seen 34% growth in the past year",
                    "High demand for ML engineers in healthcare and finance",
                    "Remote work opportunities abundant in AI field",
                    "Companies investing heavily in AI infrastructure"
                ]
            )
        elif "machine learning" in job_title_lower or "ml" in job_title_lower:
            return JobMarketData(
                title=job_title,
                demand_score=9.0,
                salary_range={"min": 115000, "max": 185000, "median": 150000},
                trending_skills=["python", "scikit-learn", "tensorflow", "pytorch", "spark", "airflow", "kubeflow", "mlflow"],
                growth_rate=0.32,
                market_insights=[
                    "ML engineering roles growing 32% year-over-year",
                    "Production ML skills highly valued",
                    "AutoML and MLOps tools in high demand",
                    "Healthcare and finance sectors leading ML adoption"
                ]
            )
        elif "data scientist" in job_title_lower or "data science" in job_title_lower:
            return JobMarketData(
                title=job_title,
                demand_score=8.8,
                salary_range={"min": 110000, "max": 175000, "median": 142000},
                trending_skills=["python", "r", "statistics", "machine learning", "tableau", "sql", "jupyter", "pandas"],
                growth_rate=0.28,
                market_insights=[
                    "Data science roles growing 28% annually",
                    "Statistical analysis and ML skills essential",
                    "Business acumen increasingly important",
                    "Remote data science roles widely available"
                ]
            )
        elif "devops" in job_title_lower:
            return JobMarketData(
                title=job_title,
                demand_score=9.0,
                salary_range={"min": 110000, "max": 180000, "median": 145000},
                trending_skills=["kubernetes", "docker", "aws", "terraform", "ci/cd", "monitoring", "python", "go"],
                growth_rate=0.28,
                market_insights=[
                    "DevOps roles growing 28% year-over-year",
                    "Kubernetes skills in highest demand",
                    "Cloud certification significantly increases salary potential",
                    "Automation skills highly valued across industries"
                ]
            )
        elif "cloud architect" in job_title_lower or ("cloud" in job_title_lower and "architect" in job_title_lower):
            return JobMarketData(
                title=job_title,
                demand_score=8.9,
                salary_range={"min": 125000, "max": 190000, "median": 157000},
                trending_skills=["aws", "azure", "gcp", "terraform", "kubernetes", "serverless", "microservices", "networking"],
                growth_rate=0.30,
                market_insights=[
                    "Cloud architecture roles growing 30% annually",
                    "Multi-cloud expertise highly valued",
                    "Enterprise cloud migration driving demand",
                    "Security and cost optimization skills critical"
                ]
            )
        elif "site reliability" in job_title_lower or "sre" in job_title_lower:
            return JobMarketData(
                title=job_title,
                demand_score=8.7,
                salary_range={"min": 115000, "max": 175000, "median": 145000},
                trending_skills=["kubernetes", "monitoring", "automation", "python", "go", "aws", "prometheus", "grafana"],
                growth_rate=0.26,
                market_insights=[
                    "SRE roles growing 26% year-over-year",
                    "Observability and monitoring skills essential",
                    "Incident management expertise highly valued",
                    "Automation and reliability engineering in demand"
                ]
            )
        elif "cybersecurity" in job_title_lower or "cyber security" in job_title_lower:
            return JobMarketData(
                title=job_title,
                demand_score=8.8,
                salary_range={"min": 100000, "max": 170000, "median": 135000},
                trending_skills=["python", "cloud security", "siem", "penetration testing", "risk management", "compliance"],
                growth_rate=0.31,
                market_insights=[
                    "Cybersecurity demand up 31% due to increased threats",
                    "Cloud security skills most critical",
                    "Compliance expertise highly valued",
                    "Remote security roles becoming more common"
                ]
            )
        elif "security engineer" in job_title_lower or ("security" in job_title_lower and "engineer" in job_title_lower):
            return JobMarketData(
                title=job_title,
                demand_score=8.6,
                salary_range={"min": 105000, "max": 165000, "median": 135000},
                trending_skills=["python", "application security", "penetration testing", "cloud security", "siem", "threat modeling"],
                growth_rate=0.29,
                market_insights=[
                    "Security engineering roles growing 29% annually",
                    "Application security skills in high demand",
                    "DevSecOps practices becoming standard",
                    "Threat modeling expertise increasingly valuable"
                ]
            )
        elif "data engineer" in job_title_lower or ("data" in job_title_lower and "engineer" in job_title_lower):
            return JobMarketData(
                title=job_title,
                demand_score=8.5,
                salary_range={"min": 105000, "max": 165000, "median": 135000},
                trending_skills=["python", "sql", "spark", "aws", "airflow", "kafka", "data modeling", "etl"],
                growth_rate=0.25,
                market_insights=[
                    "Data engineering roles growing 25% annually",
                    "Big data technologies in high demand",
                    "Real-time data processing skills valued",
                    "Cloud data platforms becoming standard"
                ]
            )
        elif "frontend" in job_title_lower and ("engineer" in job_title_lower or "developer" in job_title_lower):
            return JobMarketData(
                title=job_title,
                demand_score=8.2,
                salary_range={"min": 90000, "max": 150000, "median": 120000},
                trending_skills=["javascript", "react", "typescript", "next.js", "vue", "css", "web performance", "testing"],
                growth_rate=0.18,
                market_insights=[
                    "Frontend roles growing 18% year-over-year",
                    "React and TypeScript skills essential",
                    "Web performance and accessibility increasingly important",
                    "Remote frontend development widely available"
                ]
            )
        elif "backend" in job_title_lower and ("engineer" in job_title_lower or "developer" in job_title_lower):
            return JobMarketData(
                title=job_title,
                demand_score=8.3,
                salary_range={"min": 95000, "max": 155000, "median": 125000},
                trending_skills=["python", "java", "node.js", "microservices", "aws", "docker", "sql", "apis"],
                growth_rate=0.20,
                market_insights=[
                    "Backend engineering roles growing 20% annually",
                    "Microservices and cloud skills essential",
                    "API development and database design critical",
                    "Scalability and performance expertise valued"
                ]
            )
        elif "product manager" in job_title_lower or ("product" in job_title_lower and "manager" in job_title_lower):
            return JobMarketData(
                title=job_title,
                demand_score=8.0,
                salary_range={"min": 95000, "max": 160000, "median": 127000},
                trending_skills=["product management", "agile", "user research", "data analysis", "roadmapping", "stakeholder management"],
                growth_rate=0.22,
                market_insights=[
                    "Product management roles growing 22% annually",
                    "Technical product management skills in high demand",
                    "Data-driven decision making essential",
                    "Cross-functional collaboration critical"
                ]
            )
        elif "data analyst" in job_title_lower:
            return JobMarketData(
                title=job_title,
                demand_score=7.8,
                salary_range={"min": 75000, "max": 120000, "median": 95000},
                trending_skills=["sql", "excel", "python", "tableau", "power bi", "statistics", "data visualization"],
                growth_rate=0.15,
                market_insights=[
                    "Data analysis roles growing 15% year-over-year",
                    "SQL and visualization skills essential",
                    "Business intelligence tools in high demand",
                    "Remote data analysis roles increasingly common"
                ]
            )
        elif "web developer" in job_title_lower:
            return JobMarketData(
                title=job_title,
                demand_score=7.9,
                salary_range={"min": 80000, "max": 130000, "median": 105000},
                trending_skills=["javascript", "html", "css", "react", "node.js", "responsive design", "web performance"],
                growth_rate=0.16,
                market_insights=[
                    "Web development roles growing 16% annually",
                    "Full-stack developers most in demand",
                    "JavaScript frameworks essential",
                    "Remote web development widely available"
                ]
            )
        elif "software developer" in job_title_lower or ("software" in job_title_lower and ("developer" in job_title_lower or "engineer" in job_title_lower)):
            return JobMarketData(
                title=job_title,
                demand_score=8.1,
                salary_range={"min": 85000, "max": 140000, "median": 112000},
                trending_skills=["python", "java", "javascript", "git", "sql", "apis", "testing", "cloud"],
                growth_rate=0.17,
                market_insights=[
                    "Software development roles growing 17% annually",
                    "Cloud and DevOps skills increasingly required",
                    "Full-stack capabilities highly valued",
                    "Agile and collaboration skills essential"
                ]
            )
        else:
            # Default for other roles - vary based on keywords
            if "manager" in job_title_lower:
                return JobMarketData(
                    title=job_title,
                    demand_score=7.2,
                    salary_range={"min": 80000, "max": 130000, "median": 105000},
                    trending_skills=["leadership", "project management", "communication", "team collaboration", "strategic planning"],
                    growth_rate=0.12,
                    market_insights=[
                        "Management roles growing 12% annually",
                        "Leadership and communication skills essential",
                        "Strategic planning expertise valued",
                        "Cross-functional collaboration critical"
                    ]
                )
            elif "analyst" in job_title_lower:
                return JobMarketData(
                    title=job_title,
                    demand_score=7.4,
                    salary_range={"min": 70000, "max": 115000, "median": 92000},
                    trending_skills=["data analysis", "problem solving", "communication", "excel", "presentation skills"],
                    growth_rate=0.13,
                    market_insights=[
                        "Analysis roles growing 13% year-over-year",
                        "Data interpretation skills essential",
                        "Business acumen increasingly important",
                        "Remote analysis roles widely available"
                    ]
                )
            else:
                return JobMarketData(
                    title=job_title,
                    demand_score=7.0,
                    salary_range={"min": 65000, "max": 110000, "median": 87000},
                    trending_skills=["communication", "teamwork", "problem solving", "time management", "adaptability"],
                    growth_rate=0.10,
                    market_insights=[
                        "General roles growing 10% annually",
                        "Digital transformation driving demand",
                        "Remote work becoming standard",
                        "Skills in technology increasingly valuable"
                    ]
                )
    
    def get_trending_skills_by_industry(self, industry: str) -> List[str]:
        """Get trending skills for a specific industry"""
        industry_skills = {
            "technology": ["python", "javascript", "aws", "kubernetes", "react", "docker", "machine learning", "devops"],
            "healthcare": ["python", "data analysis", "machine learning", "hipaa", "electronic health records", "biostatistics"],
            "finance": ["python", "sql", "risk management", "compliance", "fintech", "blockchain", "data analysis"],
            "retail": ["python", "data analysis", "inventory management", "customer analytics", "e-commerce", "supply chain"],
            "manufacturing": ["python", "iot", "automation", "data analysis", "supply chain", "quality control", "predictive maintenance"]
        }
        return industry_skills.get(industry.lower(), ["python", "data analysis", "communication", "project management"])
    
    def get_salary_insights(self, job_title: str, experience_level: str = "mid") -> Dict[str, any]:
        """Get detailed salary insights based on job title and experience"""
        market_data = self.get_job_market_data(job_title)
        base_range = market_data.salary_range
        
        # Adjust based on experience level
        multipliers = {
            "entry": 0.7,
            "junior": 0.8,
            "mid": 1.0,
            "senior": 1.3,
            "lead": 1.5,
            "principal": 1.8
        }
        
        multiplier = multipliers.get(experience_level.lower(), 1.0)
        
        return {
            "base_range": base_range,
            "adjusted_range": {
                "min": int(base_range["min"] * multiplier),
                "max": int(base_range["max"] * multiplier),
                "median": int(base_range["median"] * multiplier)
            },
            "demand_score": market_data.demand_score,
            "growth_rate": market_data.growth_rate,
            "market_insights": market_data.market_insights
        }


# Global instance
job_market_api = JobMarketAPI()
