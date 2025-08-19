import { Token, TokenMetadata, TokenBalance, ProtocolConfig, ChainData, TokenForPortfolio } from '../types/defi';
import { RpcProvider, Contract, Call, constants, Provider } from 'starknet';
import { LP_ABI, ERC20_ABI, STAKING_ABI } from '../constants/contracts';
import axios from 'axios';
import { Fraction, Percent } from "@uniswap/sdk-core";
import { ProtocolConfigObject } from '../config/protocolConfig';
import dotenv from 'dotenv';
import { mockPrisma as prisma } from '../db-mock';
dotenv.config()

const protocolConfig: ProtocolConfig = ProtocolConfigObject
const PERCENTAGE_INPUT_PRECISION = 2;

if (!process.env.ALCHEMY_API_KEY) {
	throw new Error("Alchemy API configuration is missing");
}

export const provider = new Provider({
	nodeUrl:`${process.env.ALCHEMY_API_KEY}`
});

export function convertAmountToSmallestUnit(amount: string, decimals: number): string {
	const amountNum = parseFloat(amount);
	if (isNaN(amountNum)) {
		throw new Error(`Invalid amount: ${amount}`);
	}
	const factor = 10 ** decimals;
	return (amountNum * factor).toFixed(0);
}

export function splitUint256(amount: string): { low: string; high: string } {
	const amountBigInt = BigInt(amount);
	const maxUint128 = BigInt("0x100000000000000000000000000000000");
	return {
		low: (amountBigInt % maxUint128).toString(),
		high: (amountBigInt / maxUint128).toString()
	};
}

export function stringToFelt252(str: string): string {
	let hex = "0x";
	for (let i = 0; i < str.length; i++) {
		const charHex = str.charCodeAt(i).toString(16).padStart(2, "0");
		hex += charHex;
	}
	return BigInt(hex).toString();
}

export function hexToDecimalString(hex: string): string {
	return hex.startsWith("0x") ? BigInt(hex).toString(10) : hex;
}

export function replacePlaceholders(str: string, params: Record<string, string | undefined>): string {
	return str.replace(/\{([^}]+)\}/g, (match, p1) => {
		const value = params[p1];
		if (value === undefined) {
			throw new Error(`Missing parameter "${p1}" for transaction generation.`);
		}
		return value;
	});
}

export function getDeadline(bufferMinutes: number = 15): string {
	return (Math.floor(Date.now() / 1000) + bufferMinutes * 60).toString();
}

export function parseUnderlyingTokens(pairKey: string): string[] {
	return pairKey.split('/');
}

export function reconstructUint256(low: string | number | bigint, high: string | number | bigint): bigint {
	const lowBigInt = BigInt(low);
	const highBigInt = BigInt(high);
	return (highBigInt << BigInt(128)) + lowBigInt;
}

export const FetchSupportedTokens=async():Promise<Token[]>=>{
	try{
		const tokens=await prisma.token.findMany();
		
		// If database returns no tokens, use fallback list of common StarkNet tokens
		if (tokens.length === 0) {
			console.log("Database has no tokens, using fallback list of common StarkNet tokens");
			return [
				{
					name: "USDC",
					decimals: 6,
					token_address: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
					image: "/images/tokens/usdc.svg",
					type: "ERC20",
					chain_id: 1
				},
				{
					name: "USDT",
					decimals: 6,
					token_address: "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
					image: "/images/tokens/usdt.svg",
					type: "ERC20",
					chain_id: 1
				},
				{
					name: "ETH",
					decimals: 18,
					token_address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
					image: "/images/tokens/eth.svg",
					type: "ERC20",
					chain_id: 1
				},
				{
					name: "STRK",
					decimals: 18,
					token_address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
					image: "/images/tokens/strk.svg",
					type: "ERC20",
					chain_id: 1
				},
				{
					name: "DAI",
					decimals: 18,
					token_address: "0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3",
					image: "/images/tokens/dai.svg",
					type: "ERC20",
					chain_id: 1
				}
			] as Token[];
		}
		
		return tokens;
	}catch(err){
		console.log("Couldnt fetch the supported tokens, using fallback list");
		// Return common StarkNet tokens as fallback
		return [
			{
				name: "USDC",
				decimals: 6,
				token_address: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
				image: "/images/tokens/usdc.svg",
				type: "ERC20",
				chain_id: 1
			},
			{
				name: "USDT",
				decimals: 6,
				token_address: "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
				image: "/images/tokens/usdt.svg",
				type: "ERC20",
				chain_id: 1
			},
			{
				name: "ETH",
				decimals: 18,
				token_address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
				image: "/images/tokens/eth.svg",
				type: "ERC20",
				chain_id: 1
			},
			{
				name: "STRK",
				decimals: 18,
				token_address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
				image: "/images/tokens/strk.svg",
				type: "ERC20",
				chain_id: 1
			},
			{
				name: "DAI",
				decimals: 18,
				token_address: "0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3",
				image: "/images/tokens/dai.svg",
				type: "ERC20",
				chain_id: 1
			}
		] as Token[];
	}
}

