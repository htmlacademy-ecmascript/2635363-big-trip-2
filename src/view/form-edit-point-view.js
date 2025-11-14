import flatpickr from 'flatpickr';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import dayjs from 'dayjs';

/**
 *@param {Object} point
 *@param {Array} destinations
*/

const createFormEditTemplate = (point, destinations) => {
  const {
    basePrice,
    dateFrom,
    dateTo,
    type,
    destination,
    availableOffers = [],
    selectedOffers = []
  } = point;

  const destinationData = destination || null;
  const destinationName = destinationData ? destinationData.name : '';

  const createOffersSection = (offers) => {
    if (!offers || offers.length === 0) {
      return '';
    }

    const offersTemplate = availableOffers.map((offer) => {
      const checked = selectedOffers.includes(offer.id) ? 'checked' : '';
      return `
      <div class="event__offer-selector">
        <input class="event__offer-checkbox visually-hidden"
               id="event-offer-${offer.id}"
               type="checkbox"
               name="event-offer-${offer.id}" ${checked}>
        <label class="event__offer-label" for="event-offer-${offer.id}">
          <span class="event__offer-title">${offer.title}</span>
          +€&nbsp;<span class="event__offer-price">${offer.price}</span>
        </label>
      </div>`;
    }).join('');

    return `
    <section class="event__section  event__section--offers">
      <h3 class="event__section-title event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
      ${offersTemplate}
      </div>
    </section>
    `;
  };

  const createDestinationSection = (dest) => {
    if (!dest || !dest.description) {
      return `
        <section class="event__section  event__section--destination">
          <h3 class="event__section-title event__section-title--destination">Destination</h3>
          <p class="event__destination-description">нет данных</p>
        </section>
      `;
    }

    const pictures = (dest.pictures || []).map((p) => `<img class="event__photo" src="${p.src}" alt="${p.description}">`).join('');

    return `
      <section class="event__section  event__section--destination">
        <h3 class="event__section-title event__section-title--destination">Destination</h3>
        <p class="event__destination-description">${dest.description}</p>
        <div class="event__photos-container">
          <div class="event__photos-tape">${pictures}</div>
        </div>
      </section>
    `;
  };

  const offersSection = createOffersSection(availableOffers);
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

              ${['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'].map((eventType) => `
                <div class="event__type-item">
                  <input id="event-type-${eventType}-1" class="event__type-input  visually-hidden" type="radio" name="event-type"
                    value="${eventType}" ${eventType === type ? 'checked' : ''}>
                  <label class="event__type-label  event__type-label--${eventType}" for="event-type-${eventType}-1">${eventType[0].toUpperCase() + eventType.slice(1)}</label>
                </div>`).join('')}

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
          <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dateTo ? dayjs(dateTo).format('DD/MM/YY HH:mm') : ''}">
        </div>

        <div class="event__field-group  event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span> €
          </label>
          <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
        </div>

        <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Delete</button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </header>

      <section class="event__details">
        ${offersSection}
        ${destinationSection}
      </section>
    </form>
  </li>`;
};

export default class FormEditPointView extends AbstractStatefulView {
  #destinations = null;
  #offers = null;
  #datePickerFrom = null;
  #datePickerTo = null;

  constructor({ point, destinations, offers }) {
    super();
    this._callback = {};
    this.#destinations = destinations;
    this.#offers = offers; // здесь передаём весь offersByType

    // найдём офферы для текущего типа точки
    const availableOffers = this.#offers.find((o) => o.type === point.type)?.offers ?? [];

    this._setState(FormEditPointView.parsePointToState({
      ...point,
      availableOffers,
      selectedOffers: point.offers ?? []
    }));

    this._restoreHandlers();
  }

  static parsePointToState(point) {
    return {
      ...point,
      dateFrom: point.dateFrom ?? null,
      dateTo: point.dateTo ?? null,
      availableOffers: point.availableOffers ?? [],
      selectedOffers: point.selectedOffers ?? []
    };
  }

  static parseStateToPoint(state) {
    const point = { ...state };
    point.offers = point.selectedOffers ?? [];
    delete point.availableOffers;
    return point;
  }

  get template() {
    return createFormEditTemplate(this._state, this.#destinations);
  }

  _restoreHandlers() {
    this.element.querySelector('.event__rollup-btn')
      ?.addEventListener('click', this.#handleCloseClick);

    this.element.querySelector('form')
      ?.addEventListener('submit', this.#handleFormSubmit);

    this.element.querySelector('.event__reset-btn')
      ?.addEventListener('click', this.#handleDeleteClick);

    this.element.querySelectorAll('.event__type-input')
      .forEach((radioInput) => {
        radioInput.addEventListener('change', this.#handleTypeChange);
      });
    this.element.querySelector('.event__input--destination')
      ?.addEventListener('change', this.#handleDestinationChange);

    this.element.querySelectorAll('.event__offer-checkbox')
      .forEach((cb) => cb.addEventListener('change', this.#handleOfferToggle));

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

  #handleTypeChange = (evt) => {
    const newType = evt.target.value;

    // ищем офферы по новому типу
    const availableOffers = this.#offers.find((o) => o.type === newType)?.offers ?? [];

    this.updateElement({
      type: newType,
      availableOffers,
      selectedOffers: []
    });
  };

  #handleDestinationChange = (evt) => {
    const newDestinationName = evt.target.value;
    const newDestination = this.#destinations.find((destination) => destination.name === newDestinationName);

    if (!newDestination) {
      return;
    }

    this.updateElement({
      destination: newDestination
    });
  };

  #handleOfferToggle = (evt) => {
    const checkbox = evt.target;
    const offerId = Number(checkbox.id.replace('event-offer-', '')); // id из input-id
    const current = new Set(this._state.selectedOffers);

    if (checkbox.checked) {
      current.add(offerId);
    } else {
      current.delete(offerId);
    }

    this.updateElement({
      selectedOffers: Array.from(current)
    });
  };

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
    this._callback.submit?.(FormEditPointView.parseStateToPoint(this._state));
  };

  setFormSubmitHandler(callback) {
    this._callback.submit = callback;
  }

  #handleCloseClick = (evt) => {
    evt.preventDefault();
    this._callback.close?.();
  };

  setCloseClickHandler(callback) {
    this._callback.close = callback;
  }

  #handleDeleteClick = (evt) => {
    evt.preventDefault();
    this._callback.delete?.();
  };

  setDeleteClickHandler(callback) {
    this._callback.delete = callback;
  }

  destroy() {
    this.removeElement();
    if (this.#datePickerFrom) {
      this.#datePickerFrom.destroy();
      this.#datePickerFrom = null;
    }
    if (this.#datePickerTo) {
      this.#datePickerTo.destroy();
      this.#datePickerTo = null;
    }
  }
}
