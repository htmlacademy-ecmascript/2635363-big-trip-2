import { UpdateType } from '../consts/update-type.js';
import { UserAction } from '../consts/user-action.js';
import { remove, render, replace, RenderPosition } from '../framework/render.js';
import EventItemView from '../view/event-item-view.js';
import FormEditPointView from '../view/form-edit-point-view.js';
import flatpickr from 'flatpickr';

export default class PointPresenter {
  #point;
  #pointListContainer;
  #pointModel;
  #pointComponent;
  #pointEditComponent;
  #onDataChange;
  #onModeChange;
  #flatpickrStart;
  #flatpickrEnd;
  #isEditing = false;

  constructor({ pointListContainer, pointModel, onDataChange, onModeChange }) {
    this.#pointListContainer = pointListContainer;
    this.#pointModel = pointModel;
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
      offers: this.#pointModel.getOffersForType(this.#point.type)
    });

    this.#pointEditComponent = new FormEditPointView({
      point,
      destinations: this.#pointModel.getDestinations(),
      offers: this.#pointModel.getOffersByType()
    });

    this.#pointComponent.setExpandClickHandler(this.#handleEditClick);
    this.#pointComponent.setFavoriteClickHandler(this.#handleFavoriteClick);
    this.#pointEditComponent.setCloseClickHandler(this.#handleCloseForm);
    this.#pointEditComponent.setFormSubmitHandler(this.#handleFormSubmit);
    this.#pointEditComponent.setDeleteClickHandler(this.#handleDeleteClick);

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
    this.#onModeChange();
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
    this.#onDataChange(UserAction.UPDATE_POINT, UpdateType.PATCH, updatedPoint);
  };

  #handleFormSubmit = async (updatePoint) => {
    this.setSaving();
    try {
      await this.#onDataChange(UserAction.UPDATE_POINT, UpdateType.PATCH, updatePoint);
      this.#replaceEditToCard();
    } catch (err) {
      this.setAborting();
    }
  };

  #handleDeleteClick = async () => {
    this.setDeleting();
    try {
      await this.#onDataChange(UserAction.DELETE_POINT, UpdateType.MINOR, this.#point.id);
    } catch (err) {
      this.setAborting();
    }
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

  setSaving() {
    this.#pointEditComponent.updateElement({
      isSaving: true,
      isDisabled: true
    });
  }

  setDeleting() {
    this.#pointEditComponent.updateElement({
      isDeleting: true,
      isDisabled: true
    });
  }

  setAborting() {
    const resetState = {
      isSaving: false,
      isDeleting: false,
      isDisabled: false
    };

    this.#pointEditComponent.shake(() => {
      this.#pointEditComponent.updateElement(resetState);
    });
  }
}

