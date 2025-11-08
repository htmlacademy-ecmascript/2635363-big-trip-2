import FilterView from '../view/filter-view.js';
import SortingView from '../view/sorting-view.js';
import EventListView from '../view/event-list-view.js';
import FormNewPointView from '../view/add-new-point-view.js';
import ListEmptyView from '../view/list-empty-view.js';
import LoadingView from '../view/loading-view.js';
import { remove, render, RenderPosition } from '../framework/render.js';
import TripModel from '../model/points-model.js';
import PointPresenter from './point-presenter.js';
import { filterPoints, sortPoints } from '../utils/points.js';

export default class TripPresenter {
  #tripControlsContainer;
  #tripEventsContainer;
  #tripModel;
  #pointPresenters = new Map();

  #listEmptyComponent = null;
  #loadingComponent = null;
  #filterComponent = null;
  #sortingComponent = null;
  #currentFilter = 'everything';
  #isLoading = true;
  #newEventButton = null;
  #currentSortType = 'day';

  constructor({ tripControlsContainer, tripEventsContainer }) {
    this.#tripControlsContainer = tripControlsContainer;
    this.#tripEventsContainer = tripEventsContainer;
    this.#tripModel = new TripModel();
    this.allTypes = this.#tripModel.getOffersByType().map((offer) => offer.type);

    this.#onEscCloseNewForm = this.#onEscCloseNewForm.bind(this);
  }

  init() {
    this.#renderFilters();
    this.#renderSorting();
    this.#initNewEventButton();
    this.#isLoading = true;

    setTimeout(() => {
      this.#isLoading = false;
      this.#renderEventsList();
    }, 500);
  }

  #renderEventsList() {
    this.#clearEventsContainer();
    const eventsListComponent = new EventListView();
    render(eventsListComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);
    const listContainer = eventsListComponent.element;

    if (this.#isLoading) {
      this.#loadingComponent = new LoadingView();
      render(this.#loadingComponent, listContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    const filteredPoints = filterPoints(this.#tripModel.getPoints(), this.#currentFilter);
    if (filteredPoints.length === 0) {
      this.#listEmptyComponent = new ListEmptyView(this.#currentFilter);
      render(this.#listEmptyComponent, listContainer, RenderPosition.AFTERBEGIN);
      return;
    }
    const sortedPoints = sortPoints(filteredPoints, this.#currentSortType);
    sortedPoints.forEach((point) => this.#renderPoint(listContainer, point));
  }

  #renderPoint(container, point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: container,
      tripModel: this.#tripModel,
      onDataChange: this.#handlePointChange,
      onModeChange: this.#handleModeChange
    });

    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderFilters() {
    if (this.#filterComponent) {
      remove(this.#filterComponent);
    }
    this.#filterComponent = new FilterView({ currentFilter: this.#currentFilter });
    render(this.#filterComponent, this.#tripControlsContainer, RenderPosition.BEFOREEND);
    this.#filterComponent.setFilterChangeHandler((filter) => {
      this.#currentFilter = filter;
      this.#clearPointPresenters();
      this.#renderEventsList();
    });
  }

  #renderSorting() {

    if (this.#sortingComponent) {
      remove(this.#sortingComponent);
    }
    this.#sortingComponent = new SortingView(this.#currentSortType);
    render(this.#sortingComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);

    this.#sortingComponent.setSortChangeHandler(this.#handleSortChange);
  }

  #handleSortChange = (sortType) => {
    if (sortType === this.#currentSortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#clearPointPresenters();
    this.#renderEventsList();
  };

  #clearEventsContainer() {
    this.#clearPointPresenters();
    remove(this.#loadingComponent);
    remove(this.#listEmptyComponent);
    this.#loadingComponent = null;
    this.#listEmptyComponent = null;
  }

  #clearPointPresenters() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #handlePointChange = (updatedPoint) => {
    this.#tripModel.updatePoint(updatedPoint);
    const presenter = this.#pointPresenters.get(updatedPoint.id);
    if (presenter) {
      presenter.init(updatedPoint);
    }
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #initNewEventButton() {
    this.#newEventButton = document.querySelector('.trip-main__event-add-btn');
    this.#newEventButton.addEventListener('click', this.#handleNewEventClick);
  }

  #handleNewEventClick = () => {
    this.#newEventButton.disabled = true;

    const newPoint = {
      id: 'new',
      type: this.allTypes[0],
      destination: '',
      dateFrom: new Date(),
      dateTo: new Date(),
      basePrice: 0,
      offers: [],
      isFavorite: false
    };

    const formComponent = new FormNewPointView({
      point: newPoint,
      destinations: this.#tripModel.getDestinations(),
      offers: this.#tripModel.getOffersForType(newPoint.type)
    });

    render(formComponent, this.#tripEventsContainer.querySelector('.trip-events__list'), RenderPosition.AFTERBEGIN);


    const closeForm = () => {
      formComponent.element.remove();
      this.#newEventButton.disabled = false;
      this.#removeEscHandler();
    };

    formComponent.setFormSubmitHandler(closeForm);
    formComponent.setCancelClickHandler(closeForm);
    formComponent.setCloseClickHandler(closeForm);

    this.#addEscHandlerForNewForm(closeForm);
  };

  #addEscHandlerForNewForm(closeCb) {
    this._closeNewFormCb = closeCb;
    document.addEventListener('keydown', this.#onEscCloseNewForm);
  }

  #removeEscHandler() {
    document.removeEventListener('keydown', this.#onEscCloseNewForm);
    this._closeNewFormCb = null;
  }

  #onEscCloseNewForm = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this._closeNewFormCb?.();
    }
  };
}
