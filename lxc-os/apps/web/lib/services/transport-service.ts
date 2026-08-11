import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/config/upload";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// --- Bus Service ---
export const BusService = {
  create: async (data: { busNumber: string; capacity: number; schoolId: string }) => {
    return prisma.bus.create({ data });
  },

  getAll: async (schoolId?: string) => {
    const where = schoolId ? { schoolId } : {};
    return prisma.bus.findMany({
      where,
      include: {
        school: true,
        drivers: {
          include: {
            user: { select: { id: true, name: true, phone: true } }
          }
        },
        _count: { select: { routes: true } }
      }
    });
  },

  getById: async (id: string) => {
    return prisma.bus.findUnique({
      where: { id },
      include: {
        school: true,
        drivers: { include: { user: true } },
        routes: true
      }
    });
  },

  update: async (id: string, data: Partial<{ busNumber: string; capacity: number }>) => {
    return prisma.bus.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.bus.delete({ where: { id } });
  }
};

// --- Route Service ---
export const RouteService = {
  create: async (data: { name: string; busId: string; schoolId: string; distance?: number; busStopIds?: string[] }) => {
    const { busStopIds, ...routeData } = data;
    
    // Create Route
    const route = await prisma.route.create({ data: routeData });

    // Link Stops if provided
    if (busStopIds && busStopIds.length > 0) {
       await prisma.busStop.updateMany({
           where: { id: { in: busStopIds } },
           data: { routeId: route.id }
       });
    }

    return prisma.route.findUnique({
        where: { id: route.id },
        include: { bus: true, busStops: true }
    });
  },

  getAll: async (schoolId?: string) => {
    const where = schoolId ? { schoolId } : {};
    return prisma.route.findMany({
        where,
        include: { bus: true, busStops: true, school: true }
    });
  },

  getById: async (id: string) => {
    return prisma.route.findUnique({
        where: { id },
        include: { bus: true, busStops: true, school: true }
    });
  },

  update: async (id: string, data: any) => {
      const { busStopIds, ...updateData } = data;
      
      const route = await prisma.route.update({
          where: { id },
          data: updateData
      });

      if (busStopIds) {
          // Reset old stops
          await prisma.busStop.updateMany({
              where: { routeId: id },
              data: { routeId: null }
          });
          // Set new stops
          if (busStopIds.length > 0) {
              await prisma.busStop.updateMany({
                  where: { id: { in: busStopIds } },
                  data: { routeId: id }
              });
          }
      }

      return route;
  },

  delete: async (id: string) => {
    // Unlink stops first? Prisma constraint might handle set null if configured, else manual.
    // Assuming SetNull or Cascade in schema. If not, we should update stops.
    // For safety:
    await prisma.busStop.updateMany({ where: { routeId: id }, data: { routeId: null } });
    return prisma.route.delete({ where: { id } });
  }
};

// --- Stop Service ---
export const StopService = {
    create: async (data: { name: string; location: string; latitude?: number | null; longitude?: number | null; routeId?: string | null; schoolId: string }) => prisma.busStop.create({ data }),
    getAll: async (schoolId?: string) => prisma.busStop.findMany({ where: schoolId ? { schoolId } : {}, include: { route: true } }),
    getById: async (id: string) => prisma.busStop.findUnique({ where: { id }, include: { route: true } }),
    update: async (id: string, data: any) => prisma.busStop.update({ where: { id }, data }),
    delete: async (id: string) => prisma.busStop.delete({ where: { id } })
};

// --- Driver Service ---
export interface RegisterDriverInput {
    // User info
    name: string; email: string; phone: string; password?: string;
    address: string; city?: string; state?: string; country?: string; pincode?: string;
    bloodType?: string; sex?: "MALE" | "FEMALE" | "OTHERS";
    schoolId: string;
    
    // Driver info
    license: string; busId: string;
    
    // Files
    profilePicBuffer?: Buffer;
    profilePicName?: string;
    licensePhotoBuffer: Buffer;
    licensePhotoName: string;
}

export const DriverService = {
    register: async (input: RegisterDriverInput) => {
        // Upload License (Critical)
        const licenseUpload = await uploadFile(input.licensePhotoBuffer, "driver_license_photos", "image", input.licensePhotoName);
        
        // Hash Password
        const rawPassword = input.password || crypto.randomBytes(6).toString("hex");
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // Transaction
        const [user, driver] = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: input.name,
                    email: input.email,
                    phone: input.phone,
                    password: hashedPassword,
                    address: input.address,
                    city: input.city || "",
                    state: input.state || "",
                    country: input.country || "",
                    pincode: input.pincode || "",
                    bloodType: input.bloodType || "",
                    sex: input.sex || "MALE",
                    role: "driver",
                    schoolId: input.schoolId,
                    profilePic: null // placeholder
                }
            });

            const driver = await tx.driver.create({
                data: {
                    license: input.license,
                    busId: input.busId,
                    schoolId: input.schoolId,
                    userId: user.id,
                    licensePhoto: licenseUpload.url,
                    profilePhoto: null // placeholder
                }
            });

            return [user, driver];
        });

        // Parallel Profile Pic Upload (if exists)
        if (input.profilePicBuffer) {
            setImmediate(async () => {
                try {
                    const profileUpload = await uploadFile(input.profilePicBuffer!, "driver_profile_photos", "image", input.profilePicName!);
                    await prisma.user.update({ where: { id: user.id }, data: { profilePic: profileUpload.url } });
                    await prisma.driver.update({ where: { id: driver.id }, data: { profilePhoto: profileUpload.url } });
                } catch (e) {
                    console.error("Background profile upload failed", e);
                }
            });
        }
        
        // TODO: Send Email (Background)
        
        return { user, driver };
    },

    getAll: async (schoolId?: string) => {
        return prisma.driver.findMany({
            where: schoolId ? { schoolId } : {},
            include: { user: true, bus: true }
        });
    },

    getById: async (id: string) => {
        return prisma.driver.findUnique({
             where: { id },
             include: { user: true, bus: true, school: true }
        });
    },

    delete: async (id: string) => {
        const driver = await prisma.driver.findUnique({ where: { id } });
        if (!driver) throw new Error("Driver not found");

        return prisma.$transaction(async (tx) => {
            await tx.driver.delete({ where: { id } });
            await tx.user.delete({ where: { id: driver.userId } });
            return { success: true };
        });
    }
};
