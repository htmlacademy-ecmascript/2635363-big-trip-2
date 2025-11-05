import { remove, render, replace, RenderPosition } from '../framework/render.js';
import EventItemView from '../view/event-item-view.js';
import FormEditPointView from '../view/form-edit-point-view.js';
import flatpickr from 'flatpickr';

export default class PointPresenter {
  #point;
  #pointListContainer;
  #tripModel;
  #pointComponent;
  #pointEditComponent;
  #onDataChange;
  #onModeChange;
  #flatpickrStart;
  #flatpickrEnd;
  #isEditing = false;

  constructor({ pointListContainer, tripModel, onDataChange, onModeChange }) {
    this.#pointListContainer = pointListContainer;
    this.#tripModel = tripModel;
    this.#onDataChange = onDataChange;
    this.#onModeChange = onModeChange;
  }

  init(point) {
    this.#point = point;

    const prevPoint = this.#pointComponent;
    const prevEdit = this.#pointEditComponent;

    this.#pointComponent = new EventItemView({
      point,
      destination: this.#point.destination,
      offers: this.#tripModel.getOffersForType(this.#point.type)
    });

    this.#pointEditComponent = new FormEditPointView({
      point,
      destinations: this.#tripModel.getDestinations(),
      offers: this.#tripModel.getOffersForType(this.#point.type)
    });

    this.#pointComponent.setExpandClickHandler(this.#handleEditClick);
    this.#pointComponent.setFavoriteClickHandler(this.#handleFavoriteClick);
    this.#pointEditComponent.setCloseClickHandler(this.#handleCloseForm);
    this.#pointEditComponent.setFormSubmitHandler(this.#handleFormSubmit);

    if (!prevPoint || !prevEdit) {
      render(this.#pointComponent, this.#pointListContainer, RenderPosition.BEFOREEND);
      return;
    }

    if (this.#isEditing && this.#pointListContainer.contains(prevEdit.element)) {
      replace(this.#pointEditComponent, prevEdit);
    } else if (this.#pointListContainer.contains(prevPoint.element)) {
      replace(this.#pointComponent, prevPoint);
    }

    remove(prevPoint);
    remove(prevEdit);
  }

  destroy() {
    this.destroyFlatpickr();
    remove(this.#pointComponent);
    remove(this.#pointEditComponent);
    this.#removeEscHandler();
  }


  resetView() {
    if (this.#isEditing) {
      this.#replaceEditToCard();
    }
  }

  // ---------- внутренние переходы ----------
  #replaceCardToEdit() {
    replace(this.#pointEditComponent, this.#pointComponent);
    this.#onModeChange(); // сообщаем TripPresenter закрыть другие
    this.#initFlatpickr();
    this.#addEscHandler();
    this.#isEditing = true;
  }

  #replaceEditToCard() {
    if (!this.#pointListContainer.contains(this.#pointEditComponent.element)) {
      return;
    }
    replace(this.#pointComponent, this.#pointEditComponent);
    this.destroyFlatpickr();
    this.#removeEscHandler();
    this.#isEditing = false;
  }

  #handleEditClick = () => {
    this.#replaceCardToEdit();
  };

  #handleCloseForm = () => {
    this.#replaceEditToCard();
  };

  #handleFavoriteClick = () => {
    const updatedPoint = {
      ...this.#point,
      isFavorite: !this.#point.isFavorite
    };
    this.#onDataChange(updatedPoint);
  };

  #handleFormSubmit = (updatePoint) => {
    this.#onDataChange(updatePoint);
    this.#replaceEditToCard();
  };

  #initFlatpickr() {
    this.destroyFlatpickr();

    this.#flatpickrStart = flatpickr(this.#pointEditComponent.element.querySelector('[name="event-start-time"]'), {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      defaultDate: this.#point.dateFrom
    });

    this.#flatpickrEnd = flatpickr(this.#pointEditComponent.element.querySelector('[name="event-end-time"]'), {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      defaultDate: this.#point.dateTo
    });
  }

  destroyFlatpickr() {
    this.#flatpickrStart?.destroy();
    this.#flatpickrEnd?.destroy();
    this.#flatpickrStart = null;
    this.#flatpickrEnd = null;
  }

  #addEscHandler() {
    document.addEventListener('keydown', this.#onEscKeyDown);
  }

  #removeEscHandler() {
    document.removeEventListener('keydown', this.#onEscKeyDown);
  }

  #onEscKeyDown = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#replaceEditToCard();
    }
  };
}

