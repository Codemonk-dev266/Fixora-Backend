import express from "express";

import authMiddleWare from "../middleWare/authMiddleware.js";

import {
  acceptJob,
  cancelJob,
  changeCustomerJobSatatus,
  ChangeProviderJobStatus,
  completeJob,
  CreateJobs,
  getAvailableJobs,
  getCustomersJob,
  getJobByCategory,
  getJobById,
  getJobCategories,
  getProviderJobs,
  JobInProgress,
  reviewJob,
} from "../controllers/jobsController.js";

import pagination from "../middleWare/pagination.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Jobs
 *     description: Fixora job marketplace endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "6a881447c8a876a28b8e5ad4"
 *         customer:
 *           type: string
 *           description: MongoDB ID of the customer who created the job
 *           example: "6a881447c8a876a28b8e5ad5"
 *         provider:
 *           type: string
 *           nullable: true
 *           description: MongoDB ID of the provider assigned to the job
 *           example: null
 *         service:
 *           type: string
 *           example: "Plumbing"
 *         description:
 *           type: string
 *           example: "Repair a leaking kitchen pipe"
 *         price:
 *           type: number
 *           minimum: 0
 *           example: 15000
 *         location:
 *           type: string
 *           example: "Abuja, Nigeria"
 *         status:
 *           type: string
 *           enum:
 *             - requested
 *             - accepted
 *             - in_progress
 *             - awaiting_confirmation
 *             - completed
 *             - cancelled
 *           example: requested
 *
 *     JobResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Job accepted successfully"
 *         job:
 *           $ref: '#/components/schemas/Job'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Job not found"
 */

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job
 *     description: >
 *       Creates a new job for the authenticated customer.
 *       The customer's ID is obtained from the authentication token.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service
 *               - description
 *               - price
 *               - location
 *               - category
 *             properties:
 *               service:
 *                 type: string
 *                 description: Name of the service required.
 *                 example: Plumbing
 *               description:
 *                 type: string
 *                 description: Details about the job.
 *                 example: Repair a leaking kitchen sink.
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Proposed price for the job.
 *                 example: 15000
 *               location:
 *                 type: string
 *                 description: Location where the service is required.
 *                 example: Abuja, Nigeria
 *               category:
 *                 type: string
 *                 description: Category the job belongs to.
 *                 example: plumbing
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: job created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Required fields are missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: please fill the required fields
 *       401:
 *         description: Authentication token is missing or invalid
 *       500:
 *         description: Internal server error
 */
router.post("/", authMiddleWare, CreateJobs);

/**
 * @swagger
 * /api/jobs/available_jobs:
 *   get:
 *     summary: Get available jobs
 *     description: Returns requested jobs that have not been assigned to a provider.
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 5
 *         description: Number of jobs per page
 *     responses:
 *       200:
 *         description: Available jobs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Available jobs fetched successfully"
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                       example: 5
 *                     totalJobs:
 *                       type: integer
 *                       example: 23
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *       500:
 *         description: Internal server error
 */
router.get("/available_jobs", pagination, getAvailableJobs);

/**
 * @swagger
 * /api/jobs/categories:
 *   get:
 *     summary: Get all job categories
 *     description: Returns all available service categories supported by Fixora.
 *     tags:
 *       - Jobs
 *     responses:
 *       200:
 *         description: Job categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - categories
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *                     enum:
 *                       - plumbing
 *                       - typing
 *                       - electricals
 *                       - cleaning
 *                       - painting
 *                       - carpentry
 *                       - writing
 *                       - laundry
 *                       - tutoring
 *                       - gardening
 *                       - other
 *                   example:
 *                     - plumbing
 *                     - typing
 *                     - electricals
 *                     - cleaning
 *                     - painting
 *                     - carpentry
 *                     - writing
 *                     - laundry
 *                     - tutoring
 *                     - gardening
 *                     - other
 */
router.get("/categories", getJobCategories);

/**
 * @swagger
 * /api/jobs/category/{category}:
 *   get:
 *     summary: Get available jobs by category
 *     description: >
 *       Retrieves jobs belonging to a specific category.
 *       Only jobs with requested status and no assigned provider are returned.
 *       Results are sorted by creation date, newest first, and support pagination.
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         description: >
 *           Category of jobs to retrieve. Must match one of the category
 *           values defined in the Job model. The value is converted to lowercase.
 *         schema:
 *           type: string
 *         example: plumbing
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number to retrieve.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of jobs per page.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 5
 *         example: 5
 *     responses:
 *       200:
 *         description: Jobs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: " jobs fetched successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 5
 *       400:
 *         description: Invalid job category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid job category"
 *       500:
 *         description: Internal server error
 */
router.get("/category/:category", pagination, getJobByCategory);

/**
 * @swagger
 * /api/jobs/available_jobs/{_id}:
 *   get:
 *     summary: Get a job by ID
 *     description: Retrieves one job using its MongoDB document ID.
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the job
 *         example: "6a881447c8a876a28b8e5ad4"
 *     responses:
 *       200:
 *         description: Job fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Job fetched successfully"
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job does not exist
 *       500:
 *         description: Internal server error
 */
router.get("/available_jobs/:id", getJobById);

/**
 * @swagger
 * /api/jobs/my_jobs:
 *   get:
 *     summary: Get the authenticated customer's jobs
 *     description: Retrieves all jobs created by the logged-in customer.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer jobs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "your jobs fetched successfully"
 *                 job:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */
router.get("/my_jobs", authMiddleWare, getCustomersJob);

