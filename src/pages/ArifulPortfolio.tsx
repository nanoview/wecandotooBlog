import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Github, Linkedin, Mail, ExternalLink, Briefcase, Code, GraduationCap, Phone, Languages, ShieldCheck } from 'lucide-react';

// --- Component ---

const ArifulPortfolio: React.FC = () => {
  // --- Data ---
  const portfolioData = {
    name: 'Ariful Islam',
    title: 'ICT Professional',
    location: 'Opastinsilta 1 B 33, 00520 Helsinki',
    avatarUrl: 'https://github.com/shadcn.png', // Replace with your image URL
    initials: 'AI',
    bio: "Motivated ICT professional with hands-on experience in IT support, troubleshooting, and customer-focused solutions. Skilled in operating systems, networks, and web basics, with a strong interest in SaaS and AI solutions. Completed Microsoft Azure Fundamentals (AZ-900T01) at Metropolia. Eager to learn new technologies and contribute to customer success.",
    contact: {
      email: 'arif.js@gmail.com',
      phone: '040 3781793',
      linkedin: 'https://www.linkedin.com/in/ariful-802is11/',
      github: 'https://github.com/nanoview',
    },
    skills: [
      'Troubleshooting: Windows, Linux, macOS',
      'Hardware/Software Support',
      'HTML, CSS, PHP, JavaScript',
      'Networking: ADDS, DHCP, DNS, IIS, Apache2',
      'Microsoft Azure Fundamentals',
      'Customer Support',
      'Technical Documentation',
      'Teamwork & Collaboration',
      'Problem-Solving',
    ],
    projects: [
      {
        title: 'Stellar Content Stream - wecandotoo.com',
        description: 'A full-featured content management system and blog platform with advanced SEO automation, visitor analytics, and a comprehensive admin dashboard. Built with Vite, React, TypeScript, and Supabase.',
        tags: ['React', 'Supabase', 'TypeScript', 'Vite', 'Edge Functions'],
        liveUrl: 'https://wecandotoo.com',
        repoUrl: 'https://github.com/nanoview/stellar-content-stream',
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

  // --- Render ---
  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header Section */}
        <header className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
          <Avatar className="w-28 h-28 border-4 border-white shadow-lg">
            <AvatarImage src={portfolioData.avatarUrl} alt={portfolioData.name} />
            <AvatarFallback>{portfolioData.initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{portfolioData.name}</h1>
            <p className="text-xl text-blue-600 font-medium">{portfolioData.title}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-gray-500">
              <span className="flex items-center">
                <Mail className="w-4 h-4 mr-1" /> {portfolioData.contact.email}
              </span>
               <span className="flex items-center">
                <Phone className="w-4 h-4 mr-1" /> {portfolioData.contact.phone}
              </span>
              <a href={portfolioData.contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-600 transition-colors">
                <Linkedin className="w-4 h-4 mr-1" /> LinkedIn
              </a>
              <a href={portfolioData.contact.github} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-600 transition-colors">
                <Github className="w-4 h-4 mr-1" /> GitHub
              </a>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Me */}
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed">{portfolioData.bio}</p>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Briefcase className="w-5 h-5 mr-2" /> Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {portfolioData.experience.map((exp, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <h3 className="text-lg font-semibold">{exp.role}</h3>
                    <p className="text-md font-medium text-blue-600">{exp.company}</p>
                    <p className="text-xs text-gray-500 mb-2">{exp.period}</p>
                    <p className="text-sm text-gray-600">{exp.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Code className="w-5 h-5 mr-2" /> Projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {portfolioData.projects.map((project, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <h3 className="text-lg font-semibold">{project.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 mb-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                    <div className="flex items-center space-x-4">
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" /> Live Site
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Code className="w-5 h-5 mr-2" /> Key Skills</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {portfolioData.skills.map(skill => <Badge key={skill}>{skill}</Badge>)}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><GraduationCap className="w-5 h-5 mr-2" /> Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {portfolioData.education.map((edu, index) => (
                  <div key={index}>
                    <h4 className="font-semibold">{edu.degree}</h4>
                    <p className="text-sm text-blue-600">{edu.institution}</p>
                    <p className="text-xs text-gray-500">{edu.period}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><ShieldCheck className="w-5 h-5 mr-2" /> Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                    {portfolioData.certifications.map((cert) => <li key={cert}>{cert}</li>)}
                </ul>
              </CardContent>
            </Card>

             {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Languages className="w-5 h-5 mr-2" /> Languages</CardTitle>
              </CardHeader>
              <CardContent>
                 <ul className="list-disc list-inside space-y-1 text-sm">
                    {portfolioData.languages.map((lang) => <li key={lang.lang}><strong>{lang.lang}:</strong> {lang.level}</li>)}
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
