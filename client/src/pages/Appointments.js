import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Star, Clock, MapPin, Phone } from "lucide-react";
import { useLogin } from "../context/LoginContext";
import Cookies from "js-cookie";

const Appointments = () => {
  const navigate = useNavigate();
  const { isLog } = useLogin();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  useEffect(() => {
    if (!isLog) {
      navigate("/login");
      return;
    }
    fetchAppointments();
  }, [isLog, navigate]);

  const checkAppointmentReview = async (appointmentId) => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_API}/api/review/appointment/${appointmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.review;
    } catch (error) {
      console.error("Error fetching review:", error);
      return null;
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_API}/api/appointment/customer`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // Fetch reviews for completed appointments
      const appointmentsWithReviews = await Promise.all(
        response.data.appointments.map(async (appointment) => {
          if (appointment.status === "completed") {
            const review = await checkAppointmentReview(appointment._id);
            return {
              ...appointment,
              reviewed: !!review,
              review: review
            };
          }
          return appointment;
        })
      );
  
      setAppointments(appointmentsWithReviews);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      const token = Cookies.get("token");
      await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/api/review/create`,
        {
          tailorId: selectedAppointment.tailor._id,
          appointmentId: selectedAppointment._id,
          rating,
          comment: review,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowReviewModal(false);
      setSelectedAppointment(null);
      setRating(0);
      setReview("");
      fetchAppointments(); // Refresh appointments
    } catch (error) {
      console.error("Error submitting review:", error);
      setError("Failed to submit review");
    }
  };

  const getAppointmentStatus = (appointment) => {
    const today = new Date();
    const appointmentDate = new Date(appointment.appointmentDate);

    if (appointment.status === "cancelled") {
      return { label: "Cancelled", className: "bg-red-100 text-red-800" };
    }
    if (appointment.status === "completed") {
      return { label: "Completed", className: "bg-green-100 text-green-800" };
    }
    if (appointmentDate < today) {
      return { label: "Past", className: "bg-gray-100 text-gray-800" };
    }
    return { label: "Upcoming", className: "bg-blue-100 text-blue-800" };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Appointments</h1>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No appointments found
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {appointments.map((appointment) => {
            const status = getAppointmentStatus(appointment);
            return (
              <div
                key={appointment._id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">
                    {appointment.tailor?.shopName}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      {new Date(appointment.appointmentDate).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{appointment.tailor?.address}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>
                      {typeof appointment.tailor?.contact === "object"
                        ? appointment.tailor?.contact.phone
                        : appointment.tailor?.contact}
                    </span>
                  </div>

                  <div className="border-t pt-3 mt-3">
                    <div className="font-medium">Service Details:</div>
                    <div className="text-gray-600">
                      {appointment.service?.name}
                    </div>
                    <div className="text-[#c8a165] font-medium">
                      ₹{appointment.service?.price}
                    </div>
                  </div>

                  {appointment.status === "completed" && (
                    <div className="border-t pt-3 mt-3">
                      {appointment.reviewed ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Your Review</h4>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className="w-4 h-4"
                                  fill={
                                    star <= appointment.review?.rating
                                      ? "#FBBF24"
                                      : "none"
                                  }
                                  stroke={
                                    star <= appointment.review?.rating
                                      ? "#FBBF24"
                                      : "#D1D5DB"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 italic">
                            "{appointment.review?.comment}"
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              appointment.review?.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowReviewModal(true);
                          }}
                          className="w-full mt-2 bg-[#c8a165] text-white py-2 rounded-md hover:bg-[#b89155]"
                        >
                          Leave a Review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Write a Review</h2>
            <form onSubmit={handleReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl ${
                        star <= rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      <Star
                        className="w-6 h-6"
                        fill={star <= rating ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Review
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#c8a165] text-white py-2 rounded-md hover:bg-[#b89155]"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedAppointment(null);
                    setRating(0);
                    setReview("");
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
