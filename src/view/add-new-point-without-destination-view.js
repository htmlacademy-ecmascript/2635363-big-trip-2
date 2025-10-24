import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import offersByType from '../mock/offer.js';
import { formatDate } from '../utils/date.js';

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
              <!-- типы события -->
              ${allTypes.map((type, i) => `
                <div class="event__type-item">
                  <input class="event__type-input visually-hidden" type="radio" name="event-type" value="${type}" id="event-type-${type}-${i}" ${point.type === type ? 'checked' : ''}>
                  <label class="event__type-label event__type-label--${type}" for="event-type-${type}-${i}">${type}</label>
                </div>
              `).join('')}
            </div>

            <!-- блок destination убран -->

            <div class="event__field-group event__field-group--time">
              <label class="visually-hidden">From</label>
              <input class="event__input event__input--time" type="text" name="event-start-time" value="${formatDate(point.dateFrom)}">
              &mdash;
              <label class="visually-hidden">To</label>
              <input class="event__input event__input--time" type="text" name="event-end-time" value="${formatDate(point.dateTo)}">
            </div>

            <div class="event__field-group event__field-group--price">
              <label class="event__label">€
                <span class="visually-hidden">Price</span>
              </label>
              <input class="event__input event__input--price" type="text" name="event-price" value="${point.basePrice}">
            </div>

            <button class="event__save-btn btn btn--blue" type="submit">Save</button>
            <button class="event__reset-btn" type="reset">Cancel</button>
          </header>

          ${point.offers.length > 0 ? `
            <section class="event__details">
              <section class="event__section event__section--offers">
                <h3 class="event__section-title event__section-title--offers">Offers</h3>
                <div class="event__available-offers">
                  ${point.offers.map((offer, i) => `
                    <div class="event__offer-selector">
                      <input class="event__offer-checkbox visually-hidden" type="checkbox" id="event-offer-${offer.id}-${i}" name="event-offer-${offer.id}" ${offer.checked ? 'checked' : ''}>
                      <label class="event__offer-label" for="event-offer-${offer.id}-${i}">
                        <span class="event__offer-title">${offer.title}</span>
                        &plus;&euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
                      </label>
                    </div>
                  `).join('')}
                </div>
              </section>
            </section>
          ` : ''}
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
