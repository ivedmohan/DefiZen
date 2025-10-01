import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser = require("body-parser");
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { chatFunction } from "./Agents/agentService";
import { UserPortfolioRouter } from "./Routes/UserPortfolio";
import { RebalancePortfolioRouter } from "./Routes/RebalancingPortfolio";
import { FetchVolatileTokens } from "./Functions/FetchVolatileTokens";
import { SwapVolatileAssets } from "./Functions/FetchVolatileTokens";
import { CronJob, CronTime } from 'cron';
import { RebalancerReusableFunction } from "./Functions/Portfolio";
import { prisma } from "./db";
// import { UserContactRouter } from "./Routes/UserContact"; // Temporarily disabled
import { AutonomousRouter } from "./Routes/Autonomous";
import { DepositWithdrawRouter } from "./Routes/DepositWithdraw";
import { AgentWalletRouter } from "./Routes/AgentWallet";
import { WithDrawFunctionEndufi } from "./Functions/EnduFi";
import { DepositFunctionStrkFarm } from "./Functions/StrkFarm";
import { errorHandler, setupGlobalErrorHandlers, notFoundHandler } from "./middleware/errorHandler";

dotenv.config()

// Setup global error handlers
setupGlobalErrorHandlers();

const app: Express = express();

// Security middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
app.use("/userPortfolio",UserPortfolioRouter);
app.use("/autonomous",AutonomousRouter);
app.use("/rebalance",RebalancePortfolioRouter);
// app.use("/userContact",UserContactRouter); // Temporarily disabled
app.use("/depositWithdraw",DepositWithdrawRouter);
app.use("/agent/wallet",AgentWalletRouter);


const PORT = process.env.PORT || 3002;



const rebalancerJob=new CronJob(
     '0 0 */6 * * *',
     async function(){
      console.log("🔄 Running rebalancer job...");
      const UserPreference=await prisma.userPortfolioPreference.findMany();
      await Promise.all(UserPreference.map(async (item: any)=>{
        await RebalancerReusableFunction(
          item.StablePercentage,
          item.NativePercentage,
          item.OtherPercentage,
          item.walletAddress
        ); 
      }))
      console.log("✅ Rebalancer job completed.");  
     },
     ()=>{
      console.log("Ran the rebalance function")
     },
	  true,
	'Asia/Kolkata'
)


const volatileJob=new CronJob(
  '0 0 */6 * * *',
  async function(){
    console.log("🔄 Running volatile asset swapping job...");
    const user=await prisma.user.findMany();
    const response=await Promise.all(user.map(async (item: any)=>{
      const result= await SwapVolatileAssets(item.walletAddress);
      return result
    }))
    console.log("✅ Volatile Balancer Cron job completed.");  
   },
   ()=>{
    console.log("Ran the Volatile Asset Swapping function")
   },
  true,
'Asia/Kolkata'
)

// NEW: Autonomous Trading Cron Job
const autonomousJob=new CronJob(
  '0 0 */1 * * *',  // Every 1 hour (changed from 6 hours for demo)
  async function(){
    console.log("🤖 Running autonomous trading job...");
    
    try {
      // Get all unique agent wallets with active deposits
      const deposits = await prisma.deposit.findMany({
        select: {
          agentWallet: true
        },
        distinct: ['agentWallet']
      });
      
      console.log(`Found ${deposits.length} agent wallet(s) to process`);
      
      // Execute strategy for each agent wallet
      const { AutonomousManager } = await import("./Functions/AutonomousManager");
      
      for (const deposit of deposits) {
        console.log(`\n🎯 Processing agent: ${deposit.agentWallet}`);
        
        try {
          const result = await AutonomousManager.executeAutonomousStrategy(deposit.agentWallet);
          
          if (result.success) {
            console.log(`✅ ${result.summary}`);
          } else {
            console.log(`ℹ️  ${result.summary}`);
          }
        } catch (agentError) {
          console.error(`❌ Error processing agent ${deposit.agentWallet}:`, agentError);
        }
      }
      
      console.log("\n✅ Autonomous trading job completed.");
    } catch (error) {
      console.error("❌ Autonomous job error:", error);
    }
   },
   ()=>{
    console.log("Autonomous trading job initialized")
   },
  true,
'Asia/Kolkata'
)




app.get("/", async (req: Request, res: Response):Promise<any> => {
    try{
    const {message}=req.body;
    const result = await generateText({
            model: anthropic("claude-3-5-sonnet-latest"),
            prompt: `${message}`,
            system:"You are a traditional Defi agent which has access to various information about decentralized finance, use it and work your best"
    })
    console.log(JSON.stringify(result.response.body, null, 2));
    return res.send({
        message:result.text
    })
    }catch(err){

    }
  });

app.post("/agent", async (req:Request, res:Response):Promise<any> =>{
    try{
        const result=await chatFunction(req.body.messages, req.body.address);
        console.log(result,"The result of the agent is")
        return res.send({
            message:result
        })
    }catch(err){
        console.log(err,"Faced this error")
        return res.status(500).send({
            message:"Couldnt initialise the agent"
        })
    }
})

app.get("/volatile", async (req: Request, res: Response) => {
  try {
    const result= await FetchVolatileTokens();
    res.json({
        data:result?.volatileTokensData
    });
  } catch (error) {
    console.error("Error in /volatile endpoint:", error);
    res.status(500).json({ 
      error: "Failed to fetch token price changes",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.post('/depositStrkFarm',async (req: Request, res: Response) => {
  try {
    const {
      tokenName,
      amount,
      accountAddress,
    }=req.body;
    const result= await DepositFunctionStrkFarm(tokenName,amount,accountAddress)
    //const result=await WithDrawFunctionEndufi(tokenName,amount,accountAddress);
    console.log(result)
    res.json({
        data:"Hello deposit successfully"
    });
  } catch (error) {
    console.error("Error in /volatile endpoint:", error);
    res.status(500).json({ 
      error: "Failed to fetch token price changes",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});



// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(`${PORT}`, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
  

