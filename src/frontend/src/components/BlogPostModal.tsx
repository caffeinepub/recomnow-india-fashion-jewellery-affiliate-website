import { useGetBlogPostById } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Calendar, User, Loader2, AlertCircle } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface BlogPostModalProps {
  postId: bigint;
  onClose: () => void;
}

export default function BlogPostModal({ postId, onClose }: BlogPostModalProps) {
  const { data: post, isLoading, isError, error } = useGetBlogPostById(postId);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 bg-background">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary-magenta" />
          </div>
        ) : isError || !post ? (
          <div className="text-center py-12 space-y-4 px-6 bg-background">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <p className="text-lg font-semibold text-foreground">Blog post not found</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error instanceof Error ? error.message : 'Unable to load the blog post.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b bg-background">
              <DialogTitle className="text-2xl md:text-3xl font-bold text-foreground pr-8">
                {post.title}
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {post.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(Number(post.createdAt) / 1000000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </DialogHeader>
            
            <ScrollArea className="flex-1 overflow-y-auto bg-background">
              <div className="px-6 py-6">
                <article className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-a:text-primary-magenta hover:prose-a:text-primary-magenta/80 prose-ul:text-foreground prose-ol:text-foreground">
                  <div
                    className="blog-content whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </article>
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
