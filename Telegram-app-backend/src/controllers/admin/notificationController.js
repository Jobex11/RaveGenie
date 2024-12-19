const cloudinary = require("../../bucket/cloudinary.js");
const Notifications = require("../../models/notifications.js"); // Assuming a Notifications model
const { getIoInstance } = require("../../config/socket.io.js");
const multer = require("multer");

// Multer config
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadImageToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "notifications" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(new Error("Failed to upload image to Cloudinary"));
        } else {
          resolve(result);
        }
      }
    );
    stream.end(file.buffer);
  });
};

// Admin creates a notification
exports.createNotification = async (req, res) => {
  const { title, description, url, name } = req.body;

  console.log("Request Body:", req.body);
  console.log("Uploaded File:", req.file);

  // Validate input fields
  if (!title || !description || !req.file || !url || !name) {
    return res.status(400).json({
      success: false,
      message: "All fields are required (including a logo)",
    });
  }

  try {
    // Upload logo to Cloudinary
    console.log("Uploading logo to Cloudinary...");
    const cloudinaryResult = await uploadImageToCloudinary(req.file);
    console.log("Cloudinary Upload Response:", cloudinaryResult);
    const logoUrl = cloudinaryResult.secure_url;

    // Create and save the new notification
    const newNotification = new Notifications({
      title,
      name,
      description,
      logo: logoUrl,
      url,
    });

    console.log("Saving notification to database:", newNotification);
    await newNotification.save();
    console.log("Notification saved successfully");

    // Emit socket event
    const io = getIoInstance();
    io.emit("notificationCreated", {
      message: "A new notification was created!",
      newNotification,
    });

    return res.status(201).json({
      message: "Notification created successfully",
      notification: newNotification,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      error: error.message,
      message: "Failed to create notification",
      success: false,
    });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Fetch the notifications with pagination
    const notifications = await Notifications.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({createdAt: - 1})

    const totalNotifications = await Notifications.countDocuments();

    // Check if there are no notifications
    if (notifications.length === 0) {
      return res.status(404).json({
        message: "No notifications found",
        success: false,
        notifications: [],
        totalNotifications: totalNotifications,
      });
    }

    // Return notifications and pagination information
    return res.status(200).json({
      message: "Notifications fetched successfully",
      success: true,
      notifications: notifications,
      totalNotifications: totalNotifications,
      totalPages: Math.ceil(totalNotifications / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    return res.status(500).json({
      error: error.message,
      message: "Failed to fetch notifications",
      success: false,
    });
  }
};


exports.deleteNotification = async (req, res) => {
    try {
      await Notifications.deleteMany({});
      res.status(200).json({ message: "All notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "An error occurred while deleting notification" });
    }
  };
