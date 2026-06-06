import { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from '../../components/KanbanColumn/KanbanColumn';
import styles from './DashboardPage.module.css';

const INITIAL_TASKS = {
  todo: [
    { id: 't1', title: 'Design login page mockup', priority: 'High', dueDate: '2026-06-05', assignee: 'Sarah Miller' },
    { id: 't2', title: 'Setup project repository', priority: 'Medium', dueDate: '2026-06-04', assignee: 'John Doe' },
    { id: 't3', title: 'Write API documentation', priority: 'Low', dueDate: '2026-06-10', assignee: 'Admin User' },
    { id: 't4', title: 'Create database schema', priority: 'High', dueDate: '2026-06-06', assignee: 'Sarah Miller' },
  ],
  inprogress: [
    { id: 't5', title: 'Implement user authentication', priority: 'High', dueDate: '2026-06-07', assignee: 'John Doe' },
    { id: 't6', title: 'Build dashboard UI', priority: 'Medium', dueDate: '2026-06-08', assignee: 'Sarah Miller' },
    { id: 't7', title: 'Configure CI/CD pipeline', priority: 'Low', dueDate: '2026-06-12', assignee: 'Admin User' },
  ],
  completed: [
    { id: 't8', title: 'Project kickoff meeting', priority: 'Medium', dueDate: '2026-06-01', assignee: 'Admin User' },
    { id: 't9', title: 'Requirements gathering', priority: 'High', dueDate: '2026-06-02', assignee: 'Sarah Miller' },
  ],
};

export default function DashboardPage() {
  const [columns, setColumns] = useState(INITIAL_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = [...columns[source.droppableId]];
    const destCol = source.droppableId === destination.droppableId
      ? sourceCol
      : [...columns[destination.droppableId]];

    const [moved] = sourceCol.splice(source.index, 1);
    destCol.splice(destination.index, 0, moved);

    setColumns((prev) => ({
      ...prev,
      [source.droppableId]: sourceCol,
      ...(source.droppableId !== destination.droppableId && {
        [destination.droppableId]: destCol,
      }),
    }));
  };

  const filterTasks = (tasks) => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  };

  const totalTasks = Object.values(columns).flat().length;

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
