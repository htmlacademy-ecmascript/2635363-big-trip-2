import { adaptPointToServer, adaptPointToClient } from '../point-api-service/point-adapter.js';
import Observable from '../framework/observable.js';
import { UpdateType } from '../consts/update-type.js';


export default class TripModel extends Observable {
  #apiService;
  #points = [];
  #destinations = [];
  #offersByType = [];
  #isLoading = true;

  constructor({ apiService }) {
    super();
    this.#apiService = apiService;
  }

  get isLoading() {
    return this.#isLoading;
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

  // setPoints(updateType, tripPoints) {
  //   this.#points = [...tripPoints];
  //   this._notify(updateType);
  // }

  async init() {
    try {
      const offers = await this.#apiService.offers;
      const destinations = await this.#apiService.destinations;
      const points = await this.#apiService.points;

      console.log('offers from server:', offers);
      console.log('destinations from server:', destinations);
      console.log('points from server:', points);

      this.#offersByType = offers;
      this.#destinations = destinations;

      this.#points = Array.isArray(points)
        ? points.map((point) => adaptPointToClient(point, destinations, offers))
        : [];

    } catch (err) {
      console.error('Ошибка загрузки данных:', err);

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
      // Преобразуем в формат сервера и отправляем PUT-запрос
      const serverResponse = await this.#apiService.updatePoint(adaptPointToServer(updatedPoint));

      // Преобразуем обратно в формат клиента с актуальными destinations и offers
      const newPoint = adaptPointToClient(serverResponse, this.#destinations, this.#offersByType);

      // Обновляем локальный массив
      this.#points = [
        ...this.#points.slice(0, index),
        newPoint,
        ...this.#points.slice(index + 1)
      ];

      // Уведомляем презентер об успешном обновлении
      this._notify(updateType, newPoint);

    } catch (err) {
      // Пробрасываем ошибку, чтобы презентер мог показать shake форму
      throw new Error('Не удалось обновить точку на сервере');
    }
  }

  async addPoint(updateType, newPoint) {
    try {
      const serverResponse = await this.#apiService.addPoint(adaptPointToServer(newPoint));
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
