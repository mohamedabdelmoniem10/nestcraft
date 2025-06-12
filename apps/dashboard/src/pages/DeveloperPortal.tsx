import React, { useState, useEffect } from "react";

interface ThemeStats {
  id: string;
  name: string;
  version: string;
  status: "pending" | "approved" | "rejected";
  downloads: number;
  revenue: number;
  rating: number;
  reviews: number;
  lastUpdated: string;
}

interface DeveloperStats {
  totalThemes: number;
  totalDownloads: number;
  totalRevenue: number;
  averageRating: number;
  thisMonthRevenue: number;
  pendingPayouts: number;
}

export default function DeveloperPortal() {
  const [themes, setThemes] = useState<ThemeStats[]>([]);
  const [stats, setStats] = useState<DeveloperStats>({
    totalThemes: 0,
    totalDownloads: 0,
    totalRevenue: 0,
    averageRating: 0,
    thisMonthRevenue: 0,
    pendingPayouts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeveloperData();
  }, []);

  const fetchDeveloperData = async () => {
    try {
      // جلب بيانات المطور
      const [themesResponse, statsResponse] = await Promise.all([
        fetch("/api/developer/themes"),
        fetch("/api/developer/stats"),
      ]);

      const themesData = await themesResponse.json();
      const statsData = await statsResponse.json();

      setThemes(themesData.themes || []);
      setStats(statsData || stats);
    } catch (error) {
      console.error("Failed to fetch developer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs rounded-full ${ styles[status as keyof typeof styles] }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
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

  if (loading) {
    return (
      <div className="p-6 mx-auto max-w-7xl">
        <div className="animate-pulse">
          <div className="mb-4 w-1/3 h-8 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 bg-white rounded-lg shadow">
                <div className="mb-2 h-4 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Developer Portal</h1>
          <p className="text-gray-600">
            Manage your themes, track earnings, and grow your business
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700">
            Upload New Theme
          </button>
          <button className="px-4 py-2 rounded-lg border border-gray-300 transition-colors hover:bg-gray-50">
            Documentation
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Themes</h3>
            <span className="text-2xl">🎨</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalThemes}</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Total Downloads
            </h3>
            <span className="text-2xl">📥</span>
          </div>
          <p className="text-2xl font-bold">
            {stats.totalDownloads.toLocaleString()}
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Average Rating
            </h3>
            <span className="text-2xl">⭐</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-2xl font-bold">
              {stats.averageRating}
            </span>
            {renderStars(stats.averageRating)}
          </div>
        </div>
      </div>

      {/* Revenue Section */}
      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-semibold">This Month's Earnings</h3>
          <div className="mb-2 text-3xl font-bold text-green-600">
            {formatCurrency(stats.thisMonthRevenue)}
          </div>
          <p className="text-sm text-gray-600">
            70% of total sales (Platform fee: 30%)
          </p>
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-green-500 rounded-full"
                style={{ width: "70%" }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-sm text-gray-600">
              <span>Your share</span>
              <span>70%</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-semibold">Pending Payouts</h3>
          <div className="mb-2 text-3xl font-bold">
            {formatCurrency(stats.pendingPayouts)}
          </div>
          <p className="mb-4 text-sm text-gray-600">
            Will be paid on the 1st of next month
          </p>
          <button className="px-4 py-2 w-full text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700">
            View Payment History
          </button>
        </div>
      </div>

      {/* Themes Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Your Themes</h3>
        </div>

        {themes.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mb-4 text-6xl text-gray-400">🎨</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-600">
              No themes yet
            </h3>
            <p className="mb-4 text-gray-500">
              Start building amazing themes for the NestCraft community
            </p>
            <button className="px-6 py-3 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700">
              Create Your First Theme
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Theme
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Downloads
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {themes.map((theme) => (
                  <tr key={theme.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {theme.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          v{theme.version}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(theme.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {theme.downloads.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(theme.revenue)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {renderStars(theme.rating)}
                        <span className="ml-1 text-sm text-gray-500">
                          ({theme.reviews})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          Edit
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          Analytics
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
