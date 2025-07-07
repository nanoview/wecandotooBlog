
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Target, Heart, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">About BlogSpace</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We're building a community where knowledge flows freely and every voice matters.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-12 text-center">
              <Target className="w-16 h-16 mx-auto mb-6 text-white/90" />
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                To create a platform where writers, developers, and thinkers can share their knowledge, 
                connect with like-minded individuals, and contribute to a global conversation that drives innovation forward.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">Community First</h3>
                <p className="text-gray-600">
                  We believe in the power of community and collaboration to create meaningful content 
                  that benefits everyone.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <Heart className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quality Content</h3>
                <p className="text-gray-600">
                  We're committed to providing high-quality, well-researched content that adds 
                  real value to our readers' lives.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <Award className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">Excellence</h3>
                <p className="text-gray-600">
                  We strive for excellence in everything we do, from the user experience 
                  to the content we publish.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              BlogSpace was born out of a simple observation: great ideas deserve great platforms. 
              We noticed that many talented writers and thinkers were struggling to find the right 
              audience for their content, while readers were looking for quality, in-depth articles 
              on topics they cared about.
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              Founded in 2024, we set out to bridge this gap by creating a platform that prioritizes 
              both the writer's experience and the reader's journey. We wanted to build something 
              that felt personal yet professional, simple yet powerful.
            </p>
            
            <p className="text-gray-700 leading-relaxed">
              Today, BlogSpace is home to thousands of articles covering everything from technology 
              and business to personal development and creative arts. Our community continues to grow, 
              driven by our shared passion for learning and sharing knowledge.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Join Our Community</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Ready to share your story or discover amazing content? 
            Join thousands of writers and readers who call BlogSpace home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
              Start Writing
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Explore Articles
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
