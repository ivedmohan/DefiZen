"use strict";
"use client";
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
exports.ContactWrapper = ContactWrapper;
const react_1 = require("react");
const ContactsList_1 = require("./ContactsList");
const ContactForm_1 = require("./ContactForm");
const SearchBar_1 = require("./SearchBar");
const lucide_react_1 = require("lucide-react");
const axios_1 = __importDefault(require("axios"));
require("./styles.scss");
const Constants_1 = require("@/Components/Backend/Common/Constants");
const shallow_1 = require("zustand/react/shallow");
const agent_store_1 = require("@/store/agent-store");
function ContactWrapper() {
    const [searchQuery, setSearchQuery] = (0, react_1.useState)("");
    const [showAddContact, setShowAddContact] = (0, react_1.useState)(false);
    const { agentWalletAddress, } = (0, agent_store_1.useAgentStore)((0, shallow_1.useShallow)((state) => ({
        agentWalletAddress: state.agentWalletAddress
    })));
    const [contacts, setContacts] = (0, react_1.useState)([]);
    const [editingContact, setEditingContact] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const fetchUserContacts = () => __awaiter(this, void 0, void 0, function* () {
            const result = yield axios_1.default.get(`${Constants_1.BACKEND_URL}/userContact/contacts`, {
                params: {
                    userAddress: agentWalletAddress
                }
            });
            console.log(result.data.result);
            const contacts = result.data.result;
            setContacts(contacts);
        });
        fetchUserContacts();
    }, []);
    const handleAddContact = (contact) => __awaiter(this, void 0, void 0, function* () {
        const newContact = contact;
        console.log("the new contact is", newContact);
        try {
            const result = yield axios_1.default.post(`${Constants_1.BACKEND_URL}/userContact/save`, {
                userAddress: agentWalletAddress,
                contactAddress: newContact.address,
                name: newContact.name
            });
            console.log(result.data.message);
            if (result.data.message.success) {
                alert("Contact Saved Successfully");
            }
        }
        catch (err) {
            console.log("Error initialising the contact", err);
        }
        setShowAddContact(false);
    });
    const handleEditContact = (contact) => {
        setContacts(contacts.map((c) => (c.id === contact.id ? contact : c)));
        setEditingContact(null);
    };
    const filteredContacts = contacts.filter((contact) => {
        const searchLower = searchQuery.toLowerCase();
        return (contact.name.toLowerCase().includes(searchLower) ||
            contact.address.toLowerCase().includes(searchLower));
    });
    return (<div className="contact-wrapper">
      <div className="contact-header">
        <div className="contact-header-top">
          <h2 className="contact-title">Contacts</h2>
          <div onClick={() => {
            setEditingContact(null);
            setShowAddContact(true);
        }} className="add-contact-button">
            <lucide_react_1.PlusCircle className="add-icon"/>
            Add Contact
          </div>
        </div>
        <div className="search-bar-container">
          <SearchBar_1.SearchBar value={searchQuery} onChange={setSearchQuery}/>
        </div>
      </div>

      <div className="contact-body">
        {showAddContact || editingContact ? (<ContactForm_1.ContactForm onSubmit={(contact) => {
                if (editingContact) {
                    handleEditContact(contact);
                }
                else {
                    handleAddContact(contact);
                }
            }} onCancel={() => {
                setShowAddContact(false);
                setEditingContact(null);
            }} initialData={editingContact}/>) : (<ContactsList_1.ContactsList contacts={filteredContacts} onEdit={setEditingContact}/>)}
      </div>
    </div>);
}
