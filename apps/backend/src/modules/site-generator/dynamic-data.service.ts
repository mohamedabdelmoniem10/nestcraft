import { Injectable } from '@nestjs/common';

interface DynamicDataStrategy {
  staticGeneration: boolean; // هل يتم توليدها في البيلد؟
  revalidation?: number; // كل كام ثانية يعاد التوليد؟ (ISR)
  clientSide: boolean; // هل تتحدث من الكلاينت؟
  apiEndpoint?: string; // API endpoint للبيانات الحية
}

interface ContentType {
  name: string;
  strategy: DynamicDataStrategy;
  fields: Record<string, any>;
}

@Injectable()
export class DynamicDataService {
  /**
   * تعريف أنواع المحتوى المختلفة وكيفية التعامل معها
   */
  private getContentStrategies(): Record<string, DynamicDataStrategy> {
    return {
      // المنتجات - static للـ SEO + dynamic للـ inventory
      products: {
        staticGeneration: true,
        revalidation: 3600, // كل ساعة
        clientSide: true,
        apiEndpoint: '/api/products',
      },

      // المقالات - static بالكامل
      'blog-posts': {
        staticGeneration: true,
        revalidation: 86400, // كل يوم
        clientSide: false,
      },

      // التعليقات - dynamic فقط
      comments: {
        staticGeneration: false,
        clientSide: true,
        apiEndpoint: '/api/comments',
      },

      // عربة التسوق - client-side فقط
      'shopping-cart': {
        staticGeneration: false,
        clientSide: true,
        apiEndpoint: '/api/cart',
      },

      // المخزون - real-time
      inventory: {
        staticGeneration: false,
        clientSide: true,
        apiEndpoint: '/api/inventory',
      },

      // البحث - client-side بـ static data
      search: {
        staticGeneration: true, // بيانات البحث
        clientSide: true, // الفلترة والبحث
        apiEndpoint: '/api/search',
      },
    };
  }

  /**
   * توليد Next.js API routes للبيانات الديناميكية
   */
  async generateAPIRoutes(themePath: string, siteData: any): Promise<void> {
    const apiDir = path.join(themePath, 'src', 'pages', 'api');
    await fs.mkdir(apiDir, { recursive: true });

    // API للمنتجات (مع المخزون المحدث)
    if (siteData.products) {
      await this.generateProductsAPI(apiDir, siteData.userId);
    }

    // API للتعليقات
    await this.generateCommentsAPI(apiDir, siteData.userId);

    // API لعربة التسوق
    await this.generateCartAPI(apiDir, siteData.userId);

    // API للبحث
    await this.generateSearchAPI(apiDir, siteData.userId);
  }

  /**
   * API للمنتجات مع المخزون الحي
   */
  private async generateProductsAPI(apiDir: string, userId: string): Promise<void> {
    const productsAPITemplate = `
// Generated API for live product data
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  
  try {
    switch (method) {
      case 'GET':
        if (query.id) {
          // جلب منتج واحد مع المخزون الحي
          const product = await fetch(\`\${process.env.NESTCRAFT_API_URL}/sites/${userId}/products/\${query.id}\`);
          const productData = await product.json();
          res.status(200).json(productData);
        } else {
          // جلب جميع المنتجات مع المخزون
          const products = await fetch(\`\${process.env.NESTCRAFT_API_URL}/sites/${userId}/products\`);
          const productsData = await products.json();
          res.status(200).json(productsData);
        }
        break;
        
      case 'PUT':
        // تحديث المخزون
        if (query.id && req.body.stock !== undefined) {
          const response = await fetch(\`\${process.env.NESTCRAFT_API_URL}/sites/${userId}/products/\${query.id}/stock\`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock: req.body.stock })
          });
          const result = await response.json();
          res.status(200).json(result);
        }
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(\`Method \${method} Not Allowed\`);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}`;

    await fs.writeFile(path.join(apiDir, 'products.ts'), productsAPITemplate);
  }

  /**
   * API للتعليقات
   */
  private async generateCommentsAPI(apiDir: string, userId: string): Promise<void> {
    const commentsAPITemplate = `
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  
  try {
    switch (method) {
      case 'GET':
        // جلب التعليقات
        const response = await fetch(\`\${process.env.NESTCRAFT_API_URL}/sites/${userId}/comments?postId=\${query.postId}\`);
        const comments = await response.json();
        res.status(200).json(comments);
        break;
        
      case 'POST':
        // إضافة تعليق جديد
        const newComment = await fetch(\`\${process.env.NESTCRAFT_API_URL}/sites/${userId}/comments\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.body)
        });
        const result = await newComment.json();
        res.status(201).json(result);
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(\`Method \${method} Not Allowed\`);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}`;

    await fs.writeFile(path.join(apiDir, 'comments.ts'), commentsAPITemplate);
  }

