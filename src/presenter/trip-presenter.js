import SortingView from '../view/sorting-view.js';
import EventListView from '../view/event-list-view.js';
import FormNewPointView from '../view/add-new-point-view.js';
import ListEmptyView from '../view/list-empty-view.js';
import LoadingView from '../view/loading-view.js';
import { remove, render, RenderPosition } from '../framework/render.js';
import PointPresenter from './point-presenter.js';
import { filterPoints, sortPoints } from '../utils/points.js';
import { UpdateType } from '../consts/update-type.js';
import { UserAction } from '../consts/user-action.js';


export default class TripPresenter {
  #tripEventsContainer;
  #tripModel;
  #filterModel;

  #pointPresenters = new Map();

  #listEmptyComponent = null;
  #loadingComponent = null;
  #sortingComponent = null;
  #isLoading = true;
  #newEventButton = null;
  #currentSortType = 'day';

  constructor({ tripEventsContainer, pointsModel, filterModel }) {
    this.#tripEventsContainer = tripEventsContainer;

    this.#tripModel = pointsModel;
    this.#filterModel = filterModel;

    this.#tripModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);

    this.allTypes = this.#tripModel.getOffersByType().map((offer) => offer.type);

    this.#onEscCloseNewForm = this.#onEscCloseNewForm.bind(this);
  }

  init() {
    this.#renderSorting();
    this.#initNewEventButton();
    this.#isLoading = true;

    setTimeout(() => {
      this.#isLoading = false;
      this.#renderEventsList();
    }, 500);
  }

  #getFilteredSortedPoints() {
    const currentFilter = this.#filterModel.filter;
    const allPoints = this.#tripModel.getPoints();
    const filtered = filterPoints(allPoints, currentFilter);
    return sortPoints(filtered, this.#currentSortType);
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

    const points = this.#getFilteredSortedPoints();
    if (points.length === 0) {
      this.#listEmptyComponent = new ListEmptyView(this.#filterModel.filter);
      render(this.#listEmptyComponent, listContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    points.forEach((point) => this.#renderPoint(listContainer, point));
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

  #renderSorting() {

    if (this.#sortingComponent) {
      remove(this.#sortingComponent);
    }
    this.#sortingComponent = new SortingView(this.#currentSortType);
    render(this.#sortingComponent, this.#tripEventsContainer, RenderPosition.AFTERBEGIN);

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

  #handlePointChange = (action, updateType, payload) => {
    switch (action) {
      case UserAction.UPDATE_POINT:
        this.#tripModel.updatePoint(updateType, payload);
        break;
      case UserAction.ADD_POINT:
        this.#tripModel.addPoint(updateType, payload);
        break;
      case UserAction.DELETE_POINT:
        this.#tripModel.deletePoint(updateType, payload);
        break;
      default:
        throw new Error(`неизвестное действие в #handlePointChange: ${action}`);
    }
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #initNewEventButton() {
    this.#newEventButton = document.querySelector('.trip-main__event-add-btn');
    if (this.#newEventButton) {
      this.#newEventButton.addEventListener('click', this.#handleNewEventClick);
    }
  }

  #handleNewEventClick = () => {
    // this.#clearPointPresenters();
    this.#handleModeChange();

    this.#filterModel.setFilter(UpdateType.MAJOR, 'everything');
    this.#currentSortType = 'day';
    this.#renderSorting();

    this.#newEventButton.disabled = true;

    const newPoint = {
      id: `tmp-${Date.now()}`, // временный id
      type: this.allTypes[0],
      destination: this.#tripModel.getDestinations()[0],
      dateFrom: new Date(),
      dateTo: new Date(),
      basePrice: 0,
      offers: [],
      isFavorite: false
    };

    const formComponent = new FormNewPointView({
      point: newPoint,
      destinations: this.#tripModel.getDestinations(),
      offers: this.#tripModel.getOffersByType()
    });

    render(formComponent, this.#tripEventsContainer.querySelector('.trip-events__list'), RenderPosition.AFTERBEGIN);


    const closeForm = () => {
      formComponent.element.remove();
      this.#newEventButton.disabled = false;
      this.#removeEscHandler();
    };

    // при сабмите формы — добавлиние в модель
    formComponent.setFormSubmitHandler((point) => {
      this.#tripModel.addPoint(UpdateType.MINOR, point);
      closeForm();
    });

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

  #handleModelEvent = (updateType) => {
    if (updateType === UpdateType.MAJOR) {
      this.#currentSortType = 'day';
      this.#renderSorting();
    }
    this.#clearPointPresenters();
    this.#renderEventsList();
  };
}
