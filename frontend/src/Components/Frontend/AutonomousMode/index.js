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
exports.AutonomousAgentInterface = void 0;
const react_1 = __importStar(require("react"));
require("./styles.scss");
require("react-datepicker/dist/react-datepicker.css");
const react_datepicker_1 = __importDefault(require("react-datepicker"));
const react_2 = require("react");
const get_starknet_1 = require("@starknet-io/get-starknet");
const starknet_1 = require("starknet");
const starknet_2 = require("starknet");
const Constants_1 = require("@/Components/Backend/Common/Constants");
const agent_store_1 = require("@/store/agent-store");
const Transactions_tsx_1 = require("./Transactions.tsx");
const axios_1 = __importDefault(require("axios"));
const shallow_1 = require("zustand/react/shallow");
const AutonomousAgentInterface = () => {
    const provider = new starknet_1.RpcProvider({ nodeUrl: process.env.ALCHEMY_API_KEY });
    const [deadline, setDeadline] = (0, react_2.useState)(new Date());
    const [amount, setAmount] = (0, react_2.useState)("0.00");
    const [stopLoss, setStopLoss] = (0, react_2.useState)("0.00");
    const [account, setAccount] = (0, react_2.useState)(null);
    const [loading, setLoading] = (0, react_2.useState)(false);
    const [totalAmount, setTotalAmount] = (0, react_2.useState)(0);
    const [totalstopLoss, setTotalStopLoss] = (0, react_2.useState)(0);
    const [holding, setHoldingUsd] = (0, react_2.useState)(0);
    const [profit, setProfit] = (0, react_2.useState)("0.00");
    const { userWalletAddress } = (0, agent_store_1.useAgentStore)((0, shallow_1.useShallow)((state) => ({
        userWalletAddress: state.walletAddress
    })));
    (0, react_1.useEffect)(() => {
        const agentHoldings = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const data = yield axios_1.default.get(`${Constants_1.BACKEND_URL}/userPortfolio/agentTotal`, {
                    params: {
                        agentWalletAddress: Constants_1.AGENT_CONTRACT_ADDRESS
                    }
                });
                const agentData = data.data;
                console.log(data.data);
                setHoldingUsd(agentData.totalHoldings);
                setTotalStopLoss(agentData.stopLoss);
                setTotalAmount(agentData.totalAmount);
            }
            catch (err) {
                console.log("error is there fetching agent total", err);
            }
        });
        agentHoldings();
    }, []);
    (0, react_1.useEffect)(() => {
        const handleConnect = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const selectedWalletSWO = yield (0, get_starknet_1.connect)({ modalMode: 'alwaysAsk', modalTheme: 'dark' });
                if (!selectedWalletSWO || !selectedWalletSWO.id) {
                    console.error("Wallet not connected");
                    return;
                }
                const myWalletAccount = yield starknet_2.WalletAccount.connect(provider, selectedWalletSWO);
                setAccount(myWalletAccount);
            }
            catch (error) {
                console.error("Connection failed:", error);
                alert("Failed to connect wallet.");
            }
        });
        handleConnect();
    }, []);
    (0, react_1.useEffect)(() => {
        if (account) {
            agent_store_1.useAgentStore.getState().setWalletAddress(account.address);
            console.log("Setting wallet in store:", account.address);
        }
    }, [account]);
    const AddFundsToAgent = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!account) {
            alert("Please connect your wallet.");
            return;
        }
        if (stopLoss === "0.00") {
            alert("Please Enter some stop loss.");
            return;
        }
        setLoading(true);
        const strkAddress = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
        const cleanAmount = amount.replace(/[^0-9.]/g, "");
        const parsedAmount = parseFloat(cleanAmount);
        const amountInWei = BigInt(Math.floor(parsedAmount * 1e18));
        const amountUint256 = starknet_1.uint256.bnToUint256(amountInWei);
        try {
            const tx = yield account.execute([
                {
                    contractAddress: strkAddress,
                    entrypoint: "transfer",
                    calldata: [
                        Constants_1.AGENT_CONTRACT_ADDRESS,
                        amountUint256.low.toString(),
                        amountUint256.high.toString()
                    ]
                }
            ]);
            console.log("TX hash:", tx.transaction_hash);
            const result = yield axios_1.default.post(`${Constants_1.BACKEND_URL}/autonomous/createDeposit`, {
                agentWallet: Constants_1.AGENT_CONTRACT_ADDRESS,
                userWallet: userWalletAddress,
                amount: amount,
                stopLoss: stopLoss,
                expectedProfit: profit,
                deadline: deadline
            });
            alert("Transaction sent!");
        }
        catch (err) {
            console.error("Transaction failed:", err);
            alert("Failed to transfer funds. ");
        }
        finally {
            setLoading(false);
        }
    });
    return (<div className="AutonomousInterface">
            <div className="AgentInformation">
                <div className="AgentColumn">
                    <span>Name</span>
                    <span>Defizen</span>
                </div>
                <div className="AgentColumn">
                <span>Balance Locked</span>
                <span>${totalAmount}</span>
                </div>
                <div className="AgentColumn">
                <span>Agent Stop Loss</span>
                <span>${totalstopLoss}</span>
                </div>
                <div className="AgentColumnFunds">
                <button onClick={AddFundsToAgent} disabled={loading} className="AddFundsButton">Add Funds
                </button>
                <div className='Input'>
                  <input className='InputField' type='text' value={`${amount}`} onChange={(e) => setAmount(e.target.value)} required placeholder="0.00"/>
                 </div>
                </div>
                <div className="AgentColumnFunds">
                <div className="AddFundsButton">Set Stop Loss
                </div>
                <div className='Input'>
                  <input className='InputField' type='text' value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} required placeholder="0.00"/>
                 </div>
                </div>
                <div className="AgentColumnFunds">
                <div className="AddFundsButton">Set Profit Level
                </div>
                <div className='Input'>
                  <input className='InputField' type='text' value={profit} onChange={(e) => setProfit(e.target.value)} required placeholder="0.00"/>
                 </div>
                </div>
                <div className="AgentColumn">
                <span>Deadline</span>
                <div className="DatePicker">
                <react_datepicker_1.default showTimeSelect onChange={(value) => setDeadline(value)} selected={deadline} locale="es" fixedHeight/>
                </div>
                  
              </div>
            </div>
            <Transactions_tsx_1.TransacitonsContainer />
        </div>);
};
exports.AutonomousAgentInterface = AutonomousAgentInterface;
