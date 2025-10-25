import FilterView from '../view/filter-view.js';
import SortingView from '../view/sorting-view.js';
import EventListView from '../view/event-list-view.js';
import EventItemView from '../view/event-item-view.js';
import ListEmptyView from '../view/list-empty-view.js';
import FormEditPointView from '../view/form-edit-point-view.js';
import LoadingView from '../view/loading-view';
import formView from '../view/form-edit-point-view';
import AddNewPointWithoutOffersView from '../view/add-new-point-without-offers-view';
import AddNewPointWithoutDestinationView from '../view/add-new-point-without-destination-view';
import { render, RenderPosition, replace } from '../framework/render.js';
import TripModel from '../model/points-model.js';

export default class TripPresenter {
  #tripControlsContainer;
  #tripEventsContainer;
  #tripModel;

  #listEmptyComponent = null;
  #newPointFormComponent = null;
  #loadingComponent = null;
  #filterComponent = null;

  #currentFilter = 'everything';
  #isLoading = true;

  constructor({ tripControlsContainer, tripEventsContainer }) {
    this.#tripControlsContainer = tripControlsContainer;
    this.#tripEventsContainer = tripEventsContainer;
    this.#tripModel = new TripModel();

    this.allTypes = this.#tripModel.getOffersByType().map((offer) => offer.type);
  }

  init() {
    this.#renderFilters();
    this.#renderSorting();
    this.#renderEventsList();
    this.#initNewEventButton();

    // симуляция загрузки
    setTimeout(() => {
      this.#isLoading = false;
      this.#renderEventsList();
    }, 500);
  }

  #initNewEventButton() {
    this._newEventButton = document.querySelector('.trip-main__event-add-btn');
    this._newEventButton.addEventListener('click', this.#handleNewEventClick);
  }

  #createNewPointForm(point) {
    const destinations = this.#tripModel.getDestinations();
    const offersForType = this.#tripModel.getOffersForType(point.type);

