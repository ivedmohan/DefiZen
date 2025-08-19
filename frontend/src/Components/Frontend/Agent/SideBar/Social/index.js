"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialComponent = exports.TWITTER_LINK = void 0;
const react_1 = __importDefault(require("react"));
require("./styles.scss");
const Box_1 = __importDefault(require("@mui/material/Box"));
const fa6_1 = require("react-icons/fa6");
exports.TWITTER_LINK = "https://x.com/DeFiZen_2025";
const SocialComponent = () => {
    /**
     * Function to open external links.
     */
    const handleOpenLink = (link) => {
        window.open(link, "_blank");
    };
    return (<Box_1.default className="DropdownContainerAgent">
          <Box_1.default className="SocialLinkContainer">
            <Box_1.default className="SocialLink" onClick={() => {
            handleOpenLink(exports.TWITTER_LINK);
        }}>
              <Box_1.default className="Icon">
                <fa6_1.FaXTwitter />
              </Box_1.default>
              <span>Twitter</span>
            </Box_1.default>

          </Box_1.default>
        </Box_1.default>);
};
exports.SocialComponent = SocialComponent;
