"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransacitonsContainer = void 0;
const image_1 = __importDefault(require("next/image"));
require("./styles.scss");
const Constants_1 = require("@/Components/Backend/Common/Constants");
const TransacitonsContainer = () => {
    const getTokenLogo = (token) => {
        switch (token) {
            case "USDC":
                return Constants_1.USDC_LOGO;
            case "USDT":
                return Constants_1.USDT_LOGO;
            default:
                return Constants_1.USDC_LOGO; // Default fallback
        }
    };
    return (<div className="TransactionBox">
        <div className="TransactionRow header">
            <div className="AgentColumn">From Token</div>
            <div className="AgentColumn">To Token</div>
            <div className="AgentColumn">Amount</div>
            <div className="AgentColumn">Transaction Hash</div>
        </div>
            <div className="TransactionRow">
                <div className="AgentColumn">
                    <span className="tokenLogo">
                        <image_1.default src={Constants_1.USDC_LOGO} height={30} width={30} alt="logo"/>
                        {"USDC"}
                    </span>
                </div>
                <div className="AgentColumn">
                    <span className="tokenLogo">
                        <image_1.default src={Constants_1.USDT_LOGO} height={30} width={30} alt="logo"/>
                        {"USDT"}
                    </span>
                </div>
                <div className="AgentColumn">
                    <span>{1000}</span>
                </div>
                <div className="AgentColumn">
                    <span>{"0x000000.....00000000"}</span>
                </div>
            </div>
    </div>);
};
exports.TransacitonsContainer = TransacitonsContainer;
