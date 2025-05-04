import React from 'react';
import { getCurrentUser, getUserRole } from '../services/auth';
import { FaUserShield, FaUserTie } from 'react-icons/fa';

const ProfilePage = () => {
  const currentUser = getCurrentUser();
  const userRole = getUserRole();
  
  if (!currentUser) {
    return <div className="container">Please log in to view your profile.</div>;
  }
  
  return (
    <div className="profile-page">
      <div className="container">
        <h2>User Profile</h2>
        
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {userRole === 'investigator' ? (
                <FaUserShield className="avatar-icon" />
              ) : (
                <FaUserTie className="avatar-icon" />
              )}
            </div>
            <div className="profile-title">
              <h3>{currentUser.name}</h3>
              <span className="profile-role">
                {userRole === 'investigator' ? 'Investigator' : 'Management'}
              </span>
            </div>
          </div>
          
          <div className="profile-details">
            <div className="profile-info">
              <div className="info-label">Username:</div>
              <div className="info-value">{currentUser.id}</div>
            </div>
            
            <div className="profile-info">
              <div className="info-label">Role:</div>
              <div className="info-value">{userRole === 'investigator' ? 'Investigator' : 'Management'}</div>
            </div>
          </div>
          
          <div className="profile-description">
            {userRole === 'investigator' ? (
              <p>
                As an investigator, you can review whistleblower reports, assign them to yourself,
                communicate with whistleblowers, and complete investigations after providing 
                management updates.
              </p>
            ) : (
              <p>
                As a management user, you can oversee all whistleblower reports, review investigator
                performance, and reopen completed investigations if necessary.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
