// import * as faceapi from "@vladmandic/face-api";
// // @ts-ignore - @tensorflow/tfjs-node may not have types
// import * as tf from "@tensorflow/tfjs-node";
// import { Canvas, Image, ImageData, loadImage } from "canvas";
// import path from "path";

// import fs from "fs";

// let initialized = false;
// let initializationError: Error | null = null;

// // Try multiple model paths
// function findModelPath(): string {
//   const possiblePaths = [
    
//     path.join(__dirname, "../../models"),
//       path.join(__dirname, "./models"),
  
//     path.join(__dirname, "../../../../models"),
   
//     path.join(__dirname, "../../node_modules/@vladmandic/face-api/model"),
//   ];

 
//   if (process.env.FACE_MODEL_PATH) {
//     possiblePaths.unshift(process.env.FACE_MODEL_PATH);
//   }

//   for (const p of possiblePaths) {
//     const manifestPath = path.join(p, "ssd_mobilenetv1_model-weights_manifest.json");
//     if (fs.existsSync(manifestPath)) {
//       console.log(`Found models at: ${p}`);
//       return p;
//     }
//   }

  
//   return path.join(__dirname, "../../node_modules/@vladmandic/face-api/model");
// }

// const THRESHOLD = parseFloat(process.env.FACE_MATCH_THRESHOLD || "0.6");

// /**
//  * Initialize face-api models with TensorFlow.js Node backend
//  */
// export async function initializeFaceAPI(): Promise<void> {
//   if (initialized) return;
//   if (initializationError) throw initializationError;

//   try {
//     console.log("Initializing Face API...");

//     // Set TensorFlow.js backend to Node.js
//     await tf.setBackend("tensorflow");
//     await tf.ready();
//     console.log(`TensorFlow backend ready: ${tf.getBackend()}`);

//     // Monkey patch face-api to use Node.js canvas
//     (faceapi.env as any).monkeyPatch({
//       Canvas: Canvas,
//       Image: Image,
    
//       ImageData: ImageData,
//     });

//     const modelPath = findModelPath();
//     console.log(`Loading models from: ${modelPath}`);

//     await Promise.all([
//       faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath),
//       faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
//       faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
//     ]);

//     initialized = true;
//     console.log("Face API models loaded successfully");
//   } catch (error) {
//     initializationError = error as Error;
//     console.error("Failed to initialize Face API:", error);
//     throw error;
//   }
// }

// /**
//  * Check if Face API is ready
//  */
// export function isReady(): boolean {
//   return initialized;
// }

// /**
//  * Load image from URL
//  */
// async function loadImageFromUrl(url: string): Promise<any> {
//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error(`Failed to fetch image: ${response.statusText}`);
//     }
//     const buffer = Buffer.from(await response.arrayBuffer());
//     return await loadImage(buffer);
//   } catch (error) {
//     console.error("Error loading image from URL:", error);
//     throw error;
//   }
// }

// /**
//  * Load image from base64 string
//  */
// async function loadImageFromBase64(base64: string): Promise<any> {
//   try {

//     const cleaned = base64.replace(/^data:image\/\w+;base64,/, "");
//     const buffer = Buffer.from(cleaned, "base64");
//     return await loadImage(buffer);
//   } catch (error) {
//     console.error("Error loading image from base64:", error);
//     throw error;
//   }
// }

// export async function matchFace(
//   selfieBase64: string,
//   storedImageUrl: string
// ): Promise<boolean> {
//   await initializeFaceAPI();

//   try {
//     const [selfieImage, storedImage] = await Promise.all([
//       loadImageFromBase64(selfieBase64),
//       loadImageFromUrl(storedImageUrl),
//     ]);

//     const selfieDetection = await faceapi
//       .detectSingleFace(selfieImage as unknown as HTMLCanvasElement)
//       .withFaceLandmarks()
//       .withFaceDescriptor();

//     const storedDetection = await faceapi
//       .detectSingleFace(storedImage as unknown as HTMLCanvasElement)
//       .withFaceLandmarks()
//       .withFaceDescriptor();

//     if (!selfieDetection || !storedDetection) {
//       console.log("Face not detected in one or both images");
//       return false;
//     }

//     const distance = faceapi.euclideanDistance(
//       selfieDetection.descriptor,
//       storedDetection.descriptor
//     );

//     console.log(`Face match distance: ${distance}, threshold: ${THRESHOLD}`);
//     return distance < THRESHOLD;
//   } catch (error) {
//     console.error("Error matching faces:", error);
//     throw error;
//   }
// }

// /**
//  * Get face embedding from image URL
//  * @param imageUrl URL of the image
//  * @returns Face embedding vector (128 dimensions)
//  */
// export async function getFaceEmbedding(imageUrl: string): Promise<number[]> {
//   await initializeFaceAPI();

//   try {
//     const image = await loadImageFromUrl(imageUrl);
//     const detection = await faceapi
//       .detectSingleFace(image as unknown as HTMLCanvasElement)
//       .withFaceLandmarks()
//       .withFaceDescriptor();

//     if (!detection) {
//       throw new Error("No face detected in image");
//     }

//     return Array.from(detection.descriptor);
//   } catch (error) {
//     console.error("Error getting face embedding:", error);
//     throw error;
//   }
// }

// /**
//  * Match selfie with stored embedding
//  * @param selfieInput Base64 encoded selfie image or image URL
//  * @param embedding Stored face embedding vector
//  * @returns true if faces match, false otherwise
//  */
// export async function matchEmbedding(
//   selfieInput: string,
//   embedding: number[]
// ): Promise<boolean> {
//   await initializeFaceAPI();

//   try {
//     // Determine if input is URL or base64
//     const image = selfieInput.startsWith("http://") || selfieInput.startsWith("https://")
//       ? await loadImageFromUrl(selfieInput)
//       : await loadImageFromBase64(selfieInput);

//     const detection = await faceapi
//       .detectSingleFace(image as unknown as HTMLCanvasElement)
//       .withFaceLandmarks()
//       .withFaceDescriptor();

//     if (!detection) {
//       console.log("No face detected in selfie");
//       return false;
//     }

//     const distance = faceapi.euclideanDistance(detection.descriptor, embedding);
//     console.log(`Embedding match distance: ${distance}, threshold: ${THRESHOLD}`);
//     return distance < THRESHOLD;
//   } catch (error) {
//     console.error("Error matching embedding:", error);
//     throw error;
//   }
// }
