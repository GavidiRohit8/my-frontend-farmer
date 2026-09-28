import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Gavel, User, Check, Phone } from 'lucide-react';
import BidModal from './BidModal';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8080';

interface AuctionProduct {
  id: number; // auctionId
  name: string;
  description: string;
  category?: string;
  basePrice: number;
  quantity: number;
  unit?: string;
  auctionEndTime: string;
  imageUrl: string;
  status: 'active' | 'completed';
  currentBid?: number;
  bids?: any[];
  farmerName?: string;
  bidCount?: number;

  // winner info (for completed sales in farmer view)
  buyerEmail?: string;
  buyerName?: string;
  buyerPhone?: string;
}

/** Props expected by updated BuyerDashboard */
interface ProductCardProps {
  product: AuctionProduct;
  userType: 'farmer' | 'buyer';
  showBidInfo?: boolean;
  myBidAmount?: number; // last bid placed by this buyer
  onBidPlaced?: (auctionId: number, amount: number) => void;
  /** called when THIS buyer wins – dashboard will store it as Winning Bid */
  onWin?: (product: AuctionProduct, myAmount: number) => void;
}

/**
 * Parse backend time as UTC.
 * Backend format: "yyyy-MM-dd HH:mm:ss"
 */
const parseAuctionEnd = (value: string): Date | null => {
  if (!value) return null;

  let s = value.trim().replace(' ', 'T');

  // already has timezone like Z or +05:30
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  // treat as UTC
  s += 'Z';
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

export default function ProductCard({
  product,
  userType,
  showBidInfo,
  myBidAmount,
  onBidPlaced,
  onWin,
}: ProductCardProps) {
  const [showBidModal, setShowBidModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [hasEnded, setHasEnded] = useState(false);
  const [winnerChecked, setWinnerChecked] = useState(false);
  const { user } = useAuth();

  const isAuctionActive = product.status === 'active';
  const currentBid = product.currentBid || product.basePrice;
  const bidCount = product.bidCount ?? product.bids?.length ?? 0;

  // ---------- LIVE COUNTDOWN ----------
  useEffect(() => {
    const endDate = parseAuctionEnd(product.auctionEndTime);
    if (!endDate) {
      setTimeLeft('Unknown');
      return;
    }

    const update = () => {
      const diff = endDate.getTime() - Date.now();

      if (diff > 0) {
        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        setHasEnded(false);
      } else {
        setTimeLeft('0s');
        setHasEnded(true);
      }
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [product.auctionEndTime]);

  // ---------- PLACE BID VIA BACKEND ----------
  const handleBidSubmit = async (bidAmount: number) => {
    if (!user?.email) {
      alert('Please login as Buyer to bid.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auctionId: product.id,
          amount: bidAmount,
          buyerEmail: user.email,
        }),
      });

      const txt = await res.text();

      if (!res.ok) {
        throw new Error(txt || 'Failed to place bid');
      }

      onBidPlaced && onBidPlaced(product.id, bidAmount);
      setShowBidModal(false);
      alert('Bid placed successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to place bid');
    }
  };

  // ---------- WHEN TIMER ENDS ON BUYER SIDE: CHECK TRUE WINNER ----------
  useEffect(() => {
    const checkWinner = async () => {
      if (!user || userType !== 'buyer') return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/bids/auction/${product.id}`);
        if (!res.ok) return;

        const data = (await res.json()) as any[];
        if (!Array.isArray(data) || data.length === 0) return;

        // find highest bid from backend list
        let winner = data[0];
        for (const bid of data) {
          const amount = bid.amount ?? bid.bidAmount ?? bid.price;
          const winnerAmount = winner.amount ?? winner.bidAmount ?? winner.price;
          if (amount > winnerAmount) {
            winner = bid;
          }
        }

        const winnerEmail =
          winner.buyerEmail || winner.email || winner.username || '';

        if (!winnerEmail) return;

        const winningAmount =
          winner.amount ?? winner.bidAmount ?? winner.price ?? currentBid;

        if (winnerEmail === user.email) {
          // THIS buyer won
          alert(
            `🎉 Congratulations! You won the auction for ${
              product.name
            } with a bid of ₹${winningAmount}.`
          );

          if (onWin) {
            onWin(product, winningAmount);
          }
        } else if (myBidAmount != null) {
          // Buyer had placed a bid but didn't win
          alert(
            `⏱ Auction ended for ${product.name}. You were outbid. Winning buyer: ${winnerEmail}.`
          );
        }
      } finally {
        setWinnerChecked(true);
      }
    };

    if (hasEnded && !winnerChecked) {
      checkWinner();
    }
  }, [
    hasEnded,
    winnerChecked,
    user,
    userType,
    product,
    currentBid,
    myBidAmount,
    onWin,
  ]);

  const winning =
    typeof myBidAmount === 'number' && myBidAmount >= currentBid && isAuctionActive;

  const showBuyerContact =
    userType === 'farmer' &&
    product.status === 'completed' &&
    (product.buyerEmail || product.buyerName || product.buyerPhone);

  return (
    <>
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-green-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 group">
        <div className="relative">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isAuctionActive ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
              }`}
            >
              {isAuctionActive ? 'Live Auction' : 'Ended'}
            </span>
          </div>
          {userType === 'buyer' && winning && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-yellow-500/90 text-white rounded-full text-xs font-semibold flex items-center space-x-1">
                <Check size={12} />
                <span>Winning</span>
              </span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-green-800 group-hover:text-green-900 transition-colors duration-200">
              {product.name}
            </h3>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-medium capitalize">
              {product.category || 'general'}
            </span>
          </div>

          <p className="text-green-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-green-600 text-sm">Starting Price:</span>
              <span className="font-semibold text-green-800">
                ₹{product.basePrice.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-green-600 text-sm">Current Bid:</span>
              <span className="font-bold text-lg text-emerald-600">
                ₹{currentBid.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-green-600 text-sm">Quantity:</span>
              <span className="font-semibold text-green-800">
                {product.quantity} {product.unit}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-green-600 text-sm flex items-center space-x-1">
                <Clock size={14} />
                <span>Time Left:</span>
              </span>
              <span
                className={
                  !isAuctionActive
                    ? 'font-semibold text-red-600'
                    : 'font-semibold text-orange-600'
                }
              >
                {isAuctionActive ? timeLeft : 'Ended'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-green-600 text-sm flex items-center space-x-1">
                <TrendingUp size={14} />
                <span>Total Bids:</span>
              </span>
              <span className="font-semibold text-green-800">{bidCount}</span>
            </div>

            {userType === 'buyer' && (
              <div className="flex items-center justify-between">
                <span className="text-green-600 text-sm flex items-center space-x-1">
                  <User size={14} />
                  <span>Farmer:</span>
                </span>
                <span className="font-semibold text-green-800">
                  {product.farmerName || 'Farmer'}
                </span>
              </div>
            )}
          </div>

          {/* buyer side – show my last bid */}
          {showBidInfo && typeof myBidAmount === 'number' && (
            <div className="bg-yellow-50/70 backdrop-blur-sm border border-yellow-200 rounded-xl p-3 mb-4">
              <p className="text-yellow-800 text-sm font-medium">
                Your bid: ₹{myBidAmount.toLocaleString()}
                {winning && <span className="text-green-600 ml-2">(Highest bid!)</span>}
              </p>
            </div>
          )}

          {/* buyer: place bid button */}
          {userType === 'buyer' && isAuctionActive && (
            <button
              onClick={() => setShowBidModal(true)}
              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Gavel size={18} />
              <span>Place Bid</span>
            </button>
          )}

          {/* ended tag */}
          {!isAuctionActive && (
            <div className="w-full px-4 py-3 bg-gray-200/70 text-gray-600 rounded-xl text-center font-semibold mb-3">
              Auction Ended
            </div>
          )}

          {/* farmer: winning buyer contact, in Completed Sales */}
          {showBuyerContact && (
            <div className="mt-2 bg-green-50/80 border border-green-200 rounded-xl p-3 text-sm text-green-800">
              <div className="font-semibold mb-1 flex items-center space-x-1">
                <User size={14} />
                <span>Winning Buyer</span>
              </div>
              {product.buyerName && (
                <p className="ml-5">Name: {product.buyerName}</p>
              )}
              {product.buyerEmail && (
                <p className="ml-5">Email: {product.buyerEmail}</p>
              )}
              <p className="ml-5 flex items-center space-x-1">
                <Phone size={14} />
                <span>
                  Phone:{' '}
                  {product.buyerPhone && product.buyerPhone.trim() !== ''
                    ? product.buyerPhone
                    : 'Not available'}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {showBidModal && (
        <BidModal
          product={{ ...product, currentBid }}
          onClose={() => setShowBidModal(false)}
          onSubmit={handleBidSubmit}
        />
      )}
    </>
  );
}
