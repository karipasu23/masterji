import React, { useState, useEffect } from "react";
import { useLogin } from "../context/LoginContext";
import {
  Calendar,
  Clock,
  Users,
  Star,
  Settings,
  Scissors,
  DollarSign,
  X,
} from "lucide-react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { format } from "date-fns";

function TailorDashboard() {
  const { user, isLog, showLogin, setShowLogin } = useLogin();
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    completedOrders: 0,
    totalEarnings: 0,
    averageRating: 0,
  });

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    estimatedDays: "",
  });

  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  const [showPendingList, setShowPendingList] = useState(false);

  const [showCompletedList, setShowCompletedList] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Add this new function after other useEffect hooks
  useEffect(() => {
    fetchReviews();
  }, []);
  // Fetch services on load
  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const token = Cookies.get("token");

      // Debug logs
      console.log("Fetching reviews:", {
        tailorId: user?._id,
        token: token ? "Present" : "Missing",
        apiUrl: `${process.env.REACT_APP_BACKEND_API}/api/review/tailor/${user?._id}`,
      });

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/review/tailor/${user?._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Debug response
      console.log("Reviews API Response:", {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });

      const data = await response.json();
      console.log("Reviews Data:", data);

      if (response.ok) {
        setReviews(data.reviews);
        setStats((prev) => ({
          ...prev,
          averageRating: data.averageRating.toFixed(1),
        }));
      } else {
        console.error("Error response from reviews API:", data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", {
        message: error.message,
        error: error,
      });
    } finally {
      setReviewsLoading(false);
    }
  };

  const calculateTailorEarnings = (price) => {
    const platformFeePercentage = 0.05; // 5%
    const platformFee = price * platformFeePercentage;
    return price - platformFee;
  };

  const fetchAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const token = Cookies.get("token");

      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/appointment/tailor`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setAppointments(data.appointments);
        // Update stats
        const pending = data.appointments.filter(
          (apt) => apt.status === "pending"
        ).length;
        const completed = data.appointments.filter(
          (apt) => apt.status === "completed"
        ).length;
        // Calculate earnings after platform fee
        const earnings = data.appointments
          .filter((apt) => apt.status === "completed")
          .reduce(
            (sum, apt) => sum + calculateTailorEarnings(apt.service.price),
            0
          );

        setStats((prev) => ({
          ...prev,
          pendingAppointments: pending,
          completedOrders: completed,
          totalEarnings: earnings,
        }));
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const token = Cookies.get("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/appointment/${appointmentId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        // Update local state
        setAppointments(
          appointments.map((apt) =>
            apt._id === appointmentId ? { ...apt, status: newStatus } : apt
          )
        );
        // Refresh stats
        fetchAppointments();
      } else {
        const data = await response.json();
        throw new Error(data.message || "Failed to update appointment");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert(error.message);
    }
  };

  const fetchServices = async () => {
    try {
      const token = Cookies.get("token"); // Changed from localStorage

      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/services`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setServices(data.services);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get("token"); // Changed from localStorage

      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/services/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(serviceForm),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setServices([...services, data.service]);
        setServiceForm({
          name: "",
          price: "",
          category: "",
          description: "",
          estimatedDays: "",
        });
        setShowServiceForm(false);
      } else {
        throw new Error(data.message || "Failed to add service");
      }
    } catch (error) {
      console.error("Error adding service:", error);
      alert(error.message);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      const token = Cookies.get("token"); // Changed from localStorage

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/services/${serviceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setServices(services.filter((service) => service._id !== serviceId));
      } else {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete service. Please try again.");
    }
  };

  // Check if user is logged in and is a tailor
  if (!isLog) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has tailor role
  if (!user?.role === "tailor") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You must be a registered tailor to view this page.
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="mt-4 bg-[#c8a165] text-white px-4 py-2 rounded-md hover:bg-[#b89155]"
          >
            Login as Tailor
          </button>
        </div>
      </div>
    );
  }

  const ReviewsModal = ({ reviews, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">All Reviews</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{review.user.username}</h3>
                    <div className="flex">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className="w-4 h-4"
                          fill={index < review.rating ? "#FBBF24" : "none"}
                          stroke={index < review.rating ? "#FBBF24" : "#D1D5DB"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{format(new Date(review.createdAt), "PPP")}</span>
                    <span>•</span>
                    <span>{review.appointment?.service?.name}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {user?.shopName}
          </h1>
          <p className="text-gray-600">
            {user?.location?.area}, {user?.location?.city}
          </p>
        </div>
        <button className="bg-[#c8a165] text-white px-4 py-2 rounded-md hover:bg-[#b89155]">
          Update Profile
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Calendar className="h-6 w-6" />}
          title="Pending Appointments"
          value={stats.pendingAppointments}
          color="bg-blue-100 text-blue-600"
          onClick={() => setShowPendingList(!showPendingList)}
          clickable={true}
        />
        <StatCard
          icon={<Scissors className="h-6 w-6" />}
          title="Completed Orders"
          value={stats.completedOrders}
          color="bg-green-100 text-green-600"
          onClick={() => setShowCompletedList(!showCompletedList)}
          clickable={true}
        />
        <StatCard
          icon={<DollarSign className="h-6 w-6" />}
          title="Total Earnings"
          value={`₹${stats.totalEarnings}`}
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          icon={<Star className="h-6 w-6" />}
          title="Average Rating"
          value={`${stats.averageRating}/5`}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {showPendingList && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Active Appointments</h2>
          <div className="space-y-4">
            {appointmentsLoading ? (
              <p className="text-gray-500 text-center">
                Loading appointments...
              </p>
            ) : appointments.filter((apt) =>
                ["pending", "confirmed"].includes(apt.status)
              ).length > 0 ? (
              appointments
                .filter((apt) => ["pending", "confirmed"].includes(apt.status))
                .map((appointment) => (
                  <div key={appointment._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {appointment.customer.username}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {appointment.service.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(
                            new Date(appointment.appointmentDate),
                            "PPP p"
                          )}
                        </p>
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-600">
                            Customer Paid: ₹{appointment.service.price}
                          </p>
                          <p className="text-xs text-gray-500">
                            Status:{" "}
                            <span
                              className={`font-medium ${
                                appointment.status === "confirmed"
                                  ? "text-blue-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {appointment.status.charAt(0).toUpperCase() +
                                appointment.status.slice(1)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <select
                          value={appointment.status}
                          onChange={(e) => {
                            handleUpdateAppointmentStatus(
                              appointment._id,
                              e.target.value
                            );
                            if (e.target.value === "completed") {
                              alert(
                                `Order completed!\nYour earnings: ₹${calculateTailorEarnings(
                                  appointment.service.price
                                )}\n(5% platform fee deducted)`
                              );
                            }
                          }}
                          className="text-sm border rounded-md p-1 mb-2"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {appointment.status === "confirmed" && (
                          <span className="text-xs text-blue-600">
                            Expected earnings: ₹
                            {calculateTailorEarnings(appointment.service.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-center">
                No active appointments
              </p>
            )}
          </div>
        </div>
      )}

      {showCompletedList && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Completed Orders</h2>
          <div className="space-y-4">
            {appointmentsLoading ? (
              <p className="text-gray-500 text-center">
                Loading completed orders...
              </p>
            ) : appointments.filter((apt) => apt.status === "completed")
                .length > 0 ? (
              appointments
                .filter((apt) => apt.status === "completed")
                .map((appointment) => (
                  <div key={appointment._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {appointment.customer.username}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {appointment.service.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(appointment.appointmentDate), "PPP")}
                        </p>
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-600">
                              Payment Status:
                              <span
                                className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                                  appointment.paymentStatus === "paid"
                                    ? "bg-green-100 text-green-800"
                                    : appointment.paymentStatus === "refunded"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {appointment.paymentStatus
                                  .charAt(0)
                                  .toUpperCase() +
                                  appointment.paymentStatus.slice(1)}
                              </span>
                            </p>
                          </div>
                          <p className="text-sm font-medium text-gray-600 mt-1">
                            Amount: ₹{appointment.service.price}
                          </p>
                          <p className="text-sm text-green-600">
                            Your Earnings: ₹
                            {calculateTailorEarnings(appointment.service.price)}
                            <span className="text-xs text-gray-500 ml-1">
                              (after 5% platform fee)
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`px-2 py-1 rounded-md text-sm ${
                            appointment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-center">No completed orders</p>
            )}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Today's Appointments</h2>
          <div className="space-y-4">
            {appointmentsLoading ? (
              <p className="text-gray-500 text-center">
                Loading appointments...
              </p>
            ) : appointments.length > 0 ? (
              appointments
                .filter(
                  (apt) =>
                    format(new Date(apt.appointmentDate), "yyyy-MM-dd") ===
                    format(new Date(), "yyyy-MM-dd")
                )
                .map((appointment) => (
                  <div key={appointment._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {appointment.customer.username}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {appointment.service.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(
                            new Date(appointment.appointmentDate),
                            "h:mm a"
                          )}
                        </p>
                      </div>
                      <select
                        value={appointment.status}
                        onChange={(e) =>
                          handleUpdateAppointmentStatus(
                            appointment._id,
                            e.target.value
                          )
                        }
                        className="text-sm border rounded-md p-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-center">
                No appointments for today
              </p>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Reviews</h2>
          <div className="space-y-4">
            {reviewsLoading ? (
              <p className="text-gray-500 text-center">Loading reviews...</p>
            ) : reviews.length > 0 ? (
              reviews.slice(0, 5).map((review) => (
                <div key={review._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{review.user.username}</h3>
                        <div className="flex">
                          {[...Array(5)].map((_, index) => (
                            <Star
                              key={index}
                              className="w-4 h-4"
                              fill={index < review.rating ? "#FBBF24" : "none"}
                              stroke={
                                index < review.rating ? "#FBBF24" : "#D1D5DB"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(review.createdAt), "PPP")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No reviews yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionButton
          icon={<Clock />}
          title="Update Hours"
          onClick={() => {
            /* Handle click */
          }}
        />
        <QuickActionButton
          icon={<Settings />}
          title="Manage Services"
          onClick={() => setShowServiceForm(!showServiceForm)}
        />
        <QuickActionButton
          icon={<Users />}
          title="Customer List"
          onClick={() => {
            /* Handle click */
          }}
        />
        <QuickActionButton
          icon={<Star />}
          title="View Reviews"
          onClick={() => setShowReviews(true)}
        />
      </div>

      {/* Service Management Form */}
      {showServiceForm && (
        <div className="mt-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add New Service</h2>
              <button
                onClick={() => setShowServiceForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Service Name*
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#c8a165] focus:ring-[#c8a165]"
                    value={serviceForm.name}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price (₹)*
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#c8a165] focus:ring-[#c8a165]"
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, price: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category*
                  </label>
                  <select
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#c8a165] focus:ring-[#c8a165]"
                    value={serviceForm.category}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        category: e.target.value,
                      })
                    }
                  >
                    <option value="">Select category</option>
                    <option value="Stitching">Stitching</option>
                    <option value="Alterations">Alterations</option>
                    <option value="Design">Design</option>
                    <option value="Repair">Repair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Estimated Days*
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#c8a165] focus:ring-[#c8a165]"
                    value={serviceForm.estimatedDays}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        estimatedDays: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description*
                </label>
                <textarea
                  required
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#c8a165] focus:ring-[#c8a165]"
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#c8a165] text-white py-2 px-4 rounded-md hover:bg-[#b89155] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c8a165]"
              >
                Add Service
              </button>
            </form>
          </div>

          {/* Services List */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Your Services</h2>
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-gray-600">
                      {service.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {service.category} • ₹{service.price} •{" "}
                      {service.estimatedDays} days
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteService(service._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showReviews && (
        <ReviewsModal reviews={reviews} onClose={() => setShowReviews(false)} />
      )}
    </div>
  );
}

// Helper Components
const StatCard = ({ icon, title, value, color, onClick, clickable }) => (
  <div
    className={`bg-white p-6 rounded-lg shadow-sm ${
      clickable ? "cursor-pointer hover:bg-gray-50" : ""
    }`}
    onClick={onClick}
  >
    <div
      className={`${color} w-12 h-12 rounded-full flex items-center justify-center mb-4`}
    >
      {icon}
    </div>
    <h3 className="text-gray-600 text-sm">{title}</h3>
    <p className="text-2xl font-semibold mt-1">{value}</p>
  </div>
);
const QuickActionButton = ({ icon, title, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
  >
    <div className="text-center">
      <div className="mb-2 text-gray-600">{icon}</div>
      <span className="text-sm font-medium">{title}</span>
    </div>
  </button>
);

export default TailorDashboard;
