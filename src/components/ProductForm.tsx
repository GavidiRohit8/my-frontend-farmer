import React, { useState } from 'react';
import { Package, DollarSign, Hash, Clock, FileText, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8080';

interface ProductFormProps {
  onSubmit: (productData: any) => void;
}

export default function ProductForm({ onSubmit }: ProductFormProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    basePrice: '',
    quantity: '',
    unit: '',
    // now: duration in MINUTES as string
    auctionDuration: '',
    imageUrl: 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) {
      setMessage('Please login as Farmer to add products.');
      return;
    }

    const minutes = parseInt(formData.auctionDuration || '0', 10);
    if (isNaN(minutes) || minutes < 1 || minutes > 4320) {
      setMessage('Auction duration must be between 1 and 4320 minutes (3 days).');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // 1) send to backend as form-data (same as Postman)
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      fd.append('price', formData.basePrice); // backend "price" = base price
      fd.append('quantity', formData.quantity);
      fd.append('farmerEmail', user.email);
      fd.append('auctionDurationMinutes', String(minutes));
      if (imageFile) {
        fd.append('image', imageFile);
      }

      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to create product');
      }

      setMessage('Product and auction created successfully.');

      // 2) old local behaviour for UI
      const auctionEndTime = new Date();
      auctionEndTime.setMinutes(auctionEndTime.getMinutes() + minutes);

      onSubmit({
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        quantity: parseFloat(formData.quantity),
        auctionEndTime,
        status: 'active',
        bids: [],
        createdAt: new Date(),
      });

      // reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        basePrice: '',
        quantity: '',
        unit: '',
        auctionDuration: '',
        imageUrl:
          'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg',
      });
      setImageFile(null);
    } catch (err: any) {
      setMessage(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-green-200/50 overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
        <h2 className="text-2xl font-bold text-white">Add New Product</h2>
        <p className="text-green-100 mt-1">List your produce for auction</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {message && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-2">
            {message}
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative">
            <Package
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500"
              size={20}
            />
            <input
              type="text"
              name="name"
              placeholder="Product Name (e.g., Fresh Tomatoes)"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div className="relative">
            <Tag
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500"
              size={20}
            />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 appearance-none"
              required
            >
              <option value="">Select Category</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="grains">Grains</option>
              <option value="dairy">Dairy</option>
              <option value="organic">Organic</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <FileText className="absolute left-3 top-3 text-green-500" size={20} />
          <textarea
            name="description"
            placeholder="Product description, quality details, farming methods..."
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
            required
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="relative">
            <DollarSign
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500"
              size={20}
            />
            <input
              type="number"
              name="basePrice"
              placeholder="Starting Price (₹)"
              value={formData.basePrice}
              onChange={handleChange}
              min="1"
              step="0.01"
              className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div className="relative">
            <Hash
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500"
              size={20}
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              step="0.1"
              className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 appearance-none"
            required
          >
            <option value="">Select Unit</option>
            <option value="kg">Kilograms (kg)</option>
            <option value="quintal">Quintal</option>
            <option value="ton">Ton</option>
            <option value="pieces">Pieces</option>
            <option value="dozen">Dozen</option>
            <option value="liters">Liters</option>
          </select>
        </div>

        {/* Auction duration in minutes */}
        <div className="relative">
          <Clock
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500"
            size={20}
          />
          <input
            type="number"
            name="auctionDuration"
            placeholder="Auction duration (minutes: 1 - 4320)"
            value={formData.auctionDuration}
            onChange={handleChange}
            min={1}
            max={4320}
            className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        <div>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImageFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-green-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Package size={20} />
          <span>{loading ? 'Listing Product...' : 'List Product for Auction'}</span>
        </button>
      </form>
    </div>
  );
}
