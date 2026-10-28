import mongoose, { isValidObjectId } from "mongoose";
import Job, { job_categories } from "../models/jobsModel.js";

// create jobs
export const CreateJobs = async (req, res, next) => {
  try {
    const { service, description, price, location, category } = req.body;

    if (!service || !description || !price || !location || !category) {
      return res
        .status(400)
        .json({ message: "please fill the required fields" });
    }

    const job = await Job.create({
      customer: req.user._id,
      service,
      description,
      price,
      location,
      category,
    });
    res.status(201).json({ message: "job created successfully", data: job });
  } catch (error) {
    next(error);
  }
};

// get available jobs
export const getAvailableJobs = async (req, res, next) => {
  try {
    const { page, limit, skip } = req.pagination;

    const jobs = await Job.find({
      status: "requested",
      provider: null,
    })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalJobs = await Job.countDocuments({
      status: "requested",
      provider: null,
    });

    // console.log("pagination:", req.pagination);

    // console.log(
    //   "available jobs:",
    //   await Job.countDocuments({
    //     status: "requested",
    //     provider: null,
    //   }),
    // );

    res.status(200).json({
      message: "Available jobs fetched successfully",
      jobs,
      pagination: {
        limit,
        totalJobs,
        page,
        totalPages: Math.ceil(totalJobs / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// get single job
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params._id);

    if (!job) {
      return res.status(404).json({ message: "This job does not exist" });
    }

    res.status(200).json({ message: "Job fetched successfully", job });
  } catch (error) {
    next();
  }
};

// get customer jobs by customer id

export const getCustomersJob = async (req, res, next) => {
  try {
    const job = await Job.find({
      customer: req.user._id,
    });

    res.status(200).json({ message: "your jobs fetched successfully", job });
  } catch (error) {
    next(error);
  }
};

export const getProviderJobs = async (req, res, next) => {
  try {
    const providerId = req.user?.userId ?? req.user?._id;

    if (!providerId) {
      return res.status(401).json({
        message: "Authenticated provider ID is missing",
      });
    }

    if (req.user?.role !== "provider") {
      return res.status(403).json({
        message: "Only providers can access their jobs",
      });
    }

    const jobs = await Job.find({
      provider: providerId,
      status: {
        $in: ["accepted", "in_progress", "awaiting_confirmation"],
      },
    })
      .populate("customer", "name")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      message: "Provider jobs fetched successfully",
      jobs,
    });
  } catch (error) {
    console.error("getProviderJobs error:", error);
    next(error);
  }
};

// get job categories only
export const getJobCategories = (req, res) => {
  return res.status(200).json({
    categories: job_categories,
  });
};

// get job by category
export const getJobByCategory = async (req, res, next) => {
  try {
    const { page, limit, skip } = req.pagination;

    const category = req.params.category.toLowerCase();

    const validCategories = Job.schema.path("category").enumValues;

    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid job category" });
    }

    const jobs = await Job.find({
      status: "requested",
      category,
      provider: null,
    })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: " jobs fetched successfully",
      data: jobs,
      success: true,
      pagination: {
        page,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// accept job status

export const acceptJob = async (req, res, next) => {
  try {
    //1.  get job id
    const { id } = req.params;

    // check if the logged in user is a provider
    if (req.user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "only providers can accept job", success: false });
    }

    // find the job if the logged in user is a provider
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: "job not found" });
    }

    if (job.status !== "requested") {
      return res.status(400).json({
        success: false,
        message: `Cannot accept a job with status: ${job.status}`,
      });
    }

    // change job status to accepted
    job.status = "accepted";

    //  Assign the provider to the job
    job.provider = req.user._id;

    //  Save the changes
    await job.save();

    return res.status(200).json({
      success: true,
      message: "Job accepted successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};

// job in progress
export const JobInProgress = async (req, res, next) => {
  try {
    // check if the logged in user is a provider
    if (req.user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "only providers can accept job", success: false });
    }

    const { id } = req.params;

    // find the job if the logged in user is a provider
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: "job not found" });
    }

    // check if job already sxist

    if (job.status !== "accepted") {
      return res.status(400).json({
        message: `job cannot be in progress because it is ${job.status}`,
      });
    }

    if (job.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the customer who created this job can cancel it",
      });
    }

    job.status = "in_progress";

    job.provider = req.user._id;

    await job.save();

    return res.status(200).json({
      success: true,
      message: "Job in progress",
      job,
    });
  } catch (error) {
    next(error);
  }
};

// job in review
export const reviewJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Only providers can set jobs for review
    if (req.user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message: "Only providers can set jobs for reviewing",
      });
    }

    // Find the job
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Ensure the job is in progress
    if (job.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Only jobs in progress can be updated to review",
      });
    }

    // Ensure this provider owns the job
    if (job.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only set jobs assigned to you for review",
      });
    }

    // Update the status
    job.status = "awaiting_confirmation";

    await job.save();

    return res.status(200).json({
      success: true,
      message: "Job marked as  awaiting_confirmation",
      job,
    });
  } catch (error) {
    next(error);
  }
};

