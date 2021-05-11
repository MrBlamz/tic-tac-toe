const game = (function () {
  //
})();

const gameBoard = (function () {
  let board = [null, null, null, null, null, null, null, null, null];
})();

const Player = (name, mark) => {
  const state = {
    name,
    mark,
  };

  return {};
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
