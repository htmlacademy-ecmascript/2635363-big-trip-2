import flatpickr from 'flatpickr';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import dayjs from 'dayjs';

const createFormNewPointTemplate = (point, destinations, offers) => {
  const { basePrice, dateFrom, dateTo, type, destination, offers: selectedOffers } = point;

  const destinationData = destination || null;
  const destinationName = destinationData ? destinationData.name : '';

  const typeOffers = offers || [];
  const offersTemplate = typeOffers.map((offer) => {
    const checked = selectedOffers.includes(offer.id) ? 'checked' : '';
    return `
      <div class="event__offer-selector">
        <input class="event__offer-checkbox visually-hidden" id="event-offer-${offer.id}" type="checkbox" name="event-offer-${offer.id}" ${checked}>
        <label class="event__offer-label" for="event-offer-${offer.id}">
          <span class="event__offer-title">${offer.title}</span>
          +€&nbsp;<span class="event__offer-price">${offer.price}</span>
        </label>
      </div>`;
  }).join('');

  const createDestinationSection = (dest) => {
    if (!dest || !dest.description) {
      return `
        <section class="event__section  event__section--destination">
          <h3 class="event__section-title  event__section-title--destination">Destination</h3>
          <p class="event__destination-description">нет данных</p>
        </section>
      `;
    }

    const photosTemplate = dest.pictures?.map((photo) => `
    <img class="event__photo" src="${photo.src}" alt="${photo.description}">
  `).join('') || '';

    return `
      <section class="event__section  event__section--destination">
        <h3 class="event__section-title  event__section-title--destination">Destination</h3>
        <p class="event__destination-description">${dest.description}</p>
        <div  class="event__photos-container">
          <div class="event__photos-tape">${photosTemplate}</div>
        </div>
      </section>
    `;
  };


  const destinationSection = createDestinationSection(destinationData);

  return `
  <li class="trip-events__item">
    <form class="event event--edit" action="#" method="post">
      <header class="event__header">
        <div class="event__type-wrapper">
          <label class="event__type  event__type-btn" for="event-type-toggle-1">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
          </label>
          <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">
          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>

              <div class="event__type-item">
                <input id="event-type-taxi-1" class="event__type-input  visually-hidden" type="radio" name="event-type"
                  value="taxi">
                <label class="event__type-label  event__type-label--taxi" for="event-type-taxi-1">Taxi</label>
              </div>

              <div class="event__type-item">
                <input id="event-type-bus-1" class="event__type-input  visually-hidden" type="radio" name="event-type"
                  value="bus">
                <label class="event__type-label  event__type-label--bus" for="event-type-bus-1">Bus</label>
              </div>

              <div class="event__type-item">
                <input id="event-type-train-1" class="event__type-input  visually-hidden" type="radio" name="event-type"
                  value="train">
                <label class="event__type-label  event__type-label--train" for="event-type-train-1">Train</label>
              </div>

              <div class="event__type-item">
                <input id="event-type-ship-1" class="event__type-input  visually-hidden" type="radio" name="event-type"
                  value="ship">
                <label class="event__type-label  event__type-label--ship" for="event-type-ship-1">Ship</label>
              </div>

              <div class="event__type-item">
                <input id="event-type-drive-1" class="event__type-input  visually-hidden" type="radio" name="event-type"
                  value="drive">
                <label class="event__type-label  event__type-label--drive" for="event-type-drive-1">Drive</label>
              </div>

              <div class="event__type-item">
                <input id="event-type-flight-1" class="event__type-input  visually-hidden" type="radio" name="event-type"
                  value="flight" checked="">
                <label class="event__type-label  event__type-label--flight" for="event-type-flight-1">Flight</label>
              </div>

              <div class="event__type-item">
                <input id="event-type-check-in-1" class="event__type-input  visually-hidden" type="radio" name="event-type"
                  value="check-in">
                <label class="event__type-label  event__type-label--check-in" for="event-type-check-in-1">Check-in</label>
              </div>

              <div class="event__type-item">
                <input id="event-type-sightseeing-1" class="event__type-input  visually-hidden" type="radio" name="event-type"
                  value="sightseeing">
                <label class="event__type-label  event__type-label--sightseeing"
                  for="event-type-sightseeing-1">Sightseeing</label>
              </div>

              <div class="event__type-item">
                <input id="event-type-restaurant-1" class="event__type-input  visually-hidden" type="radio" name="event-type"
                  value="restaurant">
                <label class="event__type-label  event__type-label--restaurant" for="event-type-restaurant-1">Restaurant</label>
              </div>
            </fieldset>
          </div>
        </div>

        <div class="event__field-group  event__field-group--destination">
          <label class="event__label  event__type-output" for="event-destination-1">${type}</label>
          <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName}" list="destination-list-1">
          <datalist id="destination-list-1">
            ${destinations.map((d) => `<option value="${d.name}"></option>`).join('')}
          </datalist>
        </div>

        <div class="event__field-group  event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dateFrom ? dayjs(dateFrom).format('DD/MM/YY HH:mm') : ''}">
          —
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="$${dateTo ? dayjs(dateTo).format('DD/MM/YY HH:mm') : ''}">
        </div>

        <div class="event__field-group  event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span> €
          </label>
          <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
        </div>

        <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Cancel</button>
      </header>

      <section class="event__details">
        <section class="event__section  event__section--offers">
          <h3 class="event__section-title">Offers</h3>
          <div class="event__available-offers">${offersTemplate}</div>
        </section>

        ${destinationSection}
      </section>
    </form>
  </li>
  `;
};

