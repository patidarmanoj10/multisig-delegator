## Add gnosis delegator using python using gnosis safe private key.
## pip3 install requests
## pip3 install eth_account
## python3 delegate.py 

import requests
import time
from eth_account import Account
from eth_utils import keccak


## Change values as needed.
SAFE_ADDRESS = '0xB6F812c919c514f961118b968DcEEC6E2873Bf9d'
OWNER_PRIVATE_KEY = '....'
DELEGATE_ADDRESS = '0x5D184b425E08F5AD13a5a22f9d9bA90221428FE1'
TX_SERVICE_BASE_URL = 'https://safe-transaction.goerli.gnosis.io' #Goerli testnet


### Add delegate
totp = int(time.time()) // 3600
hash_to_sign = keccak(text=DELEGATE_ADDRESS + str(totp))
account = Account.from_key(OWNER_PRIVATE_KEY)
signature = account.signHash(hash_to_sign)

add_payload = {
    "safe": SAFE_ADDRESS,
    "delegate": DELEGATE_ADDRESS,
    "signature": signature.signature.hex(),
    "label": "Vesper delegate python"
}

add_response = requests.post(f'{TX_SERVICE_BASE_URL}/api/v1/safes/{SAFE_ADDRESS}/delegates/', json=add_payload, headers = {'Content-type': 'application/json'})

print(add_response.text)
print(add_response.status_code)

### Remove delegate
# totp = int(time.time()) // 3600
# hash_to_sign = keccak(text=DELEGATE_ADDRESS + str(totp))
# account = Account.from_key(OWNER_PRIVATE_KEY)
# signature = account.signHash(hash_to_sign)

# delete_payload = {
#     "signature": signature.signature.hex(),
# }
# delete_response = requests.delete(f'{TX_SERVICE_BASE_URL}/api/v1/safes/{SAFE_ADDRESS}/delegates/{DELEGATE_ADDRESS}/', json=delete_payload, headers = {'Content-type': 'application/json'})

# print(delete_response.text)
# print(delete_response.status_code)


# https://safe-transaction.goerli.gnosis.io/api/v1/safes/0x7c27182fA9ac66F3744Ab185Bc151f5C78249313/delegates
# Get list of Delegator
list_response = requests.get(f'{TX_SERVICE_BASE_URL}/api/v1/safes/{SAFE_ADDRESS}/delegates')

print(list_response.text)
print(list_response.status_code)