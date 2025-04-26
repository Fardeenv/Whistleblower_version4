const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const connectToNetwork = async (username) => {
  try {
    // Load connection profile
    const ccpPath = path.resolve(process.env.CONNECTION_PROFILE_PATH);
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Create a new wallet for identity
    const walletPath = path.resolve(process.env.ADMIN_WALLET_PATH);
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check if user identity exists in the wallet
    const identity = await wallet.get(username);
    if (!identity) {
      throw new Error(`Identity ${username} not found in wallet`);
    }

    // Create a new gateway for connecting to the peer node
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: username,
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get the network (channel) our contract is deployed to
    const network = await gateway.getNetwork(process.env.CHANNEL_NAME);

    // Get the contract from the network
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
