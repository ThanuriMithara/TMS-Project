import { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from '../../components/KanbanColumn/KanbanColumn';
import { taskService } from '../../services/api';
import styles from './DashboardPage.module.css';

const STATUS_TO_COLUMN_MAP = {
  'todo': 'todo',
  'in_progress': 'inprogress',
  'completed': 'completed'
};

const COLUMN_TO_STATUS_MAP = {
  'todo': 'todo',
  'inprogress': 'in_progress',
  'completed': 'completed'
};

export default function DashboardPage() {
  const [columns, setColumns] = useState({
    todo: [],
    inprogress: [],
    completed: []
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.getAll();
      const newColumns = { todo: [], inprogress: [], completed: [] };
      
      res.data.forEach((t) => {
        let assignee = 'Unassigned';
        if (t.assignments && t.assignments.length > 0 && t.assignments[0].user) {
          assignee = t.assignments[0].user.name || t.assignments[0].user.email;
        }
        
        const taskObj = {
          id: t.id,
          title: t.title,
          assignee,
          priority: t.priority.charAt(0).toUpperCase() + t.priority.slice(1).toLowerCase(),
          dueDate: t.due_date ? new Date(t.due_date).toISOString().split('T')[0] : 'No date',
          rawStatus: t.status,
        };
        
        const colId = STATUS_TO_COLUMN_MAP[t.status] || 'todo';
        newColumns[colId].push(taskObj);
      });
      
      setColumns(newColumns);
    } catch (err) {
      console.error('Error fetching tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = [...columns[source.droppableId]];
    const destCol = source.droppableId === destination.droppableId
      ? sourceCol
      : [...columns[destination.droppableId]];

    const [moved] = sourceCol.splice(source.index, 1);
    destCol.splice(destination.index, 0, moved);

    // Optimistically update UI
    setColumns((prev) => ({
      ...prev,
      [source.droppableId]: sourceCol,
      ...(source.droppableId !== destination.droppableId && {
        [destination.droppableId]: destCol,
      }),
    }));

    // Update backend if column changed
    if (source.droppableId !== destination.droppableId) {
      try {
        const newStatus = COLUMN_TO_STATUS_MAP[destination.droppableId];
        await taskService.updateStatus(moved.id, newStatus);
      } catch (err) {
        console.error('Failed to update task status', err);
        // Could revert state here on failure
        fetchTasks();
      }
    }
  };

  const filterTasks = (tasks) => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      const statusMap = { 'To Do': 'todo', 'In Progress': 'in_progress', 'Completed': 'completed' };
      const matchesStatus = statusFilter === 'All' || task.rawStatus === statusMap[statusFilter];
      return matchesSearch && matchesPriority && matchesStatus;
    });
  };

  const totalTasks = Object.values(columns).flat().length;

  if (loading) {
    return <div className={styles.page}><p>Loading Dashboard...</p></div>;
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Dashboard</h1>
          <p>Track and manage your project tasks</p>
        </div>
        <div className={styles.filters}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="🔍 Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="dashboard-search"
          />
          <select
            className={styles.filterSelect}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            id="priority-filter"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            id="status-filter"
          >
            <option value="All">All Status</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.total}`}>📊</div>
          <div className={styles.statInfo}>
            <h3>{totalTasks}</h3>
            <p>Total Tasks</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.todo}`}>📝</div>
          <div className={styles.statInfo}>
            <h3>{columns.todo.length}</h3>
            <p>To Do</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.progress}`}>🔄</div>
          <div className={styles.statInfo}>
            <h3>{columns.inprogress.length}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.done}`}>✅</div>
          <div className={styles.statInfo}>
            <h3>{columns.completed.length}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={styles.board}>
          <KanbanColumn
            title="To Do"
            tasks={filterTasks(columns.todo)}
            droppableId="todo"
          />
          <KanbanColumn
            title="In Progress"
            tasks={filterTasks(columns.inprogress)}
            droppableId="inprogress"
          />
          <KanbanColumn
            title="Completed"
            tasks={filterTasks(columns.completed)}
            droppableId="completed"
          />
        </div>
      </DragDropContext>
    </div>
  );
}
