import { useState, useEffect } from 'react';
import UserTable from '../../components/UserTable/UserTable';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import { userService } from '../../services/api';
import styles from './UserManagementPage.module.css';

const ROLE_MAP = {
  'admin': 'Administrator',
  'project_manager': 'Project Manager',
  'collaborator': 'Collaborator'
};

const REVERSE_ROLE_MAP = {
  'Administrator': 'admin',
  'Project Manager': 'project_manager',
  'Collaborator': 'collaborator'
};

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [modalForm, setModalForm] = useState({ name: '', email: '', role: 'Collaborator', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  // Confirmation Modal
  const [statusConfirmUser, setStatusConfirmUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAll();
      const formatted = res.data.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: ROLE_MAP[u.role] || u.role,
        status: u.is_active ? 'Active' : 'Inactive',
        rawRole: u.role
      }));
      setUsers(formatted);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openCreateModal = () => {
    setEditingUser(null);
    setModalForm({ name: '', email: '', role: 'Collaborator', password: '' });
    setErrors({});
    setApiError('');
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setModalForm({ name: user.name, email: user.email, role: user.role, password: '' });
    setErrors({});
    setApiError('');
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!modalForm.name.trim()) errs.name = 'Name is required';
    if (!modalForm.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(modalForm.email)) errs.email = 'Enter a valid email';
    if (!editingUser && (!modalForm.password || modalForm.password.length < 6)) {
      errs.password = 'Password must be at least 6 characters';
    }
    return errs;
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        name: modalForm.name,
        email: modalForm.email,
        role: REVERSE_ROLE_MAP[modalForm.role],
      };
      if (modalForm.password) {
        payload.password = modalForm.password;
      }

      if (editingUser) {
        await userService.update(editingUser.id, payload);
      } else {
        await userService.create(payload);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setApiError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (statusConfirmUser) {
      try {
        if (statusConfirmUser.status === 'Active') {
          await userService.deactivate(statusConfirmUser.id);
        } else {
          await userService.activate(statusConfirmUser.id);
        }
        fetchUsers();
      } catch (err) {
        console.error('Failed to toggle status', err);
      } finally {
        setStatusConfirmUser(null);
      }
    }
  };

  if (loading && users.length === 0) {
    return <div className={styles.page}><p>Loading Users...</p></div>;
  }

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
            {apiError && <div style={{color: 'red', marginBottom: '1rem'}}>{apiError}</div>}
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

              {!editingUser && (
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="modal-password">
                    Password <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="modal-password"
                    type="password"
                    className={styles.input}
                    value={modalForm.password}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, password: e.target.value }))}
                  />
                  {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
                </div>
              )}

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
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? 'Saving...' : editingUser ? 'Save Changes' : 'Create User'}
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
