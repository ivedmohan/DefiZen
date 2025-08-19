import axios from "axios";
import express from "express";
import dotenv from "dotenv";
import { Request,Response } from "express";
import { fetchUserPortfolio } from "../Functions/Portfolio";
import { mockPrisma as prisma } from "../db-mock";
dotenv.config()

export const UserPortfolioRouter=express.Router();

UserPortfolioRouter.get("/",async (req:Request,res:Response):Promise<any>=>{
    try{ 
        const {
            agentWalletAddress,
        }=req.query;
        console.log("the agent wallet Address is:",agentWalletAddress)
        if(agentWalletAddress==="" || agentWalletAddress===undefined) return res.send({
            data:"Please connect your wallet"
        })
        const userPortfolio=await fetchUserPortfolio(agentWalletAddress.toString())
        console.log("the user portfolio is",userPortfolio);
	    return res.json({
        userPortfolio,
	  });
    }catch(err){
        console.log("error fetching user portfolio",err)
        return res.status(500).json({
            message:"Error fetching the user portfolio"
        })
    }
})

// Add the missing agentTotal route
UserPortfolioRouter.get("/agentTotal", async (req: Request, res: Response): Promise<any> => {
    try {
        const { agentWalletAddress } = req.query;
        
        if (!agentWalletAddress) {
            return res.status(400).json({
                message: "Agent wallet address is required"
            });
        }

        // Get all deposits for this agent
        const deposits = await prisma.deposit.findMany({
            where: {
                agentWallet: agentWalletAddress.toString()
            }
        });

        // Get all trades for this agent  
        const trades = await prisma.trade.findMany({
            where: {
                agentWallet: agentWalletAddress.toString()
            }
        });

        // Calculate total deposited, total trades value, etc.
        const totalDeposited = deposits.reduce((sum, deposit) => {
            return sum + parseFloat(deposit.amount || "0");
        }, 0);

        const totalTradesValue = trades.reduce((sum, trade) => {
            return sum + parseFloat(trade.amount || "0");
        }, 0);

        const agentTotal = {
            agentWalletAddress: agentWalletAddress.toString(),
            totalDeposited: totalDeposited.toFixed(2),
            totalTrades: trades.length,
            totalTradesValue: totalTradesValue.toFixed(2),
            deposits: deposits,
            trades: trades,
            lastActivity: deposits.length > 0 ? deposits[deposits.length - 1].createdAt : null
        };

        return res.json({
            success: true,
            agentTotal
        });

    } catch (err) {
        console.log("Error fetching agent total:", err);
        return res.status(500).json({
            message: "Error fetching agent total",
            error: err
        });
    }
});

