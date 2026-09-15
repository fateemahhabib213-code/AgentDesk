import { useState } from "react";
import ResearchInput from "./components/ResearchInput.jsx";
import AgentActivity from "./components/AgentActivity.jsx";
import ChatView from "./components/ChatView.jsx";

export default function App() {
  const [goal, setGoal] = useState("");
  const [submittedGoal, setSubmittedGoal] = useState(null);
  const [events, setEvents] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function runResearch() {
    setSubmittedGoal(goal);
    setLoading(true);
    setError(null);
    setReport(null);
    setEvents([]);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setEvents(data.events || []);
        setReport(data.report || null);
      }
    } catch (err) {
      setError("Could not reach the AgentDesk backend. Is it running?");
    } finally {
      setLoading(false);
    }
  }

  function handleNewResearch() {
    setGoal("");
    setSubmittedGoal(null);
    setEvents([]);
    setReport(null);
    setError(null);
  }

  return (
    <div className="app">
      <div className="bg-pattern" aria-hidden="true" />
      <header className="header">
        <div className="brand">
          <span className="brand-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="3" cy="3" r="1.6" fill="white" />
              <circle cx="13" cy="3" r="1.6" fill="white" />
              <circle cx="8" cy="13" r="1.6" fill="white" />
              <path d="M3 3L8 13M13 3L8 13M3 3L13 3" stroke="white" strokeWidth="1" opacity="0.7" />
            </svg>
          </span>
          <span className="brand-text">
            <span className="brand-mark">AgentDesk</span>
            <span className="brand-sub">Autonomous AI Research</span>
          </span>
        </div>

        <nav className="nav">
          <span className="nav-link active">Research</span>
          <span className="nav-link">History</span>
          <span className="nav-link">About</span>
        </nav>

        <div className="status-pill">
          <span className={`status-dot ${loading ? "busy" : ""}`} />
          {loading ? "Agent working" : "Agent ready"}
        </div>
      </header>

      {!submittedGoal && (
        <div className="hero-band">
          <div className="hero-band-content">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              AI Research Agent
            </div>
            <h1 className="hero-title">
              What should the agent
              <br />
              <span className="accent-word">research?</span>
            </h1>
            <p className="hero-sub">
              Give AgentDesk a goal. It plans the research, searches the web,
              evaluates what it finds, and corrects course before writing
              your report.
            </p>

            <ResearchInput
              goal={goal}
              setGoal={setGoal}
              onSubmit={runResearch}
              loading={loading}
              showForm={true}
            />
          </div>
        </div>
      )}

      {submittedGoal && (
        <div className="workspace">
          <main className="main main-chat">
            <ChatView
              goal={submittedGoal}
              events={events}
              report={report}
              loading={loading}
              error={error}
              onNewResearch={handleNewResearch}
            />
          </main>

          <AgentActivity events={events} />
        </div>
      )}
    </div>
  );
}
