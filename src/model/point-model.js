import { adaptPointToServer, adaptPointToClient } from '../point-api-service/point-adapter.js';
import Observable from '../framework/observable.js';
import { UpdateType } from '../consts/update-type.js';


export default class PointModel extends Observable {
  #apiService;
  #points = [];
  #destinations = [];
  #offersByType = [];
  #isLoading = true;

  constructor({ apiService }) {
    super();
    this.#apiService = apiService;
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

  async init() {
    try {
      const offers = await this.#apiService.offers;
      const destinations = await this.#apiService.destinations;
      const points = await this.#apiService.points;

      this.#offersByType = offers;
      this.#destinations = destinations;

      this.#points = Array.isArray(points)
        ? points.map((point) => adaptPointToClient(point, destinations, offers))
        : [];

    } catch (err) {
      this.#points = [];
      this.#offersByType = [];
      this.#destinations = [];
    }

    this.#isLoading = false;
    this._notify(UpdateType.INIT);
  }

  async updatePoint(updateType, updatedPoint) {
    const index = this.#points.findIndex((p) => p.id === updatedPoint.id);
    if (index === -1) {
      throw new Error('Point not found');
    }

    try {
      const adaptedPoint = adaptPointToServer(updatedPoint);

      const serverResponse = await this.#apiService.updatePoint(adaptedPoint);

      const newPoint = adaptPointToClient(serverResponse, this.#destinations, this.#offersByType);

      this.#points = [
        ...this.#points.slice(0, index),
        newPoint,
        ...this.#points.slice(index + 1)
      ];

      this._notify(updateType, newPoint);

    } catch (err) {
      throw new Error('Не удалось обновить точку на сервере');
    }
  }

  async addPoint(updateType, newPoint) {
    try {
      const adaptedPoint = adaptPointToServer(newPoint);

      const serverResponse = await this.#apiService.addPoint(adaptedPoint);

      const addedPoint = adaptPointToClient(serverResponse, this.#destinations, this.#offersByType);

      this.#points = [addedPoint, ...this.#points];
      this._notify(updateType, addedPoint);

    } catch (err) {
      throw new Error('Не удалось добавить точку на сервер');
    }
  }

  async deletePoint(updateType, id) {
    try {
      await this.#apiService.deletePoint(id);
      this.#points = this.#points.filter((p) => p.id !== id);
      this._notify(updateType, id);
    } catch (err) {
      throw new Error('Не удалось удалить точку на сервере');
    }
  }

  getOffersForType(type) {
    return this.#offersByType.find((offer) => offer.type === type)?.offers ?? [];
  }
}
