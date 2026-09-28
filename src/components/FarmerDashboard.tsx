import React, { useState, useEffect } from 'react';
import { Plus, Package, TrendingUp, Clock, Eye } from 'lucide-react';
import ProductForm from './ProductForm';
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

  // winner info for completed sales
  buyerEmail?: string;
  buyerName?: string;
  buyerPhone?: string;
}

interface CompletedSaleDto {
  auctionId: number;
  productId: number;
  productName: string;
  productDescription?: string;
  imagePath?: string;
  quantity?: number;
  basePrice: number;
  finalPrice: number;
  endTime: string;
  buyerEmail: string;

  // maybe extra fields
  buyerName?: string;
  buyerPhone?: string;
}

// helper: map backend image path → full URL
const buildImageUrl = (imagePath?: string) => {
  const fallback =
    'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg';

  if (!imagePath || typeof imagePath !== 'string') return fallback;
  if (imagePath.startsWith('http')) return imagePath;

  // ensure exactly one slash between API_BASE_URL and path
  return `${API_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

export default function FarmerDashboard() {
  const [selectedTab, setSelectedTab] =
    useState<'active' | 'completed' | 'add'>('active');
  const [activeProducts, setActiveProducts] = useState<AuctionProduct[]>([]);
  const [completedProducts, setCompletedProducts] = useState<AuctionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const farmerEmail = user?.email || '';

  // ---- helpers to load data from backend ----
  const loadActiveAuctions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auctions/active`);
      if (!res.ok) return;
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
          farmerName: a.farmerName || 'You',
        };
      });

      setActiveProducts(mapped);
    } catch {
      // ignore
    }
  };

  const loadCompletedSales = async () => {
    if (!farmerEmail) {
      setCompletedProducts([]);
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/farmers/${encodeURIComponent(
          farmerEmail
        )}/completed-sales`
      );
      if (!res.ok) return;
      const data = (await res.json()) as CompletedSaleDto[];

      const mapped: AuctionProduct[] = data.map(sale => {
        const imagePath =
          sale.imagePath ??
          (sale as any).imageUrl ??
          (sale as any).image ??
          '';

        const endTime =
          sale.endTime ??
          (sale as any).auctionEndTime ??
          (sale as any).closeTime ??
          '';

        const finalPrice =
          sale.finalPrice ??
          (sale as any).highestBid ??
          (sale as any).price ??
          sale.basePrice;

        const quantity =
          sale.quantity ??
          (sale as any).productQuantity ??
          (sale as any).availableQuantity ??
          0;

        const buyerName =
          sale.buyerName ??
          (sale as any).buyerUsername ??
          (sale as any).buyerName ??
          '';

        const buyerPhone =
          sale.buyerPhone ??
          (sale as any).buyerMobile ??
          (sale as any).buyerPhoneNumber ??
          (sale as any).phoneNumber ??
          '';

        return {
          id: sale.auctionId,
          name: sale.productName,
          description: sale.productDescription || '',
          category: 'completed',
          basePrice: sale.basePrice,
          quantity,
          unit: 'kg',
          auctionEndTime: endTime,
          imageUrl: buildImageUrl(imagePath),
          status: 'completed',
          currentBid: finalPrice,
          bids: [],
          farmerName: user?.name || 'You',
          buyerEmail: sale.buyerEmail,
          buyerName,
          buyerPhone,
        };
      });

      setCompletedProducts(mapped);
    } catch {
      // ignore
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadActiveAuctions(), loadCompletedSales()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [farmerEmail]);

  const totalRevenue = completedProducts.reduce(
    (sum, product) => sum + (product.currentBid || product.basePrice),
    0
  );
  const activeAuctions = activeProducts.length;
  const farmerProducts = [...activeProducts, ...completedProducts];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-green-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-green-800">
                  ₹{totalRevenue.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-emerald-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-medium">
                  Active Auctions
                </p>
                <p className="text-3xl font-bold text-emerald-800">
                  {activeAuctions}
                </p>
              </div>
              <Clock className="h-8 w-8 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-teal-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-600 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold text-teal-800">
                  {farmerProducts.length}
                </p>
              </div>
              <Package className="h-8 w-8 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-green-200/50 mb-8">
          <div className="flex">
            <button
              onClick={() => setSelectedTab('active')}
              className={`flex-1 px-6 py-4 text-center font-semibold rounded-l-2xl transition-all duration-200 ${
                selectedTab === 'active'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-green-700 hover:bg-green-50'
              }`}
            >
              <Eye className="inline-block mr-2" size={20} />
              Active Auctions ({activeProducts.length})
            </button>
            <button
              onClick={() => setSelectedTab('completed')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                selectedTab === 'completed'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-green-700 hover:bg-green-50'
              }`}
            >
              <Package className="inline-block mr-2" size={20} />
              Completed Sales ({completedProducts.length})
            </button>
            <button
              onClick={() => setSelectedTab('add')}
              className={`flex-1 px-6 py-4 text-center font-semibold rounded-r-2xl transition-all duration-200 ${
                selectedTab === 'add'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-green-700 hover:bg-green-50'
              }`}
            >
              <Plus className="inline-block mr-2" size={20} />
              Add Product
            </button>
          </div>
        </div>

        {/* Content */}
        {selectedTab === 'add' ? (
          <ProductForm
            onSubmit={_productData => {
              loadAll();
              setSelectedTab('active');
            }}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(loading
              ? []
              : selectedTab === 'active'
              ? activeProducts
              : completedProducts
            ).map(product => (
              <ProductCard key={product.id} product={product} userType="farmer" />
            ))}

            {!loading &&
              (selectedTab === 'active' ? activeProducts : completedProducts)
                .length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Package className="h-16 w-16 text-green-300 mx-auto mb-4" />
                  <p className="text-xl text-green-600">
                    {selectedTab === 'active'
                      ? 'No active auctions'
                      : 'No completed sales yet'}
                  </p>
                  <p className="text-green-500 mt-2">
                    {selectedTab === 'active'
                      ? 'Add your first product to get started!'
                      : 'Start selling to see your completed sales here.'}
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
