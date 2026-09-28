import React, { useState } from 'react';
import { X, Gavel, TrendingUp, Clock } from 'lucide-react';

interface BidModalProps {
  product: any;
  onClose: () => void;
  onSubmit: (bidAmount: number) => void;
}

export default function BidModal({ product, onClose, onSubmit }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState('');
  const currentBid = product.currentBid || product.basePrice;
  const minimumBid = currentBid + 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    
    if (amount >= minimumBid) {
      onSubmit(amount);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-green-200/50 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gavel className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Place Your Bid</h2>
            <p className="text-green-600">{product.name}</p>
          </div>

          <div className="bg-green-50/70 backdrop-blur-sm rounded-xl p-4 mb-6 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-green-600 font-medium">Current Bid:</span>
              <span className="text-green-800 font-bold text-lg">₹{currentBid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-600 font-medium">Minimum Bid:</span>
              <span className="text-emerald-800 font-bold">₹{minimumBid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-600 font-medium">Total Bids:</span>
              <span className="text-green-800 font-semibold">{product.bids?.length || 0}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" size={20} />
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Enter amount (min ₹${minimumBid})`}
                min={minimumBid}
                step="0.01"
                className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-lg font-semibold"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!bidAmount || parseFloat(bidAmount) < minimumBid}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                <Gavel size={18} />
                <span>Place Bid</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}