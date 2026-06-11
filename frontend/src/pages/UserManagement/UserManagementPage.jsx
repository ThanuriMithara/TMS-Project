import { useState } from 'react';
import UserTable from '../../components/UserTable/UserTable';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import styles from './UserManagementPage.module.css';

const INITIAL_USERS = [
  { id: '1', name: 'Admin User', email: 'admin@taskflow.com', role: 'Administrator', status: 'Active' },
  { id: '2', name: 'Sarah Miller', email: 'pm@taskflow.com', role: 'Project Manager', status: 'Active' },
  { id: '3', name: 'John Doe', email: 'collab@taskflow.com', role: 'Collaborator', status: 'Active' },
  { id: '4', name: 'Emma Wilson', email: 'emma@taskflow.com', role: 'Collaborator', status: 'Inactive' },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [modalForm, setModalForm] = useState({ name: '', email: '', role: 'Collaborator' });
  const [errors, setErrors] = useState({});

  // Confirmation Modal
  const [statusConfirmUser, setStatusConfirmUser] = useState(null);

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openCreateModal = () => {
    setEditingUser(null);
    setModalForm({ name: '', email: '', role: 'Collaborator' });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setModalForm({ name: user.name, email: user.email, role: user.role });
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!modalForm.name.trim()) errs.name = 'Name is required';
    if (!modalForm.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(modalForm.email)) errs.email = 'Enter a valid email';
    return errs;
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (editingUser) {
      // Edit User
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...modalForm } : u))
      );
    } else {
      // Create User
      const newUser = {
        id: String(users.length + 1),
        ...modalForm,
        status: 'Active',
      };
      setUsers((prev) => [...prev, newUser]);
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = () => {
    if (statusConfirmUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === statusConfirmUser.id
            ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
            : u
        )
      );
      setStatusConfirmUser(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>User Management</h1>
          <p>Create, edit, and deactivate team members</p>
        </div>
        <div className={styles.controls}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="🔍 Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="user-search"
          />
          <select
            className={styles.filterSelect}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            id="role-filter"
          >
            <option value="All">All Roles</option>
            <option value="Administrator">Administrator</option>
            <option value="Project Manager">Project Manager</option>
            <option value="Collaborator">Collaborator</option>
          </select>
          <button className={styles.createBtn} onClick={openCreateModal} id="create-user-btn">
            ➕ Add User
          </button>
        </div>
      </div>

      <UserTable
        users={filtered}
        onEdit={openEditModal}
        onToggleStatus={(u) => setStatusConfirmUser(u)}
      />

      {/* User Create/Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>{editingUser ? 'Edit User' : 'Add New User'}</h3>
            <form className={styles.form} onSubmit={handleSaveUser} noValidate>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="modal-name">
                  Full Name <span className={styles.required}>*</span>
                </label>
                <input
                  id="modal-name"
                  type="text"
                  className={styles.input}
                  value={modalForm.name}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, name: e.target.value }))}
                />
                {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="modal-email">
                  Email Address <span className={styles.required}>*</span>
                </label>
                <input
                  id="modal-email"
                  type="email"
                  className={styles.input}
                  value={modalForm.email}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, email: e.target.value }))}
                />
                {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="modal-role">Role</label>
                <select
                  id="modal-role"
                  className={styles.select}
                  value={modalForm.role}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, role: e.target.value }))}
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Collaborator">Collaborator</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation for Deactivation/Activation */}
      {statusConfirmUser && (
        <ConfirmationModal
          title={statusConfirmUser.status === 'Active' ? 'Deactivate User' : 'Activate User'}
          message={`Are you sure you want to ${
            statusConfirmUser.status === 'Active' ? 'deactivate' : 'activate'
          } ${statusConfirmUser.name}?`}
          confirmText={statusConfirmUser.status === 'Active' ? 'Deactivate' : 'Activate'}
          variant={statusConfirmUser.status === 'Active' ? 'danger' : 'warning'}
          onConfirm={handleToggleStatus}
          onCancel={() => setStatusConfirmUser(null)}
        />
      )}
    </div>
  );
}
