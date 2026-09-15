const STAGES = ["Plan", "Search", "Evaluate", "Refine", "Synthesize"];

function computeStageStatus(events, loading) {
  const has = (type, status) =>
    events.some((e) => e.type === type && (!status || e.status === status));

  const hasCorrection = has("correction");
  const done = {
    Plan: has("planning", "completed"),
    Search: has("search_results"),
    Evaluate: has("evaluation", "completed"),
    Refine: hasCorrection,
    Synthesize: has("synthesis", "completed"),
  };

  let active = null;
  if (loading) {
    active = STAGES.find((s) => !done[s]) || null;
  }

  return { done, active };
}

function buildCorrections(events) {
  const items = [];
  let currentQuery = null;
  let pending = null;

  events.forEach((e) => {
    if (e.type === "planning" && e.status === "completed") {
      currentQuery = e.query;
    }
    if (e.type === "correction" && e.status === "started") {
      pending = { previousQuery: currentQuery, reason: e.reason };
    }
    if (e.type === "correction" && e.status === "completed" && pending) {
      items.push({ ...pending, refinedQuery: e.new_query });
      currentQuery = e.new_query;
      pending = null;
    }
  });

  return items;
}

function StepIcon({ isDone, isActive, isSkipped }) {
  if (isDone) {
    return (
      <span className="step-icon step-icon-done">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6.5L5 9L9.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (isActive) {
    return (
      <span className="step-icon step-icon-active">
        <span className="step-icon-dot" />
      </span>
    );
  }
  return <span className={`step-icon step-icon-pending ${isSkipped ? "step-icon-skipped" : ""}`} />;
}

export default function ResearchProgress({ events, loading = false }) {
  const { done, active } = computeStageStatus(events, loading);
  const corrections = buildCorrections(events);
  const finished = !loading && events.length > 0;

  return (
    <>
      <div className="stepper">
        {STAGES.map((stage, i) => {
          const isDone = done[stage];
          const isActive = stage === active;
          // "Refine" only ever fires when self-correction actually happened —
          // if the research finished without it, show it as skipped, not pending.
          const isSkipped = stage === "Refine" && finished && !isDone;
          const status = isDone ? "Completed" : isActive ? "In progress" : isSkipped ? "Skipped" : "Pending";

          return (
            <div className="step" key={stage}>
              {i > 0 && <span className={`step-line ${done[STAGES[i - 1]] ? "step-line-done" : ""}`} />}
              <StepIcon isDone={isDone} isActive={isActive} isSkipped={isSkipped} />
              <div className="step-text">
                <div className={`step-label ${isActive ? "step-label-active" : ""}`}>{stage}</div>
                <div className="step-status">{status}</div>
              </div>
            </div>
          );
        })}
      </div>

      {corrections.map((c, i) => (
        <div className="correction-block" key={i}>
          <div className="correction-title">SELF-CORRECTION</div>
          <p className="correction-reason">{c.reason}</p>
          <div className="correction-flow">
            <span className="correction-query old">{c.previousQuery}</span>
            <span>→</span>
            <span className="correction-query">{c.refinedQuery}</span>
          </div>
        </div>
      ))}
    </>
  );
}
