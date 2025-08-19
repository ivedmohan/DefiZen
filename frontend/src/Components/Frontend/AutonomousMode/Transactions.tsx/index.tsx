
import Image from "next/image";
import "./styles.scss";
import { USDC_LOGO, USDT_LOGO } from "@/Components/Backend/Common/Constants";
interface Props{
    fromToken:string;
    toToken:string;
    amount:string;
    hash:string;
}
export const TransacitonsContainer=()=>{
    const getTokenLogo = (token: string) => {
        switch (token) {
            case "USDC":
                return USDC_LOGO;
            case "USDT":
                return USDT_LOGO;
            default:
                return USDC_LOGO; // Default fallback
        }
    };
    return (
        <div className="TransactionBox">
        <div className="TransactionRow header">
            <div className="AgentColumn">From Token</div>
            <div className="AgentColumn">To Token</div>
            <div className="AgentColumn">Amount</div>
            <div className="AgentColumn">Transaction Hash</div>
        </div>
            <div className="TransactionRow">
                <div className="AgentColumn">
                    <span className="tokenLogo">
                        <div className="tokenImageWrapper">
                            <Image 
                                src={USDC_LOGO} 
                                height={30} 
                                width={30} 
                                alt="USDC logo"
                                onError={(e) => {
                                    // Fallback to a div if image fails to load
                                    const target = e.target as HTMLElement;
                                    target.style.display = 'none';
                                    target.parentElement?.classList.add('fallback');
                                }}
                            />
                        </div>
                        {"USDC"}
                    </span>
                </div>
                <div className="AgentColumn">
                    <span className="tokenLogo">
                        <div className="tokenImageWrapper">
                            <Image 
                                src={USDT_LOGO} 
                                height={30} 
                                width={30} 
                                alt="USDT logo"
                                onError={(e) => {
                                    // Fallback to a div if image fails to load
                                    const target = e.target as HTMLElement;
                                    target.style.display = 'none';
                                    target.parentElement?.classList.add('fallback');
                                }}
                            />
                        </div>
                        {"USDT"}
                    </span>
                </div>
                <div className="AgentColumn">
                    <span>{1000}</span>
                </div>
                <div className="AgentColumn">
                    <span>{"0x000000.....00000000"}</span>
                </div>
            </div>
    </div>
    )
}