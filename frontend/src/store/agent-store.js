"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAgentStore = void 0;
const zustand_1 = require("zustand");
exports.useAgentStore = (0, zustand_1.create)((set, get) => ({
    openArena: false,
    activeResponse: "",
    activeTransactionHashResponse: {
        outputString: "",
        quote: "",
        query: "",
        activeTransactionHash: "",
    },
    yieldAgentFetching: false,
    fetching: false,
    agentWalletAddress: "",
    agentKey: "",
    walletAddress: "",
    yieldChats: [],
    predictionChat: [],
    openSideBar: false,
    disable: false,
    sendingTransaction: false,
    showTransactionHash: false,
    activeChatId: 1,
    userChatSummary: [],
    agentResponses: [],
    userChats: [],
    activeYieldResponse: {
        analysis: "",
        recommendedAction: ""
    },
    activeYieldChat: "",
    predictorTokenName: "apt",
    handleOpenArena: () => {
        set((state) => ({
            openArena: true,
        }));
    },
    handleCloseArena: () => {
        set((state) => ({
            openArena: true,
        }));
    },
    activeChat: "",
    setActiveChat: (chat) => {
        set((state) => {
            return {
                activeChat: chat,
            };
        });
    },
    setActiveResponse: (response) => {
        set((state) => ({
            activeResponse: response,
        }));
    },
    setActiveChatId: () => {
        set((state) => ({
            activeChatId: state.activeChatId + 1,
        }));
    },
    clearCurrentValues: () => {
        set((state) => ({
            activeChat: "",
            activeResponse: "",
        }));
    },
    activeComponent: "chat",
    setActiveComponent: (value) => {
        set((state) => ({
            activeComponent: value,
        }));
    },
    setPredictorTokenName: (value) => {
        set((state) => ({
            predictorTokenName: value,
        }));
    },
    setPredictionChat: (chat) => {
        set((state) => ({
            predictionChat: [...state.predictionChat, chat],
        }));
    },
    setAgentResponses: (value) => {
        set((state) => ({
            agentResponses: [...state.agentResponses, value],
        }));
    },
    setOpenSideBar: (value) => {
        set((state) => ({
            openSideBar: value,
        }));
    },
    setYieldChats: (value) => {
        set((state) => ({
            yieldChats: [...state.yieldChats, value],
        }));
    },
    setWalletAddress: (value) => {
        set((state) => ({
            walletAddress: value,
        }));
    },
    setActiveYieldChat: (value) => {
        set({ activeYieldChat: value });
    },
    setActiveYieldResponse: (response) => {
        set({
            activeYieldResponse: response
        });
    },
    setAgentWalletAddress: (value) => {
        set({
            agentWalletAddress: value
        });
    },
    setAgentKey: (value) => {
        set({
            agentKey: value
        });
    },
    setFetching: (value) => {
        set({
            fetching: value
        });
    },
    setYieldAgentFetching: (value) => {
        set({
            yieldAgentFetching: value
        });
    }
}));