// completed job
export const completeJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Only customers can confirm completed jobs
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can confirm completed jobs",
      });
    }

    // Find the job
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Ensure the job is reviewed
    if (job.status !== "awaiting_confirmation") {
      return res.status(400).json({
        success: false,
        message: "Only reviewed andz jobs can be completed",
      });
    }

    // Ensure this customer owns the job
    if (job.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only confirm the completion your own jobs",
      });
    }

    // Update the status
    job.status = "completed";

    await job.save();

    return res.status(200).json({
      success: true,
      message: "completed successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};

// cancel jobs status
export const cancelJob = async (req, res, next) => {
  try {
    // Only customers can cancelled
    //  jobs
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can cancel jobs",
      });
    }

    const { id } = req.params;

    // Find the job
    const job = await Job.findById(id);

    // if not job
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // validate that only the customer who created the job can cancelled
    //  it
    if (job.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the customer who created this job can cancel it",
      });
    }

    // A job can only be cancelled
    // led if its status is requested
    if (job.status !== "requested") {
      return res.status(400).json({
        success: false,
        message: "Only requested jobs can be cancelled",
      });
    }

    // Update the job status
    job.status = "cancelled";

    await job.save();

    return res.status(200).json({
      success: true,
      message: "Job cancelled successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};

export const ChangeProviderJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Get the authenticated provider's ID.
    // Your JWT contains { userId }, so support that property.
    const userId = req.user?.userId ?? req.user?._id;

    // Only providers can update provider job statuses.
    if (req.user?.role !== "provider") {
      return res.status(403).json({
        message: "Only providers can perform this action",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "Authenticated provider ID is missing",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    // Allowed provider status transitions.
    const transitions = {
      accepted: "requested",
      in_progress: "accepted",
      awaiting_confirmation: "in_progress",
    };

    if (!Object.hasOwn(transitions, status)) {
      return res.status(400).json({
        message: "Invalid provider status",
      });
    }

    // Match the expected previous status and enforce ownership.
    const filter = {
      _id: id,
      status: transitions[status],
      ...(status === "accepted" ? { provider: null } : { provider: userId }),
    };

    // Assign the provider when accepting; otherwise only change status.
    const update = {
      $set: {
        status,
        ...(status === "accepted" ? { provider: userId } : {}),
      },
    };

    const job = await Job.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true,
    })
      .populate("customer", "name")
      .populate("provider", "name");

    if (!job) {
      const existingJob = await Job.findById(id);

      if (!existingJob) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      return res.status(409).json({
        message:
          "Job cannot be updated. It may already be assigned, or its current status does not allow this transition.",
      });
    }

    return res.status(200).json({
      message: "Job status updated successfully",
      job,
    });
  } catch (error) {
    console.error("ChangeProviderJobStatus error:", error);
    next(error);
  }
};

export const changeCustomerJobSatatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    // 1. Verify customer role
    if (req.user.role !== "customer") {
      return res.status(403).json({
        message: "Only customers can perform this action",
      });
    }

    // 2. Validate job ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    // 3. Define permitted status transitions
    const transitions = {
      completed: "awaiting_confirmation",
      cancelled: "requested",
    };

    // 4. Validate requested status
    if (typeof status !== "string" || !Object.hasOwn(transitions, status)) {
      return res.status(400).json({
        message: "Invalid customer status",
      });
    }

    // 5. Ensure the authenticated customer owns the job
    const filter = {
      _id: id,
      status: transitions[status],
      customer: userId,
    };

    // 6. Update job status
    const update = {
      $set: {
        status,
      },
    };

    const job = await Job.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true,
    })
      .populate("customer", "name")
      .populate("provider", "name");

    // 7. Handle unsuccessful update
    if (!job) {
      const existingJob = await Job.findById(id);

      if (!existingJob) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      return res.status(409).json({
        message:
          "Job cannot be updated because you do not own it or its current status does not permit this transition",
      });
    }

    // 8. Return updated job
    return res.status(200).json({
      message: "Job status updated successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};

// export const changeJobStatus = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const userId = String(req.user._id);

//     const { role } = req.user;

//     if (!isValidObjectId(id)) {
//       return res.status(400).json({ message: "invalid id" });
//     }

//     const allowedStatuses = [
//       "accepted",
//       "in_progress",
//       "awaiting_confirmation",
//       "completed",
//       "cancelled",
//     ];

//     if (!allowedStatuses.includes(status)) {
//       return res.status(400).json({ message: "invalid status" });
//     }

//     const job = await Job.findById(id);

//     if (!job) {
//       return res.status(404).json({ message: "not found" });
//     }

//     let filter;

//     let update;

//     // label Customer Allowed Status Change

//     if (role === "customer") {
//       if (String(job.customer !== userId)) {
//         return res
//           .status(403)
//           .json({ message: "you are not authorised to modify this job" });
//       }
//     }

//     if (status !== "cancelled") {
//       return res
//         .status(403)
//         .json({ message: "customers can only can cancel job" });
//     }

//     if (job.status !== "requested") {
//       return res
//         .status(400)
//         .json({ message: "only requested jobs can be cancelled" });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

// get job

// update jobs
// export const updateJob = async (req, res, next) => {
//   try {
//     const job = await Job.findByIdAndUpdate(req.params._id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!job) {
//       return res.status(404).json({ message: "job not found" });
//     }
//     res.status(200).json({ message: "job updated successfully", job });
//   } catch (error) {
//     next(error);
//   }
// };

// delete jobs
// export const deleteJob = async (req, res, next) => {
//   try {
//     const job = await Job.findByIdAndDelete(req.params._id);

//     if (!job) {
//       return res.status(404).json({ message: "job not found" });
//     }
//     res.status(204).json({ message: "job deleted successfully", job });
//   } catch (error) {
//     next(error);
//   }
// };

//
