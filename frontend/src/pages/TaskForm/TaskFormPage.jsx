import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';
import styles from './TaskFormPage.module.css';

const MOCK_USERS = [
  { id: '1', name: 'Admin User' },
  { id: '2', name: 'Sarah Miller' },
  { id: '3', name: 'John Doe' },
];

const MOCK_TASKS = {
  t1: { title: 'Design login page mockup', description: 'Create high-fidelity mockup for the login page with all states.', priority: 'High', status: 'To Do', dueDate: '2026-06-05', assigneeId: '2' },
  t5: { title: 'Implement user authentication', description: 'Set up JWT-based authentication with login, logout, and token refresh.', priority: 'High', status: 'In Progress', dueDate: '2026-06-07', assigneeId: '3' },
};

export default function TaskFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'To Do',
    dueDate: '',
    assigneeId: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && MOCK_TASKS[id]) {
      setForm(MOCK_TASKS[id]);
    }
  }, [id, isEditing]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.dueDate) errs.dueDate = 'Due date is required';
    if (!form.assigneeId) errs.assigneeId = 'Assignee is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    navigate('/tasks');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>{isEditing ? 'Edit Task' : 'Create Task'}</h1>
        <p>{isEditing ? 'Update the task details below' : 'Fill in the details to create a new task'}</p>
      </div>

      {apiError && <ErrorAlert message={apiError} onClose={() => setApiError('')} />}

      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="task-title">
              Title <span className={styles.required}>*</span>
            </label>
            <input
              id="task-title"
              type="text"
              className={`${styles.input} ${errors.title ? styles.error : ''}`}
              placeholder="Enter task title"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
            {errors.title && <span className={styles.fieldError}>{errors.title}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              className={styles.textarea}
              placeholder="Enter task description..."
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className={styles.select}
                value={form.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="task-status">Status</label>
              <select
                id="task-status"
                className={styles.select}
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="task-due-date">
                Due Date <span className={styles.required}>*</span>
              </label>
              <input
                id="task-due-date"
                type="date"
                className={`${styles.input} ${errors.dueDate ? styles.error : ''}`}
                value={form.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
              />
              {errors.dueDate && <span className={styles.fieldError}>{errors.dueDate}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="task-assignee">
                Assignee <span className={styles.required}>*</span>
              </label>
              <select
                id="task-assignee"
                className={`${styles.select} ${errors.assigneeId ? styles.error : ''}`}
                value={form.assigneeId}
                onChange={(e) => handleChange('assigneeId', e.target.value)}
              >
                <option value="">Select assignee...</option>
                {MOCK_USERS.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              {errors.assigneeId && <span className={styles.fieldError}>{errors.assigneeId}</span>}
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
