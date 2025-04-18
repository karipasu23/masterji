const mongoose = require("mongoose");
const Tailor = require("../model/tailorSchema");
const Service = require("../model/serviceSchema");

// Create new tailor profile
const createTailor = async (req, res) => {
  try {
    const {
      shopName,
      location,
      contact,
      experience,
      specializations,
      workingHours,
    } = req.body;

    // Basic validation
    if (!shopName || !location || !contact || !location.address) {
      return res.status(400).json({
        message: "Please provide all required fields including address",
      });
    }

    // Check if shop name already exists
    const existingShop = await Tailor.findOne({ shopName });
    if (existingShop) {
      return res.status(400).json({
        message: "Shop name already exists",
      });
    }

    const newTailor = new Tailor({
      shopName,
      location,
      contact,
      experience,
      specializations,
      workingHours,
      owner: null, // Set to null since we're not using auth yet
    });

    await newTailor.save();
    res.status(201).json({
      message: "Tailor profile created successfully",
      tailor: newTailor,
    });
  } catch (error) {
    console.error("Error creating tailor profile:", error);
    res.status(500).json({
      message: "Error creating tailor profile",
      error: error.message,
    });
  }
};

// Get tailor by ID
const getTailorById = async (req, res) => {
    try {
        const { id } = req.params;

        // Handle special routes first
        if (id === "featured") {
            return getFeaturedTailors(req, res);
        }

        // Handle search functionality
        if (id === "search") {
            const { area, city } = req.query;
            const query = {};

            if (area) query["location.area"] = new RegExp(area, "i");
            if (city) query["location.city"] = new RegExp(city, "i");

            const tailors = await Tailor.find(query)
                .populate("owner", "username")
                .select("-reviews");

            return res.status(200).json({
                success: true,
                tailors
            });
        }

        // Enhanced ObjectId validation
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid tailor ID format",
                details: "The provided ID is not in the correct MongoDB ObjectId format",
                providedId: id
            });
        }

        // Fetch tailor with validated ID
        const tailor = await Tailor.findById(id)
            .populate("owner", "username email")
            .populate("reviews");

        if (!tailor) {
            return res.status(404).json({
                success: false,
                message: "Tailor not found",
                details: "No tailor exists with the provided ID",
                providedId: id
            });
        }

        // Get services for this tailor
        const services = await Service.find({ tailor: id });

        return res.status(200).json({
            success: true,
            tailor,
            services
        });

    } catch (error) {
        console.error("Error fetching tailor:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching tailor",
            error: error.message,
            details: "An unexpected error occurred while processing your request"
        });
    }
};

const getFeaturedTailors = async (req, res) => {
    try {
        const tailors = await Tailor.find()
            .populate("owner", "username")
            .select("-reviews");

        // Return empty array if no tailors found
        if (!tailors || tailors.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No tailors found",
                tailors: []
            });
        }

        return res.status(200).json({
            success: true,
            count: tailors.length,
            tailors
        });

    } catch (error) {
        console.error("Error fetching tailors:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching tailors",
            error: error.message
        });
    }
};

// Update tailor profile
const updateTailor = async (req, res) => {
  try {
    const updatedTailor = await Tailor.findOneAndUpdate(
      { owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTailor) {
      return res.status(404).json({ message: "Tailor not found" });
    }

    res.status(200).json({
      message: "Tailor profile updated",
      tailor: updatedTailor,
    });
  } catch (error) {
    console.error("Error updating tailor:", error);
    res.status(500).json({
      message: "Error updating tailor",
      error: error.message,
    });
  }
};

// Search tailors by location
const searchTailors = async (req, res) => {
  try {
    const { area, city } = req.query;
    const query = {};

    if (area) query["location.area"] = new RegExp(area, "i");
    if (city) query["location.city"] = new RegExp(city, "i");

    const tailors = await Tailor.find(query)
      .populate("owner", "username")
      .select("-reviews");

    res.status(200).json({ tailors });
  } catch (error) {
    console.error("Error searching tailors:", error);
    res.status(500).json({
      message: "Error searching tailors",
      error: error.message,
    });
  }
};

const getTailorServices = async (req, res) => {
  try {
    const services = await Service.find({ tailor: req.params.id });

    if (!services) {
      return res.status(404).json({ message: "No services found" });
    }

    res.status(200).json({ services });
  } catch (error) {
    console.error("Error fetching tailor services:", error);
    res.status(500).json({
      message: "Error fetching services",
      error: error.message,
    });
  }
};

// Toggle tailor availability
const toggleAvailability = async (req, res) => {
  try {
    const tailor = await Tailor.findOne({ owner: req.user._id });

    if (!tailor) {
      return res.status(404).json({ message: "Tailor not found" });
    }

    tailor.isAvailable = !tailor.isAvailable;
    await tailor.save();

    res.status(200).json({
      message: `Tailor is now ${
        tailor.isAvailable ? "available" : "unavailable"
      }`,
      isAvailable: tailor.isAvailable,
    });
  } catch (error) {
    console.error("Error toggling availability:", error);
    res.status(500).json({
      message: "Error toggling availability",
      error: error.message,
    });
  }
};

// Update working hours
const updateWorkingHours = async (req, res) => {
  try {
    const { workingHours } = req.body;

    const tailor = await Tailor.findOneAndUpdate(
      { owner: req.user._id },
      { workingHours },
      { new: true }
    );

    if (!tailor) {
      return res.status(404).json({ message: "Tailor not found" });
    }

    res.status(200).json({
      message: "Working hours updated",
      workingHours: tailor.workingHours,
    });
  } catch (error) {
    console.error("Error updating working hours:", error);
    res.status(500).json({
      message: "Error updating working hours",
      error: error.message,
    });
  }
};

// Get tailors by specialization
const getTailorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.query;

    const tailors = await Tailor.find({
      specializations: specialization,
    }).populate("owner", "username");

    res.status(200).json({ tailors });
  } catch (error) {
    console.error("Error fetching tailors by specialization:", error);
    res.status(500).json({
      message: "Error fetching tailors",
      error: error.message,
    });
  }
};

// Delete tailor profile
const deleteTailor = async (req, res) => {
  try {
    const deletedTailor = await Tailor.findOneAndDelete({
      owner: req.user._id,
    });

    if (!deletedTailor) {
      return res.status(404).json({ message: "Tailor not found" });
    }

    // Also delete associated services
    await Service.deleteMany({ tailor: deletedTailor._id });

    res.status(200).json({
      message: "Tailor profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tailor:", error);
    res.status(500).json({
      message: "Error deleting tailor",
      error: error.message,
    });
  }
};

module.exports = {
  createTailor,
  getTailorById,
  getFeaturedTailors,
  updateTailor,
  searchTailors,
  getTailorServices,
  toggleAvailability,
  updateWorkingHours,
  getTailorsBySpecialization,
  deleteTailor,
};
