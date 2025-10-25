import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import offersByType from '../mock/offer';
import { formatDateTime } from '../utils/date.js';

export default class AddNewPointWithoutOffersView extends AbstractStatefulView {
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
              <label class="event__type  event__type-btn" for="event-type-toggle-1">
                <span class="visually-hidden">Choose event type</span>
                <img class="event__type-icon" width="17" height="17" src="img/icons/${point.type}.png" alt="Event type icon">
              </label>
              <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

              <div class="event__type-list">
                <fieldset class="event__type-group">
                  <legend class="visually-hidden">Event type</legend>
                  ${allTypes.map((type, i) => `
                    <div class="event__type-item">
                      <input id="event-type-${type}-${i}" class="event__type-input visually-hidden" type="radio" name="event-type" value="${type}" ${point.type === type ? 'checked' : ''}>
                      <label class="event__type-label event__type-label--${type}" for="event-type-${type}-${i}">${type}</label>
                    </div>
                  `).join('')}
                </fieldset>
              </div>
            </div>

            <div class="event__field-group  event__field-group--destination">
              <label class="event__label  event__type-output" for="event-destination-1">${point.type}</label>
              <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${point.destination.name}" list="destination-list-1">
              <datalist id="destination-list-1">
                <option value="${point.destination.name}"></option>
              </datalist>
            </div>

            <div class="event__field-group  event__field-group--time">
              <label class="visually-hidden" for="event-start-time-1">From</label>
              <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${formatDateTime(point.dateFrom)}">
              &mdash;
              <label class="visually-hidden" for="event-end-time-1">To</label>
              <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${formatDateTime(point.dateTo)}">
            </div>

            <div class="event__field-group  event__field-group--price">
              <label class="event__label" for="event-price-1">
                <span class="visually-hidden">Price</span>
                &euro;
              </label>
              <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${point.basePrice}">
            </div>

            <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
            <button class="event__reset-btn" type="reset">Cancel</button>
          </header>

          <section class="event__details">
            <section class="event__section  event__section--destination">
              <h3 class="event__section-title  event__section-title--destination">Destination</h3>
              <p class="event__destination-description">${point.destination.description}</p>

              <div class="event__photos-container">
                <div class="event__photos-tape">
                  ${point.destination.pictures.map((pic) => `
                    <img class="event__photo" src="${pic.src}" alt="${pic.description}">
                  `).join('')}
                </div>
              </div>
            </section>
          </section>
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
