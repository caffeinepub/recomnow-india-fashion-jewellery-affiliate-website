import { useGetNewsletterSignups } from '../../hooks/useQueries';
import { Mail, Loader2, Download } from 'lucide-react';

export default function NewsletterManagement() {
  const { data: signups, isLoading } = useGetNewsletterSignups();

  const handleExport = () => {
    if (!signups) return;
    
    const csv = [
      ['Email', 'Subscribed Date'],
      ...signups.map((signup) => [
        signup.email,
        new Date(Number(signup.createdAt) / 1000000).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-signups.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-magenta" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">Newsletter Subscribers</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Total subscribers: {signups?.length || 0}
          </p>
        </div>
        {signups && signups.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-rainbow text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        )}
      </div>

      {signups && signups.length > 0 ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Subscribed Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {signups.map((signup, index) => (
                  <tr key={index} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{signup.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(Number(signup.createdAt) / 1000000).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-xl">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No newsletter subscribers yet</p>
        </div>
      )}
    </div>
  );
}
