// behaviorAgent.js — Tracks and analyzes student behavior signals

export class BehaviorAgent {
  constructor() {
    this.sessionStartTime = Date.now();
    this.cumulativeErrors = 0;
    this.totalAttempts = 0;
  }

  analyze(studentEvent) {
    const {
      correct,
      timeMs,
      hesitated,
      requestedHint,
      attemptNumber,
      wrongAnswer,
      questionDifficulty
    } = studentEvent;

    this.totalAttempts++;
    if (!correct) this.cumulativeErrors++;

    const errorRate = this.cumulativeErrors / this.totalAttempts;
    const normalizedTime = Math.min(timeMs / 30000, 1); // normalize to 0–1 over 30s
    const difficultyPenalty = questionDifficulty * 0.1;

    // Confidence: inverse of error rate + time pressure + hesitation
    let confidence = 10 - (errorRate * 4) - (normalizedTime * 2) - (hesitated ? 1.5 : 0) - (requestedHint ? 1 : 0);
    confidence = Math.max(1, Math.min(10, parseFloat(confidence.toFixed(1))));

    return {
      responseTime: timeMs,
      errorRate: parseFloat(errorRate.toFixed(2)),
      hesitationCount: hesitated ? 1 : 0,
      hintRequests: requestedHint ? 1 : 0,
      correct,
      wrongAnswer: wrongAnswer || null,
      attemptNumber,
      questionDifficulty,
      confidence,
      difficultyPenalty,
      timestamp: Date.now()
    };
  }

  reset() {
    this.sessionStartTime = Date.now();
    this.cumulativeErrors = 0;
    this.totalAttempts = 0;
  }
}
