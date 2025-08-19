"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsList = ContactsList;
const material_1 = require("@mui/material");
const material_2 = require("@mui/material");
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
require("./styles.scss");
const image_1 = __importDefault(require("next/image"));
function ContactsList({ contacts, onEdit }) {
    const [copiedId, setCopiedId] = (0, react_1.useState)(null);
    console.log("The received contacts are", contacts);
    const copyToClipboard = (text, contactId) => {
        navigator.clipboard.writeText(text);
        setCopiedId(contactId);
        setTimeout(() => {
            setCopiedId(null);
        }, 2000);
    };
    const truncateAddress = (address) => {
        return `${address.substring(0, 15)}...${address.substring(address.length - 4)}`;
    };
    if (contacts.length === 0) {
        return (<div className="empty-contacts">
        <p>No contacts found</p>
        <p className="empty-contacts-subtitle">Add your first contact to get started</p>
      </div>);
    }
    return (<div className="contacts-grid">
      {contacts.map((contact) => {
            const isCopied = copiedId === contact.id;
            return (<material_1.Card key={contact.id} className="contact-card">
            <material_1.CardContent className="contact-card-content">
              <div className="contact-header">
                <div className="contact-name-section">
                  <material_2.Badge className={`chain-badge`}>
                    <image_1.default src={"https://assets.coingecko.com/coins/images/26433/small/starknet.png"} height={30} width={30} alt="Strklogo"/>
                  </material_2.Badge>
                  <h3 className="contact-name">{contact.name}</h3>
                </div>
                <div className="contact-actions">
                  <material_2.Tooltip title="Edit contact">
                    <material_2.IconButton className="edit-button" onClick={() => onEdit(contact)} size="small">
                      <lucide_react_1.Edit className="action-icon"/>
                    </material_2.IconButton>
                  </material_2.Tooltip>
                </div>
              </div>
              
              <div className="address-container">
                <span className="wallet-address">{truncateAddress(contact.address)}</span>
                <material_2.Tooltip title={isCopied ? "Copied!" : "Copy address"}>
                  <div className="copy-button" onClick={() => copyToClipboard(contact.address, contact.id)}>
                    {isCopied ? (<lucide_react_1.CheckCircle className="copy-success"/>) : (<lucide_react_1.Copy className="copy-icon"/>)}
                  </div>
                </material_2.Tooltip>
              </div>
            </material_1.CardContent>
          </material_1.Card>);
        })}
    </div>);
}
