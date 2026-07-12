import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, type TaskPayload, type TaskStatus } from "../api";

const emptyForm: TaskPayload = {
  title: "",
  description: "",
  status: "todo",
  due_date: null,
};

export function TaskFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState<TaskPayload>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    api
      .getTask(Number(id))
      .then((task) => {
        if (!active) return;
        setForm({
          title: task.title,
          description: task.description,
          status: task.status,
          due_date: task.due_date,
        });
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

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: TaskPayload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        due_date: form.due_date || null,
      };
      const task = isEdit
        ? await api.updateTask(Number(id), payload)
        : await api.createTask(payload);
      navigate(`/tasks/${task.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="muted">Loading task…</p>;
  }

  return (
    <section className="panel form-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{isEdit ? "Edit" : "Create"}</p>
          <h1>{isEdit ? "Update task" : "Create a task"}</h1>
          <p className="lede">Capture the work, then let AI explain or plan it.</p>
        </div>
        <Link to={isEdit ? `/tasks/${id}` : "/"} className="btn btn-ghost">
          Cancel
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="task-form" onSubmit={onSubmit}>
        <label>
          Title
          <input
            required
            maxLength={200}
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Add OAuth login to the dashboard"
          />
        </label>

        <label>
          Description
          <textarea
            rows={6}
            maxLength={5000}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="What needs to be done, constraints, and acceptance criteria…"
          />
        </label>

        <div className="form-row">
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, status: e.target.value as TaskStatus }))
              }
            >
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>

          <label>
            Due date
            <input
              type="date"
              value={form.due_date || ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, due_date: e.target.value || null }))
              }
            />
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create task"}
          </button>
        </div>
      </form>
    </section>
  );
}
