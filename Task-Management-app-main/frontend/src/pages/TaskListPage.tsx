import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Task } from "../api";
import { StatusBadge, formatDate } from "../components/StatusBadge";

export function TaskListPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .listTasks()
      .then((data) => {
        if (active) setTasks(data);
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
  }, []);

  return (
    <section className="list-page">
      <div className="hero-band">
        <p className="eyebrow">Taskflow</p>
        <h1>Your tasks, clarified by AI</h1>
        <p className="lede">
          Create work items, track status, and generate explanations or implementation plans
          from the task description.
        </p>
        <Link to="/tasks/new" className="btn btn-primary">
          Create task
        </Link>
      </div>

      <div className="panel">
        <div className="panel-heading compact">
          <h2>All tasks</h2>
          <span className="muted">{tasks.length} total</span>
        </div>

        {loading && <p className="muted">Loading tasks…</p>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && tasks.length === 0 && (
          <div className="empty-state">
            <h3>No tasks yet</h3>
            <p>Create your first task to get started.</p>
            <Link to="/tasks/new" className="btn btn-primary">
              New task
            </Link>
          </div>
        )}

        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id}>
              <Link to={`/tasks/${task.id}`} className="task-row">
                <div className="task-row-main">
                  <h3>{task.title}</h3>
                  <p>{task.description || "No description"}</p>
                </div>
                <div className="task-row-meta">
                  <StatusBadge status={task.status} />
                  <span className="muted">{formatDate(task.due_date)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
