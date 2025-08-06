import { URL } from "./constants.js";
import { useState } from 'react';
import './App.css';
import Answer from "./components/Answer.jsx";
import Quiz from "./Quiz.jsx";


function App() {
  const [welcome, setWelcome] = useState("Welcome");
  const [topic, setTopic] = useState("");
  const [module, setModule] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [recentHistory, setRecentHistory] = useState(() => {
    const saved = localStorage.getItem('history');
    return saved ? JSON.parse(saved) : [];
  });



  const deleteTopic = (indexToRemove) => {
  const updated = recentHistory.filter((_, index) => index !== indexToRemove);
  setRecentHistory(updated);
  localStorage.setItem('history', JSON.stringify(updated));
  };


  const askTopic = async () => {
    if (!topic.trim()) return;

    setWelcome("");
    setQuiz(null);
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Generate a detailed study module for the topic: "${topic}". Include the following sections:
                      - Overview
                      - Important Subtopics
                      - Key Concepts
                      - Real-life Applications
                      - Summary`
            }
          ]
        }
      ]
    };

    let response = await fetch(URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    response = await response.json();

    let dataStr = response.candidates[0].content.parts[0].text;
    let sections = dataStr.split(/\n(?=[A-Z][^:]+:)/).map(s => s.trim());

    // Add topic + response to history
    const newEntry = { topic, response: sections };
    const updatedHistory = [newEntry, ...recentHistory.filter(item => item.topic !== topic)]; // prevent duplicates

    localStorage.setItem('history', JSON.stringify(updatedHistory));
    setRecentHistory(updatedHistory);
 
    setModule([{ type: "topic", text: topic }, { type: "module", text: sections }]);
  };

  const generateQuiz = async () => {
      if (!module.length) return;

      const contextText = module
        .find((item) => item.type === "module")
        .text.join("\n\n");

      const payload = {
        contents: [
          {
            parts: [
              {
                text: `Generate 5 multiple choice quiz questions based on the following study material. 

                Return your answer in strict JSON format like this:
                
                [
                  {
                    "question": "Question here?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "answer": "Correct Option"
                  },
                  ...
                ]
                
                Study Material:
                ${contextText}`
              }
            ]
          }
        ]
      };

  try {
    let response = await fetch(URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    response = await response.json();
    const rawText = response.candidates[0].content.parts[0].text;

    const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/);
    let parsedQuiz;

    if (jsonMatch && jsonMatch[1]) {
      parsedQuiz = JSON.parse(jsonMatch[1]);
    } else {
      // Fallback if markdown isn't used
      parsedQuiz = JSON.parse(rawText);
    }
    
    // Check if the parsed data is a non-empty array
    if (Array.isArray(parsedQuiz) && parsedQuiz.length > 0) {
      setQuiz(parsedQuiz);
    } else {
      // If parsing succeeds but the array is empty, set quiz to null to show the button again
      setQuiz(null);
      console.error("Parsed quiz data is an empty array.");
    }

  } catch (e) {
    // If any part of the process fails (fetch, parse), handle the error.
    // Set quiz to null so the user can try again.
    setQuiz(null);
    console.error("Failed to generate quiz:", e);
    // You can also add user-facing feedback here, e.g., a toast notification.
  }
};

  return (
    <div className='grid grid-cols-5 min-h-screen text-center bg-gradient-to-br from-purple-200 to-purple-400'>

      {/* Sidebar */}
      <div className='col-span-1 bg-white text-black p-2 overflow-y-auto shadow-md'>
        <h2 className="text-black font-bold mb-2">History</h2>
        <ul>
          {recentHistory.map((item, index) => (
            <li key={index} className="text-black p-2 border-b border-gray-300 flex justify-between items-center group">
              
              {/* Click to load existing module */}
              <span
                className="cursor-pointer hover:underline"
                onClick={() => {
                  setTopic(item.topic);
                  setModule([
                    { type: "topic", text: item.topic },
                    { type: "module", text: item.response }
                  ]);
                }}
              >
                {item.topic}
              </span>

              {/* Delete topic */}
              <button
                onClick={() => deleteTopic(index)}
                className="text-red-400 hover:text-red-600 ml-2 transition"
                title="Delete"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>

      </div>

      {/* Main Content */}
      <div className='col-span-4 p-4'>
        {welcome&& <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-600 text-5xl font-bold">
          Welcome! <br /> Begin Learning</h1>}
        {/* Display Module */}
        <div className='container h-160 overflow-auto text-left text-zinc-300'>
          <ul>
            {module.map((item, index) => {
              if (item.type === "topic") {
                return (
                  <li key={index} className="bg-white text-black p-3 m-2 rounded-lg shadow-md">
                    📘 Study Module for: {item.text}
                  </li>
                );
              } else if (item.type === "module") {
                return item.text.map((section, i) => (
                  <li key={i} className="bg-white text-black p-3 m-2 rounded-lg shadow-md">
                    <Answer ans={section} totalRes={item.text.length} index={i} />
                  </li>
                ));
              }
              return null;
            })}
          </ul>
        </div>
        
        {module.length > 0 && !quiz && (
          <div className="mt-4">
            <button
              onClick={generateQuiz}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              Give Quiz
            </button>
          </div>
        )}

      {quiz && <Quiz quiz={quiz} />}



        {/* Input */}
        <div className='bg-white w-1/2 bottom-16 max-w-xl text-black p-1 m-auto rounded-4xl border border-purple-300 flex h-16 shadow-lg'>
          <input
            className="w-full h-full p-3 outline-none"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            type="text"
            placeholder='Enter a topic (e.g., Photosynthesis)'
          />
          <button onClick={askTopic} className="ml-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-4xl">
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
