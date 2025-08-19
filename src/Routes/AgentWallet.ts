import { Router } from "express";
import { Request, Response, RequestHandler } from "express";
import { walletManager } from "../utils/walletManager";
import { mockPrisma as prisma } from "../db-mock";
import { validateRequest } from "../middleware/validation";
import { z } from "zod";
import { logInfo, logError } from "../utils/logger";

export const AgentWalletRouter = Router();

// Validation schema for agent wallet creation
const createAgentWalletSchema = z.object({
  userId: z.string().regex(/^0x[a-fA-F0-9]{63}$/, "Invalid StarkNet address format"),
  agentName: z.string().min(1, "Agent name is required").max(50, "Agent name too long"),
  permissions: z.object({
    canDeposit: z.boolean(),
    canWithdraw: z.boolean(),
    canSwap: z.boolean(),
    maxTransactionSize: z.number().min(100).max(10000),
    dailyLimit: z.number().min(500).max(50000)
  }),
  portfolioPreset: z.object({
    stablePercentage: z.number().min(0).max(100),
    nativePercentage: z.number().min(0).max(100),
    otherPercentage: z.number().min(0).max(100)
  })
});

// Create agent wallet
AgentWalletRouter.post("/create", validateRequest(createAgentWalletSchema) as unknown as RequestHandler, (async (req: Request, res: Response) => {
  try {
    const { userId, agentName, permissions, portfolioPreset } = req.body;

    // Validate portfolio percentages add up to 100
    const totalPercentage = portfolioPreset.stablePercentage + portfolioPreset.nativePercentage + portfolioPreset.otherPercentage;
    if (totalPercentage !== 100) {
      return res.status(400).json({
        success: false,
        error: "Portfolio percentages must add up to 100%"
      });
    }

    // Create agent wallet
    const agentWallet = await walletManager.createAgentWallet(userId, permissions);

    // Store in database
    const dbAgentWallet = await prisma.agentWallet.create({
      data: {
        agentId: agentWallet.walletAddress, // Use wallet address as agent ID
        walletAddress: agentWallet.walletAddress,
        encryptedPrivateKey: agentWallet.encryptedPrivateKey,
        userId: userId,
        permissions: permissions,
        isActive: true
      }
    });

    // Store portfolio preferences
    await prisma.userPortfolioPreference.upsert({
      where: { walletAddress: agentWallet.walletAddress },
      update: {
        StablePercentage: portfolioPreset.stablePercentage,
        NativePercentage: portfolioPreset.nativePercentage,
        OtherPercentage: portfolioPreset.otherPercentage
      },
      create: {
        walletAddress: agentWallet.walletAddress,
        StablePercentage: portfolioPreset.stablePercentage,
        NativePercentage: portfolioPreset.nativePercentage,
        OtherPercentage: portfolioPreset.otherPercentage
      }
    });

    logInfo(`Agent wallet created: ${agentWallet.walletAddress} for user: ${userId}`);

    res.json({
      success: true,
      agentWallet: {
        agentId: dbAgentWallet.agentId,
        walletAddress: agentWallet.walletAddress,
        agentName: agentName,
        permissions: permissions,
        portfolioPreset: portfolioPreset
      },
      message: `Agent "${agentName}" created successfully`
    });

  } catch (error) {
    logError("Error creating agent wallet", error);
    res.status(500).json({
      success: false,
      error: "Failed to create agent wallet"
    });
  }
}) as RequestHandler);

// Get agent wallets for user
AgentWalletRouter.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const agentWallets = await prisma.agentWallet.findMany({
      where: { 
        userId: userId,
        isActive: true
      },
      select: {
        agentId: true,
        walletAddress: true,
        permissions: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      agentWallets: agentWallets
    });

  } catch (error) {
    logError("Error fetching agent wallets", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch agent wallets"
    });
  }
});

// Get agent wallet details
AgentWalletRouter.get("/:agentId", (async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const agentWallet = await prisma.agentWallet.findUnique({
      where: { agentId: agentId },
      select: {
        agentId: true,
        walletAddress: true,
        permissions: true,
        isActive: true,
        createdAt: true
      }
    });

    if (!agentWallet) {
      return res.status(404).json({
        success: false,
        error: "Agent wallet not found"
      });
    }

    res.json({
      success: true,
      agentWallet: agentWallet
    });

  } catch (error) {
    logError("Error fetching agent wallet", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch agent wallet"
    });
  }
}) as RequestHandler);

// Deactivate agent wallet
AgentWalletRouter.post("/:agentId/deactivate", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    await prisma.agentWallet.update({
      where: { agentId: agentId },
      data: { isActive: false }
    });

    logInfo(`Agent wallet deactivated: ${agentId}`);

    res.json({
      success: true,
      message: "Agent wallet deactivated successfully"
    });

  } catch (error) {
    logError("Error deactivating agent wallet", error);
    res.status(500).json({
      success: false,
      error: "Failed to deactivate agent wallet"
    });
  }
});

// Update agent permissions
AgentWalletRouter.put("/:agentId/permissions", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const { permissions } = req.body;

    await prisma.agentWallet.update({
      where: { agentId: agentId },
      data: { permissions: permissions }
    });

    logInfo(`Agent permissions updated: ${agentId}`);

    res.json({
      success: true,
      message: "Agent permissions updated successfully"
    });

  } catch (error) {
    logError("Error updating agent permissions", error);
    res.status(500).json({
      success: false,
      error: "Failed to update agent permissions"
    });
  }
}); 