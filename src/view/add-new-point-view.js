import FormEditPointView from './form-edit-point-view.js';
import points from '../mock/points.js';
import destinations from '../mock/destination.js';
import offersByType from '../mock/offer.js';

const headerNewEventBtn = document.querySelector('.trip-main__event-add-btn');

headerNewEventBtn.addEventListener('click', () => {
  const newPoint = {
    id: String(points.length + 1),
    type: 'flight',
    destination: destinations[0],
    dateFrom: new Date(),
    dateTo: new Date(),
    basePrice: 0,
    offers: []
  };

  const formView = new FormEditPointView({
    point: newPoint,
    destination: newPoint.destination,
    offers: [],
    allTypes: offersByType.map((o) => o.type)
  });

  document.querySelector('.trip-events__list').append(formView.element);

  formView.setCollapseClickHandler(() => {
    formView.element.remove();
  });
});
