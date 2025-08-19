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
dotenv_1.default.config();
const AgentArena = () => {
    const chatBoxRef = (0, react_2.useRef)(null);
    const [isListening, setIsListening] = (0, react_1.useState)(false);
    const [speechSupported, setSpeechSupported] = (0, react_1.useState)(false);
    const { activeChat, activeResponse, agentResponses, chatId, fetching, agentWalletAddress } = (0, agent_store_1.useAgentStore)((0, shallow_1.useShallow)((state) => ({
        activeChat: state.activeChat,
        activeResponse: state.activeResponse,
        agentResponses: state.agentResponses,
        chatId: state.activeChatId,
        agentKey: state.agentKey,
        fetching: state.fetching,
        agentWalletAddress: state.agentWalletAddress
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
                handleEnterClick(userInput);
                userInputRef.current.value = "";
            }
        }
    };
    const handleEnterClick = (value) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (value && value.trim()) {
            agent_store_1.useAgentStore.getState().setFetching(true);
            agent_store_1.useAgentStore.getState().setActiveChat(value);
            agent_store_1.useAgentStore.getState().setActiveResponse("");
            try {
                const data = yield axios_1.default.post(`${Constants_1.BACKEND_URL}/agent`, {
                    messages: [{
                            role: "user",
                            content: `${(_a = userInputRef.current) === null || _a === void 0 ? void 0 : _a.value}`
                        }],
                    address: agentWalletAddress
                });
                const response = data.data.message.finalResponse;
                agent_store_1.useAgentStore.getState().setActiveResponse(response);
                agent_store_1.useAgentStore.getState().setAgentResponses({
                    query: value,
                    outputString: response,
                    chatId: chatId,
                });
                console.log("the agent chats are", agent_store_1.useAgentStore.getState().agentResponses);
                agent_store_1.useAgentStore.getState().setFetching(false);
            }
            catch (error) {
                agent_store_1.useAgentStore.getState().setFetching(false);
                agent_store_1.useAgentStore
                    .getState()
                    .setActiveResponse("I am sorry, We couldn't process your request at the moment.");
                agent_store_1.useAgentStore.getState().setAgentResponses({
                    query: activeChat,
                    outputString: "I am sorry, We couldn't process your request at the moment.",
                    chatId: chatId,
                });
                console.error("Error processing agent response:", error);
            }
            if (userInputRef.current) {
                userInputRef.current.value = "";
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
                // Automatically send the message when speech recognition ends
                handleEnterClick(userInputRef.current.value);
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
        // The recognition will automatically stop due to continuous=false
    };
    const renderText = (response) => {
        if (response === "")
            return <CustomTextLoader_1.CustomTextLoader text="Loading"/>;
        const renderGeneralToolResponse = (answer) => {
            return (<div className="SwapBox">
          <div className="Logo">
            {( !Constants_1.HIDE_REMOTE_LOGO && Constants_1.DAPP_LOGO ) ? <image_1.default src={Constants_1.DAPP_LOGO} height={30} width={30} alt="chatlogo"/> : Constants_1.DAPP_LOGO_LOCAL ? <image_1.default src={Constants_1.DAPP_LOGO_LOCAL} height={30} width={30} alt="chatlogo"/> : <div className="Logo placeholder" />}
          </div>
          <div className="nestedResponse">
            <span className="responseRow">
              {answer.split("\n").filter((item) => item !== "").map((item, index) => {
                    return (<div key={index} className="itemResponse">
                    {(0, function_1.FormatDisplayTextForChat)(item)}
                    <br />
                  </div>);
                })}
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
      </div>) : (renderGeneralToolResponse(response));
    };
    const chatArray = agentResponses.length > 0 ? agentResponses : [];
    return (<div className="ArenaChatArea">
      <div className="ArenaChatBox" ref={chatBoxRef}>
        {chatArray.length > 0
            ? chatArray
                .map((item, index) => {
                const agentResponse = {
                    query: item.query,
                    outputString: item.outputString,
                    toolCalled: item.toolCalled,
                    chatId: item.chatId,
                };
                return (<div key={index} className="PastChatBox">
                    <div className="chatTextQuestion">
                      <div className="chatText">{item.query}</div>
                    </div>
                    <div className="chatTextResponse">
                      {renderText(agentResponse.outputString)}
                    </div>
                  </div>);
            })
            :
                null}
        {activeResponse === "" && activeChat !== "" && (<div className="chatTextQuestion">
            <div className="chatText">{activeChat}</div>
          </div>)}
        {fetching ? <div className="chatTextResponse"><CustomTextLoader_1.CustomTextLoader text="Loading"/></div> : null}
      </div>
      <div className="AgentArenaInputContainer">
        <input ref={userInputRef} onKeyDown={handleKeyPress} placeholder="Ask Anything" className={`AgentInput ${isListening ? 'listening' : ''}`}/>
        {speechSupported && (<div className={`MicButton ${isListening ? 'active' : ''}`} onClick={toggleSpeechRecognition} title={isListening ? "Stop listening" : "Start voice input"}>
            {isListening ? <bs_1.BsMicMute /> : <bs_1.BsMic />}
          </div>)}
        <div className="EnterButton" onClick={() => { var _a; handleEnterClick(((_a = userInputRef.current) === null || _a === void 0 ? void 0 : _a.value) || ""); }}>
          <ai_1.AiOutlineEnter />
        </div>
      </div>
    </div>);
};
exports.AgentArena = AgentArena;
