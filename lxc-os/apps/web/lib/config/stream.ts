
import { StreamChat } from "stream-chat";

const STREAM_API_KEY = process.env.STREAM_API_KEY!;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET!;

let streamClient: StreamChat | null = null;

export const getStreamClient = () => {
  if (!streamClient) {
    if (!STREAM_API_KEY || !STREAM_API_SECRET) {
      throw new Error("Stream API credentials not set");
    }
    streamClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);
  }
  return streamClient;
};
