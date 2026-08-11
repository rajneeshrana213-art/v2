import { NextApiRequest, NextApiResponse } from 'next';
import { createLogger, format, transports } from 'winston';
import path from 'path';

const auditLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({
      filename: path.join(process.cwd(), 'logs', 'audit.log'),
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 30,
    }),
    new transports.Console({ silent: process.env.NODE_ENV === 'test' }),
  ],
});

export interface AuditLogEntry {
  timestamp: string;
  method: string;
  url: string;
  userId?: string;
  role?: string;
  schoolId?: string;
  ip: string;
  statusCode: number;
  durationMs: number;
}

/**
 * Wraps an API handler and writes a structured audit log entry for every request.
 *
 * Usage:
 *   export default withAuditLog(handler);
 */
export function withAuditLog(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<any> | any
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const start = Date.now();

    // Intercept res.end to capture the status code after the handler runs.
    // We cast through ServerResponse (the underlying Node.js type) to preserve
    // the original overloaded signature while still replacing the method.
    const resNode = res as unknown as import('http').ServerResponse;
    const originalEnd = resNode.end.bind(resNode);
    resNode.end = (...args: any[]) => {
      const durationMs = Date.now() - start;
      const user = (req as any).user;

      const forwarded = req.headers['x-forwarded-for'];
      const ip = forwarded
        ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]).trim()
        : req.socket?.remoteAddress ?? 'unknown';

      const entry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        method: req.method ?? 'UNKNOWN',
        url: req.url ?? '',
        userId: user?.id,
        role: user?.role,
        schoolId: user?.schoolId,
        ip,
        statusCode: res.statusCode,
        durationMs,
      };

      auditLogger.info('api-request', entry);
      return originalEnd(...args);
    };

    return handler(req, res);
  };
}
