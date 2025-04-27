const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

const enrollAdmin = async () => {
  try {
    const ccpPath = path.resolve(process.env.CONNECTION_PROFILE_PATH);
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
    const caURL = caInfo.url;
    const ca = new FabricCAServices(caURL);
    
    const walletPath = path.resolve(process.env.ADMIN_WALLET_PATH);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    
    const identity = await wallet.get('admin');
    if (identity) {
      console.log('Admin identity already exists in the wallet');
      return;
    }
    
    const enrollment = await ca.enroll({ 
      enrollmentID: 'admin', 
      enrollmentSecret: 'adminpw' 
    });
    
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: 'Org1MSP',
      type: 'X.509',
    };
    
    await wallet.put('admin', x509Identity);
    console.log('Successfully enrolled admin user and imported it into the wallet');
  } catch (error) {
    console.error(`Failed to enroll admin user: ${error}`);
    throw error;
  }
};

module.exports = {
  enrollAdmin,
};
