// interventionAgent.js — Selects optimal intervention strategy

const STRATEGY_MAP = {
  'Conceptual Misconception': {
    strategy: 'Misconception Correction',
    method: 'Targeted reframe with counterexample',
    adaptation: 'Address the specific wrong belief directly',
    expectedUplift: 28
  },
  'Knowledge Gap': {
    strategy: 'Scaffolded Explanation',
    method: 'Build from fundamentals with worked example',
    adaptation: 'Start simpler, progress to target difficulty',
    expectedUplift: 22
  },
  'Recall Difficulty': {
    strategy: 'Spaced Retrieval + Mnemonic',
    method: 'Memory aid + retrieval practice',
    adaptation: 'Embed mnemonic device, schedule follow-up',
    expectedUplift: 18
  },
  'Attention / Comprehension': {
    strategy: 'Question Decomposition',
    method: 'Break question into sub-questions',
    adaptation: 'Simplify language, add visual anchors',
    expectedUplift: 20
  },
  'Procedural Error': {
    strategy: 'Step-by-Step Walkthrough',
    method: 'Annotated worked example',
    adaptation: 'Highlight each calculation step explicitly',
    expectedUplift: 25
  },
  'Surface Understanding': {
    strategy: 'Conceptual Deepening',
    method: 'Analogy + application challenge',
    adaptation: 'Connect to real-world scenario',
    expectedUplift: 15
  },
  'No significant struggle': {
    strategy: 'Enrichment / Challenge',
    method: 'Introduce next concept or harder problem',
    adaptation: 'Accelerate pacing',
    expectedUplift: 5
  }
};

export class InterventionAgent {
  select(diagnosisData, studentEvent, sessionHistory) {
    const { rootCause } = diagnosisData;

    // Match root cause to strategy (handle "Persistent X")
    const key = Object.keys(STRATEGY_MAP).find(k => rootCause.includes(k)) || 'Knowledge Gap';
    let strategy = { ...STRATEGY_MAP[key] };

    // Adapt based on iteration history
    const attempts = sessionHistory.length;
    if (attempts >= 2) {
      strategy.adaptation += ' (adjusted for repeated attempts)';
      strategy.expectedUplift = Math.max(strategy.expectedUplift - 5, 5);
    }

    // Select method based on question difficulty
    if (studentEvent.questionDifficulty >= 3) {
      strategy.adaptation += ' + simplified prerequisite review';
    }

    return strategy;
  }
}
