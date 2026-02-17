import { memo, useCallback } from 'react';
import { useGetBlogPosts } from '../hooks/useQueries';
import { Calendar, User } from 'lucide-react';
import { useState } from 'react';
import BlogPostModal from './BlogPostModal';
import type { BlogPost } from '../backend';
import Spinner from './Spinner';

const BlogCard = memo(({ post, onClick }: { post: BlogPost; onClick: () => void }) => (
  <article className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
    <div className="p-6 space-y-4">
      <h3 className="text-xl font-bold text-foreground line-clamp-2">{post.title}</h3>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <User className="h-4 w-4" aria-hidden="true" />
          <span>{post.author}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" aria-hidden="true" />
          <time dateTime={new Date(Number(post.createdAt) / 1000000).toISOString()}>
            {new Date(Number(post.createdAt) / 1000000).toLocaleDateString()}
          </time>
        </div>
      </div>
      <p className="text-muted-foreground line-clamp-3">{post.content.substring(0, 150)}...</p>
      <button
        onClick={onClick}
        className="text-primary-magenta font-medium hover:underline"
        aria-label={`Read full article: ${post.title}`}
      >
        Read More →
      </button>
    </div>
  </article>
));

BlogCard.displayName = 'BlogCard';

function BlogTeaser() {
  const { data: blogPosts, isLoading } = useGetBlogPosts();
  const [selectedPostId, setSelectedPostId] = useState<bigint | null>(null);

  const handlePostClick = useCallback((postId: bigint) => {
    setSelectedPostId(postId);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPostId(null);
  }, []);

  if (isLoading) {
    return (
      <section id="blog" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-12">
            <Spinner className="h-8 w-8 text-primary-magenta" />
          </div>
        </div>
      </section>
    );
  }

  if (!blogPosts || blogPosts.length === 0) {
    return null;
  }

  return (
    <section id="blog" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Fashion & Style Blog
          </h2>
          <p className="text-muted-foreground">Tips, trends, and inspiration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(0, 6).map((post) => (
            <BlogCard
              key={Number(post.id)}
              post={post}
              onClick={() => handlePostClick(post.id)}
            />
          ))}
        </div>
      </div>

      {selectedPostId !== null && (
        <BlogPostModal
          postId={selectedPostId}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
}

export default memo(BlogTeaser);
