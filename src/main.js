import TripPresenter from './presenter/trip-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import FilterModel from './model/filter-model.js';
import PointModel from './model/points-model.js';
import TripApiService from './point-api-service/trip-api-service.js';

const AUTHORIZATION = 'Basic auth12345qwerty';
const END_POINT = 'https://22.objects.htmlacademy.pro/big-trip';

const tripControlsContainer = document.querySelector('.trip-controls__filters');
const tripEventsContainer = document.querySelector('.trip-events');

const apiService = new TripApiService(END_POINT, AUTHORIZATION);

const pointModel = new PointModel({ apiService });

const filterModel = new FilterModel();

const tripPresenter = new TripPresenter({
  tripControlsContainer,
  tripEventsContainer,
  pointsModel: pointModel,
  filterModel
});

const filterPresenter = new FilterPresenter({
  filterContainer: tripControlsContainer,
  filterModel,
  pointsModel: pointModel
});

tripPresenter.init();
pointModel.init().finally(() => {
  filterPresenter.init();
});
