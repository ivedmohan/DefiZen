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
require("./styles.scss");
const react_1 = __importStar(require("react"));
const MarketContainer_1 = __importDefault(require("./MarketContainer"));
const AgentArena_1 = require("./AgentArena");
const axios_1 = __importDefault(require("axios"));
const react_2 = require("react");
const material_1 = require("@mui/material");
const agent_store_1 = require("@/store/agent-store");
const bs_1 = require("react-icons/bs");
const Constants_1 = require("@/Components/Backend/Common/Constants");
const CustomSpinner_1 = require("@/Components/Backend/Common/CustomSpinner");
const shallow_1 = require("zustand/react/shallow");
const YieldFarm = () => {
    const [protocol, setProtocol] = (0, react_1.useState)("All");
    const [data, setData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const { agentWalletAddress } = (0, agent_store_1.useAgentStore)((0, shallow_1.useShallow)((state) => ({
        agentWalletAddress: state.agentWalletAddress,
    })));
    const darkTheme = (0, material_1.createTheme)({
        palette: {
            mode: "dark",
            primary: {
                main: "#ffb400",
            },
            background: {
                default: "#121212",
                paper: "#1e1e1e",
            },
            text: {
                primary: "#ffffff",
            },
        },
    });
    (0, react_1.useEffect)(() => {
        const fetchData = () => __awaiter(void 0, void 0, void 0, function* () {
            setLoading(true);
            try {
                const response = yield axios_1.default.get(`${Constants_1.BACKEND_URL}/depositWithdraw/pools`, {
                    params: {
                        agentWalletAddress: agentWalletAddress
                    }
                });
                const responseData = response.data.data;
                setData(responseData);
                console.log(response.data.data);
            }
            catch (error) {
                console.error("Error fetching data:", error);
            }
            finally {
                setLoading(false);
            }
        });
        fetchData();
    }, [agentWalletAddress]);
    const handleChange = (event) => {
        setProtocol(event.target.value);
    };
    const MobileDevice = (0, material_1.useMediaQuery)("(max-width:640px)");
    const filteredData = (0, react_2.useMemo)(() => {
        if (!data)
            return [];
        console.log("The data is", data);
        if (protocol === "All") {
            return data;
        }
        else if (protocol === "StrkFarm") {
            return data.filter((item) => item.protocol === "StrkFarm");
        }
        else if (protocol === "EndurFi") {
            return data.filter((item) => item.protocol === "EndurFi"); // Note: "EndurFi" vs "Endurfi" — ensure case matches backend!
        }
        return [];
    }, [data, protocol]);
    return (<material_1.ThemeProvider theme={darkTheme}>
      <div className="yield-farm-container">
        {MobileDevice && (<div className="YieldSideBarIcon" onClick={() => {
                agent_store_1.useAgentStore.getState().setOpenSideBar(true);
            }}>
            <bs_1.BsLayoutTextSidebar />
          </div>)}
        <div className="parent-container">
          <material_1.FormControl className="dropdown-container" variant="filled">
            <material_1.InputLabel sx={{ color: "#ffb400" }}>Protocol</material_1.InputLabel>
            <material_1.Select value={protocol} onChange={handleChange} sx={{
            width: "250px",
            color: "#ffffff",
            backgroundColor: "#1e1e1e",
            borderRadius: "8px",
            fontSize: "18px",
            "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ffb400",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ffa726",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ff9800",
            },
        }} MenuProps={{
            PaperProps: {
                sx: {
                    backgroundColor: "#2c2c2c",
                    borderRadius: "8px",
                    "& .MuiMenuItem-root": {
                        padding: "20px 28px",
                        fontSize: "18px",
                        color: "#ffffff",
                        transition: "background 0.3s",
                    },
                    "& .MuiMenuItem-root:hover": {
                        backgroundColor: "#ffb400",
                        color: "#121212",
                    },
                },
            },
        }}>
              {[
            { label: "All", value: "All" },
            { label: "EndurFi", value: "EndurFi" },
            { label: "StrkFarm", value: "StrkFarm" },
        ].map((item) => (<material_1.MenuItem key={item.value} value={item.value} sx={{
                padding: "20px 28px",
                fontSize: "18px",
            }}>
                  {item.label}
                </material_1.MenuItem>))}
            </material_1.Select>
          </material_1.FormControl>
          {loading ? (<div className="spinner-container">
              <CustomSpinner_1.CustomSpinner size="60" color="#ffb400"/>
            </div>) : filteredData.length > 0 ? (filteredData.map((item, index) => (<MarketContainer_1.default key={index} data={item}/>))) : (<p>No data available</p>)}
        </div>
        <AgentArena_1.AgentArena />
      </div>
    </material_1.ThemeProvider>);
};
exports.default = YieldFarm;
