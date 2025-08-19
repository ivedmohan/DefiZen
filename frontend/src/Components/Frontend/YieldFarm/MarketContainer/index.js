"use strict";
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
const material_1 = require("@mui/material");
require("./styles.scss");
const react_1 = __importStar(require("react"));
const axios_1 = __importDefault(require("axios"));
const Constants_1 = require("@/Components/Backend/Common/Constants");
const agent_store_1 = require("@/store/agent-store");
const image_1 = __importDefault(require("next/image"));
const shallow_1 = require("zustand/react/shallow");
const MarketContainer = ({ data }) => {
    const [amount, setAmount] = (0, react_1.useState)(0.00);
    const MobileDevice = (0, material_1.useMediaQuery)("(max-width:600px)");
    const { agentWalletAddress } = (0, agent_store_1.useAgentStore)((0, shallow_1.useShallow)((state) => ({
        agentWalletAddress: state.agentWalletAddress
    })));
    const handleEnterClick = (value) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (amount > 0) {
                agent_store_1.useAgentStore.getState().setYieldAgentFetching(true);
                console.log(`I want to ${value} ${amount} ${data.tokenName} on the ${data.protocol}`);
                agent_store_1.useAgentStore.getState().setActiveYieldChat(`I want to ${value} ${amount} ${data.tokenName} on the ${data.protocol}`);
                const response = yield axios_1.default.post(`${Constants_1.BACKEND_URL}/depositWithdraw/agent`, {
                    messages: [{
                            role: "user",
                            content: `I want to ${value} ${amount} ${data.tokenName} on the ${data.protocol}`
                        }],
                    address: agentWalletAddress
                });
                console.log(response.data);
                agent_store_1.useAgentStore.getState().setActiveYieldResponse({
                    analysis: response.data.message.finalResponse
                });
                agent_store_1.useAgentStore.getState().setYieldChats({
                    query: `I want to ${value} ${amount} ${data.tokenName} on the ${data.protocol}`,
                    response: {
                        analysis: response.data.message.finalResponse
                    }
                });
            }
        }
        catch (err) {
            agent_store_1.useAgentStore.getState().setActiveYieldResponse({
                analysis: "Sorry We couldn't process your request at the moment",
                recommendedAction: "",
            });
            console.log(err);
        }
    });
    return (<div className={`deposit-form ${MobileDevice ? "mobile" : ""}`}>
      <div className="header">
        <span className="market-cap">
           <image_1.default src={data.protocolImage} height={30} width={30} alt="protocolImage" className="protocolImage"/>
           {/* <span >{data.protocol}</span> */}
           <span>{data.poolName}</span>
        </span>
       
        <span className="market-cap">
       
        <image_1.default src={data.tokenImage} height={30} width={30} alt="protocolImage" className="protocolImage"/>
          {data.tokenName.toUpperCase()}
          <span className="market-cap">{data.apy}</span>
          </span>

      </div>

      <div className="form-container">
        <input type="number" placeholder="Amount" value={amount === 0 ? "" : amount} onChange={(e) => {
            const value = e.target.value;
            if (value === "" || Number(value) >= 0) {
                setAmount(Number(value));
            }
        }} className="amount-input"/>
        <button className="stake-btn" onClick={() => { handleEnterClick("deposit"); }}>Deposit</button>
        <button className="unstake-btn" onClick={() => { handleEnterClick("withdraw"); }}>Withdraw</button>
      </div>
    </div>);
};
exports.default = MarketContainer;
