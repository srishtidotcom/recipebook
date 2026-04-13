import { useState } from 'react';
import { Plus, Trash2, GripVertical, Upload, X, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Drinks', 'Vegan', 'Other'];

export default function RecipeForm({ initial = {}, onSubmit, loading, submitLabel = 'Save Recipe' }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    category: initial.category || 'Dinner',
    prep_time: initial.prep_time || '',
    cook_time: initial.cook_time || '',
    servings: initial.servings || 4,
    youtube_url: initial.youtube_url || '',
    ingredients: initial.ingredients?.length ? initial.ingredients : [''],
    instructions: initial.instructions?.length ? initial.instructions : [''],
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(initial.image || null);
  const [error, setError] = useState('');

  const setField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const updateList = (listKey, index, value) => {
    setForm(prev => {
      const list = [...prev[listKey]];
      list[index] = value;
      return { ...prev, [listKey]: list };
    });
  };
  const addItem = (listKey) => setForm(prev => ({ ...prev, [listKey]: [...prev[listKey], ''] }));
  const removeItem = (listKey, index) => {
    setForm(prev => {
      const list = prev[listKey].filter((_, i) => i !== index);
      return { ...prev, [listKey]: list.length ? list : [''] };
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10MB'); return; }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    const cleanIngredients = form.ingredients.filter(i => i.trim());
    const cleanInstructions = form.instructions.filter(i => i.trim());
    if (cleanIngredients.length === 0) { setError('Add at least one ingredient'); return; }
    if (cleanInstructions.length === 0) { setError('Add at least one instruction step'); return; }

    const fd = new FormData();
    Object.entries({ ...form, ingredients: JSON.stringify(cleanIngredients), instructions: JSON.stringify(cleanInstructions) })
      .forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append('image', image);

    try {
      await onSubmit(fd);
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {/* Basic info */}
      <div className="card p-6 space-y-5">
        <h2 className="font-display text-xl text-bark-900">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium text-bark-800 mb-1.5">Recipe Title *</label>
          <input
            type="text" value={form.title}
            onChange={e => setField('title', e.target.value)}
            placeholder="e.g. Grandma's Chicken Soup"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-bark-800 mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={e => setField('description', e.target.value)}
            placeholder="What makes this recipe special?"
            rows={3} className="input-field resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-bark-800 mb-1.5">Category *</label>
          <select value={form.category} onChange={e => setField('category', e.target.value)} className="input-field">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-bark-800 mb-1.5">YouTube Link (optional)</label>
          <input
            type="url"
            value={form.youtube_url}
            onChange={e => setField('youtube_url', e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="input-field"
          />
          <p className="text-xs text-bark-400 mt-1">If left blank, RecipeBook will auto-show a YouTube preview based on recipe name.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[['prep_time', 'Prep Time (min)'], ['cook_time', 'Cook Time (min)'], ['servings', 'Servings']].map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-bark-800 mb-1.5">{label}</label>
              <input
                type="number" min="0" value={form[key]}
                onChange={e => setField(key, e.target.value)}
                className="input-field"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Image upload */}
      <div className="card p-6">
        <h2 className="font-display text-xl text-bark-900 mb-4">Photo</h2>
        <label className="block cursor-pointer">
          <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden h-52 group">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-bark-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium flex items-center gap-1.5"><Upload size={16} /> Change photo</span>
              </div>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setImage(null); setImagePreview(initial.image || null); }}
                className="absolute top-3 right-3 bg-white/80 rounded-full p-1 hover:bg-white transition-colors"
              >
                <X size={14} className="text-bark-700" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-bark-500/20 rounded-2xl h-36 flex flex-col items-center justify-center gap-2 hover:border-terracotta-400/40 hover:bg-cream-100 transition-all">
              <Upload size={24} className="text-bark-400" />
              <span className="text-sm text-bark-500">Click to upload a photo</span>
              <span className="text-xs text-bark-400">Max 10MB · JPEG, PNG, WebP</span>
            </div>
          )}
        </label>
      </div>

      {/* Ingredients */}
      <div className="card p-6">
        <h2 className="font-display text-xl text-bark-900 mb-4">Ingredients</h2>
        <div className="space-y-2.5">
          {form.ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-center">
              <GripVertical size={16} className="text-bark-300 shrink-0" />
              <input
                type="text" value={ing}
                onChange={e => updateList('ingredients', i, e.target.value)}
                placeholder={`Ingredient ${i + 1}…`}
                className="input-field text-sm"
              />
              <button
                type="button" onClick={() => removeItem('ingredients', i)}
                className="text-bark-300 hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button" onClick={() => addItem('ingredients')}
          className="mt-3 flex items-center gap-1.5 text-sm text-terracotta-500 hover:text-terracotta-600 font-medium transition-colors"
        >
          <Plus size={16} /> Add ingredient
        </button>
      </div>

      {/* Instructions */}
      <div className="card p-6">
        <h2 className="font-display text-xl text-bark-900 mb-4">Instructions</h2>
        <div className="space-y-3">
          {form.instructions.map((step, i) => (
            <div key={i} className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-terracotta-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-2">
                {i + 1}
              </span>
              <textarea
                value={step}
                onChange={e => updateList('instructions', i, e.target.value)}
                placeholder={`Step ${i + 1}…`}
                rows={2}
                className="input-field text-sm resize-none flex-1"
              />
              <button
                type="button" onClick={() => removeItem('instructions', i)}
                className="text-bark-300 hover:text-red-400 transition-colors shrink-0 mt-2"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button" onClick={() => addItem('instructions')}
          className="mt-3 flex items-center gap-1.5 text-sm text-terracotta-500 hover:text-terracotta-600 font-medium transition-colors"
        >
          <Plus size={16} /> Add step
        </button>
      </div>

      {/* Submit */}
      <div className="flex gap-3 justify-end pb-4">
        <button type="button" onClick={() => window.history.back()} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-8">
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : submitLabel}
        </button>
      </div>
    </form>
  );
}
