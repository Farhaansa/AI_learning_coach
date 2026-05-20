// struggleAgent.js — Detects and scores struggle patterns

export class StruggleAgent {
  constructor() {
    this.previousScores = [];
  }

  detect(behaviorData, sessionHistory) {
    const { errorRate, responseTime, hesitationCount, hintRequests, confidence } = behaviorData;

    // Weighted struggle scoring (0–100)
    let score = 0;
    score += errorRate * 40;                        // errors are the strongest signal
    score += Math.min(responseTime / 30000, 1) * 20; // slow response = struggle
    score += hesitationCount * 10;                  // hesitation signals uncertainty
    score += hintRequests * 10;                     // hint requests = direct signal
    score += (10 - confidence) * 2;                 // low confidence adds to score
    score = Math.min(100, Math.round(score));

    this.previousScores.push(score);

    // Trend: rising, falling, stable
    let trend = 'stable';
    if (this.previousScores.length >= 2) {
      const last = this.previousScores[this.previousScores.length - 1];
      const prev = this.previousScores[this.previousScores.length - 2];
      trend = last > prev + 10 ? '⬆ Rising (worsening)' :
              last < prev - 10 ? '⬇ Falling (improving)' :
              '➡ Stable';
    }

    // Level label
    const level = score < 25 ? 'Minimal' :
                  score < 45 ? 'Mild' :
                  score < 65 ? 'Moderate' :
                  score < 85 ? 'High' : 'Critical';

    // Trigger reason
    const reasons = [];
    if (errorRate > 0.5) reasons.push('repeated incorrect answers');
    if (responseTime > 20000) reasons.push('very slow response');
    if (hesitationCount > 0) reasons.push('noticeable hesitation');
    if (hintRequests > 0) reasons.push('hint requested');
    if (confidence < 4) reasons.push('low self-confidence');
    const triggerReason = reasons.length ? reasons.join(', ') : 'baseline assessment';

    return { score, level, trend, triggerReason };
  }

  reset() {
    this.previousScores = [];
  }
}
