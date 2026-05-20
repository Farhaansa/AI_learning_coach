// tutorAgent.js — Generates personalized coaching content
import { CURRICULUM } from '../data/curriculum.js';

export class TutorAgent {
  coach(interventionData, diagnosisData, studentEvent) {
    const { strategy, method } = interventionData;
    const { rootCause, concept, question, conceptGap } = diagnosisData;
    const { wrongAnswer, correct } = studentEvent;

    const blocks = [];
    let tone = 'encouraging';
    let mode = strategy;

    // Opening acknowledgment
    if (!correct) {
      blocks.push({
        type: 'acknowledge',
        emoji: '🤝',
        title: 'That\'s a tricky one!',
        content: `No worries — this is exactly where learning happens. Let's figure this out together.`
      });
    } else {
      blocks.push({
        type: 'acknowledge',
        emoji: '✅',
        title: 'You got it!',
        content: `Nice work. Let's make sure this concept really sticks.`
      });
    }

    // Misconception correction
    if (rootCause.includes('Misconception') && wrongAnswer && question) {
      const misconception = question.commonMisconceptions?.[wrongAnswer];
      if (misconception) {
        blocks.push({
          type: 'correction',
          emoji: '🔍',
          title: 'Here\'s what happened',
          content: misconception
        });
      }
      blocks.push({
        type: 'explanation',
        emoji: '💡',
        title: 'The Right Way to Think About It',
        content: question.correctExplanation
      });
      tone = 'corrective-positive';
    }

    // Knowledge gap — build from scratch
    if (rootCause.includes('Knowledge Gap') || rootCause.includes('Procedural')) {
      if (concept) {
        blocks.push({
          type: 'concept',
          emoji: '📖',
          title: `Concept: ${concept.name}`,
          content: concept.explanation,
          formula: concept.visual
        });
      }
      if (question) {
        blocks.push({
          type: 'worked',
          emoji: '📝',
          title: 'Worked Example',
          content: question.correctExplanation
        });
      }
      tone = 'instructional';
    }

    // Recall difficulty — add mnemonic
    if (rootCause.includes('Recall')) {
      blocks.push({
        type: 'mnemonic',
        emoji: '🎯',
        title: 'Memory Trick',
        content: `For the discriminant b² - 4ac, remember "Before Anything Check" (BAC) — you always check the discriminant BEFORE solving!`
      });
      blocks.push({
        type: 'review',
        emoji: '🔄',
        title: 'Quick Review',
        content: concept?.explanation || 'Review the core formula and its meaning.'
      });
      tone = 'supportive';
    }

    // Attention/comprehension — decompose question
    if (rootCause.includes('Attention')) {
      if (question) {
        blocks.push({
          type: 'decompose',
          emoji: '🔢',
          title: 'Let\'s Break It Down',
          content: `Step 1: Read only the first part of the question.\nStep 2: Identify a, b, and c.\nStep 3: Plug into the formula.\n\n${question.correctExplanation}`
        });
      }
      tone = 'step-by-step';
    }

    // Closing encouragement
    blocks.push({
      type: 'encourage',
      emoji: '🚀',
      title: 'You\'ve Got This',
      content: `Every mistake is a step forward. Try the next question with this in mind — you're building real understanding now.`
    });

    const readTime = Math.round(blocks.reduce((acc, b) => acc + b.content.length / 200, 0) * 60);

    return { mode, method, tone, contentBlocks: blocks, readTime };
  }
}