    if (!point.destination || !point.destination.name) {
      return new AddNewPointWithoutDestinationView({
        point,
        destinations,
        offersForType
      });
    }
    if (!offersForType.length) {
      return new AddNewPointWithoutOffersView({
        point,
        destinations,
        offersForType
      });
    }
    return new formView({
      point,
      destination: point.destination,
      offers: offersForType,
      allTypes: this.allTypes
    });
  }

  #closeNewPointForm() {
    if (!this.#newPointFormComponent) {
      return;
    }

    this.#newPointFormComponent.element.remove();
    this.#newPointFormComponent = null;
    if (this._newEventButton) {
      this._newEventButton.disabled = false;
    }
  }

  #addEscHandler(closeCallback) {
    const onEsc = (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        evt.preventDefault();
        closeCallback();
        document.removeEventListener('keydown', onEsc);
      }
    };
    document.addEventListener('keydown', onEsc);
    return onEsc;
  }

  #handleNewEventClick = () => {
    if (this.#newPointFormComponent) {
      return;
    }

    this._newEventButton.disabled = true;

    const newPoint = {
      id: 'new',
      type: this.allTypes[0],
      destination: { name: '', description: '', pictures: [] },
      dateFrom: new Date(),
      dateTo: new Date(),
      basePrice: 0,
      offers: [],
      isFavorite: false
    };

    this.#newPointFormComponent = this.#createNewPointForm(newPoint);

    const eventsListElement = this.#tripEventsContainer.querySelector('.trip-events__list');
    render(this.#newPointFormComponent, eventsListElement, RenderPosition.AFTERBEGIN);

    const closeForm = () => this.#closeNewPointForm();
    const onEscKeyDown = this.#addEscHandler(closeForm);

    document.addEventListener('keydown', onEscKeyDown);

    if (typeof this.#newPointFormComponent.setFormSubmitHandler === 'function') {
      this.#newPointFormComponent.setFormSubmitHandler((evt) => {
        evt.preventDefault();
        this.#closeNewPointForm();
        document.removeEventListener('keydown', onEscKeyDown);
      });
    }

    if (typeof this.#newPointFormComponent.setCancelClickHandler === 'function') {
      this.#newPointFormComponent.setCancelClickHandler((evt) => {
        evt.preventDefault();
        this.#closeNewPointForm();
        document.removeEventListener('keydown', onEscKeyDown);
      });
    }

    if (typeof this.#newPointFormComponent.setCollapseClickHandler === 'function') {
      this.#newPointFormComponent.setCollapseClickHandler(() => {
        this.#closeNewPointForm();
        document.removeEventListener('keydown', onEscKeyDown);
      });
    }
  };

  #removeComponent(component) {
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

  #closeEditPointForm(eventItemComponent, formEditPointComponent) {
    if (!formEditPointComponent.element.parentElement) {
      return;
    }
    replace(eventItemComponent, formEditPointComponent);
  }

  #clearEventsContainer() {
    this.#tripEventsContainer.innerHTML = '';
    this.#removeComponent(this.#loadingComponent);
    this.#removeComponent(this.#listEmptyComponent);
    this.#loadingComponent = null;
    this.#listEmptyComponent = null;
  }

  #renderFilters() {
    if (this.#filterComponent) {
      this.#removeComponent(this.#filterComponent);
    }

    this.#filterComponent = new FilterView({ currentFilter: this.#currentFilter });
    render(this.#filterComponent, this.#tripControlsContainer, RenderPosition.BEFOREEND);

    this.#filterComponent.setFilterChangeHandler((selectedFilter) => {
      this.#currentFilter = selectedFilter;
      this.#removeNewPointForm();
      this.#renderEventsList();
    });
  }

  #renderSorting() {
    const sortingComponent = new SortingView();
    render(sortingComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);
  }

  #renderEventsList() {
    this.#clearEventsContainer();

    const eventsListComponent = new EventListView();
    render(eventsListComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);
    const eventListContainer = eventsListComponent.element;

    if (this.#isLoading) {
      this.#loadingComponent = new LoadingView();
      render(this.#loadingComponent, eventListContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    const allPoints = this.#tripModel.getPoints();
    const now = new Date();

    const tripPoints = allPoints.filter((point) => {
      switch (this.#currentFilter) {
        case 'everything': return true;
        case 'future': return new Date(point.dateFrom) > now;
        case 'present': return new Date(point.dateFrom) <= now && new Date(point.dateTo) >= now;
        case 'past': return new Date(point.dateTo) < now;
        default: return true;
      }
    });

    if (tripPoints.length === 0) {
      this.#listEmptyComponent = new ListEmptyView(this.#currentFilter);
      render(this.#listEmptyComponent, eventListContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    tripPoints.forEach((point) => {
      const eventItemComponent = new EventItemView({ point, destination: point.destination, offers: point.offers });
      const formEditPointComponent = new FormEditPointView({ point, destination: point.destination, offers: point.offers, allTypes: this.allTypes });

      render(eventItemComponent, eventListContainer, RenderPosition.BEFOREEND);

      const closeEditForm = () => this.#closeEditPointForm(eventItemComponent, formEditPointComponent);
      const onEscKeyDown = this.#addEscHandler(closeEditForm);

      eventItemComponent.setExpandClickHandler(() => {
        replace(formEditPointComponent, eventItemComponent);
        document.addEventListener('keydown', onEscKeyDown);
      });

      formEditPointComponent.setFormSubmitHandler((evt) => {
        evt.preventDefault();
        closeEditForm();
        document.removeEventListener('keydown', onEscKeyDown);
      });

      formEditPointComponent.setCollapseClickHandler(() => {
        closeEditForm();
        document.removeEventListener('keydown', onEscKeyDown);
      });
    });
  }

  #removeNewPointForm() {
    if (!this.#newPointFormComponent) {
      return;
    }
    this.#newPointFormComponent.element.remove();
    this.#newPointFormComponent = null;
    if (this._newEventButton) {
      this._newEventButton.disabled = false;
    }
  }
}
