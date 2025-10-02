#!/bin/bash

# Quick balance check
WALLET="0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61"

echo "💰 Checking Wallet Balance"
echo "=========================="
echo ""
echo "Wallet: $WALLET"
echo ""

curl -s "http://localhost:3002/userportfolio?walletAddress=$WALLET" | jq '.tokens[] | select(.balance != "0") | {name, balance, valueUsd, priceUsd}'

echo ""
echo "Check live on Voyager:"
echo "https://voyager.online/contract/$WALLET"
