# مثال عملي: متجر إلكتروني مع NestCraft

## 🛍️ سيناريو المتجر

### المطلوب:

- متجر ملابس أونلاين
- 500 منتج
- مخزون متغير
- عربة تسوق
- تصفية وبحث

## 🏗️ العملية خطوة بخطوة

### 1. المستخدم ينشئ المتجر في Dashboard

```typescript
// البيانات اللي هيدخلها المستخدم
const storeData = {
  siteName: "Fashion Store",
  themeId: "ecommerce-modern", // ثيم من الماركت بليس
  products: [
    {
      id: "shirt-001",
      name: "قميص قطني",
      price: 150,
      stock: 25,
      category: "shirts",
      images: ["shirt1.jpg", "shirt2.jpg"],
      description: "قميص قطني مريح",
    },
    // ... 499 منتج آخر
  ],
  customSettings: {
    colors: {
      primary: "#FF6B6B",
      secondary: "#4ECDC4",
    },
    layout: {
      productsPerPage: 12,
    },
  },
};
```

### 2. Site Generator يولد الموقع

```typescript
// الـ Generator يقوم بـ:

// أ) تحميل الثيم من الماركت بليس
const theme = await downloadTheme("ecommerce-modern");

// ب) توليد صفحات المنتجات (Static للـ SEO)
generateStaticPages({
  // صفحة لكل منتج: /products/shirt-001
  products: storeData.products,

  // صفحات الفئات: /category/shirts
  categories: ["shirts", "pants", "shoes"],

  // صفحة البحث: /search
  searchIndex: buildSearchIndex(storeData.products),
});

// ج) توليد API Routes (Dynamic للتفاعل)
generateAPIRoutes({
  "/api/products": "للحصول على بيانات المنتجات المحدثة",
  "/api/cart": "لإدارة عربة التسوق",
  "/api/inventory": "للمخزون الحي",
  "/api/checkout": "لإتمام الطلب",
});
```

### 3. الموقع المولد يحتوي على:

#### أ) صفحات Static (سريعة + SEO)

```
/                          (الصفحة الرئيسية)
/products/                 (جميع المنتجات)
/products/shirt-001        (صفحة منتج محدد)
/category/shirts           (فئة القمصان)
/about                     (من إعداد المستخدم)
/contact                   (من إعداد المستخدم)
```

#### ب) مكونات Dynamic (تفاعلية)

```typescript
// مكون المنتج مع المخزون الحي
function ProductCard({ product }) {
  const { stock } = useRealTimeStock(product.id);
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>السعر: ${product.price}</p>

      {/* المخزون محدث في الوقت الفعلي */}
      <p>متوفر: {stock} قطعة</p>

      <button onClick={() => addToCart(product)} disabled={stock === 0}>
        {stock > 0 ? "أضف للعربة" : "غير متوفر"}
      </button>
    </div>
  );
}

// عربة التسوق (client-side فقط)
function ShoppingCart() {
  const { items, total, removeItem } = useCart();

  return (
    <div className="cart">
      {items.map((item) => (
        <div key={item.id}>
          <span>
            {item.name} x {item.quantity}
          </span>
          <button onClick={() => removeItem(item.id)}>حذف</button>
        </div>
      ))}
      <div>الإجمالي: ${total}</div>
      <button onClick={checkout}>إتمام الطلب</button>
    </div>
  );
}
```

## 🔄 التحديث والتزامن

### سيناريو: عميل يشتري منتج

```typescript
// 1. العميل يضغط "أضف للعربة"
const handleAddToCart = async () => {
  // أ) إضافة للعربة محلياً (فوري)
  addToCart(product);

  // ب) تحديث المخزون في الخلفية
  await updateStock(product.id, product.stock - 1);

  // ج) تحديث المخزون لباقي الزوار (real-time)
  broadcastStockUpdate(product.id, newStock);
};

// 2. الزوار الآخرين يشوفوا المخزون محدث فوراً
useEffect(() => {
  const stockChannel = new WebSocket("/api/stock-updates");

  stockChannel.onmessage = (event) => {
    const { productId, newStock } = JSON.parse(event.data);
    updateProductStock(productId, newStock);
  };
}, []);
```

## ⚡ الأداء والسرعة

### مقارنة مع WordPress:

| الجانب           | WordPress          | NestCraft    |
| ---------------- | ------------------ | ------------ |
| **تحميل الصفحة** | 3-5 ثواني          | 0.5-1 ثانية  |
| **SEO**          | يحتاج plugins      | مدمج بالكامل |
| **المخزون**      | قاعدة بيانات ثقيلة | API خفيفة    |
| **الاستضافة**    | سيرفر مخصص         | CDN عالمي    |
| **التحديثات**    | بطيئة ومعقدة       | فورية        |

### كيف حققنا هذا الأداء؟

```typescript
// 1. Static Generation للصفحات المهمة
export async function getStaticProps() {
  // البيانات تتولد وقت البيلد، مش وقت الطلب
  const products = await getProductsFromDatabase();

  return {
    props: { products },
    revalidate: 3600, // تحديث كل ساعة
  };
}

// 2. Client-side hydration للتفاعل
function ProductPage({ product }) {
  // الصفحة static لكن التفاعل dynamic
  const [liveStock, setLiveStock] = useState(product.stock);

  useEffect(() => {
    // جلب المخزون الحي بعد تحميل الصفحة
    fetchLiveStock(product.id).then(setLiveStock);
  }, []);

  return (
    <div>
      {/* محتوى static للـ SEO */}
      <h1>{product.name}</h1>
      <p>{product.description}</p>

      {/* بيانات live للتفاعل */}
      <span>متوفر: {liveStock}</span>
    </div>
  );
}

// 3. Smart caching على مستويات مختلفة
const cacheStrategy = {
  static_pages: "CDN cache (permanent)",
  product_data: "ISR cache (1 hour)",
  stock_data: "API cache (5 minutes)",
  cart_data: "localStorage (client-side)",
};
```

## 🎯 النتيجة النهائية

### للمستخدم (صاحب المتجر):

- متجر سريع وجميل
- إدارة سهلة من Dashboard
- بيانات حية للمخزون والطلبات
- تكلفة أقل (لا يحتاج سيرفر خاص)

### للعملاء:

- تصفح سريع جداً
- بيانات مخزون دقيقة
- تجربة تسوق سلسة
- يعمل على جميع الأجهزة

### للأداء:

- **10x أسرع** من WordPress
- **SEO ممتاز** بشكل افتراضي
- **تكلفة أقل** للاستضافة
- **موثوقية عالية** (CDN distributed)

هكذا نجحنا في دمج:

- ✅ **Static** للسرعة والـ SEO
- ✅ **Dynamic** للتفاعل والبيانات الحية
- ✅ **Hybrid** للحصول على أفضل ما في العالمين!
