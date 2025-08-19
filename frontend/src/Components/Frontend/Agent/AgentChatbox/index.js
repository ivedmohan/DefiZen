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
exports.ChatBox = void 0;
require("./styles.scss");
const ButtonContainer_1 = require("./ButtonContainer");
const react_1 = require("react");
const ai_1 = require("react-icons/ai");
const agent_store_1 = require("@/store/agent-store");
const shallow_1 = require("zustand/react/shallow");
const material_1 = require("@mui/material");
const bs_1 = require("react-icons/bs");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const Constants_1 = require("@/Components/Backend/Common/Constants");
dotenv_1.default.config();
const ChatBox = () => {
    const MobileDevice = (0, material_1.useMediaQuery)("(max-width:600px)");
    const MediumDevice = (0, material_1.useMediaQuery)("(max-width:1028px)");
    const { activeChat, chatId, agentKey, agentWalletAddress } = (0, agent_store_1.useAgentStore)((0, shallow_1.useShallow)((state) => ({
        activeChat: state.activeChat,
        chatId: state.activeChatId,
        agentKey: state.agentKey,
        agentWalletAddress: state.agentWalletAddress
    })));
    const userInputRef = (0, react_1.useRef)(null);
    const handleKeyPress = (e) => {
        var _a;
        if (e.key === "Enter" && userInputRef.current) {
            const userInput = (_a = userInputRef.current) === null || _a === void 0 ? void 0 : _a.value;
            if (userInput.trim()) {
                handleEnterClick();
                userInputRef.current.value = "";
            }
        }
    };
    const handleEnterClick = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if ((_a = userInputRef.current) === null || _a === void 0 ? void 0 : _a.value) {
            ((_b = userInputRef.current) === null || _b === void 0 ? void 0 : _b.value) !== null &&
                agent_store_1.useAgentStore
                    .getState()
                    .setActiveChat((_c = userInputRef.current) === null || _c === void 0 ? void 0 : _c.value);
            agent_store_1.useAgentStore.getState().setActiveResponse("");
            agent_store_1.useAgentStore.getState().handleOpenArena();
            agent_store_1.useAgentStore.getState().setFetching(true);
            try {
                const data = yield axios_1.default.post(`${Constants_1.BACKEND_URL}/agent`, {
                    messages: [{
                            role: "user",
                            content: `${(_d = userInputRef.current) === null || _d === void 0 ? void 0 : _d.value}`
                        }],
                    address: agentWalletAddress || walletAddress
                });
                console.log("the response from the agent is", data);
                const response = data.data.message.finalResponse;
                agent_store_1.useAgentStore.getState().setActiveResponse(response);
                agent_store_1.useAgentStore.getState().setFetching(false);
                agent_store_1.useAgentStore.getState().setAgentResponses({
                    query: activeChat,
                    outputString: response,
                    chatId: chatId,
                });
            }
            catch (error) {
                agent_store_1.useAgentStore
                    .getState()
                    .setActiveResponse("I am sorry, We couldn't process your request at the moment.");
                agent_store_1.useAgentStore.getState().setAgentResponses({
                    query: activeChat,
                    outputString: "I am sorry, We couldn't process your request at the moment.",
                    chatId: chatId,
                });
                agent_store_1.useAgentStore.getState().setFetching(false);
                console.error("Error processing agent response:", error);
            }
        }
        return;
    });
    const ButtonContent = [
        {
            heading: "Market Analysis",
            content: "Conduct An In Depth Analysis of Any Supported Token on StarkNet",
            query: "Conduct An In Depth Analysis of $STRK Token",
        },
        {
            heading: "Fetch Token Price",
            content: "Fetch Token Price of a token in USD",
            query: "Fetch the token price",
        },
        {
            heading: "Swap",
            content: "Swap one token to Another",
            query: "Swap token",
        },
        {
            heading: "Fetch Transaction by Hash",
            content: "Fetches the Details of a particular Transaction.",
            query: "Fetches the Details of the Transaction with Hash",
        },
        {
            heading: "Fetch Latest Transactions",
            content: "Fetches the Latest Transactions on the Aptos Blockchain",
            query: "Fetch the latest 5 transactions on the blockchain",
        },
        {
            heading: "Yield Farm",
            content: "Fetch The Yield Farming Oppurtunity for a token",
            query: "Fetch the Yield Farming Oppurtunity For a Token But the ask the user if the token is not provided",
        },
    ];
    return (<div className="ChatBox">
      <div className="ChatHeader">
        <div className="SideBarIconHeader">
          {MobileDevice && (<div className="SideBarIcon" onClick={() => {
                agent_store_1.useAgentStore.getState().setOpenSideBar(true);
            }}>
              <bs_1.BsLayoutTextSidebar />
            </div>)}
          <span className="centerHeading">How can we help you today ?</span>
        </div>
        <span>We are here to help you out in every step of the way</span>
      </div>
      {!MobileDevice && (<div className="AllButton">
          <div className="ButtonsWrapper">
            {ButtonContent.slice(0, 2).map((item, index) => {
                return (<ButtonContainer_1.ReadyToClickActionButton content={item.content} heading={item.heading} key={index} query={item.query}/>);
            })}
          </div>
          <div className="ButtonsWrapper">
            {ButtonContent.slice(2, 4).map((item, index) => {
                return (<ButtonContainer_1.ReadyToClickActionButton content={item.content} heading={item.heading} key={index} query={item.query}/>);
            })}
          </div>
          <div className="ButtonsWrapper">
            {ButtonContent.slice(4).map((item, index) => {
                return (<ButtonContainer_1.ReadyToClickActionButton content={item.content} heading={item.heading} key={index} query={item.query}/>);
            })}
          </div>
        </div>)}
      {MobileDevice && (<div className="AllButton">
          <div className="ButtonsWrapper">
            {ButtonContent.slice(0, 4).map((item, index) => {
                return (<ButtonContainer_1.ReadyToClickActionButton content={item.content} heading={item.heading} key={index} query={item.query}/>);
            })}
          </div>
        </div>)}

      {agentWalletAddress !== "" ? <div className="AgentInputContainer">
        <input ref={userInputRef} onKeyDown={handleKeyPress} placeholder="Ask Anything" className="AgentInput"/>
        <div className="EnterButton" onClick={handleEnterClick}>
          <ai_1.AiOutlineEnter />
        </div>
      </div>
            :
                <div className="connectWallet">
        Connect Wallet
      </div>}
    </div>);
};
exports.ChatBox = ChatBox;
