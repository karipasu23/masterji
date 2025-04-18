import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Scissors, Phone, Mail, Store, Clock, Info } from "lucide-react";
import { useLogin } from "../context/LoginContext";

function TailorRegistration() {
  const { Storetoken, setShowLogin } = useLogin();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    shopName: "",
    location: {
      area: "",
      city: "",
      address: "",
      pincode: "",
    },
    contact: {
      phone: "",
      whatsapp: "",
      email: "",
    },
    experience: 0,
    specializations: [],
    workingHours: {
      monday: { open: "09:00", close: "18:00" },
      tuesday: { open: "09:00", close: "18:00" },
      wednesday: { open: "09:00", close: "18:00" },
      thursday: { open: "09:00", close: "18:00" },
      friday: { open: "09:00", close: "18:00" },
      saturday: { open: "09:00", close: "18:00" },
      sunday: { open: "", close: "" },
    },
  });

  const [userDetails, setUserDetails] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const specializationOptions = [
    "Blouse",
    "Saree",
    "Suits",
    "Dresses",
    "Alterations",
    "Mens Wear",
    "Kids Wear",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create formData with phone number in contact details
      const tailorFormData = {
        ...formData,
        contact: {
          ...formData.contact,
          phone: userDetails.phone // Copy phone from userDetails to contact
        }
      };

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/auth/register-tailor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...userDetails,
            shopDetails: tailorFormData,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Storetoken(data.token);
        navigate("/dashboard");
        window.location.reload();
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Failed to register. Please try again.");
    }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8ef] to-white py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#c8a165] opacity-5 rounded-full"></div>
        <div className="absolute top-1/2 -left-48 w-96 h-96 bg-[#c8a165] opacity-5 rounded-full"></div>
        <div className="absolute -bottom-24 right-1/2 w-64 h-64 bg-[#c8a165] opacity-5 rounded-full"></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block p-2 bg-[#fff8ef] rounded-lg mb-4">
            <Scissors className="h-8 w-8 text-[#c8a165]" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Join MasterJi as a Tailor
          </h2>
          <p className="mt-2 text-gray-600">
            Start your journey with us and grow your business
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100"
        >
          {/* Account Details Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
              <Store className="h-5 w-5 mr-2 text-[#c8a165]" />
              Account Details
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="input-group">
                <label className="block text-sm font-medium text-gray-700">
                  Username*
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-[#c8a165] focus:ring-[#c8a165] focus:bg-white transition-colors"
                  value={userDetails.username}
                  onChange={(e) =>
                    setUserDetails({ ...userDetails, username: e.target.value })
                  }
                />
              </div>
              <div className="input-group">
                <label className="block text-sm font-medium text-gray-700">
                  Email*
                </label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    required
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-[#c8a165] focus:ring-[#c8a165] focus:bg-white transition-colors pl-10"
                    value={userDetails.email}
                    onChange={(e) =>
                      setUserDetails({ ...userDetails, email: e.target.value })
                    }
                  />
                  <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="input-group">
                <label className="block text-sm font-medium text-gray-700">
                  Phone*
                </label>
                <div className="mt-1 relative">
                  <input
                    type="tel"
                    required
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-[#c8a165] focus:ring-[#c8a165] focus:bg-white transition-colors pl-10"
                    value={userDetails.phone}
                    onChange={(e) =>
                      setUserDetails({ ...userDetails, phone: e.target.value })
                    }
                  />
                  <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="input-group">
                <label className="block text-sm font-medium text-gray-700">
                  Password*
                </label>
                <input
                  type="password"
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-[#c8a165] focus:ring-[#c8a165] focus:bg-white transition-colors"
                  value={userDetails.password}
                  onChange={(e) =>
                    setUserDetails({ ...userDetails, password: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          {/* Shop Details */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
              <Store className="h-5 w-5 mr-2 text-[#c8a165]" />
              Shop Details
            </h3>
            
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Name*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm 
                             focus:border-[#c8a165] focus:ring-[#c8a165] focus:bg-white 
                             transition-all duration-200 pl-10 py-3"
                    placeholder="Enter shop name"
                    value={formData.shopName}
                    onChange={(e) =>
                      setFormData({ ...formData, shopName: e.target.value })
                    }
                  />
                  <Store className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              {/* Full Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address*
                </label>
                <div className="relative">
                  <textarea
                    required
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm 
                             focus:border-[#c8a165] focus:ring-[#c8a165] focus:bg-white 
                             transition-all duration-200 pl-10 py-3 min-h-[100px]"
                    placeholder="Enter complete shop address"
                    value={formData.location.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, address: e.target.value },
                      })
                    }
                  />
                  <MapPin className="h-5 w-5 text-gray-400 absolute left-3 top-4" />
                </div>
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area*
                </label>
                <input
                  type="text"
                  required
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm 
                           focus:border-[#c8a165] focus:ring-[#c8a165] focus:bg-white 
                           transition-all duration-200 py-3"
                  placeholder="Enter area"
                  value={formData.location.area}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, area: e.target.value },
                    })
                  }
                />
              </div>

              {/* City and Pincode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City*
                  </label>
                  <input
                    type="text"
                    required
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm 
                             focus:border-[#c8a165] focus:ring-[#c8a165] focus:bg-white 
                             transition-all duration-200 py-3"
                    placeholder="Enter city"
                    value={formData.location.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, city: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode*
                  </label>
                  <input
                    type="text"
                    required
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm 
                             focus:border-[#c8a165] focus:ring-[#c8a165] focus:bg-white 
                             transition-all duration-200 py-3"
                    placeholder="Enter pincode"
                    value={formData.location.pincode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          pincode: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

          {/* Contact Details */}
          <div className="space-y-6">
  <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
    <Phone className="h-5 w-5 mr-2 text-[#c8a165]" />
    Contact Details
  </h3>

  <div className="grid grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        WhatsApp Number (Optional)
      </label>
      <div className="relative">
        <input
          type="tel"
          className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm 
                   focus:border-[#c8a165] focus:ring-[#c8a165] focus:bg-white 
                   transition-all duration-200 pl-10 py-3"
          placeholder="Enter WhatsApp number"
          value={formData.contact.whatsapp}
          onChange={(e) =>
            setFormData({
              ...formData,
              contact: {
                ...formData.contact,
                whatsapp: e.target.value,
              },
            })
          }
        />
        <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Additional Email (Optional)
      </label>
      <div className="relative">
        <input
          type="email"
          className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm 
                   focus:border-[#c8a165] focus:ring-[#c8a165] focus:bg-white 
                   transition-all duration-200 pl-10 py-3"
          placeholder="Enter additional email"
          value={formData.contact.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              contact: {
                ...formData.contact,
                email: e.target.value,
              },
            })
          }
        />
        <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        This can be different from your account email
      </p>
    </div>
  </div>
</div>

{/* Experience and Specializations */}
<div className="space-y-6">
  <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
    <Scissors className="h-5 w-5 mr-2 text-[#c8a165]" />
    Skills & Experience
  </h3>

  <div className="grid grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Years of Experience*
      </label>
      <div className="relative">
        <input
          type="number"
          required
          min="0"
          className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm 
                   focus:border-[#c8a165] focus:ring-[#c8a165] focus:bg-white 
                   transition-all duration-200 pl-10 py-3"
          placeholder="Enter years of experience"
          value={formData.experience}
          onChange={(e) =>
            setFormData({
              ...formData,
              experience: Number(e.target.value),
            })
          }
        />
        <Clock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Specializations*
      </label>
      <select
        multiple
        required
        className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm 
                 focus:border-[#c8a165] focus:ring-[#c8a165] focus:bg-white 
                 transition-all duration-200 py-3 min-h-[120px]"
        value={formData.specializations}
        onChange={(e) =>
          setFormData({
            ...formData,
            specializations: Array.from(
              e.target.selectedOptions,
              (option) => option.value
            ),
          })
        }
      >
        {specializationOptions.map((option) => (
          <option
            key={option}
            value={option}
            className="py-2 px-3 hover:bg-gray-100"
          >
            {option}
          </option>
        ))}
      </select>
      <p className="mt-2 text-sm text-gray-500 flex items-center">
        <Info className="h-4 w-4 mr-1" />
        Hold Ctrl/Cmd to select multiple
      </p>
    </div>
  </div>
</div>

<button
              type="submit"
              className="w-full bg-gradient-to-r from-[#c8a165] to-[#b89155] text-white py-4 px-6 
                       rounded-lg hover:from-[#b89155] hover:to-[#a78145] focus:outline-none 
                       focus:ring-2 focus:ring-offset-2 focus:ring-[#c8a165] transform transition-all 
                       duration-200 hover:scale-[1.02] active:scale-[0.98] font-medium text-lg 
                       shadow-md flex items-center justify-center gap-2"
            >
              <Scissors className="h-5 w-5" />
              Register as Tailor
            </button>
        </form>
      </div>
    </div>
  );
}

export default TailorRegistration;
