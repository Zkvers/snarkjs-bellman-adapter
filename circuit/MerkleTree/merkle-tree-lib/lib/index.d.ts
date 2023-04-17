import { BigNumberish, BigNumber } from 'ethers';
export declare const poseidonHash: (items: BigNumberish[]) => BigNumber;
export declare const poseidonHash2: (a: any, b: any) => BigNumber;
/**
 * @callback hashFunction
 * @param left Left leaf
 * @param right Right leaf
 */
/**
 * Merkle tree
 */
export declare class MerkleTree {
    levels: number;
    capacity: number;
    _hash: (left: BigNumberish, right: BigNumberish) => BigNumberish;
    zeroElement: BigNumberish;
    _zeros: BigNumberish[];
    _layers: BigNumberish[][];
    /**
     * Constructor
     * @param {number} levels Number of levels in the tree
     * @param {Array} [elements] Initial elements
     * @param {Object} options
     * @param {hashFunction} [options.hashFunction] Function used to hash 2 leaves
     * @param [options.zeroElement] Value for non-existent leaves
     */
    constructor(levels: number | string, elements?: BigNumberish[], { hashFunction, zeroElement }?: {
        hashFunction?: (a: any, b: any) => BigNumber;
        zeroElement?: string;
    });
    _rebuild(): void;
    /**
     * Get tree root
     * @returns {*}
     */
    root(): BigNumberish;
    /**
     * Insert new element into the tree
     * @param element Element to insert
     */
    insert(element: any): void;
    /**
     * Insert multiple elements into the tree.
     * @param {Array} elements Elements to insert
     */
    bulkInsert(elements: any): void;
    /**
     * Change an element in the tree
     * @param {number} index Index of element to change
     * @param element Updated element value
     */
    update(index: number, element: any): void;
    /**
     * Get merkle path to a leaf
     * @param {number} index Leaf index to generate path for
     * @returns {{pathElements: Object[], pathIndex: number[]}} An object containing adjacent elements and left-right index
     */
    path(index: number): {
        merkleRoot: BigNumberish;
        pathElements: any[];
        pathIndices: any[];
        element: BigNumberish;
    };
    /**
     * Find an element in the tree
     * @param element An element to find
     * @param comparator A function that checks leaf value equality
     * @returns {number} Index if element is found, otherwise -1
     */
    indexOf(element: any, comparator?: any): number;
    /**
     * Returns a copy of non-zero tree elements
     * @returns {Object[]}
     */
    elements(): BigNumberish[];
    /**
     * Returns a copy of n-th zero elements array
     * @returns {Object[]}
     */
    zeros(): BigNumberish[];
    /**
     * Serialize entire tree state including intermediate layers into a plain object
     * Deserializing it back will not require to recompute any hashes
     * Elements are not converted to a plain type, this is responsibility of the caller
     */
    serialize(): {
        levels: number;
        _zeros: BigNumberish[];
        _layers: BigNumberish[][];
    };
    number_of_elements(): number;
    getIndexByElement(element: any): number;
    /**
     * Deserialize data into a MerkleTree instance
     * Make sure to provide the same hashFunction as was used in the source tree,
     * otherwise the tree state will be invalid
     *
     * @param data
     * @param hashFunction
     * @returns {MerkleTree}
     */
    static deserialize(data: any, hashFunction: any): any;
}
