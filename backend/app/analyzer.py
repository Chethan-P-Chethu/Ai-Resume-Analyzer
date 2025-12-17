from __future__ import annotations

import re
from collections import Counter

from .roles import ROLES, RoleRequirements
from .job_market_api import job_market_api


_STOPWORDS = {
    "a",
    "an",
    "the",
    "and",
    "or",
    "to",
    "of",
    "in",
    "for",
    "with",
    "on",
    "at",
    "by",
    "from",
    "as",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "this",
    "that",
    "it",
    "i",
    "we",
    "you",
    "they",
    "he",
    "she",
    "them",
    "our",
    "your",
    "their",
    "my",
    "me",
    "us",
}


def job_description_from_title(job_title: str) -> str:
    t = (job_title or "").strip().lower()
    if not t:
        return ""

    slug: str | None = None
    
    # AI & Machine Learning roles
    if "ai" in t and ("engineer" in t or "developer" in t):
        slug = "ai_engineer"
    elif "machine learning" in t or "ml" in t:
        slug = "machine_learning_engineer"
    elif "data scientist" in t or "data science" in t:
        slug = "data_scientist"
    
    # Cloud & DevOps roles
    elif "devops" in t:
        slug = "devops_engineer"
    elif "cloud architect" in t or "cloud" in t and "architect" in t:
        slug = "cloud_architect"
    elif "site reliability" in t or "sre" in t:
        slug = "site_reliability_engineer"
    
    # Cybersecurity roles
    elif "cybersecurity" in t or "cyber security" in t:
        slug = "cybersecurity_analyst"
    elif "security engineer" in t or "security" in t and "engineer" in t:
        slug = "security_engineer"
    
    # Data Engineering roles
    elif "data engineer" in t or "data" in t and "engineer" in t:
        slug = "data_engineer"
    
    # Frontend Development roles
    elif "frontend" in t and ("engineer" in t or "developer" in t):
        slug = "frontend_engineer"
    
    # Backend Development roles
    elif "backend" in t and ("engineer" in t or "developer" in t):
        slug = "backend_engineer"
    
    # Product & Project Management roles
    elif "product manager" in t or "product" in t and "manager" in t:
        slug = "product_manager"
    
    # Original roles (keep for backward compatibility)
    elif "data" in t and "analyst" in t:
        slug = "data_analyst"
    elif "web" in t and "developer" in t:
        slug = "web_developer"
    elif "software" in t and ("developer" in t or "engineer" in t):
        slug = "software_developer"
    elif "developer" in t or "engineer" in t:
        slug = "software_developer"

    role = ROLES.get(slug) if slug else None
    if role:
        required = ", ".join(sorted(role.required_skills))
        preferred = ", ".join(sorted(role.preferred_skills))
        keywords = ", ".join(sorted(role.keywords))
        return (
            f"Job Title: {role.title}\n"
            f"Required skills: {required}\n"
            f"Preferred skills: {preferred}\n"
            f"Keywords: {keywords}" 
        )

    # Fallback for unmatched titles - generate generic description
    extra_skills: list[str] = []
    if "data" in t and "analyst" in t:
        slug = "data_analyst"
    elif "web" in t and "developer" in t:
        slug = "web_developer"
    elif "software" in t and ("developer" in t or "engineer" in t):
        slug = "software_developer"
    elif "developer" in t or "engineer" in t:
        slug = "software_developer"
    elif "sales" in t and ("executive" in t or "manager" in t or "representative" in t):
        slug = "sales_executive"
    elif "marketing" in t and ("manager" in t or "specialist" in t or "coordinator" in t):
        slug = "marketing_manager"
    elif "product" in t and ("manager" in t or "owner" in t):
        slug = "product_manager"
    elif "project" in t and ("manager" in t or "coordinator" in t):
        slug = "project_manager"
    elif "human" in t and ("resources" in t or "hr" in t):
        slug = "hr_manager"
    elif "consultant" in t or "advisor" in t:
        slug = "consultant"
    elif "designer" in t and ("ux" in t or "ui" in t):
        slug = "designer"
    elif "analyst" in t:
        extra_skills = ["sql", "excel", "python", "statistics", "power bi", "tableau", "data visualization"]
    elif "frontend" in t or "front-end" in t or "react" in t:
        extra_skills = ["javascript", "react", "html", "css", "typescript", "rest"]
    elif "backend" in t or "back-end" in t:
        extra_skills = ["python", "sql", "rest", "docker", "aws", "git"]
    elif "full" in t and "stack" in t:
        extra_skills = ["javascript", "react", "node", "python", "sql", "rest", "git"]
    elif "developer" in t or "engineer" in t:
        extra_skills = ["python", "javascript", "git", "sql", "rest"]
    elif "sales" in t:
        extra_skills = ["salesforce", "crm", "negotiation", "communication", "prospecting", "closing", "pipeline management", "salesforce automation", "microsoft office", "powerpoint"]
    elif "marketing" in t:
        extra_skills = ["seo", "sem", "content marketing", "social media", "analytics", "campaigns", "branding", "copywriting", "google analytics"]
    elif "product" in t:
        extra_skills = ["product roadmap", "agile", "scrum", "user stories", "prioritization", "market research", "jira", "confluence"]
    elif "project" in t:
        extra_skills = ["project planning", "risk management", "stakeholder management", "budgeting", "timeline", "ms project", "asana", "trello"]
    elif "human" in t or "hr" in t:
        extra_skills = ["recruiting", "onboarding", "performance management", "hris", "payroll", "benefits administration", "labor law"]
    elif "consultant" in t:
        extra_skills = ["problem solving", "stakeholder management", "presentation", "excel", "powerpoint", "reporting", "data analysis"]
    elif "designer" in t:
        extra_skills = ["figma", "sketch", "adobe xd", "prototyping", "wireframing", "usability testing", "design systems"]
    else:
        extra_skills = ["python", "javascript", "git", "sql", "rest"]

    title_tokens = _tokenize(job_title)
    title_line = " ".join(title_tokens) if title_tokens else job_title.strip()
    skills_line = ", ".join(extra_skills) if extra_skills else ""

    if skills_line:
        return (
            f"Job Title: {job_title.strip()}\n"
            f"Core skills: {skills_line}\n"
            f"Focus areas: {title_line}"
        )
    return f"Job Title: {job_title.strip()}\nFocus areas: {title_line}"


