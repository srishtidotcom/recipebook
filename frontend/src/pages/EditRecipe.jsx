import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Edit2, AlertCircle } from 'lucide-react';
import RecipeForm from '../components/RecipeForm';
import { useAuth } from '../components/AuthContext';

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    // Fetch recipe by id — we'll use slug lookup via a separate query
    // We need to find the recipe slug from id; simplest: fetch all user recipes
    axios.get(`/api/recipes/user/${user?.id}`)
      .then(res => {
        const found = res.data.find(r => r.id === parseInt(id));
        if (!found) { setFetchError('Recipe not found or you do not have permission to edit it.'); return; }
        // Parse JSON fields if stringified
        found.ingredients = typeof found.ingredients === 'string' ? JSON.parse(found.ingredients) : found.ingredients;
        found.instructions = typeof found.instructions === 'string' ? JSON.parse(found.instructions) : found.instructions;
        setRecipe(found);
      })
      .catch(() => setFetchError('Failed to load recipe'));
  }, [id, user?.id]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const { data } = await axios.put(`/api/recipes/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/recipe/${data.slug}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchError) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
      <p className="text-bark-700">{fetchError}</p>
      <button onClick={() => navigate(-1)} className="btn-secondary mt-4 text-sm">Go Back</button>
    </div>
  );

  if (!recipe) return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-4 animate-pulse">
      <div className="h-8 bg-cream-200 rounded w-1/3" />
      {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-cream-200 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-bark-700 rounded-xl flex items-center justify-center">
          <Edit2 size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-bark-900">Edit Recipe</h1>
          <p className="text-bark-500 text-sm truncate max-w-xs">{recipe.title}</p>
        </div>
      </div>
      <RecipeForm initial={recipe} onSubmit={handleSubmit} loading={loading} submitLabel="Save Changes" />
    </div>
  );
}
