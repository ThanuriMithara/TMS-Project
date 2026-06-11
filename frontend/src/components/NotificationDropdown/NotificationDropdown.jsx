import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../../services/api';
import styles from './NotificationDropdown.module.css';

const TYPE_ICONS = {
  assigned: { icon: '📌', className: 'assigned' },
  status: { icon: '🔄', className: 'status' },
  comment: { icon: '💬', className: 'comment' },
  deadline: { icon: '⏰', className: 'deadline' },
};

export default function NotificationDropdown({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getAll();
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Error fetching notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.dropdown}>
        <div className={styles.header}>
          <h3 className={styles.title}>Notifications</h3>
          <button className={styles.markAllBtn} onClick={markAllAsRead}>
            Mark all read
          </button>
        </div>

        <div className={styles.list}>
          {loading ? (
            <div className={styles.item} style={{ justifyContent: 'center' }}>Loading...</div>
          ) : notifications.length === 0 ? (
            <div className={styles.item} style={{ justifyContent: 'center', color: 'var(--text-secondary)' }}>No notifications</div>
          ) : (
            notifications.map((notif) => {
              const typeInfo = TYPE_ICONS[notif.type] || TYPE_ICONS.assigned;
              return (
                <div
                  key={notif.id}
                  className={`${styles.item} ${!notif.is_read ? styles.unread : ''}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className={`${styles.itemIcon} ${styles[typeInfo.className]}`}>
                    {typeInfo.icon}
                  </div>
                  <div className={styles.itemContent}>
                    <div
                      className={styles.itemText}
                      dangerouslySetInnerHTML={{ __html: notif.message }}
                    />
                    <div className={styles.itemTime}>
                      {new Date(notif.created_at).toLocaleString()}
                    </div>
                  </div>
                  {!notif.is_read && <div className={styles.unreadDot} />}
                </div>
              );
            })
          )}
        </div>

        <div className={styles.footer}>
          <Link to="/notifications" className={styles.viewAllLink} onClick={onClose}>
            View all notifications
          </Link>
        </div>
      </div>
    </>
  );
}
