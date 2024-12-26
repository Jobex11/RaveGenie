const WealthClasses = require("../../models/wealthclass");

exports.addWealthClasses = async (req, res) => {
    const {
        name,
        minRank,
        maxRank,
        requiredCards,
        sharesReward,
        additionalRewards,
    } = req.body;

    try {
        const wealthClass = new WealthClasses({
            name,
            minRank,
            maxRank,
            requiredCards,
            sharesReward,
            additionalRewards,
        });
        await wealthClass.save();
        res.status(201).json(wealthClass);
    } catch (error) {
        res.status(400).json({ error: "Failed to add wealth class" });
    }
};

exports.getWealthClases = async (req, res) => {
    try {
        const wealthClasses = await WealthClasses.find();
        res
            .status(200)
            .json({
                success: true,
                data: wealthClasses,
                message: "Wealth Classes fetched ",
            });
    } catch (error) {
        res
            .status(500)
            .json({ success: false, error: "Failed to fetch Wealth Classes." });
    }
};

exports.editWealthClasses = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const updatedWealthClass = await WealthClasses.findByIdAndUpdate(
            id,
            updates,
            { new: true }
        );
        if (!updatedWealthClass)
            return res.status(404).json({ error: "Wealth class not found" });
        res.status(200).json(updatedWealthClass);
    } catch (error) {
        res.status(400).json({ error: "Failed to update wealth class" });
    }
};

exports.deleteWealthClasses = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedWealthClass = await WealthClasses.findByIdAndDelete(id);
        if (!deletedWealthClass)
            return res.status(404).json({ error: "Wealth class not found" });
        res.status(200).json({ message: "Wealth class deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: "Failed to delete wealth class" });
    }
};
