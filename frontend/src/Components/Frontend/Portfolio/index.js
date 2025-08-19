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
exports.Portfolio = void 0;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
require("./styles.scss");
const axios_1 = __importDefault(require("axios"));
const react_2 = require("react");
const bs_1 = require("react-icons/bs");
const Rebalancer_1 = require("./Rebalancer");
const CustomSpinner_1 = require("@/Components/Backend/Common/CustomSpinner");
const image_1 = __importDefault(require("next/image"));
const Constants_1 = require("@/Components/Backend/Common/Constants");
const material_1 = require("@mui/material");
const agent_store_1 = require("@/store/agent-store");
const shallow_1 = require("zustand/react/shallow");
const Portfolio = () => {
    const isXlDevice = (0, material_1.useMediaQuery)("(min-width: 1024px)");
    const [portfolio, setPortfolio] = (0, react_2.useState)(null);
    const [allocations, setAllocation] = (0, react_2.useState)({
        stablecoin: 49,
        native: 51.08,
        other: 4.74,
    });
    const { openArena, activeComponent, agentWalletAddress, agentKey } = (0, agent_store_1.useAgentStore)((0, shallow_1.useShallow)((state) => ({
        openArena: state.openArena,
        activeComponent: state.activeComponent,
        agentWalletAddress: state.agentWalletAddress,
        agentKey: state.agentKey
    })));
    const MobileDevice = (0, material_1.useMediaQuery)("(max-width:600px)");
    (0, react_2.useEffect)(() => {
        const fetchPortfolio = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${Constants_1.BACKEND_URL}/userPortfolio`, {
                    params: {
                        agentWalletAddress: agentWalletAddress
                    }
                });
                console.log(response.data);
                const Tokens = response.data.userPortfolio.tokens;
                console.log(Tokens);
                const stableTokens = Tokens.filter((item) => item.type === "stable");
                const nativeTokens = Tokens.filter((item) => item.type === "native");
                const otherTokens = Tokens.filter((item) => item.type === "other");
                const stableSum = stableTokens.reduce((sum, token) => sum + Number(token.valueUsd), 0);
                const nativeSum = nativeTokens.reduce((sum, token) => sum + Number(token.valueUsd), 0);
                const otherSum = otherTokens.reduce((sum, token) => sum + Number(token.valueUsd), 0);
                const totalSum = response.data.userPortfolio.total_value_usd;
                console.log("the total sum is", totalSum);
                if (totalSum === 0) {
                    setAllocation({
                        stablecoin: 0,
                        native: 0,
                        other: 0
                    });
                }
                else {
                    console.log(Number(((stableSum / totalSum) * 100).toFixed(2)), Number(((nativeSum / totalSum) * 100).toFixed(2)), Number(((otherSum / totalSum) * 100).toFixed(2)));
                    setAllocation({
                        stablecoin: Number(((stableSum / totalSum) * 100).toFixed(2)),
                        native: Number(((nativeSum / totalSum) * 100).toFixed(2)),
                        other: Number(((otherSum / totalSum) * 100).toFixed(2))
                    });
                }
                setPortfolio(response.data.userPortfolio);
            }
            catch (error) {
                console.error("Error fetching portfolio:", error);
            }
        });
        fetchPortfolio();
    }, []);
    if (!portfolio) {
        return <div className='PortfolioLoader'>
     <CustomSpinner_1.CustomSpinner color='#1e1e1e1' size='50'/>
    </div>;
    }
    const totalValue = portfolio.total_value_usd;
    return (<div className="portfolio-wrapper">
      {isXlDevice ?
            <div className='portfolio-card'>
      <div className="portfolio-header">
      <div className="portfolio-actions">
      {MobileDevice && <div className="SideBarIcon" onClick={() => {
                        agent_store_1.useAgentStore.getState().setOpenSideBar(true);
                    }}>
        <bs_1.BsLayoutTextSidebar />
        </div>}
      </div>
        <h2 className="portfolio-title">
          <lucide_react_1.PieChart size={20} className="portfolio-icon"/>
          Portfolio Overview
        </h2> 
      </div>

      <div className="portfolio-value">
        <div className="portfolio-value-label">Total Portfolio Value</div>
        <div className="portfolio-value-amount">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>


      <div className="portfolio-allocations">
        <div className="portfolio-allocations-title">Allocations</div>
        <div className="portfolio-allocations-list">
          <div className="portfolio-allocation-item">
            <span>Stablecoin</span>
            <span>{allocations.stablecoin}%</span>
          </div>
          <div className="portfolio-allocation-item">
            <span>Native</span>
            <span>{allocations.native}%</span>
          </div>
          <div className="portfolio-allocation-item">
            <span>Other</span>
            <span>{allocations.other}%</span>
          </div>
        </div>
      </div>

      <div className="portfolio-token-list">
        {portfolio.tokens.sort((a, b) => Number(b.valueUsd) - Number(a.valueUsd)).map((token, index) => (<div key={token.address} className="portfolio-token-item" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="portfolio-token-details">
              <div className="portfolio-token-symbol">
                <image_1.default src={token.image} height={25} width={25} alt='tokenLogo'/>
              </div>
              <div>
                <div className="portfolio-token-name">{token.name.toUpperCase()}</div>
                <div className="portfolio-token-balance">
                  {/* {(Number(token.balance) / Math.pow(10, Number(token.decimals))).toFixed(4)}  */}
                  <span>{token.balance.slice(0, 6)}</span>
                  <span>{token.name.toUpperCase().slice(0, 1) + token.name.toLowerCase().slice(1)}</span>
                </div>
              </div>
            </div>
            <div className="portfolio-token-value">
              <div className="portfolio-token-amount">${token.valueUsd.toLocaleString()}</div>
              <div className={`portfolio-token-change`}>
               ${parseFloat(token.priceUsd).toFixed(4)}
              </div>
            </div>
          </div>))}
      </div>
      </div>
            :
                <div className='portfolio-card'>
      <div className="portfolio-header">
      {MobileDevice && <div className="portfolio-actions">
           <div className="portfolio-action-btn" onClick={() => {
                            agent_store_1.useAgentStore.getState().setOpenSideBar(true);
                        }}>
        <bs_1.BsLayoutTextSidebar />
        </div>
        </div>}
        <h2 className="portfolio-title">
          <lucide_react_1.PieChart size={20} className="portfolio-icon"/>
          Portfolio Overview
        </h2>
       
      </div>
      <div className='midWrapper'>
        <div className='leftSide'>
        <div className="portfolio-value">
        <div className="portfolio-value-label">Total Portfolio Value</div>
        <div className="portfolio-value-amount">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div className="portfolio-allocations">
        <div className="portfolio-allocations-title">Allocations</div>
        <div className="portfolio-allocations-list">
          <div className="portfolio-allocation-item">
            <span>Stablecoin</span>
            <span>{allocations.stablecoin}%</span>
          </div>
          <div className="portfolio-allocation-item">
            <span>Native</span>
            <span>{allocations.native}%</span>
          </div>
          <div className="portfolio-allocation-item">
            <span>Other</span>
            <span>{allocations.other}%</span>
          </div>
        </div>
      </div>
      </div>


      
        </div>

      <div className="portfolio-token-list">
        {portfolio.tokens.sort((a, b) => Number(b.valueUsd) - Number(a.valueUsd)).map((token, index) => (<div key={token.address} className="portfolio-token-item" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="portfolio-token-details">
              <div className="portfolio-token-symbol">
                <image_1.default src={token.image} height={25} width={25} alt='tokenLogo'/>
              </div>
              <div>
                <div className="portfolio-token-name">{token.name.toUpperCase()}</div>
                <div className="portfolio-token-balance">
                  {(Number(token.balance) / Math.pow(10, Number(token.decimals))).toFixed(4)} {token.name.toUpperCase()}
                </div>
              </div>
            </div>
            <div className="portfolio-token-value">
              <div className="portfolio-token-amount">${Number(token.valueUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className={`portfolio-token-change`}>
               ${parseFloat(token.valueUsd).toFixed(4)}
              </div>
            </div>
          </div>))}
      </div>
      </div>
      

      
      </div>}
      
      <Rebalancer_1.PortfolioRebalancer tokens={portfolio.tokens} stableAllocation={allocations.stablecoin} nativeAllocation={allocations.native} otherAllocation={allocations.other} totalValue={totalValue}/>
    </div>);
};
exports.Portfolio = Portfolio;
