import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './NotificationDropdown.module.css';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'assigned',
    text: '<strong>Sarah Miller</strong> assigned you to <strong>"Fix login bug"</strong>',
    time: '2 minutes ago',
    read: false,
  },
  {
    id: '2',
    type: 'status',
    text: '<strong>"Dashboard redesign"</strong> was moved to <strong>In Progress</strong>',
    time: '15 minutes ago',
    read: false,
  },
  {
    id: '3',
    type: 'comment',
    text: '<strong>John Doe</strong> commented on <strong>"API Integration"</strong>',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '4',
    type: 'deadline',
    text: '<strong>"User testing"</strong> is due <strong>tomorrow</strong>',
    time: '3 hours ago',
    read: true,
  },
  {
    id: '5',
    type: 'assigned',
    text: '<strong>Admin</strong> assigned you to <strong>"Database migration"</strong>',
    time: '5 hours ago',
    read: true,
  },
];

const TYPE_ICONS = {
  assigned: { icon: '📌', className: 'assigned' },
  status: { icon: '🔄', className: 'status' },
  comment: { icon: '💬', className: 'comment' },
  deadline: { icon: '⏰', className: 'deadline' },
};

export default function NotificationDropdown({ onClose }) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
          {notifications.map((notif) => {
            const typeInfo = TYPE_ICONS[notif.type] || TYPE_ICONS.assigned;
            return (
              <div
                key={notif.id}
                className={`${styles.item} ${!notif.read ? styles.unread : ''}`}
                onClick={() => markAsRead(notif.id)}
              >
                <div className={`${styles.itemIcon} ${styles[typeInfo.className]}`}>
                  {typeInfo.icon}
                </div>
                <div className={styles.itemContent}>
                  <div
                    className={styles.itemText}
                    dangerouslySetInnerHTML={{ __html: notif.text }}
                  />
                  <div className={styles.itemTime}>{notif.time}</div>
                </div>
                {!notif.read && <div className={styles.unreadDot} />}
              </div>
            );
          })}
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
