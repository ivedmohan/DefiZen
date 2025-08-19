"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomSpinner = void 0;
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const material_2 = require("@mui/material");
const CustomSpinner = ({ size, color }) => {
    return (<material_1.Stack spacing={2} direction="row" alignItems="center">
    <material_2.CircularProgress size={Number(size)} color="success"/>
  </material_1.Stack>);
};
exports.CustomSpinner = CustomSpinner;
