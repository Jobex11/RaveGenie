const Ranks = require("../models/ranks.js");

// Fetch all ranks
exports.getRanks = async (req, res) => {
  try {
    const ranks = await Ranks.find();
    res
      .status(200)
      .json({ success: true, data: ranks, message: "Rank fetched " });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch ranks." });
  }
};

// Update a rank
exports.updateRank = async (req, res) => {
  const { id } = req.params; // Rank document ID
  const { rank, rankRange } = req.body; // Updated rank details

  try {
    const updatedRank = await Ranks.findByIdAndUpdate(
      id,
      { rank, rankRange },
      { new: true, runValidators: true }
    );

    if (!updatedRank) {
      return res.status(404).json({ success: false, error: "Rank not found." });
    }

    res
      .status(200)
      .json({
        success: true,
        data: updatedRank,
        message: "Rank updated successfully",
      });
  } catch (error) {
    res.status(400).json({ success: false, error: "Failed to update rank." });
  }
};
