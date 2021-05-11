const game = (function () {
  let player1;
  let player2;
  let activePlayer;

  function start(p1, p2) {
    player1 = p1;
    player2 = p2;
    activePlayer = player1;
  }

  function switchActivePlayer() {
    activePlayer = activePlayer === player1 ? player2 : player1;
  }

  function playRound(info) {
    info.mark = activePlayer.getMark();
    const successful = gameBoard.addMark(info);

    if (successful) {
      displayController.render(info);
      switchActivePlayer();
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

  return {
    addMark,
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

  return {
    getMark,
  };
};

const displayController = (function () {
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

  return {
    render,
  };
})();

// Listen for click events on the Board
const boardListener = (function () {
  // board Dom elements
  const tiles = document.querySelectorAll(".tile");
  let subscribers = [];

  function subscribe(fn) {
    subscribers.push(fn);
  }

  function unsubscribe(fnToRemove) {
    const index = subscribers.indexOf(fnToRemove);
    if (index >= 0) {
      subscribers.splice(index, 1);
    }
  }

  function notifyAll() {
    console.log(`Notifying --> ${subscribers.length} subscribers`);

    const info = {
      tile: this,
      index: this.id,
    };

    for (const fn of subscribers) {
      fn(info);
    }
  }

  tiles.forEach((tile) => tile.addEventListener("click", notifyAll));

  return {
    subscribe,
    unsubscribe,
  };
})();

const player1 = Player(1, "X");
const player2 = Player(2, "O");

game.start(player1, player2);
boardListener.subscribe(game.playRound);
