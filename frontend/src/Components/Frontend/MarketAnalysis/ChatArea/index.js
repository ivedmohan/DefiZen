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
exports.PredictionChatArea = void 0;
const axios_1 = __importDefault(require("axios"));
require("./styles.scss");
const agent_store_1 = require("@/store/agent-store");
const shallow_1 = require("zustand/react/shallow");
const react_1 = require("react");
const CustomTextLoader_1 = require("@/Components/Backend/Common/CustomTextLoader");
const CustomSpinner_1 = require("@/Components/Backend/Common/CustomSpinner");
const bs_1 = require("react-icons/bs");
const GraphContainer_1 = require("../GraphContainer");
const TokenSelectionTab_1 = require("../TokenSelectionTab");
const Constants_1 = require("@/Components/Backend/Common/Constants");
const material_1 = require("@mui/material");
const PredictionChatArea = () => {
    const MobileDevice = (0, material_1.useMediaQuery)("(max-width:600px)");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [response, setResponse] = (0, react_1.useState)("");
    const { tokenName, predictionChat, agentWalletAddress, agentKey } = (0, agent_store_1.useAgentStore)((0, shallow_1.useShallow)((state) => ({
        tokenName: state.predictorTokenName,
        predictionChat: state.predictionChat,
        agentWalletAddress: state.agentWalletAddress,
        agentKey: state.agentKey
    })));
    const handleClick = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setLoading(true);
            const response = yield axios_1.default.get(`${Constants_1.BACKEND_URL}/marketAnalysis/${tokenName}`, {
                params: {
                    agentWalletAddress: agentWalletAddress,
                    agentKey: agentKey
                }
            });
            console.log(response.data.data.agentResponse);
            agent_store_1.useAgentStore.getState().setPredictionChat({
                query: `Perform InDepth Market Analysis of ${tokenName} token`,
                answer: (response.data.data).agentResponse.replace(/#/g, '') // Remove #
                    .replace(/\*\*/g, '') // Remove bold markers **
                    .replace(/\*/g, '')
                    .replace(/\-/g, '')
                    .replace(/\*/g, '')
            });
            setResponse(response.data.data.agentResponse);
            setLoading(false);
        }
        catch (err) {
            setResponse("Sorry We couldn't Process your request at the moment");
            setLoading(false);
            console.log(err);
        }
    });
    return (<div className="ChatWrapperPrediction">
            <div className="ChatHeader">
              <div className="mainHeading">
              {MobileDevice && <div className="SideBarIcon" onClick={() => {
                agent_store_1.useAgentStore.getState().setOpenSideBar(true);
            }}>
        <bs_1.BsLayoutTextSidebar />
        </div>}
        <span>
                DeFiZen Market Analysis
                </span>
                </div>
              <span className="subHeading">Chat With out AI Assistant To Perform An In Depth Market Analysis Of A Token</span>
            </div>
            <div className="ChatArea">
                {predictionChat.length > 0 ?
            predictionChat.map((item, index) => {
                return <div key={index}>
                    <div className="ReadyQuery">
                      <span>{item.query}</span>
                    </div>
                    <div className="ResponseRow">
                    <div className="TopContainer">
        <GraphContainer_1.TvlGraphContainer tokenName={tokenName}/>
        <TokenSelectionTab_1.TokenSelectionTab />
        </div>
                    
                    <div className="ResponseDiv">
                    {item.answer.split('\n').slice(0, -15).map((item, index) => {
                        console.log(item);
                        return <div key={index} className="itemResponse">
        {item}
        <br />
      </div>;
                    })}
                    </div>
                    </div>
                  </div>;
            })
            :
                (<div className="ReadyQuery">
                      <span>Welcome to the Defiant! Select a token and ask me to perform it's Market Analysis!</span>
                    </div>)}
                  <div className="TopContainer">
        <GraphContainer_1.TvlGraphContainer tokenName={tokenName}/>
        <TokenSelectionTab_1.TokenSelectionTab />
        </div>
                  {response !== "" && loading && (<div className="ResponseRowLoading">
                      <CustomTextLoader_1.CustomTextLoader text="Conducting InDepth Market Analysis"/>
                    </div>)}
                </div>
            <div className="ChatFooter">
                <div className="PredictButton" onClick={handleClick}>
                    {!loading ? `Perform In Depth Market Analysis of ${tokenName.toUpperCase()} token` : <CustomSpinner_1.CustomSpinner size="20" color="#000000"/>}
                </div>
            </div>
        </div>);
};
exports.PredictionChatArea = PredictionChatArea;
