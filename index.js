
/**
 * Countdown Numbers Round Algo Test Code 2/2/21
 *
 * Rules:
 *  There are 6 numbers selected from 2 pools (large/small)
 *   - There are 20 small numbers ranging from 1 to 10.
 *   - There are 4 large numbers [25, 50, 75, 100].
 *  The objective is to add, subtract, multiply, and divide the selected
 *  digits to equal a randomly generated goal. (Probably > 100).
 *
 *  Only integers are allowed.
 *
 */

let digitidentity = 0;
const OPERATORS = ['ADD', 'SUB', 'MUL', 'DIV'];

const default_pool = [75,25,2,4,2,9];
const default_goal = 647;
let pool;
let goal;
let board;
let boardTree;
let tree;

let pool_ele;
let goal_ele;


class Digit {

  id = null;
  value = null;
  operator = null;
  left = null;
  right = null;

  comprising = [];

  constructor(value, operator, left, right) {
    this.id = digitidentity++;
    this.value = value;
    this.operator = operator;
    this.left = left;
    this.right = right;

    // Add the value of itself to its comprising list (base case)
    this.comprising.push(this.id);

    if(this.left) {
      this.comprising = [ ...this.comprising, ...this.left.comprising];
    }

    if(this.right) {
      this.comprising = [ ...this.comprising, ...this.right.comprising];
    }
  }

}


class Board {

  digits = [];
  goal = null;

  // Flag to help keep track of the algo status
  rootNode = null;

  constructor(pool, goal) {
    // Set the target goal
    this.goal = goal;

    // Generate each root digit
    for(let value of pool) {
      this.createDigit(value);
    }

    // Iterate over each root digit (to start) as left hand args
    leftIterator: for(let left of this.digits) {
      // Iterate over every digit as right hand args
      rightIterator: for(let right of this.digits) {

          // Don't process a digit against itself
          if(left.id !== right.id) {
            this.process(left, right);

            // If the goal has not been met
            if(this.rootNode) {
              break leftIterator;
            }

          }

      }
    }

  }

  hasAssociation(parent, child) {
    // Idenfify if either nodes comprising list contains a match
    for(let parentComp of parent.comprising) {
      for(let childComp of child.comprising) {
        if(parentComp === childComp) {
          return true;
        }
      }
    }
    return false;
  }

  createDigit(value, operator, left, right) {
    this.digits.push(new Digit(value, operator, left, right));
  }

  process(left, right) {
    for(let op of OPERATORS) {
      let value = 0;

      // Perform each operation
      switch(op) {
        case 'ADD':
          value = left.value + right.value;
          break;
        case 'SUB':
          value = left.value - right.value;
          break;
        case 'MUL':
          value = left.value * right.value;
          break;
        case 'DIV':
          value = left.value / right.value;
          break;
        default:
          break;
      }

      // Only accept integers
      if(Number.isInteger(value) && value > 0) { // TODO: Testing without negatives
        // Don't process a digist against any associative digit
        if(!this.hasAssociation(left, right) && !this.hasAssociation(right, left)) {
          this.createDigit(value, op, left, right);
          // Check if goal is found
          if(value === this.goal) {
            this.rootNode = this.digits[this.digits.length - 1];
          }
        }

      }

    }
  }

  toTreeMarkup() {

    function makeNode(digit) {
      // If the digit is not a root digit, make child nodes
      let childArgs = [];
      if(digit.operator) {
        childArgs = [
          {
            text: {
              name: digit.operator
            },
            children: [
              (digit.left) ? makeNode(digit.left) : null,
              (digit.right) ? makeNode(digit.right) : null
            ]
          }
        ];
      }

      return {
        text: {
          name: digit.value
        },
        children: childArgs
      }
    }

    return {
      chart: {
        container: '#treeContent',
        levelSeparation: 25,
        siblingSeparation: 70,
        subTreeSeparation: 70,
        padding: 30,
        connectors: {
          type: "curve",
          style: {
            "stroke-width": 2,
            "stroke-linecap": "round",
            "stroke": "#ccc"
          }
        }
      },
      nodeStructure: makeNode(this.rootNode)
    };

  }
}


function runBoard() {
  digitidentity = 0;
  document.getElementById('treeContent').innerHTML = '';
  pool = pool_ele.value.split(',').map(val => parseInt(val));
  goal = parseInt(goal_ele.value);

  let statusMsg = 'Goal has been found.';

  try {
    board = new Board(pool, goal);
    console.log(board);

    boardTree = board.toTreeMarkup();
    tree = new Treant(boardTree);
    console.log(boardTree);
  }catch(t) {
    if(t === 'MaxDigits') {
        statusMsg = 'Maxed out allowed digits.';
    }
  }

  document.getElementById('boardStatus').innerHTML = statusMsg;
  dfs(boardTree.nodeStructure)
}


function dfs(node) {
  if(node.children.length > 0) {
    for(let child of node.children) {
      dfs(child);
    }
  }
  console.log(node.text.name);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  pool_ele = document.getElementById('selectedNums');
  goal_ele = document.getElementById('goalInput');

  pool_ele.value = default_pool.join(',');
  goal_ele.value = default_goal;

  // Populate the board
  // board = runBoard()
});
