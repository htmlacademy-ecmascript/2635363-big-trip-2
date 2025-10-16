export default class TripModel {
  #points;
  #destinations;
  #offersByType;
  constructor({ points, destinations, offersByType }) {
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
}
