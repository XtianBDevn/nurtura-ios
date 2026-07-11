/**
 * Convex client configuration for React Native
 */
import { ConvexReactClient } from 'convex/react';

// The Convex deployment URL — set in .env or app.json extra
const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL || 'https://successful-shrimp-557.convex.cloud';

export const convex = new ConvexReactClient(CONVEX_URL);
