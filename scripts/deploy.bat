@echo off
REM Deploy all Academy contracts to Stellar Testnet
REM Prerequisites: soroban CLI, Rust, Stellar account funded

echo ======================================
echo   Academy - Contract Deployment Script
echo   Stellar Testnet
echo ======================================
echo.

set RPC_URL=https://soroban-testnet.stellar.org
set NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

REM Check if account seed is provided
if "%1"=="" (
    echo Usage: deploy.bat ^<account-seed^>
    echo Example: deploy.bat SABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890
    exit /b 1
)

set ACCOUNT_SEED=%1
echo Using account seed: %ACCOUNT_SEED%
echo.

REM Build all contracts
echo [1/5] Building Users contract...
cd contracts\users
cargo build --release
echo Done.
echo.

echo [2/5] Building Courses contract...
cd ..\courses
cargo build --release
echo Done.
echo.

echo [3/5] Building Payments contract...
cd ..\payments
cargo build --release
echo Done.
echo.

echo [4/5] Building Certificates contract...
cd ..\certificates
cargo build --release
echo Done.
echo.

echo [5/5] Building Materials contract...
cd ..\materials
cargo build --release
echo Done.
echo.

cd ..\..\
echo All contracts built successfully!
echo.

REM Deploy contracts
echo Deploying contracts to Stellar Testnet...
echo.

set WASM_DIR=target\wasm32-unknown-unknown\release

echo Deploying Users contract...
soroban contract deploy ^
    --wasm %WASM_DIR%\academy_users.wasm ^
    --source %ACCOUNT_SEED% ^
    --rpc-url %RPC_URL% ^
    --network-passphrase %NETWORK_PASSPHRASE%

echo Deploying Courses contract...
soroban contract deploy ^
    --wasm %WASM_DIR%\academy_courses.wasm ^
    --source %ACCOUNT_SEED% ^
    --rpc-url %RPC_URL% ^
    --network-passphrase %NETWORK_PASSPHRASE%

echo Deploying Payments contract...
soroban contract deploy ^
    --wasm %WASM_DIR%\academy_payments.wasm ^
    --source %ACCOUNT_SEED% ^
    --rpc-url %RPC_URL% ^
    --network-passphrase %NETWORK_PASSPHRASE%

echo Deploying Certificates contract...
soroban contract deploy ^
    --wasm %WASM_DIR%\academy_certificates.wasm ^
    --source %ACCOUNT_SEED% ^
    --rpc-url %RPC_URL% ^
    --network-passphrase %NETWORK_PASSPHRASE%

echo Deploying Materials contract...
soroban contract deploy ^
    --wasm %WASM_DIR%\academy_materials.wasm ^
    --source %ACCOUNT_SEED% ^
    --rpc-url %RPC_URL% ^
    --network-passphrase %NETWORK_PASSPHRASE%

echo.
echo ======================================
echo  Deployment complete!
echo  Update CONTRACT_IDS in frontend/src/utils/constants.ts
echo  with the deployed contract IDs above.
echo ======================================
pause
