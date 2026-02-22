import { memo } from 'react';

interface BlogTeaserProps {
  onReadMore: (blogId: bigint) => void;
}

const BlogTeaser = memo(({ onReadMore }: BlogTeaserProps) => {
  // Blog functionality removed - return null to hide section
  return null;
});

BlogTeaser.displayName = 'BlogTeaser';

export default BlogTeaser;
