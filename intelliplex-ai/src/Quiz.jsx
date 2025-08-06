import { useState } from "react";

export default function Quiz({ quiz }) {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);

  if (!quiz || !Array.isArray(quiz) || quiz.length === 0) {
    return <p className="text-center text-gray-300 mt-4">No quiz data available.</p>;
  }

  const currentQ = quiz[currentIndex];

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    const isCorrect = option === currentQ.answer;
    if (isCorrect) setScore((prev) => prev + 1);

    setAnswers((prev) => [
      ...prev,
      { question: currentQ.question, selected: option, correct: currentQ.answer },
    ]);

    setTimeout(() => {
      if (currentIndex + 1 < quiz.length) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-black">
      {!showResult ? (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-200">
          <h2 className="text-2xl font-bold mb-4">
            Q{currentIndex + 1}: {currentQ?.question || "Unknown"}
          </h2>
          <div className="space-y-3">
            {currentQ.options?.map((option, index) => {
              const isCorrect = option === currentQ.answer;
              const isWrong = selectedOption && option === selectedOption && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  disabled={!!selectedOption}
                  className={`w-full text-left px-4 py-2 rounded border transition duration-300
                    ${
                        selectedOption
                            ? isCorrect
                            ? "bg-green-600 border-green-400"
                            : isWrong
                            ? "bg-red-600 border-red-400"
                            : "bg-white border-black/30"
                            : "bg-white hover:bg-zinc-100 border-black/30"
                        }
                    `}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg text-black text-center shadow-lg border border-purple-200">
          <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
          <p className="mb-4 text-lg">
            Your score: {score} / {quiz.length}
          </p>
          <div className="text-left space-y-4">
            {answers.map((a, i) => (
              <div key={i} className="p-4 bg-purple-100 rounded-md border border-purple-300">
                <p className="font-semibold">Q{i + 1}: {a.question}</p>
                <p>
                  Your answer:{" "}
                  <span
                    className={`font-semibold ${
                      a.selected === a.correct ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {a.selected}
                  </span>
                </p>
                {a.selected !== a.correct && (
                  <p className="text-sm text-black">
                    Correct: <span className="text-green-400">{a.correct}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
