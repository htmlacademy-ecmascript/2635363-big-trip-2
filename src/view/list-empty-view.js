import AbstractView from '../framework/view/abstract-view';

const messages = {
  everything: 'Click New Event to create your first point',
  past: 'There are no past events now',
  present: 'There are no present events now',
  future: 'There are no future events now'
};

export default class ListEmptyView extends AbstractView {
  #filterType;

  constructor(filterType) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return `
      <p class="trip-events__msg">${messages[this.#filterType]}</p>
    `;
  }
}
