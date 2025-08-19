"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.TvlGraphContainer = void 0;
const react_1 = __importStar(require("react"));
require("./styles.scss");
const LineChart_1 = require("@mui/x-charts/LineChart");
const x_charts_1 = require("@mui/x-charts");
const function_1 = require("@/Utils/function");
require("./styles.scss");
const axios_1 = __importDefault(require("axios"));
const Types_1 = require("@/Components/Backend/Types");
const CustomSpinner_1 = require("@/Components/Backend/Common/CustomSpinner");
const material_1 = require("@mui/material");
const Constants_1 = require("@/Components/Backend/Common/Constants");
const TvlGraphContainer = ({ tokenName }) => {
    var _a;
    const isXxlDevice = (0, material_1.useMediaQuery)("(min-width: 1280px)");
    const [tvlDataArray, setTvlDataArray] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [activeId, setActiveId] = (0, react_1.useState)(-1);
    let tokenId;
    //  const {
    //   tokenName
    //  }=useAgentStore(useShallow((state)=>({
    //   tokenName:state.predictorTokenName
    //  })))
    if (tokenName.toLowerCase() === "usdc") {
        tokenId = Types_1.CoinGeckoId["usdc"];
    }
    else if (tokenName.toLowerCase() === "aptos" || tokenName.toLowerCase() === "apt") {
        tokenId = Types_1.CoinGeckoId["aptos"];
    }
    else if (tokenName.toLowerCase() === "usdt") {
        tokenId = Types_1.CoinGeckoId['usdt'];
    }
    else if (tokenName.toLowerCase() === "weth") {
        tokenId = Types_1.CoinGeckoId["weth"];
    }
    else if (tokenName.toLowerCase() === "thl") {
        tokenId = Types_1.CoinGeckoId['thala'];
    }
    else {
        throw new Error("We currently dont support this token");
    }
    (0, react_1.useEffect)(() => {
        if (!tokenId) {
            setError("We currently don't support this token");
            setLoading(false);
            return;
        }
        const fetchData = () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            setLoading(true);
            try {
                const response = yield axios_1.default.get(`${Constants_1.BACKEND_URL}/historicalPrice/${tokenId}`);
                if ((_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.prices) {
                    const formattedData = response.data.data.prices.map(([timestamp, price]) => ({
                        timestamp,
                        price,
                    }));
                    console.log(formattedData);
                    setTvlDataArray(formattedData);
                }
                else {
                    setError("Invalid data format from API");
                }
            }
            catch (err) {
                setError("Failed to fetch historical price data");
            }
            finally {
                setLoading(false);
            }
        });
        fetchData();
    }, [tokenId]);
    return (<div className="GraphContainer">
        <div className="GraphDetails">
          <div className="GraphInfo">
            <span className="GraphName">Historical Price of {tokenName.toUpperCase()}</span>
            <span className="ActiveValue">Current Price :  ${(_a = tvlDataArray[tvlDataArray.length - 1]) === null || _a === void 0 ? void 0 : _a.price}</span>
          </div>
        </div>
        {!loading ? <div className="GraphCanvas">
         <LineChart_1.LineChart dataset={tvlDataArray} sx={{
                [`& .${x_charts_1.legendClasses.root}`]: {
                    display: 'none',
                },
                [`& .${x_charts_1.areaElementClasses.root}`]: {
                    fill: '#7bf179',
                    stroke: '#7bf179',
                    strokeOpacity: 1,
                    fillOpacity: 0.6
                },
                [`& .${x_charts_1.lineElementClasses.root}`]: {
                    stroke: '#7bf179',
                    strokeWidth: 1.5,
                    strokeLinejoin: "bevel"
                }
            }} series={[
                {
                    dataKey: 'price',
                    area: true,
                    showMark: false,
                    label: 'PRICE',
                }
            ]} leftAxis={{
                tickLabelStyle: {
                    fontSize: 10,
                    fill: '#ffffff',
                    fontWeight: 700,
                    fontFamily: "Manrope",
                    lineHeight: 18,
                    opacity: 0.5,
                    transform: "translateX(20px) translateY(-10px)"
                },
                //tickLabelInterval: (value:number,index:number)=>value%1000===0 && value!=0,
                tickNumber: 3,
                tickLabelPlacement: "tick"
            }} height={isXxlDevice ? 200 : 150} margin={{
                top: 30,
                left: 15,
                right: 0,
                bottom: 20
            }} yAxis={[
                {
                    scaleType: "linear",
                    dataKey: "price",
                    valueFormatter(value, context) {
                        return `$${(0, function_1.formatDisplayText)(value, 2)}`;
                    },
                }
            ]} xAxis={[
                {
                    scaleType: 'time',
                    dataKey: "timestamp",
                    label: "Date",
                    valueFormatter(value) {
                        return new Date(value).toLocaleDateString("en-US", { month: "short", year: "numeric" });
                    }
                }
            ]} onHighlightChange={(item) => {
                (item === null || item === void 0 ? void 0 : item.dataIndex) ? setActiveId(item.dataIndex) : setActiveId(-1);
            }} bottomAxis={{
                tickLabelStyle: {
                    fontSize: 10,
                    fill: "#ffffff",
                    fontWeight: 700,
                    fontFamily: "Manrope",
                    lineHeight: 15,
                    opacity: 0.5,
                    transform: "translateX(20px) translateY(-5px) Rotate(0deg)",
                    overflow: "hidden"
                },
                tickLabelInterval: (value, index) => {
                    return index % 2 === 0;
                }
            }}>   

          </LineChart_1.LineChart>     
        </div>
            :
                <div className="GraphLoader">
          <CustomSpinner_1.CustomSpinner size="20" color="white"/>
          </div>}
  </div>);
};
exports.TvlGraphContainer = TvlGraphContainer;
