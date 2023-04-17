"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerkleTree = exports.poseidonHash2 = exports.poseidonHash = void 0;
// keccak256("tornado") % BN254_FIELD_SIZE
var DEFAULT_ZERO = '21663839004416932945382355908790599225266501822907911457504978515578255421292';
var ethers_1 = require("ethers");
var poseidon = require('./poseidon');

var poseidonHash = function (items) {
    return ethers_1.BigNumber.from(poseidon(items).toString());
};
exports.poseidonHash = poseidonHash;
var poseidonHash2 = function (a, b) {
    return (0, exports.poseidonHash)([a, b]);
};
exports.poseidonHash2 = poseidonHash2;
var defaultHash = exports.poseidonHash2;
// todo ensure consistent types in tree and inserted elements?
// todo make sha3 default hasher (and update tests) to get rid of mimc/snarkjs/circomlib dependency
/**
 * @callback hashFunction
 * @param left Left leaf
 * @param right Right leaf
 */
/**
 * Merkle tree
 */
var MerkleTree = /** @class */ (function () {
    /**
     * Constructor
     * @param {number} levels Number of levels in the tree
     * @param {Array} [elements] Initial elements
     * @param {Object} options
     * @param {hashFunction} [options.hashFunction] Function used to hash 2 leaves
     * @param [options.zeroElement] Value for non-existent leaves
     */
    function MerkleTree(levels, elements, _a) {
        if (elements === void 0) { elements = []; }
        var _b = _a === void 0 ? {} : _a, _c = _b.hashFunction, hashFunction = _c === void 0 ? defaultHash : _c, _d = _b.zeroElement, zeroElement = _d === void 0 ? DEFAULT_ZERO : _d;
        levels = Number(levels);
        this.levels = levels;
        this.capacity = Math.pow(2, levels);
        if (elements.length > this.capacity) {
            throw new Error('Tree is full');
        }
        this._hash = hashFunction || defaultHash;
        this.zeroElement = zeroElement;
        this._zeros = [];
        this._zeros[0] = zeroElement;
        for (var i = 1; i <= levels; i++) {
            this._zeros[i] = this._hash(this._zeros[i - 1], this._zeros[i - 1]);
        }
        this._layers = [];
        this._layers[0] = elements.slice();
        this._rebuild();
    }
    MerkleTree.prototype._rebuild = function () {
        for (var level = 1; level <= this.levels; level++) {
            this._layers[level] = [];
            for (var i = 0; i < Math.ceil(this._layers[level - 1].length / 2); i++) {
                this._layers[level][i] = this._hash(this._layers[level - 1][i * 2], i * 2 + 1 < this._layers[level - 1].length
                    ? this._layers[level - 1][i * 2 + 1]
                    : this._zeros[level - 1]);
            }
        }
    };
    /**
     * Get tree root
     * @returns {*}
     */
    MerkleTree.prototype.root = function () {
        return this._layers[this.levels].length > 0 ? this._layers[this.levels][0] : this._zeros[this.levels];
    };
    /**
     * Insert new element into the tree
     * @param element Element to insert
     */
    MerkleTree.prototype.insert = function (element) {
        if (this._layers[0].length >= this.capacity) {
            throw new Error('Tree is full');
        }
        this.update(this._layers[0].length, element);
    };
    /**
     * Insert multiple elements into the tree.
     * @param {Array} elements Elements to insert
     */
    MerkleTree.prototype.bulkInsert = function (elements) {
        if (this._layers[0].length + elements.length > this.capacity) {
            throw new Error('Tree is full');
        }
        // First we insert all elements except the last one
        // updating only full subtree hashes (all layers where inserted element has odd index)
        // the last element will update the full path to the root making the tree consistent again
        for (var i = 0; i < elements.length - 1; i++) {
            this._layers[0].push(elements[i]);
            var level = 0;
            var index = this._layers[0].length - 1;
            while (index % 2 === 1) {
                level++;
                index >>= 1;
                this._layers[level][index] = this._hash(this._layers[level - 1][index * 2], this._layers[level - 1][index * 2 + 1]);
            }
        }
        this.insert(elements[elements.length - 1]);
    };
    /**
     * Change an element in the tree
     * @param {number} index Index of element to change
     * @param element Updated element value
     */
    MerkleTree.prototype.update = function (index, element) {
        if (isNaN(Number(index)) || index < 0 || index > this._layers[0].length || index >= this.capacity) {
            throw new Error('Insert index out of bounds: ' + index);
        }
        this._layers[0][index] = element;
        for (var level = 1; level <= this.levels; level++) {
            index >>= 1;
            this._layers[level][index] = this._hash(this._layers[level - 1][index * 2], index * 2 + 1 < this._layers[level - 1].length
                ? this._layers[level - 1][index * 2 + 1]
                : this._zeros[level - 1]);
        }
    };
    /**
     * Get merkle path to a leaf
     * @param {number} index Leaf index to generate path for
     * @returns {{pathElements: Object[], pathIndex: number[]}} An object containing adjacent elements and left-right index
     */
    MerkleTree.prototype.path = function (index) {
        if (isNaN(Number(index)) || index < 0 || index >= this._layers[0].length) {
            throw new Error('Index out of bounds: ' + index);
        }
        var pathElements = [];
        var pathIndices = [];
        for (var level = 0; level < this.levels; level++) {
            pathIndices[level] = index % 2;
            pathElements[level] =
                (index ^ 1) < this._layers[level].length ? this._layers[level][index ^ 1] : this._zeros[level];
            index >>= 1;
        }
        return {
            merkleRoot: this.root(),
            pathElements: pathElements,
            pathIndices: pathIndices,
            element: this._layers[0][index],
        };
    };
    /**
     * Find an element in the tree
     * @param element An element to find
     * @param comparator A function that checks leaf value equality
     * @returns {number} Index if element is found, otherwise -1
     */
    MerkleTree.prototype.indexOf = function (element, comparator) {
        if (comparator) {
            return this._layers[0].findIndex(function (el) { return comparator(element, el); });
        }
        else {
            return this._layers[0].indexOf(element);
        }
    };
    /**
     * Returns a copy of non-zero tree elements
     * @returns {Object[]}
     */
    MerkleTree.prototype.elements = function () {
        return this._layers[0].slice();
    };
    /**
     * Returns a copy of n-th zero elements array
     * @returns {Object[]}
     */
    MerkleTree.prototype.zeros = function () {
        return this._zeros.slice();
    };
    /**
     * Serialize entire tree state including intermediate layers into a plain object
     * Deserializing it back will not require to recompute any hashes
     * Elements are not converted to a plain type, this is responsibility of the caller
     */
    MerkleTree.prototype.serialize = function () {
        return {
            levels: this.levels,
            _zeros: this._zeros,
            _layers: this._layers,
        };
    };
    MerkleTree.prototype.number_of_elements = function () {
        return this._layers[0].length;
    };
    MerkleTree.prototype.getIndexByElement = function (element) {
        return this.indexOf(element);
    };
    /**
     * Deserialize data into a MerkleTree instance
     * Make sure to provide the same hashFunction as was used in the source tree,
     * otherwise the tree state will be invalid
     *
     * @param data
     * @param hashFunction
     * @returns {MerkleTree}
     */
    MerkleTree.deserialize = function (data, hashFunction) {
        var instance = Object.assign(Object.create(this.prototype), data);
        instance._hash = hashFunction || defaultHash;
        instance.capacity = Math.pow(2, instance.levels);
        instance.zeroElement = instance._zeros[0];
        return instance;
    };
    return MerkleTree;
}());
exports.MerkleTree = MerkleTree;
