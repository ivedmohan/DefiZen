"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTopPoolsOnNetwork = void 0;
const axios_1 = __importDefault(require("axios"));
const fetchTopPoolsOnNetwork = (tokenName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield axios_1.default.get("https://api.geckoterminal.com/api/v2/networks/aptos/pools?page=5&sort=h24_volume_usd_desc");
        const filteredData = result.data.data.filter((item) => {
            return (item.attributes.name.includes(tokenName.toUpperCase()));
        });
        const poolFinalData = filteredData
            .filter((item) => {
            const dexId = item.relationships.dex.data.id;
            return dexId.includes("liquid") || dexId.includes("joule") || dexId.includes("thala");
        })
            .map((item) => {
            return {
                id: item.id,
                changePercentage: item.attributes.price_change_percentage["h24"],
                dex: item.relationships.dex.data.id,
                base_token: item.relationships.base_token.data.id,
                quote_token: item.relationships.quote_token.data.id,
            };
        });
        console.log(poolFinalData);
        return poolFinalData;
    }
    catch (error) {
        console.log(error);
    }
});
exports.fetchTopPoolsOnNetwork = fetchTopPoolsOnNetwork;