  /**
   * API لعربة التسوق
   */
  private async generateCartAPI(apiDir: string, userId: string): Promise<void> {
    const cartAPITemplate = `
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  
  try {
    switch (method) {
      case 'GET':
        // جلب عربة التسوق (من session أو localStorage)
        res.status(200).json({ items: [], total: 0 });
        break;
        
      case 'POST':
        // إضافة منتج لعربة التسوق
        // هنا يتم التعامل مع localStorage من الكلاينت
        res.status(200).json({ success: true });
        break;
        
      case 'DELETE':
        // حذف منتج من العربة
        res.status(200).json({ success: true });
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(\`Method \${method} Not Allowed\`);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}`;

    await fs.writeFile(path.join(apiDir, 'cart.ts'), cartAPITemplate);
  }

  /**
   * توليد React Hooks للبيانات الديناميكية
   */
  async generateDataHooks(themePath: string): Promise<void> {
    const hooksDir = path.join(themePath, 'src', 'hooks');
    await fs.mkdir(hooksDir, { recursive: true });

    // Hook للمنتجات
    const useProductsHook = `
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  // ... other fields
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId: string, newStock: number) => {
    try {
      await fetch(\`/api/products?id=\${productId}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      
      // تحديث الـ state محلياً
      setProducts(prev => 
        prev.map(p => 
          p.id === productId ? { ...p, stock: newStock } : p
        )
      );
    } catch (err) {
      setError('Failed to update stock');
    }
  };

  return {
    products,
    loading,
    error,
    updateStock,
    refetch: fetchProducts
  };
}`;

    await fs.writeFile(path.join(hooksDir, 'useProducts.ts'), useProductsHook);

    // Hook لعربة التسوق
    const useCartHook = `
import { useState, useEffect } from 'react';

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // جلب العربة من localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      setItems(cartData.items || []);
      calculateTotal(cartData.items || []);
    }
  }, []);

  const calculateTotal = (cartItems: CartItem[]) => {
    const newTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  };

  const addToCart = (productId: string, price: number, quantity = 1) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.productId === productId);
      
      let newItems;
      if (existingItem) {
        newItems = prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...prev, { productId, price, quantity }];
      }
      
      // حفظ في localStorage
      localStorage.setItem('cart', JSON.stringify({ items: newItems }));
      calculateTotal(newItems);
      
      return newItems;
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.productId !== productId);
      localStorage.setItem('cart', JSON.stringify({ items: newItems }));
      calculateTotal(newItems);
      return newItems;
    });
  };

  const clearCart = () => {
    setItems([]);
    setTotal(0);
    localStorage.removeItem('cart');
  };

  return {
    items,
    total,
    addToCart,
    removeFromCart,
    clearCart,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
  };
}`;

    await fs.writeFile(path.join(hooksDir, 'useCart.ts'), useCartHook);
  }

  /**
   * توليد مكونات ديناميكية
   */
  async generateDynamicComponents(themePath: string): Promise<void> {
    const componentsDir = path.join(themePath, 'src', 'components');

    // مكون المنتجات مع المخزون الحي
    const ProductWithLiveStock = `
import React from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    image: string;
  };
}

export function ProductCard({ product: initialProduct }: ProductCardProps) {
  const { products, updateStock } = useProducts();
  const { addToCart } = useCart();
  
  // جلب البيانات المحدثة من الـ hook
  const product = products.find(p => p.id === initialProduct.id) || initialProduct;
  
  const handleAddToCart = () => {
    if (product.stock > 0) {
      addToCart(product.id, product.price);
      // تقليل المخزون محلياً
      updateStock(product.id, product.stock - 1);
    }
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>\${product.price}</p>
      
      {/* عرض المخزون الحي */}
      <div className="stock-info">
        {product.stock > 0 ? (
          <span className="in-stock">{product.stock} في المخزن</span>
        ) : (
          <span className="out-of-stock">نفد من المخزن</span>
        )}
      </div>
      
      <button 
        onClick={handleAddToCart}
        disabled={product.stock === 0}
        className="add-to-cart-btn"
      >
        {product.stock > 0 ? 'أضف للعربة' : 'غير متوفر'}
      </button>
    </div>
  );
}`;

    await fs.writeFile(path.join(componentsDir, 'ProductCard.tsx'), ProductWithLiveStock);
  }

  private generateSearchAPI = async (apiDir: string, userId: string): Promise<void> => {
    // Implementation for search API
  };
}

// Helper imports
import * as fs from 'fs/promises';
import * as path from 'path';
