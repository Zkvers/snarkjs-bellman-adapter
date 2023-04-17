pragma circom 2.0.3;
include "./node_modules/circomlib/circuits/poseidon.circom";

template HashLeftRight() {
    signal input left;
    signal input right;

    signal output hash;

    var nInputs = 2;
    component hasher = Poseidon(nInputs);
    left ==> hasher.inputs[0];
    right ==> hasher.inputs[1];

    hash <== hasher.out;
}