import React, { useState, useEffect } from "react";

interface Theme {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  downloadCount: number;
  screenshots: string[];
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar: string;
  };
}

interface ThemeFilters {
  category: string;
  priceRange: string;
  search: string;
  sortBy: string;
}

export default function ThemeStore() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ThemeFilters>({
    category: "all",
    priceRange: "all",
    search: "",
    sortBy: "popularity",
  });

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "blog", name: "Blog" },
    { id: "ecommerce", name: "E-commerce" },
    { id: "portfolio", name: "Portfolio" },
    { id: "business", name: "Business" },
    { id: "creative", name: "Creative" },
    { id: "landing", name: "Landing Page" },
  ];

  const priceRanges = [
    { id: "all", name: "All Prices" },
    { id: "free", name: "Free" },
    { id: "1-50", name: "$1 - $50" },
    { id: "51-100", name: "$51 - $100" },
    { id: "100+", name: "$100+" },
  ];

  const sortOptions = [
    { id: "popularity", name: "Most Popular" },
    { id: "newest", name: "Newest" },
    { id: "price", name: "Price: Low to High" },
    { id: "rating", name: "Highest Rated" },
  ];

  useEffect(() => {
    fetchThemes();
  }, [filters]);

  const fetchThemes = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      if (filters.category !== "all") {
        queryParams.append("category", filters.category);
      }

      if (filters.search) {
        queryParams.append("search", filters.search);
      }

      queryParams.append("sortBy", filters.sortBy);

      const response = await fetch(`/api/marketplace/themes?${queryParams}`);
      const data = await response.json();

      setThemes(data.themes || []);
    } catch (error) {
      console.error("Failed to fetch themes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstallTheme = async (themeId: string, themeName: string) => {
    try {
      const response = await fetch(
        `/api/marketplace/themes/${themeId}/download`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        alert(`"${themeName}" theme installed successfully!`);
      } else {
        alert("Failed to install theme");
      }
    } catch (error) {
      alert("Error installing theme");
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `$${price}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-sm ${
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="p-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Theme Store</h1>
        <p className="text-gray-600">
          Discover beautiful themes for your NestCraft sites
        </p>
      </div>

      {/* Filters */}
      <div className="p-6 mb-8 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Search */}
          <div>
            <label className="block mb-2 text-sm font-medium">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              placeholder="Search themes..."
              className="px-3 py-2 w-full rounded-lg border"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block mb-2 text-sm font-medium">Category</label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
              className="px-3 py-2 w-full rounded-lg border"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Price Range
            </label>
            <select
              value={filters.priceRange}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, priceRange: e.target.value }))
              }
              className="px-3 py-2 w-full rounded-lg border"
            >
              {priceRanges.map((range) => (
                <option key={range.id} value={range.id}>
                  {range.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block mb-2 text-sm font-medium">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
              }
              className="px-3 py-2 w-full rounded-lg border"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Themes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow animate-pulse">
              <div className="bg-gray-200 rounded-t-lg aspect-video"></div>
              <div className="p-4">
                <div className="mb-2 h-4 bg-gray-200 rounded"></div>
                <div className="mb-4 w-3/4 h-3 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className="bg-white rounded-lg shadow transition-shadow hover:shadow-lg"
            >
              {/* Theme Preview */}
              <div className="overflow-hidden bg-gray-100 rounded-t-lg aspect-video">
                <img
                  src={theme.screenshots[0]}
                  alt={theme.name}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder-theme.jpg";
                  }}
                />
              </div>

              {/* Theme Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold truncate">
                    {theme.name}
                  </h3>
                  <span className="text-sm font-medium text-blue-600">
                    {formatPrice(theme.price)}
                  </span>
                </div>

                <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                  {theme.description}
                </p>

                {/* Rating & Downloads */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-1">
                    {renderStars(theme.rating)}
                    <span className="ml-1 text-sm text-gray-500">
                      ({theme.rating})
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {theme.downloadCount.toLocaleString()} downloads
                  </span>
                </div>

                {/* Author */}
                <div className="flex items-center mb-4">
                  <img
                    src={theme.author.avatar}
                    alt={theme.author.name}
                    className="mr-2 w-6 h-6 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/default-avatar.png";
                    }}
                  />
                  <span className="text-sm text-gray-600">
                    {theme.author.name}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {theme.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleInstallTheme(theme.id, theme.name)}
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
                  >
                    Install
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-gray-300 transition-colors hover:bg-gray-50">
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && themes.length === 0 && (
        <div className="py-16 text-center">
          <div className="mb-4 text-6xl text-gray-400">🎨</div>
          <h3 className="mb-2 text-xl font-semibold text-gray-600">
            No themes found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}
    </div>
  );
}
