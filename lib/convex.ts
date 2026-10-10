/**
 * Convex client configuration for React Native
 */
import { ConvexReactClient } from 'convex/react';
import { requireConvexUrl } from '@/lib/convexUrl';

const CONVEX_URL = requireConvexUrl();

export const convex = new ConvexReactClient(CONVEX_URL);
