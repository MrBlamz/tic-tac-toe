const game = (function () {
  const state = {};

  function start(p1, p2) {
    state.player1 = p1;
    state.player2 = p2;
    drawStartingPlayer(p1, p2);
    setStartingRound();
    displayController.renderActivePlayer(getActivePlayerName());
    activePlayerIsComputer() ? triggerComputerPlay(100) : false;
  }

  function restart() {
    setStartingRound();
    drawStartingPlayer(state.player1, state.player2);
    removePreviousWinner();
    gameBoard.clear();
    displayController.renderActivePlayer(getActivePlayerName());
    activePlayerIsComputer() ? triggerComputerPlay(100) : false;
  }

  function drawStartingPlayer(p1, p2) {
    const players = [p1, p2];
    const rnd = Math.floor(Math.random() * 2);
    state.activePlayer = players[rnd];
  }

  function activePlayerIsComputer() {
    return getActivePlayerName().includes("Computer");
  }

  // If no timeout is given and AI is first playing the page freezes on loading
  // while AI is calculating the best move
  function triggerComputerPlay(timeout) {
    setTimeout(() => {
      state.activePlayer.play();
    }, timeout);
  }

  function switchActivePlayer() {
    state.activePlayer =
      state.activePlayer === state.player1 ? state.player2 : state.player1;
  }

  function getActivePlayerName() {
    return state.activePlayer.getName();
  }

  function getActivePlayerMark() {
    return state.activePlayer.getMark();
  }

  function setWinner(winner) {
    state.winner = winner;
  }

  function getWinnerName() {
    return state.winner.getName();
  }

  function removePreviousWinner() {
    state.winner = null;
  }

  function setStartingRound() {
    state.round = 1;
  }

  function incrementRound() {
    state.round = state.round += 1;
  }

  function isLastRound() {
    return state.round === 9;
  }

  function playRound(info) {
    // If game has winner stop execution
    if (state.winner) {
      return;
    }

    info.mark = getActivePlayerMark();
    const successful = gameBoard.addMark(info);

    if (successful) {
      displayController.renderBoard(info);

      if (gameBoard.isTerminalState(info.mark)) {
        setWinner(state.activePlayer);
        displayController.renderResultsModal(`${getWinnerName()} wins`);
        return;
      }

      if (isLastRound()) {
        setWinner("Tie");
        displayController.renderResultsModal("It's a tie");
        return;
      }

      incrementRound();
      switchActivePlayer();
      displayController.renderActivePlayer(getActivePlayerName());
      activePlayerIsComputer() ? triggerComputerPlay(1000) : false;
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
      // Successfully added the player mark
      return true;
    }

    // Chosen position is already filled
    return false;
  }

  // Returns true if board has winner and false otherwise
  function isTerminalState(mark) {
    let hasWinner = false;
    const winCombination = `${mark}${mark}${mark}`;
    const winOptions = {
      1: getPosition(0, 1, 2),
      2: getPosition(3, 4, 5),
      3: getPosition(6, 7, 8),
      4: getPosition(0, 3, 6),
      5: getPosition(1, 4, 7),
      6: getPosition(2, 5, 8),
      7: getPosition(0, 4, 8),
      8: getPosition(2, 4, 6),
    };

    // Iterate over win options and match each against winner string
    for (const option in winOptions) {
      if (winOptions[option].join("") === winCombination) {
        hasWinner = true;
        break;
      }
    }

    return hasWinner;
  }

  // Returns an array with the content of board values at parameter indexes
  function getPosition(...indexes) {
    return indexes.reduce((result, index) => {
      board[index] === null ? result.push("null") : result.push(board[index]);
      return result;
    }, []);
  }

  // Returns index of the board which have no player mark
  function getEmptyPositions() {
    return board.reduce((result, value, index) => {
      if (value === null) {
        result.push(index);
      }
      return result;
    }, []);
  }

  // Return board
  function getBoard() {
    return board;
  }

  // Fill the array with null (Initial state)
  function clear() {
    board = Array(9).fill(null);
  }

  return {
    addMark,
    getPosition,
    getEmptyPositions,
    clear,
    isTerminalState,
    getBoard,
  };
})();

const Player = (name, mark) => {
  const state = {
    name,
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

function Computer(name, mark) {
  const prototype = Player(name, mark);

  function terminalState() {
    if (gameBoard.isTerminalState("X")) {
      return { score: -10 };
    }

    if (gameBoard.isTerminalState("O")) {
      return { score: 10 };
    }
  }

  function hasMovesLeft(arr) {
    return arr.length > 0 ? true : false;
  }

  function minimax(board, mark, depth, isMax) {
    let availablePositions = gameBoard.getEmptyPositions();
    const isTerminal = terminalState(depth);

    // Return score if a winner is found
    if (isTerminal) {
      return isTerminal;
    }

    // Return if no moves left (Tie = 0)
    if (!hasMovesLeft(availablePositions)) {
      return { score: 0 };
    }

    // Store all available possible moves
    let moves = [];

    // Iterate over each possible empty position on the board
    for (let i = 0; i < availablePositions.length; i++) {
      // Creates a move object
      let move = {};
      // Add an index prop to move obj
      move.index = availablePositions[i];

      // Place the player mark on the board
      board[availablePositions[i]] = mark;

      // Calculate all possible game results based on the mark placed previously
      if (mark === "O") {
        let result = minimax(board, "X", depth + 1, false);
        // Add prop to move obj with the heuristics move score
        move.score = result.score - depth;
      } else {
        let result = minimax(board, "O", depth + 1, true);
        move.score = result.score + depth;
      }

      // Remove previous placed player mark from the board
      board[availablePositions[i]] = null;

      // Add the move obj to the moves variable
      moves.push(move);
    }

    // Variable that stores index of the best move
    let bestMove;

    // If the active player is the AI (Chooses the higher score)
    if (isMax) {
      let bestScore = -1000;
      // Iterate over all previous calculated moves
      for (let i = 0; i < moves.length; i++) {
        // If the current score is higher than previous best score store it
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }

    // If the active player is opponent (Chooses the lower score)
    if (!isMax) {
      let bestScore = 1000;
      for (let i = 0; i < moves.length; i++) {
        // If the current score is lower than previous best score store it
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }

    // Return the position of the board which is the best move
    return moves[bestMove];
  }

  function play() {
    let bestMove = minimax(gameBoard.getBoard(), "O", 0, true);
    displayController.getTile(bestMove.index).click();
  }

  return Object.assign({}, prototype, { play });
}

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
    activePlayerElement.textContent = `${name}'s turn`;
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

  function getTile(index) {
    return boardTiles[index];
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
    getTile,
  };
})();

game.start(Player("Player", "X"), Computer("Computer", "O"));
