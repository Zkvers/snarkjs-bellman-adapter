# Merkle Tree Circuit
A zero-knowledge proof circuit used to validate the existence of a Merkle tree leaf node. Its main function is to prove that the given leaf node actually exists in the given Merkle tree while maintaining the privacy of path information and leaf node position. This is the simplest example of constructing a rollup, and in actual applications, more complex operations will be designed, such as accounts, funds, and so on.

## circuit
`circuit.circom` and `hasher.circom`
The purpose of these two circom files is to create a zk-SNARK circuit that verifies the correctness of a given Merkle proof for a given Merkle root and leaf node.
* hasher.circom:   
    This file defines a circom template called HashLeftRight, which hashes the left and right input signals using the Poseidon hash function. Poseidon is a cryptographic hash function specifically designed for zk-SNARK applications. The HashLeftRight template takes two input signals, left and right, and outputs a single signal hash. The template constructs a Poseidon component with 2 inputs and connects the input signals to the Poseidon component's inputs. The output of the Poseidon component is connected to the hash output signal.

* circuit.circom:    
    This file defines a circom template called ManyMerkleTreeChecker, which verifies the correctness of a given Merkle proof for a given Merkle root and leaf node. The template takes four inputs: leaf, pathElements, pathIndices, and roots. It outputs a single signal out, which is 1 if the Merkle proof is correct and 0 otherwise.

The `DualMux` template performs these function:
- **input in[2]**: This is an input signal array with two elements representing the two input signals between which the selection is made.
- **input s**: This is the selector signal. When s is 0, in[0] is selected; when s is 1, in[1] is selected.
- **output out[2]**: This is an output signal array with two elements. out[0] contains the selected element, and out[1] contains the unselected element.


The `ManyMerkleTreeChecker` template performs the following steps:     
- Hash the input leaf using the Poseidon hash function.
- Iterate through each level of the Merkle tree. For each level, construct a DualMux component to select the correct path element (left or right) based on the pathIndices input signal. The DualMux component outputs the selected path element.
- Hash the selected path element with the previous level's hash (or the leaf hash for the first level) using the HashLeftRight template defined in hasher.circom.
- Compare the computed Merkle root (i.e., the final hash from step c) to the input roots. If the computed root matches any of the input roots, the output signal out is set to 1, indicating a valid Merkle proof.

The `ManyMerkleTreeChecker` template is instantiated with parameters (2, 2, 3), meaning it supports checking Merkle proofs for trees with 2 levels, 2 possible roots, and 3-input Poseidon hash function.


## private inputs
You can generate inputs using the files `generate_merkle_root_inputs.js`. The inputs will be used to generate Merkle tree proofs.
```shell
npm install && node generate_merkle_root_inputs.js
```
Below, we will explain the functions in `generate_merkle_root_inputs.js` where the code snippet primarily aims to generate input for a Merkle tree and save it into a `input.json` file.
1. Import the required libraries and modules: fs for file system operations, merkle-tree-lib for building Merkle trees, 
ethers for handling big numbers, and circomlibjs for computing hashes.
2. Define an asynchronous function poseidonHash(items) that takes an array of numerical values, creates a Pedersen hash 
instance by calling buildPedersenHash(), and hashes the input. The resulting hash is converted to a BigNumber.
3. Define an asynchronous function main() whose purpose is to construct two Merkle trees, compute their root hashes, and generate a Merkle proof for the first leaf node of the first tree.      
    * Compute the hash values for each leaf node using the poseidonHash() function.   
    * Build two Merkle trees using merkle_tree_lib.MerkleTree.   
    * Compute the root hashes of the two trees.
    * Generate a Merkle proof for the first leaf node of the first tree, extracting the path elements and path indices.
    * Convert the path elements and path indices to string representations of BigNumbers.
    * Create an input object containing the leaf node, path elements, path indices, and root hashes.
    * Serialize the input object as a JSON string and write it to a file named input.json.