/**
 * @swagger
 * /api/jobs/provider/my_jobs:
 *   get:
 *     summary: Get jobs assigned to the authenticated provider
 *     description: |
 *       Retrieves all jobs assigned to the currently authenticated provider,
 *       ordered by creation date from newest to oldest.
 *
 *       Requires a valid JWT token and provider authentication.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Provider jobs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - jobs
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Provider jobs fetched successfully
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *       "401":
 *         description: Authentication required or JWT token is invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Unauthorized
 *       "403":
 *         description: User does not have provider permissions
 *       "500":
 *         description: Internal server error
 */
router.get("/provider/my_jobs", authMiddleWare, getProviderJobs);

/**
 * @swagger
 * /api/jobs/{id}/update_job_to_accepted:
 *   patch:
 *     summary: Accept a job
 *     description: Allows a provider to accept a requested job and assign it to themselves.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the job
 *     responses:
 *       200:
 *         description: Job accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobResponse'
 *       400:
 *         description: Job is not in requested status
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only providers can accept jobs
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/update_job_to_accepted", authMiddleWare, acceptJob);

/**
 * @swagger
 * /api/jobs/{id}/update_job_to_in_progress:
 *   patch:
 *     summary: Move a job to in progress
 *     description: Allows the assigned provider to start an accepted job.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the job
 *     responses:
 *       200:
 *         description: Job moved to in progress successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobResponse'
 *       400:
 *         description: Job is not in accepted status
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only the assigned provider can start the job
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/update_job_to_in_progress", authMiddleWare, JobInProgress);

/**
 * @swagger
 * /api/jobs/{id}/update_job_to_in_review:
 *   patch:
 *     summary: Submit a job for customer confirmation
 *     description: Allows the assigned provider to submit an in-progress job for confirmation.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the job
 *     responses:
 *       200:
 *         description: Job submitted for confirmation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobResponse'
 *       400:
 *         description: Job is not in progress
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only the assigned provider can submit the job
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/update_job_to_in_review", authMiddleWare, reviewJob);

/**
 * @swagger
 * /api/jobs/{id}/update_job_to_completed:
 *   patch:
 *     summary: Confirm job completion
 *     description: Allows the customer who created the job to confirm it after the provider submits it for confirmation.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the job
 *     responses:
 *       200:
 *         description: Job completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobResponse'
 *       400:
 *         description: Job is not awaiting confirmation
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only the customer who created the job can confirm it
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/update_job_to_completed", authMiddleWare, completeJob);

/**
 * @swagger
 * /api/jobs/{id}/update_job_to_cancelled:
 *   patch:
 *     summary: Cancel a job
 *     description: Allows the customer who created a job to cancel it while its status is requested.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the job
 *     responses:
 *       200:
 *         description: Job cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobResponse'
 *       400:
 *         description: Only requested jobs can be cancelled
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only the customer who created the job can cancel it
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/update_job_to_cancelled", authMiddleWare, cancelJob);

/**
 * @swagger
 * /api/jobs/{id}/provider-status:
 *   patch:
 *     summary: Update job status as a provider
 *     tags: [Jobs]
 *     description: |
 *       Allows an authenticated provider to update a job's status.
 *
 *       Permitted transitions:
 *       - requested -> accepted
 *       - accepted -> in_progress
 *       - in_progress -> awaiting_confirmation
 *
 *       Accepting a job automatically assigns it to the provider.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the job
 *         schema:
 *           type: string
 *         example: "671a2b3c4d5e6f7890123456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - accepted
 *                   - in_progress
 *                   - awaiting_confirmation
 *                 example: accepted
 *     responses:
 *       "200":
 *         description: Job status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: status updated successfully
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *
 *       "400":
 *         description: Invalid job ID or provider status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidId:
 *                 value:
 *                   message: invalid Id
 *               invalidStatus:
 *                 value:
 *                   message: invalid provider status
 *
 *       "401":
 *         description: Authentication required or token invalid
 *
 *       "403":
 *         description: Only providers can perform this action
 *
 *       "404":
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: job not found
 *
 *       "409":
 *         description: Job is unavailable or its current status does not permit the transition
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: job is unavailable, has been assigned to another provider or has an invalid transition status
 *
 *       "500":
 *         description: Internal server error
 */

router.patch("/:id/provider-status", authMiddleWare, ChangeProviderJobStatus);

/**
 * @swagger
 * /api/jobs/{id}/customer-status:
 *   patch:
 *     summary: Update job status as a customer
 *     tags: [Jobs]
 *     description: |
 *       Allows an authenticated customer to update the status of a job
 *       that belongs to them.
 *
 *       Permitted transitions:
 *       - awaiting_confirmation -> completed
 *       - requested -> cancelled
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the job
 *         schema:
 *           type: string
 *         example: "671a2b3c4d5e6f7890123456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - completed
 *                   - cancelled
 *                 example: completed
 *     responses:
 *       "200":
 *         description: Job status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Job status updated successfully
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *
 *       "400":
 *         description: Invalid job ID or customer status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidId:
 *                 value:
 *                   message: Invalid job ID
 *               invalidStatus:
 *                 value:
 *                   message: Invalid customer status
 *
 *       "401":
 *         description: Authentication required or token invalid
 *
 *       "403":
 *         description: Only customers can perform this action
 *
 *       "404":
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Job not found
 *
 *       "409":
 *         description: Customer does not own the job or the current status does not permit the transition
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Job cannot be updated because you do not own it or its current status does not permit this transition
 *
 *       "500":
 *         description: Internal server error
 */
router.patch("/:id/customer-status", authMiddleWare, changeCustomerJobSatatus);

export default router;
