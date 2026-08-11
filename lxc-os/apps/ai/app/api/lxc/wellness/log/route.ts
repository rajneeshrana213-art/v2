/**
 * Module 15 — Emotional Intelligence & Wellness Log (Alias)
 * Re-exports wellness POST handler to ensure full endpoint availability.
 */

import { POST as wellnessPOST } from '../route';
export const POST = wellnessPOST;
