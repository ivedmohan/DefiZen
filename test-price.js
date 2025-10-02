// Quick test of price fetching with CoinGecko fallback
const axios = require('axios');

const TOKEN_TO_COINGECKO = {
	'0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8': 'usd-coin', // USDC
	'0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8': 'tether', // USDT
	'0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7': 'ethereum', // ETH
	'0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d': 'starknet', // STRK
	'0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3': 'dai', // DAI
};

async function getPriceFromCoinGecko(tokenAddress) {
	const coingeckoId = TOKEN_TO_COINGECKO[tokenAddress];
	if (!coingeckoId) {
		throw new Error(`No CoinGecko mapping for token ${tokenAddress}`);
	}
	
	console.log(`📊 Fetching ${coingeckoId} price from CoinGecko...`);
	const { data } = await axios.get(
		`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`,
		{ timeout: 5000 }
	);
	
	const price = data[coingeckoId]?.usd;
	if (!price) {
		throw new Error(`No price data from CoinGecko for ${coingeckoId}`);
	}
	return price;
}

async function testPrices() {
	const tokens = [
		{ name: 'USDC', address: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8' },
		{ name: 'ETH', address: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7' },
		{ name: 'STRK', address: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d' },
	];

	for (const token of tokens) {
		try {
			const price = await getPriceFromCoinGecko(token.address);
			console.log(`✅ ${token.name}: $${price}`);
		} catch (error) {
			console.error(`❌ ${token.name}: ${error.message}`);
		}
	}
}

testPrices();
