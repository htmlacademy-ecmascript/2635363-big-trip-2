import TripPresenter from './presenter/trip-presenter';

const tripControlsContainer = document.querySelector('.trip-controls__filters');
const tripEventsContainer = document.querySelector('.trip-events');

const tripPresenter = new TripPresenter({ tripControlsContainer, tripEventsContainer });
tripPresenter.init();
