import AbstractView from '../framework/view/abstract-view.js';

function createSortingTemplate(currentSortType) {
  return `
  <form class="trip-events__trip-sort  trip-sort" action="#" method="get">
    ${['day', 'event', 'time', 'price', 'offer'].map((type) => `
      <div class="trip-sort__item  trip-sort__item--${type}">
        <input
          id="sort-${type}"
          class="trip-sort__input  visually-hidden"
          type="radio"
          name="trip-sort"
          value="${type}"
          ${type === currentSortType ? 'checked' : ''}
          ${type === 'event' || type === 'offer' ? 'disabled' : ''}
        >
        <label class="trip-sort__btn" for="sort-${type}" data-sort-type="${type}">
          ${type[0].toUpperCase() + type.slice(1)}
        </label>
      </div>
    `).join('')}
  </form>
  `;
}

export default class SortingView extends AbstractView {
  #currentSortType = null;
  #handleSortChange = null;

  constructor(currentSortType) {
    super();
    this.#currentSortType = currentSortType;
  }

  get template() {
    return createSortingTemplate(this.#currentSortType);
  }

  setSortChangeHandler(callback) {
    this.#handleSortChange = callback;
    this.element.addEventListener('click', this.#onSortChange);
  }

  #onSortChange = (evt) => {
    if (evt.target.tagName !== 'LABEL') {
      return;
    }
    const sortType = evt.target.dataset.sortType;
    if (sortType === this.#currentSortType) {
      return;
    }
    this.#handleSortChange(sortType);
  };
}
