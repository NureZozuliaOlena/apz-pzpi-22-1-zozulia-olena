import React, { useEffect, useState } from 'react';
import { getNotifications } from '../http/notificationApi';
import { INotification } from '../interfaces/INotification';
import styles from '../styles/Notification.module.css';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../utils/formatters';

export const Notifications = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<INotification[]>([]);

  const fetchItems = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      alert(t('error'));
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('notifications.title')}</h1>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('notifications.tableHeaders.id')}</th>
            <th>{t('notifications.tableHeaders.title')}</th>
            <th>{t('notifications.tableHeaders.text')}</th>
            <th>{t('notifications.tableHeaders.dateTimeCreated')}</th>
            <th>{t('notifications.tableHeaders.userEmail')}</th>
            <th>{t('notifications.tableHeaders.fridgeId')}</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notification) => (
            <tr key={notification.id}>
              <td>{notification.id}</td>
              <td>{notification.title}</td>
              <td>{notification.text}</td>
              <td>{formatDate(notification.dateTimeCreated)}</td>
              <td>{notification.user?.email}</td>
              <td>{notification.fridge?.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
