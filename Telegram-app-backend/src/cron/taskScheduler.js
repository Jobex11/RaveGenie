const cron = require("node-cron");
const Tasks = require("../models/tasks");

let isProcessing = false;

cron.schedule("* * * * *", async () => {
  if (isProcessing) return;

  isProcessing = true;

  try {
    const now = Date.now();
    const tasksToExpire = await Tasks.updateMany(
      {
        isExpired: false,
        createdAt: { $lte: new Date(now - 1000 * 60 * 60 * 24) }, // Example: 24-hour countdown
      },
      { $set: { isExpired: true } }
    );

    console.log(`${tasksToExpire.modifiedCount} tasks marked as expired.`);
  } catch (error) {
    console.error("Error checking expired tasks:", error.message);
  } finally {
    isProcessing = false;
  }
});
