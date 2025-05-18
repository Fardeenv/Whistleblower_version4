#!/bin/bash

set -e  # Exit on any error

# Step 1: Shut down and restart network
echo "📦 Shutting down existing network..."
sudo ./network.sh down

echo "🚀 Starting network with CA and CouchDB..."
sudo ./network.sh up -ca -s couchdb

echo "📺 Creating channel 'whistlechannel'..."
sudo ./network.sh createChannel -c whistlechannel

# Step 2: Permissions
echo "🔧 Setting permissions..."
sudo chmod 666 /var/run/docker.sock
sudo chmod -R 777 .

# Step 3: Package chaincode
echo "📦 Packaging chaincode..."
source ./lifecycle_setup_org1.sh
peer lifecycle chaincode package Whistleblower.tar.gz \
  --path ../chaincode/Whistleblower/build/install/chaincode \
  --lang java \
  --label Whistleblower_1

# Step 4: Install chaincode on Org1
echo "📥 Installing chaincode on Org1..."
peer lifecycle chaincode install Whistleblower.tar.gz \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE

# Step 5: Install chaincode on Org2
echo "📥 Installing chaincode on Org2..."
source ./lifecycle_setup_org2.sh
peer lifecycle chaincode install Whistleblower.tar.gz \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE

# Step 6: Extract package ID
echo "🔍 Getting package ID..."
PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep "Whistleblower_1:" | awk '{print $3}' | sed 's/,$//')
echo "✅ Package ID is $PACKAGE_ID"

# Step 7: Approve for Org1
echo "✅ Approving chaincode for Org1..."
source ./lifecycle_setup_org1.sh
peer lifecycle chaincode approveformyorg \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls --cafile $ORDERER_CA \
  -C whistlechannel \
  --name Whistleblower \
  --version 1.0 \
  --init-required \
  --package-id $PACKAGE_ID \
  --sequence 1

# Step 8: Approve for Org2
echo "✅ Approving chaincode for Org2..."
source ./lifecycle_setup_org2.sh
peer lifecycle chaincode approveformyorg \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls --cafile $ORDERER_CA \
  -C whistlechannel \
  --name Whistleblower \
  --version 1.0 \
  --init-required \
  --package-id $PACKAGE_ID \
  --sequence 1

# Step 9: Check commit readiness
echo "🧪 Checking commit readiness..."
peer lifecycle chaincode checkcommitreadiness \
  -C whistlechannel \
  --name Whistleblower \
  --version 1.0 \
  --sequence 1 \
  --output json \
  --init-required

# Step 10: Commit the chaincode
echo "📢 Committing chaincode..."
source ./lifecycle_setup_channel_commit.sh
peer lifecycle chaincode commit \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls --cafile $ORDERER_CA \
  -C whistlechannel \
  --name Whistleblower \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE_ORG1 \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE_ORG2 \
  --version 1.0 \
  --sequence 1 \
  --init-required

# Step 11: Invoke initLedger
echo "💥 Invoking initLedger..."
source ./lifecycle_setup_org1.sh
peer chaincode invoke \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls $CORE_PEER_TLS_ENABLED \
  --cafile $ORDERER_CA \
  -C whistlechannel \
  -n Whistleblower \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE_ORG1 \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE_ORG2 \
  --isInit \
  -c '{"function":"initLedger","Args":[]}'

echo "✅ Chaincode deployment complete!"
