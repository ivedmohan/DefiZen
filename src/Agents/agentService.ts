import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { starknetTools } from "../tools/starknetTools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";
import { SYSTEM_PROMPT } from "./systemPrompt";
import { createStarkNetAnalyzerTool } from "../tools/analyze_starknet_sentiment";
import { StarkNetLLMAnalyzer } from "../tools/llmanalyser";
import { starknetTransactionTools } from "../tools/starknetTransactionTools";
import { swapTokenTools } from "../tools/SwapTokenTool";import { starknetTokenAnalyzerTools } from "../tools/starknetTokenAnalyzerTools";
import { starknetTokenDetailsTool, starknetTokenDetailsTools } from "../tools/starknetTokenDetailsTool";
;

const starknetAnalyzer = new StarkNetLLMAnalyzer(
	process.env.OPENROUTER_API_KEY || process.env.ANTHROPIC_API_KEY || ""
);

const analyze_sentiment_analyzer = createStarkNetAnalyzerTool(starknetAnalyzer);


dotenv.config();

interface ChatResponse {
	agentMessages: string[];
	toolOutputs: any[];
	finalResponse: string;
}

const tools = [
	// ...defiLlamaTools,
	//...defiTransactionsTools,
	 ...starknetTools,
	 ...swapTokenTools,
	 ...starknetTokenDetailsTools,
	analyze_sentiment_analyzer,
	...starknetTransactionTools
];

const llm = new ChatAnthropic({
	clientOptions: {
		defaultHeaders: {
			"X-Api-Key": process.env.ANTHROPIC_API_KEY,
		},
	},
	modelName: "claude-3-5-sonnet-latest",
	temperature: 0.5,
	streaming: false,
});

export async function chatFunction(
	messages: { role: string; content: string }[],
	address: string,
	existingMemory?: {
		preferences: {
			risk_tolerance: string
		},
		importantInfo: Record<string, any>,
		lastUpdated: string
	}
): Promise<ChatResponse>{
	console.log("Processing chat messages...");
	const systemMessage = SYSTEM_PROMPT.replace("{{address}}", address);
	const memory = new MemorySaver();

	const formattedMessages = messages.map(msg => {
		console.log("The user msg is",msg.content)
		if (msg.role === 'user') {
			
			return new HumanMessage(msg.content);
		} else if (msg.role === 'assistant') {
			return new AIMessage(msg.content);
		}
		return new HumanMessage(msg.content);
	});

	// Add memory context to the last message if it exists
	if (existingMemory && formattedMessages.length > 0) {
		const lastMessage = formattedMessages[formattedMessages.length - 1];
		lastMessage.content = `${lastMessage.content}\n<previous_context>${JSON.stringify(existingMemory)}</previous_context>`;
	}

	const app = createReactAgent({
		llm,
		tools,
		messageModifier: systemMessage,
		checkpointSaver: memory,
	});

	const config = {
		configurable: {
			thread_id: "chat-thread",
		},
		recursionLimit: 25, // Increased from 10 to 25 to allow more complex operations
	};
	
	const response: ChatResponse = {
		agentMessages: [],
		toolOutputs: [],
		finalResponse: ""
	};
	try {
		for await (const events of await app.stream({
			messages: formattedMessages
		}, { ...config, streamMode: "updates" })) {
			try {
				if (events.agent && events.agent.messages && events.agent.messages.length > 0) {
					const messages = events.agent.messages;
					for (const message of messages) {
						if (message.content) {
							if (typeof message.content === "string") {
								console.log(message.content)
								response.agentMessages.push(message.content);
							} else if (Array.isArray(message.content)) {
								console.log(message.content)
								const textMessages = message.content.filter((msg: any) => msg.type === "text");
								const textContent = textMessages.map((msg: any) => msg.text).join("\n");
								response.agentMessages.push(textContent);
							}
						}
					}
					
					if (response.agentMessages.length > 0) {
						response.finalResponse = response.agentMessages[response.agentMessages.length - 1];
					}
				}
				if (events.tools && events.tools.messages) {
					for (const toolMessage of events.tools.messages) {
						if (typeof toolMessage.content === "string") {
							try {
								console.log(toolMessage.content)
								response.toolOutputs.push(JSON.parse(toolMessage.content));
							} catch {
								console.log(toolMessage.content)
								response.toolOutputs.push(toolMessage.content);
							}
						} else {
							response.toolOutputs.push(toolMessage.content);
						}
					}
				}
			} catch (error) {
				console.error("Error processing chat message:", error);
			}
		}
		console.log("The response received from agent is",response)
		return response;
	} catch (error) {
		console.error("Error in chat execution:", error);
		
		// Handle recursion limit specifically
		if (error instanceof Error && error.message.includes('GRAPH_RECURSION_LIMIT')) {
			return {
				agentMessages: ["I apologize, but I encountered a processing limit while trying to complete your request. This typically happens when external APIs are unavailable. Please try a simpler request or try again later."],
				toolOutputs: [],
				finalResponse: "I apologize, but I encountered a processing limit while trying to complete your request. This typically happens when external APIs are unavailable. Please try a simpler request or try again later."
			};
		}
		
		throw new Error("An error occurred during chat execution");
	}
}