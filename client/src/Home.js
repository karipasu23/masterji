import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  MapPin,
  Scissors,
  Star,
  Clock,
  Phone,
  ChevronLeft,
  ChevronRight,
  Shield,
  Users,
  Ruler,
} from "lucide-react";
import Footer from "./components/Footer";

export default function Home() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const carouselImages = [
    {
      url: "https://gpjs3bucket.s3.amazonaws.com/wp-content/uploads/2019/05/26132514/GPJNews_IND_AB_Trousseau-Designer-39_WEb.jpg",
      alt: "Tailor working in factory",
    },
    {
      url: "https://freerangestock.com/sample/131848/old-indian-tailor.jpg",
      alt: "Traditional Indian tailor",
    },
    {
      url: "https://media.istockphoto.com/id/484228451/photo/woman-sewing.jpg?s=612x612&w=0&k=20&c=VvhpdhFasMaKm4t7xkamVz_qtTsQ0s7xUd4hDG5KPTw=",
      alt: "Street side tailor",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const [featuredTailors, setFeaturedTailors] = useState([]);
  const [popularServices, setPopularServices] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchFeaturedTailors = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_API}/api/tailor/featured`
        );
        if (response.ok) {
          const data = await response.json();
          setFeaturedTailors(data.tailors);
        }
      } catch (error) {
        console.error("Error fetching featured tailors:", error);
      }
    };

    const fetchPopularServices = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_API}/api/services/popular`
        );
        if (response.ok) {
          const data = await response.json();
          setPopularServices(data.services);
        }
      } catch (error) {
        console.error("Error fetching popular services:", error);
      }
    };

    fetchFeaturedTailors();
    fetchPopularServices();
  }, []);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = 300;
      const newPosition =
        direction === "left"
          ? scrollPosition - scrollAmount
          : scrollPosition + scrollAmount;

      current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });
      setScrollPosition(newPosition);
    }
  };

  return (
    <div className="min-h-full bg-[#faf7f2]">
      {/* Hero Section */}
      <section className="relative h-[500px]">
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${image.url})`,
                filter: "brightness(0.6)",
              }}
            />
          </div>
        ))}

        {/* Carousel Navigation */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? "bg-white w-4" : "bg-white/50"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-serif mb-4">
              Your Perfect Fit Awaits
            </h1>
            <p className="text-xl mb-8">
              Discover skilled tailors in your neighborhood for custom-made
              perfection
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/join-as-tailor")}
                className="bg-white text-[#c8a165] px-6 py-3 rounded-lg font-medium hover:bg-[#c8a165] hover:text-white transition-colors"
              >
                Join as Tailor
              </button>
              <button
                onClick={() => navigate("/search-tailors")}
                className="bg-[#c8a165] text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-[#c8a165] transition-colors border border-white"
              >
                Find Tailors
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 py-12">
        {/* Why Choose Us */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-[#c8a165] rounded-full flex items-center justify-center mb-4">
              <Scissors className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Expert Tailors</h3>
            <p className="text-gray-600">
              Connect with verified and experienced tailors in your area
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-[#c8a165] rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quality Guarantee</h3>
            <p className="text-gray-600">
              Every stitch is backed by our satisfaction guarantee
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-[#c8a165] rounded-full flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Flexible Scheduling</h3>
            <p className="text-gray-600">
              Book appointments at your convenience, 7 days a week
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-[#c8a165] rounded-full flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Verified Reviews</h3>
            <p className="text-gray-600">
              Real feedback from customers to help you choose the right tailor
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-[#c8a165] rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Community Trust</h3>
            <p className="text-gray-600">
              Join thousands of satisfied customers in your neighborhood
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-[#c8a165] rounded-full flex items-center justify-center mb-4">
              <Ruler className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Perfect Fit</h3>
            <p className="text-gray-600">
              Customized measurements for your unique style and comfort
            </p>
          </div>
        </section>

        {/* Featured Tailors */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-serif text-gray-800">
              Top Rated Tailors
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="p-2 rounded-full bg-[#c8a165] text-white hover:bg-[#b89155] transition-colors shadow-md"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-2 rounded-full bg-[#c8a165] text-white hover:bg-[#b89155] transition-colors shadow-md"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto hide-scrollbar pb-4"
          >
            {featuredTailors.map((tailor) => (
              <div
                key={tailor._id}
                className="flex-none w-80 bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer 
                 transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                onClick={() => navigate(`/tailor/${tailor._id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={tailor.image || "/default-tailor.png"}
                    alt={tailor.shopName || "Tailor Shop"}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                  {tailor.verified && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-gray-800">
                    {tailor.shopName}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">
                      {`${tailor.location?.area || ""}, ${
                        tailor.location?.city || ""
                      }`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">
                        {typeof tailor.rating === "number"
                          ? tailor.rating.toFixed(1)
                          : "New"}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        ({tailor.totalRatings || 0} reviews)
                      </span>
                    </div>
                    <span className="text-[#c8a165] font-medium">
                      View Profile →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

{/* Popular Services */}
<section className="mb-16">
  <h2 className="text-3xl font-serif mb-8 text-gray-800">
    Popular Services
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {popularServices.map((service) => (
      <div
        key={service._id}
        className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={() => navigate(`/tailor/${service.tailor?._id}`)}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={service.image || "/default-service.png"}
            alt={service.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          {service.featured && (
            <div className="absolute top-2 left-2 bg-[#c8a165] text-white px-3 py-1 rounded-full text-xs">
              Featured
            </div>
          )}
          {service.tailor?.shopName && (
            <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
              By {service.tailor.shopName}
            </div>
          )}
        </div>
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-2 text-gray-800">
            {service.name}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-2">
            {service.description}
          </p>
          <div className="flex justify-between items-center">
            <p className="text-[#c8a165] font-semibold text-lg">
              ₹{service.price}
            </p>
            <span className="text-sm text-[#c8a165] group-hover:text-[#b89155] font-medium flex items-center gap-1">
              View Tailor Profile →
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>

        {/* Call to Action */}
        <section className="bg-[#c8a165] rounded-lg p-8 text-white text-center">
          <h2 className="text-3xl font-serif mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-6">
            Join our community of skilled tailors and satisfied customers
          </p>
          <button
            onClick={() => navigate("/join-as-tailor")}
            className="bg-white text-[#c8a165] px-8 py-3 rounded-lg font-medium hover:bg-[#faf7f2] transition-colors"
          >
            Become a Tailor
          </button>
        </section>
      </main>
      <Footer />
    </div>
  );
}
