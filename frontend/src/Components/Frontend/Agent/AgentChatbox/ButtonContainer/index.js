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
exports.ReadyToClickActionButton = void 0;
const agent_store_1 = require("@/store/agent-store");
require("./styles.scss");
const fa_1 = require("react-icons/fa");
const axios_1 = __importDefault(require("axios"));
const shallow_1 = require("zustand/react/shallow");
const Constants_1 = require("@/Components/Backend/Common/Constants");
const function_1 = require("@/Utils/function");
const ReadyToClickActionButton = ({ heading, content, query }) => {
    const { chatId, agentWalletAddress, agentKey } = (0, agent_store_1.useAgentStore)((0, shallow_1.useShallow)((state) => ({
        chatId: state.activeChatId,
        agentWalletAddress: state.agentWalletAddress,
        agentKey: state.agentKey
    })));
    const handleClick = () => __awaiter(void 0, void 0, void 0, function* () {
        agent_store_1.useAgentStore.getState().handleOpenArena();
        agent_store_1.useAgentStore.getState().setActiveChat(query);
        try {
            const { data } = yield axios_1.default.post(`${Constants_1.BACKEND_URL}/agent`, {
                message: query,
                chatId: chatId,
                agentWalletAddress: agentWalletAddress,
                agentKey: agentKey
            });
            const response = (0, function_1.FormatDisplayTextForChat)(data.data.agentResponse);
            agent_store_1.useAgentStore.getState().setActiveResponse(response);
            agent_store_1.useAgentStore.getState().setAgentResponses({
                query: query,
                outputString: data.data.agentResponse,
                chatId: chatId,
            });
        }
        catch (error) {
            agent_store_1.useAgentStore.getState().setActiveResponse("We couldn't Process your request at the moment. Please Fund Your Wallet to proceed");
            agent_store_1.useAgentStore.getState().setAgentResponses({
                query: query,
                outputString: "We couldn't Process your request at the moment. Please Fund Your Wallet to proceed",
                chatId: chatId,
            });
            console.error("Error processing agent response:", error);
        }
    });
    return (<div className="ButtonContainer" onClick={handleClick}>
            <div className="ButtonHeading">
                <fa_1.FaBalanceScale />
                <span>{heading}</span>
            </div>
            <span className="ButtonInfo">{content}</span>
        </div>);
};
exports.ReadyToClickActionButton = ReadyToClickActionButton;
