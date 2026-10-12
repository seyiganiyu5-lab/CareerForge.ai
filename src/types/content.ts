import type { Locale } from '@/i18n/config';

export interface ContentSection {
  id: string;
  heading: string;
  body: string;
}

export interface ArticleBody {
  intro: string;
  sections: ContentSection[];
  conclusion?: string;
}

export interface HelpCategory {
  slug: string;
  icon: string;
  articleCount: number;
  en: { title: string; description: string };
  fr: { title: string; description: string };
}

export interface HelpArticle {
  slug: string;
  category: string;
  author: string;
  en: {
    title: string;
    description: string;
    readingTime: string;
    lastUpdated: string;
    content: ArticleBody;
  };
  fr: {
    title: string;
    description: string;
    readingTime: string;
    lastUpdated: string;
    content: ArticleBody;
  };
}

export interface BlogAuthor {
  name: string;
  role: string;
  avatar: string;
  bio: string;
}

export interface BlogCategory {
  slug: string;
  en: string;
  fr: string;
}

export interface BlogPost {
  slug: string;
  category: string;
  featuredImage: string;
  author: BlogAuthor;
  en: {
    title: string;
    description: string;
    publishedDate: string;
    readingTime: string;
    content: ArticleBody;
  };
  fr: {
    title: string;
    description: string;
    publishedDate: string;
    readingTime: string;
    content: ArticleBody;
  };
}

export function getLocalized<T extends { en: unknown; fr: unknown }>(
  item: T,
  locale: Locale
): T['en'] {
  return item[locale] as T['en'];
}