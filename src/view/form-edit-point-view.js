import AbstractView from '../framework/view/abstract-view.js';
import { formatDateTime } from '../utils/date';

function createFormEditPointTemplate({ point, destination, offers, allTypes, isNew }) {
  const typeItems = allTypes.map((type) => `
    <div class="event__type-item">
      <input
        id="event-type-${type}-${point.id}"
        class="event__type-input  visually-hidden"
        type="radio"
        name="event-type"
        value="${type}"
        ${point.type === type ? 'checked' : ''}
      >
      <label class="event__type-label event__type-label--${type}" for="event-type-${type}-${point.id}">
        ${type.charAt(0).toUpperCase() + type.slice(1)}
      </label>
    </div>
  `).join('');

  const offersList = offers.map((offer) => `
    <div class="event__offer-selector">
      <input
        class="event__offer-checkbox  visually-hidden"
        id="event-offer-${offer.id}-${point.id}"
        type="checkbox"
        name="event-offer-${offer.id}"
        ${point.offers.includes(offer.id) ? 'checked' : ''}
      >
      <label class="event__offer-label" for="event-offer-${offer.id}-${point.id}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>
  `).join('');

  return `
<li class="trip-events__item">
  <form class="event event--edit" action="#" method="post">
    <header class="event__header">
    <h2 class="visually-hidden">${isNew ? 'New event' : 'Edit event'}</h2>

      <div class="event__type-wrapper">
        <label class="event__type  event__type-btn">
          <span class="visually-hidden">Choose event type</span>
          <img class="event__type-icon" width="17" height="17" src="img/icons/${point.type}.png" alt="Event type icon">
        </label>
        <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${point.id}" type="checkbox">
        <div class="event__type-list">
          <fieldset class="event__type-group">
            <legend class="visually-hidden">Event type</legend>
            ${typeItems}
          </fieldset>
        </div>
      </div>

      <div class="event__field-group  event__field-group--destination">
        <label class="event__label  event__type-output">
          ${point.type.charAt(0).toUpperCase() + point.type.slice(1)}
        </label>
        <input class="event__input  event__input--destination" type="text" name="event-destination" value="${destination.name}" list="destination-list-${point.id}">
        <datalist id="destination-list-${point.id}">
          ${destination.name ? `<option value="${destination.name}"></option>` : ''}
        </datalist>
      </div>

      <div class="event__field-group  event__field-group--time">
        <label class="visually-hidden">From</label>
        <input class="event__input  event__input--time" type="text" name="event-start-time" value="${formatDateTime(point.dateFrom)}">
        &mdash;
        <label class="visually-hidden">To</label>
        <input class="event__input  event__input--time" type="text" name="event-end-time" value="${formatDateTime(point.dateTo)}">
      </div>

      <div class="event__field-group  event__field-group--price">
        <label class="event__label">
          <span class="visually-hidden">Price</span>
          &euro;
        </label>
        <input class="event__input  event__input--price" type="text" name="event-price" value="${point.basePrice}">
      </div>

      <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
      <button class="event__reset-btn btn btn--grey" type="reset">
        ${isNew ? 'Cancel' : 'Delete'}
      </button>

      <!-- Стрелка Collapse показывается только для редактирования -->
      ${!isNew ? `
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>` : ''}
    </header>

    <section class="event__details">
      <section class="event__section  event__section--offers">
        <h3 class="event__section-title  event__section-title--offers">Offers</h3>
        <div class="event__available-offers">
          ${offersList}
        </div>
      </section>

      <section class="event__section  event__section--destination">
        <h3 class="event__section-title  event__section-title--destination">Destination</h3>
        <p class="event__destination-description">${destination.description}</p>
      </section>
    </section>
  </form>
</li>
  `;
}

export default class FormEditPointView extends AbstractView {
  #point;
  #destination;
  #offers;
  #allTypes;
  #isNew;

  constructor({ point, destination, offers, allTypes, isNew = false }) {
    super();
    this.#point = point;
    this.#destination = destination;
    this.#offers = offers;
    this.#allTypes = allTypes;
    this.#isNew = isNew;
  }

  get template() {
    return createFormEditPointTemplate({
      point: this.#point,
      destination: this.#destination,
      offers: this.#offers,
      allTypes: this.#allTypes,
      isNew: this.#isNew
    });
  }

  setFormSubmitHandler(callback) {
    this.element.querySelector('form').addEventListener('submit', callback);
  }

  setCollapseClickHandler(callback) {
    const rollupBtn = this.element.querySelector('.event__rollup-btn');
    if (rollupBtn) {
      rollupBtn.addEventListener('click', callback);
    }
  }

  setCancelClickHandler(callback) {
    const cancelBtn = this.element.querySelector('.event__reset-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', callback);
    }
  }
}
