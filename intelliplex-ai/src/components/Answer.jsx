
import { useEffect, useState } from "react";
import { checkHeading, replaceHeadingStarts } from "./helper";
import Markdown from "react-markdown";

export default function Answer({ ans, totalRes, index }) {
  const [heading, setHeading] = useState(false);
  const [answer, setAnswer] = useState(ans);

  useEffect(() => {
    if (checkHeading(ans)) {
      setHeading(true);
      setAnswer(replaceHeadingStarts(ans));
    } else {
      setAnswer(ans);
    }
  }, [ans]);

  return (
    <span>
      <Markdown
        components={{
        h1: ({ children }) => <h1 className="text-3xl font-bold text-blue-400 mb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-2xl font-semibold text-blue-300 mb-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-xl font-medium text-blue-200 mb-2">{children}</h3>,
        p: ({ children }) => <p className="text-base text-black mb-2">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside text-black mb-2">{children}</ul>,
        li: ({ children }) => <li className="ml-4 mb-1">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-black">{children}</strong>,
        em: ({ children }) => <em className="italic text-black">{children}</em>,
        }}>{answer}
      </Markdown>
    </span>
  );
}
