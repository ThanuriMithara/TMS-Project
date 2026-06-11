import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';
import { taskService, userService } from '../../services/api';
import styles from './TaskFormPage.module.css';

const STATUS_MAP = {
  'To Do': 'todo',
  'In Progress': 'in_progress',
  'Completed': 'completed',
};

const STATUS_DISPLAY_MAP = {
  'todo': 'To Do',
  'in_progress': 'In Progress',
  'completed': 'Completed',
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

  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const usersRes = await userService.getAll();
        setUsers(usersRes.data || []);
        
        if (isEditing) {
          const taskRes = await taskService.getById(id);
          const t = taskRes.data;
          let assigneeId = '';
          if (t.assignments && t.assignments.length > 0) {
            assigneeId = t.assignments[0].user_id;
          }
          setForm({
            title: t.title || '',
            description: t.description || '',
            priority: t.priority.charAt(0).toUpperCase() + t.priority.slice(1).toLowerCase(),
            status: STATUS_DISPLAY_MAP[t.status] || 'To Do',
            dueDate: t.due_date ? new Date(t.due_date).toISOString().split('T')[0] : '',
            assigneeId,
          });
        }
      } catch (err) {
        console.error(err);
        setApiError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditing]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority.toLowerCase(),
        status: STATUS_MAP[form.status],
        due_date: form.dueDate || undefined,
        assignee_ids: form.assigneeId ? [form.assigneeId] : []
      };

      if (isEditing) {
        await taskService.update(id, payload);
        if (form.assigneeId) {
          await taskService.assignTask(id, [form.assigneeId]);
        }
      } else {
        await taskService.create(payload);
      }
      navigate('/tasks');
    } catch (err) {
      console.error(err);
      setApiError(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.page}><p>Loading...</p></div>;
  }

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
                Due Date
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
                Assignee
              </label>
              <select
                id="task-assignee"
                className={`${styles.select} ${errors.assigneeId ? styles.error : ''}`}
                value={form.assigneeId}
                onChange={(e) => handleChange('assigneeId', e.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name || u.email}</option>
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
