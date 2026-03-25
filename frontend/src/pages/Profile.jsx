import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { User, Edit2, Camera, CheckCircle2, AlertCircle, Plus, Trash2, Clock, Users } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ username: '', bio: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({ username: user.username || '', bio: user.bio || '' });
      fetchRecipes();
    }
  }, [user]);

  const fetchRecipes = () => {
    setLoadingRecipes(true);
    axios.get(`/api/recipes/user/${user.id}`)
      .then(res => setRecipes(res.data))
      .catch(console.error)
      .finally(() => setLoadingRecipes(false));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setSaveMsg(''); setSaveError('');
    try {
      const fd = new FormData();
      fd.append('username', form.username);
      fd.append('bio', form.bio);
      if (avatarFile) fd.append('avatar', avatarFile);
      const { data } = await axios.put('/api/auth/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data);
      setSaveMsg('Profile updated!');
      setEditMode(false);
      setAvatarFile(null);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecipe = async (id) => {
    try {
      await axios.delete(`/api/recipes/${id}`);
      setRecipes(prev => prev.filter(r => r.id !== id));
      setDeleteId(null);
    } catch {}
  };

  const avatar = avatarPreview || user?.avatar;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-up">
      <div className="grid md:grid-cols-3 gap-8">

        {/* ── Profile Panel ── */}
        <div className="md:col-span-1">
          <div className="card p-6 sticky top-24">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-terracotta-100 flex items-center justify-center">
                  {avatar ? (
                    <img src={avatar} alt={user?.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display text-4xl text-terracotta-500 uppercase">{user?.username?.[0]}</span>
                  )}
                </div>
                {editMode && (
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-terracotta-500 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-terracotta-600 transition-colors">
                    <Camera size={14} className="text-white" />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                )}
              </div>
              {!editMode ? (
                <>
                  <h2 className="font-display text-2xl text-bark-900">{user?.username}</h2>
                  <p className="text-sm text-bark-500 mt-0.5">{user?.email}</p>
                  {user?.bio && <p className="text-sm text-bark-600 mt-3 leading-relaxed">{user.bio}</p>}
                  <button onClick={() => setEditMode(true)} className="btn-secondary text-sm mt-4 flex items-center gap-1.5">
                    <Edit2 size={13} /> Edit Profile
                  </button>
                </>
              ) : (
                <form onSubmit={handleSaveProfile} className="w-full space-y-3 text-left mt-2">
                  {saveError && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-3 py-2 text-xs">
                      <AlertCircle size={13} /> {saveError}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-bark-700 mb-1">Username</label>
                    <input
                      value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                      className="input-field text-sm py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-bark-700 mb-1">Bio</label>
                    <textarea
                      value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                      placeholder="Tell us about yourself…"
                      rows={3} className="input-field text-sm resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="btn-primary text-sm flex-1 flex items-center justify-center gap-1.5">
                      {saving ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={13} />}
                      Save
                    </button>
                    <button type="button" onClick={() => { setEditMode(false); setAvatarFile(null); setAvatarPreview(null); }} className="btn-secondary text-sm px-3">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {saveMsg && (
              <div className="flex items-center gap-2 text-sage-600 bg-sage-400/10 rounded-xl px-3 py-2 text-xs mt-2">
                <CheckCircle2 size={13} /> {saveMsg}
              </div>
            )}

            <div className="border-t border-bark-500/10 pt-4 mt-2 text-center">
              <div className="text-2xl font-display font-semibold text-bark-900">{recipes.length}</div>
              <div className="text-xs text-bark-500 mt-0.5">Recipe{recipes.length !== 1 ? 's' : ''} published</div>
            </div>

            <div className="mt-4">
              <Link to="/recipes/new" className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                <Plus size={15} /> New Recipe
              </Link>
            </div>
          </div>
        </div>

        {/* ── My Recipes ── */}
        <div className="md:col-span-2">
          <h2 className="font-display text-2xl text-bark-900 mb-5">My Recipes</h2>

          {loadingRecipes ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-4 flex gap-4 animate-pulse">
                  <div className="w-24 h-20 bg-cream-200 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-cream-200 rounded w-2/3" />
                    <div className="h-3 bg-cream-200 rounded" />
                    <div className="h-3 bg-cream-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-16 bg-cream-100 rounded-2xl border border-bark-500/10">
              <User size={36} className="text-bark-300 mx-auto mb-3" />
              <h3 className="font-display text-xl text-bark-700 mb-1">No recipes yet</h3>
              <p className="text-sm text-bark-500 mb-5">Start sharing your favourite dishes</p>
              <Link to="/recipes/new" className="btn-primary text-sm inline-flex items-center gap-1.5">
                <Plus size={14} /> Create First Recipe
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recipes.map(recipe => {
                const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
                return (
                  <div key={recipe.id} className="card p-4 flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-24 h-20 rounded-xl overflow-hidden bg-cream-200 shrink-0">
                      {recipe.image ? (
                        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-terracotta-400/20 to-bark-500/10" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link to={`/recipe/${recipe.slug}`} className="font-display font-semibold text-bark-900 hover:text-terracotta-600 transition-colors line-clamp-1">
                            {recipe.title}
                          </Link>
                          <div className="flex items-center gap-3 text-xs text-bark-400 mt-1 flex-wrap">
                            <span className="badge bg-cream-200 text-bark-600">{recipe.category}</span>
                            {totalTime > 0 && (
                              <span className="flex items-center gap-1"><Clock size={11} /> {totalTime}m</span>
                            )}
                            {recipe.servings && (
                              <span className="flex items-center gap-1"><Users size={11} /> {recipe.servings}</span>
                            )}
                            <span>{new Date(recipe.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <Link to={`/recipes/edit/${recipe.id}`} className="p-1.5 rounded-lg hover:bg-cream-100 text-bark-400 hover:text-bark-700 transition-colors">
                            <Edit2 size={14} />
                          </Link>
                          {deleteId === recipe.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleDeleteRecipe(recipe.id)} className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                Delete
                              </button>
                              <button onClick={() => setDeleteId(null)} className="text-xs px-2 py-1 bg-cream-200 rounded-lg hover:bg-cream-300 transition-colors">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteId(recipe.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-bark-400 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {recipe.description && (
                        <p className="text-xs text-bark-500 mt-1.5 line-clamp-2">{recipe.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
