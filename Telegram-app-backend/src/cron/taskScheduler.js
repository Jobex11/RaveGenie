const cron = require("node-cron");
const Tasks = require("../models/tasks");

cron.schedule("*/1 * * * *", async () => {
  const now = Date.now();
  const tasks = await Tasks.find();

  for (const task of tasks) {
    const taskCreatedTime = new Date(task.createdAt).getTime();
    const remainingTime =
      task.countdown - Math.floor((now - taskCreatedTime) / 1000);

    if (task.taskType === "one-time" && remainingTime <= 0) {
      await Tasks.findByIdAndDelete(task._id);
      console.log(`Deleted expired one-time task: ${task.title}`);
    }
  }
});
