const game = (function () {
  const state = {};

  function start(p1, p2) {
    state.player1 = p1;
    state.player2 = p2;
    state.activePlayer = p1;
    state.round = 1;
  }

  function switchActivePlayer() {
    state.activePlayer =
      state.activePlayer === state.player1 ? state.player2 : state.player1;
  }

  function incrementRound() {
    state.round = state.round += 1;
  }

  // Check possible combinations against current player mark and returns a boolean
  function isWinner(mark) {
    let isWinner = false;
    const winCombination = `${mark}${mark}${mark}`;
    const winOptions = {
      1: gameBoard.getTile(0, 1, 2),
      2: gameBoard.getTile(3, 4, 5),
      3: gameBoard.getTile(6, 7, 8),
      4: gameBoard.getTile(0, 3, 6),
      5: gameBoard.getTile(1, 4, 7),
      6: gameBoard.getTile(2, 5, 8),
      7: gameBoard.getTile(0, 4, 8),
      8: gameBoard.getTile(2, 4, 6),
    };

    // Iterate over win options and match each against winner string
    for (const option in winOptions) {
      if (winOptions[option].join("") === winCombination) {
        isWinner = true;
        break;
      }
    }

    return isWinner;
  }

  function playRound(info) {
    // If game has winner stop execution
    if (state.winner) {
      return;
    }

    info.mark = state.activePlayer.getMark();
    const successful = gameBoard.addMark(info);

    if (successful) {
      displayController.render(info);

      if (isWinner(info.mark)) {
        state.winner = state.activePlayer;
        console.log(`Winner: ${state.winner.getName()}`);
        return;
      }

      // If round is 9 and there is no winner means the board is full
      // so it's a tie
      if (state.round === 9) {
        state.winner = "Tie";
        console.log("It's a tie!");
        return;
      }

      incrementRound();
      switchActivePlayer();
      return;
    }
  }

  return {
    start,
    playRound,
  };
})();

const gameBoard = (function () {
  let board = [null, null, null, null, null, null, null, null, null];

  // Adds mark to board and return a boolean
  function addMark(info) {
    if (board[info.index] === null) {
      board[info.index] = info.mark;
      return true;
    }

    return false;
  }

  // Returns an array with the content of board values at parameter indexes
  function getTile(...indexes) {
    return indexes.reduce((result, index) => {
      board[index] === null ? result.push("null") : result.push(board[index]);
      return result;
    }, []);
  }

  return {
    addMark,
    getTile,
  };
})();

const Player = (name, mark) => {
  const state = {
    name: `Player${name}`,
    mark,
  };

  function getMark() {
    return state.mark;
  }

  function getName() {
    return state.name;
  }

  return {
    getMark,
    getName,
  };
};

const displayController = (function () {
  // board Dom elements
  const boardTiles = document.querySelectorAll(".tile");

  function createMarkElement(mark) {
    const element = document.createElement("span");
    element.classList.add("mark");
    element.textContent = mark;
    return element;
  }

  // Renders the gameBoard content
  function render(info) {
    const mark = createMarkElement(info.mark);
    info.tile.appendChild(mark);
  }

  function tileClicked() {
    const info = {
      tile: this,
      index: this.id,
    };

    game.playRound(info);
  }

  //Event Listeners
  boardTiles.forEach((tile) => tile.addEventListener("click", tileClicked));

  return {
    render,
  };
})();

game.start(Player(1, "X"), Player(2, "O"));
