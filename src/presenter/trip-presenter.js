import FilterView from '../view/filter-view.js';
import SortingView from '../view/sorting-view.js';
import EventListView from '../view/event-list-view.js';
import EventItemView from '../view/event-item-view.js';
import FormEditPointView from '../view/form-edit-point-view.js';
import { render, RenderPosition } from '../utils/render.js';
import TripModel from '../model/points-model.js';
import points from '../mock/points.js';
import destinations from '../mock/destination.js';
import offersByType from '../mock/offer.js';

const allTypes = offersByType.map((offer) => offer.type);

export default class TripPresenter {
  constructor({ tripControlsContainer, tripEventsContainer }) {
    this._tripControlsContainer = tripControlsContainer;
    this._tripEventsContainer = tripEventsContainer;

    this._tripModel = new TripModel({ points, destinations, offersByType });
  }

  init() {
    this.renderFilters();
    this.renderSorting();
    this.renderEventsList();
  }

  renderFilters() {
    const filterComponent = new FilterView();
    render(filterComponent, this._tripControlsContainer, RenderPosition.BEFOREEND);
  }

  renderSorting() {
    const sortingComponent = new SortingView();
    render(sortingComponent, this._tripEventsContainer, RenderPosition.BEFOREEND);
  }

  renderEventsList() {
    const eventsListComponent = new EventListView();
    render(eventsListComponent, this._tripEventsContainer, RenderPosition.BEFOREEND);

    const eventListContainer = eventsListComponent.getElement();
    const tripPoints = this._tripModel.getPoints();

    tripPoints.forEach((point) => {
      const destination = this._tripModel.getDestinationsById(point.destination);
      const offers = this._tripModel.getOffersForType(point.type);

      const formEditPointComponent = new FormEditPointView({
        point,
        destination,
        offers,
        allTypes
      });
      render(formEditPointComponent, eventListContainer, RenderPosition.AFTERBEGIN);

      const eventItemComponent = new EventItemView(point, destination, offers);
      render(eventItemComponent, eventListContainer, RenderPosition.BEFOREEND);
    });
  }
}
