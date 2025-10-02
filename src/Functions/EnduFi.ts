import { Contract, RpcProvider } from "starknet";
import { FetchSupportedTokens } from "../utils/defiUtils";
import { ec } from "starknet";
import { Account } from "starknet";
import dotenv from "dotenv";
import { uint256 } from "starknet";
import { walletManager, WalletConfig } from "../utils/walletManager";
import { prisma } from "../db";

dotenv.config()

const provider = new RpcProvider({ nodeUrl: process.env.ALCHEMY_API_KEY });
const ENDUFICONTRACT="0x28d709c875c0ceac3dce7065bec5328186dc89fe254527084d1689910954b0a";

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
  },
  {
    "type": "function",
    "name": "max_withdraw",
    "inputs": [
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
    "state_mutability": "view"
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
  }
]


export async function DepositEnduFi(
    agentWalletAddress: string,
    amount: string,
    contractAddress: string = ENDUFICONTRACT
): Promise<any> {
    try {
        console.log(`🏦 Starting EnduFi deposit for ${amount} ETH`);
        console.log(`📋 Agent wallet: ${agentWalletAddress}`);
        console.log(`💰 Amount: ${amount}`);
        console.log(`🏢 Contract: ${contractAddress}`);

        // Validate inputs
        if (!agentWalletAddress || !amount || !contractAddress) {
            const errorMsg = "Missing required parameters for EnduFi deposit";
            console.error(`❌ ${errorMsg}`);
            return {
                success: false,
                message: errorMsg,
                details: "Please provide agentWalletAddress, amount, and contractAddress"
            };
        }

        // Validate amount
        if (parseFloat(amount) <= 0) {
            const errorMsg = "Amount must be greater than 0";
            console.error(`❌ ${errorMsg}`);
            return {
                success: false,
                message: errorMsg,
                providedAmount: amount
            };
        }

        // Get agent wallet configuration
        const agentWallet = await prisma.agentWallet.findUnique({
            where: { walletAddress: agentWalletAddress }
        });

        if (!agentWallet) {
            const errorMsg = `Agent wallet not found: ${agentWalletAddress}`;
            console.error(`❌ ${errorMsg}`);
            return {
                success: false,
                message: errorMsg,
                suggestion: "Please ensure the agent wallet is properly configured"
            };
        }

        console.log("✅ Agent wallet found successfully");

        // Create contract instance
        const contract = new Contract(depositWithdrawABI, contractAddress, provider);
        console.log("✅ Contract instance created");

        // Get wallet configuration for validation
        const permissions = typeof agentWallet.permissions === 'object' && agentWallet.permissions !== null
            ? agentWallet.permissions as any
            : {
                canDeposit: true,
                canWithdraw: true,
                canSwap: true,
                maxTransactionSize: 1000000,
                dailyLimit: 10000000
            };

        const walletConfig: WalletConfig = {
            walletAddress: agentWallet.walletAddress,
            encryptedPrivateKey: agentWallet.encryptedPrivateKey,
            permissions: permissions
        };

        // Validate transaction with enhanced security
        console.log("🔐 Validating transaction security...");
        const isValid = await walletManager.validateTransaction(
            walletConfig,
            Number(amount),
            'deposit'
        );

        if (!isValid) {
            const errorMsg = "Transaction not allowed for this agent - security validation failed";
            console.error(`❌ ${errorMsg}`);
            return {
                success: false,
                message: errorMsg,
                details: {
                    maxDailyLimit: permissions.dailyLimit,
                    requestedAmount: amount,
                    permissions: permissions
                }
            };
        }

        console.log("✅ Security validation passed");

        // Get secure account instance
        console.log("🔑 Getting secure account access...");
        const account = await walletManager.getAccount(
            agentWallet.walletAddress,
            agentWallet.encryptedPrivateKey
        );
        
        if (!account) {
            const errorMsg = "Failed to access agent wallet account";
            console.error(`❌ ${errorMsg}`);
            return {
                success: false,
                message: errorMsg,
                suggestion: "Please check wallet encryption and private key"
            };
        }

        contract.connect(account);
        console.log("✅ Account connected to contract");

        // Convert amount to wei (18 decimals)
        const depositAmount = BigInt(Number(amount) * 10 ** 18);
        const uintAmount = uint256.bnToUint256(depositAmount.toString());
        
        console.log(`💱 Deposit amount in wei: ${depositAmount.toString()}`);

        // Check ETH balance before deposit
        try {
            console.log("💰 Checking ETH balance...");
            // Note: This is a simplified balance check - in production you'd want to check actual ETH balance
            console.log("⚠️ Balance check skipped - implement ETH balance verification");
        } catch (balanceError: any) {
            console.error("❌ Error checking balance:", balanceError);
            return {
                success: false,
                message: "Failed to verify account balance",
                error: balanceError?.message || balanceError,
                suggestion: "Please ensure wallet has sufficient ETH balance"
            };
        }

        // Execute deposit transaction - let starknet.js automatically determine the best version
        console.log("🚀 Executing deposit transaction...");
        try {
            const tx = await account.execute([
                {
                    contractAddress: contractAddress,
                    entrypoint: "deposit",
                    calldata: [
                        uintAmount,
                        agentWalletAddress
                    ]
                }
            ]);

            console.log(`📝 Transaction submitted: ${tx.transaction_hash}`);
            console.log("⏳ Waiting for transaction confirmation...");

            // Wait for transaction confirmation with timeout
            const receipt = await account.waitForTransaction(tx.transaction_hash, { 
                retryInterval: 2000,
                successStates: ["ACCEPTED_ON_L2", "ACCEPTED_ON_L1"]
            });

            if (receipt.execution_status === "SUCCEEDED") {
                console.log("🎉 EnduFi deposit successful!");
                
                // Update wallet activity
                await prisma.agentWallet.update({
                    where: { walletAddress: agentWalletAddress },
                    data: { 
                        updatedAt: new Date()
                    }
                });

                return {
                    success: true,
                    message: "Successfully deposited to EnduFi",
                    transactionHash: tx.transaction_hash,
                    details: {
                        agentWallet: agentWalletAddress,
                        amount: amount,
                        amountInWei: depositAmount.toString(),
                        contractAddress,
                        executionStatus: receipt.execution_status,
                        gasUsed: receipt.actual_fee,
                        blockNumber: receipt.block_number
                    },
                    explorerUrl: `https://starkscan.co/tx/${tx.transaction_hash}`
                };
            } else {
                const errorMsg = "EnduFi deposit transaction failed";
                console.error(`❌ ${errorMsg} - Status: ${receipt.execution_status}`);
                return {
                    success: false,
                    message: errorMsg,
                    transactionHash: tx.transaction_hash,
                    executionStatus: receipt.execution_status,
                    explorerUrl: `https://starkscan.co/tx/${tx.transaction_hash}`
                };
            }

        } catch (txError: any) {
            console.error("❌ Transaction execution failed:", txError);
            return {
                success: false,
                message: "Failed to execute EnduFi deposit transaction",
                error: txError?.message || txError,
                suggestion: "Please check transaction parameters and network connectivity"
            };
        }

    } catch (error: any) {
        console.error("❌ Critical error in EnduFi deposit:", error);
        return {
            success: false,
            message: "Critical error during EnduFi deposit process",
            error: error?.message || error,
            details: {
                agentWallet: agentWalletAddress,
                amount,
                contractAddress
            },
            suggestion: "Please verify all parameters and try again"
        };
    }
}


