const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

export async function analyzeResume({ jobTitle, jobDescription, file }) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('job_title', jobTitle)
  if (jobDescription && jobDescription.trim()) {
    fd.append('job_description', jobDescription)
  }

  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    body: fd
  })

  if (!res.ok) {
    let msg = 'Analysis failed'
    try {
      const data = await res.json()
      msg = data?.detail || msg
    } catch {
      // ignore
    }
    throw new Error(msg)
  }

  return res.json()
}

export async function analyzeCompare({ jobTitle, jobDescription, file1, file2 }) {
  const fd1 = new FormData()
  fd1.append('file', file1)
  fd1.append('job_title', jobTitle)
  if (jobDescription && jobDescription.trim()) {
    fd1.append('job_description', jobDescription)
  }

  const fd2 = new FormData()
  fd2.append('file', file2)
  fd2.append('job_title', jobTitle)
  if (jobDescription && jobDescription.trim()) {
    fd2.append('job_description', jobDescription)
  }

  const [res1, res2] = await Promise.all([
    fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      body: fd1
    }),
    fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      body: fd2
    })
  ])

  if (!res1.ok) {
    let msg = 'First resume analysis failed'
    try {
      const data = await res1.json()
      msg = data?.detail || msg
    } catch {
      // ignore
    }
    throw new Error(msg)
  }

  if (!res2.ok) {
    let msg = 'Second resume analysis failed'
    try {
      const data = await res2.json()
      msg = data?.detail || msg
    } catch {
      // ignore
    }
    throw new Error(msg)
  }

  const [data1, data2] = await Promise.all([res1.json(), res2.json()])
  return { data1, data2 }
}
