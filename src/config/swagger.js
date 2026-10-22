import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Fixora API",
      version: "1.0.0",
      description: "API documentation for the Fixora service marketplace.",
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
      {
        url: "https://fixora-backend-1.onrender.com",
        description: "Production server",
      },
    ],

    tags: [
      {
        name: "Jobs",
        description: "Job management and status updates",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      schemas: {
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Invalid job ID",
            },
          },
        },

        Job: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "671a2b3c4d5e6f7890123456",
            },

            service: {
              type: "string",
              example: "plumbing",
            },

            description: {
              type: "string",
              example: "Repair a leaking kitchen tap",
            },

            location: {
              type: "string",
              example: "Lagos, Nigeria",
            },

            price: {
              type: "number",
              example: 15000,
            },

            status: {
              type: "string",
              enum: [
                "requested",
                "accepted",
                "in_progress",
                "awaiting_confirmation",
                "completed",
                "cancel",
              ],
              example: "accepted",
            },

            customer: {
              type: "object",
              properties: {
                _id: {
                  type: "string",
                  example: "671a2b3c4d5e6f7890123457",
                },
                name: {
                  type: "string",
                  example: "John Doe",
                },
              },
            },

            provider: {
              type: "object",
              nullable: true,
              properties: {
                _id: {
                  type: "string",
                  example: "671a2b3c4d5e6f7890123458",
                },
                name: {
                  type: "string",
                  example: "Alex Smith",
                },
              },
            },
          },
        },
      },
    },
  },

  apis: ["./src/Routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
