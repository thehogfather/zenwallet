# Running locally
`npm run build ; npm run dev-localhost`
`npm run build ; npm run dev-l1`

# Running testnet
`npm run build ; npm start`


# Releasing a new Version
1) Update the 'zen-node' version in package.json
2) commit with the new version
3) Increase the version # of the zen-wallet at the top of the package.json file
4) Run `npm run build ; npm pack`
6) go to (myget)[https://www.myget.org/feed/Packages/zenprotocol]
7) Add npm package to zen-wallet


# Zen Node APIs

Start by installing the (Zen Node)[https://gitlab.com/zenprotocol/zenprotocol]

Node Apis
https://gitlab.com/zenprotocol/zenprotocol/blob/master/src/Api/Server.fs

Get "/wallet/balance"
Get "/wallet/address"
Post "/wallet/transaction/send" (from_address, amount, to_address)
Post "/wallet/contract/activate"

# Building the Node
```
sudo apt install liblmdb0

./paket restore

cd src/Zulib
./build.sh

cd ..
msbuild
```

# Running nodes
```
cd /zenprotocol/src/Node/bin/Debug
./zen-node --localhost --wipe
```

# run another node from the same computer:
```
./zen-node -l1

Check balance
./zen-cli -l1 balance  

Send transaction:

./zen-cli send AssetHash 10 ToPublicAddress
./zen-cli send 0000000000000000000000000000000000000000000000000000000000000000 10 tz1q5889ee2udahvxtfp96z6fq7ql0jd8eh84v5tz3gdncndpr4vkacskganl5

Check Address:
./zen-cli -l1 address
```

# Building Client locally

```
npm install
npm run build ; npm start
npm run build ; npm run dev-l1
npm start
```

# Update node
1) go to zenprotocol/zenprotocol dir
2) `git pull upstream master`
3) build nodes

# Running a contracts:
1) activate contract - use contracts/full-example.fst
2) copy the contract address

# Initializing the Faucet
1. Activate the faucet contract - src/app/contracts/faucet.fst
2. Run the 'faucet' contract with the following parameters:
   - command: 'init'
   - asset: '0000000000000000000000000000000000000000000000000000000000000000' (ZENP)
   - amount: as much as you want to fill up the faucet with
