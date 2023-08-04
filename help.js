// GET THE FUNCTION SIGNATURE AND INPUTS FOR EACH FUNCTION GIVEN A CONTRACT ADDRESS
// SO THAT WE CAN BUILD TRANSACTIONS FOR ARBITRARY PROTOCOLS

const fetch = require('node-fetch');
const sha3 = require('js-sha3').keccak_256;

async function fetch_contract_abi(contract, api_key) {
    const url = "https://api.etherscan.io/api";
    const parameters = {
        module: "contract",
        action: "getabi",
        address: contract,
        apikey: api_key
    };
    try {
        const response = await fetch(url + '?' + new URLSearchParams(parameters));
        const response_json = await response.json();
        return response_json;
    } catch (e) {
        console.error("Error occurred during API call:", e);
        return null;
    }
}

async function get_contract_data(contract) {
    const api_key = ""; // Replace this with your actual Etherscan API key
    const response_data = await fetch_contract_abi(contract, api_key);
    if (response_data.status !== '1') {
        console.log(response_data);
        return {};
    } else {
        const abi = JSON.parse(response_data.result);
        const signatures = {};
        for (const func of abi) {
            if (func.type !== 'function') {
                continue;
            }
            const name = func.name;
            const types = func.inputs.map(inp => inp.type);
            signatures[name] = [sha3('{}({})'.format(name, types.join(','))).slice(0, 8), func.inputs];
        }
        return signatures;
    }
}

get_contract_data("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
