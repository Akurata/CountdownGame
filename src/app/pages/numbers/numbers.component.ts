import { Component, OnInit } from '@angular/core';

declare var Treant: any;

@Component({
  selector: 'ngx-numbers',
  templateUrl: './numbers.component.html',
  styleUrls: ['./numbers.component.scss'],
})
export class NumbersComponent implements OnInit {

  OPERATORS: string[] = ['ADD', 'SUB', 'MUL', 'DIV'];

  MAX_DIGITS: number = 150000;

  // Keep track of digit ids
  digitidentity: number = 0;

  // This gets set to the digitidentity when a goal is found
  iterationCount: number;

  // Store root node after goal is found
  rootNode: Digit;

  // Store Treant initialization
  tree: typeof Treant;

  // Input selected numbers
  selected: number[] = [];

  // Input target goal
  goal: number;

  // Utility variables
  status: any =  {
    statusMsg: '',
    class: '',
  };
  loading: boolean = true;

  // Master digit lisit
  digits: Digit[] = [];

  // Testing using negative numbers flag
  allowNegatives: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.randomPuzzle();
  }

  // Helper method for parsing the selected input field
  setSelected(value: string) {
    this.selected = [ ...value.split(',').map(x => parseInt(x, 10))];
  }

  createDigit(value: number, operator?: string, left?: Digit, right?: Digit): void {
    const digit: Digit = new Digit(this.digitidentity++, value, operator, left, right);
    this.digits.push(digit);

    if(digit.id > this.MAX_DIGITS) {
      // If more than 1,000,000 digits have been generated, check for closeness
      this._bail();
    }
  }

  _bail(): void {
    this.status.statusMsg = 'Maxed out digits';
    this.status.class = 'text-danger';
    this.iterationCount = this.digitidentity;
    this.rootNode = this.digits[0];
  }

  hasAssociation(parent: Digit, child: Digit): boolean {
    // Idenfify if either nodes comprising list contains a match
    for(const parentListNode of parent.comprising) {
      for(const childListNode of child.comprising) {
        if(parentListNode === childListNode) {
          return true;
        }
      }
    }
    return false;
  }

  process(left: Digit, right: Digit): void {
    for(const op of this.OPERATORS) {
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

      // Only accept postive integers
      if(Number.isInteger(value) && (this.allowNegatives || value > 0)) {
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

  _reset(): void {
    this.digitidentity = 0;
    this.iterationCount = 0;
    this.digits = [];
    this.rootNode = null;
    this.status.statusMsg = '';
    this.loading = true;
    this.tree = null;

    // Not ideal but Treant requires traditional element ids
    document.getElementById('treeContent').innerHTML = '';
  }

  run(): void {
    // Reset digit counter
    this._reset();

    // Sort selected numbers by value
    this.selected = this.selected.sort((a, b) => b - a);

    // Create the initial pool of numbers
    for(const value of this.selected) {
      this.createDigit(value);
    }

    // Iterate over each root digit (to start) as left hand args
    outer: for(const left of this.digits) {
      // Iterate over every digit as right hand args
      for(const right of this.digits) {

        // Don't process a digit against itself
        if(left.id !== right.id) {
          this.process(left, right);

          // If the goal has been met, stop checking values
          if(this.rootNode) {
            break outer;
          }

        }

      }
    }

    // Update status message depending on goal.
    if(this.rootNode && this.rootNode.operator) {
      this.status.statusMsg = 'Goal has been found.';
      this.status.class = 'text-success';
      this.iterationCount = this.rootNode.id;

      // Create tree
      this.tree = new Treant(this.toTreeMarkup());
    }

    this.loading = false;
  }


  // Helper function for making tree nodes
  _makeNode(digit: Digit) {
    // If the digit is not a root digit, make child nodes
    let childArgs = [];
    if(digit.operator) {
      childArgs = [
        {
          text: {
            name: digit.operator,
          },
          children: [
            (digit.left) ? this._makeNode(digit.left) : null,
            (digit.right) ? this._makeNode(digit.right) : null,
          ],
        },
      ];
    }


    return {
      text: {
        name: digit.value,
      },
      children: childArgs,
      HTMLclass: (digit.isRoot) ? 'rootNumber' : '',
    };
  }


  // Convert logical output to tree structure
  toTreeMarkup() {
    return {
      chart: {
        container: '#treeContent',
        levelSeparation: 25,
        siblingSeparation: 70,
        subTreeSeparation: 70,
        padding: 30,
        connectors: {
          type: 'curve',
          style: {
            'stroke-width': 2,
            'stroke-linecap': 'round',
            'stroke': '#ccc',
          },
        },
      },
      nodeStructure: this._makeNode(this.rootNode),
    };

  }


  // Create a random puzzle for testing
  randomPuzzle() {
    this._reset();

    // Randomly determine a number of large selections
    const largeCount: number = Math.floor(Math.random() * 4);
    const largePool: number[] = [];

    // The remainder will be small picks
    const smallCount: number = (6 - largeCount);
    const smallPool: number[] = [];

    // Generate large numbers
    const largeEnum: number[] = [25, 50, 75, 100];
    for(let i = 0; i < largeCount; i++) {
      const randIndex: number = Math.floor(Math.random() * largeEnum.length);
      largePool.push(largeEnum.splice(randIndex, 1)[0]);
    }

    // Small numbers are 'Authentically' selected from a select pool of 20
    const smallEnum: number[] = [];
    for(let i = 0; i < 20; i++) {
      const randNum: number = Math.floor(Math.random() * 10) + 1;
      smallEnum.push(randNum);
    }

    // Generate small numbers
    for(let i = 0; i < smallCount; i++) {
      const randIndex: number = Math.floor(Math.random() * smallEnum.length);
      smallPool.push(smallEnum.slice(randIndex)[0]);
    }

    // Generate a random target (offset by 100)
    const randGoal: number = Math.floor(Math.random() * 900) + 100;

    // Assign generated values to the class state
    this.selected = [ ...largePool, ...smallPool ];
    this.goal = randGoal;
  }
}




class Digit {

  id: number = 0;
  value: number = 0;
  isRoot: boolean = false;
  operator: string;
  left: Digit;
  right: Digit;

  comprising: number[] = [];

  constructor(id: number, value: number, operator?: string, left?: Digit, right?: Digit) {
    this.id = id;
    this.value = value;
    this.operator = operator;
    this.left = left;
    this.right = right;

    // Add the value of itself to its comprising list (base case)
    this.comprising.push(this.id);

    // If the operator exists, incorporate the left and right comprising lists
    if(this.operator) {
      if(this.left) {
        this.comprising = [ ...this.comprising, ...this.left.comprising];
      }
      if(this.right) {
        this.comprising = [ ...this.comprising, ...this.right.comprising];
      }
    }else {
      // If there is no operator, then this must be a root digit
      this.isRoot = true;
    }
  }
}
