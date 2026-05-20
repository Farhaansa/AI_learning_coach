// diagnosisAgent.js — Root cause analysis of student struggles
import { CURRICULUM } from '../data/curriculum.js';

export class DiagnosisAgent {
  analyze(struggleData, studentEvent, sessionHistory) {
    const { score } = struggleData;
    const { correct, wrongAnswer, questionId, requestedHint, hesitated, timeMs } = studentEvent;
    
    // Find current question
    const question = CURRICULUM.questions.find(q => q.id === questionId) || CURRICULUM.questions[0];
    const concept = CURRICULUM.concepts.find(c => c.id === question.concept);

    // Determine root cause
    let rootCause, pattern, conceptGap, confidence;

    if (correct && score < 30) {
      rootCause = 'No significant struggle';
      pattern = 'Correct answer, good response time';
      conceptGap = 'None detected';
      confidence = 90;
    } else if (!correct && wrongAnswer) {
      // Check if the wrong answer matches a known misconception
      const misconception = question.commonMisconceptions?.[wrongAnswer];
      if (misconception) {
        rootCause = 'Conceptual Misconception';
        pattern = `Selected "${wrongAnswer}" — known misconception pattern`;
        conceptGap = `${concept?.name}: ${misconception}`;
        confidence = 88;
      } else {
        rootCause = 'Knowledge Gap';
        pattern = 'Incorrect answer without matching misconception pattern';
        conceptGap = `${concept?.name}: Foundational understanding incomplete`;
        confidence = 75;
      }
    } else if (timeMs > 20000 || hesitated) {
      rootCause = 'Recall Difficulty';
      pattern = 'Slow retrieval — information exists but access is slow';
      conceptGap = `${concept?.name}: Needs reinforcement for fluent recall`;
      confidence = 72;
    } else if (requestedHint) {
      rootCause = 'Attention / Comprehension';
      pattern = 'Requested hint — may not have understood question phrasing';
      conceptGap = `${concept?.name}: Question comprehension or attention gap`;
      confidence = 68;
    } else if (!correct) {
      rootCause = 'Procedural Error';
      pattern = 'Incorrect answer — possible calculation or step error';
      conceptGap = `${concept?.name}: Step-by-step procedure needs practice`;
      confidence = 70;
    } else {
      rootCause = 'Surface Understanding';
      pattern = 'Correct but slow or hesitant — shallow processing';
      conceptGap = `${concept?.name}: Deeper conceptual anchor needed`;
      confidence = 65;
    }

    // Historical pattern analysis
    const recentErrors = sessionHistory.filter(h => !h.studentEvent?.correct).length;
    if (recentErrors >= 2 && rootCause !== 'Conceptual Misconception') {
      rootCause = 'Persistent ' + rootCause;
      confidence = Math.max(confidence - 5, 60);
    }

    return { rootCause, pattern, conceptGap, confidence, concept, question };
  }
}
