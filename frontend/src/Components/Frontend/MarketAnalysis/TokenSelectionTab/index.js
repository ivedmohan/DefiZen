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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenSelectionTab = void 0;
const CustomTextLoader_1 = require("@/Components/Backend/Common/CustomTextLoader");
const Token_1 = require("@/Components/Backend/Common/Token");
const react_1 = require("react");
require("./styles.scss");
const agent_store_1 = require("@/store/agent-store");
const shallow_1 = require("zustand/react/shallow");
const TokenSelectionTab = () => {
    const [tokens, setTokens] = (0, react_1.useState)([]);
    const { tokenName } = (0, agent_store_1.useAgentStore)((0, shallow_1.useShallow)((state) => ({
        tokenName: state.predictorTokenName
    })));
    (0, react_1.useEffect)(() => {
        const fetchTokens = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const result = yield (0, Token_1.fetchSupportedTokens)();
                setTokens(result);
            }
            catch (error) {
                console.error("Error fetching tokens:", error);
            }
        });
        fetchTokens();
    }, []);
    return (<div className="TokenSelectionTab">
            {tokens.length > 0 ? (tokens.map((token) => (<button key={token.id} className={tokenName.includes(token.name) ? "TokenButton Active" : "TokenButton "} onClick={() => {
                agent_store_1.useAgentStore.getState().setPredictorTokenName(token.name);
            }}>
                        {token.name.toUpperCase()}
                    </button>))) : (<CustomTextLoader_1.CustomTextLoader text="Loading Tokens"/>)}
        </div>);
};
exports.TokenSelectionTab = TokenSelectionTab;
