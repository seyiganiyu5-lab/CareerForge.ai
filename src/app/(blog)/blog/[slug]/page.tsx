import type { Metadata } from 'next';
import { blogPosts, getBlogPostBySlug } from '@/data/blog-data';
import BlogArticleContent from './blog-article-content';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug, 'en');
  if (!post) return { title: 'Post Not Found | CareerForge AI' };

  return {
    title: `${post.content.en.title} | Blog | CareerForge AI`,
    description: post.seo.en.description,
    keywords: post.seo.en.keywords,
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return <BlogArticleContent params={params} />;
}