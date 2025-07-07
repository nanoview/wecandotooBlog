
import { BlogPost } from '@/types/blog';

export const categories = [
  'All',
  'Technology',
  'Design',
  'Business',
  'Development',
  'Lifestyle',
  'Tutorial',
  'News'
];

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "The Future of Web Development: Trends to Watch in 2024",
    excerpt: "Explore the latest trends shaping the future of web development, from AI integration to progressive web apps and beyond.",
    content: "",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    author: {
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      bio: "Full-stack developer and tech writer with 8+ years of experience in modern web technologies."
    },
    date: "Dec 15, 2024",
    readTime: "8 min read",
    category: "Technology",
    tags: ["Web Development", "React", "AI", "Trends"]
  },
  {
    id: 2,
    title: "Building Scalable React Applications: Best Practices",
    excerpt: "Learn the essential patterns and practices for building React applications that can grow with your business needs.",
    content: "",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    author: {
      name: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      bio: "Senior React developer and architect at a Fortune 500 company."
    },
    date: "Dec 12, 2024",
    readTime: "12 min read",
    category: "Development",
    tags: ["React", "Architecture", "Scalability", "Best Practices"]
  },
  {
    id: 3,
    title: "Design Systems: Creating Consistency at Scale",
    excerpt: "Discover how to build and maintain design systems that ensure consistency across large product teams and multiple platforms.",
    content: "",
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    author: {
      name: "Emily Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      bio: "UX/UI designer specializing in design systems and user-centered design."
    },
    date: "Dec 10, 2024",
    readTime: "10 min read",
    category: "Design",
    tags: ["Design Systems", "UI/UX", "Consistency", "Figma"]
  },
  {
    id: 4,
    title: "The Art of Remote Team Management",
    excerpt: "Master the challenges of leading distributed teams with proven strategies for communication, productivity, and team building.",
    content: "",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    author: {
      name: "David Kim",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      bio: "Engineering manager with experience leading remote teams across multiple time zones."
    },
    date: "Dec 8, 2024",
    readTime: "7 min read",
    category: "Business",
    tags: ["Management", "Remote Work", "Leadership", "Productivity"]
  },
  {
    id: 5,
    title: "TypeScript Tips for Better Code Quality",
    excerpt: "Elevate your TypeScript skills with advanced techniques that will make your code more robust and maintainable.",
    content: "",
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    author: {
      name: "Alex Thompson",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      bio: "TypeScript enthusiast and open source contributor."
    },
    date: "Dec 5, 2024",
    readTime: "9 min read",
    category: "Development",
    tags: ["TypeScript", "Code Quality", "JavaScript", "Best Practices"]
  },
  {
    id: 6,
    title: "Mindful Productivity: Working Smarter, Not Harder",
    excerpt: "Discover how mindfulness practices can revolutionize your approach to productivity and work-life balance.",
    content: "",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    author: {
      name: "Lisa Wang",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      bio: "Productivity coach and wellness advocate helping professionals achieve better work-life integration."
    },
    date: "Dec 3, 2024",
    readTime: "6 min read",
    category: "Lifestyle",
    tags: ["Productivity", "Mindfulness", "Work-Life Balance", "Wellness"]
  }
];
