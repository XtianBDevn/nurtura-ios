export default {
  providers: [
    {
      domain:
        process.env.CONVEX_SITE_URL ??
        process.env.EXPO_PUBLIC_CONVEX_SITE_URL ??
        "https://successful-shrimp-557.convex.site",
      applicationID: "convex",
    },
  ],
};
