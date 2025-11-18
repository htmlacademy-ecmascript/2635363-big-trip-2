import points from '../mock/points.js';
import destinations from '../mock/destination.js';
import offersByType from '../mock/offer.js';
import Observable from '../framework/observable.js';

export default class TripModel extends Observable {
  #points = [];
  #destinations = [];
  #offersByType = [];
  constructor({ points: initPoints = points, destinations: initDest = destinations, offersByType: initOffers = offersByType } = {}) {
    super();
    this.#points = initPoints;
    this.#destinations = initDest;
    this.#offersByType = initOffers;
  }

  getPoints() {
    return this.#points;
  }

  // ( getter points если потребуется)
  //  get points() {
  //   return this.#points;
  // }

  getDestinations() {
    return this.#destinations;
  }

  getOffersByType() {
    return this.#offersByType;
  }

  setPoints(updateType, tripPoints) {
    this.#points = [...tripPoints];
    this._notify(updateType);
  }

  updatePoint(updateType, updatedPoint) {
    const index = this.#points.findIndex((point) => point.id === updatedPoint.id);

    if (index === -1) {
      throw new Error(`Can't update unexisting point ${updatedPoint.id}`);
    }

    this.#points = [
      ...this.#points.slice(0, index),
      updatedPoint,
      ...this.#points.slice(index + 1)
    ];

    this._notify(updateType, updatedPoint);
  }

  addPoint(updateType, newPoint) {
    this.#points = [newPoint, ...this.#points];
    this._notify(updateType, newPoint);
  }

  deletePoint(updateType, id) {
    const index = this.#points.findIndex((point) => point.id === id);

    if (index === -1) {
      throw new Error(`Can't delete unexisting point ${id}`);
    }

    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1)
    ];

    this._notify(updateType, id);
  }

  getDestinationsById(id) {
    return this.#destinations.find((dest) => dest.id === id);
  }

  getOffersForType(type) {
    return this.#offersByType.find((offer) => offer.type === type)?.offers ?? [];
  }

  getOfferById(type, offerId) {
    return this.getOffersForType(type).find((offer) => offer.id === offerId);
  }
}
