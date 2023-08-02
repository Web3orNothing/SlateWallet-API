import requests

def call_swap_endpoint(api_url, swap_request_data):
    headers = {
        'Content-Type': 'application/json'
    }

    try:
        response = requests.post(f'{api_url}/bridge', headers=headers, json=swap_request_data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    # Replace these values with your actual API URL and API key
    api_url = "https://wallet.spicefi.xyz/v1"

    # Replace this with your actual SwapRequest data
    swap_request_data = {
        "sourceChainId": "1",
        "destinationChainId": "42161",
        "sourceAmount": "100",
        "sourceToken": "ETH",
        "destinationToken": "DAI"
    }

    response_data = call_swap_endpoint(api_url, swap_request_data)
    if response_data:
        print("Transaction Status:", response_data.get("status"))
        print("Transaction Details:", response_data.get("transaction"))
