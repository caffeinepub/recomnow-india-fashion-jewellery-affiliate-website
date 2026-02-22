import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertCircle } from 'lucide-react';

interface BlogPostModalProps {
  postId: bigint;
  onClose: () => void;
}

export default function BlogPostModal({ postId, onClose }: BlogPostModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 bg-background">
        <div className="text-center py-12 space-y-4 px-6 bg-background">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <p className="text-lg font-semibold text-foreground">Blog feature unavailable</p>
            <p className="text-sm text-muted-foreground mt-2">
              Blog functionality has been removed from this version.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
