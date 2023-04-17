pragma circom 2.0.3;
include "./node_modules/circomlib/circuits/comparators.circom";
include "./node_modules/circomlib/circuits/poseidon.circom";
include "./hasher.circom";

// The internal implementation of the DualMux template is as follows: First, check if the selector signal s is 0 or 1. This is achieved by 
// constraining s * (1 - s) === 0. Calculate the values of the output signals out[0] and out[1]. Depending on the value of the selector signal s, 
// out[0] is set to either in[0] or in[1], and out[1] is set to the input signal that was not selected.
template DualMux() {
    signal input in[2];
    signal input s;
    signal output out[2]; 

    s * (1 - s) === 0;
    out[0] <== (in[1] - in[0])*s + in[0];
    out[1] <== (in[0] - in[1])*s + in[1];
}

// Verifies that merkle proof is correct for given merkle root and a leaf
// pathIndices input is an array of 0/1 selectors telling whether given pathElement is on the left or right side of merkle path
template ManyMerkleTreeChecker(levels, length, nInputs) {
    signal input leaf[nInputs];
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal input roots[length];
    signal output out;

    component selectors[levels];
    component hashers[levels];
    component rootEquals[levels];
    component rootMatch;

    // Hash the input leaf using the Poseidon hash function.
    component leaf_hasher = Poseidon(nInputs);
    for (var i = 0; i < nInputs; i++){
        log(leaf[i]);
        leaf_hasher.inputs[i] <== leaf[i];
    }

    // Iterate through each level of the Merkle tree
    for (var i = 0; i < levels; i++) {
        selectors[i] = DualMux();
        selectors[i].in[0] <== i == 0 ? leaf_hasher.out : hashers[i - 1].hash;
        selectors[i].in[1] <== pathElements[i];
        selectors[i].s <== pathIndices[i];

        hashers[i] = HashLeftRight();
        hashers[i].left <== selectors[i].out[0];
        hashers[i].right <== selectors[i].out[1];
    }

    // [assignment] verify that the resultant hash (computed merkle root)
    // is in the set of roots received as input
    // Note that running test.sh should create a valid proof in current circuit, even though it doesn't do anything.
    var equalsCount = 0;
    for (var i = 0; i < length; i++) {
        rootEquals[i] = IsEqual();
        rootEquals[i].in[0] <== hashers[levels - 1].hash;
        rootEquals[i].in[1] <== roots[i];
        equalsCount += rootEquals[i].out;
    }

    rootMatch = GreaterThan(4);
    rootMatch.in[0] <== equalsCount;
    rootMatch.in[1] <== 0;
    out <== rootMatch.out;
}

component main = ManyMerkleTreeChecker(2, 2, 3);