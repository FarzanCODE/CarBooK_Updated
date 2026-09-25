import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../api/axios";
import CarCard from "../components/CarCard";
import Loader from "../components/Loader";
import { Search, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";

const categories = [
  "All",
  "Sedan",
  "SUV",
  "Luxury",
  "Electric",
  "Bike/Scooter",
  "Mini/Hatchback",
  "General",
];
const fuelTypes = ["All", "Petrol", "Diesel", "Electric", "Hybrid", "CNG"];
const transmissions = [
  "All",
  "Manual",
  "Automatic",
  "Semi-Automatic",
  "CVT",
  "DCT",
  "AMT",
];
const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
];

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentLocation = searchParams.get("location") || "";
  const currentFuel = searchParams.get("fuelType") || "";
  const currentTrans = searchParams.get("transmission") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentSort = searchParams.get("sortBy") || "newest";

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [locationInput, setLocationInput] = useState(currentLocation);

  useEffect(() => {
    setLocationInput(currentLocation);
  }, [currentLocation]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentCategory, currentPage]);

  useEffect(() => {
    fetchCars();
  }, [
    currentPage,
    currentCategory,
    currentSearch,
    currentFuel,
    currentTrans,
    currentMinPrice,
    currentMaxPrice,
    currentSort,
    currentLocation,
  ]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentPage) params.append("page", currentPage);
      if (currentCategory) params.append("category", currentCategory);
      if (currentSearch) params.append("search", currentSearch);
      if (currentLocation) params.append("location", currentLocation);
      if (currentFuel) params.append("fuelType", currentFuel);
      if (currentTrans) params.append("transmission", currentTrans);
      if (currentMinPrice) params.append("minPrice", currentMinPrice);
      if (currentMaxPrice) params.append("maxPrice", currentMaxPrice);
      if (currentSort) params.append("sortBy", currentSort);
      params.append("limit", 9);

      const { data } = await axiosInstance.get(`/cars?${params.toString()}`);
      setCars(data.cars);
      setTotal(data.total);
      setPages(data.pages);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "All") {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleSearch = () => {
    updateFilter("search", searchInput);
  };

  const clearFilters = () => {
    setSearchInput("");
    setLocationInput("");
    setSearchParams({});
  };

  const hasActiveFilters =
    currentCategory ||
    currentSearch ||
    currentLocation ||
    currentFuel ||
    currentTrans ||
    currentMinPrice ||
    currentMaxPrice;

  return (
    <div className="min-h-screen px-4 pt-36 pb-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Browse <span className="text-primary">Cars</span>
        </h1>
        <p className="text-gray-400">
          {total > 0 ? `${total} cars available` : "No cars found"}
        </p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by car name or brand..."
            className="w-full bg-background text-white pl-10 pr-4 py-3 rounded-xl border border-gray-700 focus:border-primary transition-colors"
          />
        </div>
        <button
          onClick={handleSearch}
          className="bg-gradient-primary hover:shadow-dark-neumorphic-sm transition-all rounded-full px-8 py-3 text-white font-semibold transition-colors"
        >
          Search
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden bg-background border border-gray-700 text-white px-4 py-3 rounded-xl"
        >
          <Filter size={18} />
        </button>
      </div>

      <div className="flex gap-6">
        <aside
          className={`
          ${showFilters ? "block" : "hidden"} md:block
          w-full md:w-64 shrink-0
        `}
        >
          <div className="bg-background border border-gray-800 rounded-2xl p-5 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-primary text-sm hover:underline flex items-center gap-1"
                >
                  <X size={14} /> Clear all
                </button>
              )}
            </div>

            <div className="mb-6">
              <h4 className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wider">
                Location
              </h4>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter city..."
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && updateFilter("location", locationInput)
                  }
                  className="w-full bg-card text-white pl-3 pr-10 py-2 rounded-lg border border-gray-700 focus:border-primary text-sm"
                />
                <button
                  onClick={() => updateFilter("location", locationInput)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-white transition-colors"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wider">
                Category
              </h4>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateFilter("category", cat)}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors
                      ${
                        currentCategory === cat ||
                        (!currentCategory && cat === "All")
                          ? "bg-primary text-white"
                          : "text-gray-400 hover:text-white hover:bg-card"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wider">
                Price / Day (₹)
              </h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={currentMinPrice}
                  onChange={(e) => updateFilter("minPrice", e.target.value)}
                  className="w-full bg-card text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-primary text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={currentMaxPrice}
                  onChange={(e) => updateFilter("maxPrice", e.target.value)}
                  className="w-full bg-card text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-primary text-sm"
                />
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wider">
                Fuel Type
              </h4>
              <div className="flex flex-col gap-2">
                {fuelTypes.map((fuel) => (
                  <button
                    key={fuel}
                    onClick={() => updateFilter("fuelType", fuel)}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors
                      ${
                        currentFuel === fuel || (!currentFuel && fuel === "All")
                          ? "bg-primary text-white"
                          : "text-gray-400 hover:text-white hover:bg-card"
                      }`}
                  >
                    {fuel}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wider">
                Transmission
              </h4>
              <div className="flex flex-col gap-2">
                {transmissions.map((trans) => (
                  <button
                    key={trans}
                    onClick={() => updateFilter("transmission", trans)}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors
                      ${
                        currentTrans === trans ||
                        (!currentTrans && trans === "All")
                          ? "bg-primary text-white"
                          : "text-gray-400 hover:text-white hover:bg-card"
                      }`}
                  >
                    {trans}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-400 text-sm">
              Showing{" "}
              <span className="text-white font-semibold">{cars.length}</span> of{" "}
              <span className="text-white font-semibold">{total}</span> cars
            </p>
            <select
              value={currentSort}
              onChange={(e) => updateFilter("sortBy", e.target.value)}
              className="bg-background text-white border border-gray-700 rounded-xl px-4 py-2 text-sm focus:border-primary"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <Loader />
          ) : cars.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🚗</div>
              <h3 className="text-white text-xl font-bold mb-2">
                No cars found
              </h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your filters or search query
              </p>
              <button
                onClick={clearFilters}
                className="bg-gradient-primary hover:shadow-dark-neumorphic-sm transition-all rounded-full  transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => updateFilter("page", currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 bg-background border border-gray-700 hover:border-primary text-gray-400 hover:text-primary rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} /> Prev
              </button>

              {Array.from({ length: pages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => updateFilter("page", pageNum)}
                  className={`w-10 h-10 rounded-xl font-semibold transition-colors
                    ${
                      currentPage === pageNum
                        ? "bg-primary text-white"
                        : "bg-background border border-gray-700 text-gray-400 hover:border-primary hover:text-primary"
                    }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => updateFilter("page", currentPage + 1)}
                disabled={currentPage === pages}
                className="flex items-center gap-1 px-4 py-2 bg-background border border-gray-700 hover:border-primary text-gray-400 hover:text-primary rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cars;
