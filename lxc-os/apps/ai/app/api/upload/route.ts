import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';
import prisma from '@prisma/client';

let db: prisma.PrismaClient;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string; // 'audio', 'image', 'media'
    const stageId = formData.get('stageId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!db) {
      db = new prisma.PrismaClient();
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(buffer, `learnxchain/ai-${type}s`);

    // Save to Prisma based on type
    let dbRecord;

    if (type === 'audio') {
      dbRecord = await db.aiAudioFile.create({
        data: {
          format: cloudinaryResult.format,
          url: cloudinaryResult.url,
          // Optional fields: text, voice, duration
          text: (formData.get('text') as string) || undefined,
          voice: (formData.get('voice') as string) || undefined,
        },
      });
    } else if (type === 'image') {
      dbRecord = await db.aiImageFile.create({
        data: {
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          url: cloudinaryResult.url,
        },
      });
    } else if (type === 'media' && stageId) {
      dbRecord = await db.aiMediaFile.create({
        data: {
          stageId,
          type: (formData.get('mediaType') as string) || 'image',
          mimeType: file.type,
          size: file.size,
          url: cloudinaryResult.url,
          prompt: (formData.get('prompt') as string) || '',
          params: (formData.get('params') as string) || '{}',
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid type or missing stageId for media' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: cloudinaryResult.url,
      record: dbRecord,
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
