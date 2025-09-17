import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
            <p className="text-center text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2 className="text-2xl font-semibold mb-4">Newsletter Subscription Terms</h2>
            <p className="mb-4">
              By subscribing to our newsletter, you agree to receive periodic emails containing:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Web development tips and tutorials</li>
              <li>Blog post notifications and updates</li>
              <li>Exclusive content and resources</li>
              <li>Career advice and industry insights</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4">Email Frequency</h2>
            <p className="mb-4">
              We typically send newsletters weekly, but frequency may vary based on content availability. 
              You will never receive spam or excessive emails from us.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Subscription Management</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>You can unsubscribe at any time using the link provided in every email</li>
              <li>Unsubscribe requests are processed immediately</li>
              <li>You can re-subscribe at any time through our website</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4">Content Usage</h2>
            <p className="mb-4">
              The content in our newsletters is for educational purposes. You're welcome to share and 
              discuss the content, but please provide attribution when sharing.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Privacy</h2>
            <p className="mb-4">
              Your email address and subscription data are handled according to our{' '}
              <Link to="/privacy-policy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
              . We never share your information with third parties.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p className="mb-4">
              We may update these terms occasionally. Continued subscription after changes indicates 
              acceptance of the updated terms.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="mb-4">
              Questions about these terms? Contact us at:
              <br />
              Email: info@wecandotoo.com
            </p>

            <div className="mt-8 pt-4 border-t text-center">
              <Link to="/" className="text-blue-600 hover:underline">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