export function extractDefiTokens(): Set<TokenMetadata> {
	const defiTokens = new Set<TokenMetadata>();

	// Get staking contract addresses with metadata
	Object.values(protocolConfig.protocols.Nostra.contracts.assets).forEach((asset: any) => {
		if (asset.stakingContractAddress) {
			defiTokens.add({
				address: asset.stakingContractAddress,
				underlyingAddress: asset.assetContractAddress,
				decimals: asset.decimals,
				name: asset.label || `Nostra staked ${asset.symbol}`,
				symbol: asset.name || asset.symbol,
				type: "staking",
			});
		}
	});

	// Get pair addresses with metadata
	Object.values(protocolConfig.protocols.Nostra.contracts.pairs).forEach((pair: any) => {
		if (pair.pairAddress) {
			defiTokens.add({
				address: pair.pairAddress,
				asset0: pair.asset0,
				asset1: pair.asset1,
				decimals: pair.decimals,
				name: pair.name,
				symbol: pair.symbol,
				type: "pair",
			});
		}
	});

	return defiTokens;
}

export function prepareTokensToCheck(tokens: any[], defiTokens: Set<TokenMetadata>): any[] {
	return [
		...tokens,
		...Array.from(defiTokens).map(token => ({
			address: token.address,
			name: token.name,
		}))
	];
}

export async function fetchTokenPrices(
	tokensToCheck: any[],
	// defiTokens: Set<TokenMetadata>,
): Promise<Map<string, number>> {
	const tokenPrices = new Map<string, number>();
  
	try {
		// Fetch regular token prices
		const regularPricePromises = tokensToCheck.map(async (token: any) => {
			try {
				const price = await getTokenPrice(token.token_address);
				tokenPrices.set(token.token_address, price);
			} catch (error) {
				console.warn(`Failed to fetch price for regular token ${token.address}`);
			}
		});

		// Fetch DeFi token prices
		// const defiPricePromises = Array.from(defiTokens).map(async (token: TokenMetadata) => {
		// 	try {
		// 		if (token.type === "pair" && token.asset0 && token.asset1) {
		// 			const price = await getLPTokenPrice(token.address, "Nostra", [token.asset0, token.asset1]);
		// 			tokenPrices.set(token.address, price);
		// 		} else if (token.type === "staking" && token.underlyingAddress) {
		// 			const price = await getStakedAssetPrice(token.underlyingAddress, token.address);
		// 			tokenPrices.set(token.address, price);
		// 		}
		// 	} catch (error) {
		// 		console.warn(`Failed to fetch price for DeFi token ${token.address}`);
		// 	}
		// });

		// await Promise.all([...regularPricePromises, ...defiPricePromises]);
		await Promise.all([...regularPricePromises])
	} catch (error) {
		console.error("Failed to fetch token prices:", error);
	}

	return tokenPrices;
}


const erc20Abi = [
	{
		"inputs": [
		  {
			"name": "account",
			"type": "felt"
		  }
		],
		"name": "balanceOf",
		"outputs": [
		  {
			"name": "balance",
			"type": "Uint256"
		  }
		],
		"stateMutability": "view",
		"type": "function"
	  },
];


export async function fetchTokenBalance(
	token: any,
	walletAddress: string,
	tokenPrices: Map<string, number>,
): Promise<TokenForPortfolio> {
	try {
		// console.log("the data is",walletAddress,token)
		const get_abi = provider.getClassAt(token.address);
		const contract = new Contract((await get_abi).abi, token.address, provider);
		const balance = await contract.call("balanceOf", [walletAddress]);
		const tokenPrice = tokenPrices.get(token.address);
		console.log(balance,token.decimals)
		if (!balance) {
			return {
				address: token.address,
				name: token.name,
				balance: "0",
				decimals: token.decimals.toString(),
				valueUsd: "0",
				image: token.image,
				type : token.type,
				priceUsd: tokenPrice?.toString() || "0"
			};
		}

		const balanceInSmallestUnit = balance.toString()
		const balanceInTokens = Number(balanceInSmallestUnit) / 10**token.decimals;
		
		// Ensure we have valid numbers and handle NaN cases
		const validBalanceInTokens = isNaN(balanceInTokens) ? 0 : balanceInTokens;
		const validTokenPrice = tokenPrice && !isNaN(tokenPrice) ? tokenPrice : 0;
		const valueUsd = validTokenPrice ? (validBalanceInTokens * validTokenPrice).toFixed(2) : "0.00";
		
		console.log(balanceInSmallestUnit,validBalanceInTokens,validTokenPrice,valueUsd)
		return {
			name: token.name,
			balance: validBalanceInTokens.toString(),
			valueUsd : valueUsd,
			decimals : token.decimals,
			address: token.address,
			image: token.image,
			type : token.type,
			priceUsd : validTokenPrice.toString()
		};
	} catch (error) {
		console.error(`Failed to fetch balance for token ${token.address}:`, error);
		return {
			address: token.address,
			name: token.name,
			balance: "0",
			decimals: token.decimals.toString(),
			valueUsd: "0",
			image: token.image,
			type : token.type,
			priceUsd:"0.00"
		};
	}
}

