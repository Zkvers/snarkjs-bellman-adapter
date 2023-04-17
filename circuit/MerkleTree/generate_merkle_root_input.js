const fs = require("fs");
const merkle_tree_lib = require("./merkle-tree-lib");
var ethers = require("ethers");
const poseidon = require("./node_modules/circomlibjs").poseidon;

var poseidonHash = async function (items) {
    return ethers.BigNumber.from(poseidon(items));
};
async function main () {
    const leaf11 = await poseidonHash([1, 2, 3]);
    const leaf21 = await poseidonHash([3, 4, 5]);
    const leaf31 = await poseidonHash([5, 6, 7]);
    const leaf41 = await poseidonHash([7, 8, 9]);
    const leafArray_1 = [leaf11, leaf21, leaf31, leaf41];

    const tree_1 = new merkle_tree_lib.MerkleTree(2, leafArray_1);

    const leaf12 = await poseidonHash([9, 0, 1]);
    const leaf22 = await poseidonHash([0, 1, 2]);
    const leaf32 = await poseidonHash([1, 2, 3]);
    const leaf42 = await poseidonHash([2, 3, 4]);
    const leafArray_2 = [leaf12, leaf22, leaf32, leaf42];

    const tree_2 = new merkle_tree_lib.MerkleTree(2, leafArray_2);
    //
    const root_1 = tree_1.root();
    const root_2 = tree_2.root();

    const { pathElements, pathIndices } = tree_1.path(0);

    let pathElem = [];
    let pathIdx = [];
    for (var i = 0; i < pathElements.length; i++) {
        pathElem.push(ethers.BigNumber.from(pathElements[i]).toString());
        pathIdx.push(ethers.BigNumber.from(pathIndices[i]).toString());
    }
    const inputs = {
        leaf: [1, 2, 3],
        pathElements: pathElem,
        pathIndices: pathIdx,
        roots: [root_1.toString(), root_2.toString()],
    };

    fs.writeFileSync("./input.json", JSON.stringify(inputs), "utf-8");
}
main().then(() => {
    console.log("Inputs Ready!");
});