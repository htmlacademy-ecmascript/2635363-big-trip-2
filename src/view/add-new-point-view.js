import FormEditPointView from './form-edit-point-view.js';
import points from '../mock/points.js';
import destinations from '../mock/destination.js';
import offersByType from '../mock/offer.js';

const headerNewEventBtn = document.querySelector('.trip-main__event-add-btn');

headerNewEventBtn.addEventListener('click', () => {
  headerNewEventBtn.disabled = true;

  const eventList = document.querySelector('.trip-events__list');

  const existingForm = eventList.querySelector('.event--edit');
  if (existingForm) {
    existingForm.remove();
  }

  const defaultType = 'flight';
  const offersForType = offersByType.find((offer) => offer.type === defaultType)?.offers || [];
  const defaultDestination = destinations.find((dest) => dest.description && dest.pictures.length > 0) || destinations[0];

  const newPoint = {
    id: String(points.length + 1),
    type: defaultType,
    destination: defaultDestination,
    dateFrom: new Date(),
    dateTo: new Date(),
    basePrice: 0,
    offers: []
  };

  const formView = new FormEditPointView({
    point: newPoint,
    destination: defaultDestination,
    offers: offersForType,
    allTypes: offersByType.map((o) => o.type),
    isNew: true
  });

  eventList.prepend(formView.element);

  // document.querySelector('.trip-events__list').prepend(formView.element);

  formView.setCancelClickHandler((evt) => {
    evt.preventDefault();
    formView.element.remove();
    headerNewEventBtn.disabled = false;
  });

  formView.setCollapseClickHandler(() => {
    formView.element.remove();
    headerNewEventBtn.disabled = false;
  });

  // formView.element.querySelector('.event__reset-btn').addEventListener('click', (evt) => {
  //   evt.preventDefault(); // чтобы форма не срабатывала
  //   formView.element.remove();
  //   headerNewEventBtn.disabled = false;
  // });


  // if (formView.element.querySelector('.event__rollup-btn')) {
  //   formView.setCollapseClickHandler(() => {
  //     formView.element.remove();
  //     headerNewEventBtn.disabled = false;
  //   });
  // }
});

