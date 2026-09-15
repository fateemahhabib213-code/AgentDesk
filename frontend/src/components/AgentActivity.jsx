// Turns a raw backend event into { label, detail, state } for display.
function formatEvent(event) {
  switch (event.type) {
    case "goal_received":
      return { label: "Goal received", detail: event.goal, state: "done" };
    case "planning":
      return event.status === "started"
        ? { label: "Planning search strategy", detail: null, state: "active" }
        : { label: "Plan ready", detail: event.query, state: "done" };
    case "search":
      return {
        label: `Searching (attempt ${event.attempt + 1})`,
        detail: event.query,
        state: "active",
      };
    case "search_results":
      return { label: `${event.count} results found`, detail: null, state: "done" };
    case "evaluation":
      if (event.status === "started") {
        return { label: "Evaluating result quality", detail: null, state: "active" };
      }
      return {
        label: `Quality: ${event.verdict.quality}`,
        detail: event.verdict.reason,
        state: event.verdict.quality === "low" ? "warn" : "done",
      };
    case "correction":
      if (event.status === "started") {
        return { label: "Self-correcting", detail: event.reason, state: "warn" };
      }
      if (event.status === "retry_limit_reached") {
        return {
          label: "Retry limit reached",
          detail: "Proceeding with best available results",
          state: "warn",
        };
      }
      return { label: "Refined query", detail: event.new_query, state: "done" };
    case "synthesis":
      return event.status === "started"
        ? { label: "Writing report", detail: null, state: "active" }
        : { label: "Report generated", detail: null, state: "done" };
    case "completed":
      return { label: "Research complete", detail: null, state: "done" };
    case "error":
      return { label: `Error in ${event.stage}`, detail: event.message, state: "error" };
    default:
      return { label: event.type, detail: null, state: "done" };
  }
}

function StateIcon({ state }) {
  if (state === "done") {
    return (
      <span className="activity-icon icon-done">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6.5L5 9L9.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (state === "active") {
    return <span className="activity-icon icon-active" />;
  }
  if (state === "warn") {
    return (
      <span className="activity-icon icon-warn">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M6 2L11 10H1L6 2Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
          <line x1="6" y1="5" x2="6" y2="7" stroke="white" strokeWidth="1.2" />
        </svg>
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="activity-icon icon-error">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M3 3L9 9M9 3L3 9" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  return <span className="activity-icon icon-pending" />;
}

export default function AgentActivity({ events }) {
  return (
    <aside className="activity-panel">
      <div className="activity-heading">Live Agent Activity</div>
      <div className="activity-subheading">
        Watch the agent plan, search, evaluate, and self-correct in real time.
      </div>

      {events.length === 0 ? (
        <p className="activity-empty">
          The agent's plan, searches, self-corrections, and synthesis will
          appear here as they happen — a full audit trail of its reasoning.
        </p>
      ) : (
        <div className="activity-list">
          {events.map((event, i) => {
            const { label, detail, state } = formatEvent(event);
            return (
              <div key={i} className={`activity-item state-${state}`}>
                <StateIcon state={state} />
                <div className="activity-text">
                  <div className="activity-label">{label}</div>
                  {detail && <div className="activity-detail">{detail}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
