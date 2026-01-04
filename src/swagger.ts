import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const openapi: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Assignment1 API",
      version: "1.0.0",
      description: "API documentation for posts, comments and auth",
      contacts: [
        {
          name: "Amit Mizrahi",
          email: "miamit112@gmail.com",
        },
        {
          name: "Gali Pascal",
          email: "galipacal4@gmail.com",
        },
      ],
    },
    servers: [
      {
        url: process.env.BASE_URL || "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT authorization header using the Bearer scheme",
        },
      },
      schemas: {
        User: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            _id: { type: "string", example: "64a7b2f4c25e4b6d5f8e4c3a" },
            name: { type: "string", example: "John Doe" },
            password: { type: "string", example: "strongPassword123" },
            email: {
              type: "string",
              format: "email",
              example: "john.doe@example.com",
            },
          },
        },
        Post: {
          type: "object",
          required: ["message", "sender"],
          properties: {
            _id: { type: "string", example: "64a7b2f4c25e4b6d5f8e4c3b" },
            message: { type: "string", example: "Hello, world!" },
            sender: {
              type: "string",
              description: "User ID of the post sender",
              example: "64a7b2f4c25e4b6d5f8e4c3a",
            },
          },
        },
        Comment: {
          type: "object",
          required: ["text", "postId", "sender"],
          properties: {
            _id: { type: "string", example: "64a7b2f4c25e4b6d5f8e4c3c" },
            text: { type: "string", example: "Nice post!" },
            postId: {
              type: "string",
              description: "ID of the post",
              example: "64a7b2f4c25e4b6d5f8e4c3b",
            },
            sender: {
              type: "string",
              description: "User ID of the comment sender",
              example: "64a7b2f4c25e4b6d5f8e4c3a",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              example: "password123",
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              example: "password123",
            },
            name: {
              type: "string",
              example: "John Doe",
            },
          },
        },
        RegisterResponse: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              description: "JWT access token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            refreshToken: {
              type: "string",
              description: "JWT refresh token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
          },
        },
        RefreshTokenRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
              description: "Valid refresh token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
              example: "An error occurred",
            },
            status: {
              type: "number",
              description: "HTTP status code",
              example: 400,
            },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Validation failed",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: {
                    type: "string",
                    example: "email",
                  },
                  message: {
                    type: "string",
                    example: "Invalid email format",
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                message: "Unauthorized: Invalid or missing token",
                status: 401,
              },
            },
          },
        },
        NotFoundError: {
          description: "The specified resource was not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                message: "Resource not found",
                status: 404,
              },
            },
          },
        },
        ValidationError: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ValidationError",
              },
            },
          },
        },
        ServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                message: "Internal server error",
                status: 500,
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "./src/routes/*.ts",
    "./src/controllers/*.ts",
    "./dist/src/routes/*.js",
    "./dist/src/controllers/*.js",
  ],
};

const specs = swaggerJsdoc(openapi);

export { specs, swaggerUi };
