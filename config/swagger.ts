export const swaggerOptions = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "WEO API",
      version: "1.0.0",
      description: "This is a weo application api documented with Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "weo global",
        url: "https://weo.ai",
        email: "admin@weo.ai",
      },
    },
    components: {
      securitySchemes: {
        Authorization: {
          type: "http",
          scheme: "bearer",
          // bearerFormat: "JWT",
          // value: "Bearer <JWT token here>",
        },
      },
    },
    servers: [
      {
        url: "http://localhost:4000/api/v1",
      },
    ],
  },
  apis: ["./dist/routes/v1/*.js"],
};

export const swaggerOptionsV2 = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "WEO API",
      version: "2.0.0",
      description: "This is a weo application api documented with Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "weo global",
        url: "https://weo.ai",
        email: "admin@weo.ai",
      },
    },
    components: {
      securitySchemes: {
        Authorization: {
          type: "http",
          scheme: "bearer",
          // bearerFormat: "JWT",
          // value: "Bearer <JWT token here>",
        },
      },
    },
    servers: [
      {
        url: "http://localhost:4000/api/v2",
      },
    ],
  },
  apis: ["./dist/routes/v2/*.js"],
};
