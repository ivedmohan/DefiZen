import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Validation schemas
const depositSchema = z.object({
  tokenName: z.string().min(1, "Token name is required"),
  amount: z.string().regex(/^\d+(\.\d+)?$/, "Amount must be a valid number"),
  accountAddress: z.string().regex(/^0x[a-fA-F0-9]{63}$/, "Invalid StarkNet address format"),
  protocolName: z.string().min(1, "Protocol name is required")
});

const withdrawSchema = z.object({
  tokenName: z.string().min(1, "Token name is required"),
  amount: z.string().regex(/^\d+(\.\d+)?$/, "Amount must be a valid number"),
  accountAddress: z.string().regex(/^0x[a-fA-F0-9]{63}$/, "Invalid StarkNet address format"),
  protocolName: z.string().min(1, "Protocol name is required")
});

const portfolioSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{63}$/, "Invalid StarkNet address format"),
  stablePercentage: z.number().min(0).max(100),
  nativePercentage: z.number().min(0).max(100),
  otherPercentage: z.number().min(0).max(100)
});

const agentChatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1, "Message content is required")
  })),
  address: z.string().regex(/^0x[a-fA-F0-9]{63}$/, "Invalid StarkNet address format")
});

// Validation middleware factory
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      return res.status(500).json({
        success: false,
        error: "Internal validation error"
      });
    }
  };
};

// Export specific validators
export const validateDeposit = validateRequest(depositSchema);
export const validateWithdraw = validateRequest(withdrawSchema);
export const validatePortfolio = validateRequest(portfolioSchema);
export const validateAgentChat = validateRequest(agentChatSchema);

// Rate limiting middleware
export const rateLimiter = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const userRequests = requests.get(ip);

    if (!userRequests || now > userRequests.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userRequests.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: "Too many requests. Please try again later."
      });
    }

    userRequests.count++;
    next();
  };
}; 