import FilterView from '../view/filter-view.js';
import SortingView from '../view/sorting-view.js';
import EventListView from '../view/event-list-view.js';
import EventItemView from '../view/event-item-view.js';
import ListEmptyView from '../view/list-empty-view.js';
import FormEditPointView from '../view/form-edit-point-view.js';
import FormNewPointView from '../view/add-new-point-view';
import LoadingView from '../view/loading-view.js';
import { remove, render, RenderPosition, replace } from '../framework/render.js';
import TripModel from '../model/points-model.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default class TripPresenter {
  #tripControlsContainer;
  #tripEventsContainer;
  #tripModel;

  #listEmptyComponent = null;
  #loadingComponent = null;
  #filterComponent = null;
  #currentFilter = 'everything';
  #isLoading = true;
  #newEventButton = null;

  #openedForm = null;
  #openedPointComponent = null;


  constructor({ tripControlsContainer, tripEventsContainer }) {
    this.#tripControlsContainer = tripControlsContainer;
    this.#tripEventsContainer = tripEventsContainer;
    this.#tripModel = new TripModel();
    this.allTypes = this.#tripModel.getOffersByType().map((offer) => offer.type);
  }

  init() {
    this.#renderFilters();
    this.#renderSorting();
    this.#initNewEventButton();
    this.#isLoading = true;
    // this.#renderEventsList();

    setTimeout(() => {
      this.#isLoading = false;
      this.#renderEventsList();
    }, 500);
  }

  #initNewEventButton() {
    this.#newEventButton = document.querySelector('.trip-main__event-add-btn');
    this.#newEventButton.addEventListener('click', this.#handleNewEventClick);
  }

  // #createNewPointForm(point) {
  //   const destinations = this.#tripModel.getDestinations();
  //   const offers = this.#tripModel.getOffersForType(point.type);
  //   return new FormEditPointView({ point, destinations, offers });
  // }

  #renderFilters() {
    if (this.#filterComponent) {
      remove(this.#filterComponent);
    }
    this.#filterComponent = new FilterView({ currentFilter: this.#currentFilter });
    render(this.#filterComponent, this.#tripControlsContainer, RenderPosition.BEFOREEND);
    this.#filterComponent.setFilterChangeHandler((filter) => {
      this.#currentFilter = filter;
      this.#removeOpenedForm();
      this.#renderEventsList();
    });
  }

  #renderSorting() {
    const sortingComponent = new SortingView();
    render(sortingComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);
  }

  #clearEventsContainer() {
    this.#tripEventsContainer.innerHTML = '';
    remove(this.#loadingComponent);
    remove(this.#listEmptyComponent);
    this.#loadingComponent = null;
    this.#listEmptyComponent = null;
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

    const points = this.#getFilteredPoints();
    if (points.length === 0) {
      this.#listEmptyComponent = new ListEmptyView(this.#currentFilter);
      render(this.#listEmptyComponent, listContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    points.forEach((point) => {
      this.#renderPoint(listContainer, point);
    });
  }

  #getFilteredPoints() {
    const now = new Date();
    return this.#tripModel.getPoints().filter((point) => {
      switch (this.#currentFilter) {
        case 'everything': return true;
        case 'future': return new Date(point.dateFrom) > now;
        case 'present': return new Date(point.dateFrom) <= now && new Date(point.dateTo) >= now;
        case 'past': return new Date(point.dateTo) < now;
        default: return true;
      }
    });
  }

  #renderPoint(container, point) {
    const pointComponent = new EventItemView({
      point,
      destination: point.destination,
      offers: this.#tripModel.getOffersForType(point.type)
    });

    const formComponent = new FormEditPointView({
      point,
      destinations: this.#tripModel.getDestinations(),
      offers: this.#tripModel.getOffersForType(point.type)
    });

    render(pointComponent, container, RenderPosition.BEFOREEND);

    pointComponent.setExpandClickHandler(() => this.#openForm(pointComponent, formComponent));
    formComponent.setCloseClickHandler(() => this.#closeForm());
    formComponent.setFormSubmitHandler((updatedPoint) => {
      this.#tripModel.updatePoints(updatedPoint);
      this.#closeForm();
      this.#renderEventsList();
    });
  }

  #openForm(pointComponent, formComponent) {
    if (this.#openedForm) {
      this.#closeForm();
    }

    replace(formComponent, pointComponent);
    this.#openedForm = formComponent;
    this.#openedPointComponent = pointComponent;

    this.#initFlatpickr(formComponent);

    this.#addEscHandler(this.#closeForm);
  }

  #closeForm = () => {
    try {
      if (!this.#openedForm || !this.#openedPointComponent) {
        return;
      }

      const formElement = this.#openedForm.element;
      const pointElement = this.#openedPointComponent.element;

      // Проверяем, есть ли оба элемента в DOM
      if (!formElement?.parentElement || !pointElement) {
        this.#openedForm = null;
        this.#openedPointComponent = null;
        return;
      }

      replace(this.#openedPointComponent, this.#openedForm);

      this.#openedForm = null;
      this.#openedPointComponent = null;
    } catch (err) {
      throw new Error(`Ошибка при закрытии формы через Esc: ${err.message}`);
    }
  };


  #handleNewEventClick = () => {
    if (this.#openedForm) {
      return;
    }
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

    this.#openedForm = formComponent;

    const closeForm = () => {
      formComponent.element.remove();
      this.#openedForm = null;
      this.#newEventButton.disabled = false;
    };

    this.#addEscHandler(closeForm);
    this.#initFlatpickr(formComponent);

    formComponent.setFormSubmitHandler(() => {
      closeForm();
    });

    formComponent.setCancelClickHandler(() => {
      closeForm();
    });

    formComponent.setFormSubmitHandler(() => closeForm());
    formComponent.setCloseClickHandler(() => closeForm());
  };

  #initFlatpickr(formComponent) {
    flatpickr(formComponent.element.querySelector('[name="event-start-time"]'), {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      defaultDate: formComponent._state.dateFrom,
      onChange: ([selectedDate]) => formComponent._setState({ dateFrom: selectedDate })
    });

    flatpickr(formComponent.element.querySelector('[name="event-end-time"]'), {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      defaultDate: formComponent._state.dateTo,
      onChange: ([selectedDate]) => formComponent._setState({ dateTo: selectedDate })
    });
  }

  #addEscHandler(callback) {
    const onEsc = (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        evt.preventDefault();
        try {
          callback();
        } catch (err) {
          throw new Error(`Ошибка при закрытии формы через Esc: ${err.message}`);
        }
        document.removeEventListener('keydown', onEsc);
      }
    };
    document.addEventListener('keydown', onEsc);
  }

  #removeOpenedForm() {
    if (this.#openedForm) {
      this.#openedForm.element.remove();
      this.#openedForm = null;
      this.#newEventButton.disabled = false;
    }
  }
}
