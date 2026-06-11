import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { settingsService } from '../../services/api';
import styles from './ResetPasswordPage.module.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth(); // or we update user context
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await settingsService.changePassword({ new_password: password });
      // Update local storage so we don't prompt again
      const storedUser = JSON.parse(localStorage.getItem('taskflow_user'));
      if (storedUser) {
        storedUser.must_reset_password = false;
        localStorage.setItem('taskflow_user', JSON.stringify(storedUser));
      }
      // Force reload to update context properly or navigate to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Reset Your Password</h1>
        <p className={styles.subtitle}>
          For security reasons, you must change your temporary password before accessing the system.
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="reset-password">New Password</label>
            <input
              id="reset-password"
              type="password"
              className={styles.input}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              className={styles.input}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Changing...' : 'Change Password & Continue'}
          </button>

          {error && (
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>⛔</span>
              <span className={styles.errorText}>{error}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