_SECTION_HEADINGS = {
    "summary",
    "professional summary",
    "objective",
    "skills",
    "technical skills",
    "education",
    "experience",
    "work experience",
    "projects",
    "certifications",
    "achievements",
    "internships",
}


_SKILL_ALIASES: dict[str, set[str]] = {
    "javascript": {"javascript", "js"},
    "typescript": {"typescript", "ts"},
    "node": {"node", "node.js", "nodejs"},
    "next.js": {"next", "next.js", "nextjs"},
    "react": {"react", "react.js", "reactjs"},
    "power bi": {"power bi", "powerbi"},
    "ci/cd": {"ci/cd", "cicd", "ci cd"},
    "rest": {"rest", "rest api", "restful"},
    "unit testing": {"unit testing", "unit tests", "pytest", "junit"},
    "data visualization": {"data visualization", "dataviz", "visualization", "charts"},
    # Expanded aliases for better matching
    "python": {"python", "py"},
    "java": {"java"},
    "sql": {"sql", "structured query language"},
    "aws": {"aws", "amazon web services"},
    "azure": {"azure", "microsoft azure"},
    "gcp": {"gcp", "google cloud platform"},
    "docker": {"docker", "containerization"},
    "kubernetes": {"kubernetes", "k8s"},
    "git": {"git", "version control"},
    "graphql": {"graphql", "gql"},
    "mongodb": {"mongodb", "mongo"},
    "postgresql": {"postgresql", "postgres"},
    "mysql": {"mysql"},
    "redis": {"redis", "cache"},
    "elasticsearch": {"elasticsearch", "elastic"},
    "jenkins": {"jenkins", "ci"},
    "terraform": {"terraform", "iac"},
    "ansible": {"ansible", "automation"},
    "bash": {"bash", "shell", "sh"},
    "powershell": {"powershell", "ps"},
    "linux": {"linux", "ubuntu", "debian"},
    "html": {"html", "markup"},
    "css": {"css", "styles"},
    "tailwind": {"tailwind", "tailwindcss"},
    "sass": {"sass", "scss"},
    "flask": {"flask", "python flask"},
    "fastapi": {"fastapi", "python fastapi"},
    "django": {"django", "python django"},
    "pandas": {"pandas", "dataframes"},
    "numpy": {"numpy", "arrays"},
    "excel": {"excel", "spreadsheet"},
    "tableau": {"tableau", "bi", "analytics"},
}


