import { prisma } from '../db';
import logger from '../utils/logger';

export interface YieldPositionData {
  agentWallet: string;
  protocol: string;
  tokenName: string;
  poolName: string;
  depositedAmount: string;
  apy: string;
  txHash: string;
}

export class YieldPositionService {
  
  /**
   * Check if agent has active yield positions for a specific token
   */
  static async hasActivePosition(
    agentWallet: string, 
    tokenName: string, 
    protocol?: string
  ): Promise<boolean> {
    try {
      const whereClause: any = {
        agentWallet,
        tokenName: tokenName.toUpperCase(),
        status: 'active'
      };

      if (protocol) {
        whereClause.protocol = protocol;
      }

      const count = await prisma.yieldPosition.count({
        where: whereClause
      });

      return count > 0;
    } catch (error) {
      logger.error('Error checking active positions:', error);
      return false;
    }
  }

  /**
   * Get all active yield positions for an agent
   */
  static async getActivePositions(agentWallet: string) {
    try {
      const positions = await prisma.yieldPosition.findMany({
        where: {
          agentWallet,
          status: 'active'
        },
        orderBy: {
          depositedAt: 'desc'
        }
      });

      return positions;
    } catch (error) {
      logger.error('Error fetching active positions:', error);
      return [];
    }
  }

  /**
   * Get active positions by protocol
   */
  static async getActivePositionsByProtocol(
    agentWallet: string, 
    protocol: string
  ) {
    try {
      const positions = await prisma.yieldPosition.findMany({
        where: {
          agentWallet,
          protocol,
          status: 'active'
        }
      });

      return positions;
    } catch (error) {
      logger.error('Error fetching positions by protocol:', error);
      return [];
    }
  }

  /**
   * Save a new yield position
   */
  static async createPosition(data: YieldPositionData) {
    try {
      const position = await prisma.yieldPosition.create({
        data: {
          agentWallet: data.agentWallet,
          protocol: data.protocol,
          tokenName: data.tokenName.toUpperCase(),
          poolName: data.poolName,
          depositedAmount: data.depositedAmount,
          apy: data.apy,
          txHash: data.txHash,
          status: 'active'
        }
      });

      logger.info('✅ Yield position saved to DB', {
        id: position.id,
        protocol: data.protocol,
        token: data.tokenName,
        amount: data.depositedAmount
      });

      return position;
    } catch (error) {
      logger.error('❌ Error saving yield position:', error);
      throw error;
    }
  }

  /**
   * Update position status (e.g., when withdrawing)
   */
  static async updatePositionStatus(
    txHash: string,
    status: 'active' | 'withdrawn' | 'failed',
    currentAmount?: string
  ) {
    try {
      const updateData: any = {
        status,
        lastUpdated: new Date()
      };

      if (status === 'withdrawn') {
        updateData.withdrawnAt = new Date();
      }

      if (currentAmount) {
        updateData.currentAmount = currentAmount;
      }

      const position = await prisma.yieldPosition.updateMany({
        where: { txHash },
        data: updateData
      });

      logger.info('✅ Position status updated', { txHash, status });
      return position;
    } catch (error) {
      logger.error('❌ Error updating position status:', error);
      throw error;
    }
  }

  /**
   * Mark position as withdrawn
   */
  static async markAsWithdrawn(
    agentWallet: string,
    tokenName: string,
    protocol: string,
    currentAmount?: string
  ) {
    try {
      const result = await prisma.yieldPosition.updateMany({
        where: {
          agentWallet,
          tokenName: tokenName.toUpperCase(),
          protocol,
          status: 'active'
        },
        data: {
          status: 'withdrawn',
          withdrawnAt: new Date(),
          currentAmount: currentAmount,
          lastUpdated: new Date()
        }
      });

      logger.info('✅ Position marked as withdrawn', {
        agentWallet,
        tokenName,
        protocol,
        count: result.count
      });

      return result;
    } catch (error) {
      logger.error('❌ Error marking position as withdrawn:', error);
      throw error;
    }
  }

  /**
   * Get total value deposited across all positions
   */
  static async getTotalDeposited(agentWallet: string): Promise<{
    totalPositions: number;
    byProtocol: Record<string, number>;
    byToken: Record<string, string>;
  }> {
    try {
      const positions = await this.getActivePositions(agentWallet);

      const byProtocol: Record<string, number> = {};
      const byToken: Record<string, string> = {};

      positions.forEach(pos => {
        byProtocol[pos.protocol] = (byProtocol[pos.protocol] || 0) + 1;
        
        const current = parseFloat(byToken[pos.tokenName] || '0');
        const deposited = parseFloat(pos.depositedAmount);
        byToken[pos.tokenName] = (current + deposited).toString();
      });

      return {
        totalPositions: positions.length,
        byProtocol,
        byToken
      };
    } catch (error) {
      logger.error('Error calculating total deposited:', error);
      return {
        totalPositions: 0,
        byProtocol: {},
        byToken: {}
      };
    }
  }

  /**
   * Get position history (for analytics)
   */
  static async getPositionHistory(
    agentWallet: string,
    limit: number = 50
  ) {
    try {
      const positions = await prisma.yieldPosition.findMany({
        where: { agentWallet },
        orderBy: { depositedAt: 'desc' },
        take: limit
      });

      return positions;
    } catch (error) {
      logger.error('Error fetching position history:', error);
      return [];
    }
  }
}
