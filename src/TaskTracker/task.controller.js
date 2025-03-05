import Task from "./task.schema.js";
import { ErrorHandler } from "../../utils/errorHandler.js";
export const createTask = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const task = new Task({ user: userId, ...req.body });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const { priority, status, sortBy, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    let query = { user: userId };
    // Convert page and limit to numbers
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // let query = {};
    let sort = { createdAt: -1 };

    if (priority) query.priority = priority;
    if (status) query.status = status;

    if (sortBy) {
      switch (sortBy) {
        case "startTimeAsc":
          sort = { startTime: 1 };
          break;
        case "startTimeDesc":
          sort = { startTime: -1 };
          break;
        case "endTimeAsc":
          sort = { endTime: 1 };
          break;
        case "endTimeDesc":
          sort = { endTime: -1 };
          break;
      }
    }

    // Count total matching tasks (for pagination metadata)
    const totalTasks = await Task.countDocuments(query);

    // Fetch paginated tasks
    const tasks = await Task.find(query)
      .sort(sort)
      .skip((pageNumber - 1) * limitNumber) // Skip previous pages
      .limit(limitNumber); // Limit the number of tasks per request

    res.json({
      tasks,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const dashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const tasks = await Task.find({ user: userId }); // Fetch all tasks

    if (tasks.length === 0) {
      return res.json({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        averageTimePerTask: 0,
        pendingTasksSummary: {
          total: 0,
          totalTimeLapsed: 0,
          totalTimeToFinish: 0,
          priorityBreakdown: [1, 2, 3, 4, 5].map((priority) => ({
            priority,
            pendingTasks: 0,
            timeLapsed: 0,
            timeToFinish: 0,
          })),
        },
      });
    }

    // Total tasks
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) => task.status === "Finished"
    ).length;
    const pendingTasks = totalTasks - completedTasks;

    // Calculate average time per completed task
    const completedTaskTimes = tasks
      .filter((task) => task.status === "Finished")
      .map((task) => {
        const start = new Date(task.startTime);
        const end = new Date(task.endTime);
        return (end - start) / (1000 * 60 * 60); // Convert to hours
      });

    const averageTimePerTask =
      completedTaskTimes.length > 0
        ? completedTaskTimes.reduce((a, b) => a + b, 0) /
          completedTaskTimes.length
        : 0;

    // Priority breakdown for pending tasks
    const priorityBreakdown = [1, 2, 3, 4, 5].map((priority) => {
      const priorityPendingTasks = tasks.filter(
        (task) => task.priority === priority && task.status === "Pending"
      );

      const timeLapsed = priorityPendingTasks.reduce((total, task) => {
        const start = new Date(task.startTime);
        const now = new Date();
        return total + (now - start) / (1000 * 60 * 60); // Hours
      }, 0);

      let timeToFinish = priorityPendingTasks.reduce((total, task) => {
        // const start = new Date(task.startTime);
        const end = new Date(task.endTime);
        const now = new Date();

        return total + (end - now) / (1000 * 60 * 60); // Hours
      }, 0);
      if (timeToFinish < 0) {
        timeToFinish = 0;
      }
      return {
        priority,
        pendingTasks: priorityPendingTasks.length,
        timeLapsed: Math.round(timeLapsed),
        timeToFinish: Math.round(timeToFinish),
      };
    });

    const totalTimeLapsed = priorityBreakdown.reduce(
      (total, item) => total + item.timeLapsed,
      0
    );
    const totalTimeToFinish = priorityBreakdown.reduce(
      (total, item) => total + item.timeToFinish,
      0
    );

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      averageTimePerTask: Math.round(averageTimePerTask * 10) / 10,
      pendingTasksSummary: {
        total: pendingTasks,
        totalTimeLapsed: Math.round(totalTimeLapsed),
        totalTimeToFinish: Math.round(totalTimeToFinish),
        priorityBreakdown,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return next(new ErrorHandler(400, error));
  }
};
