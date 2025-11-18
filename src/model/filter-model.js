import Observable from '../framework/observable.js';
import { filterPoints } from '../utils/points';

export default class FilterModel extends Observable {
  #filter = filterPoints([], 'everything');

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
