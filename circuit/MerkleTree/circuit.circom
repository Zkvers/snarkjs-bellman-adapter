pragma circom 2.0.0;
include "./get_merkle_root.circom";
include "../node_modules/circomlib/circuits/mimc.circom";

// This file defines a template named LeafExistence, which uses the GetMerkleRoot template to verify the existence of a leaf node. 
// This template accepts a parameter k, which represents the depth of the tree.
template LeafExistence(k){
    // The hash value of the leaf node to be verified.
    signal input leaf;
    // Merkle root
    signal input root;
    // Auth Path: An array of hash values of sibling nodes on the path from a leaf node to the root node. 
    signal input paths2_root[k];
    // An array that represents the position of a leaf node on every level (left or right). 0 represents the left side, and 1 represents the right side.
    signal input paths2_root_pos[k];

    // The core of this template is the GetMerkleRoot component. 
    // It passes all input signals to this component and then compares the computed Merkle tree root hash with the given root hash. 
    // If they are equal, it proves that the leaf node does indeed exist in the Merkle tree.
    component computed_root = GetMerkleRoot(k);
    computed_root.leaf <== leaf;

    for (var w = 0; w < k; w++){
        computed_root.paths2_root[w] <== paths2_root[w];
        computed_root.paths2_root_pos[w] <== paths2_root_pos[w];
    }

    // equality constraint: input tx root === computed tx root 
    root === computed_root.out;
}

component main = LeafExistence(2);