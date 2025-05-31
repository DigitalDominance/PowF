const fs = require('fs');
const path = require('path');

const contracts = [
  'JobFactory',
  'ProofOfWorkJob',
  'ReputationSystem',
  'DisputeDAO',
  'ZKResume'
];

const artifactsDir = path.join(__dirname, '../artifacts/contracts');
const outputDir = path.join(__dirname, '../lib/contracts/abis');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

contracts.forEach(contractName => {
  const artifactPath = path.join(artifactsDir, `${contractName}.sol/${contractName}.json`);
  const artifact = require(artifactPath);
  
  // Extract ABI
  const abi = artifact.abi;
  
  // Write ABI to file
  fs.writeFileSync(
    path.join(outputDir, `${contractName}.json`),
    JSON.stringify(abi, null, 2)
  );
  
  console.log(`Extracted ABI for ${contractName}`);
}); 