// curriculum.js — Subject content, questions, misconceptions, interventions

export const CURRICULUM = {
  subject: "Quadratic Equations",
  description: "Understanding quadratic equations and their solutions",

  concepts: [
    {
      id: "c1",
      name: "What is a Quadratic?",
      explanation: "A quadratic equation has the form ax² + bx + c = 0, where a ≠ 0.",
      visual: "ax² + bx + c = 0"
    },
    {
      id: "c2",
      name: "Discriminant",
      explanation: "The discriminant b² - 4ac tells us how many solutions exist.",
      visual: "Δ = b² - 4ac"
    },
    {
      id: "c3",
      name: "Quadratic Formula",
      explanation: "x = (-b ± √(b²-4ac)) / 2a gives us the roots directly.",
      visual: "x = (-b ± √Δ) / 2a"
    }
  ],

  questions: [
    {
      id: "q1",
      text: "Which of the following is a quadratic equation?",
      concept: "c1",
      difficulty: 1,
      options: [
        { id: "a", text: "3x + 5 = 0", correct: false },
        { id: "b", text: "x² - 4x + 3 = 0", correct: true },
        { id: "c", text: "x³ + 2x = 0", correct: false },
        { id: "d", text: "√x = 4", correct: false }
      ],
      correctExplanation: "x² - 4x + 3 = 0 has degree 2 — that's what makes it quadratic.",
      commonMisconceptions: {
        "a": "3x + 5 = 0 is linear (degree 1), not quadratic.",
        "c": "x³ + 2x = 0 is cubic (degree 3), one step above quadratic.",
        "d": "√x = 4 is not even a polynomial equation in standard form."
      }
    },
    {
      id: "q2",
      text: "For x² - 5x + 6 = 0, what is the value of the discriminant (b² - 4ac)?",
      concept: "c2",
      difficulty: 2,
      options: [
        { id: "a", text: "1", correct: true },
        { id: "b", text: "-1", correct: false },
        { id: "c", text: "25", correct: false },
        { id: "d", text: "49", correct: false }
      ],
      correctExplanation: "b² - 4ac = (-5)² - 4(1)(6) = 25 - 24 = 1. Positive discriminant means 2 real roots.",
      commonMisconceptions: {
        "b": "You may have forgotten to square b first. (-5)² = 25, not -25.",
        "c": "You computed b² = 25 but forgot to subtract 4ac = 24.",
        "d": "Check the formula: b² - 4ac, not b² + 4ac."
      }
    },
    {
      id: "q3",
      text: "Using the quadratic formula, solve x² - 5x + 6 = 0. What are the roots?",
      concept: "c3",
      difficulty: 3,
      options: [
        { id: "a", text: "x = 2 and x = 3", correct: true },
        { id: "b", text: "x = -2 and x = -3", correct: false },
        { id: "c", text: "x = 5 and x = 6", correct: false },
        { id: "d", text: "x = 1 and x = 6", correct: false }
      ],
      correctExplanation: "x = (5 ± √1) / 2 = (5 ± 1) / 2 → x = 3 or x = 2. Check: (x-2)(x-3) = 0 ✓",
      commonMisconceptions: {
        "b": "The equation is x² - 5x + 6, not x² + 5x + 6. Signs matter!",
        "c": "x = 5 and x = 6 are the coefficients, not the roots.",
        "d": "Careful with the formula: x = (-b ± √Δ) / 2a. Don't forget the division by 2a."
      }
    },
    {
      id: "q4",
      text: "For 2x² + 3x - 2 = 0, identify a, b, and c. What is 4ac?",
      concept: "c2",
      difficulty: 2,
      options: [
        { id: "a", text: "-16", correct: true },
        { id: "b", text: "16", correct: false },
        { id: "c", text: "-4", correct: false },
        { id: "d", text: "24", correct: false }
      ],
      correctExplanation: "a=2, b=3, c=-2. So 4ac = 4(2)(-2) = -16.",
      commonMisconceptions: {
        "b": "c is negative here (-2), so 4ac = 4(2)(-2) = -16, not +16.",
        "c": "4ac = 4 × a × c = 4 × 2 × (-2) = -16, not just 4 × c.",
        "d": "Check: a=2, c=-2. 4ac = 4(2)(-2). The product of a positive and negative is negative."
      }
    },
    {
      id: "q5",
      text: "If the discriminant is negative (Δ < 0), how many real solutions does the equation have?",
      concept: "c2",
      difficulty: 2,
      options: [
        { id: "a", text: "Zero real solutions", correct: true },
        { id: "b", text: "Exactly one real solution", correct: false },
        { id: "c", text: "Two real solutions", correct: false },
        { id: "d", text: "Infinitely many solutions", correct: false }
      ],
      correctExplanation: "Δ < 0 means √Δ is imaginary — so there are no real roots, only complex ones.",
      commonMisconceptions: {
        "b": "One real solution happens when Δ = 0 exactly (a perfect square).",
        "c": "Two real solutions require Δ > 0.",
        "d": "Quadratic equations always have at most 2 solutions."
      }
    }
  ],

  interventionTemplates: {
    misconception: {
      hint: (concept, detail) => `💡 Hint: Focus on the definition of ${concept}. ${detail}`,
      analogy: (concept) => `🧠 Think of it like this: In ${concept}, it's similar to how you sort things in daily life — order matters!`,
      reframe: (concept, explanation) => `🔄 Let's reframe: ${explanation}`,
      worked_example: (concept, visual) => `📝 Worked Example for ${concept}:\n${visual}\nLet's trace through this step by step...`
    },
    attention: {
      break_down: (q) => `🔢 Let's break "${q}" into smaller steps. Focus on one part at a time.`,
      simplify: () => `✂️ Ignore the numbers for now. What is the question actually asking?`
    },
    recall: {
      review: (concept, explanation) => `📖 Quick Review: ${explanation}`,
      mnemonic: () => `🎯 Memory trick: "b² - 4ac" — think "Before Anything Check" (BAC) for the discriminant!`
    }
  },

  masteryThreshold: 70, // % score needed to mark concept as mastered
};
