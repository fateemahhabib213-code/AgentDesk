import SourceCard from "./SourceCard.jsx";

export default function ResearchReport({ report, onNewResearch }) {
  function handleCopy() {
    const text = [
      report.title,
      "",
      report.executive_summary,
      "",
      "Key findings:",
      ...report.key_findings.map((f) => `- ${f}`),
      "",
      "Comparison:",
      report.comparison,
      "",
      "Conclusion:",
      report.conclusion,
    ].join("\n");
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="section">
      <div className="section-label">final report</div>
      <div className="report-meta">
        <span>✓ Research complete</span>
        <span className="report-meta-dot">•</span>
        <span>{report.sources?.length || 0} sources analyzed</span>
        <span className="report-meta-dot">•</span>
        <span>{report.key_findings?.length || 0} findings</span>
      </div>

      <h2 className="report-title">{report.title}</h2>

      <div className="report-block">
        <h4><span className="block-icon">✦</span>Executive summary</h4>
        <p>{report.executive_summary}</p>
      </div>

      {report.key_findings?.length > 0 && (
        <div className="report-block">
          <h4><span className="block-icon">💡</span>Key findings</h4>
          <ul className="findings-list">
            {report.key_findings.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {report.comparison && (
        <div className="report-block">
          <h4><span className="block-icon">⚖</span>Comparison</h4>
          <p>{report.comparison}</p>
        </div>
      )}

      <div className="report-block">
        <h4><span className="block-icon">◆</span>Conclusion</h4>
        <p>{report.conclusion}</p>
      </div>

      <div className="report-actions">
        <button className="btn-secondary" onClick={handleCopy}>
          Copy report
        </button>
        <button className="btn-secondary" onClick={onNewResearch}>
          New research
        </button>
      </div>

      {report.sources?.length > 0 && (
        <div className="section">
          <div className="section-label"><span className="block-icon">🔗</span>sources</div>
          {report.sources.map((s, i) => (
            <SourceCard key={i} source={s} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
