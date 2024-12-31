const { User } = require("../models/database");
const cloudinary = require("../bucket/cloudinary.js");

// Helper function to upload an image to Cloudinary
const uploadImageToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "stories" },
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

// Update stories for all users
exports.updateStory = async (req, res) => {
  const { text, reward } = req.body;

  // Validate required fields
  if (!text || !req.file || !reward) {
    return res.status(400).json({
      success: false,
      message: "All fields are required (text, story image, and story link)",
    });
  }

  try {
    // Upload image to Cloudinary
    const cloudinaryResult = await uploadImageToCloudinary(req.file);
    const image = cloudinaryResult.secure_url;

    // Update all users' stories
    const result = await User.updateMany(
      {},
      {
        $set: {
          "story.text": text,
          "story.image": image,
          "story.reward":reward,
          "story.hasShared": false,
        },
      }
    );

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Story updated successfully for all users",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    // Handle errors
    console.error("Error updating stories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update stories for all users",
      details: error.message,
    });
  }
};

exports.getStory = async (req, res) => {
  try {
    const { telegram_id } = req.params; // Assume user ID is passed in params

    // Find the user and return their story
    const user = await User.findOne({ telegram_id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.story);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch story" });
  }
};

exports.shareStory = async (req, res) => {
  try {
    const { telegram_id } = req.params; // Assume user ID is passed in params

    // Find the user and mark their story as shared
    const user = await User.findOne({ telegram_id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.story.hasShared = true;
    await user.save();

    res
      .status(200)
      .json({ message: "Story marked as shared", story: user.story });
  } catch (error) {
    res.status(500).json({ error: "Failed to share story" });
  }
};
