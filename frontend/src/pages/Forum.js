import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { forumAPI } from '../services/api';
import {
  MessageSquare,
  Heart,
  MessageCircle,
  User,
  Calendar,
  Plus,
  X,
  Search,
  Loader2,
  Trash2,
  Leaf,
  TrendingUp,
  HelpCircle,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const Forum = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showPostDetail, setShowPostDetail] = useState(null);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
  const [newComment, setNewComment] = useState('');

  const categories = [
    { id: 'all', name: 'All Topics', icon: MessageCircle },
    { id: 'general', name: 'General', icon: MessageSquare },
    { id: 'farming', name: 'Farming Tips', icon: Leaf },
    { id: 'market', name: 'Market Discussion', icon: TrendingUp },
    { id: 'help', name: 'Help & Support', icon: HelpCircle },
    { id: 'discussion', name: 'Discussion', icon: Users }
  ];

  const { data: postsData, isLoading, error } = useQuery(
    ['forum-posts', selectedCategory, searchQuery],
    async () => {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      const response = await forumAPI.get('/', { params });
      return response.data;
    },
    { staleTime: 60000 }
  );

  const { data: postDetail, refetch: refetchPost } = useQuery(
    ['forum-post', showPostDetail],
    async () => {
      if (!showPostDetail) return null;
      const response = await forumAPI.get(`/${showPostDetail}`);
      return response.data;
    },
    { enabled: !!showPostDetail }
  );

  const createPostMutation = useMutation(
    async (postData) => {
      const response = await forumAPI.post('/', postData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('forum-posts');
        setShowNewPostModal(false);
        setNewPost({ title: '', content: '', category: 'general' });
        toast.success('Post created successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create post');
      }
    }
  );

  const addCommentMutation = useMutation(
    async ({ postId, comment }) => {
      const response = await forumAPI.post(`/${postId}/comments`, { comment });
      return response.data;
    },
    {
      onSuccess: () => {
        refetchPost();
        setNewComment('');
        toast.success('Comment added!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add comment');
      }
    }
  );

  const likeMutation = useMutation(
    async (postId) => {
      const response = await forumAPI.post(`/${postId}/like`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('forum-posts');
        if (showPostDetail) refetchPost();
      }
    }
  );

  const deletePostMutation = useMutation(
    async (postId) => {
      const response = await forumAPI.delete(`/${postId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('forum-posts');
        setShowPostDetail(null);
        toast.success('Post deleted');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete post');
      }
    }
  );

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to create a post');
      return;
    }
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    createPostMutation.mutate(newPost);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    if (!newComment.trim()) return;
    addCommentMutation.mutate({ postId: showPostDetail, comment: newComment });
  };

  const handleLike = (postId, e) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to like');
      return;
    }
    likeMutation.mutate(postId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (showPostDetail && postDetail) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container max-w-4xl">
          <button onClick={() => setShowPostDetail(null)} className="mb-4 text-primary-600 hover:text-primary-700">
            ← Back to Forum
          </button>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{postDetail.author_name}</p>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{postDetail.author_role}</span>
                </div>
              </div>
              {(user?.id === postDetail.user_id || user?.role === 'admin') && (
                <button onClick={() => { if (window.confirm('Delete this post?')) deletePostMutation.mutate(postDetail.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm mb-4">{postDetail.category}</span>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{postDetail.title}</h1>
            <p className="text-gray-700 whitespace-pre-wrap mb-6">{postDetail.content}</p>
            <div className="flex items-center space-x-6 border-t pt-4">
              <button onClick={(e) => handleLike(postDetail.id, e)} className="flex items-center space-x-2 text-gray-600 hover:text-red-500">
                <Heart className="h-5 w-5" />
                <span>{postDetail.likes_count || 0} likes</span>
              </button>
              <span className="flex items-center space-x-2 text-gray-600">
                <MessageCircle className="h-5 w-5" />
                <span>{postDetail.comments?.length || 0} comments</span>
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" /> {formatDate(postDetail.created_at)}
              </span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Comments</h3>
            {user && (
              <form onSubmit={handleAddComment} className="mb-6">
                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none" rows={3} />
                <div className="flex justify-end mt-2">
                  <button type="submit" disabled={addCommentMutation.isLoading || !newComment.trim()} className="btn btn-primary px-4 py-2 disabled:opacity-50">
                    {addCommentMutation.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post Comment'}
                  </button>
                </div>
              </form>
            )}
            <div className="space-y-4">
              {postDetail.comments?.map((comment) => (
                <div key={comment.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><User className="h-4 w-4 text-gray-600" /></div>
                    <span className="font-medium text-gray-900">{comment.commenter_name || comment.author_name}</span>
                    <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-gray-700 ml-10">{comment.comment}</p>
                </div>
              ))}
              {!postDetail.comments?.length && <p className="text-gray-500 text-center py-4">No comments yet. Be the first!</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Community Forum</h1>
              <p className="text-gray-600">Connect with farmers and buyers, share tips, and discuss</p>
            </div>
            <button onClick={() => { if (!user) { toast.error('Please login to create a post'); return; } setShowNewPostModal(true); }} className="btn btn-primary flex items-center space-x-2">
              <Plus className="h-5 w-5" /><span>New Discussion</span>
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search discussions..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex items-center space-x-1 px-3 py-2 rounded-lg whitespace-nowrap ${selectedCategory === cat.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    <Icon className="h-4 w-4" /><span className="text-sm">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Failed to load posts</p>
              <button onClick={() => queryClient.invalidateQueries('forum-posts')} className="btn btn-primary">Retry</button>
            </div>
          ) : postsData?.posts?.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
              <p className="text-gray-600 mb-4">Start the conversation by creating the first post!</p>
              {user && <button onClick={() => setShowNewPostModal(true)} className="btn btn-primary">Create Post</button>}
            </div>
          ) : (
            postsData?.posts?.map((post) => (
              <div key={post.id} onClick={() => setShowPostDetail(post.id)} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center"><User className="h-5 w-5 text-primary-600" /></div>
                    <div>
                      <p className="font-medium text-gray-900">{post.author_name}</p>
                      <span className="text-xs text-gray-500">{post.author_role}</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{post.category}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-600 line-clamp-2 mb-4">{post.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1"><Calendar className="h-4 w-4" /><span>{formatDate(post.created_at)}</span></span>
                    <button onClick={(e) => handleLike(post.id, e)} className="flex items-center space-x-1 hover:text-red-500"><Heart className="h-4 w-4" /><span>{post.likes_count || 0}</span></button>
                    <span className="flex items-center space-x-1"><MessageCircle className="h-4 w-4" /><span>{post.comments_count || 0}</span></span>
                  </div>
                  <span className="text-primary-600">Read more →</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Create New Discussion</h2>
                <button onClick={() => setShowNewPostModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleCreatePost}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                    {categories.filter(c => c.id !== 'all').map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input type="text" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} placeholder="What's on your mind?" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" maxLength={255} />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} placeholder="Share your thoughts, questions, or experiences..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none" rows={6} />
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowNewPostModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" disabled={createPostMutation.isLoading || !newPost.title.trim() || !newPost.content.trim()} className="btn btn-primary px-4 py-2 disabled:opacity-50">
                    {createPostMutation.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post Discussion'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forum;