_DEGREE_PATTERNS = [
    (r"\b(phd|doctor of philosophy|doctorate)\b", "PhD"),
    (r"\b(masters?|master of science|m\.?sc|m\.?s|m\.?tech|m\.?eng|msc|m\.?s)\b", "Master"),
    (r"\b(bachelor|b\.?tech|b\.?e|b\.?sc|b\.?a|bsc|b\.?s)\b", "Bachelor"),
    (r"\b(associate|a\.?a|diploma)\b", "Associate"),
]

_EXPERIENCE_TENURE_RE = re.compile(
    r"\b(\d{1,2})\s*(years?|yrs?|y)\b.*\b(\d{1,2}|present|current)\s*(years?|yrs?|y)\b|"
    r"\b(\d{1,2})\s*(years?|yrs?|y)\b|"
    r"\b(\d{1,2})\s*(months?|mos?|m)\b",
    re.IGNORECASE,
)

_SECTION_WEIGHTS = {
    "summary": 0.10,
    "skills": 0.25,
    "education": 0.15,
    "experience": 0.35,
    "projects": 0.15,
}


def _normalize_text(text: str) -> str:
    text = text.replace("\u00a0", " ")
    text = re.sub(r"[\t\r]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _tokenize(text: str) -> list[str]:
    tokens = re.findall(r"[a-zA-Z][a-zA-Z0-9.+/#-]{1,}", text.lower())
    return [t for t in tokens if t not in _STOPWORDS and len(t) > 2]


def _split_sections(text: str) -> dict[str, str]:
    lines = [ln.strip() for ln in text.splitlines()]
    sections: dict[str, list[str]] = {"__all__": []}
    current = "__all__"

    for ln in lines:
        if not ln:
            sections.setdefault(current, []).append("")
            continue

        cleaned = re.sub(r"[^a-zA-Z ]", "", ln).strip().lower()
        if cleaned in _SECTION_HEADINGS and len(cleaned.split()) <= 3:
            current = cleaned
            sections.setdefault(current, [])
            continue

        sections.setdefault(current, []).append(ln)
        sections["__all__"].append(ln)

    return {k: "\n".join(v).strip() for k, v in sections.items()}


def _extract_education(text: str) -> list[str]:
    edu_lines: list[str] = []
    for ln in text.splitlines():
        for pat, _ in _DEGREE_PATTERNS:
            if re.search(pat, ln, re.IGNORECASE):
                edu_lines.append(ln.strip())
                break
    return edu_lines[:8]


def _detect_education_level(education_lines: list[str]) -> str:
    for ln in education_lines:
        ln_l = ln.lower()
        for pat, level in _DEGREE_PATTERNS:
            if re.search(pat, ln_l):
                return level
    return "Unknown"


def _extract_experience_tenure(text: str) -> float:
    """Return total years of experience (approximate)."""
    total_months = 0
    for m in _EXPERIENCE_TENURE_RE.finditer(text):
        groups = m.groups()
        # Try to parse a range like "5 years 7 months"
        if groups[0] and groups[1] and groups[2]:
            start = int(groups[0])
            end = groups[2]
            if end.lower() in {"present", "current"}:
                # Fallback: assume at least start years if no end date found
                total_months += start * 12
            else:
                end_num = int(end) if end.isdigit() else start
                total_months += max(0, (end_num - start) * 12)
        elif groups[3]:
            total_months += int(groups[3]) * 12
        elif groups[4]:
            total_months += int(groups[4])
    years = total_months / 12.0
    return round(years, 1)


def _fuzzy_match(skill: str, candidate: str) -> bool:
    """Simple fuzzy match: allow one substitution/insertion/deletion."""
    if skill == candidate:
        return True
    if abs(len(skill) - len(candidate)) > 2:
        return False
    # Levenshtein distance <= 1 for short strings
    edits = 0
    i = j = 0
    while i < len(skill) and j < len(candidate) and edits <= 1:
        if skill[i] != candidate[j]:
            edits += 1
            if i + 1 < len(skill) and skill[i + 1] == candidate[j]:
                i += 1
            elif j + 1 < len(candidate) and skill[i] == candidate[j + 1]:
                j += 1
        i += 1
        j += 1
    edits += abs(len(skill) - i) + abs(len(candidate) - j)
    return edits <= 1


def _extract_skills_enhanced(text: str, job_skills: set[str]) -> set[str]:
    text_l = text.lower()
    found: set[str] = set()

    # 1) Direct/alias match for known job skills
    for skill in job_skills:
        aliases = _SKILL_ALIASES.get(skill, {skill})
        for alias in aliases:
            if alias and re.search(rf"\b{re.escape(alias.lower())}\b", text_l):
                found.add(skill)
                break

    # 2) Fuzzy match for short tokens
    tokens = _tokenize(text)
    for token in tokens:
        for skill in job_skills:
            if _fuzzy_match(token, skill):
                found.add(skill)

    # 3) Skills section parsing (comma/pipe/bullet)
    sections = _split_sections(text)
    skills_block = sections.get("skills") or sections.get("technical skills") or ""
    if skills_block:
        parts = re.split(r"[,|•\u2022]\s*", skills_block.lower())
        for p in parts:
            p = p.strip(" -–:\t").strip()
            if 2 <= len(p) <= 40:
                for skill in job_skills:
                    if _fuzzy_match(p, skill) or any(_fuzzy_match(p, a) for a in _SKILL_ALIASES.get(skill, {skill})):
                        found.add(skill)

    # 4) Known tech keywords fallback
    known_tech = {
        "python", "java", "javascript", "typescript", "react", "node", "node.js", "next.js", "sql", "excel",
        "power bi", "tableau", "pandas", "numpy", "docker", "kubernetes", "aws", "gcp", "azure", "git",
        "rest", "rest api", "graphql", "flask", "fastapi", "django", "html", "css", "tailwind", "sass",
        "mongodb", "postgresql", "mysql", "redis", "elasticsearch", "ci/cd", "jenkins", "github actions",
        "terraform", "ansible", "linux", "ubuntu", "windows", "macos", "bash", "powershell", "shell"
    }
    for token in tokens:
        if token in known_tech:
            found.add(token)

    return {s.lower() for s in found if 2 <= len(s) <= 40}


def _extract_education(text: str) -> list[str]:
    edu_lines: list[str] = []
    degree_re = re.compile(
        r"\b(bachelor|b\.?tech|b\.?e|b\.?sc|master|m\.?tech|m\.?sc|mba|phd|doctorate)\b",
        re.IGNORECASE,
    )
    for ln in text.splitlines():
        if degree_re.search(ln):
            edu_lines.append(ln.strip())
    return edu_lines[:8]


def _extract_experience(text: str) -> list[str]:
    exp_lines: list[str] = []
    date_re = re.compile(
        r"\b(20\d{2}|19\d{2})\b.*\b(20\d{2}|present|current)\b|\b(present|current)\b",
        re.IGNORECASE,
    )
    for ln in text.splitlines():
        if date_re.search(ln) or re.search(r"\b(intern|engineer|developer|analyst|assistant)\b", ln, re.I):
            exp_lines.append(ln.strip())
    # de-dup while preserving order
    seen: set[str] = set()
    out: list[str] = []
    for ln in exp_lines:
        key = ln.lower()
        if key not in seen:
            out.append(ln)
            seen.add(key)
    return out[:10]


def _extract_skills(text: str, role: RoleRequirements) -> set[str]:
    text_l = text.lower()
    found: set[str] = set()

    # 1) Direct match for role skills and keywords (handles multi-word)
    candidates = set(role.required_skills) | set(role.preferred_skills) | set(role.keywords)

    for skill in candidates:
        aliases = _SKILL_ALIASES.get(skill, {skill})
        for alias in aliases:
            if alias and re.search(rf"\b{re.escape(alias.lower())}\b", text_l):
                found.add(skill)
                break

    # 2) Heuristic: parse skills section (comma / pipe separated)
    sections = _split_sections(text)
    skills_block = sections.get("skills") or sections.get("technical skills") or ""
    if skills_block:
        parts = re.split(r"[,|•\u2022]\s*", skills_block.lower())
        for p in parts:
            p = p.strip(" -–:\t").strip()
            if not p:
                continue
            # keep short phrases as-is
            if 2 <= len(p) <= 32:
                found.add(p)

    # normalize: keep only reasonable items
    cleaned: set[str] = set()
    for s in found:
        s2 = re.sub(r"\s{2,}", " ", s.strip().lower())
        if 2 <= len(s2) <= 40:
            cleaned.add(s2)
    return cleaned


def _top_keywords(text: str, limit: int = 20) -> list[str]:
    tokens = _tokenize(text)
    counts = Counter(tokens)
    common = [w for w, _ in counts.most_common(limit * 2)]

    # Light de-noising: drop numeric-ish tokens
    out: list[str] = []
    for w in common:
        if re.fullmatch(r"\d+", w):
            continue
        if w not in out:
            out.append(w)
        if len(out) >= limit:
            break
    return out


def analyze_resume(text: str, role: RoleRequirements) -> dict:
    text = _normalize_text(text)
    sections = _split_sections(text)

    education = _extract_education(sections.get("education", text))
    experience = _extract_experience(sections.get("experience") or sections.get("work experience") or text)

    extracted_skills = _extract_skills(text, role)

    matched_required = sorted([s for s in role.required_skills if s.lower() in extracted_skills])
    matched_preferred = sorted([s for s in role.preferred_skills if s.lower() in extracted_skills])

    missing_required = sorted([s for s in role.required_skills if s.lower() not in extracted_skills])
    missing_preferred = sorted([s for s in role.preferred_skills if s.lower() not in extracted_skills])

    top_keywords = _top_keywords(text, limit=20)
    matched_role_keywords = sorted([k for k in role.keywords if k.lower() in set(top_keywords)])

    # Scoring
    req_ratio = (len(matched_required) / max(1, len(role.required_skills)))
    pref_ratio = (len(matched_preferred) / max(1, len(role.preferred_skills)))
    kw_ratio = (len(matched_role_keywords) / max(1, len(role.keywords)))

    skill_score = int(round(req_ratio * 70 + pref_ratio * 20))
    keyword_score = int(round(kw_ratio * 10))

    section_score = 0
    if sections.get("skills") or sections.get("technical skills"):
        section_score += 4
    if sections.get("education") or education:
        section_score += 3
    if sections.get("experience") or sections.get("work experience") or experience:
        section_score += 3

    score = max(0, min(100, skill_score + keyword_score + section_score))

    suggestions: list[str] = []

    if missing_required:
        suggestions.append(
            "Add the missing required skills for this role: " + ", ".join(missing_required[:10]) + ("" if len(missing_required) <= 10 else " …")
        )

    if len(matched_required) < max(2, int(0.4 * len(role.required_skills))):
        suggestions.append(
            "Strengthen your skills section by listing tools/technologies you actually used in projects (not just familiar with)."
        )

    if not education:
        suggestions.append(
            "Your education section looks weak or missing. Add degree, institute, graduation year, and relevant coursework (if student/fresher)."
        )

    if not experience:
        suggestions.append(
            "Your experience section looks weak. Add internships, projects, freelance work, or campus roles with measurable impact (numbers, outcomes)."
        )

    if kw_ratio < 0.34:
        suggestions.append(
            "Optimize keywords: include more role-relevant terms naturally inside project and experience bullet points (avoid keyword stuffing)."
        )

    # Formatting heuristics
    if "•" not in text and "\n- " not in text and "\n•" not in text:
        suggestions.append(
            "Use bullet points in experience/projects (2-5 bullets each) to improve readability and ATS parsing."
        )

    if len(text) > 9000:
        suggestions.append(
            "Your resume text seems long. Consider condensing to 1 page (students) or 1-2 pages (experienced) and prioritize recent, relevant work."
        )

    if not suggestions:
        suggestions.append(
            "Your resume is already fairly aligned. Next, tailor 1-2 strongest projects to match this role and add measurable outcomes (%, time saved, users, revenue)."
        )

    matched_skills = sorted(set(matched_required + matched_preferred))

    return {
        "score": score,
        "education": education,
        "experience": experience,
        "extracted_skills": sorted(extracted_skills),
        "matched_skills": matched_skills,
        "missing_required_skills": missing_required,
        "missing_preferred_skills": missing_preferred,
        "top_keywords": top_keywords,
        "matched_role_keywords": matched_role_keywords,
        "suggestions": suggestions,
    }


def _extract_skill_like_phrases(text: str) -> set[str]:
    text_l = text.lower()
    out: set[str] = set()

    # common technology tokens (keep lightweight and dependency-free)
    known = {
        "python",
        "java",
        "javascript",
        "typescript",
        "react",
        "node",
        "node.js",
        "next.js",
        "sql",
        "excel",
        "power bi",
        "tableau",
        "pandas",
        "numpy",
        "docker",
        "kubernetes",
        "aws",
        "git",
        "rest",
        "rest api",
        "linux",
        "flask",
        "fastapi",
        "django",
        "html",
        "css",
        "tailwind",
    }

    for skill in known:
        aliases = _SKILL_ALIASES.get(skill, {skill})
        for alias in aliases:
            if alias and re.search(rf"\b{re.escape(alias.lower())}\b", text_l):
                out.add(skill)
                break

    # pull from explicit "skills" section, if present
    sections = _split_sections(text)
    skills_block = sections.get("skills") or sections.get("technical skills") or ""
    if skills_block:
        parts = re.split(r"[,|•\u2022]\s*", skills_block.lower())
        for p in parts:
            p = p.strip(" -–:\t").strip()
            if not p:
                continue
            if 2 <= len(p) <= 40:
                out.add(re.sub(r"\s{2,}", " ", p))

    return out


def _tfidf_similarity(a: str, b: str) -> float:
    # Guard: sklearn throws on empty vocab
    a = a.strip()
    b = b.strip()
    if not a or not b:
        return 0.0

    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), min_df=1, max_features=10000)
        tfidf = vectorizer.fit_transform([a, b])
        return float(cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0])
    except Exception:  # noqa: BLE001
        # Fallback: token overlap similarity (less accurate than TF-IDF, but keeps API functional)
        ta = set(_tokenize(a))
        tb = set(_tokenize(b))
        if not ta or not tb:
            return 0.0
        return len(ta & tb) / max(1, len(ta | tb))


