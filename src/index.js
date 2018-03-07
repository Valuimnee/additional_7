class Node {
  constructor() {
    this.left = this;
    this.right = this;
    this.up = null;
    this.down = null;
    this.header = null;
  }
}

class Header {
  constructor() {
    this.left = null;
    this.right = null;
    this.up = this;
    this.down = this;
    this.header = this;
    this.name = null;
    this.count = 9;
  }
}

class SudokuExactCoverMatrix {
  constructor(matrix) {
    this.selected = [];
    var array = this.initializeMatrix();
    this.initializeSudoku(matrix, array);
  }

  initializeMatrix() {
    var array = this.initializeHeaders();
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        for (var d = 1; d < 10; d++) {
          var next = this.findElement(array[ 81 + i * 9 + (d - 1)], j);
          var curr = this.findElement(array[i * 9 + j], d - 1);
          this.addHorizontal(curr, next);
          curr = next;
          next = this.findElement(array[81 * 2 + j * 9 + (d - 1)], i);
          this.addHorizontal(curr, next);
          curr = next;
          next = this.findElement(array[81 * 3 + (Math.floor(i / 3) * 3 +
            Math.floor(j / 3)) * 9 + (d - 1)], (i % 3) * 3 + j % 3);
          this.addHorizontal(curr, next);
        }
      }
    }
    return array;
  }

  findElement(el, n) {
    for (var i = 0; i <= n; i++) {
      el = el.down;
    }
    return el;
  }

  initializeHeaders() {
    var array = [];
    this.root = new Header();
    this.root.right = this.root;
    this.root.left = this.root;
    var c = this.root;
    var currHeader;
    for (var i = 0; i < 324; i++) {
      currHeader =new Header();
      var type = Math.floor(i / 81);
      /* cell */
      if (type === 0) {
        currHeader.name = ("" + Math.floor(i / 9)) + i % 9 + "x";
      } else if (type === 1) {
        /* row */
        currHeader.name = "" + Math.floor((i - 81) / 9) + "x" + (i % 9 + 1);
      } else if (type === 2) {
        /* column */
        currHeader.name = ("x" + Math.floor((i - 81 * 2) / 9)) + (i % 9 + 1);
      } else if (type === 3) {
        /* box */
        currHeader.name = ("b" + Math.floor((i - 81 * 3) / 9)) + (i % 9 + 1);
      }
      var vertical = currHeader;
      for (var j = 0; j < 9; j++) {
        this.addVertical(vertical, new Node());
        vertical = vertical.down;
      }
      array.push(currHeader);
      this.addHorizontal(c, currHeader);
      c = currHeader;
    }
    return array;
  }

  addHorizontal(a, b) {
    b.left = a.right.left;
    a.right.left = b;
    b.right = a.right;
    a.right = b;
  }

  addVertical(a, b) {
    b.up = a.down.up;
    a.down.up = b;
    b.down = a.down;
    a.down = b;
    b.header = a.header;
  }

  removeHorizontal(node) {
    node.right.left = node.left;
    node.left.right = node.right;
  }

  removeVertical(node) {
    node.down.up = node.up;
    node.up.down = node.down;
  }

  insertHorizontal(node) {
    node.right.left = node;
    node.left.right = node;
  }

  insertVertical(node) {
    node.down.up = node;
    node.up.down = node;
  }

  initializeSudoku(matrix, array) {
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        if (matrix[i][j] >= 1) {
          this.selected.push(this.findElement(array[i * 9 + j], matrix[i][j] - 1));
        }
      }
    }
    for (var i = 0; i < this.selected.length; i++) {
      this.deleteColumnRows(this.selected[i].header);
      for (j = this.selected[i].right; j !== this.selected[i]; j = j.right) {
        this.deleteColumnRows(j.header);
      }
    }
  }

  solve() {
    if (this.root.right === this.root) {
      return this.printSolution();
    }
    var c = this.selectColumn();
    if (c === null) {
      return null;
    }
    this.deleteColumnRows(c);
    for (var i = c.down; i != c; i = i.down) {
      this.selected.push(i);
      for (var j = i.right; j !== i; j = j.right) {
        this.deleteColumnRows(j.header);
      }
      var solution = this.solve();
      if (solution !== null) {
        return solution;
      }
      i = this.selected.pop();
      for (var j = i.left; j !== i; j = j.left) {
        this.returnColumnRows(j.header);
      }
    }
    this.returnColumnRows(c);
    return null;
  }

  selectColumn() {
    var s = 9;
    var c = this.root.right;
    for (var i = c; i != this.root; i = i.right) {
      if (i.count < s) {
        s = i.count;
        c = i;
      }
    }
    return s === 0 ? null : c;
  }

  deleteColumnRows(c) {
    this.removeHorizontal(c);
    for (var i = c.down; i !== c; i = i.down) {
      for (var j = i.right; j !== i; j = j.right) {
        this.removeVertical(j);
        j.header.count -= 1;
      }
    }
  }

  returnColumnRows(c) {
    for (var i = c.up; i !== c; i = i.up) {
      for (var j = i.left; j !== i; j = j.left) {
        j.header.count += 1;
        this.insertVertical(j);
      }
    }
    this.insertHorizontal(c);
  }

  printSolution() {
    var matrix = new Array(9).fill(0).map(x => new Array(9).fill(0));
    var i;
    var j;
    var d;
    for (var k=0; k<this.selected.length; k++){
      var r=this.selected[k];
      while(r.header.name[2]!='x'){
        r=r.right;
      }
      i=parseInt(r.header.name[0]);
      j=parseInt(r.header.name[1]);
      r=r.right;
      d=parseInt(r.header.name[2]);
      matrix[i][j]=d;
    }
    return matrix;
  }
}





module.exports = function solveSudoku(matrix) {
  // your solution
  var sudoku= new SudokuExactCoverMatrix(matrix);
  return sudoku.solve();
}
