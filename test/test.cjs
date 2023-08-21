const {Web3} = require('web3');
const axios = require('axios');
let web3 = new Web3(new Web3.providers.HttpProvider("https://eth.llamarpc.com"));

async function fetch_contract_abi(contract, api_key) {
    // TODO: USE CHAIN SPECIFIC API (EX. BASESCAN.ORG FOR BASE)
    const url = "https://api.etherscan.io/api";
    const parameters = {
      module: "contract",
      action: "getabi",
      address: contract,
      apikey: api_key
    };
  
    try {
      const response = await axios.get(url, { params: parameters });
      return response.data;
    } catch (e) {
      console.error("Error occurred during API call:", e);
      return null;
    }
  }

async function get_contract_data(contract) {
    const api_key = process.env.ETHERSCAN_API_KEY;
    const response_data = await fetch_contract_abi(contract, api_key);
  
    //if not verified on etherscan, should not interact with it
    if (response_data && response_data.status === '1') {
      const abi = JSON.parse(response_data.result);
      const signatures = {};
  
      for (const func of abi) {
        if (func.type !== 'function') {
          continue;
        }
  
        const name = func.name;
        signatures[name] = func.inputs;
      }

      return signatures;
    } else {
      console.error("Error fetching contract ABI or contract not found.");
      return {};
    }
  }

async function protocolHandler(requestData) {
    try {
        const { name, action, spender, receiver, inputAmount, inputToken, chainName } = requestData;
        const protocolData = await get_contract_data('0xF1Cd4193bbc1aD4a23E833170f49d60f3D35a621');
        let data = '';
        switch (name) {
            case 'aave':
                console.log('aave selected');
                switch (action) {
                    case 'deposit':
                        console.log('You selected deposit');
                        const inputs = protocolData['supply'];
                        let behalf = spender;
                        if (receiver !== undefined) {
                            behalf = receiver;
                        }
                        data = web3.eth.abi.encodeFunctionCall(
                            {
                                name: 'supply',
                                type: 'function',
                                inputs: inputs
                            },
                            [inputToken, inputAmount, behalf, 0]
                        );
                        break;
                    default:
                        console.log('Invalid action');
                }
                break;
            default:
                console.log('Invalid name');
        }
        const transactionDetails = {
            from: '0xc5a05570da594f8edcc9beaa2385c69411c28cbe',
            to: '0xF1Cd4193bbc1aD4a23E833170f49d60f3D35a621', // Make sure to define 'recipient' and 'amount' variables
            gas: 355250,
            maxFeePerGas: 355250,
            maxPriorityFeePerGas: 355250,
            gasPrice: 355250,
            value: 35252,
            data: data,
            nonce: 'nonce'
        };
        return { status: 'success', transaction: transactionDetails };
    } catch (error) {
        console.error('Error:', error);
        return { status: 'error', message: 'Internal server error' };
    }
}
// Example usage:
const requestData = {
    name: 'aave',
    action: 'deposit',
    spender: '0xC5a05570Da594f8edCc9BEaA2385c69411c28CBe',
    inputToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    inputAmount: '1000000000000000000',
    chainName: 'ethereum'
};
const result = protocolHandler(requestData);
console.log(result);
