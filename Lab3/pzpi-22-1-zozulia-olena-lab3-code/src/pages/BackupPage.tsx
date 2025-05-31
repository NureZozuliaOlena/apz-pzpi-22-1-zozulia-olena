import React, { useState } from 'react';
import styles from '../styles/Backup.module.css';
import { createBackup, restoreDb } from '../http/reportApi';
import { useTranslation } from 'react-i18next';

const BackupPage = () => {
  const { t } = useTranslation();
  const [createBackupState, setCreateBackupState] = useState('');
  const [restoreDbState, setRestoreDbState] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const saveBackup = async () => {
    await createBackup(createBackupState);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert(t('backup.fileRequired'));
      return;
    }

    const formData = new FormData();
    formData.append('backupFile', file);
    await restoreDb(formData, restoreDbState);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('backup.title')}</h2>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{t('backup.createBackup')}</h4>
        <input
          type="text"
          placeholder={t('backup.backupName')}
          className={styles.inputField}
          onChange={(e) => setCreateBackupState(e.target.value)}
        />
        <button className={styles.button} onClick={saveBackup}>
          {t('backup.create')}
        </button>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{t('backup.restoreDb')}</h4>
        <input
          type="text"
          placeholder={t('backup.restoreTarget')}
          className={styles.inputField}
          onChange={(e) => setRestoreDbState(e.target.value)}
        />

        <input
          id="file-upload"
          type="file"
          onChange={handleChange}
          className={styles.fileInput}
        />

        <label htmlFor="file-upload" className={styles.fileLabel}>
          {file ? file.name : t('backup.chooseFile')}
        </label>

        <br />
        <button className={styles.button} onClick={handleUpload}>
          {t('backup.restore')}
        </button>
      </div>
    </div>
  );
};

export default BackupPage;