def analyze_resume_against_job(resume_text: str, job_description: str, job_title: str) -> dict:
    resume_text = _normalize_text(resume_text)
    job_description = _normalize_text(job_description)
    if not job_description:
        job_description = _normalize_text(job_description_from_title(job_title))

    resume_sections = _split_sections(resume_text)
    _ = _split_sections(job_description)

    resume_education = _extract_education(resume_sections.get("education", resume_text))
    resume_experience = _extract_experience(resume_sections.get("experience") or resume_sections.get("work experience") or resume_text)

    resume_keywords = _top_keywords(resume_text, limit=20)
    job_keywords = _top_keywords(job_description, limit=20)

    job_skills_set = set(_extract_skill_like_phrases(job_description))
    resume_skills_set = _extract_skills_enhanced(resume_text, job_skills_set)
    resume_skills = sorted(resume_skills_set)
    job_skills = sorted(job_skills_set)

    resume_kw_set = set([k.lower() for k in resume_keywords])
    job_kw_set = set([k.lower() for k in job_keywords])

    resume_skill_set = {s.lower() for s in resume_skills_set}
    job_skill_set = {s.lower() for s in job_skills_set}

    missing_keywords = sorted([k for k in job_keywords if k.lower() not in resume_kw_set])
    missing_skills = sorted([s for s in job_skills if s.lower() not in resume_skill_set])

    # Scores
    sim = _tfidf_similarity(resume_text, job_description)
    similarity_score = int(round(max(0.0, min(1.0, sim)) * 100))

    kw_overlap = len(resume_kw_set & job_kw_set) / max(1, len(job_kw_set))
    keyword_score = int(round(kw_overlap * 100))

    skill_overlap = len(resume_skill_set & job_skill_set) / max(1, len(job_skill_set))
    skill_score = int(round(skill_overlap * 100))

    # section completeness (resume only)
    section_points = 0
    sections_present: dict[str, bool] = {
        "summary": bool(resume_sections.get("summary") or resume_sections.get("professional summary") or resume_sections.get("objective")),
        "skills": bool(resume_sections.get("skills") or resume_sections.get("technical skills") or resume_skills),
        "education": bool(resume_sections.get("education") or resume_education),
        "experience": bool(resume_sections.get("experience") or resume_sections.get("work experience") or resume_experience),
        "projects": bool(resume_sections.get("projects")),
    }

    # Weighted section score
    section_score = int(
        round(
            sum(
                _SECTION_WEIGHTS.get(k, 0) * 100
                for k, present in sections_present.items()
                if present
            )
        )
    )

    # Overall score: blend + clamp
    overall = int(round(similarity_score * 0.45 + skill_score * 0.30 + keyword_score * 0.15 + section_score * 0.10))
    overall = max(0, min(100, overall))

    suggestions: list[str] = []

    if missing_skills:
        suggestions.append(
            "Add missing job skills (only if you actually have them): "
            + ", ".join(missing_skills[:10])
            + ("" if len(missing_skills) <= 10 else " …")
        )

    if missing_keywords:
        suggestions.append(
            "Improve keyword alignment: weave these terms into project/experience bullets naturally: "
            + ", ".join(missing_keywords[:10])
            + ("" if len(missing_keywords) <= 10 else " …")
        )

    if not sections_present["projects"]:
        suggestions.append(
            "Add a Projects section with 2-4 role-relevant projects. Use action verbs + measurable results (%, time saved, users)."
        )

    if not resume_education:
        suggestions.append(
            "Education looks weak or missing. Include degree, institute, year, and relevant coursework (especially for students)."
        )

    if not resume_experience:
        suggestions.append(
            "Experience looks weak. Add internships, freelance, volunteer work, or project impact bullets to strengthen ATS signals."
        )

    if similarity_score < 55:
        suggestions.append(
            "Tailor the top summary to match the job title and core requirements (2-3 lines) so recruiters see relevance immediately."
        )

    if "•" not in resume_text and "\n- " not in resume_text and "\n•" not in resume_text:
        suggestions.append(
            "Use bullet points in Experience/Projects (2-5 bullets each). This improves readability and ATS parsing."
        )

    if not suggestions:
        suggestions.append(
            "Good alignment. Next: strengthen impact with numbers and tailor 1-2 strongest projects directly to the job requirements."
        )

    # Additional analytics
    education_level = _detect_education_level(resume_education)
    experience_years = _extract_experience_tenure(resume_text)
    
    # Get job market insights
    market_data = job_market_api.get_job_market_data(job_title)
    salary_insights = job_market_api.get_salary_insights(job_title, 
        "entry" if experience_years < 2 else 
        "junior" if experience_years < 3 else 
        "mid" if experience_years < 6 else 
        "senior" if experience_years < 10 else 
        "lead")

    # Skill Gap Analysis
    skill_gap_analysis = _calculate_skill_gap_analysis(resume_skills, job_skills, missing_skills, market_data.trending_skills)

    return {
        "job_title": job_title,
        "overall_score": overall,
        "scores": {
            "similarity": similarity_score,
            "skills": skill_score,
            "keywords": keyword_score,
            "sections": section_score,
        },
        "resume": {
            "top_keywords": resume_keywords,
            "skills": resume_skills,
            "education": resume_education,
            "experience": resume_experience,
            "sections_present": sections_present,
            "education_level": education_level,
            "experience_years": experience_years,
        },
        "job": {
            "top_keywords": job_keywords,
            "skills": job_skills,
        },
        "gaps": {
            "missing_skills": missing_skills,
            "missing_keywords": missing_keywords,
        },
        "suggestions": suggestions,
        "market_insights": {
            "demand_score": market_data.demand_score,
            "salary_range": salary_insights["adjusted_range"],
            "trending_skills": market_data.trending_skills,
            "growth_rate": market_data.growth_rate,
            "market_insights": market_data.market_insights,
        },
        "skill_gap_analysis": skill_gap_analysis
    }


