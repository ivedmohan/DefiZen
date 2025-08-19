
import { Contract, RpcProvider } from "starknet";
import { FetchSupportedTokens } from "../utils/defiUtils";
import { ec } from "starknet";
import { Account } from "starknet";
import dotenv from "dotenv";
dotenv.config()
import { uint256 } from "starknet";

const provider = new RpcProvider({ nodeUrl: process.env.ALCHEMY_API_KEY });
const STRKFARMCONTRACTS={
    "usdt":"0x0115e94e722cfc4c77a2f15c4aefb0928c1c0029e5a57570df24c650cb7cec2c",
    "usdc":"0x00a858c97e9454f407d1bd7c57472fc8d8d8449a777c822b41d18e387816f29c",
    "strk":"0x07fb5bcb8525954a60fde4e8fb8220477696ce7117ef264775a1770e23571929",
    "eth":"0x05eaf5ee75231cecf79921ff8ded4b5ffe96be718bcb3daf206690ad1a9ad0ca"
}

// Token contract addresses on StarkNet
const TOKEN_ADDRESSES = {
    "usdt": "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
    "usdc": "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8", 
    "strk": "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    "eth": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
}

// Standard ERC20 ABI for token operations
const ERC20ABI = [
    {
        "type": "function",
        "name": "balanceOf",
        "inputs": [
            {
                "name": "account",
                "type": "core::starknet::contract_address::ContractAddress"
            }
        ],
        "outputs": [
            {
                "type": "core::integer::u256"
            }
        ],
        "state_mutability": "view"
    },
    {
        "type": "function", 
        "name": "allowance",
        "inputs": [
            {
                "name": "owner",
                "type": "core::starknet::contract_address::ContractAddress"
            },
            {
                "name": "spender", 
                "type": "core::starknet::contract_address::ContractAddress"
            }
        ],
        "outputs": [
            {
                "type": "core::integer::u256"
            }
        ],
        "state_mutability": "view"
    },
    {
        "type": "function",
        "name": "approve",
        "inputs": [
            {
                "name": "spender",
                "type": "core::starknet::contract_address::ContractAddress"
            },
            {
                "name": "amount",
                "type": "core::integer::u256"
            }
        ],
        "outputs": [
            {
                "type": "core::bool"
            }
        ],
        "state_mutability": "external"
    }
];

const getTokenAddress = (tokenName: string): string => {
    const normalizedName = tokenName.toLowerCase();
    const address = TOKEN_ADDRESSES[normalizedName as keyof typeof TOKEN_ADDRESSES];
    if (!address) {
        throw new Error(`Token address not found for: ${tokenName}`);
    }
    return address;
};


