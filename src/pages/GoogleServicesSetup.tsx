import React from 'react';
import { WordPressSiteKitOAuth } from '@/components/WordPressSiteKitOAuth';

const GoogleServicesSetup: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Google Services Integration
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect your Google services just like WordPress Site Kit. Get insights from Analytics, 
            monitor AdSense earnings, and track Search Console performance - all in one place.
          </p>
        </div>

        <WordPressSiteKitOAuth />
        
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">Google Analytics</h3>
              <p className="text-gray-600 text-sm">
                Track website traffic, user behavior, and conversion data with detailed analytics reports.
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-semibold mb-2">Google AdSense</h3>
              <p className="text-gray-600 text-sm">
                Monitor ad performance, earnings, and optimization suggestions for your content.
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">Search Console</h3>
              <p className="text-gray-600 text-sm">
                Track search performance, indexing status, and SEO opportunities for better rankings.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="text-blue-500 mt-1">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-blue-900 font-medium mb-1">WordPress Site Kit Experience</h4>
              <p className="text-blue-700 text-sm">
                This integration provides the same smooth OAuth flow and credential management as WordPress Site Kit. 
                Your tokens are securely stored and automatically refreshed when needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleServicesSetup;
