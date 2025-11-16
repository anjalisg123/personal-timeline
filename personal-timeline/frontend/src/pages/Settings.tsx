import React from 'react';
import ApiConnections from '../components/settings/ApiConnections';
import UserProfile from '../components/settings/UserProfile';
import '/src/index.css';

const Settings: React.FC = () => (
  <div className='settings-page'>
    <UserProfile />
    <ApiConnections />
  </div>
);

export default Settings;