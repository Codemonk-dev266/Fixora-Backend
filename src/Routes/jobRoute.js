import express from "express";
import authMiddleWare from "../middleWare/authMiddleware.js";
import {
  acceptJob,
  cancelJob,
  completeJob,
  CreateJobs,
  getAvailableJobs,
  getCustomersJob,
  getJobById,
  JobInProgress,
  reviewJob,
} from "../controllers/jobsController.js";
import pagination from "../middleWare/pagination.js";



const router = express.Router();

router.post("/", authMiddleWare, CreateJobs);

router.get("/available_jobs", pagination, getAvailableJobs);

router.get("/available_jobs/:_id", getJobById);

router.get("/my_jobs", authMiddleWare, getCustomersJob);

router.patch("/:id/update_job_to_accepted", authMiddleWare, acceptJob);

router.patch("/:id/update_job_to_in_progress", authMiddleWare, JobInProgress);

router.patch("/:id/update_job_to_in_review", authMiddleWare, reviewJob);

router.patch("/:id/update_job_to_completed", authMiddleWare, completeJob);

router.patch("/:id/update_job_to_cancelled", authMiddleWare, cancelJob);

// router.patch("/available_jobs/:_id", authMiddleWare, updateJob);

// router.delete("/available_jobs/:_id", authMiddleWare, deleteJob);

export default router;
