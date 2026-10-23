export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  authorRole: string;
  publishedAt: string; // ISO date string YYYY-MM-DD
  readTimeMinutes: number;
  coverImage: string;
  status: 'published' | 'draft';
  viewsCount: number;
  likesCount: number;
  featured?: boolean;
}

export interface Comment {
  id: string;
  articleId: string;
  articleTitle: string;
  authorName: string;
  authorRole: string;
  email: string;
  text: string;
  createdAt: string; // ISO string
  status: 'approved' | 'pending' | 'spam';
}

export interface Subscriber {
  id: string;
  email: string;
  frequency: 'semanal' | 'mensual';
  subscribedAt: string;
}

export interface BlogSettings {
  blogTitle: string;
  blogSubtitle: string;
  authorName: string;
  authorRole: string;
  authorBio: string;
  authorAvatar: string;
  yearsOfExperience: number;
  adminPin: string; // Simple PIN to protect admin view if desired
  googleSheetWebhookUrl?: string; // Optional Google Apps Script webhook URL to sync subscribers directly
}
