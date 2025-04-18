import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Star, Calendar } from "lucide-react";
import { useLogin } from "../context/LoginContext";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

function TailorPage() {
  const { id } = useParams();
  const { isLog, user } = useLogin();
  const [tailor, setTailor] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const navigate = useNavigate();
  // const { id } = useParams();

  const [appointmentData, setAppointmentData] = useState({
    serviceId: "",
    appointmentDate: "",
    measurements: {
      bust: "",
      waist: "",
      hip: "",
      shoulderLength: "",
      armLength: "",
      notes: "",
    },
  });

  useEffect(() => {
    const fetchTailorAndServices = async () => {
      try {
        const [tailorRes, servicesRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_BACKEND_API}/api/tailor/${id}`),
          fetch(
            `${process.env.REACT_APP_BACKEND_API}/api/tailor/${id}/services`
          ),
        ]);

        const [tailorData, servicesData] = await Promise.all([
          tailorRes.json(),
          servicesRes.json(),
        ]);

        if (!tailorRes.ok) throw new Error(tailorData.message);
        if (!servicesRes.ok) throw new Error(servicesData.message);

        // Validate tailor data
        if (!tailorData?.tailor) {
          throw new Error("Invalid tailor data received");
        }

        setTailor(tailorData.tailor);
        setServices(servicesData.services || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTailorAndServices();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isLog) {
      alert('Please login to book an appointment');
      return;
    }

    try {
      const token = Cookies.get('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_API}/api/appointment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tailorId: id,
          ...appointmentData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to book appointment');
      }

      // Replace Navigate() with navigate()
      navigate('/appointments'); // Navigate to appointments page
      
      setAppointmentData({
        serviceId: '',
        appointmentDate: '',
        measurements: {
          bust: '',
          waist: '',
          hip: '',
          shoulderLength: '',
          armLength: '',
          notes: ''
        }
      });
    } catch (err) {
      console.error('Booking error:', err);
      alert(err.message);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c8a165]"></div>
      </div>
    );

  // Show error state
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  // Return null if no tailor data
  if (!tailor) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {tailor.shopName}
              </h1>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {tailor.location.address}, {tailor.location.area},{" "}
                  {tailor.location.city} - {tailor.location.pincode}
                </span>
              </div>
              <div className="mt-2 flex items-center">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="ml-1 text-gray-600">
                  {tailor.rating?.average || "New"} ({tailor.rating?.count || 0}{" "}
                  reviews)
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="flex items-center text-sm text-gray-500">
                <Phone className="h-4 w-4 mr-1" />
                <span>{tailor.contact.phone}</span>
              </div>
              {tailor.contact.email && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  <span>{tailor.contact.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Details Section */}
          <div className="md:col-span-2">
            {/* Experience and Specializations */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="mb-4">Experience: {tailor.experience} years</p>
              <div>
                <h3 className="font-medium mb-2">Specializations:</h3>
                <div className="flex flex-wrap gap-2">
                  {tailor.specializations.map((specialization, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#fff8ef] text-[#c8a165] rounded-full text-sm"
                    >
                      {specialization}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Working Hours
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(tailor.workingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="capitalize">{day}</span>
                    <span>
                      {hours.open && hours.close
                        ? `${hours.open} - ${hours.close}`
                        : "Closed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Section */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Book Appointment</h2>
              <form onSubmit={handleBooking} className="space-y-4">
                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Service*
                  </label>
                  <select
                    required
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#c8a165] focus:ring-[#c8a165]"
                    value={appointmentData.serviceId}
                    onChange={(e) =>
                      setAppointmentData({
                        ...appointmentData,
                        serviceId: e.target.value,
                      })
                    }
                  >
                    <option value="">Choose a service</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.name} - ₹{service.price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Date*
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#c8a165] focus:ring-[#c8a165]"
                    value={appointmentData.appointmentDate}
                    onChange={(e) =>
                      setAppointmentData({
                        ...appointmentData,
                        appointmentDate: e.target.value,
                      })
                    }
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                {/* Measurements */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">
                    Measurements (in inches)
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(appointmentData.measurements).map(
                      (measurement) =>
                        measurement !== "notes" && (
                          <div key={measurement}>
                            <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                              {measurement}
                            </label>
                            <input
                              type="number"
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#c8a165] focus:ring-[#c8a165]"
                              value={appointmentData.measurements[measurement]}
                              onChange={(e) =>
                                setAppointmentData({
                                  ...appointmentData,
                                  measurements: {
                                    ...appointmentData.measurements,
                                    [measurement]: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                        )
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#c8a165] focus:ring-[#c8a165]"
                      rows={2}
                      value={appointmentData.measurements.notes}
                      onChange={(e) =>
                        setAppointmentData({
                          ...appointmentData,
                          measurements: {
                            ...appointmentData.measurements,
                            notes: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#c8a165] text-white py-2 px-4 rounded-md hover:bg-[#b89155] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c8a165]"
                  disabled={!isLog}
                >
                  {isLog ? "Book Appointment" : "Login to Book"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TailorPage;
