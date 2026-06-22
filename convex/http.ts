import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Register Convex Auth HTTP routes (handles sign-in/sign-out/callback)
auth.addHttpRoutes(http);

export default http;
