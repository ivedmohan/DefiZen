import { Router } from "express";
import axios from "axios";
import express from "express";
import { Request,Response } from "express";
import { fetchTransactionByAgent, MakeDepositToAgent } from "../Functions/Autonomous";
import { maximiseProfit } from "../Functions/MaximisingStrategy";


export const AutonomousRouter:Router=express.Router();

AutonomousRouter.post("/createDeposit",async (req:Request, res:Response):Promise<any>=>{
    try{
     const { agentWallet, userWallet, amount, stopLoss, expectedProfit} = req.body;
     const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7)
     const {message, success,data} = await MakeDepositToAgent({
        agentWallet: agentWallet,
        userWallet : userWallet,
        amount : amount,
        stopLoss : stopLoss,
        expectedProfit,
        deadline
     });
    return res.status(200).send({
            message:message,
            success:success,
            data:data
    })
    }catch(err){
        console.log(err)
        return res.status(500).send({
            message:"error creating deposit to the agent wallet"
        })
    }
})

AutonomousRouter.get("/getTransactionsByAgent",async (req:Request, res:Response):Promise<any>=>{
    try{
        const {
            agentWalletAddress
        }=req.query;
        if(agentWalletAddress===undefined){
            return res.status(400).send({
                status:true,
                message:"Please provide the correct agent address"
            })
        }
        const result=await fetchTransactionByAgent(agentWalletAddress.toString())
        return res.send({
            status:true,
            message:result
        })
    }catch(err){
        console.log("Error fetching transactions:", err);
        return res.status(500).send({
            status: false,
            message: "Error fetching transactions"
        });
    }
});

