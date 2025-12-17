from __future__ import annotations

from typing import TypedDict


class AnalyzeResponse(TypedDict):
    job_title: str
    overall_score: int
    scores: dict
    resume: dict
    job: dict
    gaps: dict
    suggestions: list[str]
