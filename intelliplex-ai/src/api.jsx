// src/api.js

export function generateModule(topic, level = 1) {
  return `This is a level ${level} explanation of "${topic}". ${
    level === 1
      ? "Basic introduction."
      : level === 2
      ? "Intermediate concepts with examples."
      : "Advanced insights and technical depth."
  }`;
}

export function generateQuiz(topic, level = 1) {
  return [
    {
      question: `What is a key aspect of ${topic} at level ${level}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      answer: 0,
    },
    {
      question: `Which of the following is true about ${topic} (Level ${level})?`,
      options: ["True", "False", "Maybe", "Unknown"],
      answer: 1,
    },
  ];
}
