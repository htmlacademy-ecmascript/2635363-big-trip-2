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
  #pointModel;
  #filterModel;
  #eventListComponent = null;

  #pointPresenters = new Map();

  #listEmptyComponent = null;
  #loadingComponent = null;
  #sortingComponent = null;
  #isLoading = true;
  #newEventButton = null;
  #currentSortType = 'day';

  constructor({ tripEventsContainer, pointsModel, filterModel }) {
    this.#tripEventsContainer = tripEventsContainer;

    this.#pointModel = pointsModel;
    this.#filterModel = filterModel;

    this.#pointModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);

    this.allTypes = this.#pointModel.getOffersByType().map((offer) => offer.type);

    this.#onEscCloseNewForm = this.#onEscCloseNewForm.bind(this);
  }

  init() {
    this.#renderSorting();
    this.#initNewEventButton();

    if (!this.#eventListComponent) {
      this.#eventListComponent = new EventListView();
      render(this.#eventListComponent, this.#tripEventsContainer);
    }

    if (this.#isLoading) {
      this.#loadingComponent = new LoadingView();
      render(this.#loadingComponent, this.#eventListComponent.element);
    }

    this.#renderEventsList();
  }

  #getFilteredSortedPoints() {
    const currentFilter = this.#filterModel.filter;
    const allPoints = this.#pointModel.getPoints();
    const filtered = filterPoints(allPoints, currentFilter);
    return sortPoints(filtered, this.#currentSortType);
  }

  #renderEventsList() {
    this.#clearEventsContainer();

    const listContainer = this.#eventListComponent.element;

    if (this.#isLoading) {
      this.#loadingComponent = new LoadingView();
      render(this.#loadingComponent, listContainer);
      return;
    }

    const points = this.#getFilteredSortedPoints();

    if (points.length === 0) {
      this.#listEmptyComponent = new ListEmptyView(this.#filterModel.filter);
      render(this.#listEmptyComponent, listContainer);
      return;
    }

    points.forEach((point) => this.#renderPoint(listContainer, point));
  }

  #renderPoint(container, point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: container,
      pointModel: this.#pointModel,
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

    if (!this.#eventListComponent?.element) {
      return;
    }
    this.#eventListComponent.element.innerHTML = '';

    remove(this.#loadingComponent);
    remove(this.#listEmptyComponent);

    this.#loadingComponent = null;
    this.#listEmptyComponent = null;
  }

  #clearPointPresenters() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #handlePointChange = async (action, updateType, payload) => {
    switch (action) {
      case UserAction.UPDATE_POINT: {
        try {
          await this.#pointModel.updatePoint(updateType, payload);
        } catch (err) {
          const presenter = this.#pointPresenters.get(payload.id);
          presenter?.setAborting();
        }
        break;
      }

      case UserAction.ADD_POINT: {
        try {
          await this.#pointModel.addPoint(updateType, payload);
        } catch (err) {
          throw new Error('Не удалось добавить точку на сервер');
        }
        break;
      }

      case UserAction.DELETE_POINT: {
        try {
          await this.#pointModel.deletePoint(updateType, payload);
        } catch (err) {
          const presenter = this.#pointPresenters.get(payload);
          presenter?.setAborting();
        }
        break;
      }
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
    this.#handleModeChange();

    this.#filterModel.setFilter(UpdateType.MAJOR, 'everything');
    this.#currentSortType = 'day';
    this.#renderSorting();

    this.#newEventButton.disabled = true;

    const newPoint = {
      id: `tmp-${Date.now()}`,
      type: this.allTypes[0],
      destination: this.#pointModel.getDestinations()[0],
      dateFrom: new Date(),
      dateTo: new Date(),
      basePrice: 0,
      offers: [],
      isFavorite: false
    };

    const formComponent = new FormNewPointView({
      point: newPoint,
      destinations: this.#pointModel.getDestinations(),
      offers: this.#pointModel.getOffersByType()
    });

    render(formComponent, this.#tripEventsContainer.querySelector('.trip-events__list'), RenderPosition.AFTERBEGIN);


    const closeForm = () => {
      formComponent.element.remove();
      this.#newEventButton.disabled = false;
      this.#removeEscHandler();
    };


    formComponent.setFormSubmitHandler(async (point) => {
      this.#newEventButton.disabled = true;
      formComponent.updateElement({ isDisabled: true, isSaving: true });

      try {
        await this.#pointModel.addPoint(UpdateType.MINOR, point);
        closeForm();
      } catch (err) {
        formComponent.shake(() => {
          formComponent.updateElement({ isDisabled: false, isSaving: false });
          this.#newEventButton.disabled = false;
        });
      }
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
    if (!this.#eventListComponent) {
      this.#eventListComponent = new EventListView();
      render(this.#eventListComponent, this.#tripEventsContainer);
    }

    switch (updateType) {
      case UpdateType.INIT:
        this.#isLoading = false;
        this.#clearPointPresenters();
        this.#renderEventsList();
        break;

      case UpdateType.MAJOR:
        this.#currentSortType = 'day';
        this.#renderSorting();
        this.#clearPointPresenters();
        this.#renderEventsList();
        break;

      default:
        this.#clearPointPresenters();
        this.#renderEventsList();
        break;
    }
  };
}
