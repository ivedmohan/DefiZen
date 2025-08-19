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