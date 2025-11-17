import points from './mock/points';
import TripPresenter from './presenter/trip-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import FilterModel from './model/filter-model.js';
import TripModel from './model/points-model.js';
import destinations from './mock/destination.js';
import offersByType from './mock/offer.js';

const tripControlsContainer = document.querySelector('.trip-controls__filters');
const tripEventsContainer = document.querySelector('.trip-events');

const tripModel = new TripModel();
const filterModel = new FilterModel();

const tripPresenter = new TripPresenter({
  tripControlsContainer,
  tripEventsContainer,
  pointsModel: tripModel,
  filterModel
});

const filterPresenter = new FilterPresenter({
  filterContainer: tripControlsContainer,
  filterModel,
  pointsModel: tripModel
});

tripPresenter.init();
filterPresenter.init();
