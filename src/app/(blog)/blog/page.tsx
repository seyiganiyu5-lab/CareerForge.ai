import type { Metadata } from 'next';
import BlogContent from './blog-content';

export const metadata: Metadata = {
  title: 'Blog | CareerForge AI',
  description: 'Expert career advice, resume tips, cover letter guides, and job search strategies to help you advance your career.',
  alternates: {
    canonical: '/blog',
  },
};

export default function BlogPage() {
  return <BlogContent />;
}