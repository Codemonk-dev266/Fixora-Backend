import Job from "../models/jobsModel.js";

// create jobs
export const CreateJobs = async (req, res, next) => {
  try {
    const { service, description, price, location } = req.body;

    if (!service || !description || !price || !location) {
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

    const totalJobs = await Job.countDocuments();

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

    if (job.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "unAuthorized" });
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
    // Only customers can cancel jobs
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

    // validate that only the customer who created the job can cancel it
    if (job.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the customer who created this job can cancel it",
      });
    }

    // A job can only be cancelled if its status is requested
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
