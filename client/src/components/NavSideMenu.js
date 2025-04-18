import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useLogin } from "../context/LoginContext";
import { MapPin, User, Search, Scissors } from "lucide-react";
import Login from "../pages/Login";
import SideDrawer from "./SideDrawer";

function NavSideMenu() {
  const navigate = useNavigate();
  const { isLog, user, showLogin, setShowLogin } = useLogin();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentLocation, setCurrentLocation] = useState("Mumbai");
  const [locationError, setLocationError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const getUserLocation = () => {
    setIsLoading(true);
    setLocationError(null); // Reset any previous errors

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Replace with your actual API key
          const OPENCAGE_API_KEY = process.env.REACT_APP_OPENCAGE_API_KEY;

          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch location data");
          }

          const data = await response.json();

          if (data.results && data.results[0]) {
            const components = data.results[0].components;
            const city =
              components.city ||
              components.town ||
              components.state_district ||
              "Unknown Location";
            setCurrentLocation(city);
          } else {
            setLocationError("Could not determine your city");
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          setLocationError("Failed to get your location");
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out");
            break;
          default:
            setLocationError("An unknown error occurred");
        }
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowDropdown(true);

    if (query.length > 2) {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_API}/api/tailor/search?location=${currentLocation}&query=${query}`
        );
        const data = await response.json();

        // Extract tailors array from response
        const tailors = data.tailors || [];
        setSearchResults(tailors);
      } catch (error) {
        console.error("Error searching tailors:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };
  return (
    <div className="sticky top-0 w-full bg-white shadow-sm z-10">
      <header className="py-4 px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-1 flex justify-center">
          <NavLink to="/">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 300 40"
              width="300"
              height="40"
            >
              <g transform="scale(0.5)">
                <text x="80" y="60" fontSize="40" fontWeight="bold">
                  Master
                </text>
                <text x="210" y="60" fontSize="45" fill="#e0bd8a">
                  Ji
                </text>
                <path
                  d="M180 65 Q205 75 230 65"
                  fill="none"
                  stroke="#c8a165"
                  strokeWidth="4"
                />
              </g>
            </svg>
          </NavLink>
        </div>

        {/* Search with location */}
        <div ref={searchRef} className="relative flex items-center mx-4 flex-1">
          <div className="flex items-center border rounded-l px-3 py-2 bg-gray-50">
            <MapPin className="h-5 w-5 text-gray-400" />
            <span className="ml-2 text-gray-700">{currentLocation}</span>
            <button
              onClick={getUserLocation}
              className="ml-2 p-1 hover:bg-gray-100 rounded-full"
              title="Refresh location"
            >
              <svg
                className={`h-4 w-4 text-gray-400 ${
                  isLoading ? "animate-spin" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            {locationError && (
              <span className="ml-2 text-xs text-red-500" title={locationError}>
                !
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder="Search for tailors..."
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setShowDropdown(true)}
            className="w-full pl-4 pr-10 py-2 border-l-0 border rounded-r focus:outline-none focus:ring-2 focus:ring-[#c8a165]"
          />
          <Search className="absolute right-3 h-5 w-5 text-gray-400" />

          {/* Search results dropdown */}
          {showDropdown && searchQuery.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((tailor, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b"
                    onClick={() => {
                      navigate(`/tailor/${tailor._id}`);
                      setShowDropdown(false);
                    }}
                  >
                    <div className="flex items-center">
                      <div className="flex-1">
                        <h4 className="font-medium">{tailor.shopName}</h4>
                        <p className="text-sm text-gray-500">
                          {tailor.location.area}, {tailor.location.city}
                        </p>
                      </div>
                      <div className="text-sm text-[#c8a165]">
                        {tailor.rating?.average
                          ? `${tailor.rating.average} ★`
                          : ""}
                      </div>
                    </div>
                  </div>
                ))
              ) : searchQuery.length > 2 ? (
                <div className="p-4 text-center text-gray-500">
                  No tailors found in {currentLocation}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Type at least 3 characters to search
                </div>
              )}
            </div>
          )}
        </div>
        {/* Auth section */}
        <div className="flex items-center space-x-4">
          {isLog && user?.role === "tailor" ? (
            <NavLink
              to="/dashboard"
              className="flex items-center text-[#c8a165] hover:text-[#b89155] px-4 py-2 border border-[#c8a165] rounded-md hover:bg-[#fff8ef] transition-colors"
            >
              <Scissors className="h-4 w-4 mr-2" />
              Dashboard
            </NavLink>
          ) : (
            !isLog && (
              <NavLink
                to="/join-as-tailor"
                className="flex items-center text-[#c8a165] hover:text-[#b89155] px-4 py-2 border border-[#c8a165] rounded-md hover:bg-[#fff8ef] transition-colors"
              >
                <Scissors className="h-4 w-4 mr-2" />
                Join as Tailor
              </NavLink>
            )
          )}

          {isLog ? (
            <div className="relative">
              <button
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="flex flex-col items-center min-w-[60px]"
              >
                <User className="h-6 w-6 text-gray-700" />
                <span
                  className="text-xs text-center truncate max-w-[60px]"
                  title={user.username}
                >
                  {user.username}
                </span>
              </button>
              <SideDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                user={user}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="bg-[#c8a165] text-white px-4 py-2 rounded hover:bg-[#b89155]"
            >
              Login
            </button>
          )}
        </div>
      </header>
      {showLogin && <Login />}
    </div>
  );
}

export default NavSideMenu;
