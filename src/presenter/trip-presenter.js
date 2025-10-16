import FilterView from '../view/filter-view.js';
import SortingView from '../view/sorting-view.js';
import EventListView from '../view/event-list-view.js';
import EventItemView from '../view/event-item-view.js';
import FormEditPointView from '../view/form-edit-point-view.js';
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

  constructor({ tripControlsContainer, tripEventsContainer }) {
    this.#tripControlsContainer = tripControlsContainer;
    this.#tripEventsContainer = tripEventsContainer;

    this.#tripModel = new TripModel({ points, destinations, offersByType });
  }

  init() {
    this.renderFilters();
    this.renderSorting();
    this.renderEventsList();
  }

  renderFilters() {
    const filterComponent = new FilterView();
    render(filterComponent, this.#tripControlsContainer, RenderPosition.BEFOREEND);
  }

  renderSorting() {
    const sortingComponent = new SortingView();
    render(sortingComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);
  }

  renderEventsList() {
    const eventsListComponent = new EventListView();
    render(eventsListComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);

    const eventListContainer = eventsListComponent.element;
    const tripPoints = this.#tripModel.getPoints();

    tripPoints.forEach((point) => {
      const destination = this.#tripModel.getDestinationsById(point.destination);
      const offers = this.#tripModel.getOffersForType(point.type);

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
