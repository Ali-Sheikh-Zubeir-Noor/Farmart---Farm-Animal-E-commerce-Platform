import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  DollarSign,
  Eye
} from 'lucide-react';
import api from '../../services/api';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, ordersResponse] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/orders')
      ]);
      console.log('Dashboard Stats:', statsResponse.data); 
      setStats(statsResponse.data);
      setRecentOrders(ordersResponse.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatsConfig = () => {
    if (user?.userType === 'farmer') {
      return [
        {
          title: 'Total Animals',
          value: stats.totalAnimals || 0,
          icon: Package,
          color: 'bg-blue-500'
        },
        {
          title: 'Available',
          value: stats.availableAnimals || 0,
          icon: Eye,
          color: 'bg-green-500'
        },
        {
          title: 'Pending Orders',
          value: stats.pendingOrders || 0,
          icon: TrendingUp,
          color: 'bg-purple-500'
        },
        {
          title: 'Total Revenue',
          value: `$${(stats.totalRevenue || 0).toLocaleString()}`,
          icon: DollarSign,
          color: 'bg-yellow-500'
        }
      ];
    } else {
      return [
        {
          title: 'Cart Items',
          value: stats.cartItems || 0,
          icon: ShoppingCart,
          color: 'bg-blue-500'
        },
        {
          title: 'Orders Placed',
          value: stats.totalOrders || 0,
          icon: Package,
          color: 'bg-green-500'
        },
        {
          title: 'Total Spent',
          value: `$${(stats.totalSpent || 0).toLocaleString()}`,
          icon: DollarSign,
          color: 'bg-purple-500'
        },
        {
          title: 'Favorite Animals',
          value: stats.favoriteAnimals || 0,
          icon: Users,
          color: 'bg-red-500'
        }
      ];
    }
  };

  const statsConfig = getStatsConfig();

  const quickActions = user?.userType === 'farmer' ? [
    {
      title: 'Add New Animal',
      description: 'List a new animal for sale',
      icon: Plus,
      link: '/farmer/add-animal',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Manage Animals',
      description: 'View and edit your listings',
      icon: Package,
      link: '/farmer/animals',
      color: 'bg-blue-600 hover:bg-blue-700'
    }
  ] : [
    {
      title: 'Browse Animals',
      description: 'Find quality livestock',
      icon: Eye,
      link: '/animals',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'View Cart',
      description: 'Check your selected animals',
      icon: ShoppingCart,
      link: '/cart',
      color: 'bg-blue-600 hover:bg-blue-700'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {user?.userType === 'farmer' 
            ? 'Manage your livestock and track your sales' 
            : 'Discover quality animals from trusted farmers'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsConfig.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={action.link}
                className={`block p-6 rounded-lg text-white transition-colors ${action.color}`}
              >
                <div className="flex items-center space-x-4">
                  <action.icon className="h-8 w-8" />
                  <div>
                    <h3 className="text-lg font-semibold">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
              <div>
                <p className="font-medium text-gray-900">
                  Order #{order.id.slice(-8)}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  ${order.totalAmount.toLocaleString()}
                </p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  order.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800'
                    : order.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
          {recentOrders.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No recent activity to show
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;