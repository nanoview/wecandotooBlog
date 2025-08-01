
export interface Author {
  name: string;
  avatar: string;
  bio?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: Author;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  author_id?: string; // Database author ID for edit permissions
  author_username?: string; // Author username for edit permissions
}
