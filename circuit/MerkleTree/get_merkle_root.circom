pragma circom 2.0.0;
include "./node_modules/circomlib/circuits/mimc.circom";

template DualMux(){
    signal input in[2];
    signal input s;
    signal output out[2];
    
    s*(s-1) === 0;

    out[0] <== (in[1] - in[0])*s + in[0];
    out[1] <== (in[0] - in[1])*s + in[1];
}

// k is the depth of tree
template GetMerkleRoot(k){
    // The hash value of the leaf node to be verified.
    signal input leaf;
    // Auth Path: An array of hash values of sibling nodes on the path from a leaf node to the root node. 
    signal input paths2_root[k];
    // An array that represents the position of a leaf node on every level (left or right). 0 represents the left side, and 1 represents the right side.
    signal input paths2_root_pos[k];
    // Merkle tree root hash
    signal output out;

    component selectors[k];
    component hashers[k];

    // The computation starts from the bottom of the tree and goes up, calculating the hash value until the root hash value is computed.
    for(var i = 0; i < k; i++){
        // Selecting the left and right child nodes at the current level.
        selectors[i] = DualMux();
        selectors[i].in[0] <== i == 0 ? leaf : hashers[i-1].out;
        selectors[i].in[1] <== paths2_root[i];
        selectors[i].s <== paths2_root_pos[i];

        // Computing the hash value at the current level.
        hashers[i] = MultiMiMC7(2,91);
        hashers[i].k <== 1;
        hashers[i].in[0] <== selectors[i].out[0];
        hashers[i].in[1] <== selectors[i].out[1];
    }

    // Merkle root hash
    out <== hashers[k-1].out;
}
