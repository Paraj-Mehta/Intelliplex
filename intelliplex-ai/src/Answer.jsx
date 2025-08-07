// src/Answer.jsx
export default function Answer({ module, level }) {
  return (
    <div className="mt-6 p-4 border rounded bg-white/10 text-white">
      <h2 className="text-xl font-bold mb-2">Level {level} Module</h2>
      <p>{module}</p>
    </div>
  );
}
