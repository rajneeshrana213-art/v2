
import { prisma } from "@/lib/prisma";
import { calculateDistance } from "./location-service";
import Logger from "../../utils/logger";

interface BusStop {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  location: string;
}

interface RouteOptimizationResult {
  optimizedStopOrder: string[];
  originalDistance: number;
  optimizedDistance: number;
  originalDuration: number;
  optimizedDuration: number;
  estimatedSavings: number;
  optimizationType: string;
}

export async function optimizeRouteShortestPath(routeId: string): Promise<RouteOptimizationResult> {
  const route = await prisma.route.findUnique({
    where: { id: routeId },
    include: {
      busStops: {
        orderBy: { createdAt: "asc" },
      },
      bus: true,
    },
  });

  if (!route || route.busStops.length < 2) {
    throw new Error("Route not found or has insufficient stops");
  }

  const stops = route.busStops.filter(
    (stop) => stop.latitude !== null && stop.longitude !== null
  ) as (BusStop & { latitude: number; longitude: number })[];

  if (stops.length < 2) {
    throw new Error("Route stops must have valid coordinates");
  }

  let originalDistance = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    originalDistance += calculateDistance(
      { latitude: stops[i].latitude!, longitude: stops[i].longitude! },
      { latitude: stops[i + 1].latitude!, longitude: stops[i + 1].longitude! }
    );
  }

  const optimizedOrder: string[] = [];
  const visited = new Set<string>();
  let currentStop = stops[0];
  optimizedOrder.push(currentStop.id);
  visited.add(currentStop.id);

  while (visited.size < stops.length) {
    let nearestStop: typeof currentStop | null = null;
    let nearestDistance = Infinity;

    for (const stop of stops) {
      if (!visited.has(stop.id)) {
        const distance = calculateDistance(
          { latitude: currentStop.latitude!, longitude: currentStop.longitude! },
          { latitude: stop.latitude!, longitude: stop.longitude! }
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestStop = stop;
        }
      }
    }

    if (nearestStop) {
      optimizedOrder.push(nearestStop.id);
      visited.add(nearestStop.id);
      currentStop = nearestStop;
    } else {
      break;
    }
  }

  let optimizedDistance = 0;
  for (let i = 0; i < optimizedOrder.length - 1; i++) {
    const stop1 = stops.find((s) => s.id === optimizedOrder[i])!;
    const stop2 = stops.find((s) => s.id === optimizedOrder[i + 1])!;
    optimizedDistance += calculateDistance(
      { latitude: stop1.latitude!, longitude: stop1.longitude! },
      { latitude: stop2.latitude!, longitude: stop2.longitude! }
    );
  }

  const originalDuration = Math.round((originalDistance / 1000 / 30) * 3600);
  const optimizedDuration = Math.round((optimizedDistance / 1000 / 30) * 3600);

  const estimatedSavings = originalDistance > 0
    ? ((originalDistance - optimizedDistance) / originalDistance) * 100
    : 0;

  return {
    optimizedStopOrder: optimizedOrder,
    originalDistance: originalDistance / 1000,
    optimizedDistance: optimizedDistance / 1000,
    originalDuration,
    optimizedDuration,
    estimatedSavings,
    optimizationType: "shortest_path",
  };
}

