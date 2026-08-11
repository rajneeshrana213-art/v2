import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Verify Authentication (Super Admin only)
  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  // 2. Get the Cloudinary URL from the query
  const { url: rawUrl } = req.query;

  if (!rawUrl || typeof rawUrl !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid URL parameter' });
  }

  const url = decodeURIComponent(rawUrl);

  // 3. Security: Ensure it's a Cloudinary URL (preventing SSRF)
  if (!url.startsWith("https://res.cloudinary.com/") && !url.startsWith("http://res.cloudinary.com/")) {
    console.warn("Rejected attachment proxy URL:", url);
    return res.status(400).json({ message: "Invalid Cloudinary URL" });
  }

  try {
    let fetchUrl = url;

    // 4. Extract publicId and options to re-sign the URL correctly
    // This ensures that even private/authenticated resources can be fetched by the server
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (cloudName && url.includes(`/${cloudName}/`)) {
        try {
            const urlObj = new URL(url);
            const pathName = urlObj.pathname;
            
            // Regex to extract resource_type, type, signature (optional), version (optional), public_id and format
            // Pattern: /<cloud_name>/<resource_type>/<type>/[s--<signature>--/][v<version>/]<public_id>[.<format>]
            // We use a non-greedy match for public_id to capture the format separately if it exists.
            const match = pathName.match(/\/(?:[^/]+)\/([^/]+)\/([^/]+)\/(?:s--[^/]+--\/)?(?:v\d+\/)?(.+?)(?:\.([^.]+))?$/);
            
            if (match) {
                const resource_type = match[1]; // e.g. 'image', 'raw', 'video'
                const type = match[2];          // e.g. 'upload', 'authenticated', 'private'
                let publicId = match[3];      // e.g. 'folder/name' or 'folder/name.pdf' (if double extension)
                let format = match[4];        // e.g. 'pdf'

                // Handle double extension mess (e.g. public_id is "name.pdf" and format is "pdf")
                if (publicId.endsWith(`.${format}`)) {
                    publicId = publicId.substring(0, publicId.length - (format.length + 1));
                }

                fetchUrl = cloudinary.url(publicId, {
                    sign_url: true,
                    type: type,
                    resource_type: resource_type,
                    format: format,
                    secure: true
                });
                
                console.log(`Re-signed URL: ${fetchUrl} (Original: ${url})`);
                // If the original URL had an extension but the re-signed one doesn't (common for raw), append it
                if (format && !fetchUrl.toLowerCase().endsWith(`.${format.toLowerCase()}`)) {
                    fetchUrl += `.${format}`;
                }
            }
        } catch (e) {
            console.error("Failed to parse Cloudinary URL for re-signing, using original:", e);
        }
    }

    // 5. Fetch the file
    const response = await fetch(fetchUrl);

    if (!response.ok) {
      console.error(`Failed to fetch attachment from ${fetchUrl}: ${response.status} ${response.statusText}`);
      // Fallback: If re-signed URL failed, try original URL if it's different
      if (fetchUrl !== url) {
        const retryResponse = await fetch(url);
        if (retryResponse.ok) {
            return streamResponse(retryResponse, res, url);
        }
      }
      throw new Error(`Failed to fetch attachment: ${response.statusText} (${response.status})`);
    }

    return streamResponse(response, res, url);

  } catch (error: any) {
    console.error('Error proxying attachment:', error);
    res.status(500).json({ message: `Failed to stream attachment: ${error.message}` });
  }
}

async function streamResponse(response: Response, res: NextApiResponse, originalUrl: string) {
    // 6. Set appropriate headers
    let contentType = response.headers.get('content-type') || 'application/pdf';
    
    // Security/Fix: If the URL or Content-Type indicates a PDF, force it.
    // Cloudinary 'raw' resources often return 'application/octet-stream'.
    const lowerUrl = originalUrl.toLowerCase();
    if (contentType === 'application/octet-stream' && 
        (lowerUrl.includes('.pdf') || lowerUrl.includes('_pdf') || lowerUrl.includes('/plan_') || lowerUrl.includes('/feature_'))) {
        contentType = 'application/pdf';
    }

    // Extract a safe filename from the URL for the header
    const urlObj = new URL(originalUrl);
    const filename = urlObj.pathname.split('/').pop() || 'attachment.pdf';

    res.setHeader('Content-Type', contentType);
    // Use 'inline' to allow browser preview, but provide a filename
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // 7. Stream the body to the response
    if (response.body) {
      // @ts-ignore - response.body is a ReadableStream in some environments
      const reader = response.body.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      res.status(500).json({ message: 'Empty response body from attachment source' });
    }
}
