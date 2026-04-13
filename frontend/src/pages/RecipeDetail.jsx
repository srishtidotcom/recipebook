import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Clock, Users, ChefHat, Edit2, Trash2, Send, MessageCircle,
  CheckCircle2, AlertCircle, ArrowLeft, Flame
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { getRecipeImageUrl, getRecipeYoutubeEmbedUrl } from '../utils/media';

export default function RecipeDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [checkedSteps, setCheckedSteps] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipeRes, commentsRes] = await Promise.all([
          axios.get(`/api/recipes/${slug}`),
          axios.get(`/api/comments/${slug}`).catch(() => ({ data: [] })),
        ]);
        setRecipe(recipeRes.data);
        // Comments are fetched by recipeId, need to get it after recipe loads
        const cRes = await axios.get(`/api/comments/${recipeRes.data.id}`);
        setComments(cRes.data);
      } catch {
        setError('Recipe not found');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/recipes/${recipe.id}`);
      navigate('/recipes');
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const { data } = await axios.post(`/api/comments/${recipe.id}`, { content: commentText });
      setComments(prev => [data, ...prev]);
      setCommentText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch {}
  };

  const toggleStep = (i) => setCheckedSteps(prev => ({ ...prev, [i]: !prev[i] }));

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
      <div className="h-8 bg-cream-200 rounded w-2/3" />
      <div className="h-72 bg-cream-200 rounded-2xl" />
      <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-cream-200 rounded" />)}</div>
    </div>
  );

  if (error || !recipe) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
      <h2 className="font-display text-2xl text-bark-800 mb-2">{error || 'Recipe not found'}</h2>
      <Link to="/recipes" className="btn-primary inline-flex items-center gap-2 mt-2 text-sm">
        <ArrowLeft size={14} /> Back to recipes
      </Link>
    </div>
  );

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const isOwner = user?.id === recipe.author_id || user?.id === recipe.user_id;
  const imageUrl = getRecipeImageUrl(recipe);
  const youtubeEmbedUrl = getRecipeYoutubeEmbedUrl(recipe.youtube_url, recipe.title);
  const videoHeading = recipe.youtube_url ? 'Recipe Video' : 'Related Videos';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-up">
      {/* Back */}
      <Link to="/recipes" className="inline-flex items-center gap-1.5 text-sm text-bark-500 hover:text-bark-800 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to recipes
      </Link>

      {/* Hero image */}
      <div className="relative rounded-3xl overflow-hidden mb-8 h-72 md:h-96 bg-cream-200">
        {imageUrl ? (
          <img src={imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-terracotta-400/20 to-bark-500/10 flex items-center justify-center">
            <ChefHat size={64} className="text-bark-500/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bark-900/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <span className="badge bg-white/20 text-white backdrop-blur-sm border border-white/20 mb-2 inline-block">
            {recipe.category}
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-white font-bold leading-tight">{recipe.title}</h1>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-col items-start gap-2 text-sm text-bark-600">
          {recipe.prep_time > 0 && (
            <span className="flex items-center gap-1.5 bg-cream-100 px-3 py-1.5 rounded-full">
              <Clock size={14} className="text-terracotta-500" /> Prep: {recipe.prep_time}m
            </span>
          )}
          {recipe.cook_time > 0 && (
            <span className="flex items-center gap-1.5 bg-cream-100 px-3 py-1.5 rounded-full">
              <Flame size={14} className="text-terracotta-500" /> Cook: {recipe.cook_time}m
            </span>
          )}
          {totalTime > 0 && (
            <span className="flex items-center gap-1.5 bg-cream-100 px-3 py-1.5 rounded-full">
              <Clock size={14} className="text-sage-500" /> Total: {totalTime}m
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1.5 bg-cream-100 px-3 py-1.5 rounded-full">
              <Users size={14} className="text-sage-500" /> {recipe.servings} servings
            </span>
          )}
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <Link to={`/recipes/edit/${recipe.id}`} className="btn-secondary text-sm flex items-center gap-1.5 py-2 px-3">
              <Edit2 size={13} /> Edit
            </Link>
            {!deleteConfirm ? (
              <button onClick={() => setDeleteConfirm(true)} className="text-sm flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors border border-red-200">
                <Trash2 size={13} /> Delete
              </button>
            ) : (
              <div className="flex gap-1.5">
                <button onClick={handleDelete} className="text-sm px-3 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors">Confirm</button>
                <button onClick={() => setDeleteConfirm(false)} className="text-sm px-3 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 transition-colors">Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Author */}
      <div className="flex items-center gap-2 mb-6 pb-6 border-b border-bark-500/10">
        <div className="w-8 h-8 rounded-full bg-terracotta-100 flex items-center justify-center">
          {recipe.avatar ? (
            <img src={recipe.avatar} alt={recipe.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-terracotta-600 text-xs font-semibold uppercase">{recipe.username?.[0]}</span>
          )}
        </div>
        <span className="text-sm text-bark-600">Recipe by <strong className="text-bark-900">{recipe.username}</strong></span>
        <span className="text-bark-400 text-xs ml-auto">{new Date(recipe.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
      </div>

      {/* Description */}
      {recipe.description && (
        <p className="text-bark-700 text-base leading-relaxed mb-8 bg-cream-100 rounded-2xl px-5 py-4 border-l-4 border-terracotta-400">
          {recipe.description}
        </p>
      )}

      <div className="mb-10">
        <h2 className="font-display text-2xl text-bark-900 mb-3">{videoHeading}</h2>
        {!recipe.youtube_url && (
          <p className="text-sm text-bark-500 mb-3">Showing YouTube search results based on recipe name. Add a YouTube link while creating or editing for a specific video.</p>
        )}
        <div className="rounded-2xl overflow-hidden border border-bark-500/10 bg-white">
          <iframe
            className="w-full aspect-video"
            src={youtubeEmbedUrl}
            title={`${recipe.title} video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-8 mb-12">
        {/* Ingredients */}
        <div className="md:col-span-2">
          <h2 className="font-display text-2xl text-bark-900 mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients?.map((ing, i) => (
              <li key={i} className="flex items-start gap-2.5 text-bark-700 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta-400 mt-2 shrink-0" />
                {ing}
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="md:col-span-3">
          <h2 className="font-display text-2xl text-bark-900 mb-4">Instructions</h2>
          <ol className="space-y-4">
            {recipe.instructions?.map((step, i) => (
              <li
                key={i}
                onClick={() => toggleStep(i)}
                className={`flex gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  checkedSteps[i]
                    ? 'bg-sage-400/10 border-sage-400/30 opacity-70'
                    : 'bg-white border-bark-500/10 hover:border-terracotta-400/30'
                }`}
              >
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  checkedSteps[i] ? 'bg-sage-400 text-white' : 'bg-terracotta-500 text-white'
                }`}>
                  {checkedSteps[i] ? <CheckCircle2 size={14} /> : i + 1}
                </span>
                <p className={`text-sm text-bark-700 leading-relaxed pt-0.5 ${checkedSteps[i] ? 'line-through text-bark-400' : ''}`}>
                  {step}
                </p>
              </li>
            ))}
          </ol>
          <p className="text-xs text-bark-400 mt-3 ml-1">Tap a step to mark it complete</p>
        </div>
      </div>

      {/* Comments */}
      <div className="border-t border-bark-500/10 pt-10">
        <h2 className="font-display text-2xl text-bark-900 mb-6 flex items-center gap-2">
          <MessageCircle size={22} className="text-terracotta-500" />
          Comments ({comments.length})
        </h2>

        {user ? (
          <form onSubmit={handleComment} className="mb-8">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-terracotta-100 flex items-center justify-center shrink-0">
                <span className="text-terracotta-600 text-sm font-semibold uppercase">{user.username?.[0]}</span>
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts or cooking tips…"
                  rows={3}
                  className="input-field resize-none text-sm pr-12"
                />
                <button
                  type="submit"
                  disabled={commentLoading || !commentText.trim()}
                  className="absolute right-3 bottom-3 text-terracotta-500 hover:text-terracotta-600 disabled:text-bark-300 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-cream-100 border border-bark-500/10 rounded-2xl p-4 mb-8 text-sm text-bark-600 text-center">
            <Link to="/login" className="text-terracotta-500 font-medium hover:underline">Sign in</Link> to leave a comment
          </div>
        )}

        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-cream-200 flex items-center justify-center shrink-0">
                {comment.avatar ? (
                  <img src={comment.avatar} alt={comment.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-bark-600 text-xs font-semibold uppercase">{comment.username?.[0]}</span>
                )}
              </div>
              <div className="flex-1 bg-white border border-bark-500/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-bark-800">{comment.username}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-bark-400">
                      {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    {user?.id === comment.user_id && (
                      <button onClick={() => handleDeleteComment(comment.id)} className="text-bark-400 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-bark-700 text-sm leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-bark-400 text-sm py-8">No comments yet. Be the first to share your thoughts!</p>
          )}
        </div>
      </div>
    </div>
  );
}
