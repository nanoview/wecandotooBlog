import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Cookie, Database, Server } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-gray-50 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Shield className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Privacy & Cookie Policy
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Last updated: August 18, 2025
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8 sm:p-10 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to wecandotoo.com ("we", "our", "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed">
              We may collect information about you in a variety of ways. The information we may collect on the Site includes:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
              <li>
                <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and demographic information, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as online chat and message boards.
              </li>
              <li>
                <strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Cookie className="mr-3 h-6 w-6 text-blue-500" />
              Use of Cookies and Local Storage
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies, local storage, and other tracking technologies to help customize the Site and improve your experience. Here’s a breakdown of what we use and why:
            </p>
            <div className="space-y-3">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-800">Authentication Tokens (Essential)</h3>
                <p className="text-gray-600 text-sm">We use `localStorage` to store secure tokens (JWTs) provided by Supabase. This allows you to stay logged in to your account without having to sign in on every visit. This is essential for the site's functionality.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-800">Application Tokens (Functional)</h3>
                <p className="text-gray-600 text-sm">For certain integrations, like Zoho Mail, we store access tokens in `localStorage`. This allows these features to work correctly and securely without repeatedly asking for your credentials.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-800">Service Worker Cache (Performance)</h3>
                <p className="text-gray-600 text-sm">As a Progressive Web App (PWA), our site uses a service worker to cache assets like scripts, stylesheets, and images. This allows the site to load significantly faster on repeat visits and even work when you're offline.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Database className="mr-3 h-6 w-6 text-blue-500" />
              How We Use Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
              <li>Create and manage your account.</li>
              <li>Email you regarding your account or order.</li>
              <li>Enable user-to-user communications.</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
              <li>Notify you of updates to the Site.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Server className="mr-3 h-6 w-6 text-blue-500" />
              Third-Party Services
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We use third-party services for hosting, authentication, and analytics. These services may also use cookies or similar technologies.
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
              <li><strong>Supabase:</strong> For database, authentication, and storage.</li>
              <li><strong>Google Analytics:</strong> To understand how our website is being used.</li>
              <li><strong>Vercel/Netlify/Your Host:</strong> For hosting the website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Consent</h2>
            <p className="text-gray-700 leading-relaxed">
              By using our site, you consent to our Privacy & Cookie Policy. We will ask for your consent to use non-essential cookies via a consent banner when you first visit our site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@wecandotoo.com" className="text-blue-600 hover:underline">privacy@wecandotoo.com</a>
            </p>
          </section>
        </div>
        <div className="text-center mt-8">
          <Link to="/" className="text-blue-600 hover:underline">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
