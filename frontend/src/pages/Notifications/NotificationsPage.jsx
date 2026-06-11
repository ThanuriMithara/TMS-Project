import { useState } from 'react';
import styles from './NotificationsPage.module.css';

const INITIAL_NOTIFICATIONS = [
  { id: '1', type: 'assigned', text: '<strong>Sarah Miller</strong> assigned you to <strong>"Fix login bug"</strong>', time: '2 minutes ago', read: false },
  { id: '2', type: 'status', text: '<strong>"Dashboard redesign"</strong> was moved to <strong>In Progress</strong>', time: '15 minutes ago', read: false },
  { id: '3', type: 'comment', text: '<strong>John Doe</strong> commented on <strong>"API Integration"</strong>: "Looking good, just needs a few tweaks."', time: '1 hour ago', read: false },
  { id: '4', type: 'deadline', text: '<strong>"User testing"</strong> is due <strong>tomorrow</strong>', time: '3 hours ago', read: false },
  { id: '5', type: 'assigned', text: '<strong>Admin</strong> assigned you to <strong>"Database migration"</strong>', time: '5 hours ago', read: true },
  { id: '6', type: 'status', text: '<strong>"Requirements doc"</strong> was moved to <strong>Completed</strong>', time: '1 day ago', read: true },
  { id: '7', type: 'comment', text: '<strong>Sarah Miller</strong> replied to your comment on <strong>"Sprint planning"</strong>', time: '1 day ago', read: true },
  { id: '8', type: 'deadline', text: '<strong>"Code review"</strong> deadline is <strong>in 2 days</strong>', time: '2 days ago', read: true },
];

const TYPE_INFO = {
  assigned: { icon: '📌', label: 'Task Assigned', className: 'assigned' },
  status: { icon: '🔄', label: 'Status Changed', className: 'status' },
  comment: { icon: '💬', label: 'New Comment', className: 'comment' },
  deadline: { icon: '⏰', label: 'Deadline Reminder', className: 'deadline' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Notifications</h1>
          <p>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button className={styles.markAllBtn} onClick={markAllAsRead} id="mark-all-read">
            ✓ Mark all as read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className={styles.list}>
          {notifications.map((notif) => {
            const info = TYPE_INFO[notif.type] || TYPE_INFO.assigned;
            return (
              <div
                key={notif.id}
                className={`${styles.item} ${!notif.read ? styles.unread : ''}`}
                onClick={() => markAsRead(notif.id)}
              >
                <div className={`${styles.itemIcon} ${styles[info.className]}`}>
                  {info.icon}
                </div>
                <div className={styles.itemContent}>
                  <div
                    className={styles.itemText}
                    dangerouslySetInnerHTML={{ __html: notif.text }}
                  />
                  <div className={styles.itemMeta}>
                    <span className={styles.itemTime}>{notif.time}</span>
                    <span className={styles.typeBadge}>{info.label}</span>
                  </div>
                </div>
                {!notif.read && <div className={styles.unreadDot} />}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div style={{ fontSize: '48px' }}>🔔</div>
          <p>No notifications yet</p>
        </div>
      )}
    </div>
  );
}
