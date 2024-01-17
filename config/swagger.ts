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
    servers: [
      {
        url: "http://localhost:4000/api/v1",
      },
    ],
  },
  apis: ["./dist/routes/v1/*.js"],
};
