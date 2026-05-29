import React, { useState } from 'react';
import './comp_src/profile.css';

function Profile(props) {

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  const avatarOptions = ['👤', '🐕', '', '🦊', '🐼', '🦁', '', '', '', '', '👻', '💀'];

  const handleAvatarChange = (avatar) => {
    props.setUser({ ...props.user, avatar });
    setShowAvatarModal(false);
    showMessage('Аватар успешно изменён!', 'success');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('Пароли не совпадают!', 'error');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      showMessage('Пароль должен быть не менее 6 символов!', 'error');
      return;
    }

    showMessage('Пароль успешно изменён!', 'success');
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordModal(false);
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1 className="profile-title">Профиль</h1>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-card">
          <div className="avatar-section">
            <div className="avatar-large">{props.user.avatar}</div>
            <button 
              className="change-avatar-btn" 
              onClick={() => setShowAvatarModal(true)}
            >
              📷 Изменить
            </button>
          </div>

          <div className="user-info">
            <div className="info-row">
              <label>Имя:</label>
              <span className="user-name">{props.user.name}</span>
            </div>
            
            <div className="info-row">
              <label>Статус:</label>
              <span className={`user-status status-${props.user.status.toLowerCase()}`}>
                ● {props.user.status}
              </span>
            </div>
            
            <div className="info-row">
              <label>Email:</label>
              <span className="user-email">{props.user.email}</span>
            </div>
          </div>

          <div className="profile-actions">
            <button 
              className=" password-btn"
              onClick={() => setShowPasswordModal(true)}
            >
              🔑 Сменить пароль
            </button>
            
      
          </div>
        </div>
      </div>

      {showAvatarModal && (
        <div className="modal-overlay" onClick={() => setShowAvatarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Выберите аватар</h2>
              <button className="close-btn" onClick={() => setShowAvatarModal(false)}>×</button>
            </div>
            
            <div className="avatar-grid">
              {avatarOptions.map((avatar, index) => (
                <button
                  key={index}
                  className={`avatar-option ${props.user.avatar === avatar ? 'selected' : ''}`}
                  onClick={() => handleAvatarChange(avatar)}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Смена пароля</h2>
              <button className="close-btn" onClick={() => setShowPasswordModal(false)}>×</button>
            </div>
            
            <form className="password-form" onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Текущий пароль:</label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  required
                  placeholder="Введите текущий пароль"
                />
              </div>
              
              <div className="form-group">
                <label>Новый пароль:</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  placeholder="Минимум 6 символов"
                  minLength={6}
                />
              </div>
              
              <div className="form-group">
                <label>Подтвердите пароль:</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  placeholder="Повторите новый пароль"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowPasswordModal(false)}>
                  Отмена
                </button>
                <button type="submit" className="submit-btn">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;