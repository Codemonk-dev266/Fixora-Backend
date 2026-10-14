import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Fixora API Configuration",
      version: "1.0.0",
      description: "API documentation for the Fixora service marketplace",
    },

    servers: [
  {
    url: "https://fixora-backend-1.onrender.com",
    description: "Fixora production server",
  },
  {
    url: "http://localhost:5000",
    description: "Local development server",
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
    },
  },

  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;