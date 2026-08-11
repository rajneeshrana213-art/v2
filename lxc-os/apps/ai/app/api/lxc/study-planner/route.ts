/**
 * Module 1 — AI Study Planner (Alias)
 * Re-exports optimized study-roadmap handler to ensure full endpoint availability.
 */

import { POST as roadmapPOST } from '../study-roadmap/route';
export const POST = roadmapPOST;
