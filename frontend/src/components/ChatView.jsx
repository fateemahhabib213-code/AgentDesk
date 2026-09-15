import ResearchProgress from "./ResearchProgress.jsx";
import ResearchReport from "./ResearchReport.jsx";

export default function ChatView({ goal, events, report, loading, error, onNewResearch }) {
  return (
    <div className="chat-view">
      <div className="chat-row chat-row-user">
        <div className="chat-bubble chat-bubble-user">{goal}</div>
      </div>

      <div className="chat-row chat-row-agent">
        <div className="chat-avatar">✦</div>
        <div className="chat-bubble chat-bubble-agent">
          {loading && (
            <div className="loading-line">
              <span className="spinner" />
              Planning, searching, and checking its own work…
            </div>
          )}

          {error && <div className="error-banner">{error}</div>}

          {events.length > 0 && <ResearchProgress events={events} loading={loading} />}

          {report && (
            <ResearchReport report={report} onNewResearch={onNewResearch} />
          )}
        </div>
      </div>
    </div>
  );
}
