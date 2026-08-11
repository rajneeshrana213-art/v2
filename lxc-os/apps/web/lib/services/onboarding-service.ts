
import { prisma } from "../prisma";
import logger from "../utils/logger";
import { OnboardingStatus } from "@prisma/client";

const calculateAutomatedStatus = (steps: any): OnboardingStatus => {
    const stepValues = steps || {};
    if (stepValues.goLive?.completed) return "COMPLETED";
    if (stepValues.adminTraining?.completed || stepValues.parentAppLaunch?.completed || stepValues.feeEngineSetup?.completed) return "TRAINING";
    if (stepValues.dataImport?.completed) return "SETUP_IN_PROGRESS";
    if (stepValues.initialMeeting?.completed) return "DOCS_PENDING";
    return "INITIATED";
};

export const OnboardingService = {
    async getOnboardings(params: {
        userId?: string;
        searchTerm?: string;
        status?: OnboardingStatus;
        page?: number;
        limit?: number;
    }) {
        const { userId, searchTerm, status, page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (userId) where.assignedToId = userId;
        if (status) where.status = status;
        if (searchTerm) {
            where.OR = [
                { school: { schoolName: { contains: searchTerm, mode: 'insensitive' } } },
                { school: { schoolCode: { contains: searchTerm, mode: 'insensitive' } } },
            ];
        }

        try {
            const [onboardings, totalCount] = await Promise.all([
                prisma.schoolOnboarding.findMany({
                    where,
                    include: {
                        school: {
                            select: {
                                id: true,
                                schoolName: true,
                                schoolCode: true,
                                isActive: true,
                            }
                        },
                        assignedTo: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                prisma.schoolOnboarding.count({ where })
            ]);

            const stats = await prisma.schoolOnboarding.groupBy({
                by: ['status'],
                where: userId ? { assignedToId: userId } : {},
                _count: {
                    status: true
                }
            });

            // Helper function to get last active step
            const getLastActiveStep = (steps: any, status: OnboardingStatus): string => {
                if (!steps || Object.keys(steps).length === 0) {
                    const statusLabels: Record<string, string> = {
                        INITIATED: "Initial Meeting",
                        DOCS_PENDING: "Documentation",
                        SETUP_IN_PROGRESS: "Data Import",
                        TRAINING: "Admin Training",
                        COMPLETED: "Go Live",
                    };
                    return statusLabels[status] || "Initial Meeting";
                }

                const stepOrder = [
                    "initialMeeting",
                    "dataImport",
                    "adminTraining",
                    "parentAppLaunch",
                    "feeEngineSetup",
                    "goLive"
                ];

                for (let i = stepOrder.length - 1; i >= 0; i--) {
                    const stepKey = stepOrder[i];
                    if (steps[stepKey]?.completed) {
                        return steps[stepKey].label || stepKey;
                    }
                }

                // Return first incomplete step
                for (const stepKey of stepOrder) {
                    if (steps[stepKey] && !steps[stepKey].completed) {
                        return steps[stepKey].label || stepKey;
                    }
                }

                return "Initial Meeting";
            };

            // Calculate progress for each onboarding
            const onboardingsWithProgress = onboardings.map((onboarding: any) => {
                const steps = onboarding.steps as any || {};
                const totalSteps = Object.keys(steps).length || 1;
                const completedSteps = Object.values(steps).filter((step: any) => step?.completed).length;
                const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

                return {
                    ...onboarding,
                    progress,
                    lastLabel: getLastActiveStep(steps, onboarding.status)
                };
            });

            return {
                onboardings: onboardingsWithProgress,
                pagination: {
                    totalCount,
                    page,
                    limit,
                    totalPages: Math.ceil(totalCount / limit)
                },
                stats: stats.reduce((acc: any, curr: any) => {
                    acc[curr.status] = curr._count.status;
                    return acc;
                }, { total: totalCount } as any)
            };
        } catch (error) {
            logger.error("Error fetching onboardings:", error);
            throw error;
        }
    },

    async getOnboardingById(id: string) {
        try {
            const onboarding = await prisma.schoolOnboarding.findUnique({
                where: { id },
                include: {
                    school: {
                        select: {
                            id: true,
                            schoolName: true,
                            schoolCode: true,
                            isActive: true,
                            createdAt: true,
                        }
                    },
                    assignedTo: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    }
                }
            });

            if (!onboarding) {
                throw new Error("Onboarding not found");
            }

            const steps = onboarding.steps as any || {};
            const totalSteps = Object.keys(steps).length || 1;
            const completedSteps = Object.values(steps).filter((step: any) => step?.completed).length;
            const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

            // Helper function to get last active step
            const getLastActiveStep = (steps: any, status: OnboardingStatus): string => {
                if (!steps || Object.keys(steps).length === 0) {
                    const statusLabels: Record<string, string> = {
                        INITIATED: "Initial Meeting",
                        DOCS_PENDING: "Documentation",
                        SETUP_IN_PROGRESS: "Data Import",
                        TRAINING: "Admin Training",
                        COMPLETED: "Go Live",
                    };
                    return statusLabels[status] || "Initial Meeting";
                }

                const stepOrder = [
                    "initialMeeting",
                    "dataImport",
                    "adminTraining",
                    "parentAppLaunch",
                    "feeEngineSetup",
                    "goLive"
                ];

                for (let i = stepOrder.length - 1; i >= 0; i--) {
                    const stepKey = stepOrder[i];
                    if (steps[stepKey]?.completed) {
                        return steps[stepKey].label || stepKey;
                    }
                }

                // Return first incomplete step
                for (const stepKey of stepOrder) {
                    if (steps[stepKey] && !steps[stepKey].completed) {
                        return steps[stepKey].label || stepKey;
                    }
                }

                return "Initial Meeting";
            };

            return {
                ...onboarding,
                progress,
                lastLabel: getLastActiveStep(steps, onboarding.status)
            };
        } catch (error) {
            logger.error("Error fetching onboarding by ID:", error);
            throw error;
        }
    },

    async createOnboarding(data: {
        schoolId: string;
        assignedToId?: string;
        status?: OnboardingStatus;
        steps?: any;
    }) {
        try {
            // Check if onboarding already exists for this school
            const existing = await prisma.schoolOnboarding.findUnique({
                where: { schoolId: data.schoolId }
            });

            if (existing) {
                throw new Error("Onboarding already exists for this school");
            }

            const defaultSteps = {
                initialMeeting: { label: "Initial Meeting", completed: false, notes: "" },
                dataImport: { label: "Data Import", completed: false, notes: "" },
                adminTraining: { label: "Admin Training", completed: false, notes: "" },
                parentAppLaunch: { label: "Parent App Launch", completed: false, notes: "" },
                feeEngineSetup: { label: "Fee Engine Setup", completed: false, notes: "" },
                goLive: { label: "Go Live", completed: false, notes: "" },
            };

            const onboarding = await prisma.schoolOnboarding.create({
                data: {
                    schoolId: data.schoolId,
                    assignedToId: data.assignedToId,
                    status: data.status || "INITIATED",
                    steps: data.steps || defaultSteps
                },
                include: {
                    school: {
                        select: {
                            id: true,
                            schoolName: true,
                            schoolCode: true,
                            isActive: true,
                        }
                    },
                    assignedTo: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    }
                }
            });

            return onboarding;
        } catch (error) {
            logger.error("Error creating onboarding:", error);
            throw error;
        }
    },

    async updateOnboarding(id: string, data: {
        status?: OnboardingStatus;
        assignedToId?: string;
        steps?: any;
    }) {
        try {
            if (data.steps) {
                const steps = data.steps as any;
                data.status = calculateAutomatedStatus(steps);
            }

            const onboarding = await prisma.schoolOnboarding.update({
                where: { id },
                data,
                include: {
                    school: {
                        select: {
                            id: true,
                            schoolName: true,
                            schoolCode: true,
                            isActive: true,
                        }
                    },
                    assignedTo: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    }
                }
            });

            return onboarding;
        } catch (error) {
            logger.error("Error updating onboarding:", error);
            throw error;
        }
    },

    async updateStep(id: string, stepKey: string, stepData: { completed?: boolean; notes?: string }) {
        try {
            const onboarding = await prisma.schoolOnboarding.findUnique({
                where: { id }
            });

            if (!onboarding) {
                throw new Error("Onboarding not found");
            }

            const steps = (onboarding.steps as any) || {};
            steps[stepKey] = {
                ...steps[stepKey],
                ...stepData
            };

            // Calculate automated status
            const newStatus = calculateAutomatedStatus(steps);

            const updated = await prisma.schoolOnboarding.update({
                where: { id },
                data: { 
                    steps,
                    status: newStatus
                },
                include: {
                    school: {
                        select: {
                            id: true,
                            schoolName: true,
                            schoolCode: true,
                            isActive: true,
                        }
                    },
                    assignedTo: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    }
                }
            });

            return updated;
        } catch (error) {
            logger.error("Error updating step:", error);
            throw error;
        }
    },

    async deleteOnboarding(id: string) {
        try {
            await prisma.schoolOnboarding.delete({
                where: { id }
            });
            return { success: true };
        } catch (error) {
            logger.error("Error deleting onboarding:", error);
            throw error;
        }
    },

    async getStats(userId?: string) {
        try {
            const where = userId ? { assignedToId: userId } : {};

            const [total, byStatus, avgDays] = await Promise.all([
                prisma.schoolOnboarding.count({ where }),
                prisma.schoolOnboarding.groupBy({
                    by: ['status'],
                    where,
                    _count: { status: true }
                }),
                prisma.schoolOnboarding.findMany({
                    where: {
                        ...where,
                        status: "COMPLETED"
                    },
                    select: {
                        createdAt: true,
                        updatedAt: true
                    }
                })
            ]);

            const statusCounts = byStatus.reduce((acc: any, curr: any) => {
                acc[curr.status] = curr._count.status;
                return acc;
            }, {} as Record<string, number>);

            // Calculate average days to completion
            const completedOnboardings = avgDays.filter((o: any) => {
                const days = Math.floor((o.updatedAt.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24));
                return days > 0;
            });

            const avgDaysToComplete = completedOnboardings.length > 0
                ? Math.round(
                    completedOnboardings.reduce((sum: number, o: any) => {
                        const days = Math.floor((o.updatedAt.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24));
                        return sum + days;
                    }, 0) / completedOnboardings.length
                )
                : 14;

            return {
                total,
                byStatus: statusCounts,
                avgDaysToComplete,
                activeCount: (statusCounts["INITIATED"] || 0) +
                    (statusCounts["DOCS_PENDING"] || 0) +
                    (statusCounts["SETUP_IN_PROGRESS"] || 0) +
                    (statusCounts["TRAINING"] || 0)
            };
        } catch (error) {
            logger.error("Error fetching onboarding stats:", error);
            throw error;
        }
    }
};

