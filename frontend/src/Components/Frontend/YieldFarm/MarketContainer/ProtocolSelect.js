"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleLevelDropdownMenu = void 0;
const react_1 = __importStar(require("react"));
const fa_1 = require("react-icons/fa");
const SingleLevelDropdownMenu = ({ buttonLabel, items, }) => {
    const [open, setOpen] = (0, react_1.useState)(false);
    const [focusedIndex, setFocusedIndex] = (0, react_1.useState)(null);
    const menuRef = (0, react_1.useRef)(null);
    const buttonRef = (0, react_1.useRef)(null);
    const handleToggle = () => {
        setOpen((prev) => {
            if (!prev)
                setFocusedIndex(null);
            return !prev;
        });
    };
    const handleKeyDown = (event) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setFocusedIndex(0);
        }
        else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleToggle();
        }
        else if (event.key === "Escape") {
            setOpen(false);
            setFocusedIndex(null);
        }
    };
    (0, react_1.useEffect)(() => {
        const handler = (event) => {
            if (open &&
                menuRef.current &&
                !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        document.addEventListener("touchstart", handler);
        return () => {
            document.removeEventListener("mousedown", handler);
            document.removeEventListener("touchstart", handler);
        };
    }, [open]);
    return (<div className="relative" ref={menuRef}>
      <button ref={buttonRef} id="dropdown-button" aria-haspopup="true" aria-expanded={open} aria-controls="dropdown-menu" type="button" className="inline-flex items-center justify-center rounded-md text-sm border border-[#e4e4e7] h-10 px-4 py-2" onClick={handleToggle} onKeyDown={handleKeyDown}>
        {buttonLabel}
        <span className="ml-2">
          {open ? <fa_1.FaChevronUp /> : <fa_1.FaChevronDown />}
        </span>
      </button>

      {open && (<div className="absolute left-1/2 -translate-x-1/2 top-12">
          <ul role="menu" id="dropdown-menu" aria-labelledby="dropdown-button" className="w-56 h-auto shadow-md rounded-md p-1 border bg-white">
            {items.map((item, index) => (<li role="menuitem" key={index} className="relative flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded-md">
                {item.icon && <span>{item.icon}</span>}

                <button className="w-full text-left" onClick={() => {
                    var _a;
                    (_a = item.action) === null || _a === void 0 ? void 0 : _a.call(item);
                    setOpen(false);
                }} type="button">
                  {item.title}
                </button>
              </li>))}
          </ul>
        </div>)}
    </div>);
};
exports.SingleLevelDropdownMenu = SingleLevelDropdownMenu;
exports.default = exports.SingleLevelDropdownMenu;
