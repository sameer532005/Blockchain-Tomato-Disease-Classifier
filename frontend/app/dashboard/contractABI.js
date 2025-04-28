export default contractABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "fileCID",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "outcome",
				"type": "string"
			}
		],
		"name": "addInputFile",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserFiles",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "fileCID",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "outcome",
						"type": "string"
					}
				],
				"internalType": "struct Doctor.FileData[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];