import TripPresenter from './presenter/trip-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import FilterModel from './model/filter-model.js';
import TripModel from './model/points-model.js';
import TripApiService from './point-api-service/trip-api-service.js';

const AUTHORIZATION = 'Basic auth12345qwerty';
const END_POINT = 'https://22.objects.htmlacademy.pro/big-trip';

const tripControlsContainer = document.querySelector('.trip-controls__filters');
const tripEventsContainer = document.querySelector('.trip-events');

const apiService = new TripApiService(END_POINT, AUTHORIZATION);

const tripModel = new TripModel({ apiService });

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

tripModel.init().finally(() => {
  tripPresenter.init();
  filterPresenter.init();
});