export default class FormNewPointView extends AbstractStatefulView {
  #destinations = null;
  #offers = null;
  #datePickerFrom = null;
  #datePickerTo = null;

  constructor({ point, destinations, offers }) {
    super();
    this._callback = {};
    this._setState(FormNewPointView.parsePointToState(point));
    this.#destinations = destinations;
    this.#offers = offers;
    this._restoreHandlers();
    this.#setDestinationChangeHandler();
  }

  static parsePointToState(point) {
    return { ...point, dateFrom: point.dateFrom ?? null, dateTo: point.dateTo ?? null };
  }

  static parseStateToPoint(state) {
    return { ...state };
  }

  get template() {
    return createFormNewPointTemplate(this._state, this.#destinations, this.#offers);
  }

  _restoreHandlers() {
    this.element.querySelector('form')
      ?.addEventListener('submit', this.#handleFormSubmit);

    this.element.querySelector('.event__reset-btn')
      ?.addEventListener('click', this.#handleCancelClick);

    this.#setDatePickers();
  }

  #setDatePickers() {
    if (this.#datePickerFrom) {
      this.#datePickerFrom.destroy();
      this.#datePickerFrom = null;
    }

    if (this.#datePickerTo) {
      this.#datePickerTo.destroy();
      this.#datePickerTo = null;
    }


    const startInput = this.element.querySelector('[name="event-start-time"]');
    const endInput = this.element.querySelector('[name="event-end-time"]');

    if (startInput) {
      this.#datePickerFrom = flatpickr(startInput, {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateFrom ?? new Date(),
        onChange: this.#handleDateFromChange,
      });
    }

    if (endInput) {
      this.#datePickerTo = flatpickr(endInput, {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateTo ?? new Date(),
        onChange: this.#handleDateToChange,
      });
    }
  }

  #handleDateFromChange = ([selectedDate]) => {
    this.updateElement({
      dateFrom: selectedDate
    });
  };

  #handleDateToChange = ([selectedDate]) => {
    this.updateElement({
      dateTo: selectedDate
    });
  };

  #handleFormSubmit = (evt) => {
    evt.preventDefault();
    this._callback.submit?.(FormNewPointView.parseStateToPoint(this._state));
  };

  #setDestinationChangeHandler() {
    this.element.querySelector('.event__input--destination')
      ?.addEventListener('change', this.#handleDestinationChange);
  }

  #handleDestinationChange = (evt) => {
    const selectedName = evt.target.value;
    const selectedDestination = this.#destinations.find((d) => d.name === selectedName);

    if (!selectedDestination) {
      this.updateElement({
        destination: '',
        destinationDescription: '',
        pictures: []
      });
      return;
    }

    this.updateElement({
      destination: selectedDestination.id,
      destinationDescription: selectedDestination.description,
      pictures: selectedDestination.pictures
    });
  };

  setFormSubmitHandler(callback) {
    this._callback.submit = callback;
  }

  setCloseClickHandler(callback) {
    this._callback.close = callback;
  }

  #handleCancelClick = (evt) => {
    evt.preventDefault();
    this._callback.cancel?.();
  };

  setCancelClickHandler(callback) {
    this._callback.cancel = callback;
  }

  destroy() {
    this.removeElement();
    if (this.datePickerFrom) {
      this.datePickerFrom.destroy();
      this.datePickerFrom = null;
    }
    if (this.datePickerTo) {
      this.datePickerTo.destroy();
      this.datePickerTo = null;
    }
  }
}
