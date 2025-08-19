import React from 'react';
import { PieChart, BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import "./styles.scss";
import axios from "axios";
import { useState, useEffect } from 'react';
import { BsLayoutTextSidebar } from "react-icons/bs";
import { Token, TokenForPortfolio, UserPortfolio } from '@/Components/Backend/Types';
import { UserAllocations } from '@/Components/Backend/Types';
import { PortfolioRebalancer } from './Rebalancer';
import { CustomSpinner } from '@/Components/Backend/Common/CustomSpinner';
import Image from 'next/image';
import { BACKEND_URL } from '@/Components/Backend/Common/Constants';
import { useMediaQuery } from '@mui/material';
import { useAgentStore } from '@/store/agent-store';
import { useShallow } from 'zustand/react/shallow';
export const Portfolio = () => {
  const isXlDevice = useMediaQuery("(min-width: 1024px)")
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null);
  const [allocations,setAllocation] = useState<UserAllocations>({
    stablecoin: 49,
    native: 51.08,
    other: 4.74,
  });
  const {
    openArena,
    activeComponent,
    agentWalletAddress,
    agentKey
}=useAgentStore(useShallow((state)=>({
    openArena:state.openArena,
    activeComponent:state.activeComponent,
    agentWalletAddress:state.agentWalletAddress,
    agentKey:state.agentKey
})))
const MobileDevice= useMediaQuery("(max-width:600px)");
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/userPortfolio`,{
          params:{
            agentWalletAddress:agentWalletAddress
          }
        });
        console.log(response.data)
        const userPortfolio = response.data.userPortfolio;
        const Tokens: TokenForPortfolio[] = (userPortfolio && Array.isArray(userPortfolio.tokens)) ? userPortfolio.tokens : [];
        console.log(Tokens)
        const stableTokens=Tokens.filter((item)=>item.type==="stable");
        const nativeTokens=Tokens.filter((item)=>item.type==="native");
        const otherTokens=Tokens.filter((item)=>item.type==="other");
        const stableSum = stableTokens.reduce((sum, token) => sum + Number(token.valueUsd), 0);
        const nativeSum = nativeTokens.reduce((sum, token) => sum + Number(token.valueUsd), 0);
        const otherSum = otherTokens.reduce((sum, token) => sum + Number(token.valueUsd), 0);
        const totalSum = userPortfolio && typeof userPortfolio.total_value_usd === 'number' ? userPortfolio.total_value_usd : 0;
        console.log("the total sum is",totalSum)
        if(totalSum===0){
          setAllocation({
            stablecoin:0,
            native:0,
            other:0
          })
        }else{
          console.log(Number(((stableSum/totalSum)*100).toFixed(2)), Number(((nativeSum/totalSum)*100).toFixed(2)), Number(((otherSum/totalSum)*100).toFixed(2)))
          setAllocation({
            stablecoin:Number(((stableSum/totalSum)*100).toFixed(2)),
            native:Number(((nativeSum/totalSum)*100).toFixed(2)),
            other:Number(((otherSum/totalSum)*100).toFixed(2))
          })
        }
        setPortfolio(response.data.userPortfolio);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      }
    };
    fetchPortfolio();
  }, []);

  if (!portfolio) {
    return <div className='PortfolioLoader'>
     <CustomSpinner color='#1e1e1e1' size='50'/>
    </div>; 
  }

  const totalValue = portfolio?.total_value_usd && !isNaN(portfolio.total_value_usd) ? portfolio.total_value_usd : 0;
 
  return (
    <div className="portfolio-wrapper">
      {isXlDevice ?
      <div className='portfolio-card'>
      <div className="portfolio-header">
      <div className="portfolio-actions">
      { MobileDevice &&  <div className="SideBarIcon" onClick={()=>{
            useAgentStore.getState().setOpenSideBar(true)
        }}>
        <BsLayoutTextSidebar />
        </div>}
      </div>
        <h2 className="portfolio-title">
          <PieChart size={20} className="portfolio-icon" />
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
        {portfolio.tokens.sort((a,b)=> Number(b.valueUsd) - Number(a.valueUsd)).map((token, index) => (
          <div
            key={token.address} 
            className="portfolio-token-item"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="portfolio-token-details">
              <div className="portfolio-token-symbol">
                <Image src={token.image} height={25} width={25} alt='tokenLogo'/>
              </div>
              <div>
                <div className="portfolio-token-name">{token.name.toUpperCase()}</div>
                <div className="portfolio-token-balance">
                  {/* {(Number(token.balance) / Math.pow(10, Number(token.decimals))).toFixed(4)}  */}
                  <span>{token.balance.slice(0,6)}</span>
                  <span>{token.name.toUpperCase().slice(0,1)+token.name.toLowerCase().slice(1)}</span>
                </div>
              </div>
            </div>
            <div className="portfolio-token-value">
              <div className="portfolio-token-amount">${(Number(token.valueUsd) || 0).toLocaleString()}</div>
              <div
                className={`portfolio-token-change`}
              >
               ${parseFloat(token.priceUsd).toFixed(4)}
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
      :
      <div className='portfolio-card'>
      <div className="portfolio-header">
      { MobileDevice && <div className="portfolio-actions">
           <div className="portfolio-action-btn" onClick={()=>{
            useAgentStore.getState().setOpenSideBar(true)
        }}>
        <BsLayoutTextSidebar />
        </div>
        </div>}
        <h2 className="portfolio-title">
          <PieChart size={20} className="portfolio-icon" />
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
        {portfolio.tokens.sort((a,b)=> Number(b.valueUsd) - Number(a.valueUsd)).map((token, index) => (
          <div
            key={token.address} 
            className="portfolio-token-item"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="portfolio-token-details">
              <div className="portfolio-token-symbol">
                <Image src={token.image} height={25} width={25} alt='tokenLogo'/>
              </div>
              <div>
                <div className="portfolio-token-name">{token.name.toUpperCase()}</div>
                <div className="portfolio-token-balance">
                  {(Number(token.balance) / Math.pow(10, Number(token.decimals))).toFixed(4)} {token.name.toUpperCase()}
                </div>
              </div>
            </div>
            <div className="portfolio-token-value">
              <div className="portfolio-token-amount">${(Number(token.valueUsd) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div
                className={`portfolio-token-change`}
              >
               ${(parseFloat(token.priceUsd) || 0).toFixed(4)}
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
      

      
      </div>
}
      
      <PortfolioRebalancer tokens={portfolio.tokens} stableAllocation={allocations.stablecoin} nativeAllocation={allocations.native} otherAllocation={allocations.other} totalValue={totalValue}/>
    </div>
  );
};