/**
 * Convex injects CONVEX_SITE_URL on the deployment. Do not fall back to a
 * hardcoded site URL, or tokens will be checked against the wrong deployment.
 */
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
