import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Sprout, ShoppingCart, User, LogOut, Plus, Package, BarChart3 } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Sprout className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">Farmart</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/animals"
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Browse Animals
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            )}
            {isAuthenticated && user?.userType === 'farmer' && (
              <>
                <Link
                  to="/farmer/animals"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <Package className="h-4 w-4" />
                  <span>My Animals</span>
                </Link>
                <Link
                  to="/farmer/add-animal"
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Animal</span>
                </Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.userType === 'buyer' && (
                  <Link
                    to="/cart"
                    className="relative p-2 text-gray-700 hover:text-green-600 transition-colors"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {items.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {items.length}
                      </span>
                    )}
                  </Link>
                )}
                <Link
                  to="/orders"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Orders
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-700">{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 p-2 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;