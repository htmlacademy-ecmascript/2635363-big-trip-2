import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import dayjs from 'dayjs';
import { createOffersSection, createDestinationSection } from '../utils/form-utils.js';

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
    selectedOffers = [],
    isDisabled = false,
    isSaving = false,
    isDeleting = false
  } = point;

  const destinationData = destination || null;
  const destinationName = destinationData ? destinationData.name : '';

  const offersSection = createOffersSection(availableOffers, selectedOffers);
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

        <button class="event__save-btn btn btn--blue" type="submit" ${isDisabled ? 'disabled' : ''}>
          ${isSaving ? 'Saving...' : 'Save'}
        </button>

        <button class="event__reset-btn" type="reset" ${isDisabled ? 'disabled' : ''}>
          ${isDeleting ? 'Deleting...' : 'Delete'}
        </button>

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
    this.#offers = offers;

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
    delete point.selectedOffers;

    return point;
  }

  get template() {
    return createFormEditTemplate(this._state, this.#destinations);
  }

  _restoreHandlers() {
    this.element.querySelector('.event__rollup-btn')
      ?.addEventListener('click', this.#onRollupButtonClick);

    this.element.querySelector('form')
      ?.addEventListener('submit', this.#onFormSubmit);

    this.element.querySelector('.event__reset-btn')
      ?.addEventListener('click', this.#onResetButtonClick);

    this.element.querySelectorAll('.event__type-input')
      .forEach((radioInput) => {
        radioInput.addEventListener('change', this.#onTypeInputChange);
      });
    this.element.querySelector('.event__input--destination')
      ?.addEventListener('change', this.#onDestinationInputChange);
    this.element.querySelector('.event__input--price')
      ?.addEventListener('input', this.#onPriceInput);

    this.element.querySelectorAll('.event__offer-checkbox')
      .forEach((cb) => cb.addEventListener('change', this.#onOfferCheckboxChange));

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

  #onTypeInputChange = (evt) => {
    const newType = evt.target.value;

    const availableOffers = this.#offers.find((o) => o.type === newType)?.offers ?? [];

    this.updateElement({
      type: newType,
      availableOffers,
      selectedOffers: []
    });
  };

  #onDestinationInputChange = (evt) => {
    const newDestinationName = evt.target.value;
    const newDestination = this.#destinations.find((destination) => destination.name === newDestinationName);

    if (!newDestination) {
      return;
    }

    this.updateElement({
      destination: newDestination
    });
  };

  #onOfferCheckboxChange = (evt) => {
    const checkbox = evt.target;
    const offerId = checkbox.dataset.offerId ?? checkbox.id.replace('event-offer-', '');
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

  #onPriceInput = (evt) => {
    const value = evt.target.value.trim();

    if (/^\d+$/.test(value)) {
      evt.target.setCustomValidity('');
    }

    this._setState({
      ...this._state,
      basePrice: value
    });
  };

  #onFormSubmit = (evt) => {
    evt.preventDefault();

    const form = this.element.querySelector('form');
    const destInput = form.querySelector('.event__input--destination');
    const priceInput = form.querySelector('.event__input--price');

    const destValue = destInput.value.trim();
    const priceValue = priceInput.value.trim();

    const isValidDestination = this.#destinations.find((d) => d.name === destValue);

    if (!isValidDestination) {
      destInput.setCustomValidity('Выберите пункт назначения из списка');
      destInput.reportValidity();
      return;
    } else {
      destInput.setCustomValidity('');
    }

    const priceNumber = Number(priceValue);

    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      priceInput.setCustomValidity('Цена должна быть положительным числом');
      priceInput.reportValidity();
      return;
    } else {
      priceInput.setCustomValidity('');
    }

    const finalState = {
      ...this._state,
      basePrice: Number(priceValue),
      destination: isValidDestination,
      dateFrom: this._state.dateFrom.toISOString(),
      dateTo: this._state.dateTo.toISOString(),
    };

    const pointToSend = this.constructor.parseStateToPoint(finalState);

    this._callback.submit?.(pointToSend);
  };

  setFormSubmitHandler(callback) {
    this._callback.submit = callback;
  }

  #onRollupButtonClick = (evt) => {
    evt.preventDefault();
    this._callback.close?.();
  };

  setCloseClickHandler(callback) {
    this._callback.close = callback;
  }

  #onResetButtonClick = (evt) => {
    evt.preventDefault();
    this._callback.delete?.();
  };

  setDeleteClickHandler(callback) {
    this._callback.delete = callback;
  }

  setSaving() {
    this._setState({
      ...this._state,
      isSaving: true,
      isDisabled: true
    });
  }

  setDeleting() {
    this._setState({
      ...this._state,
      isDeleting: true,
      isDisabled: true
    });
  }

  resetSaving() {
    this._setState({
      ...this._state,
      isSaving: false,
      isDisabled: false
    });
  }

  resetDeleting() {
    this._setState({
      ...this._state,
      isDeleting: false,
      isDisabled: false
    });
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
