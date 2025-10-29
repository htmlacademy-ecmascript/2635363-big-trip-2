import TripPresenter from './presenter/trip-presenter.js';
import 'flatpickr/dist/flatpickr.min.css';

const tripControlsContainer = document.querySelector('.trip-controls__filters');
const tripEventsContainer = document.querySelector('.trip-events');

const tripPresenter = new TripPresenter({
  tripControlsContainer,
  tripEventsContainer
});
tripPresenter.init();
