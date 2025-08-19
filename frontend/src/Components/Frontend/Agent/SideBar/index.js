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
exports.Sidebar = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const image_1 = __importDefault(require("next/image"));
const material_2 = require("@mui/material");
const rx_1 = require("react-icons/rx");
const Social_1 = require("./Social");
require("./styles.scss");
const io_1 = require("react-icons/io");
const agent_store_1 = require("@/store/agent-store");
const shallow_1 = require("zustand/react/shallow");
const lucide_react_1 = require("lucide-react");
const material_3 = require("@mui/material");
const Constants_1 = require("@/Components/Backend/Common/Constants");
const core_1 = require("@starknet-react/core");
const starknetkit_1 = require("starknetkit");
const Sidebar = () => {
    const isMobile = (0, material_3.useMediaQuery)("(max-width: 600px)");
    const { openSidebar, activeComponent, agentWalletAddress } = (0, agent_store_1.useAgentStore)((0, shallow_1.useShallow)((state) => ({
        openSidebar: state.openSideBar,
        activeComponent: state.activeComponent,
        agentWalletAddress: state.agentWalletAddress
    })));
    const { connect, connectors } = (0, core_1.useConnect)();
    const { disconnect } = (0, core_1.useDisconnect)();
    const { address, isConnected } = (0, core_1.useAccount)();
    const { starknetkitConnectModal } = (0, starknetkit_1.useStarknetkitConnectModal)({
        connectors: connectors
    });
    const [copied, setCopied] = (0, react_1.useState)(false);
    const [isConnecting, setIsConnecting] = (0, react_1.useState)(false);
    const [statusMessage, setStatusMessage] = (0, react_1.useState)("");
    const [showStatus, setShowStatus] = (0, react_1.useState)(false);
    const { openArena } = (0, agent_store_1.useAgentStore)((0, shallow_1.useShallow)((state) => ({
        openArena: state.openArena,
    })));
    // Clear status message after delay
    (0, react_1.useEffect)(() => {
        if (showStatus) {
            const timer = setTimeout(() => {
                setShowStatus(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showStatus]);
    const showStatusMessage = (message) => {
        setStatusMessage(message);
        setShowStatus(true);
    };
    // Format address for display
    const formatAddress = (addr) => {
        if (!addr)
            return "";
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };
    function handleConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                setIsConnecting(true);
                const { connector } = yield starknetkitConnectModal();
                if (!connector) {
                    setIsConnecting(false);
                    return;
                }
                connect({ connector: connector });
                console.log("Wallet connected successfully");
                showStatusMessage("Wallet connected successfully");
                console.log(address);
                if (address !== undefined) {
                    console.log("the address is", address);
                    agent_store_1.useAgentStore.getState().setAgentWalletAddress(address);
                    // try {
                    //   const agentResponse = await axios.post(`${process.env.BACKEND_URL || ''}/walletRouter`, {
                    //     walletAddress: address
                    //   });
                    //   useAgentStore.getState().setAgentWalletAddress(agentResponse.data.agentWalletAddress);
                    //   useAgentStore.getState().setAgentKey(agentResponse.data.key);
                    // } catch (error) {
                    //   console.error("Error fetching agent wallet:", error);
                    // }
                }
            }
            catch (error) {
                console.error("Connection failed:", error);
                showStatusMessage("Failed to connect wallet");
            }
            finally {
                setIsConnecting(false);
            }
        });
    }
    (0, react_1.useEffect)(() => {
        if (isConnected && address) {
            console.log("the address is", address);
            agent_store_1.useAgentStore.getState().setAgentWalletAddress(address);
        }
    }, [address, isConnected]);
    const handleDisconnect = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield disconnect();
            agent_store_1.useAgentStore.getState().setWalletAddress("");
            console.log("Wallet disconnected successfully");
            showStatusMessage("Wallet disconnected");
        }
        catch (error) {
            console.error("Error disconnecting wallet:", error);
            showStatusMessage("Failed to disconnect wallet");
        }
    });
    const handleCopyAddress = () => {
        navigator.clipboard.writeText(agentWalletAddress);
        setCopied(true);
        showStatusMessage("Address copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };
    // View transaction history
    const viewTransactions = () => {
        if (address) {
            window.open(`https://starkscan.co/contract/${address}`, '_blank');
        }
    };
    const menuItems = [
        { id: "portfolio", label: "Portfolio", icon: <lucide_react_1.PieChart size={18}/> },
        { id: "yield", label: "Yield Finder", icon: <lucide_react_1.PieChart size={18}/> },
        { id: "autonomous", label: "Autonomous Mode", icon: <lucide_react_1.PieChart size={18}/> },
        { id: "contacts", label: "Contacts", icon: <lucide_react_1.PieChart size={18}/> }
    ];
    const StatusMessage = () => (<div className={`status-message ${showStatus ? 'show' : ''}`}>
      {statusMessage}
    </div>);
    if (isMobile) {
        return (<material_2.Drawer open={openSidebar}>
        <div className="SideBarWrapper">
          {showStatus && <StatusMessage />}
          <div className="TopContainer">
            <div className="SideBarHeader">
              <rx_1.RxCross1 className="crossIcon GradientText" onClick={() => agent_store_1.useAgentStore.getState().setOpenSideBar(false)}/>
              {( !Constants_1.HIDE_REMOTE_LOGO && Constants_1.DAPP_LOGO ) ? <image_1.default src={Constants_1.DAPP_LOGO} height={25} width={25} alt="logo" className="SideBarLogo"/> : Constants_1.DAPP_LOGO_LOCAL ? <image_1.default src={Constants_1.DAPP_LOGO_LOCAL} height={25} width={25} alt="logo" className="SideBarLogo"/> : <div className="SideBarLogo placeholder" />}
              <span className="HeadingTextSidebar">DeFiZen</span>
            </div>
            <div className="sidebar-menu">
              <div key={"chat"} className={activeComponent === "chat"
                ? "sidebar-menu-item active"
                : "sidebar-menu-item"} onClick={() => agent_store_1.useAgentStore.getState().setActiveComponent("chat")}>
                <div className="sidebar-menu-icon">
                  <lucide_react_1.MessageSquare size={18}/>
                </div>
                <span className="sidebar-menu-label">Chat</span>
                <div className="sidebar-menu-icon" onClick={() => {
                agent_store_1.useAgentStore.getState().setActiveChatId();
                agent_store_1.useAgentStore.getState().setOpenSideBar(false);
                if (!openArena) {
                    agent_store_1.useAgentStore.getState().handleOpenArena();
                }
            }}>
                  <io_1.IoMdAdd />
                </div>
              </div>
              {menuItems.map((item) => (<div key={item.id} className={activeComponent === item.label
                    ? "sidebar-menu-item active"
                    : "sidebar-menu-item"} onClick={() => {
                    console.log("Setting label as", item.label);
                    agent_store_1.useAgentStore.getState().setOpenSideBar(false);
                    // if(agentWalletAddress !== ""){
                    agent_store_1.useAgentStore.getState().setActiveComponent(item.label);
                    // }
                }}>
                  <div className="sidebar-menu-icon">{item.icon}</div>
                  <span className="sidebar-menu-label">{item.label}</span>
                </div>))}
              <div className="WalletContainer">
                <span className="walletName">User Wallet</span>
                <div className="sidebar-menu-item wallet-connect" onClick={isConnected ? handleDisconnect : handleConnect}>
                  <div className="sidebar-menu-icon">
                    {isConnecting ? (<lucide_react_1.Loader2 size={18} className="animate-spin"/>) : (<lucide_react_1.Wallet2 size={18}/>)}
                  </div>

                  {isConnected ? (<span className="wallet-address">
                      {formatAddress(address || "")}
                    </span>) : (<span className="sidebar-menu-label">
                      {isConnecting ? "Connecting..." : "Connect Wallet"}
                    </span>)}
                </div>
                
                <span className="walletName">Agent Wallet</span>
                <div className="sidebar-menu-item wallet-connect">
                  <div className="sidebar-menu-icon">
                    <lucide_react_1.Wallet2 size={18}/>
                  </div>
                  {agentWalletAddress ? (<span className="wallet-address">
                      {agentWalletAddress.slice(0, 6)}...{agentWalletAddress.slice(-4)}
                    </span>) : (<span className="sidebar-menu-label">0x0000...0000</span>)}
                </div>
                
                {agentWalletAddress && (<div className="copy-button" onClick={handleCopyAddress}>
                   {copied ? <lucide_react_1.Check size={16}/> : <lucide_react_1.Copy size={16}/>} {copied ? "Copied!" : "Copy Address"}
                  </div>)}

                {isConnected && (<div className="view-txn-button" onClick={viewTransactions}>
                    <lucide_react_1.ExternalLink size={16}/> View Transactions
                  </div>)}
              </div>
            </div>
          </div>
          <Social_1.SocialComponent />
        </div>
      </material_2.Drawer>);
    }
    return (<material_1.Box className="SideBarWrapper">
      {showStatus && <StatusMessage />}
      <div className="TopContainer">
        <div className="SideBarHeader">
          {( !Constants_1.HIDE_REMOTE_LOGO && Constants_1.DAPP_LOGO ) ? <image_1.default src={Constants_1.DAPP_LOGO} height={25} width={25} alt="logo" className="SideBarLogo"/> : Constants_1.DAPP_LOGO_LOCAL ? <image_1.default src={Constants_1.DAPP_LOGO_LOCAL} height={25} width={25} alt="logo" className="SideBarLogo"/> : <div className="SideBarLogo placeholder" />}
          <span className="HeadingTextSidebar">DeFiZen</span>
        </div>

        <div className="sidebar-menu">
          <div key={"chat"} className={activeComponent === "chat"
            ? "sidebar-menu-item active"
            : "sidebar-menu-item"} onClick={() => {
            agent_store_1.useAgentStore.getState().setActiveComponent("chat");
        }}>
            <div className="sidebar-menu-icon">
              <lucide_react_1.MessageSquare size={18}/>
            </div>
            <span className="sidebar-menu-label">Chat</span>
            <div className="sidebar-menu-icon" onClick={() => {
            agent_store_1.useAgentStore.getState().clearCurrentValues();
            agent_store_1.useAgentStore.getState().setActiveChatId();
            if (!openArena) {
                agent_store_1.useAgentStore.getState().handleOpenArena();
            }
        }}>
              <io_1.IoMdAdd />
            </div>
          </div>

          {menuItems.map((item) => (<div key={item.id} className={activeComponent === item.label
                ? "sidebar-menu-item active"
                : "sidebar-menu-item"} onClick={() => {
                agent_store_1.useAgentStore.getState().setOpenSideBar(false);
                // if(agentWalletAddress !== ""){
                agent_store_1.useAgentStore.getState().setActiveComponent(item.label);
                // }
            }}>
              <div className="sidebar-menu-icon">{item.icon}</div>
              <span className="sidebar-menu-label">{item.label}</span>
            </div>))}

          <div className="WalletContainer">
            <span className="walletName">User Wallet</span>
            <div className="sidebar-menu-item wallet-connect" onClick={isConnected ? handleDisconnect : handleConnect}>
              <div className="sidebar-menu-icon">
                {isConnecting ? (<lucide_react_1.Loader2 size={18} className="animate-spin"/>) : (<lucide_react_1.Wallet2 size={18}/>)}
              </div>
              
              {isConnected ? (<div className="wallet">
                  <span className="wallet-address">
                    {formatAddress(address || "")}
                  </span>
                </div>) : (<span className="sidebar-menu-label">
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </span>)}
            </div>
            
            <span className="walletName">Agent Wallet</span>
            <div className="sidebar-menu-item wallet-connect">
              <div className="sidebar-menu-icon">
                <lucide_react_1.Wallet2 size={18}/>
              </div>
              {agentWalletAddress ? (<div className="wallet">
                  <span className="wallet-address">
                    {agentWalletAddress.slice(0, 6)}...{agentWalletAddress.slice(-4)}
                  </span>
                </div>) : (<span className="sidebar-menu-label">0x0000...0000</span>)}
            </div>
            
            {agentWalletAddress && (<div className="copy-button" onClick={handleCopyAddress}>
                {copied ? <lucide_react_1.Check size={16}/> : <lucide_react_1.Copy size={16}/>} {copied ? "Copied!" : "Copy Address"}
              </div>)}
            
            {isConnected && (<div className="view-txn-button" onClick={viewTransactions}>
                <lucide_react_1.ExternalLink size={16}/> View Transactions
              </div>)}
          </div>
        </div>
      </div>

      <Social_1.SocialComponent />
    </material_1.Box>);
};
exports.Sidebar = Sidebar;
