import Observable from '../framework/observable.js';

export const filterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past'
};

export default class FilterModel extends Observable {
  #filter = filterType.EVERYTHING;

  get filter() {
    return this.#filter;
  }

  setFilter(updateType, newFilter) {
    if (this.#filter === newFilter) {
      return;
    }

    this.#filter = newFilter;
    this._notify(updateType, newFilter);
  }
}
