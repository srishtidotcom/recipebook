import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';

const CATEGORIES = ['all', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Drinks', 'Vegan', 'Other'];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const searchQ = searchParams.get('search') || '';
  const categoryQ = searchParams.get('category') || 'all';
  const pageQ = parseInt(searchParams.get('page') || '1');

  const [localSearch, setLocalSearch] = useState(searchQ);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pageQ, limit: 12 };
      if (searchQ) params.search = searchQ;
      if (categoryQ && categoryQ !== 'all') params.category = categoryQ;
      const { data } = await axios.get('/api/recipes', { params });
      setRecipes(data.recipes);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQ, categoryQ, pageQ]);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);
  useEffect(() => { setLocalSearch(searchQ); }, [searchQ]);

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v && v !== 'all') newParams.set(k, v);
      else newParams.delete(k);
    });
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ search: localSearch });
  };

  const clearFilters = () => {
    setLocalSearch('');
    setSearchParams({});
  };

  const hasFilters = searchQ || (categoryQ && categoryQ !== 'all');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-bark-900 mb-1">Explore Recipes</h1>
        <p className="text-bark-500 text-sm">{total > 0 ? `${total} recipe${total !== 1 ? 's' : ''} found` : 'Discover something delicious'}</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-bark-500/10 rounded-2xl p-4 mb-8 space-y-4">
        <div className="flex gap-3 flex-wrap items-center">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-48">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-bark-500/60" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search recipes…"
                className="input-field pl-9 text-sm py-2"
              />
            </div>
          </form>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-bark-500 hover:text-bark-800 transition-colors px-3 py-2 rounded-xl hover:bg-cream-100">
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => updateParams({ category: cat })}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                categoryQ === cat || (cat === 'all' && !categoryQ)
                  ? 'bg-terracotta-500 text-white shadow-sm'
                  : 'bg-cream-100 text-bark-700 hover:bg-cream-200 border border-bark-500/10'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-44 bg-cream-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-cream-200 rounded w-3/4" />
                <div className="h-3 bg-cream-200 rounded" />
                <div className="h-3 bg-cream-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20">
          <SlidersHorizontal size={40} className="text-bark-300 mx-auto mb-3" />
          <h2 className="font-display text-xl text-bark-700 mb-1">No recipes found</h2>
          <p className="text-bark-500 text-sm">Try different search terms or categories</p>
          <button onClick={clearFilters} className="btn-secondary mt-4 text-sm">Clear filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {pageQ > 1 && (
                <button onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: pageQ - 1 })} className="btn-secondary text-sm px-4">
                  ← Prev
                </button>
              )}
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: i + 1 })}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                    pageQ === i + 1 ? 'bg-terracotta-500 text-white' : 'btn-secondary px-0'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              {pageQ < pages && (
                <button onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: pageQ + 1 })} className="btn-secondary text-sm px-4">
                  Next →
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
