import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { useNavigate } from "react-router";

const SideDrawer = ({ isOpen, onClose, user }) => {
  const navigate = useNavigate();
  const [isLogg] = useState(Cookies.get("token"));
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const getAppointments = async () => {
      if (!isOpen || !user || !isLogg) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_API}/api/appointment/customer`,
          {
            headers: {
              Authorization: `Bearer ${isLogg}`,
            },
          }
        );

        if (mounted && response.data.appointments) {
          setAppointments(response.data.appointments);
        }
      } catch (error) {
        if (mounted) {
          console.error("Error fetching appointments:", error);
          setError("Failed to load appointments");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getAppointments();

    return () => {
      mounted = false;
    };
  }, [isOpen, user?._id, isLogg]); // Add specific dependencies


  const handleCancelAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      const response = await axios.patch(
        `${process.env.REACT_APP_BACKEND_API}/api/appointment/${appointmentId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${isLogg}`,
          },
        }
      );

      if (response.data.success) {
        // Refresh appointments list
        fetchAppointments();
      } else {
        setError("Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      setError(error.response?.data?.message || "Failed to cancel appointment");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_API}/api/appointment/customer`,
        {
          headers: {
            Authorization: `Bearer ${isLogg}`,
          },
        }
      );

      if (response.data.appointments) {
        setAppointments(response.data.appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchAppointments();
    }
  }, [isOpen, user, isLogg]);

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/");
    window.location.reload();
  };

  const handleAppointmentClick = (appointmentId) => {
    navigate(`/appointments`);
    onClose(); // Close the drawer after navigation
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
    <div
      className={`fixed top-0 right-0 w-80 h-full bg-white shadow-lg transform transition-transform overflow-y-auto ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
            <div className="w-12 h-12 text-gray-400 flex items-center justify-center text-5xl font-bold">
              {/* {user.username.charAt(0)} */}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            {user.username}
          </h2>
          <p className="text-gray-600">{user.email}</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Account Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-gray-500">Username:</span>
                <span className="ml-2 font-medium">{user.username}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500">Email:</span>
                <span className="ml-2 font-medium">{user.email}</span>
              </div>
            </div>
          </div>

          {user.role !== "tailor" && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <Accordion type="single" collapsible className="w-full space-y-2">
                <AccordionItem value="appointments">
                  <AccordionTrigger>
                    <div className="flex items-center justify-between w-full">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Your Appointments
                        <span className="ml-2 text-sm text-gray-500">
                          ({appointments.length})
                        </span>
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {loading ? (
                      <div className="p-4 text-center text-gray-500">
                        Loading...
                      </div>
                    ) : error ? (
                      <div className="p-4 text-center text-red-500">
                        {error}
                      </div>
                    ) : appointments.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No appointments found
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {appointments.map((appointment, index) => {
                          const status = getAppointmentStatus(appointment);
                          return (
                            <AccordionItem
                              key={appointment._id || index}
                              value={`appointment-${index}`}
                              className="border rounded-lg shadow-sm cursor-pointer"
                              onClick={() => handleAppointmentClick(appointment._id)}
                            >
                              <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex-1 text-left">
                                    <p className="font-semibold text-gray-800">
                                      {appointment.tailor?.shopName ||
                                        appointment.storeName}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {new Date(
                                        appointment.appointmentDate
                                      ).toLocaleDateString()}{" "}
                                      -
                                      <span
                                        className={`ml-2 px-2 py-0.5 rounded-full text-xs ${status.className}`}
                                      >
                                        {status.label}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 py-3 bg-white">
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Service:
                                    </span>
                                    <span className="font-medium">
                                      {appointment.service?.name ||
                                        "Not specified"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Date & Time:
                                    </span>
                                    <span className="font-medium">
                                      {new Date(
                                        appointment.appointmentDate
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Address:
                                    </span>
                                    <span className="font-medium text-right max-w-[60%]">
                                      {appointment.tailor?.address ||
                                        appointment.storeAddress}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Contact:
                                    </span>
                                    <span className="font-medium">
                                      {typeof appointment.tailor?.contact === 'object' 
                                        ? appointment.tailor?.contact.phone || appointment.tailor?.contact.whatsapp 
                                        : appointment.tailor?.contact || 
                                          appointment.storeMobileNumber}
                                    </span>
                                  </div>
                                  {appointment.status !== "cancelled" &&
                                    appointment.status !== "completed" && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent navigation when clicking cancel
                                          handleCancelAppointment(appointment._id);
                                        }}
                                        className="w-full mt-2 py-1.5 text-red-600 text-sm border border-red-200 rounded-md hover:bg-red-50"
                                      >
                                        Cancel Appointment
                                      </button>
                                    )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="bg-[#c8a165] text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideDrawer;
