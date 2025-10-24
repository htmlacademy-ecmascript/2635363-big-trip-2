import FilterView from '../view/filter-view.js';
import SortingView from '../view/sorting-view.js';
import EventListView from '../view/event-list-view.js';
import EventItemView from '../view/event-item-view.js';
import ListEmptyView from '../view/list-empty-view.js';
import FormEditPointView from '../view/form-edit-point-view.js';
import LoadingView from '../view/loading-view';
import { render, RenderPosition, replace } from '../framework/render.js';
import TripModel from '../model/points-model.js';
import points from '../mock/points.js';
import destinations from '../mock/destination.js';
import offersByType from '../mock/offer.js';

const allTypes = offersByType.map((offer) => offer.type);

export default class TripPresenter {
  #tripControlsContainer;
  #tripEventsContainer;
  #tripModel;
  #listEmptyComponent = null;
  #newPointFormComponent = null;
  #currentFilter = 'everything';
  #loadingComponent = null;
  #isLoading = true;

  constructor({ tripControlsContainer, tripEventsContainer }) {
    this.#tripControlsContainer = tripControlsContainer;
    this.#tripEventsContainer = tripEventsContainer;
    this.#tripModel = new TripModel({ points, destinations, offersByType });
  }

  init() {
    this.renderFilters();
    this.renderSorting();
    this.renderEventsList();
    this._initNewEventButton();
    // симуляция загрузки
    setTimeout(() => {
      this.#isLoading = false;
      this.renderEventsList();
    }, 500);
  }

  renderFilters() {
    const filterComponent = new FilterView();
    render(filterComponent, this.#tripControlsContainer, RenderPosition.BEFOREEND);

    filterComponent.setFilterChangeHandler((selectedFilter) => {
      this.#currentFilter = selectedFilter;
      this.renderEventsList();
    });
  }

  renderSorting() {
    const sortingComponent = new SortingView();
    render(sortingComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);
  }

  _initNewEventButton() {
    const newEventButton = document.querySelector('.trip-main__event-add-btn');
    newEventButton.addEventListener('click', this.#handleNewEventClick);
  }

  #handleNewEventClick = () => {
    if (this.#newPointFormComponent) {
      return;
    }

    const newPoint = {
      id: 'new',
      type: allTypes[0],
      destination: { name: '', description: '' },
      dateFrom: new Date(),
      dateTo: new Date(),
      basePrice: '',
      offers: [],
      isFavorite: false
    };

    this.#newPointFormComponent = new FormEditPointView({
      point: newPoint,
      destination: newPoint.destination,
      offers: [],
      allTypes
    });

    const eventsListElement = this.#tripEventsContainer.querySelector('.trip-events__list');
    render(this.#newPointFormComponent, eventsListElement, RenderPosition.AFTERBEGIN);

    const onEscKeyDown = (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        this.#removeNewPointForm();
        document.removeEventListener('keydown', onEscKeyDown);
      }
    };

    this.#newPointFormComponent.setFormSubmitHandler((evt) => {
      evt.preventDefault();
      this.#removeNewPointForm();
      document.removeEventListener('keydown', onEscKeyDown);
    });

    this.#newPointFormComponent.setCollapseClickHandler(() => {
      this.#removeNewPointForm();
      document.removeEventListener('keydown', onEscKeyDown);
    });

    document.addEventListener('keydown', onEscKeyDown);
  };

  #removeNewPointForm() {
    if (this.#newPointFormComponent) {
      this.#newPointFormComponent.element.remove();
      this.#newPointFormComponent = null;
    }
  }

  _removeComponent(component) {
    if (!component) {
      return;
    }

    if (typeof component.remove === 'function') {
      component.remove();
    } else if (component instanceof Element) {
      component.remove();
    } else if (component.element instanceof Element) {
      component.element.remove();
    }
  }


  _clearEventsContainer() {
    this.#tripEventsContainer.innerHTML = '';

    this._removeComponent(this.#loadingComponent);
    this._removeComponent(this.#listEmptyComponent);

    this.#loadingComponent = null;
    this.#listEmptyComponent = null;
  }


  renderEventsList() {
    this._clearEventsContainer();

    const eventsListComponent = new EventListView();
    render(eventsListComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);
    const eventListContainer = eventsListComponent.element;

    if (this.#isLoading) {
      this.#loadingComponent = new LoadingView();
      render(this.#loadingComponent, eventListContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    if (!this.#tripModel.getPoints().length) {
      this.#listEmptyComponent = new ListEmptyView(this.#currentFilter);
      render(this.#listEmptyComponent, eventListContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    const now = new Date();
    const allPoints = this.#tripModel.getPoints();
    const tripPoints = allPoints.filter((point) => {
      switch (this.#currentFilter) {
        case 'everything':
          return true;
        case 'future':
          return new Date(point.dateFrom) > now;
        case 'present':
          return new Date(point.dateFrom) <= now && new Date(point.dateTo) >= now;
        case 'past':
          return new Date(point.dateTo) < now;
        default:
          return true;
      }
    });

    if (tripPoints.length === 0) {
      this.#listEmptyComponent = new ListEmptyView(this.#currentFilter);
      render(this.#listEmptyComponent, eventListContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    tripPoints.forEach((point) => {
      const destination = point.destination;
      const offers = point.offers;

      const eventItemComponent = new EventItemView({ point, destination, offers });
      const formEditPointComponent = new FormEditPointView({ point, destination, offers, allTypes });

      render(eventItemComponent, eventListContainer, RenderPosition.BEFOREEND);

      const onEscKeyDown = (evt) => {
        if (evt.key === 'Escape' || evt.key === 'Esc') {
          replace(formEditPointComponent, eventItemComponent);
          document.removeEventListener('keydown', onEscKeyDown);
        }
      };

      eventItemComponent.setExpandClickHandler(() => {
        replace(formEditPointComponent, eventItemComponent);
        document.addEventListener('keydown', onEscKeyDown);
      });

      formEditPointComponent.setFormSubmitHandler((evt) => {
        evt.preventDefault();
        replace(eventItemComponent, formEditPointComponent);
        document.removeEventListener('keydown', onEscKeyDown);
      });

      formEditPointComponent.setCollapseClickHandler(() => {
        replace(eventItemComponent, formEditPointComponent);
        document.removeEventListener('keydown', onEscKeyDown);
      });
    });
  }
}
