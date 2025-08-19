"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatAgent = void 0;
const react_1 = __importDefault(require("react"));
const AgentChatbox_1 = require("./AgentChatbox");
require("./styles.scss");
const agent_store_1 = require("@/store/agent-store");
const shallow_1 = require("zustand/react/shallow");
const AgentArena_1 = require("./AgentArena");
const SideBar_1 = require("./SideBar");
const Portfolio_1 = require("../Portfolio");
const MarketAnalysis_1 = require("../MarketAnalysis");
const material_1 = require("@mui/material");
const YieldFarm_1 = __importDefault(require("../YieldFarm"));
const AutonomousMode_1 = require("../AutonomousMode");
const Contacts_1 = require("../Contacts");
const AgentWalletManager_1 = require("./AgentWalletManager");
const ChatAgent = () => {
    const { openArena, activeComponent } = (0, agent_store_1.useAgentStore)((0, shallow_1.useShallow)((state) => ({
        openArena: state.openArena,
        activeComponent: state.activeComponent,
    })));
    const MobileDevice = (0, material_1.useMediaQuery)("(max-width:600px)");
    return (<div className="AgentUIWrapper">
      <SideBar_1.Sidebar />
      {!openArena ? (<div className="ChatBoxWrapper">
          {activeComponent === "chat" ? <AgentChatbox_1.ChatBox /> :
                activeComponent === "Market Analysis" ? <MarketAnalysis_1.MarketAnalysisWrapperContainer /> :
                    activeComponent === "Portfolio" ? <Portfolio_1.Portfolio /> :
                        activeComponent === "Yield Finder" ? <YieldFarm_1.default /> :
                            activeComponent === "Contacts" ? <Contacts_1.ContactWrapper /> :
                                activeComponent === "Agent Manager" ? <AgentWalletManager_1.AgentWalletManager /> :
                                    <AutonomousMode_1.AutonomousAgentInterface />}
        </div>) : (<div className="AgentArenaWrapper">
          {activeComponent === "chat" ? (<AgentArena_1.AgentArena />) : activeComponent === "Market Analysis" ? (<MarketAnalysis_1.MarketAnalysisWrapperContainer />) : activeComponent === "Portfolio" ? <Portfolio_1.Portfolio /> :
                activeComponent === "Yield Finder" ? <YieldFarm_1.default /> :
                    activeComponent === "Contacts" ? <Contacts_1.ContactWrapper /> :
                        activeComponent === "Agent Manager" ? <AgentWalletManager_1.AgentWalletManager /> :
                            <AutonomousMode_1.AutonomousAgentInterface />}
        </div>)}
    </div>);
};
exports.ChatAgent = ChatAgent;
