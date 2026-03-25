import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ChefHat, Menu, X, Plus, User, LogOut, BookOpen } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recipes?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const avatarUrl = user?.avatar
    ? (user.avatar.startsWith('http') ? user.avatar : user.avatar)
    : null;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-bark-500/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-terracotta-500 rounded-lg flex items-center justify-center">
              <ChefHat size={18} className="text-white" />
            </div>
            <span className="font-display font-semibold text-xl text-bark-900 hidden sm:block">
              RecipeBook
            </span>
          </Link>

          {/* Search bar – desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-6">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bark-500/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes…"
                className="w-full bg-cream-100 border border-bark-500/15 rounded-xl pl-9 pr-4 py-2 text-sm text-bark-900 placeholder:text-bark-500/60 focus:outline-none focus:ring-2 focus:ring-terracotta-400/30 focus:border-terracotta-400 transition-all"
              />
            </div>
          </form>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/recipes" className="btn-ghost text-sm">Explore</Link>

            {user ? (
              <>
                <Link to="/recipes/new" className="btn-primary text-sm flex items-center gap-1.5">
                  <Plus size={15} /> New Recipe
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-cream-100 transition-colors"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={user.username} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-terracotta-100 flex items-center justify-center">
                        <span className="text-terracotta-600 text-xs font-semibold uppercase">
                          {user.username?.[0]}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-bark-800">{user.username}</span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border border-bark-500/10 rounded-2xl shadow-lg py-1.5 text-sm overflow-hidden">
                      <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-cream-100 text-bark-800 transition-colors">
                        <User size={14} /> My Profile
                      </Link>
                      <Link to="/recipes/new" className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-cream-100 text-bark-800 transition-colors">
                        <Plus size={14} /> New Recipe
                      </Link>
                      <div className="border-t border-bark-500/10 my-1" />
                      <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 text-red-600 w-full text-left transition-colors">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">Join Free</Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-cream-100 text-bark-700 transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-bark-500/10 bg-white px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-bark-500/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes…"
              className="w-full bg-cream-100 border border-bark-500/15 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400/30 focus:border-terracotta-400 transition-all"
            />
          </form>
          <Link to="/recipes" className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-cream-100 text-bark-800 font-medium text-sm">
            <BookOpen size={16} /> Explore Recipes
          </Link>
          {user ? (
            <>
              <Link to="/recipes/new" className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-cream-100 text-bark-800 font-medium text-sm">
                <Plus size={16} /> New Recipe
              </Link>
              <Link to="/profile" className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-cream-100 text-bark-800 font-medium text-sm">
                <User size={16} /> My Profile
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-red-50 text-red-600 font-medium text-sm w-full">
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link to="/login" className="flex-1 btn-secondary text-sm text-center">Sign In</Link>
              <Link to="/register" className="flex-1 btn-primary text-sm text-center">Join Free</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