// New route for autonomous profit maximization
AutonomousRouter.post("/maximizeProfit", async (req: Request, res: Response): Promise<any> => {
    try {
        const { agentId } = req.body;
        console.log("🚀 Starting autonomous profit maximization for:", agentId);
        
        // Import the AutonomousManager
        const { AutonomousManager } = await import("../Functions/AutonomousManager");
        
        // Execute autonomous strategy
        const result = await AutonomousManager.executeAutonomousStrategy(agentId);
        
        return res.status(200).send({
            success: result.success,
            message: result.summary,
            data: {
                actions: result.actions,
                agentId: agentId,
                timestamp: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error("❌ Error in autonomous profit maximization:", err);
        return res.status(500).send({
            success: false,
            message: "Error in autonomous profit maximization",
            error: err instanceof Error ? err.message : "Unknown error"
        });
    }
});

// New route for autonomous status
AutonomousRouter.get("/status", async (req: Request, res: Response): Promise<any> => {
    try {
        const { agentId } = req.query;
        
        if (!agentId) {
            return res.status(400).send({
                success: false,
                message: "Agent ID is required"
            });
        }

        const { AutonomousManager } = await import("../Functions/AutonomousManager");
        const status = await AutonomousManager.getDepositStatus(agentId.toString());
        
        return res.status(200).send({
            success: true,
            data: status
        });
    } catch (err) {
        console.error("❌ Error fetching autonomous status:", err);
        return res.status(500).send({
            success: false,
            message: "Error fetching autonomous status"
        });
    }
});

// NEW: Manual trigger for testing autonomous mode immediately
AutonomousRouter.post("/executeNow", async (req: Request, res: Response): Promise<any> => {
    try {
        const { agentWallet } = req.body;
        
        if (!agentWallet) {
            return res.status(400).send({
                success: false,
                message: "Agent wallet address is required"
            });
        }

        console.log(`🚀 Manual trigger: Executing autonomous strategy for ${agentWallet}`);
        
        const { AutonomousManager } = await import("../Functions/AutonomousManager");
        const result = await AutonomousManager.executeAutonomousStrategy(agentWallet);
        
        return res.status(200).send({
            success: result.success,
            message: result.summary,
            actions: result.actions,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error("❌ Error in manual autonomous execution:", err);
        return res.status(500).send({
            success: false,
            message: "Error executing autonomous strategy",
            error: err instanceof Error ? err.message : "Unknown error"
        });
    }
});

// NEW: Direct volatility swap endpoint for testing
AutonomousRouter.post("/swapVolatile", async (req: Request, res: Response): Promise<any> => {
    try {
        const { agentWallet } = req.body;
        
        if (!agentWallet) {
            return res.status(400).send({
                success: false,
                message: "Agent wallet address is required"
            });
        }

        console.log(`🔄 Volatility check triggered for ${agentWallet}`);
        
        const { SwapVolatileAssets } = await import("../Functions/FetchVolatileTokens");
        const result = await SwapVolatileAssets(agentWallet);
        
        return res.status(200).send({
            success: result?.success || false,
            message: result?.message || "Volatility check completed",
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error("❌ Error in volatility swap:", err);
        return res.status(500).send({
            success: false,
            message: "Error executing volatility swap",
            error: err instanceof Error ? err.message : "Unknown error"
        });
    }
});

// NEW: Manual withdrawal from StrkFarm
AutonomousRouter.post("/withdraw/strkfarm", async (req: Request, res: Response): Promise<any> => {
    try {
        const { tokenName, amount, userAddress } = req.body;
        
        if (!tokenName || !amount || !userAddress) {
            return res.status(400).send({
                success: false,
                message: "Missing required fields: tokenName, amount, userAddress"
            });
        }

        console.log(`💸 Withdrawing ${amount} ${tokenName} from StrkFarm for ${userAddress}`);
        
        const { WithDrawFunctionStrkFarm } = await import("../Functions/StrkFarm");
        const result = await WithDrawFunctionStrkFarm(tokenName, amount, userAddress);
        
        return res.status(200).send({
            success: true,
            message: "Withdrawal initiated successfully",
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error("❌ Error in StrkFarm withdrawal:", err);
        return res.status(500).send({
            success: false,
            message: "Error executing withdrawal from StrkFarm",
            error: err instanceof Error ? err.message : "Unknown error"
        });
    }
});

// NEW: Manual withdrawal from EnduFi
AutonomousRouter.post("/withdraw/endufi", async (req: Request, res: Response): Promise<any> => {
    try {
        const { amount, userAddress } = req.body;
        
        if (!amount || !userAddress) {
            return res.status(400).send({
                success: false,
                message: "Missing required fields: amount, userAddress"
            });
        }

        console.log(`💸 Withdrawing ${amount} from EnduFi for ${userAddress}`);
        
        const { WithDrawFunctionEndufi } = await import("../Functions/EnduFi");
        const result = await WithDrawFunctionEndufi("ETH", amount, userAddress);
        
        return res.status(200).send({
            success: true,
            message: "Withdrawal initiated successfully",
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error("❌ Error in EnduFi withdrawal:", err);
        return res.status(500).send({
            success: false,
            message: "Error executing withdrawal from EnduFi",
            error: err instanceof Error ? err.message : "Unknown error"
        });
    }
});

// NEW: Get yield positions for an agent
AutonomousRouter.get("/positions", async (req: Request, res: Response): Promise<any> => {
    try {
        const { agentWallet } = req.query;
        
        if (!agentWallet) {
            return res.status(400).send({
                success: false,
                message: "Agent wallet address is required"
            });
        }

        const { YieldPositionService } = await import("../Functions/YieldPositionService");
        
        const [activePositions, summary] = await Promise.all([
            YieldPositionService.getActivePositions(agentWallet.toString()),
            YieldPositionService.getTotalDeposited(agentWallet.toString())
        ]);
        
        return res.status(200).send({
            success: true,
            data: {
                activePositions,
                summary,
                timestamp: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error("❌ Error fetching yield positions:", err);
        return res.status(500).send({
            success: false,
            message: "Error fetching yield positions",
            error: err instanceof Error ? err.message : "Unknown error"
        });
    }
});

// NEW: Get position history
AutonomousRouter.get("/positions/history", async (req: Request, res: Response): Promise<any> => {
    try {
        const { agentWallet, limit } = req.query;
        
        if (!agentWallet) {
            return res.status(400).send({
                success: false,
                message: "Agent wallet address is required"
            });
        }

        const { YieldPositionService } = await import("../Functions/YieldPositionService");
        const history = await YieldPositionService.getPositionHistory(
            agentWallet.toString(),
            limit ? parseInt(limit.toString()) : 50
        );
        
        return res.status(200).send({
            success: true,
            data: {
                history,
                count: history.length,
                timestamp: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error("❌ Error fetching position history:", err);
        return res.status(500).send({
            success: false,
            message: "Error fetching position history",
            error: err instanceof Error ? err.message : "Unknown error"
        });
    }
});

export default AutonomousRouter;