"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
require("./globals.scss");
const provider_1 = require("./provider");
exports.metadata = {
    title: "DeFiZen",
    description: "Defi Agent to enable cross chain transfers, add liquidity and optimise Your Yield",
};
function RootLayout({ children, }) {
    return (<html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <provider_1.Providers>
          <div className="AppWrapper">
            <div className="AppContainer">
              <div style={{ display: "flex", flex: 1, overflow: "auto" }}>
                {children}
              </div>
            </div>
          </div>
        </provider_1.Providers>
      </body>
    </html>);
}
