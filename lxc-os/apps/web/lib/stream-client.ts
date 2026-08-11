import { StreamChat } from 'stream-chat';
import { CONFIG } from './config';

// Use CONFIG or process.env directly
const STREAM_API_KEY = process.env.STREAM_API_KEY || 'e26ujrtcbwrx';
const STREAM_API_SECRET = process.env.STREAM_API_SECRET || 'ug6xw2uc9cms37wb3g9qpwzgyn2u73b8393rus52swj6yt7jktg8t9k4qmebyys8';
const STREAM_APP_ID = process.env.STREAM_APP_ID || '1406378';

if (!STREAM_API_KEY || !STREAM_API_SECRET) {
  // Warn but don't crash if optional
  console.warn('Stream API credentials are not set');
}

let streamClient: StreamChat | null = null;

export const getStreamClient = (): StreamChat => {
  if (!streamClient) {
    streamClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);
  }
  return streamClient;
};

export { STREAM_API_KEY, STREAM_API_SECRET, STREAM_APP_ID };
