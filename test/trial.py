import requests
import json
from niylib import w3
from hexbytes import HexBytes as hb

def fetch_contract_abi(contract, api_key):
    url = "https://api.etherscan.io/api"
    parameters = {
        "module": "contract",
        "action": "getabi",
        "address": contract,
        "apikey": api_key
    }
    try:
        response = requests.get(url, params=parameters)
        response_json = response.json()
        return response_json
    except requests.exceptions.RequestException as e:
        print("Error occurred during API call:", e)
        return None

def get_contract_data(contract):
    api_key = ""
    response_data = fetch_contract_abi(contract, api_key)
    if response_data['status'] != '1':
        print(response_data)
        return {}
    else:
        abi = json.loads(response_data['result'])
        signatures = {}
        print(abi)
        for func in abi:
            if func['type'] != 'function':
                continue
            name = func['name']
            types = [inp['type'] for inp in func['inputs']]
            signatures[name] = [hb.hex(w3.keccak(text='{}({})'.format(name,','.join(types)))[:4]), func['inputs']]
        return signatures

print(get_contract_data("0xF1Cd4193bbc1aD4a23E833170f49d60f3D35a621")['deposit'])