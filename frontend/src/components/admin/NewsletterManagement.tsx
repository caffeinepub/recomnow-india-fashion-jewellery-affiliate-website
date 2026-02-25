import { AlertCircle } from 'lucide-react';

export default function NewsletterManagement() {
  return (
    <div className="text-center py-12 space-y-4">
      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
      <div>
        <p className="text-lg font-semibold text-foreground">Newsletter Management Unavailable</p>
        <p className="text-sm text-muted-foreground mt-2">
          Newsletter functionality has been removed from this version.
        </p>
      </div>
    </div>
  );
}
