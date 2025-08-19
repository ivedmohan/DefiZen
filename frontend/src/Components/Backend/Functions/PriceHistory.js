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
exports.getHistoricalPrice = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getHistoricalPrice = (tokenId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const timeTo = new Date().getTime() / 1000;
        const timeFrom = (new Date().getTime() / 1000) - (4 * 30 * 86400);
        const url = `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart/range?vs_currency=usd&from=${timeFrom}&to=${timeTo}&precision=4`;
        const headers = {
            accept: 'application/json',
            'x-cg-demo-api-key': `${process.env.HISTORY_API_KEY}`
        };
        const response = yield axios_1.default.get(url, { headers });
        console.log(response.data.prices);
        return response.data.prices;
    }
    catch (error) {
        console.error('Error fetching historical price:', error);
    }
});
exports.getHistoricalPrice = getHistoricalPrice;
