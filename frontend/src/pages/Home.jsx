import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, ArrowRight, Sunrise, UtensilsCrossed, Cake, Coffee, Leaf, Flame } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';

const CATEGORIES = [
  { name: 'Breakfast', icon: Sunrise,         color: 'bg-amber-50  text-amber-600  border-amber-200'  },
  { name: 'Lunch',     icon: UtensilsCrossed,  color: 'bg-lime-50   text-lime-600   border-lime-200'   },
  { name: 'Dinner',    icon: Flame,            color: 'bg-blue-50   text-blue-600   border-blue-200'   },
  { name: 'Dessert',   icon: Cake,             color: 'bg-pink-50   text-pink-600   border-pink-200'   },
  { name: 'Drinks',    icon: Coffee,           color: 'bg-cyan-50   text-cyan-600   border-cyan-200'   },
  { name: 'Vegan',     icon: Leaf,             color: 'bg-green-50  text-green-600  border-green-200'  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/recipes/featured')
      .then(res => setFeatured(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/recipes?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="fade-up">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-bark-800 via-bark-900 to-bark-900 text-white">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-terracotta-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sage-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <span className="inline-block badge bg-terracotta-500/20 text-terracotta-300 border border-terracotta-500/30 mb-4 text-xs tracking-widest uppercase">
            Discover · Cook · Share
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Every recipe tells<br />
            <em className="text-terracotta-400 not-italic">a story.</em>
          </h1>
          <p className="text-cream-200/70 text-lg md:text-xl max-w-xl mx-auto mb-10">
            Find inspiration from thousands of home cooks or share your own family favourites with the world.
          </p>

          <form onSubmit={handleSearch} className="flex max-w-lg mx-auto gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by dish, ingredient, or cuisine…"
                className="w-full bg-white/10 border border-white/20 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-terracotta-400/50 focus:border-terracotta-400/60 transition-all"
              />
            </div>
            <button type="submit" className="btn-primary rounded-2xl px-6 whitespace-nowrap">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ── Category Cards ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-7">
          <h2 className="font-display text-2xl md:text-3xl text-bark-900">Browse by Category</h2>
          <Link to="/recipes" className="text-sm text-terracotta-500 hover:text-terracotta-600 font-medium flex items-center gap-1 transition-colors">
            All recipes <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map(({ name, icon: Icon, color }) => (
            <Link
              key={name}
              to={`/recipes?category=${name}`}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all hover:scale-105 hover:shadow-md ${color}`}
            >
              <Icon size={24} />
              <span className="text-sm font-semibold">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Recipes ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-7">
          <h2 className="font-display text-2xl md:text-3xl text-bark-900">Featured Recipes</h2>
          <Link to="/recipes" className="text-sm text-terracotta-500 hover:text-terracotta-600 font-medium flex items-center gap-1 transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-cream-200" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-cream-200 rounded w-3/4" />
                  <div className="h-4 bg-cream-200 rounded w-full" />
                  <div className="h-4 bg-cream-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16 text-bark-500">
            <p className="font-display text-xl mb-2">No recipes yet</p>
            <p className="text-sm">Be the first to share something delicious!</p>
            <Link to="/register" className="btn-primary inline-block mt-4 text-sm">Get Started</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
          </div>
        )}
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-terracotta-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-1">Have a recipe to share?</h2>
            <p className="text-white/80 text-sm">Join thousands of home cooks building their digital cookbook.</p>
          </div>
          <Link to="/register" className="shrink-0 bg-white text-terracotta-600 hover:bg-cream-100 font-semibold px-6 py-3 rounded-2xl transition-colors shadow-md">
            Start Sharing Free
          </Link>
        </div>
      </section>
    </div>
  );
}
