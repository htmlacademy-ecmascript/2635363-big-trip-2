import AbstractView from '../framework/view/abstract-view';

export default class LoadingView extends AbstractView {
  get template() {
    return '<p class="trip-events__msg">Loading...</p>';
  }
}
