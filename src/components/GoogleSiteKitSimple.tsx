import React from 'react';
import { GoogleSiteKitManager } from './GoogleSiteKitManager';

interface GoogleSiteKitProps {
  isAdmin?: boolean;
}

const GoogleSiteKit: React.FC<GoogleSiteKitProps> = ({ isAdmin = false }) => {
  return (
    <div className="google-site-kit">
      <GoogleSiteKitManager />
    </div>
  );
};

export default GoogleSiteKit;
