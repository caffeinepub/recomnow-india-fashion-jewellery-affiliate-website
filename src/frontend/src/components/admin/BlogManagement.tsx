import { useState } from 'react';
import { useGetBlogPosts, useAddBlogPost, useUpdateBlogPost, useDeleteBlogPost } from '../../hooks/useQueries';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';

export default function BlogManagement() {
  const { data: blogPosts, isLoading } = useGetBlogPosts();
  const addBlogPost = useAddBlogPost();
  const updateBlogPost = useUpdateBlogPost();
  const deleteBlogPost = useDeleteBlogPost();

  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    isFeatured: false,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      author: '',
      isFeatured: false,
    });
    setEditingPost(null);
    setShowForm(false);
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      author: post.author,
      isFeatured: post.isFeatured,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPost) {
      updateBlogPost.mutate(
        { id: editingPost.id, ...formData },
        { onSuccess: resetForm }
      );
    } else {
      addBlogPost.mutate(formData, { onSuccess: resetForm });
    }
  };

  const handleDelete = (id: bigint) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      deleteBlogPost.mutate(id);
    }
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
        <h3 className="text-xl font-bold text-foreground">Blog Management</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-rainbow text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Add Blog Post
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-muted/30 rounded-xl p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Author</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded border-border"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-foreground">
                Featured Post
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={addBlogPost.isPending || updateBlogPost.isPending}
              className="px-6 py-2 rounded-full bg-gradient-rainbow text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {editingPost ? 'Update' : 'Add'} Post
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 rounded-full border border-border text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {blogPosts?.map((post) => (
          <div
            key={Number(post.id)}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{post.title}</h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground">By {post.author}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(Number(post.createdAt) / 1000000).toLocaleDateString()}
                  </span>
                  {post.isFeatured && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gradient-rainbow text-white">Featured</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(post)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
