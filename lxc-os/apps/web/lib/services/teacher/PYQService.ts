import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/config/upload";

export interface PYQUploadInput {
  title: string;
  year: number;
  classId: string;
  subjectId: string;
  uploaderId: string;
}

interface FileUpload {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export const createPYQService = async (data: PYQUploadInput, file: FileUpload) => {
  const upload = await uploadFile(file.buffer, "pyqs", "raw", file.originalname);
  
  return await prisma.pYQ.create({
    data: {
      title: data.title,
      year: Number(data.year),
      fileUrl: upload.url,
      classId: data.classId,
      subjectId: data.subjectId,
      uploaderId: data.uploaderId,
    }
  });
};

export const getPYQsByClassAndSubject = async (classId: string, subjectId?: string) => {
  const where: any = { classId };
  if (subjectId) {
    where.subjectId = subjectId;
  }
  
  return await prisma.pYQ.findMany({
    where,
    include: {
      subject: true,
      class: true,
      uploader: {
        select: {
          name: true,
        }
      }
    },
    orderBy: {
      year: 'desc'
    }
  });
};

export const deletePYQService = async (id: string, uploaderId: string) => {
  return await prisma.pYQ.delete({
    where: {
      id,
      uploaderId // Ensure only uploader can delete
    }
  });
};

export const getAllPYQsForTeacher = async (uploaderId: string) => {
    return await prisma.pYQ.findMany({
        where: { uploaderId },
        include: {
            subject: true,
            class: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};
