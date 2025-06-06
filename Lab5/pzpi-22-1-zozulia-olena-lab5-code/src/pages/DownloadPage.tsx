import React from 'react';

const DownloadPage: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Завантаження інсталятору проєкту SmartLunch</h1>
      <p>Натисніть кнопку нижче, щоб завантажити ZIP-архів</p>
      <p>Після того, як ви завантажите архів, розпакуйте його та запустіть файл installer.py</p>
      <a
        href="/project.zip"
        download
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          borderRadius: '5px',
          textDecoration: 'none',
          marginTop: '20px',
          display: 'inline-block',
        }}
      >
        Завантажити ZIP
      </a>
    </div>
  );
};

export default DownloadPage;
