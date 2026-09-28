import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

interface Bid {
  buyerId: string;
  buyerName: string;
  amount: number;
  timestamp: Date;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  currentBid?: number;
  quantity: number;
  unit: string;
  auctionEndTime: Date;
  status: 'active' | 'completed';
  farmerId: string;
  farmerName: string;
  imageUrl: string;
  bids?: Bid[];
  createdAt: Date;
}

interface ProductContextType {
  products: Product[];
  addProduct: (productData: Omit<Product, 'id'>) => void;
  placeBid: (productId: string, bid: Bid) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// 🔗 backend URL
const API_BASE = 'http://localhost:8080';

// 🔹 dummy products as fallback (when backend has no data or is down)
const DUMMY_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Fresh Organic Tomatoes',
    description:
      'Premium quality organic tomatoes grown without pesticides. Perfect for cooking and salads.',
    category: 'vegetables',
    basePrice: 150,
    currentBid: 185,
    quantity: 50,
    unit: 'kg',
    auctionEndTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    status: 'active',
    farmerId: 'farmer1',
    farmerName: 'Rajesh Kumar',
    imageUrl:
      'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg',
    bids: [
      {
        buyerId: 'buyer1',
        buyerName: 'Amit Sharma',
        amount: 165,
        timestamp: new Date(),
      },
      {
        buyerId: 'buyer2',
        buyerName: 'Priya Singh',
        amount: 185,
        timestamp: new Date(),
      },
    ],
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Basmati Rice Premium',
    description:
      'Authentic basmati rice with long grains and aromatic fragrance. Aged for perfect texture.',
    category: 'grains',
    basePrice: 120,
    currentBid: 145,
    quantity: 100,
    unit: 'kg',
    auctionEndTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
    status: 'active',
    farmerId: 'farmer2',
    farmerName: 'Sunita Devi',
    imageUrl:
      'https://images.pexels.com/photos/33239/wheat-field-wheat-yellow-grain.jpg',
    bids: [
      {
        buyerId: 'buyer1',
        buyerName: 'Amit Sharma',
        amount: 135,
        timestamp: new Date(),
      },
      {
        buyerId: 'buyer3',
        buyerName: 'Rohit Patel',
        amount: 145,
        timestamp: new Date(),
      },
    ],
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Fresh Alphonso Mangoes',
    description:
      'Sweet and juicy Alphonso mangoes from Konkan region. Perfect ripeness guaranteed.',
    category: 'fruits',
    basePrice: 300,
    currentBid: 350,
    quantity: 25,
    unit: 'kg',
    auctionEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    status: 'active',
    farmerId: 'farmer3',
    farmerName: 'Madhav Patil',
    imageUrl:
      'https://images.pexels.com/photos/2090900/pexels-photo-2090900.jpeg',
    bids: [
      {
        buyerId: 'buyer2',
        buyerName: 'Priya Singh',
        amount: 320,
        timestamp: new Date(),
      },
      {
        buyerId: 'buyer1',
        buyerName: 'Amit Sharma',
        amount: 350,
        timestamp: new Date(),
      },
    ],
    createdAt: new Date(),
  },
];

// 🧠 helper: convert backend product → frontend Product
function mapBackendProduct(p: any): Product {
  // backend shape (from your curl):
  // {
  //   id, name, description, price, quantity, imagePath,
  //   farmer: { id, username, ... }
  // }

  const farmer = p.farmer || {};

  return {
    id: String(p.id ?? Math.random().toString(36).substr(2, 9)),
    name: p.name ?? '',
    description: p.description ?? '',
    category: 'other', // backend has no category yet
    basePrice: p.price ?? 0, // map backend price -> basePrice used in UI
    currentBid: undefined, // no bids from backend yet
    quantity: p.quantity ?? 0,
    unit: 'kg', // default for now
    // give some default auction time so UI shows "active"
    auctionEndTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    status: 'active',
    farmerId: String(farmer.id ?? 'unknown'),
    farmerName: farmer.username ?? 'Unknown Farmer',
    imageUrl:
      p.imagePath ??
      'https://via.placeholder.com/400x300.png?text=Product+Image',
    bids: [],
    createdAt: new Date(),
  };
}

export function ProductProvider({ children }: { children: ReactNode }) {
  // start with dummy products so page looks good while loading
  const [products, setProducts] = useState<Product[]>(DUMMY_PRODUCTS);

  // 🔗 fetch from backend once when app loads
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        if (!res.ok) {
          console.error('Failed to fetch products', res.status);
          return;
        }
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(mapBackendProduct);
          setProducts(mapped);
        }
        // if data is [], we keep dummy products
      } catch (err) {
        console.error('Error fetching products', err);
        // on error, keep dummy products
      }
    }

    fetchProducts();
  }, []);

  // ➕ add product: optimistic UI + POST to backend + refresh list
  const addProduct = (productData: Omit<Product, 'id'>) => {
    // 1) optimistic product in UI
    const tempProduct: Product = {
      ...productData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setProducts((prev) => [tempProduct, ...prev]);

    // 2) payload matching backend Product entity
    const payload = {
      name: productData.name,
      description: productData.description,
      price: productData.basePrice,
      quantity: productData.quantity,
      imagePath: productData.imageUrl, // optional, backend can allow null
    };

    // 3) POST then refetch from /api/products
    fetch(`${API_BASE}/api/products/simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(() => fetch(`${API_BASE}/api/products`))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(mapBackendProduct);
          setProducts(mapped);
        }
      })
      .catch((err) => {
        console.error('Error saving product', err);
        // if backend fails, we still have the optimistic product in UI
      });
  };

  const placeBid = (productId: string, bid: Bid) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          const newBids = [...(product.bids || []), bid];
          return {
            ...product,
            bids: newBids,
            currentBid: bid.amount,
          };
        }
        return product;
      }),
    );
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, placeBid }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