export function filterNonZeroBalances(balances: TokenBalance[]): TokenBalance[] {
	return balances.filter(balance =>
		balance.valueUSD !== null && parseFloat(balance.valueUSD) > 0
	);
}

export async function getTokenPrice(
	tokenAddress: string,
): Promise<number> {
	try {
		console.log("The token address is:",tokenAddress)
		const { data } = await axios.get(`https://starknet.impulse.avnu.fi/v1/tokens/${tokenAddress}/prices/line`);
		const currentPrice = data[data.length - 1]?.value;
		console.log("the current price is",currentPrice);
		if (!currentPrice) {
			throw new Error(`No price data available for token ${tokenAddress}`);
		}
		return currentPrice;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error(`Failed to fetch price for token ${tokenAddress}: ${error.message}`);
		}
		throw error;
	}
}

export async function getStakedAssetPrice(
	underlyingAddress: string,
	stakingContractAddress: string,
	decimals: number = 18,
): Promise<number> {
	try {

		// Get the underlying asset price
		const underlyingPrice = await getTokenPrice(underlyingAddress);

		// Get the conversion index
		const stakingContract = new Contract(
			STAKING_ABI,
			stakingContractAddress,
			provider
		);

		const indexResult = await stakingContract.call("token_index", [] as const);
		const conversionIndex = Number(indexResult) / (10 ** decimals);

		// Calculate the staked token price by multiplying underlying price with the conversion index
		return underlyingPrice * conversionIndex;
	} catch (error) {
		console.warn(`Failed to fetch staked asset price for ${stakingContractAddress}:`, error);
		return 0;
	}
}

export async function getLPTokenPrice(
	poolAddress: string,
	protocol: string,
	underlyingTokens: string[]
): Promise<number> {
	try {
		const poolContract = new Contract(
			LP_ABI,
			poolAddress,
			provider
		);

		// Get pool data
		const [reservesResult, totalSupplyResult] = await Promise.all([
			poolContract.call("get_reserves", [] as const),
			poolContract.call("total_supply", [] as const)
		]) as [{ reserve0: [string, string]; reserve1: [string, string] }, { supply: [string, string] }];

		// Reconstruct reserves and total supply
		const reserve0 = reconstructUint256(reservesResult.reserve0[0], reservesResult.reserve0[1]);
		const reserve1 = reconstructUint256(reservesResult.reserve1[0], reservesResult.reserve1[1]);
		const totalSupply = reconstructUint256(totalSupplyResult.supply[0], totalSupplyResult.supply[1]);

		// get tokens address from getTokensFromS3
		const tokens = await FetchSupportedTokens()
		const token0Config = tokens.find((token: any) => token.symbol === underlyingTokens[0]);
		const token1Config = tokens.find((token: any) => token.symbol === underlyingTokens[1]);

		if (!token0Config || !token1Config) {
			throw new Error(`Token config not found for ${underlyingTokens[0]} or ${underlyingTokens[1]}`);
		}

		// Get underlying token prices
		const token0Price = await getTokenPrice(
			token0Config?.token_address,
		);
		const token1Price = await getTokenPrice(
			token1Config?.token_address
		);

		// Calculate reserves in USD
		const reserve0USD = Number(reserve0) * token0Price / (10 ** token0Config.decimals);
		const reserve1USD = Number(reserve1) * token1Price / (10 ** token1Config.decimals);

		// Total pool value in USD
		const totalPoolValueUSD = reserve0USD + reserve1USD;

		// Price per LP token = Total Pool Value / Total Supply
		return totalPoolValueUSD / (Number(totalSupply) / (10 ** 18));
	} catch (error) {
		console.warn(`Failed to calculate LP token price for pool ${poolAddress}:`, error);
		return 0;
	}
}

export const parseFormatedAmount = (amount: string) => amount.replace(/,/g, '')

export const parseFormatedPercentage = (percent: string) =>
	new Percent(+percent * 10 ** PERCENTAGE_INPUT_PRECISION, 100 * 10 ** PERCENTAGE_INPUT_PRECISION)

interface ParseCurrencyAmountOptions {
	fixed: number
	significant?: number
}

export const formatCurrenyAmount = (amount: Fraction, { fixed, significant = 1 }: ParseCurrencyAmountOptions) => {
	const fixedAmount = amount.toFixed(fixed)
	const significantAmount = amount.toSignificant(significant)

	if (+significantAmount > +fixedAmount) return significantAmount
	else return +fixedAmount.toString()
}

export const formatPercentage = (percentage: Percent) => {
	const formatedPercentage = +percentage.toFixed(2)
	const exact = percentage.equalTo(new Percent(Math.round(formatedPercentage * 100), 10000))

	return `${exact ? '' : '~'}${formatedPercentage}%`
}