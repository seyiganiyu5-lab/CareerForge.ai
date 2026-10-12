import type { Metadata } from 'next';
import { helpCategories, helpArticles } from '@/data/help-data';
import CategoryContent from './category-content';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = helpCategories.find(c => c.slug === slug);
  if (!category) return { title: 'Category Not Found | CareerForge AI' };

  return {
    title: `${category.content.en.title} | Help Center | CareerForge AI`,
    description: category.content.en.description,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return <CategoryContent params={params} />;
}