import { Contract, RpcProvider } from "starknet";
import { FetchSupportedTokens } from "../utils/defiUtils";
import { ec } from "starknet";
import { Account } from "starknet";
import dotenv from "dotenv";
import { uint256 } from "starknet";
import { walletManager, WalletConfig } from "../utils/walletManager";
import { mockPrisma as prisma } from "../db-mock";

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


export const DepositFunctionEndufi = async (amount: string, agentWalletAddress: string) => {
    try {
        // Validate input
        if (!amount || isNaN(Number(amount))) {
            throw new Error("Invalid amount provided");
        }

        let contractAddress = ENDUFICONTRACT;
        if (contractAddress === "") {
            throw new Error("We currently don't support this token");
        }

        // Check if private key exists
        const privateKey = process.env.PVT_KEY || process.env.PRIVATE_KEY;
        if (!privateKey) {
            throw new Error("Private key not found in environment variables");
        }

        const uintAmount = uint256.bnToUint256((Number(amount) * (10 ** 18)).toString());
        
        // Use direct account creation with private key
        const account = new Account(provider, agentWalletAddress, privateKey);

        console.log("Executing deposit with amount:", uintAmount);
        console.log("Agent wallet address:", agentWalletAddress);
        console.log("Contract address:", contractAddress);
        
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

        // Wait for transaction confirmation
        await account.waitForTransaction(tx.transaction_hash, { retryInterval: 1000 });
        
        console.log("Transaction Hash:", tx.transaction_hash);
        return {
            success: true,
            transactionHash: tx.transaction_hash,
            message: "Deposit successful"
        };

    } catch (err) {
        console.error("Deposit error:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error occurred"
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
