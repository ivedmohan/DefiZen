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
exports.AgentArena = void 0;
const react_1 = require("react");
require("./styles.scss");
const react_2 = require("react");
const ai_1 = require("react-icons/ai");
const bs_1 = require("react-icons/bs");
const shallow_1 = require("zustand/react/shallow");
const axios_1 = __importDefault(require("axios"));
const agent_store_1 = require("@/store/agent-store");
const CustomTextLoader_1 = require("@/Components/Backend/Common/CustomTextLoader");
const image_1 = __importDefault(require("next/image"));
const Constants_1 = require("@/Components/Backend/Common/Constants");
const dotenv_1 = __importDefault(require("dotenv"));
const function_1 = require("@/Utils/function");
const material_1 = require("@mui/material");
const ButtonContainer_1 = require("../../Agent/AgentChatbox/ButtonContainer");
const bs_2 = require("react-icons/bs");
const material_2 = require("@mui/material");
const Info_1 = __importDefault(require("@mui/icons-material/Info"));
dotenv_1.default.config();
const AgentArena = () => {
    const MobileDevice = (0, material_1.useMediaQuery)("(max-width:600px)");
    const MediumDevice = (0, material_1.useMediaQuery)("(max-width:1028px)");
    const chatBoxRef = (0, react_2.useRef)(null);
    const [loader, setLoader] = (0, react_1.useState)(false);
    const [isListening, setIsListening] = (0, react_1.useState)(false);
    const [speechSupported, setSpeechSupported] = (0, react_1.useState)(false);
    const ButtonContent = [
        {
            heading: "Withdraw Token",
            content: "Withdraw tokens from StrkFarm",
            query: "Withdraw tokens from StrkFarm",
        },
        {
            heading: "Deposit Token",
            content: "Deposit token on EndfuFi",
            query: "Give me the details to deposit token on EnduFi",
        },
    ];
    const { activeChat, activeResponse, agentResponses, agentKey, agentWalletAddress, yieldAgentFetching } = (0, agent_store_1.useAgentStore)((0, shallow_1.useShallow)((state) => ({
        activeChat: state.activeYieldChat,
        activeResponse: state.activeYieldResponse,
        agentResponses: state.yieldChats,
        agentKey: state.agentKey,
        agentWalletAddress: state.agentWalletAddress,
        yieldAgentFetching: state.yieldAgentFetching
    })));
    // Check if speech recognition is supported
    (0, react_1.useEffect)(() => {
        const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        setSpeechSupported(supported);
    }, []);
    (0, react_1.useEffect)(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [activeChat, activeResponse]);
    const userInputRef = (0, react_2.useRef)(null);
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
        var _a, _b;
        if ((_a = userInputRef.current) === null || _a === void 0 ? void 0 : _a.value) {
            agent_store_1.useAgentStore.getState().setYieldAgentFetching(true);
            agent_store_1.useAgentStore.getState().setActiveYieldChat(userInputRef.current.value);
            agent_store_1.useAgentStore.getState().setActiveYieldResponse({
                analysis: "",
                recommendedAction: "",
                userQueryResponse: "",
                swap: "",
            });
            try {
                const response = yield axios_1.default.post(`${Constants_1.BACKEND_URL}/depositWithdraw/agent`, {
                    messages: [{
                            role: "user",
                            content: `${(_b = userInputRef.current) === null || _b === void 0 ? void 0 : _b.value}`
                        }],
                    address: agentWalletAddress
                });
                agent_store_1.useAgentStore.getState().setActiveYieldResponse({
                    analysis: response.data.message.finalResponse
                });
                agent_store_1.useAgentStore.getState().setYieldChats({
                    query: activeChat,
                    response: {
                        analysis: response.data.message.finalResponse,
                    },
                });
                agent_store_1.useAgentStore.getState().setYieldAgentFetching(false);
            }
            catch (error) {
                agent_store_1.useAgentStore.getState().setYieldAgentFetching(false);
                agent_store_1.useAgentStore.getState().setActiveYieldResponse({
                    analysis: "Sorry We couldn't process your request at the moment",
                    recommendedAction: "",
                });
                agent_store_1.useAgentStore.getState().setYieldChats({
                    query: activeChat,
                    response: {
                        analysis: "Sorry We couldn't process your request at the moment",
                        recommendedAction: "",
                    },
                });
                console.error("Error processing agent response:", error);
            }
        }
        return;
    });
    // Speech recognition functions
    const toggleSpeechRecognition = () => {
        if (isListening) {
            stopSpeechRecognition();
        }
        else {
            startSpeechRecognition();
        }
    };
    const startSpeechRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition)
            return;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        let finalTranscript = '';
        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                    if (userInputRef.current) {
                        userInputRef.current.value = finalTranscript;
                    }
                }
                else {
                    interimTranscript += transcript;
                    if (userInputRef.current) {
                        userInputRef.current.value = interimTranscript;
                    }
                }
            }
        };
        recognition.onend = () => {
            setIsListening(false);
            if (finalTranscript && userInputRef.current && userInputRef.current.value.trim()) {
                // Automatically send the message when speech recognition ends with valid text
                handleEnterClick();
            }
        };
        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };
        recognition.start();
        setIsListening(true);
    };
    const stopSpeechRecognition = () => {
        setIsListening(false);
    };
    const renderText = (response) => {
        if (response.analysis === "")
            return <CustomTextLoader_1.CustomTextLoader text="Loading"/>;
        const renderGeneralToolResponse = (answer) => {
            return (<div className="SwapBox">
          <div className="Logo">
            {( !Constants_1.HIDE_REMOTE_LOGO && Constants_1.DAPP_LOGO ) ? <image_1.default src={Constants_1.DAPP_LOGO} height={30} width={30} alt="chatlogo"/> : Constants_1.DAPP_LOGO_LOCAL ? <image_1.default src={Constants_1.DAPP_LOGO_LOCAL} height={30} width={30} alt="chatlogo"/> : <div className="Logo placeholder" />}
          </div>
          <div className="nestedResponse">
            <span className="responseRow">
              <div className="itemResponse">
                {(0, function_1.FormatDisplayTextForChat)(answer)}
              </div>
            </span>
          </div>
        </div>);
        };
        return !response || response === undefined ? (<div className="nestedResponse">
        <div className="Logo">
          {( !Constants_1.HIDE_REMOTE_LOGO && Constants_1.DAPP_LOGO ) ? <image_1.default src={Constants_1.DAPP_LOGO} height={30} width={30} alt="chatlogo"/> : Constants_1.DAPP_LOGO_LOCAL ? <image_1.default src={Constants_1.DAPP_LOGO_LOCAL} height={30} width={30} alt="chatlogo"/> : <div className="Logo placeholder" />}
        </div>
        <span className="responseRow">
          {" "}
          {"Sorry we Couldn't process your request at the moment"}
        </span>
      </div>) : (renderGeneralToolResponse(response.analysis));
    };
    const chatArray = agentResponses.length > 0 ? agentResponses : [];
    return (<div className="YieldArenaChatArea">
      <div className="YieldArenaChatBox" ref={chatBoxRef}>
        {activeChat === "" && (<div className="ChatHeader">
            <div className="SideBarIconHeader">
              {MobileDevice && (<div className="SideBarIcon" onClick={() => {
                    agent_store_1.useAgentStore.getState().setOpenSideBar(true);
                }}>
                  <bs_2.BsLayoutTextSidebar />
                </div>)}
            </div>
          </div>)}
        {!MobileDevice && activeChat === "" && (<div className="YieldAllButton">
            <span className="centerHeading">
              <span className="head">How can we help you today?</span>
              <material_2.Tooltip title="Need help? Get support and guidance here!" arrow>
                <material_2.IconButton className="info-icon">
                  <Info_1.default fontSize="small"/>
                </material_2.IconButton>
              </material_2.Tooltip>
            </span>
            <div className="YieldButtonsWrapper">
              {ButtonContent.map((item, index) => {
                return (<ButtonContainer_1.ReadyToClickActionButton content={item.content} heading={item.heading} key={index} query={item.query}/>);
            })}
            </div>
          </div>)}

        {chatArray.length > 0
            ? chatArray
                .map((item, index) => {
                const agentResponse = {
                    query: item.query,
                    response: item.response,
                };
                return (<div key={index} className="PastChatBoxYield">
                    <div className="YieldChatTextQuestion">
                      <div className="YieldChatText">{item.query}</div>
                    </div>
                    <div className="YieldChatTextResponse">
                      {renderText(agentResponse.response)}
                    </div>
                  </div>);
            })
            :
                null}
        {activeResponse.analysis === "" && activeChat !== "" && (<div className="YieldChatTextQuestion">
            <div className="YieldChatText">{activeChat}</div>
          </div>)}
         {yieldAgentFetching ? <div className="YieldChatTextResponse">
          <CustomTextLoader_1.CustomTextLoader text="Loading"/>
                    </div> : null}
        </div>
      <div>
      {agentWalletAddress ?
            <div className="YieldAgentArenaInputContainer">
          <input ref={userInputRef} onKeyDown={handleKeyPress} placeholder="Ask Anything" className={`YieldAgentInput ${isListening ? 'listening' : ''}`}/>
          {speechSupported && (<div className={`MicButton ${isListening ? 'active' : ''}`} onClick={toggleSpeechRecognition} title={isListening ? "Stop listening" : "Start voice input"}>
              {isListening ? <bs_1.BsMicMute /> : <bs_1.BsMic />}
            </div>)}
          <div className="EnterButton" onClick={handleEnterClick}>
            <ai_1.AiOutlineEnter />
          </div>
        </div>
            :
                <div className="connectWallet">
          Connect Wallet
        </div>}
    </div>
    </div>);
};
exports.AgentArena = AgentArena;
