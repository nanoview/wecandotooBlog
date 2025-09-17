import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Github, Linkedin, ExternalLink, Briefcase, Code, GraduationCap, Phone, Languages, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Component ---

const ArifulPortfolio: React.FC = () => {
  // --- State for Photo Carousel ---
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // --- Data ---
  const portfolioData = {
    name: 'Ariful Islam',
    title: 'ICT Professional',
    location: 'Opastinsilta 1 B 33, 00520 Helsinki',
    photos: [
      { src: '/ariful-photo.jpg', alt: 'Ariful Islam - Professional Photo', caption: 'Professional Headshot' },
      { src: '/ariful-work.jpg', alt: 'Ariful Islam - Work Environment', caption: 'ICT Support Work' },
      { src: '/ariful-coding.jpg', alt: 'Ariful Islam - Development', caption: 'Web Development' },
      { src: '/ariful-team.jpg', alt: 'Ariful Islam - Team Collaboration', caption: 'Team Work' },
    ],
    initials: 'AI',
    bio: "Motivated ICT professional with hands-on experience in IT support, web development, and database integration. Skilled in operating systems, networks, PHP programming, and building complex web applications with features like multi-timezone systems, dynamic calendars, and database-driven functionality. Demonstrated expertise in full-stack development through projects like the Ruoka Express restaurant website, showcasing advanced PHP programming, MySQL integration, and responsive design. Completed Microsoft Azure Fundamentals (AZ-900T01) at Metropolia. Eager to learn new technologies and contribute to innovative software solutions.",
    contact: {
      phone: '+358403781793',
      linkedin: 'https://www.linkedin.com/in/ariful-802is11/',
      github: 'https://github.com/nanoview',
    },
    skills: [
      'Troubleshooting: Windows, Linux, macOS',
      'Hardware/Software Support',
      'PHP: Advanced OOP, MySQL Integration, Session Management',
      'Frontend: HTML5, CSS3, JavaScript, Responsive Design',
      'Database: MySQL, PostgreSQL, CRUD Operations',
      'Networking: ADDS, DHCP, DNS, IIS, Apache2',
      'Framework Development: Custom CSS Grid Systems',
      'API Integration: Weather APIs, Multi-timezone Systems',
      'Microsoft Azure Fundamentals',
      'Customer Support',
      'Technical Documentation',
      'Teamwork & Collaboration',
      'Problem-Solving',
    ],
    projects: [
      {
        title: 'Content Stream - wecandotoo.com',
        description: 'A full-featured content management system and blog platform with advanced SEO automation, visitor analytics, and a comprehensive admin dashboard. Built with Vite, React, TypeScript, and Supabase.',
        tags: ['React', 'Supabase', 'TypeScript', 'Vite', 'Edge Functions'],
        liveUrl: 'https://wecandotoo.com',
        repoUrl: 'https://github.com/nanoview/stellar-content-stream',
      },
      {
        title: 'Ruoka Express - Restaurant Website (School Project)',
        description: 'A comprehensive Finnish restaurant website featuring multi-timezone clocks, interactive image slideshow, table reservation system with MySQL integration, dynamic calendar, weather widgets, and responsive design. Demonstrates advanced PHP programming, database operations, and custom CSS framework development.',
        tags: ['PHP', 'MySQL', 'JavaScript', 'Responsive Design', 'Multi-timezone', 'Calendar System', 'Weather API', 'CRUD Operations'],
        liveUrl: 'https://schoolproject.wecandotoo.com/',
        repoUrl: 'https://github.com/nanoview/School-Exam-PHP',
      },
      {
        title: 'PHP CRUD Application',
        description: 'A comprehensive PHP-based CRUD (Create, Read, Update, Delete) application demonstrating fundamental database operations and web development skills. Built with PHP and MySQL for efficient data management.',
        tags: ['PHP', 'MySQL', 'HTML', 'CSS', 'JavaScript', 'CRUD Operations'],
        liveUrl: 'https://phpcrud.wecandotoo.com/',
        repoUrl: 'https://github.com/nanoview/php_crud',
      },
    ],
    experience: [
      {
        role: 'ICT Support Technician',
        company: 'City of Helsinki',
        period: 'Aug – Dec 2020',
        description: 'Installed and configured Windows & macOS systems. Set up and networked PCs, Macs, printers, and classroom equipment. Resolved technical issues and provided clear support to staff and students.'
      },
      {
        role: 'ICT Support Technician',
        company: 'Atlantis Buying (Pvt.) Ltd.',
        period: '2010 – 2013',
        description: 'Maintained IT infrastructure including PCs, printers, and LAN. Troubleshot MS Office, file-sharing, and basic software issues.'
      },
      {
        role: 'IT Support & Quality Controller',
        company: 'JS Knitting & Garments Ltd.',
        period: '2006 – 2008',
        description: 'Provided IT support and maintained systems in a factory environment. Managed production-related data with MS Office.'
      },
       {
        role: 'Other Roles (Housekeeper, Facilities, Office Assistant)',
        company: 'N-Clean Oy, Palmia Oy, etc.',
        period: '2005 – 2024',
        description: 'Demonstrated reliability, adaptability, and strong teamwork in various support roles.'
      },
    ],
    education: [
      {
        degree: 'ICT Installer (Information & Communication Technology)',
        institution: 'Helsinki Vocational College, Finland',
        period: '2021',
      },
      {
        degree: 'Higher Secondary School Certificate (Science)',
        institution: 'Bhawal Badre Alam Govt. College, Bangladesh',
        period: '2001',
      },
    ],
    certifications: [
        'Microsoft Azure Fundamentals (AZ-900T01)',
        'First Aid Certification',
        'Electrical Safety Certification',
        'Hot Work Certification',
        'Occupational Safety Card'
    ],
    languages: [
        { lang: 'Bengali', level: 'Native' },
        { lang: 'English', level: 'Good' },
        { lang: 'Finnish', level: 'Good' },
        { lang: 'Hindi', level: 'Basic' },
        { lang: 'Romanian', level: 'Basic' },
        { lang: 'Italian', level: 'Basic' },
    ]
  };

  // --- Photo Navigation Functions ---
  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % portfolioData.photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + portfolioData.photos.length) % portfolioData.photos.length);
  };

  const goToPhoto = (index: number) => {
    setCurrentPhotoIndex(index);
  };

  // --- Keyboard Navigation ---
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prevPhoto();
      } else if (event.key === 'ArrowRight') {
        nextPhoto();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  return (
    <div className="min-h-screen text-gray-100 font-sans p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-5xl mx-auto">

        {/* Header Section */}
        <header className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12 bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50">
          <div className="relative">
            {/* Photo Carousel */}
            <div className="relative w-32 h-32 mx-auto group">
              <div className="w-32 h-32 border-4 border-gray-600 shadow-2xl ring-4 ring-purple-500 overflow-hidden rounded-full transition-all duration-500 hover:ring-purple-400 hover:shadow-purple-500/20">
                <img
                  src={portfolioData.photos[currentPhotoIndex].src}
                  alt={portfolioData.photos[currentPhotoIndex].alt}
                  className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
                />
              </div>
              
              {/* Navigation Buttons - Only show on hover */}
              <button
                onClick={prevPhoto}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 bg-gray-700/90 hover:bg-gray-600 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-600/50 opacity-0 group-hover:opacity-100"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-4 h-4 text-purple-400" />
              </button>
              
              <button
                onClick={nextPhoto}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-8 bg-gray-700/90 hover:bg-gray-600 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-600/50 opacity-0 group-hover:opacity-100"
                aria-label="Next photo"
              >
                <ChevronRight className="w-4 h-4 text-purple-400" />
              </button>
              
              {/* Photo Indicators */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
                {portfolioData.photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToPhoto(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentPhotoIndex
                        ? 'bg-purple-400 scale-125'
                        : 'bg-gray-500 hover:bg-purple-400'
                    }`}
                    aria-label={`Go to photo ${index + 1}`}
                  />
                ))}
              </div>
              
              {/* Photo Caption */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-xs text-purple-300 font-medium bg-gray-800/80 px-2 py-1 rounded-full">
                {portfolioData.photos[currentPhotoIndex].caption}
              </div>
              
              {/* Keyboard Navigation Hint */}
              <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-75">
                Use ← → arrow keys to navigate
              </div>
            </div>
            
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-4 border-gray-800 shadow-lg"></div>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{portfolioData.name}</h1>
            <p className="text-xl text-blue-400 font-medium bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{portfolioData.title}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 mt-3 text-sm text-gray-300">
              <a href={`https://wa.me/${portfolioData.contact.phone.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-green-400 transition-all duration-300 hover:scale-105">
                <Phone className="w-4 h-4 mr-1 text-green-400" /> {portfolioData.contact.phone}
              </a>
              <a href={portfolioData.contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-400 transition-all duration-300 hover:scale-105">
                <Linkedin className="w-4 h-4 mr-1 text-blue-400" /> LinkedIn
              </a>
              <a href={portfolioData.contact.github} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-gray-300 transition-all duration-300 hover:scale-105">
                <Github className="w-4 h-4 mr-1 text-gray-400" /> GitHub
              </a>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Me */}
            <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-gray-600 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-white">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    👋
                  </div>
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-base leading-relaxed text-gray-200">{portfolioData.bio}</p>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-gray-600 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-green-600 to-teal-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-white">
                  <Briefcase className="w-5 h-5 mr-2" /> Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {portfolioData.experience.map((exp, index) => (
                  <div key={index} className="border-b border-gray-600 pb-4 last:border-b-0 bg-gray-700/50 rounded-lg p-4 hover:bg-gray-600/50 transition-all duration-300">
                    <h3 className="text-lg font-semibold text-green-300">{exp.role}</h3>
                    <p className="text-md font-medium bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">{exp.company}</p>
                    <p className="text-xs text-green-400 mb-2 font-medium">{exp.period}</p>
                    <p className="text-sm text-gray-300">{exp.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Projects */}
            <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-gray-600 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-white">
                  <Code className="w-5 h-5 mr-2" /> Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {portfolioData.projects.map((project, index) => (
                  <div key={index} className="border-b border-gray-600 pb-4 last:border-b-0 bg-gray-700/50 rounded-lg p-4 hover:bg-gray-600/50 transition-all duration-300">
                    <h3 className="text-lg font-semibold text-purple-300">{project.title}</h3>
                    <p className="text-sm text-gray-300 mt-1 mb-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.tags.map(tag => (
                        <Badge key={tag} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center space-x-4">
                      <Button variant="outline" size="sm" className="border-purple-500 text-purple-300 hover:bg-purple-600/20 hover:border-purple-400 transition-all duration-300" asChild>
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" /> Live Site
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-purple-300 hover:bg-purple-600/20 hover:text-purple-200 transition-all duration-300" asChild>
                        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" /> View Code
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Skills */}
            <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-gray-600 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-red-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-white">
                  <Code className="w-5 h-5 mr-2" /> Key Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 p-6">
                {portfolioData.skills.map(skill => (
                  <Badge key={skill} className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105">
                    {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-gray-600 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-white">
                  <GraduationCap className="w-5 h-5 mr-2" /> Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {portfolioData.education.map((edu, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-600/50 transition-all duration-300">
                    <h4 className="font-semibold text-cyan-300">{edu.degree}</h4>
                    <p className="text-sm bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-medium">{edu.institution}</p>
                    <p className="text-xs text-cyan-400 font-medium">{edu.period}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Certifications */}
            <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-gray-600 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-yellow-600 to-orange-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-white">
                  <ShieldCheck className="w-5 h-5 mr-2" /> Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="list-disc list-inside space-y-2 text-sm">
                      {portfolioData.certifications.map((cert) => (
                        <li key={cert} className="text-gray-300 hover:text-orange-400 transition-colors duration-300">{cert}</li>
                      ))}
                      <li className="text-gray-300 hover:text-orange-400 transition-colors duration-300">React.js Fundamentals 3 ECTS (Metropolia University)</li>
                </ul>
              </CardContent>
            </Card>

             {/* Languages */}
            <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-gray-600 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-pink-600 to-rose-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-white">
                  <Languages className="w-5 h-5 mr-2" /> Languages
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                 <ul className="list-disc list-inside space-y-2 text-sm">
                    {portfolioData.languages.map((lang) => (
                      <li key={lang.lang} className="text-gray-300 hover:text-pink-400 transition-colors duration-300">
                        <strong className="text-pink-400">{lang.lang}:</strong> {lang.level}
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArifulPortfolio;
