const game = (function () {
  const state = {};

  function start(p1, p2) {
    state.player1 = p1;
    state.player2 = p2;
    drawStartingPlayer(p1, p2);
    setStartingRound();
    displayController.renderActivePlayer(getActivePlayerName());
    activePlayerIsComputer() ? triggerComputerPlay() : false;
  }

  function restart() {
    setStartingRound();
    drawStartingPlayer(state.player1, state.player2);
    removePreviousWinner();
    gameBoard.clear();
    displayController.renderActivePlayer(getActivePlayerName());
    activePlayerIsComputer() ? triggerComputerPlay() : false;
  }

  function drawStartingPlayer(p1, p2) {
    const players = [p1, p2];
    const rnd = Math.floor(Math.random() * 2);
    state.activePlayer = players[rnd];
  }

  function activePlayerIsComputer() {
    return getActivePlayerName().includes("Computer");
  }

  function triggerComputerPlay() {
    // Gives one second delay to prevent instant AI play
    // (active player DOM element does not update otherwise)
    setTimeout(() => {
      state.activePlayer.play();
    }, 1000);
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

      if (gameBoard.hasWinner(info.mark)) {
        setWinner(state.activePlayer);
        displayController.renderResultsModal(`${getWinnerName()} wins`);
        return;
      }

      // If round is 9 and there is no winner means the board is full
      // so it's a tie
      if (isLastRound()) {
        setWinner("Tie");
        displayController.renderResultsModal("It's a tie");
        return;
      }

      incrementRound();
      switchActivePlayer();
      displayController.renderActivePlayer(getActivePlayerName());
      activePlayerIsComputer() ? triggerComputerPlay() : false;
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

  // Check possible combinations against current player mark and returns a boolean
  function hasWinner(mark) {
    let isWinner = false;
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
        isWinner = true;
        break;
      }
    }

    return isWinner;
  }

  // Returns an array with the content of board values at parameter indexes
  function getPosition(...indexes) {
    return indexes.reduce((result, index) => {
      board[index] === null ? result.push("null") : result.push(board[index]);
      return result;
    }, []);
  }

  function getEmptyPositions() {
    return board.reduce((result, value, index) => {
      if (value === null) {
        result.push(index);
      }
      return result;
    }, []);
  }

  function clear() {
    board = [null, null, null, null, null, null, null, null, null];
  }

  return {
    addMark,
    getPosition,
    getEmptyPositions,
    clear,
    hasWinner,
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

  function play() {
    const availablePositions = gameBoard.getEmptyPositions();
    // Select a random empty position
    const position = Math.floor(Math.random() * availablePositions.length);
    const choice = availablePositions[position];
    // Clicks the tile to make a play
    displayController.getTile(choice).click();
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

game.start(Player("Player 1", "X"), Computer("Computer", "O"));
