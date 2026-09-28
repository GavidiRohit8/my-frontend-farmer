import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Eye, Trophy } from 'lucide-react';
import ProductCard from './ProductCard';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8080';

type AuctionStatus = 'active' | 'completed';

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
  status: AuctionStatus;
  currentBid?: number;
  bids?: any[];
  farmerName?: string;
  bidCount?: number;
}

interface WinningItem {
  id: number;
  name: string;
  imageUrl: string;
  finalPrice: number;
  endedAt: string;
  farmerName?: string;
}

// map backend image path → usable URL
const buildImageUrl = (imagePath?: string) => {
  const fallback =
    'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg';

  if (!imagePath || typeof imagePath !== 'string') return fallback;
  if (imagePath.startsWith('http')) return imagePath;

  return `${API_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

export default function BuyerDashboard() {
  const [selectedTab, setSelectedTab] =
    useState<'browse' | 'mybids' | 'winning'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<AuctionProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // auctionId -> latest bid amount by this buyer (in this browser)
  const [myBidAmounts, setMyBidAmounts] = useState<Record<number, number>>({});

  // full info of winning auctions (persists after they disappear from backend)
  const [winningItems, setWinningItems] = useState<WinningItem[]>([]);

  const { user } = useAuth();

  // --------- Load auctions from backend ----------
  const loadAuctions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auctions/active`);
      if (!res.ok) {
        setProducts([]);
        return;
      }
      const data = (await res.json()) as any[];

      const mapped: AuctionProduct[] = data.map(a => {
        const highestBid =
          a.currentHighestBid ??
          a.highestBid ??
          a.highestBidAmount ??
          a.currentBid ??
          a.finalPrice ??
          a.price ??
          a.basePrice;

        const quantity =
          a.quantity ??
          a.productQuantity ??
          a.availableQuantity ??
          a.stockQuantity ??
          0;

        const imagePath =
          a.imagePath ??
          a.imageUrl ??
          a.image ??
          a.productImagePath ??
          a.productImage ??
          '';

        const endTime =
          a.endTime ??
          a.auctionEndTime ??
          a.closeTime ??
          a.closingTime ??
          '';

        return {
          id: a.auctionId,
          name: a.productName,
          description: a.productDescription || '',
          category: a.category || 'general',
          basePrice: a.basePrice,
          quantity,
          unit: a.unit || 'kg',
          auctionEndTime: endTime,
          imageUrl: buildImageUrl(imagePath),
          status: 'active',
          currentBid: highestBid,
          bids: [],
          farmerName: a.farmerName || 'Farmer',
          bidCount: a.bidCount ?? a.totalBids ?? 0,
        };
      });

      setProducts(mapped);
    } finally {
      setLoading(false);
    }
  };

  // initial load of auctions
  useEffect(() => {
    loadAuctions();
  }, []);

  // --------- Load my bids & winning bids from localStorage ----------
  useEffect(() => {
    if (!user?.email) {
      setMyBidAmounts({});
      setWinningItems([]);
      return;
    }

    // 1) my bids
    const bidsKey = `myBids_${user.email}`;
    const storedBids = localStorage.getItem(bidsKey);
    if (storedBids) {
      try {
        const parsed = JSON.parse(storedBids) as Record<string, number>;
        const converted: Record<number, number> = {};
        Object.keys(parsed).forEach(k => {
          const idNum = Number(k);
          converted[idNum] = parsed[k];
        });
        setMyBidAmounts(converted);
      } catch {
        setMyBidAmounts({});
      }
    } else {
      setMyBidAmounts({});
    }

    // 2) winning items
    const winsKey = `winningItems_${user.email}`;
    const storedWins = localStorage.getItem(winsKey);
    if (storedWins) {
      try {
        const parsedWins = JSON.parse(storedWins) as WinningItem[];
        setWinningItems(parsedWins);
      } catch {
        setWinningItems([]);
      }
    } else {
      setWinningItems([]);
    }
  }, [user?.email]);

  const activeProducts = products.filter(p => p.status === 'active');

  const filteredProducts = activeProducts.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // --- My Bids list (only active auctions) ---
  const myBidsIds = Object.keys(myBidAmounts).map(id => Number(id));
  const myBids = products.filter(p => myBidsIds.includes(p.id));

  const categories = ['all', 'vegetables', 'fruits', 'grains', 'dairy', 'organic'];

  // called by ProductCard when a bid is successfully placed
  const handleBidPlaced = (auctionId: number, amount: number) => {
    setMyBidAmounts(prev => {
      const updated = { ...prev, [auctionId]: amount };

      if (user?.email) {
        const key = `myBids_${user.email}`;
        const toStore: Record<string, number> = {};
        Object.keys(updated).forEach(idStr => {
          const idNum = Number(idStr);
          toStore[idNum.toString()] = updated[idNum];
        });
        localStorage.setItem(key, JSON.stringify(toStore));
      }

      return updated;
    });

    // refresh auctions so everyone sees new highest bid
    loadAuctions();
  };

  // called by ProductCard when THIS buyer wins an auction
  const handleWonAuction = (product: AuctionProduct, myAmount: number) => {
    setWinningItems(prev => {
      if (prev.some(w => w.id === product.id)) return prev; // already saved

      const snapshot: WinningItem = {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        finalPrice: myAmount,
        endedAt: product.auctionEndTime,
        farmerName: product.farmerName,
      };

      const updated = [...prev, snapshot];

      if (user?.email) {
        const key = `winningItems_${user.email}`;
        localStorage.setItem(key, JSON.stringify(updated));
      }

      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-green-200/50 mb-8">
          <div className="flex">
            <button
              onClick={() => setSelectedTab('browse')}
              className={`flex-1 px-6 py-4 text-center font-semibold rounded-l-2xl transition-all duration-200 ${
                selectedTab === 'browse'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <Eye className="inline-block mr-2" size={20} />
              Browse Products ({activeProducts.length})
            </button>
            <button
              onClick={() => setSelectedTab('mybids')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                selectedTab === 'mybids'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <ShoppingCart className="inline-block mr-2" size={20} />
              My Bids ({myBids.length})
            </button>
            <button
              onClick={() => setSelectedTab('winning')}
              className={`flex-1 px-6 py-4 text-center font-semibold rounded-r-2xl transition-all duration-200 ${
                selectedTab === 'winning'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <Trophy className="inline-block mr-2" size={20} />
              Winning Bids ({winningItems.length})
            </button>
          </div>
        </div>

        {/* --------- BROWSE TAB --------- */}
        {selectedTab === 'browse' && (
          <>
            {/* Search + Filter */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-green-200/50 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="relative">
                  <Filter
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500"
                    size={20}
                  />
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="pl-12 pr-8 py-3 bg-white/70 backdrop-blur-sm border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 appearance-none min-w-[180px]"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all'
                          ? 'All Categories'
                          : category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products grid */}
            {loading ? (
              <p className="text-center text-green-700">Loading auctions...</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    userType="buyer"
                    onBidPlaced={handleBidPlaced}
                    onWin={handleWonAuction}
                    showBidInfo={false}
                    myBidAmount={myBidAmounts[product.id]}
                  />
                ))}
                {filteredProducts.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-green-300 mx-auto mb-4" />
                    <p className="text-xl text-green-600">No products found</p>
                    <p className="text-green-500 mt-2">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* --------- MY BIDS TAB (only active bids) --------- */}
        {selectedTab === 'mybids' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myBids.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                userType="buyer"
                showBidInfo
                myBidAmount={myBidAmounts[product.id]}
                onBidPlaced={handleBidPlaced}
                onWin={handleWonAuction}
              />
            ))}
            {myBids.length === 0 && (
              <div className="col-span-full text-center py-12">
                <ShoppingCart className="h-16 w-16 text-green-300 mx-auto mb-4" />
                <p className="text-xl text-green-600">No bids placed yet</p>
                <p className="text-green-500 mt-2">
                  Start bidding on products to see them here
                </p>
              </div>
            )}
          </div>
        )}

        {/* --------- WINNING BIDS TAB (persists after refresh) --------- */}
        {selectedTab === 'winning' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {winningItems.map(item => (
              <ProductCard
                key={item.id}
                product={{
                  id: item.id,
                  name: item.name,
                  description: '',
                  category: 'completed',
                  basePrice: item.finalPrice,
                  quantity: 0,
                  unit: 'kg',
                  auctionEndTime: item.endedAt,
                  imageUrl: item.imageUrl,
                  status: 'completed',
                  currentBid: item.finalPrice,
                  farmerName: item.farmerName,
                }}
                userType="buyer"
                showBidInfo
                myBidAmount={item.finalPrice}
              />
            ))}
            {winningItems.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Trophy className="h-16 w-16 text-green-300 mx-auto mb-4" />
                <p className="text-xl text-green-600">No winning bids yet</p>
                <p className="text-green-500 mt-2">
                  When you win an auction, it will appear here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
