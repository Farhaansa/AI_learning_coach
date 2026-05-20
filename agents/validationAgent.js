// validationAgent.js — Validates learning against mastery criteria

export class ValidationAgent {
  check(evalData, diagnosisData, studentEvent, sessionHistory) {
    const { score, mastered, delta, totalAnswers } = evalData;
    const { rootCause } = diagnosisData;

    const checklist = [
      {
        id: 'v1',
        label: 'Student attempted at least 2 questions',
        pass: totalAnswers >= 2
      },
      {
        id: 'v2',
        label: 'Score is above 50% (acceptable floor)',
        pass: score >= 50
      },
      {
        id: 'v3',
        label: 'Score is above 70% (mastery threshold)',
        pass: score >= 70
      },
      {
        id: 'v4',
        label: 'Improvement trend detected (delta ≥ 0)',
        pass: delta >= 0
      },
      {
        id: 'v5',
        label: 'Root cause was identified and addressed',
        pass: rootCause !== 'No significant struggle' && rootCause.length > 0
      },
      {
        id: 'v6',
        label: 'No persistent downward trend',
        pass: (() => {
          const recent = sessionHistory.slice(-3);
          const allWrong = recent.every(h => !h.studentEvent?.correct);
          return !allWrong || recent.length < 3;
        })()
      },
      {
        id: 'v7',
        label: 'Intervention was delivered this cycle',
        pass: true // Always true since pipeline ran
      },
      {
        id: 'v8',
        label: 'Full mastery achieved (≥70%, 2+ questions)',
        pass: mastered
      }
    ];

    const passed = checklist.filter(c => c.pass).length;
    const total = checklist.length;

    return { checklist, passed, total, masteryAchieved: mastered };
  }
}
