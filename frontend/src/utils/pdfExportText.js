import jsPDF from 'jspdf';

export async function downloadAnalysisAsPDF(analysis, jobTitle) {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;
    const lineHeight = 7;
    const margin = 15;

    // Helper function to add text with word wrap
    const addText = (text, fontSize = 12, fontStyle = 'normal') => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', fontStyle);
      
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      lines.forEach(line => {
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
      
      yPosition += 3; // Add spacing after paragraph
    };

    // Helper function to add section header
    const addSectionHeader = (title) => {
      yPosition += 10;
      addText(title, 16, 'bold');
      yPosition -= 3;
    };

    // Title and metadata
    addText('AI Resume Analysis Report', 20, 'bold');
    addText(`Job Title: ${jobTitle}`, 14, 'bold');
    addText(`Generated: ${new Date().toLocaleDateString()}`, 10);
    addText(`Overall Score: ${analysis.overall_score || 0}/100`, 14, 'bold');
    
    // Overall Assessment
    addSectionHeader('OVERALL ASSESSMENT');
    const score = analysis.overall_score || 0;
    let assessment = '';
    if (score >= 80) {
      assessment = 'Excellent - Your resume is well-aligned with this job position. You have strong matching skills and experience.';
    } else if (score >= 60) {
      assessment = 'Good - Your resume shows decent alignment but could benefit from improvements in key areas.';
    } else if (score >= 40) {
      assessment = 'Fair - Your resume needs significant improvements to match this job position effectively.';
    } else {
      assessment = 'Poor - Your resume requires major revisions to be competitive for this role.';
    }
    addText(assessment);

    // Strengths
    addSectionHeader('RESUME STRENGTHS');
    const strengths = [];
    
    if (analysis.scores?.similarity > 70) {
      strengths.push('• Strong content similarity with job requirements');
    }
    if (analysis.scores?.skills > 70) {
      strengths.push('• Good skill coverage for the target position');
    }
    if (analysis.scores?.keywords > 70) {
      strengths.push('• Effective keyword matching for ATS systems');
    }
    if (analysis.resume?.skills && analysis.resume.skills.length > 10) {
      strengths.push('• Comprehensive skill set demonstrated');
    }
    if (Object.values(analysis.resume?.sections_present || {}).filter(Boolean).length > 4) {
      strengths.push('• Well-structured resume with multiple sections');
    }
    
    if (strengths.length > 0) {
      addText(strengths.join('\n'));
    } else {
      addText('• Limited strengths identified - focus on addressing the improvement areas below');
    }

    // Weaknesses
    addSectionHeader('AREAS FOR IMPROVEMENT');
    const weaknesses = [];
    
    if (analysis.scores?.similarity < 50) {
      weaknesses.push('• Low content similarity - job description alignment needs improvement');
    }
    if (analysis.scores?.skills < 50) {
      weaknesses.push('• Poor skill coverage - missing key skills for this position');
    }
    if (analysis.scores?.keywords < 50) {
      weaknesses.push('• Weak keyword matching - may not pass ATS screening');
    }
    if ((analysis.gaps?.missing_skills || []).length > 5) {
      weaknesses.push(`• Missing ${analysis.gaps.missing_skills.length} important skills`);
    }
    if ((analysis.gaps?.missing_keywords || []).length > 5) {
      weaknesses.push(`• Missing ${analysis.gaps.missing_keywords.length} relevant keywords`);
    }
    
    const missingSections = Object.entries(analysis.resume?.sections_present || {})
      .filter(([_, present]) => !present)
      .map(([section]) => section);
    if (missingSections.length > 0) {
      weaknesses.push(`• Missing important sections: ${missingSections.join(', ')}`);
    }
    
    if (weaknesses.length > 0) {
      addText(weaknesses.join('\n'));
    } else {
      addText('• No major weaknesses identified - resume is well-positioned');
    }

    // Missing Skills Analysis
    if (analysis.gaps?.missing_skills && analysis.gaps.missing_skills.length > 0) {
      addSectionHeader('MISSING SKILLS TO ADD');
      addText(`The following skills are important for this position but missing from your resume:`);
      addText(analysis.gaps.missing_skills.map(skill => `• ${skill}`).join('\n'));
      addText('');
      addText('Recommendation: If you have experience with any of these skills, add them to your skills section or work experience. Be honest about your proficiency level.');
    }

    // Missing Keywords Analysis
    if (analysis.gaps?.missing_keywords && analysis.gaps.missing_keywords.length > 0) {
      addSectionHeader('MISSING KEYWORDS TO INCLUDE');
      addText(`These keywords are frequently mentioned in job postings but absent from your resume:`);
      addText(analysis.gaps.missing_keywords.map(keyword => `• ${keyword}`).join('\n'));
      addText('');
      addText('Recommendation: Naturally incorporate these keywords into your experience descriptions and skills section to improve ATS matching.');
    }

    // Section Recommendations
    addSectionHeader('SECTION IMPROVEMENTS');
    const sections = analysis.resume?.sections_present || {};
    const sectionRecommendations = [];

    if (!sections.Experience) {
      sectionRecommendations.push('• Add a Professional Experience section with detailed job descriptions');
    }
    if (!sections.Skills) {
      sectionRecommendations.push('• Create a dedicated Skills section highlighting relevant technical and soft skills');
    }
    if (!sections.Education) {
      sectionRecommendations.push('• Include Education section with degrees and certifications');
    }
    if (!sections.Projects) {
      sectionRecommendations.push('• Add Projects section to showcase practical experience and achievements');
    }
    if (!sections.Summary) {
      sectionRecommendations.push('• Include a Professional Summary at the top to capture attention quickly');
    }

    if (sectionRecommendations.length > 0) {
      addText(sectionRecommendations.join('\n'));
    } else {
      addText('Your resume has good section structure. Consider enhancing existing sections with more specific details and quantifiable achievements.');
    }

    // Action Plan
    addSectionHeader('IMMEDIATE ACTION PLAN');
    const actionItems = [
      '1. Review and incorporate missing skills (if applicable to your experience)',
      '2. Add missing keywords naturally throughout your resume',
      '3. Ensure all important sections are present and well-developed',
      '4. Quantify achievements with specific metrics and numbers',
      '5. Tailor your resume specifically for this job position',
      '6. Proofread carefully for grammar and spelling errors',
      '7. Ensure formatting is clean and ATS-friendly'
    ];
    addText(actionItems.join('\n'));

    // Final Recommendations
    addSectionHeader('FINAL RECOMMENDATIONS');
    const finalAdvice = [
      `• Your current match score is ${score}/100 for this position`,
      '• Focus on addressing the missing skills and keywords identified above',
      '• Use action verbs and quantifiable achievements in your descriptions',
      '• Keep your resume concise (1-2 pages maximum)',
      '• Save as PDF with a professional filename',
      '• Consider having a colleague review your resume before applying'
    ];
    addText(finalAdvice.join('\n'));

    // Save the PDF
    const fileName = `AI-Resume-Analysis-${jobTitle.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);
    
  } catch (err) {
    console.error('PDF generation failed:', err);
    alert('Failed to generate PDF. Please try again.');
  }
}