const depositWithdrawABI=[
    {
        "type": "function",
        "name": "deposit",
        "inputs": [
          {
            "name": "assets",
            "type": "core::integer::u256"
          },
          {
            "name": "receiver",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "external"
    },
    {
        "type": "function",
        "name": "withdraw",
        "inputs": [
          {
            "name": "assets",
            "type": "core::integer::u256"
          },
          {
            "name": "receiver",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "owner",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "balanceOf",
        "inputs": [
          {
            "name": "account",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_user_reward_info",
        "inputs": [
          {
            "name": "user",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "strkfarm_contracts::components::harvester::reward_shares::UserRewardsInfo"
          }
        ],
        "state_mutability": "view"
      },
      // {
      //   "type": "function",
      //   "name": "approve",
      //   "inputs": [
      //     {
      //       "name": "spender",
      //       "type": "core::starknet::contract_address::ContractAddress"
      //     },
      //     {
      //       "name": "amount",
      //       "type": "core::integer::u256"
      //     }
      //   ],
      //   "outputs": [
      //     {
      //       "type": "core::bool"
      //     }
      //   ],
      //   "state_mutability": "external"
      // }
]

const getContractAddress=(tokenName:string)=>{
    if(tokenName.toLowerCase().includes("usdc")){
        return STRKFARMCONTRACTS.usdc;
    }else if(tokenName.toLowerCase().includes("usdt")){
        return STRKFARMCONTRACTS.usdt
    }else if(tokenName.toLowerCase().includes("strk")){
        return STRKFARMCONTRACTS.strk
    }else if(tokenName.toLowerCase().includes("eth")){
        return STRKFARMCONTRACTS.eth
    }else{
        return "";
    }
}

export const DepositFunctionStrkFarm = async (tokenName:string, amount:string,accountAddress:string)=>{
    try{
        let contractAddress=getContractAddress(tokenName);
        const contract=new Contract(depositWithdrawABI,contractAddress,provider);
        
        // Check if private key exists
        const privateKey = process.env.PVT_KEY || process.env.PRIVATE_KEY;
        if (!privateKey) {
          throw new Error("Private key not found in environment variables");
        }
        
        const account = new Account(provider, accountAddress, privateKey);
        contract.connect(account);
        
        const tokenAddress=getTokenAddress(tokenName);
        let tokenContract=new Contract(ERC20ABI,tokenAddress,provider);
        tokenContract.connect(account)
        
        console.log("🔍 Checking token balance and allowances...");
        
        // Check user's token balance
        const userBalance = await tokenContract.call("balanceOf", [accountAddress]);
        console.log(`💰 User ${tokenName} balance:`, userBalance.toString());
        
        // Check max deposit limit
        const maxDeposit = await contract.call("max_deposit", [accountAddress]);
        console.log("📊 Max deposit allowed:", maxDeposit.toString());
        
        const depositAmount = BigInt(Number(amount) * 10 ** 18);
        const finalAmount = Number(depositAmount) > Number(maxDeposit) ? maxDeposit : depositAmount;
        
        // Validate user has enough tokens
        if (BigInt(userBalance.toString()) < BigInt(finalAmount.toString())) {
            throw new Error(`Insufficient ${tokenName} balance. Have: ${(Number(userBalance.toString()) / 10**18).toFixed(4)}, Need: ${(Number(finalAmount.toString()) / 10**18).toFixed(4)}`);
        }
        
        const uintAmount = uint256.bnToUint256(finalAmount.toString());
        console.log("💱 Final deposit amount:", (Number(finalAmount.toString()) / 10**18).toFixed(4), tokenName);
        
        // Check current allowance
        const currentAllowance = await tokenContract.call("allowance", [accountAddress, contractAddress]);
        console.log("� Current allowance:", currentAllowance.toString());
        
        const calls = [];
        
        // If allowance is insufficient, add approval call
        if (BigInt(currentAllowance.toString()) < BigInt(finalAmount.toString())) {
            console.log("� Adding token approval to transaction...");
            calls.push({
                contractAddress: tokenAddress,
                entrypoint: "approve",
                calldata: [contractAddress, uintAmount]
            });
        }
        
        // Add deposit call
        calls.push({
            contractAddress: contractAddress,
            entrypoint: "deposit",
            calldata: [uintAmount, accountAddress]
        });
        
        console.log("📋 Transaction calls:", calls.length, "operations");
        
        try {
            // Estimate fee first
            const feeEstimate = await account.estimateFee(calls);
            console.log("💰 Estimated fee:", feeEstimate.overall_fee.toString(), "wei");
            
            // Execute with proper fee
            const tx = await account.execute(calls, undefined, {
                maxFee: (BigInt(feeEstimate.overall_fee.toString()) * BigInt(150)) / BigInt(100) // 50% buffer
            });
          
            console.log("✅ StrkFarm Deposit Transaction Hash:", tx.transaction_hash);
            return `✅ Successfully deposited ${(Number(finalAmount.toString()) / 10**18).toFixed(4)} ${tokenName} to StrkFarm! TX: ${tx.transaction_hash}`;
          
        } catch (txError) {
            console.error("💥 Transaction execution failed:", txError);
            return `❌ Transaction failed: ${txError instanceof Error ? txError.message : 'Unknown transaction error'}`;
        }
    
    }catch(err){
        console.error("💥 StrkFarm deposit error:", err);
        return `❌ Deposit failed: ${err instanceof Error ? err.message : 'Unknown error occurred'}`;
    }
}
export const WithDrawFunctionStrkFarm = async (tokenName:string, amount:string,accountAddress:string)=>{
    try{
        let contractAddress=getContractAddress(tokenName);
        const contract=new Contract(depositWithdrawABI,contractAddress,provider);
        
        // Check if private key exists
        const privateKey = process.env.PVT_KEY || process.env.PRIVATE_KEY;
        if (!privateKey) {
          throw new Error("Private key not found in environment variables");
        }
        
        const account = new Account(provider, accountAddress, privateKey);
        contract.connect(account);
        
        console.log("🔍 Checking withdrawal limits...");
        
        const maxWithdraw= await contract.call(
          "max_withdraw",
          [
            accountAddress
          ]
        );
        
        const withdrawAmount = BigInt(Number(amount) * 10 ** 18);
        const finalAmount = Number(withdrawAmount) > Number(maxWithdraw) ? maxWithdraw : withdrawAmount;
        
        if (BigInt(maxWithdraw.toString()) === BigInt(0)) {
            throw new Error("No funds available for withdrawal");
        }
        
        const uintAmount = uint256.bnToUint256(finalAmount.toString());
        console.log("💱 Final withdrawal amount:", (Number(finalAmount.toString()) / 10**18).toFixed(4), tokenName);
        
        try {
            // Estimate fee first
            const withdrawCalls = [{
                contractAddress: contractAddress,
                entrypoint: "withdraw",
                calldata: [
                    uintAmount,
                    accountAddress,
                    accountAddress
                ]
            }];
            
            const feeEstimate = await account.estimateFee(withdrawCalls);
            console.log("💰 Estimated fee:", feeEstimate.overall_fee.toString(), "wei");
            
            const tx = await account.execute(withdrawCalls, undefined, {
                maxFee: (BigInt(feeEstimate.overall_fee.toString()) * BigInt(150)) / BigInt(100) // 50% buffer
            });
            
            console.log("✅ StrkFarm Withdrawal Transaction Hash:", tx.transaction_hash);
            return `✅ Successfully withdrew ${(Number(finalAmount.toString()) / 10**18).toFixed(4)} ${tokenName} from StrkFarm! TX: ${tx.transaction_hash}`;
            
        } catch (txError) {
            console.error("💥 Withdrawal transaction failed:", txError);
            return `❌ Withdrawal failed: ${txError instanceof Error ? txError.message : 'Unknown transaction error'}`;
        }
        
    }catch(err){
        console.error("💥 StrkFarm withdrawal error:", err);
        return `❌ Withdrawal failed: ${err instanceof Error ? err.message : 'Unknown error occurred'}`;
    }
}
