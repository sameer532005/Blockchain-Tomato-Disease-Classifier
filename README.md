
# Tomato Leaf Disease Detection with Blockchain Storage

This project predicts tomato leaf diseases using a CNN model and securely stores the prediction results on the Ethereum blockchain (Sepolia testnet) with IPFS file storage via Pinata.

## Project Structure

- `CNN.py`: Trains the CNN model and saves it (`model.h5`) + label encoder (`label_encoder.pkl`).
- `server.py`: Flask server to accept image uploads and return disease predictions.
- `page.jsx`: Frontend (React) to upload images, interact with Flask, Pinata, and the smart contract.

---

## How to Run the Project

### 1. Backend (Flask API)

```bash
# Navigate to the backend directory (where server.py is)
cd backend
pip install -r requirements.txt  # Install dependencies
python server.py  # Start the Flask server
```

- Flask will start on `http://localhost:5000`

### 2. Frontend (React)

```bash
# Navigate to your frontend project directory
cd frontend
npm install  # Install Node dependencies
npm start    # Start the React app
```

- React app will open at `http://localhost:3000`

---

## Blockchain Setup (Sepolia Ethereum Testnet)

### 1. Connect to Sepolia

- Install **MetaMask** extension.
- In MetaMask:
  - Add Sepolia Test Network (or select it).
  - Get free Sepolia ETH from a **Sepolia faucet**.

### 2. Smart Contract Deployment

- Write your smart contract (`.sol` file).
- Use **Remix IDE** or **Hardhat** to deploy it to Sepolia.
- Save the **contract address** and **ABI** for frontend use.

---

## IPFS Upload Using Pinata

### 1. Setup Pinata

- Create an account on [Pinata](https://pinata.cloud/).
- Get your **API Key** and **Secret API Key**.

### 2. Upload File to Pinata (from Frontend)

```javascript
import { pinata } from '@pinata/sdk';

const pinataClient = pinata('PINATA_API_KEY', 'PINATA_SECRET_API_KEY');

// Upload file
const upload = await pinataClient.pinFileToIPFS(file);
const fileCID = upload.IpfsHash;
```

> You store this `CID` on the blockchain along with the prediction.

---

## Web3 Integration

- Install Web3.js in frontend:

```bash
npm install web3
```

- Connect to MetaMask in your React app:

```javascript
import Web3 from 'web3';

const web3 = new Web3(window.ethereum);
await window.ethereum.request({ method: 'eth_requestAccounts' });

const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

// Example: Storing fileCID and prediction
const tx = await contract.methods.addInputFile(fileCID, prediction).send({ from: userAddress });
await tx.wait();
```

---

## Notes
- Make sure Flask (`localhost:5000`) and React (`localhost:3000`) are running together.
- Ensure MetaMask is connected to Sepolia during contract interactions.
- Handle CORS issues if Flask and React are on different ports (Flask CORS setup needed).