export async function optimizeRouteTimeBased(routeId: string): Promise<RouteOptimizationResult> {
  const route = await prisma.route.findUnique({
    where: { id: routeId },
    include: {
      busStops: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!route || route.busStops.length < 2) {
    throw new Error("Route not found or has insufficient stops");
  }

  return optimizeRouteShortestPath(routeId);
}

export async function optimizeRouteFuelEfficient(
  routeId: string,
  trafficConditions?: "light" | "moderate" | "heavy"
): Promise<RouteOptimizationResult> {
  const result = await optimizeRouteShortestPath(routeId);

  if (trafficConditions) {
    const trafficMultipliers = {
      light: 1.0,
      moderate: 1.3,
      heavy: 1.8,
    };

    result.optimizedDuration = Math.round(
      result.optimizedDuration * trafficMultipliers[trafficConditions]
    );
    result.originalDuration = Math.round(
      result.originalDuration * trafficMultipliers[trafficConditions]
    );
  }

  result.optimizationType = "fuel_efficient";
  return result;
}

export async function optimizeRouteTrafficAware(
  routeId: string,
  trafficData?: { [key: string]: "light" | "moderate" | "heavy" }
): Promise<RouteOptimizationResult> {
  const result = await optimizeRouteShortestPath(routeId);

  if (trafficData) {
    const trafficMultipliers = {
      light: 1.0,
      moderate: 1.3,
      heavy: 1.8,
    };

    const avgTraffic = Object.values(trafficData).reduce(
      (acc, val) => acc + (trafficMultipliers[val] || 1.0),
      0
    ) / Object.values(trafficData).length;

    result.optimizedDuration = Math.round(result.optimizedDuration * avgTraffic);
    result.originalDuration = Math.round(result.originalDuration * avgTraffic);
  }

  result.optimizationType = "traffic_aware";
  return result;
}

export async function saveRouteOptimization(
  routeId: string,
  optimizationResult: RouteOptimizationResult,
  trafficConditions?: string,
  weatherConditions?: string,
  appliedBy?: string
) {
  const route = await prisma.route.findUnique({
    where: { id: routeId },
  });

  if (!route) {
    throw new Error("Route not found");
  }

  return prisma.routeOptimization.create({
    data: {
      routeId,
      schoolId: route.schoolId,
      optimizationType: optimizationResult.optimizationType,
      originalDistance: optimizationResult.originalDistance,
      originalDuration: optimizationResult.originalDuration,
      originalStopCount: optimizationResult.optimizedStopOrder.length,
      optimizedDistance: optimizationResult.optimizedDistance,
      optimizedDuration: optimizationResult.optimizedDuration,
      optimizedStopOrder: optimizationResult.optimizedStopOrder as any,
      estimatedSavings: optimizationResult.estimatedSavings,
      trafficConditions: trafficConditions || null,
      weatherConditions: weatherConditions || null,
      isApplied: false,
      appliedBy: appliedBy || null,
    },
  });
}

export async function applyRouteOptimization(optimizationId: string, appliedBy: string) {
  const optimization = await prisma.routeOptimization.findUnique({
    where: { id: optimizationId },
    include: { route: true },
  });

  if (!optimization) {
    throw new Error("Optimization not found");
  }

  if (optimization.isApplied) {
    throw new Error("Optimization already applied");
  }

  await prisma.routeOptimization.update({
    where: { id: optimizationId },
    data: {
      isApplied: true,
      appliedAt: new Date(),
      appliedBy,
    },
  });

  Logger.info(`Route optimization ${optimizationId} applied to route ${optimization.routeId}`);

  return optimization;
}

export async function getRouteOptimizations(
  routeId?: string,
  schoolId?: string,
  isApplied?: boolean
) {
  const where: any = {};

  if (routeId) where.routeId = routeId;
  if (schoolId) where.schoolId = schoolId;
  if (isApplied !== undefined) where.isApplied = isApplied;

  return prisma.routeOptimization.findMany({
    where,
    include: {
      route: {
        include: {
          bus: true,
          busStops: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function optimizeMultipleStopsTSP(
  stopIds: string[],
  startStopId?: string,
  endStopId?: string
): Promise<string[]> {
  if (stopIds.length < 2) {
    return stopIds;
  }

  const stops = await prisma.busStop.findMany({
    where: { id: { in: stopIds } },
  });

  const validStops = stops.filter(
    (stop) => stop.latitude !== null && stop.longitude !== null
  ) as (BusStop & { latitude: number; longitude: number })[];

  if (validStops.length < 2) {
    throw new Error("Stops must have valid coordinates");
  }

  let order: string[] = [];
  const visited = new Set<string>();

  let currentStop = startStopId
    ? validStops.find((s) => s.id === startStopId) || validStops[0]
    : validStops[0];

  order.push(currentStop.id);
  visited.add(currentStop.id);

  while (visited.size < validStops.length) {
    let nearest: typeof currentStop | null = null;
    let nearestDist = Infinity;

    for (const stop of validStops) {
      if (!visited.has(stop.id) && stop.id !== endStopId) {
        const dist = calculateDistance(
          { latitude: currentStop.latitude!, longitude: currentStop.longitude! },
          { latitude: stop.latitude!, longitude: stop.longitude! }
        );
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = stop;
        }
      }
    }

    if (nearest) {
      order.push(nearest.id);
      visited.add(nearest.id);
      currentStop = nearest;
    } else {
      break;
    }
  }

  if (endStopId && !visited.has(endStopId)) {
    order.push(endStopId);
  }

  order = improveRoute2Opt(order, validStops);

  return order;
}

function improveRoute2Opt(order: string[], stops: (BusStop & { latitude: number; longitude: number })[]): string[] {
  let improved = true;
  let bestOrder = [...order];
  let bestDistance = calculateTotalDistance(bestOrder, stops);

  while (improved) {
    improved = false;

    for (let i = 0; i < bestOrder.length - 2; i++) {
      for (let j = i + 2; j < bestOrder.length; j++) {
        const newOrder = twoOptSwap(bestOrder, i, j);
        const newDistance = calculateTotalDistance(newOrder, stops);

        if (newDistance < bestDistance) {
          bestOrder = newOrder;
          bestDistance = newDistance;
          improved = true;
        }
      }
    }
  }

  return bestOrder;
}

function twoOptSwap(order: string[], i: number, j: number): string[] {
  const newOrder = [...order];
  const reversed = newOrder.slice(i, j + 1).reverse();
  newOrder.splice(i, j - i + 1, ...reversed);
  return newOrder;
}

function calculateTotalDistance(
  order: string[],
  stops: (BusStop & { latitude: number; longitude: number })[]
): number {
  let total = 0;
  for (let i = 0; i < order.length - 1; i++) {
    const stop1 = stops.find((s) => s.id === order[i])!;
    const stop2 = stops.find((s) => s.id === order[i + 1])!;
    total += calculateDistance(
      { latitude: stop1.latitude!, longitude: stop1.longitude! },
      { latitude: stop2.latitude!, longitude: stop2.longitude! }
    );
  }
  return total;
}
