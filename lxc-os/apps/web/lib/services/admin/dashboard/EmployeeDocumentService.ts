
import { prisma } from "@/lib/prisma";

export class EmployeeDocumentService {
    static async createDocument(data: any) {
        return prisma.employeeDocument.create({
            data: {
                employeeId: data.employeeId,
                fileName: data.fileName,
                fileUrl: data.fileUrl,
                folder: data.folder,
                fileType: data.fileType,
                fileSize: data.fileSize,
                uploadedBy: data.uploadedBy
            }
        });
    }

    static async getDocuments(employeeId: string) {
        const documents = await prisma.employeeDocument.findMany({
            where: { employeeId },
            orderBy: [{ folder: "asc" }, { createdAt: "desc" }],
             include: {
                employee: {
                    select: {
                        id: true,
                        employeeCode: true,
                         user: {
                            select: { id: true, name: true, email: true }
                         }
                    }
                }
            }
        });

        // Grouping logic can be handled in frontend, but service can return raw list + folders
        return documents;
    }

    static async getMyDocuments(userId: string) {
        const employee = await prisma.employee.findUnique({ where: { userId } });
        if (!employee) throw new Error("Employee not found");
        
        return this.getDocuments(employee.id);
    }

    static async deleteDocument(id: string) {
        return prisma.employeeDocument.delete({ where: { id } });
    }
}
