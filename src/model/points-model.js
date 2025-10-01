export default class TripModel {
  constructor({ points, destinations, offersByType }) {
    this._points = points;
    this._destinations = destinations;
    this._offersByType = offersByType;
  }

  getPoints() {
    return this._points;
  }

  getDestinations() {
    return this._destinations;
  }

  getOffersByType() {
    return this._offersByType;
  }

  getDestinationsById(id) {
    return this._destinations.find((dest) => dest.id === id);
  }

  getOffersForType(type) {
    const typeOffers = this._offersByType.find((offer) => offer.type === type);
    return typeOffers ? typeOffers.offers : [];
  }
}
