const EXAMPLES = [
  "Compare the top AI coding assistants",
  "Research the best productivity apps for students",
  "Compare the pricing of leading cloud providers",
  "Research the top competitors of OpenAI",
];

export default function ResearchInput({ goal, setGoal, onSubmit, loading, showForm }) {
  if (!showForm) return null;

  return (
    <form
      className="goal-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading) onSubmit();
      }}
    >
      <textarea
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="Research the top 3 competitors of Tesla and compare their pricing..."
        disabled={loading}
      />

      <div className="goal-actions">
        <span className="char-hint">{goal.length} characters</span>
        <button type="submit" className="btn-primary" disabled={loading || !goal.trim()}>
          {loading ? "Researching…" : "✦ Start Research"}
        </button>
      </div>

      {!loading && (
        <div className="examples">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              className="example-chip"
              onClick={() => setGoal(ex)}
            >
              ↗ {ex}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
