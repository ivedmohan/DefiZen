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
exports.PortfolioRebalancer = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const lucide_react_1 = require("lucide-react");
require("./styles.scss");
const axios_1 = __importDefault(require("axios"));
const agent_store_1 = require("@/store/agent-store");
const PieChart_1 = require("@mui/x-charts/PieChart");
const Constants_1 = require("@/Components/Backend/Common/Constants");
const shallow_1 = require("zustand/react/shallow");
const CATEGORY_COLORS = {
    stable: "#7bf179",
    native: "#FC72FF",
    other: "#DFCC28"
};
const PortfolioRebalancer = ({ tokens, totalValue, stableAllocation, otherAllocation, nativeAllocation, }) => {
    const isXxlDevice = (0, material_1.useMediaQuery)("(min-width: 1300px)");
    const isXlDevice = (0, material_1.useMediaQuery)("(min-width: 1020px) and (max-width: 1279px)");
    const mobileDevide = (0, material_1.useMediaQuery)("(max-width: 600px)");
    const { agentWalletAddress } = (0, agent_store_1.useAgentStore)((0, shallow_1.useShallow)((state) => ({
        agentWalletAddress: state.agentWalletAddress
    })));
    const calculateCategoryValues = (tokenList) => {
        const categoryValues = {
            stable: 0,
            native: 0,
            other: 0
        };
        tokenList.forEach(token => {
            categoryValues[token.type] += Number(token.valueUsd);
        });
        return categoryValues;
    };
    const categoryValues = calculateCategoryValues(tokens);
    const initialCategories = [
        {
            name: "Stable",
            color: CATEGORY_COLORS.stable,
            currentAllocation: stableAllocation,
            targetAllocation: stableAllocation
        },
        {
            name: "Native",
            color: CATEGORY_COLORS.native,
            currentAllocation: nativeAllocation,
            targetAllocation: nativeAllocation
        },
        {
            name: "Other",
            color: CATEGORY_COLORS.other,
            currentAllocation: otherAllocation,
            targetAllocation: otherAllocation
        }
    ];
    const [categories, setCategories] = (0, react_1.useState)(initialCategories);
    const [rebalancing, setRebalancing] = (0, react_1.useState)(false);
    const totalAllocation = categories.reduce((sum, category) => sum + category.targetAllocation, 0);
    const handleAllocationChange = (index, newValue) => {
        var _a;
        const updatedCategories = [...categories];
        const value = Array.isArray(newValue) ? newValue[0] : newValue;
        const difference = Math.floor(value) - updatedCategories[index].targetAllocation;
        updatedCategories[index].targetAllocation = value;
        if (difference > 0) {
            const otherCategories = updatedCategories.filter((_, i) => i !== index);
            const otherTotalAllocation = otherCategories.reduce((sum, category) => sum + category.targetAllocation, 0);
            if (otherTotalAllocation > 0) {
                updatedCategories.forEach((category, i) => {
                    if (i !== index && category.targetAllocation > 0) {
                        const proportion = category.targetAllocation / otherTotalAllocation;
                        const reduction = Math.round(difference * proportion);
                        updatedCategories[i].targetAllocation = Math.max(0, Math.floor(category.targetAllocation - reduction));
                    }
                });
            }
        }
        else if (difference < 0) {
            const otherCategories = updatedCategories.filter((_, i) => i !== index);
            const otherTotalAllocation = otherCategories.reduce((sum, category) => sum + category.targetAllocation, 0);
            if (otherTotalAllocation > 0) {
                updatedCategories.forEach((category, i) => {
                    if (i !== index) {
                        const proportion = category.targetAllocation / otherTotalAllocation;
                        const addition = Math.round(Math.abs(difference) * proportion);
                        updatedCategories[i].targetAllocation += Math.floor(addition);
                    }
                });
            }
        }
        const newTotal = updatedCategories.reduce((sum, category) => sum + category.targetAllocation, 0);
        if (newTotal !== 100) {
            const largestIndex = (_a = updatedCategories
                .map((category, i) => (i !== index ? { index: i, value: category.targetAllocation } : { index: -1, value: -1 }))
                .filter((item) => item.index !== -1)
                .sort((a, b) => b.value - a.value)[0]) === null || _a === void 0 ? void 0 : _a.index;
            if (largestIndex !== undefined) {
                updatedCategories[largestIndex].targetAllocation += 100 - newTotal;
            }
            else {
                updatedCategories[index].targetAllocation = 100;
            }
        }
        setCategories(updatedCategories);
    };
    const handleDirectInput = (index, newValue) => {
        const numValue = parseInt(newValue, 10);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
            handleAllocationChange(index, numValue);
        }
    };
    const handleRebalance = () => __awaiter(void 0, void 0, void 0, function* () {
        setRebalancing(true);
        console.log(`Rebalance my tokens portfolio to ${categories[0].targetAllocation} ${categories[0].name.toLowerCase()}, ${categories[1].targetAllocation} ${categories[1].name.toLowerCase()} and ${categories[2].targetAllocation} ${categories[2].name.toLowerCase()}`);
        try {
            const { data } = yield axios_1.default.post(`${Constants_1.BACKEND_URL}/rebalance`, {
                agentWalletAddress: agentWalletAddress,
                stable: categories[0].targetAllocation,
                native: categories[1].targetAllocation,
                other: categories[2].targetAllocation
            });
            setTimeout(() => {
                const rebalancedCategories = categories.map((category) => (Object.assign(Object.assign({}, category), { currentAllocation: category.targetAllocation })));
                setCategories(rebalancedCategories);
                setRebalancing(false);
            }, 1500);
        }
        catch (error) {
            console.log(error);
            setRebalancing(false);
        }
    });
    return (<div className="portfolio-rebalancer-card">
      <div className="portfolio-rebalancer-header">
        <h2 className="portfolio-rebalancer-title">
          <lucide_react_1.RefreshCw size={20} className="portfolio-rebalancer-icon"/>
          Portfolio Category Rebalancer
        </h2>
      </div>

      <div className="portfolio-rebalancer-content">
        <div className="portfolio-rebalancer-controls">
          <div className="portfolio-rebalancer-label">Adjust target allocations by category</div>
          {categories.map((category, index) => (<div key={category.name} className="portfolio-rebalancer-item">
              <div className="portfolio-rebalancer-token-info">
                <div className="portfolio-rebalancer-token-color" style={{ backgroundColor: category.color }}/>
                <span>{category.name} Assets</span>
                <div className="portfolio-rebalancer-token-allocations">
                  <span>Current: {category.currentAllocation}%</span>
                  <span>Target:</span>
                  <material_1.TextField type="number" size="small" variant="outlined" value={category.targetAllocation} onChange={(e) => handleDirectInput(index, e.target.value)} sx={{
                width: 60,
                marginLeft: 1,
                "& .MuiOutlinedInput-root": {
                    background: "#1e1e1e",
                    color: "#ffffff",
                    borderColor: "#1a1a1a",
                },
                "& .MuiInputBase-input": {
                    padding: "4px",
                },
            }}/>
                </div>
              </div>
              <material_1.Slider value={category.targetAllocation} min={0} max={100} step={1} onChange={(_, newValue) => handleAllocationChange(index, newValue)} sx={{
                width: "80%",
                margin: "0 auto",
                fill: category.color,
                "& .MuiSlider-track": {
                    backgroundColor: category.color,
                    fontSize: "10px"
                },
                "& .MuiSlider-rail": {
                    backgroundColor: "#1e1e1e",
                },
                "& .MuiSlider-thumb": {
                    backgroundColor: category.color
                },
            }}/>
            </div>))}  
        </div>
        <div className="portfolio-rebalancer-footer">
            <div className="portfolio-rebalancer-total">
              Total: {Math.min(totalAllocation, 100)}%
              
            </div>
            <div onClick={handleRebalance} className="RebalancerButton">
              {rebalancing ? "Rebalancing..." : "Rebalance Portfolio"}
            </div>
          </div>
      </div>
      <div className="PieChart">
      <PieChart_1.PieChart series={[
            {
                data: [
                    { id: 0, value: stableAllocation, label: 'StableCoin' },
                    { id: 1, value: nativeAllocation, label: 'Native' },
                    { id: 2, value: otherAllocation, label: 'Other' },
                ],
                innerRadius: 15,
                cx: isXlDevice ? 20 : mobileDevide ? 60 : 45,
                cy: isXxlDevice ? 185 : isXlDevice ? 110 : mobileDevide ? 120 : 125,
                paddingAngle: 4,
                cornerRadius: 2,
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
            },
        ]} sx={{
            [`& .${PieChart_1.pieArcLabelClasses.root}`]: {
                fontWeight: 'bold',
                fill: "#ffffff"
            },
        }} slotProps={{
            legend: {
                labelStyle: {
                    fontSize: 12,
                    fill: "#ffffff"
                }
            }
        }} width={isXxlDevice ? 400 : isXlDevice ? 220 : 280} height={isXxlDevice ? 400 : isXlDevice ? 220 : 280}/>
      </div>
    </div>);
};
exports.PortfolioRebalancer = PortfolioRebalancer;