def _calculate_skill_gap_analysis(resume_skills, job_skills, missing_skills, trending_skills):
    """Calculate detailed skill gap analysis with learning recommendations"""
    
    # Convert to sets for easier comparison
    resume_skills_set = set(skill.lower() for skill in resume_skills)
    job_skills_set = set(skill.lower() for skill in job_skills)
    missing_skills_set = set(skill.lower() for skill in missing_skills)
    trending_skills_set = set(skill.lower() for skill in trending_skills)
    
    # Calculate skill coverage
    matched_skills = resume_skills_set.intersection(job_skills_set)
    matched_skills_list = [skill for skill in job_skills if skill.lower() in matched_skills]
    
    # Categorize missing skills by priority
    critical_missing = []
    important_missing = []
    nice_to_have = []
    
    for skill in missing_skills:
        skill_lower = skill.lower()
        if skill_lower in trending_skills_set:
            critical_missing.append(skill)
        elif skill_lower in job_skills_set:
            important_missing.append(skill)
        else:
            nice_to_have.append(skill)
    
    # Calculate skill gap percentage
    total_required_skills = len(job_skills)
    skill_coverage_percentage = (len(matched_skills) / total_required_skills * 100) if total_required_skills > 0 else 0
    
    # Generate learning recommendations
    learning_recommendations = _generate_learning_recommendations(critical_missing, important_missing)
    
    return {
        "skill_coverage_percentage": round(skill_coverage_percentage, 1),
        "matched_skills": matched_skills_list,
        "missing_skills": {
            "critical": critical_missing,
            "important": important_missing,
            "nice_to_have": nice_to_have
        },
        "total_missing": len(missing_skills),
        "total_matched": len(matched_skills),
        "gap_analysis": {
            "high_priority_gap": len(critical_missing) > 0,
            "medium_priority_gap": len(important_missing) > 0,
            "overall_gap_severity": "high" if skill_coverage_percentage < 40 else "medium" if skill_coverage_percentage < 70 else "low"
        },
        "learning_recommendations": learning_recommendations
    }


