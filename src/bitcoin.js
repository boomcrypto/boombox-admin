import {
  cvToString,
  AddressHashMode,
  bufferCV,
  tupleCV,
} from '@stacks/transactions';
import bitcoin, {address} from 'bitcoinjs-lib';

export function deriveBitcoinAddress() {
  const appPrivateKey =
    this.blockstack.UserSession.loadUserData().appPrivateKey;

  // generate bitcoin address TESTNET
  let testnet = bitcoin.networks.testnet;
  let keyBuffer = Buffer.from(appPrivateKey, 'hex');
  let keyPair = bitcoin.ECPair.fromPrivateKey(keyBuffer);
  let {address} = bitcoin.payments.p2pkh({
    pubkey: keyPair.publicKey,
    network: testnet,
  });
  let privateKey = keyPair.toWIF();

  return {address: address, key: privateKey};
}

export function addressHashModeToBtcVersion(hashMode, mainnet = true) {
  switch (hashMode) {
    case AddressHashMode.SerializeP2PKH:
      return mainnet ? 0 : 111;
    case AddressHashMode.SerializeP2SH:
      return mainnet ? 5 : 196;
    default:
      throw new Error('Invalid hash mode');
  }
}

export function poxCVToBtcAddress(poxAddrCV) {
  return bitcoin.address.toBase58Check(
    poxAddrCV.data.hashbytes.buffer,
    addressHashModeToBtcVersion(poxAddrCV.data.version.buffer.valueOf()[0]),
  );
}

function getAddressHashMode(btcAddress) {
  if (btcAddress.startsWith('bc1') || btcAddress.startsWith('tb1')) {
    const {data} = address.fromBech32(btcAddress);
    if (data.length === 32) {
      return AddressHashMode.SerializeP2WSH;
    } else {
      return AddressHashMode.SerializeP2WPKH;
    }
  } else {
    const {version} = address.fromBase58Check(btcAddress);
    switch (version) {
      case 0:
        return AddressHashMode.SerializeP2PKH;
      case 111:
        return AddressHashMode.SerializeP2PKH;
      case 5:
        return AddressHashMode.SerializeP2SH;
      case 196:
        return AddressHashMode.SerializeP2SH;
      default:
        throw new Error('Invalid pox address version');
    }
  }
}

function decodeBtcAddress(btcAddress) {
  const hashMode = getAddressHashMode(btcAddress);
  if (btcAddress.startsWith('bc1') || btcAddress.startsWith('tb1')) {
    const {data} = address.fromBech32(btcAddress);
    return {
      hashMode,
      data,
    };
  } else {
    const {hash} = address.fromBase58Check(btcAddress);
    return {
      hashMode,
      data: hash,
    };
  }
}

export function poxAddrCVFromBitcoin(btcAddress) {
  const {hashMode, data} = decodeBtcAddress(btcAddress);
  return tupleCV({
    hashbytes: bufferCV(data),
    version: bufferCV(Buffer.from([hashMode])),
  });
}
