import ApiService from '../framework/api-service.js';

export default class TripApiService extends ApiService {
  get points() {
    return this._load({ url: 'points' }).then(ApiService.parseResponse);
  }

  get destinations() {
    return this._load({ url: 'destinations' }).then(ApiService.parseResponse);
  }

  get offers() {
    return this._load({ url: 'offers' }).then(ApiService.parseResponse);
  }

  updatePoint(point) {
    return this._load({
      url: `points/${point.id}`,
      method: 'PUT',
      body: JSON.stringify(point),
      headers: new Headers({ 'Content-Type': 'application/json' })
    }).then(ApiService.parseResponse);
  }

  addPoint(point) {
    return this._load({
      url: 'points',
      method: 'POST',
      body: JSON.stringify(point),
      headers: new Headers({ 'Content-Type': 'application/json' })
    }).then(ApiService.parseResponse);
  }

  deletePoint(pointId) {
    return this._load({
      url: `points/${pointId}`,
      method: 'DELETE'
    });
  }
}
