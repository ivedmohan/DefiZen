"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchBar = SearchBar;
require("./styles.scss");
const material_1 = require("@mui/material");
const lucide_react_1 = require("lucide-react");
function SearchBar({ value, onChange }) {
    return (<div className="searchbar-container">
      <lucide_react_1.Search className="searchbar-icon"/>
      <material_1.Input type="text" placeholder="Search by name, tag, or address..." value={value} onChange={(e) => onChange(e.target.value)} className="searchbar-input" disableUnderline fullWidth/>
    </div>);
}
