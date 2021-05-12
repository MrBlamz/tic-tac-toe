const game = (function () {
  const state = {};

  function start(p1, p2) {
    state.player1 = p1;
    state.player2 = p2;
    state.activePlayer = p1;
    state.round = 1;
  }

  function restart() {
    state.round = 1;
    state.activePlayer = state.player1;
    state.winner = null;
    gameBoard.clear();
    displayController.renderActivePlayer(state.activePlayer.getName());
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
      displayController.renderBoard(info);

      if (isWinner(info.mark)) {
        state.winner = state.activePlayer;
        displayController.renderResultsModal(`${state.winner.getName()} wins`);
        return;
      }

      // If round is 9 and there is no winner means the board is full
      // so it's a tie
      if (state.round === 9) {
        state.winner = "Tie";
        displayController.renderResultsModal("It's a tie");
        return;
      }

      incrementRound();
      switchActivePlayer();
      displayController.renderActivePlayer(state.activePlayer.getName());
      return;
    }
  }

  return {
    start,
    playRound,
    restart,
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

  function clear() {
    board = [null, null, null, null, null, null, null, null, null];
  }

  return {
    addMark,
    getTile,
    clear,
  };
})();

const Player = (name, mark) => {
  const state = {
    name: `Player ${name}`,
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
  // Board DOM elements
  const boardTiles = document.querySelectorAll(".tile");
  // Active player element
  const activePlayerElement = document.getElementById("active-player");
  // Modal element that displays the winner
  const modal = document.getElementById("results-modal");
  // Element that display the winner inside the modal
  const winnerElement = document.getElementById("winner");
  // Button inside modal that restarts game
  const playAgainBtn = document.getElementById("play-again");
  // Elements to blur on modal popup
  const header = document.getElementsByTagName("header")[0];
  const main = document.getElementsByTagName("main")[0];

  function createMarkElement(mark) {
    const element = document.createElement("span");
    element.classList.add("mark");
    element.textContent = mark;
    return element;
  }

  // Renders the gameBoard content
  function renderBoard(info) {
    const mark = createMarkElement(info.mark);
    info.tile.appendChild(mark);
  }

  function clearBoard() {
    boardTiles.forEach((tile) => {
      tile.innerHTML = "";
    });
  }

  // Updates the active player
  function renderActivePlayer(name) {
    activePlayerElement.textContent = `${name} turn`;
  }

  // Renders the winner
  function renderResultsModal(text) {
    winnerElement.textContent = text;
    modal.style.display = "block";
    addBlur(header);
    addBlur(main);
  }

  // Hides the results modal
  function disableResultsModal() {
    modal.style.display = "none";
    addBlur(header, "0px");
    addBlur(main, "0px");
  }

  function addBlur(element, amount = "4px") {
    element.style.filter = `blur(${amount})`;
  }

  function tileClicked() {
    const info = {
      tile: this,
      index: this.id,
    };

    game.playRound(info);
  }

  function restart() {
    game.restart();
    clearBoard();
    disableResultsModal();
  }

  //Event Listeners
  boardTiles.forEach((tile) => tile.addEventListener("click", tileClicked));
  playAgainBtn.addEventListener("click", restart);

  return {
    renderBoard,
    renderActivePlayer,
    renderResultsModal,
  };
})();

game.start(Player(1, "X"), Player(2, "O"));
