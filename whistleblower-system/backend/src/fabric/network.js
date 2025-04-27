const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const connectToNetwork = async (username) => {
  try {
    const ccpPath = path.resolve(process.env.CONNECTION_PROFILE_PATH);
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    const walletPath = path.resolve(process.env.ADMIN_WALLET_PATH);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const identity = await wallet.get(username);
    
    if (!identity) {
      throw new Error(`Identity ${username} not found in wallet`);
    }
    
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: username,
      discovery: { enabled: true, asLocalhost: true },
    });
    
    const network = await gateway.getNetwork(process.env.CHANNEL_NAME);
    const contract = network.getContract(process.env.CONTRACT_NAME);
    
    return { gateway, contract };
  } catch (error) {
    console.error(`Failed to connect to the network: ${error}`);
    throw error;
  }
};

const disconnectFromNetwork = async (gateway) => {
  if (gateway) {
    gateway.disconnect();
  }
};

module.exports = {
  connectToNetwork,
  disconnectFromNetwork,
};
