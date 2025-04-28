// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Doctor {
    // Struct to hold both the CID and the model's outcome
    struct FileData {
        string fileCID;    // The CID of the uploaded file
        string outcome;    // The outcome from the model (e.g., "Leaf detected")
    }

    // Mapping to associate each user with their list of FileData (CID and outcome)
    mapping(address => FileData[]) private userFiles;

    // Function to add a file along with the outcome from the model
    function addInputFile(string memory fileCID, string memory outcome) external {
        userFiles[msg.sender].push(FileData(fileCID, outcome));
    }

    // Function to get the list of file data for a user (CID and outcome)
    function getUserFiles(address user) external view returns (FileData[] memory) {
        return userFiles[user];
    }
}
