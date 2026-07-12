import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, type AIActionType, type Task } from "../api";
import { StatusBadge, formatDate } from "../components/StatusBadge";

export function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<AIActionType | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    api
      .getTask(Number(id))
      .then((data) => {
        if (active) setTask(data);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function runAI(action: AIActionType) {
    if (!task) return;
    setAiLoading(action);
    setError(null);
    try {
      const updated = await api.generateAI(task.id, action);
      setTask(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI generation failed");
    } finally {
      setAiLoading(null);
    }
  }

  async function onDelete() {
    if (!task) return;
    const confirmed = window.confirm(`Delete "${task.title}"?`);
    if (!confirmed) return;
    setDeleting(true);
    try {
      await api.deleteTask(task.id);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      setDeleting(false);
    }
  }

  if (loading) return <p className="muted">Loading task…</p>;
  if (!task) {
    return (
      <div className="panel">
        <div className="alert alert-error">{error || "Task not found"}</div>
        <Link to="/" className="btn btn-ghost">
          Back to tasks
        </Link>
      </div>
    );
  }

  const aiLabel =
    task.ai_action_type === "implementation_plan"
      ? "Implementation plan"
      : task.ai_action_type === "explain"
        ? "Explanation"
        : null;

  return (
    <section className="detail-page">
      <div className="panel detail-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Task details</p>
            <h1>{task.title}</h1>
          </div>
          <div className="heading-actions">
            <Link to={`/tasks/${task.id}/edit`} className="btn btn-ghost">
              Edit
            </Link>
            <button type="button" className="btn btn-danger" onClick={onDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="meta-grid">
          <div>
            <span className="meta-label">Status</span>
            <StatusBadge status={task.status} />
          </div>
          <div>
            <span className="meta-label">Due date</span>
            <p>{formatDate(task.due_date)}</p>
          </div>
          <div>
            <span className="meta-label">Updated</span>
            <p>{formatDate(task.updated_at)}</p>
          </div>
        </div>

        <div className="content-block">
          <h2>Description</h2>
          <p className="description-text">{task.description || "No description provided."}</p>
        </div>

        <div className="ai-actions">
          <h2>AI assistance</h2>
          <p className="muted">
            Generate a clear explanation or a step-by-step implementation plan. Results are saved
            with this task.
          </p>
          <div className="action-row">
            <button
              type="button"
              className="btn btn-primary"
              disabled={aiLoading !== null}
              onClick={() => runAI("explain")}
            >
              {aiLoading === "explain" ? "Explaining…" : "Explain with AI"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={aiLoading !== null}
              onClick={() => runAI("implementation_plan")}
            >
              {aiLoading === "implementation_plan" ? "Planning…" : "Generate implementation plan"}
            </button>
          </div>
        </div>

        {task.ai_response && (
          <div className="ai-result">
            <div className="ai-result-header">
              <h2>{aiLabel || "AI response"}</h2>
              <span className="muted">Stored in database</span>
            </div>
            <pre className="ai-text">{task.ai_response}</pre>
          </div>
        )}
      </div>
    </section>
  );
}
