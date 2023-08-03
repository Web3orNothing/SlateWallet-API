import requests

def call_endpoint_get(api_url, endpoint, query_params=None):
    try:
        response = requests.get(f'{api_url}/{endpoint}', params=query_params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None
    
def call_endpoint_post(api_url, endpoint,  request_data):
    headers = {
        'Content-Type': 'application/json'
    }
    try:
        response = requests.post(f'{api_url}/{endpoint}', headers=headers, json=request_data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    # Replace these values with your actual API URL and API key
    api_url = "https://wallet.spicefi.xyz/v1"

    # Replace this with your actual SwapRequest data
    request_data = {
        "sourceChainId": "1",
        "destinationChainId": "42161",
        "amount": "100",
        "token": "ETH",
    }

    response_data = call_endpoint_post(api_url, 'bridge', request_data)
    if response_data:
        print("Transaction Status:", response_data.get("status"))
        print("Transaction Details:", response_data.get("transaction"))
    
    # Replace this with your actual SwapRequest data
    request_data = {
        "chainId": "1",
        "sourceAmount": "100",
        "sourceToken": "ETH",
        "destinationToken": "DAI"
    }

    response_data = call_endpoint_post(api_url, 'swap', request_data)
    if response_data:
        print("Transaction Status:", response_data.get("status"))
        print("Transaction Details:", response_data.get("transaction"))
    
    # Replace this with your actual Token Balance data
    request_data = {
        "accountAddress": "0xC5a05570Da594f8edCc9BEaA2385c69411c28CBe",
        "chainName": "Ethereum",
        "tokenName": "WETH"
    }

    response_data = call_endpoint_get(api_url, 'token-balance', query_params=request_data)
    if response_data:
        print("Transaction Status:", response_data.get("status"))
        print("Transaction Details:", response_data.get("balance"))

