from __future__ import annotations

import io
import os
import sys

from flask import Flask, jsonify, request
from flask_cors import CORS

try:
    from .analyzer import analyze_resume_against_job
except ImportError:
    # Allow running this file directly: python app/main.py
    sys.path.append(os.path.dirname(os.path.dirname(__file__)))
    from app.analyzer import analyze_resume_against_job


app = Flask(__name__)
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "https://ai-resume-analyzer-frontend-zm8a.onrender.com",  # Replace with actual frontend URL
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5174",
            ]
        }
    },
)


def _extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        try:
            import pdfplumber  # type: ignore
        except ModuleNotFoundError as e:
            raise RuntimeError(
                "PDF parser dependency is missing. Install backend requirements (pip install -r requirements.txt)."
            ) from e

        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages_text = [(p.extract_text() or "") for p in pdf.pages]
            return "\n".join(pages_text).strip()
    except Exception as e:  # noqa: BLE001
        raise ValueError(f"Failed to parse PDF: {e}")


@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'AI Resume Analyzer API is running',
        'version': '1.0.0'
    })


@app.route('/api/analyze', methods=['POST'])
def analyze():
    job_title = (request.form.get("job_title") or "").strip()
    job_description = (request.form.get("job_description") or "").strip()

    if not job_title:
        return jsonify({"detail": "Job title is required"}), 400

    if "file" not in request.files:
        return jsonify({"detail": "Resume PDF file is required"}), 400

    f = request.files["file"]
    raw = f.read() or b""
    if len(raw) > 7_000_000:
        return jsonify({"detail": "File too large (max 7MB)"}), 413

    filename = (f.filename or "").lower()
    looks_like_pdf = raw[:5] == b"%PDF-" or filename.endswith(".pdf")
    content_type = (f.content_type or "").lower()
    content_type_ok = content_type in {"application/pdf", "application/x-pdf", "application/octet-stream"}

    if not looks_like_pdf or not content_type_ok:
        return jsonify({"detail": "Only PDF files are supported"}), 400

    try:
        resume_text = _extract_text_from_pdf(raw)
    except RuntimeError as e:
        return jsonify({"detail": str(e)}), 500
    except ValueError as e:
        return jsonify({"detail": str(e)}), 400

    if not resume_text:
        return jsonify({"detail": "Could not extract text from PDF (is it scanned?)"}), 400

    try:
        result = analyze_resume_against_job(resume_text, job_description, job_title=job_title)
    except Exception as e:  # noqa: BLE001
        return jsonify({"detail": f"Analysis failed: {e}"}), 500

    return jsonify(result)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)

# Production WSGI entry point
def handler(environ, start_response):
    return app(environ, start_response)
