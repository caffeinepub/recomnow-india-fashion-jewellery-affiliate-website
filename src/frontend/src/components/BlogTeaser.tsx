import { memo } from 'react';
import { useGetFeaturedBlogPosts } from '../hooks/useQueries';
import { Clock, User, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface BlogTeaserProps {
  onReadMore: (blogId: bigint) => void;
}

const BlogTeaser = memo(({ onReadMore }: BlogTeaserProps) => {
  const { data: blogPosts, isLoading } = useGetFeaturedBlogPosts();

  if (isLoading) {
    return (
      <section className="py-12 px-4 bg-white" aria-labelledby="blog-heading">
        <div className="container mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold-600" aria-hidden="true" />
          </div>
        </div>
      </section>
    );
  }

  if (!blogPosts || blogPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 bg-white" aria-labelledby="blog-heading">
      <div className="container mx-auto">
        <h2 id="blog-heading" className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-900">
          Latest Fashion Tips & Trends
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(0, 3).map((post) => (
            <article
              key={post.id.toString()}
              className="bg-white rounded-xl overflow-hidden border-2 border-gold-300 hover:border-gold-500 transition-all hover:shadow-xl card-hover-effect"
            >
              <div className="aspect-video bg-gradient-to-br from-gold-100 to-navy-100 flex items-center justify-center">
                <img
                  src="/assets/generated/styling-blog.dim_300x200.png"
                  alt={`${post.title} blog post illustration`}
                  className="w-full h-full object-cover"
                  width={300}
                  height={200}
                  loading="lazy"
                />
              </div>
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-navy-900 line-clamp-2 min-h-[3.5rem]">
                  {post.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-navy-600">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4 text-gold-600" aria-hidden="true" />
                    <span className="font-medium">{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gold-600" aria-hidden="true" />
                    <span className="font-medium">
                      {new Date(Number(post.createdAt) / 1000000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-navy-700 line-clamp-3 leading-relaxed">
                  {post.content.substring(0, 150)}...
                </p>
                <Button
                  onClick={() => onReadMore(post.id)}
                  variant="outline"
                  className="w-full border-gold-500 text-gold-800 hover:bg-gold-100 font-semibold mt-4"
                >
                  Read More
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
});

BlogTeaser.displayName = 'BlogTeaser';

export default BlogTeaser;
