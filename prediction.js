import { DISEASE_RULES } from '../data/constants.js'

export function predictDisease(symptoms, userProfile) {
  if (!symptoms.length) return null
  let results = []
  for (const rule of DISEASE_RULES) {
    const matched = symptoms.filter(s => rule.symptoms.includes(s)).length
    if (matched === 0) continue
    const coverage = matched / rule.symptoms.length
    const relevance = matched / symptoms.length
    let score = coverage * 0.6 + relevance * 0.2 + rule.base * 0.2

    if (userProfile) {
      if (userProfile.age > 60) {
        if (["Heart Disease","Hypertension","Diabetes Type 2","Stroke Warning","Arthritis"].includes(rule.disease)) score *= 1.1
      }
      if (userProfile.age < 12) {
        if (["Common Cold","Gastroenteritis","Allergic Rhinitis"].includes(rule.disease)) score *= 1.08
      }
      const bmi = userProfile.weight / ((userProfile.height / 100) ** 2)
      if (bmi > 30 && ["Diabetes Type 2","Hypertension","Heart Disease"].includes(rule.disease)) score *= 1.08
      if (userProfile.past_diseases) {
        const past = userProfile.past_diseases.toLowerCase()
        if (past.includes('diabetes') && rule.disease.includes('Diabetes')) score *= 1.15
        if (past.includes('asthma') && rule.disease === 'Asthma') score *= 1.15
        if (past.includes('hypertension') && rule.disease === 'Hypertension') score *= 1.12
      }
    }
    score = Math.min(score, 0.97)
    results.push({ disease: rule.disease, confidence: score, matchedSymptoms: matched, totalSymptoms: rule.symptoms.length })
  }
  results.sort((a, b) => b.confidence - a.confidence)
  return results.slice(0, 5)
}

export function confidenceLevel(c) {
  if (c >= 0.8) return 'high'
  if (c >= 0.5) return 'moderate'
  return 'low'
}

export function confidenceColor(level) {
  return level === 'high' ? '#059669' : level === 'moderate' ? '#d97706' : '#dc2626'
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6)
}
