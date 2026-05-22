#!/bin/bash
# Fund a Stellar Testnet account using Friendbot
# Usage: ./fund_account.sh <public-key>

if [ -z "$1" ]; then
    echo "Usage: $0 <public-key>"
    echo "Example: $0 GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
    exit 1
fi

echo "Funding account: $1"
curl -s "https://friendbot.stellar.org?addr=$1" | jq .
echo "Account funded!"
