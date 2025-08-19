"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactForm = ContactForm;
const react_1 = require("react");
const material_1 = require("@mui/material");
const bs_1 = require("react-icons/bs");
require("./styles.scss");
function ContactForm({ onSubmit, onCancel, initialData }) {
    const [name, setName] = (0, react_1.useState)((initialData === null || initialData === void 0 ? void 0 : initialData.name) || "");
    const [walletAddress, setWalletAddress] = (0, react_1.useState)((initialData === null || initialData === void 0 ? void 0 : initialData.address) || "");
    const [isListening, setIsListening] = (0, react_1.useState)(false);
    const [speechSupported, setSpeechSupported] = (0, react_1.useState)(false);
    const walletInputRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        setSpeechSupported(supported);
    }, []);
    const handleSubmit = (e) => {
        e.preventDefault();
        const contactData = Object.assign(Object.assign({}, ((initialData === null || initialData === void 0 ? void 0 : initialData.id) ? { id: initialData.id } : {})), { name, address: walletAddress });
        onSubmit(contactData);
    };
    const toggleSpeechRecognition = () => {
        if (isListening) {
            stopSpeechRecognition();
        }
        else {
            startSpeechRecognition();
        }
    };
    const startSpeechRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition)
            return;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        let finalTranscript = '';
        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                    const formattedAddress = finalTranscript.replace(/\s+/g, '');
                    setWalletAddress(formattedAddress);
                }
                else {
                    interimTranscript += transcript;
                    setWalletAddress(interimTranscript);
                }
            }
        };
        recognition.onend = () => {
            setIsListening(false);
        };
        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };
        recognition.start();
        setIsListening(true);
    };
    const stopSpeechRecognition = () => {
        setIsListening(false);
    };
    return (<div className="form-container">
      <h2 className="form-heading">{initialData ? "Edit Contact" : "Add New Contact"}</h2>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-field">
          <label htmlFor="name">Name</label>
          <material_1.TextField id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter contact name" variant="outlined" required fullWidth className="dark-input"/>
        </div>

        <div className="form-field">
          <label htmlFor="chain">Chain</label>
          <material_1.Select id="chain" value={"starknet"} fullWidth className="dark-select">
            <material_1.MenuItem value="starknet">Starknet</material_1.MenuItem>
          </material_1.Select>
        </div>

        <div className="form-field full-width wallet-address-field">
          <label htmlFor="walletAddress">Wallet Address</label>
          <div className="input-with-button">
            <material_1.TextField id="walletAddress" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} placeholder="Enter wallet address" variant="outlined" required fullWidth className={`dark-input ${isListening ? 'listening' : ''}`} inputRef={walletInputRef}/>
            {speechSupported && (<material_1.Tooltip title={isListening ? "Stop dictating" : "Dictate wallet address"}>
                <material_1.IconButton onClick={toggleSpeechRecognition} className={`mic-button ${isListening ? 'active' : ''}`} size="small">
                  {isListening ? <bs_1.BsMicMute /> : <bs_1.BsMic />}
                </material_1.IconButton>
              </material_1.Tooltip>)}
          </div>
        </div>
        
        <div className="form-actions">
          <material_1.Button variant="outlined" onClick={onCancel} className="cancel-btn">
            Cancel
          </material_1.Button>
          <material_1.Button type="submit" variant="contained" className="submit-btn">
            {initialData ? "Save Changes" : "Add Contact"}
          </material_1.Button>
        </div>
      </form>
    </div>);
}
