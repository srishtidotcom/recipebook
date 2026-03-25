import { Link } from 'react-router-dom';
import { Clock, Users, ChefHat } from 'lucide-react';

const CATEGORY_COLORS = {
  Breakfast: 'bg-amber-100 text-amber-700',
  Lunch:     'bg-lime-100 text-lime-700',
  Dinner:    'bg-blue-100 text-blue-700',
  Dessert:   'bg-pink-100 text-pink-700',
  Snacks:    'bg-orange-100 text-orange-700',
  Drinks:    'bg-cyan-100 text-cyan-700',
  Vegan:     'bg-green-100 text-green-700',
  Other:     'bg-gray-100 text-gray-600',
};

const PLACEHOLDER_COLORS = [
  'from-terracotta-400/20 to-bark-500/10',
  'from-sage-400/20 to-sage-600/10',
  'from-amber-300/20 to-amber-500/10',
  'from-pink-300/20 to-pink-500/10',
];

export default function RecipeCard({ recipe }) {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const colorIdx = recipe.id % PLACEHOLDER_COLORS.length;
  const badgeClass = CATEGORY_COLORS[recipe.category] || CATEGORY_COLORS.Other;

  return (
    <Link to={`/recipe/${recipe.slug}`} className="card group block">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-cream-200">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${PLACEHOLDER_COLORS[colorIdx]} flex items-center justify-center`}>
            <ChefHat size={40} className="text-bark-500/30" />
          </div>
        )}
        <span className={`absolute top-3 left-3 badge ${badgeClass}`}>
          {recipe.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-bark-900 text-lg leading-snug mb-1 group-hover:text-terracotta-600 transition-colors line-clamp-2">
          {recipe.title}
        </h3>
        <p className="text-bark-600 text-sm line-clamp-2 mb-3">
          {recipe.description || 'A delicious recipe waiting to be discovered.'}
        </p>

        <div className="flex items-center justify-between text-xs text-bark-500">
          <div className="flex items-center gap-3">
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> {totalTime} min
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <Users size={12} /> {recipe.servings}
              </span>
            )}
          </div>
          <span className="text-bark-500/70 font-medium">by {recipe.username}</span>
        </div>
      </div>
    </Link>
  );
}
