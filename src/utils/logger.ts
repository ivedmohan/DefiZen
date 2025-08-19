import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info: any) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console(),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join('logs', 'all.log'),
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Export logger functions
export const logError = (message: string, error?: any) => {
  logger.error(message, error);
};

export const logWarn = (message: string) => {
  logger.warn(message);
};

export const logInfo = (message: string) => {
  logger.info(message);
};

export const logHttp = (message: string) => {
  logger.http(message);
};

export const logDebug = (message: string) => {
  logger.debug(message);
};

// Transaction logging
export const logTransaction = (txHash: string, action: string, amount: string, walletAddress: string) => {
  logger.info(`Transaction: ${action} | Amount: ${amount} | Wallet: ${walletAddress} | Hash: ${txHash}`);
};

// Agent activity logging
export const logAgentActivity = (agentId: string, action: string, details: any) => {
  logger.info(`Agent Activity: ${agentId} | Action: ${action} | Details: ${JSON.stringify(details)}`);
};

// Security event logging
export const logSecurityEvent = (event: string, details: any) => {
  logger.warn(`Security Event: ${event} | Details: ${JSON.stringify(details)}`);
};

// Performance logging
export const logPerformance = (operation: string, duration: number) => {
  logger.info(`Performance: ${operation} took ${duration}ms`);
};

export default logger; 