export const WithDrawFunctionEndufi = async (tokenName: string, amount: string, agentWalletAddress: string) => {
    try {
        // Validate input
        if (!amount || isNaN(Number(amount))) {
            throw new Error("Invalid amount provided");
        }

        let contractAddress = ENDUFICONTRACT;
        const contract = new Contract(depositWithdrawABI, contractAddress, provider);
        
        // Get agent wallet configuration
        const agentWallet = await prisma.agentWallet.findUnique({
            where: { walletAddress: agentWalletAddress }
        });

        if (!agentWallet) {
            throw new Error("Agent wallet not found");
        }

        // Validate transaction permissions
        const walletConfig: WalletConfig = {
            walletAddress: agentWallet.walletAddress,
            encryptedPrivateKey: agentWallet.encryptedPrivateKey,
            permissions: agentWallet.permissions as any
        };

        const isValid = await walletManager.validateTransaction(
            walletConfig,
            Number(amount),
            'withdraw'
        );

        if (!isValid) {
            throw new Error("Transaction not allowed for this agent");
        }

        // Use secure wallet manager
        const account = await walletManager.getAccount(
            agentWallet.walletAddress,
            agentWallet.encryptedPrivateKey
        );
        
        contract.connect(account);
        
        const maxWithdraw = await contract.call(
            "max_withdraw",
            [agentWalletAddress]
        );
        
        console.log("The maximum withdraw is", maxWithdraw.toString());
        
        const withdrawAmount = BigInt(Number(amount) * 10 ** 18);
        const finalAmount = Number(withdrawAmount) > Number(maxWithdraw) ? maxWithdraw : withdrawAmount;
        const uintAmount = uint256.bnToUint256(finalAmount.toString());
        
        console.log("the withdraw amount is", withdrawAmount);
        
        const tx = await account.execute([
            {
                contractAddress: contractAddress,
                entrypoint: "withdraw",
                calldata: [
                    uintAmount,
                    agentWalletAddress,
                    agentWalletAddress
                ]
            }
        ]);

        // Wait for transaction confirmation
        await account.waitForTransaction(tx.transaction_hash, { retryInterval: 1000 });
        
        console.log("Executed withdraw successfully Transaction Hash:", tx.transaction_hash);
        
        // Mark position as withdrawn in database
        try {
            const { YieldPositionService } = await import('./YieldPositionService');
            await YieldPositionService.markAsWithdrawn(
                agentWalletAddress,
                tokenName,
                'EnduFi',
                amount
            );
        } catch (dbError) {
            console.error('Failed to update DB (withdrawal still succeeded):', dbError);
        }
        
        return {
            success: true,
            transactionHash: tx.transaction_hash,
            message: "Withdrawal successful"
        };
        
    } catch (err) {
        console.error("Withdrawal error:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error occurred"
        };
    }
}

// Export aliases for backward compatibility
export const DepositFunctionEndufi = DepositEnduFi;
