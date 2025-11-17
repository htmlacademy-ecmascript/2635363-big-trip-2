import FilterView from '../view/filter-view.js';
import { render, replace, remove, RenderPosition } from '../framework/render.js';
import { UpdateType } from '../consts/update-type.js';

export default class FilterPresenter {
  #filterContainer = null;
  #filterModel = null;
  #pointsModel = null;

  #filterComponent = null;

  constructor({ filterContainer, filterModel, pointsModel }) {
    this.#filterContainer = filterContainer;
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;

    this.#filterModel.addObserver(this.#handleModelEvent);
    this.#pointsModel.addObserver(this.#handleModelEvent);
  }

  init() {
    const currentFilter = this.#filterModel.filter;

    const prevComponent = this.#filterComponent;

    this.#filterComponent = new FilterView({ currentFilter });

    this.#filterComponent.setFilterChangeHandler((filter) => {
      this.#filterModel.setFilter(UpdateType.MAJOR, filter);
    });

    if (prevComponent === null) {
      render(this.#filterComponent, this.#filterContainer, RenderPosition.BEFOREEND);
    } else {
      replace(this.#filterComponent, prevComponent);
      remove(prevComponent);
    }
  }

  #handleModelEvent = () => {
    this.init();
  };
}
