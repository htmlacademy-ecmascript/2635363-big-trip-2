import points from '../mock/points.js';
import destinations from '../mock/destination.js';
import offersByType from '../mock/offer.js';

export default class TripModel {
  #points;
  #destinations;
  #offersByType;
  constructor() {
    this.#points = points;
    this.#destinations = destinations;
    this.#offersByType = offersByType;
  }

  getPoints() {
    return this.#points;
  }

  getDestinations() {
    return this.#destinations;
  }

  getOffersByType() {
    return this.#offersByType;
  }

  getDestinationsById(id) {
    return this.#destinations.find((dest) => dest.id === id);
  }

  getOffersForType(type) {
    const typeOffers = this.#offersByType.find((offer) => offer.type === type);
    return typeOffers ? typeOffers.offers : [];
  }

  getOfferRyId(type, offerId) {
    const offersForType = this.getOffersForType(type);
    return offersForType.find((offer) => offer.id === offerId);
  }

  updatePoints(update) {
    this.#points = this.#points.map((point) =>
      point.id === update.id ? update : point
    );
  }
}
