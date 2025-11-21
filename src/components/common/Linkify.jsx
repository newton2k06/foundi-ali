export default function Linkify({ text }) {
  if (!text) return null;

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return text.split(urlRegex).map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline font-semibold"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
