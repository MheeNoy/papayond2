"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/denque@2.1.0";
exports.ids = ["vendor-chunks/denque@2.1.0"];
exports.modules = {

/***/ "(rsc)/./node_modules/.pnpm/denque@2.1.0/node_modules/denque/index.js":
/*!**********************************************************************!*\
  !*** ./node_modules/.pnpm/denque@2.1.0/node_modules/denque/index.js ***!
  \**********************************************************************/
/***/ ((module) => {

eval("\n\n/**\n * Custom implementation of a double ended queue.\n */\nfunction Denque(array, options) {\n  var options = options || {};\n  this._capacity = options.capacity;\n\n  this._head = 0;\n  this._tail = 0;\n\n  if (Array.isArray(array)) {\n    this._fromArray(array);\n  } else {\n    this._capacityMask = 0x3;\n    this._list = new Array(4);\n  }\n}\n\n/**\n * --------------\n *  PUBLIC API\n * -------------\n */\n\n/**\n * Returns the item at the specified index from the list.\n * 0 is the first element, 1 is the second, and so on...\n * Elements at negative values are that many from the end: -1 is one before the end\n * (the last element), -2 is two before the end (one before last), etc.\n * @param index\n * @returns {*}\n */\nDenque.prototype.peekAt = function peekAt(index) {\n  var i = index;\n  // expect a number or return undefined\n  if ((i !== (i | 0))) {\n    return void 0;\n  }\n  var len = this.size();\n  if (i >= len || i < -len) return undefined;\n  if (i < 0) i += len;\n  i = (this._head + i) & this._capacityMask;\n  return this._list[i];\n};\n\n/**\n * Alias for peekAt()\n * @param i\n * @returns {*}\n */\nDenque.prototype.get = function get(i) {\n  return this.peekAt(i);\n};\n\n/**\n * Returns the first item in the list without removing it.\n * @returns {*}\n */\nDenque.prototype.peek = function peek() {\n  if (this._head === this._tail) return undefined;\n  return this._list[this._head];\n};\n\n/**\n * Alias for peek()\n * @returns {*}\n */\nDenque.prototype.peekFront = function peekFront() {\n  return this.peek();\n};\n\n/**\n * Returns the item that is at the back of the queue without removing it.\n * Uses peekAt(-1)\n */\nDenque.prototype.peekBack = function peekBack() {\n  return this.peekAt(-1);\n};\n\n/**\n * Returns the current length of the queue\n * @return {Number}\n */\nObject.defineProperty(Denque.prototype, 'length', {\n  get: function length() {\n    return this.size();\n  }\n});\n\n/**\n * Return the number of items on the list, or 0 if empty.\n * @returns {number}\n */\nDenque.prototype.size = function size() {\n  if (this._head === this._tail) return 0;\n  if (this._head < this._tail) return this._tail - this._head;\n  else return this._capacityMask + 1 - (this._head - this._tail);\n};\n\n/**\n * Add an item at the beginning of the list.\n * @param item\n */\nDenque.prototype.unshift = function unshift(item) {\n  if (arguments.length === 0) return this.size();\n  var len = this._list.length;\n  this._head = (this._head - 1 + len) & this._capacityMask;\n  this._list[this._head] = item;\n  if (this._tail === this._head) this._growArray();\n  if (this._capacity && this.size() > this._capacity) this.pop();\n  if (this._head < this._tail) return this._tail - this._head;\n  else return this._capacityMask + 1 - (this._head - this._tail);\n};\n\n/**\n * Remove and return the first item on the list,\n * Returns undefined if the list is empty.\n * @returns {*}\n */\nDenque.prototype.shift = function shift() {\n  var head = this._head;\n  if (head === this._tail) return undefined;\n  var item = this._list[head];\n  this._list[head] = undefined;\n  this._head = (head + 1) & this._capacityMask;\n  if (head < 2 && this._tail > 10000 && this._tail <= this._list.length >>> 2) this._shrinkArray();\n  return item;\n};\n\n/**\n * Add an item to the bottom of the list.\n * @param item\n */\nDenque.prototype.push = function push(item) {\n  if (arguments.length === 0) return this.size();\n  var tail = this._tail;\n  this._list[tail] = item;\n  this._tail = (tail + 1) & this._capacityMask;\n  if (this._tail === this._head) {\n    this._growArray();\n  }\n  if (this._capacity && this.size() > this._capacity) {\n    this.shift();\n  }\n  if (this._head < this._tail) return this._tail - this._head;\n  else return this._capacityMask + 1 - (this._head - this._tail);\n};\n\n/**\n * Remove and return the last item on the list.\n * Returns undefined if the list is empty.\n * @returns {*}\n */\nDenque.prototype.pop = function pop() {\n  var tail = this._tail;\n  if (tail === this._head) return undefined;\n  var len = this._list.length;\n  this._tail = (tail - 1 + len) & this._capacityMask;\n  var item = this._list[this._tail];\n  this._list[this._tail] = undefined;\n  if (this._head < 2 && tail > 10000 && tail <= len >>> 2) this._shrinkArray();\n  return item;\n};\n\n/**\n * Remove and return the item at the specified index from the list.\n * Returns undefined if the list is empty.\n * @param index\n * @returns {*}\n */\nDenque.prototype.removeOne = function removeOne(index) {\n  var i = index;\n  // expect a number or return undefined\n  if ((i !== (i | 0))) {\n    return void 0;\n  }\n  if (this._head === this._tail) return void 0;\n  var size = this.size();\n  var len = this._list.length;\n  if (i >= size || i < -size) return void 0;\n  if (i < 0) i += size;\n  i = (this._head + i) & this._capacityMask;\n  var item = this._list[i];\n  var k;\n  if (index < size / 2) {\n    for (k = index; k > 0; k--) {\n      this._list[i] = this._list[i = (i - 1 + len) & this._capacityMask];\n    }\n    this._list[i] = void 0;\n    this._head = (this._head + 1 + len) & this._capacityMask;\n  } else {\n    for (k = size - 1 - index; k > 0; k--) {\n      this._list[i] = this._list[i = (i + 1 + len) & this._capacityMask];\n    }\n    this._list[i] = void 0;\n    this._tail = (this._tail - 1 + len) & this._capacityMask;\n  }\n  return item;\n};\n\n/**\n * Remove number of items from the specified index from the list.\n * Returns array of removed items.\n * Returns undefined if the list is empty.\n * @param index\n * @param count\n * @returns {array}\n */\nDenque.prototype.remove = function remove(index, count) {\n  var i = index;\n  var removed;\n  var del_count = count;\n  // expect a number or return undefined\n  if ((i !== (i | 0))) {\n    return void 0;\n  }\n  if (this._head === this._tail) return void 0;\n  var size = this.size();\n  var len = this._list.length;\n  if (i >= size || i < -size || count < 1) return void 0;\n  if (i < 0) i += size;\n  if (count === 1 || !count) {\n    removed = new Array(1);\n    removed[0] = this.removeOne(i);\n    return removed;\n  }\n  if (i === 0 && i + count >= size) {\n    removed = this.toArray();\n    this.clear();\n    return removed;\n  }\n  if (i + count > size) count = size - i;\n  var k;\n  removed = new Array(count);\n  for (k = 0; k < count; k++) {\n    removed[k] = this._list[(this._head + i + k) & this._capacityMask];\n  }\n  i = (this._head + i) & this._capacityMask;\n  if (index + count === size) {\n    this._tail = (this._tail - count + len) & this._capacityMask;\n    for (k = count; k > 0; k--) {\n      this._list[i = (i + 1 + len) & this._capacityMask] = void 0;\n    }\n    return removed;\n  }\n  if (index === 0) {\n    this._head = (this._head + count + len) & this._capacityMask;\n    for (k = count - 1; k > 0; k--) {\n      this._list[i = (i + 1 + len) & this._capacityMask] = void 0;\n    }\n    return removed;\n  }\n  if (i < size / 2) {\n    this._head = (this._head + index + count + len) & this._capacityMask;\n    for (k = index; k > 0; k--) {\n      this.unshift(this._list[i = (i - 1 + len) & this._capacityMask]);\n    }\n    i = (this._head - 1 + len) & this._capacityMask;\n    while (del_count > 0) {\n      this._list[i = (i - 1 + len) & this._capacityMask] = void 0;\n      del_count--;\n    }\n    if (index < 0) this._tail = i;\n  } else {\n    this._tail = i;\n    i = (i + count + len) & this._capacityMask;\n    for (k = size - (count + index); k > 0; k--) {\n      this.push(this._list[i++]);\n    }\n    i = this._tail;\n    while (del_count > 0) {\n      this._list[i = (i + 1 + len) & this._capacityMask] = void 0;\n      del_count--;\n    }\n  }\n  if (this._head < 2 && this._tail > 10000 && this._tail <= len >>> 2) this._shrinkArray();\n  return removed;\n};\n\n/**\n * Native splice implementation.\n * Remove number of items from the specified index from the list and/or add new elements.\n * Returns array of removed items or empty array if count == 0.\n * Returns undefined if the list is empty.\n *\n * @param index\n * @param count\n * @param {...*} [elements]\n * @returns {array}\n */\nDenque.prototype.splice = function splice(index, count) {\n  var i = index;\n  // expect a number or return undefined\n  if ((i !== (i | 0))) {\n    return void 0;\n  }\n  var size = this.size();\n  if (i < 0) i += size;\n  if (i > size) return void 0;\n  if (arguments.length > 2) {\n    var k;\n    var temp;\n    var removed;\n    var arg_len = arguments.length;\n    var len = this._list.length;\n    var arguments_index = 2;\n    if (!size || i < size / 2) {\n      temp = new Array(i);\n      for (k = 0; k < i; k++) {\n        temp[k] = this._list[(this._head + k) & this._capacityMask];\n      }\n      if (count === 0) {\n        removed = [];\n        if (i > 0) {\n          this._head = (this._head + i + len) & this._capacityMask;\n        }\n      } else {\n        removed = this.remove(i, count);\n        this._head = (this._head + i + len) & this._capacityMask;\n      }\n      while (arg_len > arguments_index) {\n        this.unshift(arguments[--arg_len]);\n      }\n      for (k = i; k > 0; k--) {\n        this.unshift(temp[k - 1]);\n      }\n    } else {\n      temp = new Array(size - (i + count));\n      var leng = temp.length;\n      for (k = 0; k < leng; k++) {\n        temp[k] = this._list[(this._head + i + count + k) & this._capacityMask];\n      }\n      if (count === 0) {\n        removed = [];\n        if (i != size) {\n          this._tail = (this._head + i + len) & this._capacityMask;\n        }\n      } else {\n        removed = this.remove(i, count);\n        this._tail = (this._tail - leng + len) & this._capacityMask;\n      }\n      while (arguments_index < arg_len) {\n        this.push(arguments[arguments_index++]);\n      }\n      for (k = 0; k < leng; k++) {\n        this.push(temp[k]);\n      }\n    }\n    return removed;\n  } else {\n    return this.remove(i, count);\n  }\n};\n\n/**\n * Soft clear - does not reset capacity.\n */\nDenque.prototype.clear = function clear() {\n  this._list = new Array(this._list.length);\n  this._head = 0;\n  this._tail = 0;\n};\n\n/**\n * Returns true or false whether the list is empty.\n * @returns {boolean}\n */\nDenque.prototype.isEmpty = function isEmpty() {\n  return this._head === this._tail;\n};\n\n/**\n * Returns an array of all queue items.\n * @returns {Array}\n */\nDenque.prototype.toArray = function toArray() {\n  return this._copyArray(false);\n};\n\n/**\n * -------------\n *   INTERNALS\n * -------------\n */\n\n/**\n * Fills the queue with items from an array\n * For use in the constructor\n * @param array\n * @private\n */\nDenque.prototype._fromArray = function _fromArray(array) {\n  var length = array.length;\n  var capacity = this._nextPowerOf2(length);\n\n  this._list = new Array(capacity);\n  this._capacityMask = capacity - 1;\n  this._tail = length;\n\n  for (var i = 0; i < length; i++) this._list[i] = array[i];\n};\n\n/**\n *\n * @param fullCopy\n * @param size Initialize the array with a specific size. Will default to the current list size\n * @returns {Array}\n * @private\n */\nDenque.prototype._copyArray = function _copyArray(fullCopy, size) {\n  var src = this._list;\n  var capacity = src.length;\n  var length = this.length;\n  size = size | length;\n\n  // No prealloc requested and the buffer is contiguous\n  if (size == length && this._head < this._tail) {\n    // Simply do a fast slice copy\n    return this._list.slice(this._head, this._tail);\n  }\n\n  var dest = new Array(size);\n\n  var k = 0;\n  var i;\n  if (fullCopy || this._head > this._tail) {\n    for (i = this._head; i < capacity; i++) dest[k++] = src[i];\n    for (i = 0; i < this._tail; i++) dest[k++] = src[i];\n  } else {\n    for (i = this._head; i < this._tail; i++) dest[k++] = src[i];\n  }\n\n  return dest;\n}\n\n/**\n * Grows the internal list array.\n * @private\n */\nDenque.prototype._growArray = function _growArray() {\n  if (this._head != 0) {\n    // double array size and copy existing data, head to end, then beginning to tail.\n    var newList = this._copyArray(true, this._list.length << 1);\n\n    this._tail = this._list.length;\n    this._head = 0;\n\n    this._list = newList;\n  } else {\n    this._tail = this._list.length;\n    this._list.length <<= 1;\n  }\n\n  this._capacityMask = (this._capacityMask << 1) | 1;\n};\n\n/**\n * Shrinks the internal list array.\n * @private\n */\nDenque.prototype._shrinkArray = function _shrinkArray() {\n  this._list.length >>>= 1;\n  this._capacityMask >>>= 1;\n};\n\n/**\n * Find the next power of 2, at least 4\n * @private\n * @param {number} num \n * @returns {number}\n */\nDenque.prototype._nextPowerOf2 = function _nextPowerOf2(num) {\n  var log2 = Math.log(num) / Math.log(2);\n  var nextPow2 = 1 << (log2 + 1);\n\n  return Math.max(nextPow2, 4);\n}\n\nmodule.exports = Denque;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vZGVucXVlQDIuMS4wL25vZGVfbW9kdWxlcy9kZW5xdWUvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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LCJzb3VyY2VzIjpbIndlYnBhY2s6Ly92dWV4eS1tdWktbmV4dGpzLWFkbWluLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzLy5wbnBtL2RlbnF1ZUAyLjEuMC9ub2RlX21vZHVsZXMvZGVucXVlL2luZGV4LmpzPzQzMzMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEN1c3RvbSBpbXBsZW1lbnRhdGlvbiBvZiBhIGRvdWJsZSBlbmRlZCBxdWV1ZS5cbiAqL1xuZnVuY3Rpb24gRGVucXVlKGFycmF5LCBvcHRpb25zKSB7XG4gIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdGhpcy5fY2FwYWNpdHkgPSBvcHRpb25zLmNhcGFjaXR5O1xuXG4gIHRoaXMuX2hlYWQgPSAwO1xuICB0aGlzLl90YWlsID0gMDtcblxuICBpZiAoQXJyYXkuaXNBcnJheShhcnJheSkpIHtcbiAgICB0aGlzLl9mcm9tQXJyYXkoYXJyYXkpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX2NhcGFjaXR5TWFzayA9IDB4MztcbiAgICB0aGlzLl9saXN0ID0gbmV3IEFycmF5KDQpO1xuICB9XG59XG5cbi8qKlxuICogLS0tLS0tLS0tLS0tLS1cbiAqICBQVUJMSUMgQVBJXG4gKiAtLS0tLS0tLS0tLS0tXG4gKi9cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpdGVtIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXggZnJvbSB0aGUgbGlzdC5cbiAqIDAgaXMgdGhlIGZpcnN0IGVsZW1lbnQsIDEgaXMgdGhlIHNlY29uZCwgYW5kIHNvIG9uLi4uXG4gKiBFbGVtZW50cyBhdCBuZWdhdGl2ZSB2YWx1ZXMgYXJlIHRoYXQgbWFueSBmcm9tIHRoZSBlbmQ6IC0xIGlzIG9uZSBiZWZvcmUgdGhlIGVuZFxuICogKHRoZSBsYXN0IGVsZW1lbnQpLCAtMiBpcyB0d28gYmVmb3JlIHRoZSBlbmQgKG9uZSBiZWZvcmUgbGFzdCksIGV0Yy5cbiAqIEBwYXJhbSBpbmRleFxuICogQHJldHVybnMgeyp9XG4gKi9cbkRlbnF1ZS5wcm90b3R5cGUucGVla0F0ID0gZnVuY3Rpb24gcGVla0F0KGluZGV4KSB7XG4gIHZhciBpID0gaW5kZXg7XG4gIC8vIGV4cGVjdCBhIG51bWJlciBvciByZXR1cm4gdW5kZWZpbmVkXG4gIGlmICgoaSAhPT0gKGkgfCAwKSkpIHtcbiAgICByZXR1cm4gdm9pZCAwO1xuICB9XG4gIHZhciBsZW4gPSB0aGlzLnNpemUoKTtcbiAgaWYgKGkgPj0gbGVuIHx8IGkgPCAtbGVuKSByZXR1cm4gdW5kZWZpbmVkO1xuICBpZiAoaSA8IDApIGkgKz0gbGVuO1xuICBpID0gKHRoaXMuX2hlYWQgKyBpKSAmIHRoaXMuX2NhcGFjaXR5TWFzaztcbiAgcmV0dXJuIHRoaXMuX2xpc3RbaV07XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciBwZWVrQXQoKVxuICogQHBhcmFtIGlcbiAqIEByZXR1cm5zIHsqfVxuICovXG5EZW5xdWUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIGdldChpKSB7XG4gIHJldHVybiB0aGlzLnBlZWtBdChpKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZmlyc3QgaXRlbSBpbiB0aGUgbGlzdCB3aXRob3V0IHJlbW92aW5nIGl0LlxuICogQHJldHVybnMgeyp9XG4gKi9cbkRlbnF1ZS5wcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uIHBlZWsoKSB7XG4gIGlmICh0aGlzLl9oZWFkID09PSB0aGlzLl90YWlsKSByZXR1cm4gdW5kZWZpbmVkO1xuICByZXR1cm4gdGhpcy5fbGlzdFt0aGlzLl9oZWFkXTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHBlZWsoKVxuICogQHJldHVybnMgeyp9XG4gKi9cbkRlbnF1ZS5wcm90b3R5cGUucGVla0Zyb250ID0gZnVuY3Rpb24gcGVla0Zyb250KCkge1xuICByZXR1cm4gdGhpcy5wZWVrKCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGl0ZW0gdGhhdCBpcyBhdCB0aGUgYmFjayBvZiB0aGUgcXVldWUgd2l0aG91dCByZW1vdmluZyBpdC5cbiAqIFVzZXMgcGVla0F0KC0xKVxuICovXG5EZW5xdWUucHJvdG90eXBlLnBlZWtCYWNrID0gZnVuY3Rpb24gcGVla0JhY2soKSB7XG4gIHJldHVybiB0aGlzLnBlZWtBdCgtMSk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1cnJlbnQgbGVuZ3RoIG9mIHRoZSBxdWV1ZVxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoRGVucXVlLnByb3RvdHlwZSwgJ2xlbmd0aCcsIHtcbiAgZ2V0OiBmdW5jdGlvbiBsZW5ndGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2l6ZSgpO1xuICB9XG59KTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIG51bWJlciBvZiBpdGVtcyBvbiB0aGUgbGlzdCwgb3IgMCBpZiBlbXB0eS5cbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbkRlbnF1ZS5wcm90b3R5cGUuc2l6ZSA9IGZ1bmN0aW9uIHNpemUoKSB7XG4gIGlmICh0aGlzLl9oZWFkID09PSB0aGlzLl90YWlsKSByZXR1cm4gMDtcbiAgaWYgKHRoaXMuX2hlYWQgPCB0aGlzLl90YWlsKSByZXR1cm4gdGhpcy5fdGFpbCAtIHRoaXMuX2hlYWQ7XG4gIGVsc2UgcmV0dXJuIHRoaXMuX2NhcGFjaXR5TWFzayArIDEgLSAodGhpcy5faGVhZCAtIHRoaXMuX3RhaWwpO1xufTtcblxuLyoqXG4gKiBBZGQgYW4gaXRlbSBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaXN0LlxuICogQHBhcmFtIGl0ZW1cbiAqL1xuRGVucXVlLnByb3RvdHlwZS51bnNoaWZ0ID0gZnVuY3Rpb24gdW5zaGlmdChpdGVtKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdGhpcy5zaXplKCk7XG4gIHZhciBsZW4gPSB0aGlzLl9saXN0Lmxlbmd0aDtcbiAgdGhpcy5faGVhZCA9ICh0aGlzLl9oZWFkIC0gMSArIGxlbikgJiB0aGlzLl9jYXBhY2l0eU1hc2s7XG4gIHRoaXMuX2xpc3RbdGhpcy5faGVhZF0gPSBpdGVtO1xuICBpZiAodGhpcy5fdGFpbCA9PT0gdGhpcy5faGVhZCkgdGhpcy5fZ3Jvd0FycmF5KCk7XG4gIGlmICh0aGlzLl9jYXBhY2l0eSAmJiB0aGlzLnNpemUoKSA+IHRoaXMuX2NhcGFjaXR5KSB0aGlzLnBvcCgpO1xuICBpZiAodGhpcy5faGVhZCA8IHRoaXMuX3RhaWwpIHJldHVybiB0aGlzLl90YWlsIC0gdGhpcy5faGVhZDtcbiAgZWxzZSByZXR1cm4gdGhpcy5fY2FwYWNpdHlNYXNrICsgMSAtICh0aGlzLl9oZWFkIC0gdGhpcy5fdGFpbCk7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbmQgcmV0dXJuIHRoZSBmaXJzdCBpdGVtIG9uIHRoZSBsaXN0LFxuICogUmV0dXJucyB1bmRlZmluZWQgaWYgdGhlIGxpc3QgaXMgZW1wdHkuXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuRGVucXVlLnByb3RvdHlwZS5zaGlmdCA9IGZ1bmN0aW9uIHNoaWZ0KCkge1xuICB2YXIgaGVhZCA9IHRoaXMuX2hlYWQ7XG4gIGlmIChoZWFkID09PSB0aGlzLl90YWlsKSByZXR1cm4gdW5kZWZpbmVkO1xuICB2YXIgaXRlbSA9IHRoaXMuX2xpc3RbaGVhZF07XG4gIHRoaXMuX2xpc3RbaGVhZF0gPSB1bmRlZmluZWQ7XG4gIHRoaXMuX2hlYWQgPSAoaGVhZCArIDEpICYgdGhpcy5fY2FwYWNpdHlNYXNrO1xuICBpZiAoaGVhZCA8IDIgJiYgdGhpcy5fdGFpbCA+IDEwMDAwICYmIHRoaXMuX3RhaWwgPD0gdGhpcy5fbGlzdC5sZW5ndGggPj4+IDIpIHRoaXMuX3Nocmlua0FycmF5KCk7XG4gIHJldHVybiBpdGVtO1xufTtcblxuLyoqXG4gKiBBZGQgYW4gaXRlbSB0byB0aGUgYm90dG9tIG9mIHRoZSBsaXN0LlxuICogQHBhcmFtIGl0ZW1cbiAqL1xuRGVucXVlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gcHVzaChpdGVtKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdGhpcy5zaXplKCk7XG4gIHZhciB0YWlsID0gdGhpcy5fdGFpbDtcbiAgdGhpcy5fbGlzdFt0YWlsXSA9IGl0ZW07XG4gIHRoaXMuX3RhaWwgPSAodGFpbCArIDEpICYgdGhpcy5fY2FwYWNpdHlNYXNrO1xuICBpZiAodGhpcy5fdGFpbCA9PT0gdGhpcy5faGVhZCkge1xuICAgIHRoaXMuX2dyb3dBcnJheSgpO1xuICB9XG4gIGlmICh0aGlzLl9jYXBhY2l0eSAmJiB0aGlzLnNpemUoKSA+IHRoaXMuX2NhcGFjaXR5KSB7XG4gICAgdGhpcy5zaGlmdCgpO1xuICB9XG4gIGlmICh0aGlzLl9oZWFkIDwgdGhpcy5fdGFpbCkgcmV0dXJuIHRoaXMuX3RhaWwgLSB0aGlzLl9oZWFkO1xuICBlbHNlIHJldHVybiB0aGlzLl9jYXBhY2l0eU1hc2sgKyAxIC0gKHRoaXMuX2hlYWQgLSB0aGlzLl90YWlsKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuZCByZXR1cm4gdGhlIGxhc3QgaXRlbSBvbiB0aGUgbGlzdC5cbiAqIFJldHVybnMgdW5kZWZpbmVkIGlmIHRoZSBsaXN0IGlzIGVtcHR5LlxuICogQHJldHVybnMgeyp9XG4gKi9cbkRlbnF1ZS5wcm90b3R5cGUucG9wID0gZnVuY3Rpb24gcG9wKCkge1xuICB2YXIgdGFpbCA9IHRoaXMuX3RhaWw7XG4gIGlmICh0YWlsID09PSB0aGlzLl9oZWFkKSByZXR1cm4gdW5kZWZpbmVkO1xuICB2YXIgbGVuID0gdGhpcy5fbGlzdC5sZW5ndGg7XG4gIHRoaXMuX3RhaWwgPSAodGFpbCAtIDEgKyBsZW4pICYgdGhpcy5fY2FwYWNpdHlNYXNrO1xuICB2YXIgaXRlbSA9IHRoaXMuX2xpc3RbdGhpcy5fdGFpbF07XG4gIHRoaXMuX2xpc3RbdGhpcy5fdGFpbF0gPSB1bmRlZmluZWQ7XG4gIGlmICh0aGlzLl9oZWFkIDwgMiAmJiB0YWlsID4gMTAwMDAgJiYgdGFpbCA8PSBsZW4gPj4+IDIpIHRoaXMuX3Nocmlua0FycmF5KCk7XG4gIHJldHVybiBpdGVtO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW5kIHJldHVybiB0aGUgaXRlbSBhdCB0aGUgc3BlY2lmaWVkIGluZGV4IGZyb20gdGhlIGxpc3QuXG4gKiBSZXR1cm5zIHVuZGVmaW5lZCBpZiB0aGUgbGlzdCBpcyBlbXB0eS5cbiAqIEBwYXJhbSBpbmRleFxuICogQHJldHVybnMgeyp9XG4gKi9cbkRlbnF1ZS5wcm90b3R5cGUucmVtb3ZlT25lID0gZnVuY3Rpb24gcmVtb3ZlT25lKGluZGV4KSB7XG4gIHZhciBpID0gaW5kZXg7XG4gIC8vIGV4cGVjdCBhIG51bWJlciBvciByZXR1cm4gdW5kZWZpbmVkXG4gIGlmICgoaSAhPT0gKGkgfCAwKSkpIHtcbiAgICByZXR1cm4gdm9pZCAwO1xuICB9XG4gIGlmICh0aGlzLl9oZWFkID09PSB0aGlzLl90YWlsKSByZXR1cm4gdm9pZCAwO1xuICB2YXIgc2l6ZSA9IHRoaXMuc2l6ZSgpO1xuICB2YXIgbGVuID0gdGhpcy5fbGlzdC5sZW5ndGg7XG4gIGlmIChpID49IHNpemUgfHwgaSA8IC1zaXplKSByZXR1cm4gdm9pZCAwO1xuICBpZiAoaSA8IDApIGkgKz0gc2l6ZTtcbiAgaSA9ICh0aGlzLl9oZWFkICsgaSkgJiB0aGlzLl9jYXBhY2l0eU1hc2s7XG4gIHZhciBpdGVtID0gdGhpcy5fbGlzdFtpXTtcbiAgdmFyIGs7XG4gIGlmIChpbmRleCA8IHNpemUgLyAyKSB7XG4gICAgZm9yIChrID0gaW5kZXg7IGsgPiAwOyBrLS0pIHtcbiAgICAgIHRoaXMuX2xpc3RbaV0gPSB0aGlzLl9saXN0W2kgPSAoaSAtIDEgKyBsZW4pICYgdGhpcy5fY2FwYWNpdHlNYXNrXTtcbiAgICB9XG4gICAgdGhpcy5fbGlzdFtpXSA9IHZvaWQgMDtcbiAgICB0aGlzLl9oZWFkID0gKHRoaXMuX2hlYWQgKyAxICsgbGVuKSAmIHRoaXMuX2NhcGFjaXR5TWFzaztcbiAgfSBlbHNlIHtcbiAgICBmb3IgKGsgPSBzaXplIC0gMSAtIGluZGV4OyBrID4gMDsgay0tKSB7XG4gICAgICB0aGlzLl9saXN0W2ldID0gdGhpcy5fbGlzdFtpID0gKGkgKyAxICsgbGVuKSAmIHRoaXMuX2NhcGFjaXR5TWFza107XG4gICAgfVxuICAgIHRoaXMuX2xpc3RbaV0gPSB2b2lkIDA7XG4gICAgdGhpcy5fdGFpbCA9ICh0aGlzLl90YWlsIC0gMSArIGxlbikgJiB0aGlzLl9jYXBhY2l0eU1hc2s7XG4gIH1cbiAgcmV0dXJuIGl0ZW07XG59O1xuXG4vKipcbiAqIFJlbW92ZSBudW1iZXIgb2YgaXRlbXMgZnJvbSB0aGUgc3BlY2lmaWVkIGluZGV4IGZyb20gdGhlIGxpc3QuXG4gKiBSZXR1cm5zIGFycmF5IG9mIHJlbW92ZWQgaXRlbXMuXG4gKiBSZXR1cm5zIHVuZGVmaW5lZCBpZiB0aGUgbGlzdCBpcyBlbXB0eS5cbiAqIEBwYXJhbSBpbmRleFxuICogQHBhcmFtIGNvdW50XG4gKiBAcmV0dXJucyB7YXJyYXl9XG4gKi9cbkRlbnF1ZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gcmVtb3ZlKGluZGV4LCBjb3VudCkge1xuICB2YXIgaSA9IGluZGV4O1xuICB2YXIgcmVtb3ZlZDtcbiAgdmFyIGRlbF9jb3VudCA9IGNvdW50O1xuICAvLyBleHBlY3QgYSBudW1iZXIgb3IgcmV0dXJuIHVuZGVmaW5lZFxuICBpZiAoKGkgIT09IChpIHwgMCkpKSB7XG4gICAgcmV0dXJuIHZvaWQgMDtcbiAgfVxuICBpZiAodGhpcy5faGVhZCA9PT0gdGhpcy5fdGFpbCkgcmV0dXJuIHZvaWQgMDtcbiAgdmFyIHNpemUgPSB0aGlzLnNpemUoKTtcbiAgdmFyIGxlbiA9IHRoaXMuX2xpc3QubGVuZ3RoO1xuICBpZiAoaSA+PSBzaXplIHx8IGkgPCAtc2l6ZSB8fCBjb3VudCA8IDEpIHJldHVybiB2b2lkIDA7XG4gIGlmIChpIDwgMCkgaSArPSBzaXplO1xuICBpZiAoY291bnQgPT09IDEgfHwgIWNvdW50KSB7XG4gICAgcmVtb3ZlZCA9IG5ldyBBcnJheSgxKTtcbiAgICByZW1vdmVkWzBdID0gdGhpcy5yZW1vdmVPbmUoaSk7XG4gICAgcmV0dXJuIHJlbW92ZWQ7XG4gIH1cbiAgaWYgKGkgPT09IDAgJiYgaSArIGNvdW50ID49IHNpemUpIHtcbiAgICByZW1vdmVkID0gdGhpcy50b0FycmF5KCk7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHJldHVybiByZW1vdmVkO1xuICB9XG4gIGlmIChpICsgY291bnQgPiBzaXplKSBjb3VudCA9IHNpemUgLSBpO1xuICB2YXIgaztcbiAgcmVtb3ZlZCA9IG5ldyBBcnJheShjb3VudCk7XG4gIGZvciAoayA9IDA7IGsgPCBjb3VudDsgaysrKSB7XG4gICAgcmVtb3ZlZFtrXSA9IHRoaXMuX2xpc3RbKHRoaXMuX2hlYWQgKyBpICsgaykgJiB0aGlzLl9jYXBhY2l0eU1hc2tdO1xuICB9XG4gIGkgPSAodGhpcy5faGVhZCArIGkpICYgdGhpcy5fY2FwYWNpdHlNYXNrO1xuICBpZiAoaW5kZXggKyBjb3VudCA9PT0gc2l6ZSkge1xuICAgIHRoaXMuX3RhaWwgPSAodGhpcy5fdGFpbCAtIGNvdW50ICsgbGVuKSAmIHRoaXMuX2NhcGFjaXR5TWFzaztcbiAgICBmb3IgKGsgPSBjb3VudDsgayA+IDA7IGstLSkge1xuICAgICAgdGhpcy5fbGlzdFtpID0gKGkgKyAxICsgbGVuKSAmIHRoaXMuX2NhcGFjaXR5TWFza10gPSB2b2lkIDA7XG4gICAgfVxuICAgIHJldHVybiByZW1vdmVkO1xuICB9XG4gIGlmIChpbmRleCA9PT0gMCkge1xuICAgIHRoaXMuX2hlYWQgPSAodGhpcy5faGVhZCArIGNvdW50ICsgbGVuKSAmIHRoaXMuX2NhcGFjaXR5TWFzaztcbiAgICBmb3IgKGsgPSBjb3VudCAtIDE7IGsgPiAwOyBrLS0pIHtcbiAgICAgIHRoaXMuX2xpc3RbaSA9IChpICsgMSArIGxlbikgJiB0aGlzLl9jYXBhY2l0eU1hc2tdID0gdm9pZCAwO1xuICAgIH1cbiAgICByZXR1cm4gcmVtb3ZlZDtcbiAgfVxuICBpZiAoaSA8IHNpemUgLyAyKSB7XG4gICAgdGhpcy5faGVhZCA9ICh0aGlzLl9oZWFkICsgaW5kZXggKyBjb3VudCArIGxlbikgJiB0aGlzLl9jYXBhY2l0eU1hc2s7XG4gICAgZm9yIChrID0gaW5kZXg7IGsgPiAwOyBrLS0pIHtcbiAgICAgIHRoaXMudW5zaGlmdCh0aGlzLl9saXN0W2kgPSAoaSAtIDEgKyBsZW4pICYgdGhpcy5fY2FwYWNpdHlNYXNrXSk7XG4gICAgfVxuICAgIGkgPSAodGhpcy5faGVhZCAtIDEgKyBsZW4pICYgdGhpcy5fY2FwYWNpdHlNYXNrO1xuICAgIHdoaWxlIChkZWxfY291bnQgPiAwKSB7XG4gICAgICB0aGlzLl9saXN0W2kgPSAoaSAtIDEgKyBsZW4pICYgdGhpcy5fY2FwYWNpdHlNYXNrXSA9IHZvaWQgMDtcbiAgICAgIGRlbF9jb3VudC0tO1xuICAgIH1cbiAgICBpZiAoaW5kZXggPCAwKSB0aGlzLl90YWlsID0gaTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl90YWlsID0gaTtcbiAgICBpID0gKGkgKyBjb3VudCArIGxlbikgJiB0aGlzLl9jYXBhY2l0eU1hc2s7XG4gICAgZm9yIChrID0gc2l6ZSAtIChjb3VudCArIGluZGV4KTsgayA+IDA7IGstLSkge1xuICAgICAgdGhpcy5wdXNoKHRoaXMuX2xpc3RbaSsrXSk7XG4gICAgfVxuICAgIGkgPSB0aGlzLl90YWlsO1xuICAgIHdoaWxlIChkZWxfY291bnQgPiAwKSB7XG4gICAgICB0aGlzLl9saXN0W2kgPSAoaSArIDEgKyBsZW4pICYgdGhpcy5fY2FwYWNpdHlNYXNrXSA9IHZvaWQgMDtcbiAgICAgIGRlbF9jb3VudC0tO1xuICAgIH1cbiAgfVxuICBpZiAodGhpcy5faGVhZCA8IDIgJiYgdGhpcy5fdGFpbCA+IDEwMDAwICYmIHRoaXMuX3RhaWwgPD0gbGVuID4+PiAyKSB0aGlzLl9zaHJpbmtBcnJheSgpO1xuICByZXR1cm4gcmVtb3ZlZDtcbn07XG5cbi8qKlxuICogTmF0aXZlIHNwbGljZSBpbXBsZW1lbnRhdGlvbi5cbiAqIFJlbW92ZSBudW1iZXIgb2YgaXRlbXMgZnJvbSB0aGUgc3BlY2lmaWVkIGluZGV4IGZyb20gdGhlIGxpc3QgYW5kL29yIGFkZCBuZXcgZWxlbWVudHMuXG4gKiBSZXR1cm5zIGFycmF5IG9mIHJlbW92ZWQgaXRlbXMgb3IgZW1wdHkgYXJyYXkgaWYgY291bnQgPT0gMC5cbiAqIFJldHVybnMgdW5kZWZpbmVkIGlmIHRoZSBsaXN0IGlzIGVtcHR5LlxuICpcbiAqIEBwYXJhbSBpbmRleFxuICogQHBhcmFtIGNvdW50XG4gKiBAcGFyYW0gey4uLip9IFtlbGVtZW50c11cbiAqIEByZXR1cm5zIHthcnJheX1cbiAqL1xuRGVucXVlLnByb3RvdHlwZS5zcGxpY2UgPSBmdW5jdGlvbiBzcGxpY2UoaW5kZXgsIGNvdW50KSB7XG4gIHZhciBpID0gaW5kZXg7XG4gIC8vIGV4cGVjdCBhIG51bWJlciBvciByZXR1cm4gdW5kZWZpbmVkXG4gIGlmICgoaSAhPT0gKGkgfCAwKSkpIHtcbiAgICByZXR1cm4gdm9pZCAwO1xuICB9XG4gIHZhciBzaXplID0gdGhpcy5zaXplKCk7XG4gIGlmIChpIDwgMCkgaSArPSBzaXplO1xuICBpZiAoaSA+IHNpemUpIHJldHVybiB2b2lkIDA7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuICAgIHZhciBrO1xuICAgIHZhciB0ZW1wO1xuICAgIHZhciByZW1vdmVkO1xuICAgIHZhciBhcmdfbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICB2YXIgbGVuID0gdGhpcy5fbGlzdC5sZW5ndGg7XG4gICAgdmFyIGFyZ3VtZW50c19pbmRleCA9IDI7XG4gICAgaWYgKCFzaXplIHx8IGkgPCBzaXplIC8gMikge1xuICAgICAgdGVtcCA9IG5ldyBBcnJheShpKTtcbiAgICAgIGZvciAoayA9IDA7IGsgPCBpOyBrKyspIHtcbiAgICAgICAgdGVtcFtrXSA9IHRoaXMuX2xpc3RbKHRoaXMuX2hlYWQgKyBrKSAmIHRoaXMuX2NhcGFjaXR5TWFza107XG4gICAgICB9XG4gICAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgICAgcmVtb3ZlZCA9IFtdO1xuICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICB0aGlzLl9oZWFkID0gKHRoaXMuX2hlYWQgKyBpICsgbGVuKSAmIHRoaXMuX2NhcGFjaXR5TWFzaztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVtb3ZlZCA9IHRoaXMucmVtb3ZlKGksIGNvdW50KTtcbiAgICAgICAgdGhpcy5faGVhZCA9ICh0aGlzLl9oZWFkICsgaSArIGxlbikgJiB0aGlzLl9jYXBhY2l0eU1hc2s7XG4gICAgICB9XG4gICAgICB3aGlsZSAoYXJnX2xlbiA+IGFyZ3VtZW50c19pbmRleCkge1xuICAgICAgICB0aGlzLnVuc2hpZnQoYXJndW1lbnRzWy0tYXJnX2xlbl0pO1xuICAgICAgfVxuICAgICAgZm9yIChrID0gaTsgayA+IDA7IGstLSkge1xuICAgICAgICB0aGlzLnVuc2hpZnQodGVtcFtrIC0gMV0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0ZW1wID0gbmV3IEFycmF5KHNpemUgLSAoaSArIGNvdW50KSk7XG4gICAgICB2YXIgbGVuZyA9IHRlbXAubGVuZ3RoO1xuICAgICAgZm9yIChrID0gMDsgayA8IGxlbmc7IGsrKykge1xuICAgICAgICB0ZW1wW2tdID0gdGhpcy5fbGlzdFsodGhpcy5faGVhZCArIGkgKyBjb3VudCArIGspICYgdGhpcy5fY2FwYWNpdHlNYXNrXTtcbiAgICAgIH1cbiAgICAgIGlmIChjb3VudCA9PT0gMCkge1xuICAgICAgICByZW1vdmVkID0gW107XG4gICAgICAgIGlmIChpICE9IHNpemUpIHtcbiAgICAgICAgICB0aGlzLl90YWlsID0gKHRoaXMuX2hlYWQgKyBpICsgbGVuKSAmIHRoaXMuX2NhcGFjaXR5TWFzaztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVtb3ZlZCA9IHRoaXMucmVtb3ZlKGksIGNvdW50KTtcbiAgICAgICAgdGhpcy5fdGFpbCA9ICh0aGlzLl90YWlsIC0gbGVuZyArIGxlbikgJiB0aGlzLl9jYXBhY2l0eU1hc2s7XG4gICAgICB9XG4gICAgICB3aGlsZSAoYXJndW1lbnRzX2luZGV4IDwgYXJnX2xlbikge1xuICAgICAgICB0aGlzLnB1c2goYXJndW1lbnRzW2FyZ3VtZW50c19pbmRleCsrXSk7XG4gICAgICB9XG4gICAgICBmb3IgKGsgPSAwOyBrIDwgbGVuZzsgaysrKSB7XG4gICAgICAgIHRoaXMucHVzaCh0ZW1wW2tdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlbW92ZWQ7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlKGksIGNvdW50KTtcbiAgfVxufTtcblxuLyoqXG4gKiBTb2Z0IGNsZWFyIC0gZG9lcyBub3QgcmVzZXQgY2FwYWNpdHkuXG4gKi9cbkRlbnF1ZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiBjbGVhcigpIHtcbiAgdGhpcy5fbGlzdCA9IG5ldyBBcnJheSh0aGlzLl9saXN0Lmxlbmd0aCk7XG4gIHRoaXMuX2hlYWQgPSAwO1xuICB0aGlzLl90YWlsID0gMDtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIG9yIGZhbHNlIHdoZXRoZXIgdGhlIGxpc3QgaXMgZW1wdHkuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuRGVucXVlLnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24gaXNFbXB0eSgpIHtcbiAgcmV0dXJuIHRoaXMuX2hlYWQgPT09IHRoaXMuX3RhaWw7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gYXJyYXkgb2YgYWxsIHF1ZXVlIGl0ZW1zLlxuICogQHJldHVybnMge0FycmF5fVxuICovXG5EZW5xdWUucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbiB0b0FycmF5KCkge1xuICByZXR1cm4gdGhpcy5fY29weUFycmF5KGZhbHNlKTtcbn07XG5cbi8qKlxuICogLS0tLS0tLS0tLS0tLVxuICogICBJTlRFUk5BTFNcbiAqIC0tLS0tLS0tLS0tLS1cbiAqL1xuXG4vKipcbiAqIEZpbGxzIHRoZSBxdWV1ZSB3aXRoIGl0ZW1zIGZyb20gYW4gYXJyYXlcbiAqIEZvciB1c2UgaW4gdGhlIGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0gYXJyYXlcbiAqIEBwcml2YXRlXG4gKi9cbkRlbnF1ZS5wcm90b3R5cGUuX2Zyb21BcnJheSA9IGZ1bmN0aW9uIF9mcm9tQXJyYXkoYXJyYXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgdmFyIGNhcGFjaXR5ID0gdGhpcy5fbmV4dFBvd2VyT2YyKGxlbmd0aCk7XG5cbiAgdGhpcy5fbGlzdCA9IG5ldyBBcnJheShjYXBhY2l0eSk7XG4gIHRoaXMuX2NhcGFjaXR5TWFzayA9IGNhcGFjaXR5IC0gMTtcbiAgdGhpcy5fdGFpbCA9IGxlbmd0aDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB0aGlzLl9saXN0W2ldID0gYXJyYXlbaV07XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0gZnVsbENvcHlcbiAqIEBwYXJhbSBzaXplIEluaXRpYWxpemUgdGhlIGFycmF5IHdpdGggYSBzcGVjaWZpYyBzaXplLiBXaWxsIGRlZmF1bHQgdG8gdGhlIGN1cnJlbnQgbGlzdCBzaXplXG4gKiBAcmV0dXJucyB7QXJyYXl9XG4gKiBAcHJpdmF0ZVxuICovXG5EZW5xdWUucHJvdG90eXBlLl9jb3B5QXJyYXkgPSBmdW5jdGlvbiBfY29weUFycmF5KGZ1bGxDb3B5LCBzaXplKSB7XG4gIHZhciBzcmMgPSB0aGlzLl9saXN0O1xuICB2YXIgY2FwYWNpdHkgPSBzcmMubGVuZ3RoO1xuICB2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG4gIHNpemUgPSBzaXplIHwgbGVuZ3RoO1xuXG4gIC8vIE5vIHByZWFsbG9jIHJlcXVlc3RlZCBhbmQgdGhlIGJ1ZmZlciBpcyBjb250aWd1b3VzXG4gIGlmIChzaXplID09IGxlbmd0aCAmJiB0aGlzLl9oZWFkIDwgdGhpcy5fdGFpbCkge1xuICAgIC8vIFNpbXBseSBkbyBhIGZhc3Qgc2xpY2UgY29weVxuICAgIHJldHVybiB0aGlzLl9saXN0LnNsaWNlKHRoaXMuX2hlYWQsIHRoaXMuX3RhaWwpO1xuICB9XG5cbiAgdmFyIGRlc3QgPSBuZXcgQXJyYXkoc2l6ZSk7XG5cbiAgdmFyIGsgPSAwO1xuICB2YXIgaTtcbiAgaWYgKGZ1bGxDb3B5IHx8IHRoaXMuX2hlYWQgPiB0aGlzLl90YWlsKSB7XG4gICAgZm9yIChpID0gdGhpcy5faGVhZDsgaSA8IGNhcGFjaXR5OyBpKyspIGRlc3RbaysrXSA9IHNyY1tpXTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5fdGFpbDsgaSsrKSBkZXN0W2srK10gPSBzcmNbaV07XG4gIH0gZWxzZSB7XG4gICAgZm9yIChpID0gdGhpcy5faGVhZDsgaSA8IHRoaXMuX3RhaWw7IGkrKykgZGVzdFtrKytdID0gc3JjW2ldO1xuICB9XG5cbiAgcmV0dXJuIGRlc3Q7XG59XG5cbi8qKlxuICogR3Jvd3MgdGhlIGludGVybmFsIGxpc3QgYXJyYXkuXG4gKiBAcHJpdmF0ZVxuICovXG5EZW5xdWUucHJvdG90eXBlLl9ncm93QXJyYXkgPSBmdW5jdGlvbiBfZ3Jvd0FycmF5KCkge1xuICBpZiAodGhpcy5faGVhZCAhPSAwKSB7XG4gICAgLy8gZG91YmxlIGFycmF5IHNpemUgYW5kIGNvcHkgZXhpc3RpbmcgZGF0YSwgaGVhZCB0byBlbmQsIHRoZW4gYmVnaW5uaW5nIHRvIHRhaWwuXG4gICAgdmFyIG5ld0xpc3QgPSB0aGlzLl9jb3B5QXJyYXkodHJ1ZSwgdGhpcy5fbGlzdC5sZW5ndGggPDwgMSk7XG5cbiAgICB0aGlzLl90YWlsID0gdGhpcy5fbGlzdC5sZW5ndGg7XG4gICAgdGhpcy5faGVhZCA9IDA7XG5cbiAgICB0aGlzLl9saXN0ID0gbmV3TGlzdDtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl90YWlsID0gdGhpcy5fbGlzdC5sZW5ndGg7XG4gICAgdGhpcy5fbGlzdC5sZW5ndGggPDw9IDE7XG4gIH1cblxuICB0aGlzLl9jYXBhY2l0eU1hc2sgPSAodGhpcy5fY2FwYWNpdHlNYXNrIDw8IDEpIHwgMTtcbn07XG5cbi8qKlxuICogU2hyaW5rcyB0aGUgaW50ZXJuYWwgbGlzdCBhcnJheS5cbiAqIEBwcml2YXRlXG4gKi9cbkRlbnF1ZS5wcm90b3R5cGUuX3Nocmlua0FycmF5ID0gZnVuY3Rpb24gX3Nocmlua0FycmF5KCkge1xuICB0aGlzLl9saXN0Lmxlbmd0aCA+Pj49IDE7XG4gIHRoaXMuX2NhcGFjaXR5TWFzayA+Pj49IDE7XG59O1xuXG4vKipcbiAqIEZpbmQgdGhlIG5leHQgcG93ZXIgb2YgMiwgYXQgbGVhc3QgNFxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW0gXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5EZW5xdWUucHJvdG90eXBlLl9uZXh0UG93ZXJPZjIgPSBmdW5jdGlvbiBfbmV4dFBvd2VyT2YyKG51bSkge1xuICB2YXIgbG9nMiA9IE1hdGgubG9nKG51bSkgLyBNYXRoLmxvZygyKTtcbiAgdmFyIG5leHRQb3cyID0gMSA8PCAobG9nMiArIDEpO1xuXG4gIHJldHVybiBNYXRoLm1heChuZXh0UG93MiwgNCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGVucXVlO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/denque@2.1.0/node_modules/denque/index.js\n");

/***/ })

};
;