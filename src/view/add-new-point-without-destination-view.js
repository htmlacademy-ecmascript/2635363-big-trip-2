import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import offersByType from '../mock/offer.js';
import { formatDateTime } from '../utils/date.js';

export default class AddNewPointWithoutDestinationView extends AbstractStatefulView {
  constructor({ point }) {
    super();
    this._state = {
      point,
      allTypes: offersByType.map((o) => o.type),
    };
  }

  get template() {
    const { point, allTypes } = this._state;

    return `
      <li class="trip-events__item">
        <form class="event event--edit" action="#" method="post">
          <header class="event__header">
            <div class="event__type-wrapper">
              <label class="event__type event__type-btn" for="event-type-toggle-${point.id}">
                <span class="visually-hidden">Choose event type</span>
                <img class="event__type-icon" width="17" height="17" src="img/icons/${point.type}.png" alt="Event type icon">
              </label>
              <input class="event__type-toggle visually-hidden" id="event-type-toggle-${point.id}" type="checkbox">

              <div class="event__type-list">
                <fieldset class="event__type-group">
                  <legend class="visually-hidden">Event type</legend>
                  ${allTypes.map((type) => `
                    <div class="event__type-item">
                      <input id="event-type-${type}-${point.id}"
                        class="event__type-input visually-hidden"
                        type="radio"
                        name="event-type"
                        value="${type}"
                        ${point.type === type ? 'checked' : ''}>
                      <label class="event__type-label event__type-label--${type}" for="event-type-${type}-${point.id}">${type[0].toUpperCase() + type.slice(1)}</label>
                    </div>
                  `).join('')}
                </fieldset>
              </div>
            </div>

            <!-- destination отсутствует -->

            <div class="event__field-group event__field-group--time">
              <label class="visually-hidden" for="event-start-time-${point.id}">From</label>
              <input class="event__input event__input--time"
                id="event-start-time-${point.id}"
                type="text"
                name="event-start-time"
                value="${formatDateTime(point.dateFrom)}">
              &mdash;
              <label class="visually-hidden" for="event-end-time-${point.id}">To</label>
              <input class="event__input event__input--time"
                id="event-end-time-${point.id}"
                type="text"
                name="event-end-time"
                value="${formatDateTime(point.dateTo)}">
            </div>

            <div class="event__field-group event__field-group--price">
              <label class="event__label" for="event-price-${point.id}">
                <span class="visually-hidden">Price</span>
                &euro;
              </label>
              <input class="event__input event__input--price"
                id="event-price-${point.id}"
                type="text"
                name="event-price"
                value="${point.basePrice}">
            </div>

            <button class="event__save-btn btn btn--blue" type="submit">Save</button>
            <button class="event__reset-btn" type="reset">Cancel</button>
          </header>

          ${point.offers?.length ? `
              <section class="event__details">
                <section class="event__section event__section--offers">
                  <h3 class="event__section-title event__section-title--offers">Offers</h3>
                  <div class="event__available-offers">
                    ${point.offers.map((offer) => `
                      <div class="event__offer-selector">
                        <input class="event__offer-checkbox visually-hidden"
                          id="event-offer-${offer.id}-${point.id}"
                          type="checkbox"
                          name="event-offer-${offer.id}"
                          ${offer.checked ? 'checked' : ''}>
                        <label class="event__offer-label" for="event-offer-${offer.id}-${point.id}">
                          <span class="event__offer-title">${offer.title}</span>
                          &plus;&euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
                        </label>
                      </div>
                    `).join('')}
                  </div>
                </section>
              </section>` : ''}
        </form>
      </li>
    `;
  }

  setFormSubmitHandler(callback) {
    this.element.querySelector('form').addEventListener('submit', callback);
  }

  setCollapseClickHandler(callback) {
    this.element.querySelector('.event__reset-btn').addEventListener('click', callback);
  }

}
