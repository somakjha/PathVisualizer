import React, { Component } from 'react';
import './PathfindingVisualizer.css';
import Node from './Node/Node';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar'
import { dijkstra } from '../algorithms/dijkstra';
import { AStar } from '../algorithms/aStar';

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();

    this.state =
    {
      grid: [],
      START_NODE_ROW: 5,
      FINISH_NODE_ROW: 5,
      START_NODE_COL: 5,
      FINISH_NODE_COL: 15,
      mouseIsPressed: false,
      ROW_COUNT: 15,
      COLUMN_COUNT: 20,
      isRunning: false,
      isStartNode: false,
      isFinishNode: false,
      isWallNode: false,
      currRow: 0,
      currCol: 0,

    }

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.toggleIsRunning = this.toggleIsRunning.bind(this);
  };


  componentDidMount() {
    const grid = this.getInitialGrid();
    this.setState({ grid });
  }

  toggleIsRunning() {
    this.setState({ isRunning: !this.state.isRunning });
  }


  getInitialGrid = (rowCount = this.state.ROW_COUNT,
    colCount = this.state.COLUMN_COUNT,) => {

    const initialGrid = [];
    for (let row = 0; row < rowCount; row++) {
      const currentRow = [];
      for (let col = 0; col < colCount; col++) {
        currentRow.push(this.createNode(row, col));
      }
      initialGrid.push(currentRow);
    }
    return initialGrid;
  };


  createNode = (row, col) => {

    return {
      row,
      col,
      isStart: row === this.state.START_NODE_ROW && col === this.state.START_NODE_COL,
      isFinish: row === this.state.FINISH_NODE_ROW && col === this.state.FINISH_NODE_COL,
      distance: Infinity,
      distanceToFinishNode: Math.abs(this.state.FINISH_NODE_ROW - row) + Math.abs(this.state.FINISH_NODE_COL - col),
      isVisited: false,
      isWall: false,
      previousNode: null,
      isNode: true
    };

  };


  //check if the grid is clear or not
  isGridClear() {
    for (const row of this.state.grid) {
      for (const node of row) {
        const nodeClassName = document.getElementById(`node-${node.row}-${node.col}`).className;
        if (nodeClassName === "node node-visitied" || nodeClassName === "node node-shortest-path") {
          return false;
        }
      }
      return true;
    }
  }
  //clear grid
  clearGrid() {
    if (!this.state.isRunning) {
      const newGrid = this.state.grid.slice();

      for (const row of newGrid) {
        for (const node of row) {
          const nodeClassName = document.getElementById(`node-${node.row}-${node.col}`).className;

          if (nodeClassName !== "node node-start" && nodeClassName !== "node node-finish") {
            if (node.isWall) {
              node.isWall = false;
            }
            document.getElementById(`node-${node.row}-${node.col}`).className = "node";
            node.isVisited = false;
            node.distance = Infinity;
            node.distanceToFinishNode = Math.abs(node.row - this.state.FINISH_NODE_ROW) + Math.abs(node.col - this.state.FINISH_NODE_COL);
          }
          if (nodeClassName === "node node-start") {
            node.isWall = false;
            node.previousNode = null;
            node.isStart = true;
            node.isVisited = false;
            node.distance = Infinity;
            node.distanceToFinishNode = Math.abs(node.row - this.state.FINISH_NODE_ROW) + Math.abs(node.col - this.state.FINISH_NODE_COL);
          }
          if (nodeClassName === "node node-finish") {
            node.isVisited = false;
            node.distance = Infinity;
            node.distanceToFinishNode = 0;
          }
        }
      }
    }
  }










  handleMouseLeave() {

    if (this.state.isStartNode) {
      const isStartNode = !this.state.isStartNode;
      this.setState({ isStartNode, mouseIsPressed: false });
    } else if (this.state.isFinishNode) {
      const isFinishNode = !this.state.isFinishNode;
      this.setState({ isFinishNode, mouseIsPressed: false });
    } else if (this.state.isWallNode) {
      const isWallNode = !this.state.isWallNode;
      this.setState({ isWallNode, mouseIsPressed: false });
      this.getInitialGrid();
    }

  }

  handleMouseEnter(row, col) {
    //console.log("enter")
    if (!this.state.isRunning) {
      //  console.log("state no running")
      if (this.state.mouseIsPressed) {
        // console.log("mouse pressed")
        const nodeClassName = document.getElementById(`node-${row}-${col}`)
          .className;
        if (this.state.isStartNode) {
          if (nodeClassName !== 'node node-wall') {
            const prevStartNode = this.state.grid[this.state.currRow][
              this.state.currCol
            ];
            prevStartNode.isStart = false;
            document.getElementById(
              `node-${this.state.currRow}-${this.state.currCol}`
            ).className = 'node';

            this.setState({ currRow: row, currCol: col });
            const currStartNode = this.state.grid[row][col];
            currStartNode.isStart = true;
            document.getElementById(`node-${row}-${col}`).className =
              'node node-start';
          }
          this.setState({ START_NODE_ROW: row, START_NODE_COL: col });
        } else if (this.state.isFinishNode) {
          if (nodeClassName !== 'node node-wall') {
            const prevFinishNode = this.state.grid[this.state.currRow][
              this.state.currCol
            ];
            prevFinishNode.isFinish = false;
            document.getElementById(
              `node-${this.state.currRow}-${this.state.currCol}`
            ).className = 'node';

            this.setState({ currRow: row, currCol: col });
            const currFinishNode = this.state.grid[row][col];
            currFinishNode.isFinish = true;
            document.getElementById(`node-${row}-${col}`).className =
              'node node-finish';
          }
          this.setState({ FINISH_NODE_ROW: row, FINISH_NODE_COL: col });
        } else if (this.state.isWallNode) {
          const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
          this.setState({ grid: newGrid });
        }
      }
    }
  }

  handleMouseDown(row, col) {
    console.log("in down")
    if (!this.state.isRunning) {
      console.log("not running")
      if (this.isGridClear()) {
        console.log("grid clear")
        if (
          document.getElementById(`node-${row}-${col}`).className ===
          'node node-start'
        ) {
          this.setState({
            mouseIsPressed: true,
            isStartNode: true,
            currRow: row,
            currCol: col,
          });
        } else if (
          document.getElementById(`node-${row}-${col}`).className ===
          'node node-finish'
        ) {
          this.setState({
            mouseIsPressed: true,
            isFinishNode: true,
            currRow: row,
            currCol: col,
          });
        } else {
          const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
          this.setState({
            grid: newGrid,
            mouseIsPressed: true,
            isWallNode: true,
            currRow: row,
            currCol: col,
          });
        }
      } else {
        this.clearGrid();
      }
    }
  }

  handleMouseUp(row, col) {

    if (!this.state.isRunning) {
      this.setState({ mouseIsPressed: false });
      if (this.state.isStartNode) {
        const isStartNode = !this.state.isStartNode;
        this.setState({ isStartNode, START_NODE_ROW: row, START_NODE_COL: col });
      } else if (this.state.isFinishNode) {
        const isFinishNode = !this.state.isFinishNode;
        this.setState({
          isFinishNode,
          FINISH_NODE_ROW: row,
          FINISH_NODE_COL: col,
        });
      }
      this.getInitialGrid();
    }
  }

  visualize(algo) {
    //creating for two algos
    if (!this.state.isRunning) {
      this.toggleIsRunning();   //now set to run
      //const {grid}=this.state;

    //  console.log(grid);

      //get the start and finish nodes
      let visitedNodesInOrder;
      const startNode=this.state.grid[this.state.START_NODE_ROW][this.state.START_NODE_COL];
      const finishNode=this.state.grid[this.state.FINISH_NODE_ROW][this.state.FINISH_NODE_COL];

      if (algo === "astar") {
        visitedNodesInOrder = AStar(this.state.grid,startNode,finishNode);
      }
      else if (algo === "dijkstra") {
        visitedNodesInOrder = dijkstra(this.state.grid,startNode,finishNode);
      }

      //console.log(visitedNodesInOrder);
      const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
      nodesInShortestPathOrder.push('end');
      this.animate(visitedNodesInOrder, nodesInShortestPathOrder);
    }

    
  }
  animate(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        const nodeClassName = document.getElementById(
          `node-${node.row}-${node.col}`,
        ).className;
        if (
          nodeClassName !== 'node node-start' &&
          nodeClassName !== 'node node-finish'
        ) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-visited';
        }
      }, 10 * i);
    }
  }

 
  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      if (nodesInShortestPathOrder[i] === 'end') {
        setTimeout(() => {
          this.toggleIsRunning();
        }, i * 50);
      } else {
        setTimeout(() => {
          const node = nodesInShortestPathOrder[i];
          const nodeClassName = document.getElementById(
            `node-${node.row}-${node.col}`,
          ).className;
          if (
            nodeClassName !== 'node node-start' &&
            nodeClassName !== 'node node-finish'
          ) {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              'node node-shortest-path';
          }
        }, i * 40);
      }
    }
  }
  render() {
    const { grid, mouseIsPressed } = this.state;
    return (

      <div className="outer-div">
        <Navbar bg="dark" variant="dark">
          <div>
            <Navbar.Brand href="#home" style={{ marginLeft: "50px", fontSize: "30px" }}>
              Path Finder
            </Navbar.Brand>
          </div>
        </Navbar>

        <table className="grid-container" onMouseLeave={() => this.handleMouseLeave()}>
          <tbody className='grid'>
            {grid.map((row, rowIdx) => {
              return (
                <tr key={rowIdx}>
                  {row.map((node, nodeIdx) => {
                    const { row, col, isFinish, isStart, isWall } = node;
                    return (
                      <Node
                        key={nodeIdx}
                        row={row}
                        col={col}
                        isFinish={isFinish}
                        isStart={isStart}
                        isWall={isWall}
                        mouseIsPressed={mouseIsPressed}
                        onMouseEnter={(row, col) => this.handleMouseEnter(row, col)}
                        onMouseUp={(row, col) => this.handleMouseUp(row, col)}
                        onMouseDown={(row, col) => this.handleMouseDown(row, col)} />
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>

        <button type='button' className='btn btn-danger' onClick={() => this.clearGrid()}>Clear Grid</button>
        <button type='button' className='btn btn-danger' onClick={() => this.visualize("astar")}>A Star</button>
        <button type='button' className='btn btn-danger' onClick={() => this.visualize("dijkstra")}>Dijkstra</button>

      </div>

    );


  }





}



const getNewGridWithWallToggled = (grid, row, col) => {

  const newGrid = grid.slice();
  const node = newGrid[row][col];
  if (!node.isStart && !node.isFinish && node.isNode) {
    const newNode = {
      ...node,
      isWall: !node.isWall,
    };
    newGrid[row][col] = newNode;
  }
  return newGrid;
};


function getNodesInShortestPathOrder(finishNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}
