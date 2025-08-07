import { URL } from "./secret.js";
import { useState } from 'react';
import './App.css';
import Answer from "./components/Answer.jsx";
import Quiz from "./Quiz.jsx";


function App() {
  const [advancedModule, setAdvancedModule] = useState(null);
  const [welcome, setWelcome] = useState("Welcome");
  const [topic, setTopic] = useState("");
  const [module, setModule] = useState([]);
  const [advancedQuiz, setAdvancedQuiz] = useState(null); // State for the advanced quiz
  const [quiz, setQuiz] = useState(null); // State for the basic quiz
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
    setQuiz(null); // Clear basic quiz
    setAdvancedQuiz(null); // ✅ Clear advanced quiz when a new topic is asked
    setAdvancedModule(null); // ✅ Clear advanced module when a new topic is asked

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
    const newEntry = {
      topic,
      basicResponse: sections,
      advancedResponse: null // Start with null for the advanced module
    };
    const updatedHistory = [newEntry, ...recentHistory.filter(item => item.topic !== topic)];
    localStorage.setItem('history', JSON.stringify(updatedHistory));
    setRecentHistory(updatedHistory);

    setModule([{ type: "topic", text: topic }, { type: "module", text: sections }]);
  };

const generateQuiz = async (moduleData, setQuizState) => {
  if (!Array.isArray(moduleData) || moduleData.length === 0) {
    return;
  }

  let contextText;
  if (moduleData[0] && typeof moduleData[0] === 'object' && moduleData[0].type === "module") {
    contextText = moduleData.find((item) => item.type === "module").text.join("\n\n");
  } else {
    contextText = moduleData.join("\n\n");
  }

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `Generate 5 multiple choice quiz questions based on the following study material on the topic of "${topic}".
            
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
      parsedQuiz = JSON.parse(rawText);
    }

    if (Array.isArray(parsedQuiz) && parsedQuiz.length > 0) {
      setQuizState(parsedQuiz);
    } else {
      setQuizState(null);
      console.error("Parsed quiz data is an empty array.");
    }
  } catch (e) {
    setQuizState(null);
    console.error("Failed to generate quiz:", e);
  }
};

  const generateAdvancedModule = async () => {
    if (!topic.trim()) return;

    setQuiz(null); // Clear basic quiz
    setAdvancedQuiz(null); // ✅ Clear advanced quiz when generating a new advanced module

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Generate an advanced study module on the topic: "${topic}". Increase the difficulty and include more detailed, complex information compared to the previous module. Use the following sections:
                        - Advanced Concepts
                        - Complex Examples
                        - Research and Future Directions
                        - In-depth Summary`
            }
          ]
        }
      ]
    };

    try {
      let response = await fetch(URL, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      response = await response.json();
      const dataStr = response.candidates[0].content.parts[0].text;
      const sections = dataStr.split(/\n(?=[A-Z][^:]+:)/).map(s => s.trim());

      // Update the state with the new advanced module
      setAdvancedModule(sections);
      const currentEntryIndex = recentHistory.findIndex(item => item.topic === topic);
      if (currentEntryIndex !== -1) {
        const updatedHistory = [...recentHistory];
        updatedHistory[currentEntryIndex].advancedResponse = sections;
        localStorage.setItem('history', JSON.stringify(updatedHistory));
        setRecentHistory(updatedHistory);
      }

    } catch (e) {
      console.error("Failed to generate advanced module:", e);
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
                  const topicData = item; // assuming 'item' is the history entry
                  setTopic(topicData.topic);
                  setModule([
                    { type: "topic", text: topicData.topic },
                    { type: "module", text: topicData.basicResponse }
                  ]);
                  setAdvancedModule(topicData.advancedResponse);
                  setQuiz(null); // Clear basic quiz state when loading from history
                  setAdvancedQuiz(null); // ✅ Clear advanced quiz state when loading from history
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
        {welcome && <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-600 text-5xl font-bold">
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

        {/* Basic Quiz Button */}
        {module.length > 0 && !quiz && (
          <div className="mt-4">
            <button
              onClick={() => generateQuiz(module, setQuiz)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              Give Quiz
            </button>
          </div>
        )}

        {/* Basic Quiz Display */}
        {quiz && <Quiz quiz={quiz} generateAdvancedModule={generateAdvancedModule} />}

        {/* Display the advanced module if it exists */}
        {advancedModule && (
          <>
            <div className='container h-160 overflow-auto text-left text-zinc-300'>
              <ul>
                {advancedModule.map((section, i) => (
                  <li key={`advanced-${i}`} className="bg-white text-black p-3 m-2 rounded-lg shadow-md">
                    <Answer ans={section} totalRes={advancedModule.length} index={i} />
                  </li>
                ))}
              </ul>
            </div>
            {/* New "Give Quiz" button for the advanced module */}
            <div className="mt-4">
              <button
                onClick={() => generateQuiz(advancedModule, setAdvancedQuiz)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
              >
                Give Advanced Quiz
              </button>
            </div>

            {/* Advanced Quiz Display */}
            {advancedQuiz && <Quiz quiz={advancedQuiz} />}
          </>
        )}

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