import 'flatpickr/dist/flatpickr.min.css';

export const createOffersSection = (availableOffers = [], selectedOffers = []) => {
  if (!availableOffers.length) {
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
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>
      <div class="event__available-offers">${offersTemplate}</div>
    </section>`;
};

export const createDestinationSection = (destination) => {
  if (!destination || !destination.description) {
    return '';
  }

  const pictures = (destination.pictures || [])
    .map((p) => `<img class="event__photo" src="${p.src}" alt="${p.description}">`)
    .join('');

  return `
    <section class="event__section  event__section--destination">
      <h3 class="event__section-title  event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${destination.description}</p>
      <div class="event__photos-container">
        <div class="event__photos-tape">${pictures}</div>
      </div>
    </section>`;
};
