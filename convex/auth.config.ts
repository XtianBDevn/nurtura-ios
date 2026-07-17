export default {
  providers: [
    {
      domain:
        process.env.CONVEX_SITE_URL ??
        process.env.EXPO_PUBLIC_CONVEX_SITE_URL ??
        "https://rugged-opossum-507.convex.site",
      applicationID: "convex",
    },
  ],
};
