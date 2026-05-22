#!/bin/bash
# Deploy all Academy contracts to Stellar Testnet
# Prerequisites: soroban CLI, Rust, Stellar account funded

RPC_URL="https://soroban-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

if [ -z "$1" ]; then
    echo "Usage: $0 <account-seed>"
    echo "Example: $0 SABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
    exit 1
fi

ACCOUNT_SEED="$1"
echo "Using account seed: $ACCOUNT_SEED"

# Build all contracts
echo "[1/5] Building Users contract..."
cd contracts/users && cargo build --release && cd ../..

echo "[2/5] Building Courses contract..."
cd contracts/courses && cargo build --release && cd ../..

echo "[3/5] Building Payments contract..."
cd contracts/payments && cargo build --release && cd ../..

echo "[4/5] Building Certificates contract..."
cd contracts/certificates && cargo build --release && cd ../..

echo "[5/5] Building Materials contract..."
cd contracts/materials && cargo build --release && cd ../..

echo "All contracts built!"

# Deploy contracts
WASM_DIR="target/wasm32-unknown-unknown/release"

echo "Deploying Users contract..."
soroban contract deploy \
    --wasm $WASM_DIR/academy_users.wasm \
    --source $ACCOUNT_SEED \
    --rpc-url $RPC_URL \
    --network-passphrase "$NETWORK_PASSPHRASE"

echo "Deploying Courses contract..."
soroban contract deploy \
    --wasm $WASM_DIR/academy_courses.wasm \
    --source $ACCOUNT_SEED \
    --rpc-url $RPC_URL \
    --network-passphrase "$NETWORK_PASSPHRASE"

echo "Deploying Payments contract..."
soroban contract deploy \
    --wasm $WASM_DIR/academy_payments.wasm \
    --source $ACCOUNT_SEED \
    --rpc-url $RPC_URL \
    --network-passphrase "$NETWORK_PASSPHRASE"

echo "Deploying Certificates contract..."
soroban contract deploy \
    --wasm $WASM_DIR/academy_certificates.wasm \
    --source $ACCOUNT_SEED \
    --rpc-url $RPC_URL \
    --network-passphrase "$NETWORK_PASSPHRASE"

echo "Deploying Materials contract..."
soroban contract deploy \
    --wasm $WASM_DIR/academy_materials.wasm \
    --source $ACCOUNT_SEED \
    --rpc-url $RPC_URL \
    --network-passphrase "$NETWORK_PASSPHRASE"

echo ""
echo "======================================"
echo " Deployment complete!"
echo " Update CONTRACT_IDS in frontend/src/utils/constants.ts"
echo " with the deployed contract IDs above."
echo "======================================"
