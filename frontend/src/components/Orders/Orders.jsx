import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Package, Calendar, MapPin, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { fetchOrders, updateOrderStatus } from '../../store/slices/orderSlice';
import toast from 'react-hot-toast';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleStatusUpdate = (orderId, status) => {
    dispatch(updateOrderStatus({ orderId, status }))
      .unwrap()
      .then(() => {
        toast.success(`Order ${status}!`);
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {user?.userType === 'farmer' ? 'Order Requests' : 'My Orders'}
        </h1>
        <p className="text-gray-600">
          {user?.userType === 'farmer' 
            ? 'Manage orders for your animals' 
            : 'Track your animal purchases'
          }
        </p>
      </div>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="bg-gray-50 rounded-lg p-8">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {user?.userType === 'farmer' 
                ? 'No one has ordered your animals yet.' 
                : 'You haven\'t placed any orders yet.'
              }
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.id.slice(-8)}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        ${order.totalAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span>{item.animalName} (Qty: {item.quantity})</span>
                        <span className="font-medium">${(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Shipping Address:
                  </h4>
                  <div className="text-sm text-gray-600">
                    <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                    <p>{order.shippingAddress.phone}</p>
                  </div>
                </div>

                {/* Action Buttons for Farmers */}
                {user?.userType === 'farmer' && order.status === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Confirm Order</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'rejected')}
                      className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject Order</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;