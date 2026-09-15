function getDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export default function SourceCard({ source, index }) {
  const domain = getDomain(source.url);
  return (
    <div className="source-card">
      <span className="source-index">{index}</span>
      <div className="source-body">
        <div className="source-domain">{domain}</div>
        <a
          className="source-title"
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {source.title}
        </a>
        <a
          className="source-open"
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open source →
        </a>
      </div>
    </div>
  );
}
