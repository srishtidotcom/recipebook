import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChefHat } from 'lucide-react';
import RecipeForm from '../components/RecipeForm';

export default function CreateRecipe() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/recipes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/recipe/${data.slug}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-terracotta-500 rounded-xl flex items-center justify-center">
          <ChefHat size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-bark-900">New Recipe</h1>
          <p className="text-bark-500 text-sm">Share your culinary creation with the world</p>
        </div>
      </div>
      <RecipeForm onSubmit={handleSubmit} loading={loading} submitLabel="Publish Recipe" />
    </div>
  );
}
