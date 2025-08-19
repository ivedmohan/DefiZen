"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Providers = Providers;
const core_1 = require("@starknet-react/core");
const chains_1 = require("@starknet-react/chains");
const injected_1 = require("starknetkit/injected");
const webwallet_1 = require("starknetkit/webwallet");
const chains = [chains_1.mainnet, chains_1.sepolia];
const connectors = [
    new injected_1.InjectedConnector({ options: { id: "braavos", name: "Braavos" } }),
    new injected_1.InjectedConnector({ options: { id: "argentX", name: "Argent X" } }),
    new webwallet_1.WebWalletConnector({ url: "https://web.argent.xyz" })
];
function Providers({ children }) {
    return (<core_1.StarknetConfig chains={chains} provider={(0, core_1.publicProvider)()} connectors={connectors}>
			{children}
		</core_1.StarknetConfig>);
}