def _generate_learning_recommendations(critical_skills, important_skills):
    """Generate prioritized learning recommendations with online learning platforms"""
    
    learning_platforms = {
        "Coursera": ["https://www.coursera.org"],
        "Udemy": ["https://www.udemy.com"],
        "edX": ["https://www.edx.org"],
        "LinkedIn Learning": ["https://www.linkedin.com/learning"],
        "Pluralsight": ["https://www.pluralsight.com"]
    }
    
    skill_courses = {
        "python": ["Python for Data Science", "Complete Python Bootcamp"],
        "javascript": ["JavaScript: The Complete Guide", "Modern JavaScript From The Beginning"],
        "react": ["React - The Complete Guide", "Modern React with Redux"],
        "aws": ["AWS Certified Solutions Architect", "AWS Fundamentals"],
        "docker": ["Docker & Kubernetes", "Docker Mastery"],
        "sql": ["SQL for Data Analysis", "Complete SQL Bootcamp"],
        "machine learning": ["Machine Learning A-Z", "Deep Learning Specialization"],
        "java": ["Java Programming Masterclass", "Complete Java Development"],
        "git": ["Git Complete: The definitive guide", "Git & GitHub Bootcamp"],
        "node.js": ["Node.js Complete Guide", "Advanced Node.js"],
        "typescript": ["Understanding TypeScript", "TypeScript Course"],
        "kubernetes": ["Kubernetes for Developers", "Kubernetes Complete Guide"],
        "tableau": ["Tableau 2022 A-Z", "Tableau Desktop Specialist"],
        "power bi": ["Power BI A-Z", "Microsoft Power BI"]
    }
    
    recommendations = []
    
    # Critical skills recommendations
    for skill in critical_skills[:5]:  # Limit to top 5 critical skills
        skill_lower = skill.lower()
        courses = skill_courses.get(skill_lower, [f"Learn {skill.capitalize()}"])
        platforms = list(learning_platforms.keys())
        
        rec = {
            "skill": skill,
            "priority": "critical",
            "recommended_courses": courses[:2],
            "platforms": platforms[:3],
            "estimated_time": "2-4 weeks" if skill_lower in ["python", "javascript", "sql"] else "4-8 weeks",
            "difficulty": "beginner" if skill_lower in ["python", "javascript", "sql"] else "intermediate"
        }
        recommendations.append(rec)
    
    # Important skills recommendations
    for skill in important_skills[:3]:  # Limit to top 3 important skills
        skill_lower = skill.lower()
        courses = skill_courses.get(skill_lower, [f"Learn {skill.capitalize()}"])
        platforms = list(learning_platforms.keys())
        
        rec = {
            "skill": skill,
            "priority": "important",
            "recommended_courses": courses[:2],
            "platforms": platforms[:2],
            "estimated_time": "3-6 weeks",
            "difficulty": "intermediate"
        }
        recommendations.append(rec)
    
    return recommendations
