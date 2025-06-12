import React, { useState } from "react";

interface SiteFormData {
  siteName: string;
  domain: string;
  theme: string;
  description: string;
}

const themes = [
  { id: "basic-blog", name: "Basic Blog", preview: "/themes/basic-blog.jpg" },
  { id: "ecommerce", name: "E-commerce", preview: "/themes/ecommerce.jpg" },
  { id: "portfolio", name: "Portfolio", preview: "/themes/portfolio.jpg" },
];

export default function SiteCreator() {
  const [formData, setFormData] = useState<SiteFormData>({
    siteName: "",
    domain: "",
    theme: "",
    description: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // استدعاء API لتوليد الموقع
      const response = await fetch("/api/sites/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "current-user-id", // من الـ auth
          domain: formData.domain,
          theme: formData.theme,
          content: {
            title: formData.siteName,
            description: formData.description,
            pages: [],
          },
          plugins: [],
          seoSettings: {
            title: formData.siteName,
            description: formData.description,
          },
        }),
      });

      if (response.ok) {
        const { deployUrl } = await response.json();
        alert(`Site generated successfully! Visit: ${deployUrl}`);
        // Redirect to site management page
      }
    } catch (error) {
      alert("Failed to generate site");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 mx-auto max-w-4xl">
      <h1 className="mb-8 text-3xl font-bold">Create New Site</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold">Site Information</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Site Name
              </label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, siteName: e.target.value }))
                }
                className="px-3 py-2 w-full rounded-lg border"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Domain</label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, domain: e.target.value }))
                }
                placeholder="mydomain.com"
                className="px-3 py-2 w-full rounded-lg border"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block mb-2 text-sm font-medium">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="px-3 py-2 w-full rounded-lg border"
              rows={3}
            />
          </div>
        </div>

        {/* Theme Selection */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold">Choose Theme</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  formData.theme === theme.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, theme: theme.id }))
                }
              >
                <div className="mb-3 bg-gray-100 rounded aspect-video">
                  <img
                    src={theme.preview}
                    alt={theme.name}
                    className="object-cover w-full h-full rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-theme.jpg";
                    }}
                  />
                </div>
                <h3 className="font-medium text-center">{theme.name}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isGenerating || !formData.theme}
            className="px-8 py-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isGenerating ? "Generating Site..." : "Create Site"}
          </button>
        </div>
      </form>
    </div>
  );
}
