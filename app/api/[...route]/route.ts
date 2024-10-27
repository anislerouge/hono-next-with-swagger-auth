import { handle } from "hono/vercel";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono, z } from "@hono/zod-openapi";
import { bearerAuth } from "hono/bearer-auth";

export const runtime = "edge";

const app = new OpenAPIHono().basePath("/api");
const referenceToken = "honoiscool";

app.get("/docs", swaggerUI({ url: "/api/doc" }));

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "Hono API",
    version: "v1",
  },
});


app.use("/*", bearerAuth({
  verifyToken: async (token, c) => {
    return token === referenceToken
  },
}));

app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  name: "Authorization",
  scheme: "bearer",
  in: "header",
  description: "Bearer token",
});


app.openapi(
  {
    path: "/hello",
    method: "get",
    summary: "Hello endpoint",
    security: [
      {
        bearerAuth: [],
      },
    ],
    description: "Returns a hello message",
    responses: {
      200: {
        description: "Responds with a greeting",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
    },
  },
  (c) => {
    return c.json({
      message: "Hello from Hono!",
    });
  }
);

export const GET = handle(app);