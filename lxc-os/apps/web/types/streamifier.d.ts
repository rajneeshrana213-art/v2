declare module 'streamifier' {
  import { ReadStream } from 'fs';
  export function createReadStream(buffer: Buffer, options?: any): ReadStream;
}
