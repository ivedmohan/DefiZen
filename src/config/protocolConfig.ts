export const ProtocolConfigObject={
	"protocols": {
		"Nostra": {
			"operations": {
				"stake": {
					"transactions": [
						{
							"name": "approve",
							"contractAddress": "{assetContractAddress}",
							"entrypoint": "approve",
							"entrypointSelector": "0x0219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c",
							"calldata": [
								"{stakingContractAddress}",
								"{amount_low}",
								"{amount_high}"
							]
						},
						{
							"name": "mint",
							"contractAddress": "{stakingContractAddress}",
							"entrypoint": "mint",
							"entrypointSelector": "0x02f0b3c5710379609eb5495f1ecd348cb28167711b73609fe565a72734550354",
							"calldata": [
								"{userAddress}",
								"{amount_low}",
								"{amount_high}"
							]
						}
					]
				},
				"unstake": {
					"transactions": [
						{
							"name": "burn",
							"contractAddress": "{stakingContractAddress}",
							"entrypoint": "burn",
							"entrypointSelector": "0x04b7315adcf62c1b8e8a998110a1006f37d3dca0e1ab12ffda9030e4531f8799",
							"calldata": [
								"{userAddress}",
								"{userAddress}",
								"{amount_low}",
								"{amount_high}"
							]
						}
					]
				},
				"add_liquidity": {
					"transactions": [
						{
							"name": "approve_token0",
							"contractAddress": "{token0ContractAddress}",
							"entrypoint": "approve",
							"entrypointSelector": "0x0219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c",
							"calldata": [
								"{addLiquidityContractAddress}",
								"{amount0_low}",
								"{amount0_high}"
							]
						},
						{
							"name": "approve_token1",
							"contractAddress": "{token1ContractAddress}",
							"entrypoint": "approve",
							"entrypointSelector": "0x0219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c",
							"calldata": [
								"{addLiquidityContractAddress}",
								"{amount1_low}",
								"{amount1_high}"
							]
						},
						{
							"name": "add_liquidity",
							"contractAddress": "{addLiquidityContractAddress}",
							"entrypoint": "add_liquidity",
							"entrypointSelector": "0x02cfb12ff9e08412ec5009c65ea06e727119ad948d25c8a8cc2c86fec4adee70",
							"calldata": [
								"{pairAddress}",
								"{amount0_low}",
								"{amount0_high}",
								"{amount1_low}",
								"{amount1_high}",
								"{amount0_min_low}",
								"{amount0_min_high}",
								"{amount1_min_low}",
								"{amount1_min_high}",
								"{userAddress}",
								"{deadline}"
							]
						}
					]
				}
			},
			"contracts": {
				"assets": {
					"ETH": {
						"label": "Nostra staked ETH",
						"name": "nstETH",
						"assetContractAddress": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
						"stakingContractAddress": "0x057146f6409deb4c9fa12866915dd952aa07c1eb2752e451d7f3b042086bdeb8",
						"decimals": 18
					},
					"STRK": {
						"label": "Nostra staked STRK",
						"name": "nstSTRK",
						"assetContractAddress": "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
						"stakingContractAddress": "0x7c2e1e733f28daa23e78be3a4f6c724c0ab06af65f6a95b5e0545215f1abc1b",
						"decimals": 18
					},
					"nstSTRK": {
						"label": "Nostra nstSTRK",
						"name": "nstSTRK",
						"assetContractAddress": "0x04619e9ce4109590219c5263787050726be63382148538f3f936c22aa87d2fc2",
						"stakingContractAddress": "0x67a34ff63ec38d0ccb2817c6d3f01e8b0c4792c77845feb43571092dcf5ebb5",
						"decimals": 18
					},
					"WBTC": {
						"label": "Nostra staked WBTC",
						"name": "nstWBTC",
						"assetContractAddress": "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac",
						"stakingContractAddress": "0x05b7d301fa769274f20e89222169c0fad4d846c366440afc160aafadd6f88f0c",
						"decimals": 8
					},
					"USDC": {
						"label": "Nostra staked USDC",
						"name": "nstUSDC",
						"assetContractAddress": "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
						"stakingContractAddress": "0x05dcd26c25d9d8fd9fc860038dcb6e4d835e524eb8a85213a8cda5b7fff845f6",
						"decimals": 6
					},
					"DAIv0": {
						"label": "Nostra staked DAIv0",
						"name": "nstDAIv0",
						"assetContractAddress": "0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3",
						"stakingContractAddress": "0x04f18ffc850cdfa223a530d7246d3c6fc12a5969e0aa5d4a88f470f5fe6c46e9",
						"decimals": 18
					},
					"UNO": {
						"label": "Nostra staked UNO",
						"name": "nstUNO",
						"assetContractAddress": "0x719b5092403233201aa822ce928bd4b551d0cdb071a724edd7dc5e5f57b7f34",
						"stakingContractAddress": "0x2a3a9d7bcecc6d3121e3b6180b73c7e8f4c5f81c35a90c8dd457a70a842b723",
						"decimals": 18
					},
					"NSTR": {
						"label": "Nostra staked NSTR",
						"name": "nstNSTR",
						"assetContractAddress": "0x00c530f2c0aa4c16a0806365b0898499fba372e5df7a7172dc6fe9ba777e8007",
						"stakingContractAddress": "0x46ab56ec0c6a6d42384251c97e9331aa75eb693e05ed8823e2df4de5713e9a4",
						"decimals": 18
					},
					"DAI": {
						"label": "Nostra staked DAI",
						"name": "nstDAI",
						"assetContractAddress": "0x05574eb6b8789a91466f902c380d978e472db68170ff82a5b650b95a58ddf4ad",
						"stakingContractAddress": null,
						"decimals": 18
					},
					"EKUBO": {
						"label": "Nostra staked EKUBO",
						"name": "nstEKUBO",
						"assetContractAddress": "0x075afe6402ad5a5c20dd25e10ec3b3986acaa647b77e4ae24b0cbc9a54a27a87",
						"stakingContractAddress": "0x2360bd006d42c1a17d23ebe7ae246a0764dea4ac86201884514f86754ccc7b8",
						"decimals": 18
					}
				},
				"pairs": {
					"STRK/ETH": {
						"name": "Nostra STRK/ETH pool",
						"symbol": "Nostra STRK/ETH",
						"pairAddress": "0x068400056dccee818caa7e8a2c305f9a60d255145bac22d6c5c9bf9e2e046b71",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "STRK",
						"asset1": "ETH"
					},
					"STRK/USDC": {
						"name": "Nostra STRK/USDC pool",
						"symbol": "Nostra STRK/USDC",
						"pairAddress": "0x07ae43abf704f4981094a4f3457d1abe6b176844f6cdfbb39c0544a635ef56b0",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "STRK",
						"asset1": "USDC"
					},
					"USDC/USDT": {
						"name": "Nostra USDC/USDT pool",
						"symbol": "Nostra USDC/USDT",
						"pairAddress": "0x00c318445d5a5096e2ad086452d5c97f65a9d28cafe343345e0fa70da0841295",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "USDC",
						"asset1": "USDT"
					},
					"ETH/USDC": {
						"name": "Nostra ETH/USDC pool",
						"symbol": "Nostra ETH/USDC",
						"pairAddress": "0x05ef8800d242c5d5e218605d6a10e81449529d4144185f95bf4b8fb669424516",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "ETH",
						"asset1": "USDC"
					},
					"ETH/USDT": {
						"name": "Nostra ETH/USDT pool",
						"symbol": "Nostra ETH/USDT",
						"pairAddress": "0x052b136b37a7e6ea52ce1647fb5edc64efe23d449fc1561d9994a9f8feaa6753",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "ETH",
						"asset1": "USDT"
					},
					"LORDS/ETH": {
						"name": "Nostra LORDS/ETH pool",
						"symbol": "Nostra LORDS/ETH",
						"pairAddress": "0x05ae9c593b2bef20a8d69ae7abf1e6da551481f9efd83d03a9f05b6d7c9a78ec",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "LORDS",
						"asset1": "ETH"
					},
					"WBTC/ETH": {
						"name": "Nostra WBTC/ETH pool",
						"symbol": "Nostra WBTC/ETH",
						"pairAddress": "0x0285aa1c4bbeef8a183fb7245f096ddc4c99c6b2fedd1c1af52a634c83842804",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "WBTC",
						"asset1": "ETH"
					},
					"BRRR/ETH": {
						"name": "Nostra BRRR/ETH pool",
						"symbol": "Nostra BRRR/ETH",
						"pairAddress": "0x33c4141c8eb6ab8e7506c6f09c1a64b0995c9a5fa2ba6fa827845535b942786",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "BRRR",
						"asset1": "ETH"
					},
					"STRONK/STRK": {
						"name": "Nostra STRONK/STRK pool",
						"symbol": "Nostra STRONK/STRK",
						"pairAddress": "0x13e7962df51aba2afedbc1c86b0b61d36410f97fc75cb8f51e525559bef49f6",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "STRONK",
						"asset1": "STRK"
					},
					"TONY/STRK": {
						"name": "Nostra TONY/STRK pool",
						"symbol": "Nostra TONY/STRK",
						"pairAddress": "0x0344653508c3b8831d6826712004f5bcff9d7a9a8fe720ba8e8b6005fb23c04d",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "TONY",
						"asset1": "STRK"
					},
					"AKU/STRK": {
						"name": "Nostra AKU/STRK pool",
						"symbol": "Nostra AKU/STRK",
						"pairAddress": "0x05737b6463e8aab45d9237180ac68515a49fa3e0656f06b5831c15c69af83332",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "AKU",
						"asset1": "STRK"
					},
					"PAL/STRK": {
						"name": "Nostra PAL/STRK pool",
						"symbol": "Nostra PAL/STRK",
						"pairAddress": "0x07d24fc0949e9579cb6e08bb65ffe39fd5dd78a47ad2e4eb52e49b97c2cd26db",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "PAL",
						"asset1": "STRK"
					},
					"nstSTRK/STRK": {
						"name": "Nostra nstSTRK/STRK pool",
						"symbol": "Nostra nstSTRK/STRK",
						"pairAddress": "0x076def79cc9a3a375779c163ad12996f99fbeb4acd68d7041529159bde897160",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "nstSTRK",
						"asset1": "STRK"
					},
					"ETH/UNO": {
						"name": "Nostra ETH/UNO pool",
						"symbol": "Nostra ETH/UNO",
						"pairAddress": "0x03f8c9062f1bfe45f82cd70ed97ff053bc5836783ec66adfe3288eb1b43aa83b",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "ETH",
						"asset1": "UNO"
					},
					"STRK/UNO": {
						"name": "Nostra STRK/UNO pool",
						"symbol": "Nostra STRK/UNO",
						"pairAddress": "0x03d51776d3ce07c211d5dbdf40a9333ec6d6d3a0b2853de1d6706f9ea3b88d45",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "STRK",
						"asset1": "UNO"
					},
					"STRK/ETH (Degen)": {
						"name": "Nostra STRK/ETH (Degen) pool",
						"symbol": "Nostra STRK/ETH (Degen)",
						"pairAddress": "0x01a2de9f2895ac4e6cb80c11ecc07ce8062a4ae883f64cb2b1dc6724b85e897d",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "STRK",
						"asset1": "ETH"
					},
					"STRK/USDC (Degen)": {
						"name": "Nostra STRK/USDC (Degen) pool",
						"symbol": "Nostra STRK/USDC (Degen)",
						"pairAddress": "0x042543c7d220465bd3f8f42314b51f4f3a61d58de3770523b281da61dbf27c8a",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "STRK",
						"asset1": "USDC"
					},
					"ETH/USDC (Degen)": {
						"name": "Nostra ETH/USDC (Degen) pool",
						"symbol": "Nostra ETH/USDC (Degen)",
						"pairAddress": "0x05e03162008d76cf645fe53c6c13a7a5fce745e8991c6ffe94400d60e44c210a",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "ETH",
						"asset1": "USDC"
					},
					"WBTC/ETH (Degen)": {
						"name": "Nostra WBTC/ETH (Degen) pool",
						"symbol": "Nostra WBTC/ETH (Degen)",
						"pairAddress": "0x01583919ffd78e87fa28fdf6b6a805fe3ddf52f754a63721dcd4c258211129a6",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "WBTC",
						"asset1": "ETH"
					},
					"wstETH/ETH": {
						"name": "Nostra wstETH/ETH pool",
						"symbol": "Nostra wstETH/ETH",
						"pairAddress": "0x0577521a1f005bd663d0fa7f37f0dbac4d7f55b98791d280b158346d9551ff2b",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "wstETH",
						"asset1": "ETH"
					},
					"USDC/DAI": {
						"name": "Nostra USDC/DAI pool",
						"symbol": "Nostra USDC/DAI",
						"pairAddress": "0x0362ec0c49a9c8f2d322d0ba6a8ec1214b9e4f7e80a17d462ec2585362547d95",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "USDC",
						"asset1": "DAI"
					},
					"zUSDC/USDC": {
						"name": "Nostra zUSDC/USDC pool",
						"symbol": "Nostra zUSDC/USDC",
						"pairAddress": "0x05458b28f32b5f6e635895063ec0fe85c5a3864d257c4ae293edd5f66acf988d",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "zUSDC",
						"asset1": "USDC"
					},
					"NSTR/USDC": {
						"name": "Nostra NSTR/USDC pool",
						"symbol": "Nostra NSTR/USDC",
						"pairAddress": "0x07f232e7857effe04f7351e9bb2f1ebc2589bacca3380ae84efcc22067c1436e",
						"addLiquidityContractAddress": "0x040784ffdde08057a5957e64ed360c0ae4e04117b6d8e351c6bb912c09c5cbf5",
						"asset0": "NSTR",
						"asset1": "USDC"
					}
				}
			}
		}
	}
}