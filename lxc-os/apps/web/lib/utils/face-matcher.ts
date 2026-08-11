
import axios from "axios";

const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL;
// Default 45s — Vercel Python cold-start + ONNX 250MB model load needs up to 30s
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS) || 45_000;
export async function getFaceEmbedding(imageUrl: string): Promise<{ embedding: string; latencyMs: number }> {
  if (!FACE_SERVICE_URL) {
    throw new Error("AI face service is not configured (FACE_SERVICE_URL missing)");
  }


  const cleanImage = imageUrl.includes(",") ? imageUrl.split(",")[1] : imageUrl;

  if (!cleanImage || cleanImage.length < 100) {
    throw new Error("Invalid or empty image data");
  }

  const start = Date.now();
  try {
    const response = await axios.post(
      `${FACE_SERVICE_URL}/embedding`,
      { imageUrl: cleanImage },
      { timeout: AI_TIMEOUT_MS }
    );
    const latencyMs = Date.now() - start;
    const embedding = response.data?.embedding;

    if (!embedding) throw new Error("AI service returned no embedding");

    return { embedding, latencyMs };
  } catch (err: any) {
    if (err.code === "ECONNABORTED") {
      throw new Error(`AI service timed out after ${AI_TIMEOUT_MS / 1000}s — the face server may be warming up. Please try again in a moment.`);
    }
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      throw new Error("AI face service is offline — please contact your admin");
    }
    const detail = err?.response?.data?.detail || err?.message || "AI service error";
    throw new Error(detail);
  }
}

export async function compareEmbeddings(
  embedding1: string,
  embedding2: Buffer | Uint8Array
): Promise<{ matched: boolean; score: number }> {
  try {

    const buf1 = Buffer.from(embedding1, "base64");
    const vec1 = new Float32Array(buf1.buffer, buf1.byteOffset, buf1.byteLength / 4);

    const buf2 = Buffer.isBuffer(embedding2) ? embedding2 : Buffer.from(embedding2);
    const vec2 = new Float32Array(buf2.buffer, buf2.byteOffset, buf2.byteLength / 4);

    if (vec1.length !== vec2.length || vec1.length === 0) {
      console.error(`Embedding size mismatch: ${vec1.length} vs ${vec2.length}`);
      return { matched: false, score: 0 };
    }

  
    let dot = 0, n1 = 0, n2 = 0;
    for (let i = 0; i < vec1.length; i++) {
      dot += vec1[i] * vec2[i];
      n1 += vec1[i] * vec1[i];
      n2 += vec2[i] * vec2[i];
    }
    const score = dot / (Math.sqrt(n1) * Math.sqrt(n2));

  
    const THRESHOLD = 0.5;
    return { matched: score >= THRESHOLD, score: parseFloat(score.toFixed(4)) };
  } catch (err) {
    console.error("Local embedding comparison failed:", err);
    return { matched: false, score: 0 };
  }
}


export async function matchFace(): Promise<boolean> {
  console.warn("matchFace() is deprecated. Use getFaceEmbedding + compareEmbeddings.");
  return false;
}
