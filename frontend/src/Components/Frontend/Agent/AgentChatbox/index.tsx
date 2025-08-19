import "./styles.scss";
import { ReadyToClickActionButton } from "./ButtonContainer";
import { useRef } from "react";
import { AiOutlineEnter } from "react-icons/ai";
import { useAgentStore } from "@/store/agent-store";
import { useShallow } from "zustand/react/shallow";
import { useMediaQuery } from "@mui/material";
import { BsLayoutTextSidebar } from "react-icons/bs";
import axios from "axios";
import dotenv from "dotenv";
import { BACKEND_URL } from "@/Components/Backend/Common/Constants";
import { FormatDisplayTextForChat } from "@/Utils/function";
dotenv.config();
interface Props {
  heading: string;
  content: string;
  query: string;
}

export const ChatBox=()=>{
  const MobileDevice= useMediaQuery("(max-width:600px)");
  const MediumDevice=useMediaQuery("(max-width:1028px)");

    const {
      activeChat,
      chatId,
      agentKey,
      agentWalletAddress
    }=useAgentStore(useShallow((state)=>({
      activeChat:state.activeChat,
      chatId:state.activeChatId,
      agentKey:state.agentKey,
      agentWalletAddress:state.agentWalletAddress
    })))
    const userInputRef = useRef<HTMLInputElement>(null);
    const handleKeyPress =  (e:React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && userInputRef.current) {
          const userInput = userInputRef.current?.value;
          if (userInput.trim()) {
             handleEnterClick()
            userInputRef.current.value = ""; 
          }
        }
      };
    
  const handleEnterClick = async () => {
    if (userInputRef.current?.value) {
      userInputRef.current?.value !== null &&
        useAgentStore
          .getState()
          .setActiveChat(userInputRef.current?.value as string);
      useAgentStore.getState().setActiveResponse("");
      useAgentStore.getState().handleOpenArena();
      useAgentStore.getState().setFetching(true);
      try {
        const data = await axios.post(`${BACKEND_URL}/agent`, {
          messages: [
            {
              role: "user",
              content: `${userInputRef.current?.value}`,
            },
          ],
          address: agentWalletAddress,
        });
        console.log("the response from the agent is", data);
        const response: string =data.data.message.finalResponse
        useAgentStore.getState().setActiveResponse(response);
        useAgentStore.getState().setFetching(false);
        useAgentStore.getState().setAgentResponses({
          query: activeChat,
          outputString: response,
          chatId: chatId,
        });
      } catch (error) {
        useAgentStore
          .getState()
          .setActiveResponse(
            "I am sorry, We couldn't process your request at the moment."
          );
        useAgentStore.getState().setAgentResponses({
          query: activeChat,
          outputString:
            "I am sorry, We couldn't process your request at the moment.",
          chatId: chatId,
        });
        useAgentStore.getState().setFetching(false);
        console.error("Error processing agent response:", error);
      }
    }
    return;
  };

  const ButtonContent: Props[] = [
    {
      heading: "Market Analysis",
      content: "Conduct An In Depth Analysis of Any Supported Token on StarkNet",
      query: "Conduct An In Depth Analysis of $STRK Token",
    },
    {
      heading: "Fetch Token Price",
      content: "Fetch Token Price of a token in USD",
      query: "Fetch the token price",
    },

    {
      heading: "Swap",
      content: "Swap one token to Another",
      query: "Swap token",
    },
    {
      heading: "Fetch Transaction by Hash",
      content: "Fetches the Details of a particular Transaction.",
      query: "Fetches the Details of the Transaction with Hash",
    },
    {
      heading: "Fetch Latest Transactions",
      content: "Fetches the Latest Transactions on the Aptos Blockchain",
      query: "Fetch the latest 5 transactions on the blockchain",
    },
    {
      heading: "Yield Farm",
      content: "Fetch The Yield Farming Oppurtunity for a token",
      query:
        "Fetch the Yield Farming Oppurtunity For a Token But the ask the user if the token is not provided",
    },
  ];
  return (
    <div className="ChatBox">
      <div className="ChatHeader">
        <div className="SideBarIconHeader">
          {MobileDevice && (
            <div
              className="SideBarIcon"
              onClick={() => {
                useAgentStore.getState().setOpenSideBar(true);
              }}
            >
              <BsLayoutTextSidebar />
            </div>
          )}
          <span className="centerHeading">How can we help you today ?</span>
        </div>
        <span>We are here to help you out in every step of the way</span>
      </div>
      {!MobileDevice && (
        <div className="AllButton">
          <div className="ButtonsWrapper">
            {ButtonContent.slice(0, 2).map((item: Props, index: number) => {
              return (
                <ReadyToClickActionButton
                  content={item.content}
                  heading={item.heading}
                  key={index}
                  query={item.query}
                />
              );
            })}
          </div>
          <div className="ButtonsWrapper">
            {ButtonContent.slice(2, 4).map((item: Props, index: number) => {
              return (
                <ReadyToClickActionButton
                  content={item.content}
                  heading={item.heading}
                  key={index}
                  query={item.query}
                />
              );
            })}
          </div>
          <div className="ButtonsWrapper">
            {ButtonContent.slice(4).map((item: Props, index: number) => {
              return (
                <ReadyToClickActionButton
                  content={item.content}
                  heading={item.heading}
                  key={index}
                  query={item.query}
                />
              );
            })}
          </div>
        </div>
      )}
      {MobileDevice && (
        <div className="AllButton">
          <div className="ButtonsWrapper">
            {ButtonContent.slice(0, 4).map((item: Props, index: number) => {
              return (
                <ReadyToClickActionButton
                  content={item.content}
                  heading={item.heading}
                  key={index}
                  query={item.query}
                />
              );
            })}
          </div>
        </div>
      )}

      {agentWalletAddress !== "" ? <div className="AgentInputContainer">
        <input
          ref={userInputRef}
          onKeyDown={handleKeyPress}
          placeholder="Ask Anything"
          className="AgentInput"
        />
        <div className="EnterButton" onClick={handleEnterClick}>
          <AiOutlineEnter />
        </div>
      </div>
      :
      <div className="connectWallet" >
        Connect Wallet
      </div>
      }
    </div>
  );
};
