import type { Metadata } from 'next';
import { helpArticles, helpCategories, getArticleBySlug } from '@/data/help-data';
import ArticleContent from './article-content';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug, 'en');
  if (!article) return { title: 'Article Not Found | CareerForge AI' };

  const category = helpCategories.find(c => c.slug === article.category);

  return {
    title: `${article.content.en.title} | Help Center | CareerForge AI`,
    description: article.seo.en.description,
    keywords: article.seo.en.keywords,
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  return <ArticleContent params={params} />;
}