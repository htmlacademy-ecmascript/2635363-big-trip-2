import FilterView from '../view/filter-view.js';
import SortingView from '../view/sorting-view.js';
import EventListView from '../view/event-list-view.js';
import EventItemView from '../view/event-item-view.js';
import FormEditPointView from '../view/form-edit-point-view.js';
import { render, RenderPosition } from '../render.js';

export default class TripPresenter {
  constructor({ tripControlsContainer, tripEventsContainer }) {
    this._tripControlsContainer = tripControlsContainer;
    this._tripEventsContainer = tripEventsContainer;
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

    const formEditPointComponent = new FormEditPointView();
    render(formEditPointComponent, eventListContainer, RenderPosition.AFTERBEGIN);

    for (let i = 0; i < 3; i++) {
      const eventItemComponent = new EventItemView();
      render(eventItemComponent, eventListContainer, RenderPosition.BEFOREEND);
    }
  }
}
