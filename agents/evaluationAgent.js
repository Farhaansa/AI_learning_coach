// evaluationAgent.js — Measures learning outcome and improvement

export class EvaluationAgent {
  constructor() {
    this.scores = [];
    this.correctAnswers = 0;
    this.totalAnswers = 0;
  }

  measure(studentEvent, sessionHistory, iteration) {
    const { correct } = studentEvent;
    this.totalAnswers++;
    if (correct) this.correctAnswers++;

    const score = Math.round((this.correctAnswers / this.totalAnswers) * 100);
    this.scores.push(score);

    // Delta from previous iteration
    const delta = this.scores.length >= 2
      ? score - this.scores[this.scores.length - 2]
      : 0;

    // Mastery: 70%+ over at least 2 questions
    const mastered = score >= 70 && this.totalAnswers >= 2;

    // Knowledge state snapshot for diff viewer
    const conceptScores = {};
    sessionHistory.forEach(h => {
      const cid = h.studentEvent?.questionId?.[1]; // rough concept proxy
      if (!conceptScores[cid]) conceptScores[cid] = { correct: 0, total: 0 };
      conceptScores[cid].total++;
      if (h.studentEvent?.correct) conceptScores[cid].correct++;
    });

    return { score, delta, mastered, iteration, totalAnswers: this.totalAnswers, correctAnswers: this.correctAnswers, conceptScores };
  }

  reset() {
    this.scores = [];
    this.correctAnswers = 0;
    this.totalAnswers = 0;
  }
}
