"use client";
import React, { useEffect, useState } from "react";
import { PinataSDK } from "pinata";
import { ContractFactory, ethers } from "ethers";
import { PRERENDER_REVALIDATE_HEADER } from "next/dist/lib/constants";

// const provider = new ethers.InfuraProvider(
//   "sepolia",
//   "371fa7a366cb4aa6aa4d442667462b5a",
//   "2WliyJWkGeZ6XEDBZo+6PzCv5OOJBI3KM/X0aKtWbJsr6PUiZFGUgg"
// );

const provider = new ethers.AlchemyProvider(
  "sepolia",
  "FctsoxwMpsUZrByeKngi41FIgL4isspE"
);
console.log(provider)

const pkkey =
  "6816d46e22831456d2b49c3c560a808fcbeaf325d4031a5922fc23975abc908f";

const wallet = new ethers.Wallet(pkkey, provider);
console.log(wallet.address);
const walletAddress = wallet.address;

const pinata = new PinataSDK({
  pinataJwt:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwYzgyZDM4Ny1kNGFkLTRlZTUtODM1OC00ZjRmYTRhZjZmMjUiLCJlbWFpbCI6InByaXlhbWtvdG5hbGEyMkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZDViYTcyMGVlNmRmNzgyMzI5YjYiLCJzY29wZWRLZXlTZWNyZXQiOiJiZWQ1MjVhNmRjZjg0ZjM5NTliZjA1Y2QxNGYwMzk1MzExNTBmYzhjNTMwZGZiZjk1OTJiYjBjMjFkMjYzNTIzIiwiZXhwIjoxNzc2ODc4OTc5fQ.x3za6nnsG0jIaTnfc-tU-rcqJgWYuIH1G6ycFpmfbh8",
  pinataGateway: "aquamarine-glamorous-pigeon-102.mypinata.cloud",
});

const contractABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "fileCID",
        type: "string",
      },
      {
        internalType: "string",
        name: "outcome",
        type: "string",
      },
    ],
    name: "addInputFile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserFiles",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "fileCID",
            type: "string",
          },
          {
            internalType: "string",
            name: "outcome",
            type: "string",
          },
        ],
        internalType: "struct Doctor.FileData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const contractAddress = "0xb749E91D76f96A910feDF607216485E6b74A5F6d";
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

const Dashboard = () => {
  // const [walletAddress, setWalletAddress] = useState(null);
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [list, setList] = useState([]);

  // const [list, setList] = useState([
  //   { cid: "bafybeidummyhash1", output: "Leaf detected" },
  //   { cid: "bafybeidummyhash2", output: "No leaf detected" },
  // ]);

  useEffect(() => {
    const getOutput = async () => {
      
      if (walletAddress) {
        try {
          const output = await contract.getUserFiles(walletAddress);
          console.log("Fetched Files:", output);

          // Assuming the output is an array of objects with fileCID and outcome
          const formattedList = output.map((fileData) => ({
            cid: fileData.fileCID, // File CID
            output: fileData.outcome, // Prediction outcome
          }));

          setList(formattedList);
        } catch (err) {
          console.error("Error fetching user files:", err);
        }
      }
    };

    getOutput();
  }, [walletAddress, contract]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setIsConnecting(true); // Set loading state
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
        setIsConnecting(false); // Reset loading state
      } catch (err) {
        console.error("Wallet connection error:", err);
        setIsConnecting(false); // Reset loading state
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const handleSubmit = async () => {
    if (!file) return alert("Please upload a file");
  
    try {
      // Step 1: Send file to Flask API
      const formData = new FormData();
      formData.append("file", file);
  
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
      const prediction = data.prediction;
      console.log("Predicted:", prediction);
  
      // Step 2: Upload file to Pinata
      const upload = await pinata.upload.public.file(file);
      const fileCID = upload.cid;
  
      // Step 3: Save CID + prediction into smart contract
      const tx = await contract.addInputFile(fileCID, prediction);
      await tx.wait();
      console.log(tx.hash);
  
      alert("Uploaded Successfully!");
  
    } catch (err) {
      console.log("Error uploading file or interacting with the contract:", err);
    }
  
    setFile(null);
    setPrediction("");
  };

  return (
    <div className="p-6 bg-white min-h-screen text-black">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-semibold">Welcome Doctor!</h1>
          <p className="text-sm text-gray-600">
            Check your input files and results here
          </p>
        </div>
        <button
          onClick={connectWallet}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {walletAddress
            ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(
                -4
              )}`
            : "Connect Wallet"}
        </button>
      </div>

      <div className="bg-gray-200 h-[2px] w-full mb-6"></div>

      {/* Upload Section */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-10">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Model prediction result"
          value={prediction}
          onChange={(e) => setPrediction(e.target.value)}
          className="border p-2 rounded w-full md:w-1/2"
        />
        <button
          onClick={handleSubmit}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </div>

      {/* Display CID List */}
      <div className="flex flex-col gap-6">
        {list.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow"
          >
            <p className="font-mono text-sm mb-2">Input file CID: {item.cid}</p>
            <a
              href={`https://aquamarine-glamorous-pigeon-102.mypinata.cloud/ipfs/${item.cid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View on IPFS
            </a>
            <p className="font-mono text-sm mt-2">
              Model Prediction: {item.output}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
