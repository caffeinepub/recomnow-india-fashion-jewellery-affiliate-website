import { AlertCircle } from 'lucide-react';

export default function SitePagesManagement() {
  return (
    <div className="text-center py-12 space-y-4">
      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
      <div>
        <p className="text-lg font-semibold text-foreground">Site Pages Management Unavailable</p>
        <p className="text-sm text-muted-foreground mt-2">
          Site pages management functionality has been removed from this version.
        </p>
      </div>
    </div>
  );
}
