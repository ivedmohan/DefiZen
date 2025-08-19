import "./styles.scss";
import React, { useState, useEffect } from "react";
import MarketContainer from "./MarketContainer";
import { AgentArena } from "./AgentArena";
import axios from "axios";
import { useMemo } from "react";
import { DepositWithdrawPool } from "@/Components/Backend/Types";
import {
  Select,
  MenuItem,
  ThemeProvider,
  createTheme,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  useMediaQuery,
} from "@mui/material";
import { useAgentStore } from "@/store/agent-store";
import { BsLayoutTextSidebar } from "react-icons/bs";
import { BACKEND_URL } from "@/Components/Backend/Common/Constants";
import { CustomSpinner } from "@/Components/Backend/Common/CustomSpinner";
import { useShallow } from "zustand/react/shallow";

const YieldFarm = () => {
  const [protocol, setProtocol] = useState<string>("All");
  const [data, setData] = useState<DepositWithdrawPool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const {
    agentWalletAddress
  }=useAgentStore(useShallow((state)=>({
    agentWalletAddress:state.agentWalletAddress,
  })))
  const darkTheme = createTheme({
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

  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (!agentWalletAddress) {
        setError("Wallet address is required");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      
      try {
        const response = await axios.get(`${BACKEND_URL}/depositWithdraw/pools`, {
          params: {
            agentWalletAddress: agentWalletAddress
          }
        });

        if (response.data && Array.isArray(response.data.data)) {
          setData(response.data.data);
        } else {
          setError("Invalid data format received from server");
          setData([]);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error fetching data:", errorMessage);
        setError(`Failed to fetch data: ${errorMessage}`);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [agentWalletAddress]);

  const handleChange = (event: SelectChangeEvent) => {
    setProtocol(event.target.value);
  };

  const MobileDevice = useMediaQuery("(max-width:640px)");

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    console.log("The data is", data);
    
    switch(protocol) {
      case "All":
        return data;
      case "StrkFarm":
        return data.filter((item) => item.protocol === "StrkFarm");
      case "EndurFi":
        return data.filter((item) => item.protocol === "EndurFi");
      default:
        return [];
    }
  }, [data, protocol]);
 

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="yield-farm-container">
        {MobileDevice && (
          <div
            className="YieldSideBarIcon"
            onClick={() => {
              useAgentStore.getState().setOpenSideBar(true);
            }}
          >
            <BsLayoutTextSidebar />
          </div>
        )}
        <div className="parent-container">
          <FormControl className="dropdown-container" variant="filled">
            <InputLabel sx={{ color: "#ffb400" }}>Protocol</InputLabel>
            <Select
              value={protocol}
              onChange={handleChange}
              sx={{
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
              }}
              MenuProps={{
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
              }}
            >
              {[
                { label: "All", value: "All" },
                { label: "EndurFi", value: "EndurFi" },
                { label: "StrkFarm", value: "StrkFarm" },
              ].map((item) => (
                <MenuItem
                  key={item.value}
                  value={item.value}
                  sx={{
                    padding: "20px 28px",
                    fontSize: "18px",
                  }}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {loading ? (
            <div className="spinner-container">
              <CustomSpinner size="60" color="#ffb400" />
            </div>
          ) : error ? (
            <div className="error-message" style={{ color: '#ff4444', padding: '20px', textAlign: 'center' }}>
              {error}
            </div>
          ) : filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <MarketContainer 
                key={`${item.protocol}-${index}`} 
                data={item} 
              />
            ))
          ) : (
            <div className="no-data-message" style={{ color: '#ffffff', padding: '20px', textAlign: 'center' }}>
              No data available for the selected protocol
            </div>
          )}
        </div>
        <AgentArena />
      </div>
    </ThemeProvider>
  );
};

export default YieldFarm;
