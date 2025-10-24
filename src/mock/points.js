import { getRandomArrayElement, getRandomInteger } from '../utils/common';
import destinations from './destination.js';
import offersByType from './offer.js';

let pointId = 1;

const getRandomSubset = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const generateRandomPoint = () => {
  const offerType = getRandomArrayElement(offersByType);
  const destination = getRandomArrayElement(destinations);

  const dateFrom = new Date();
  const dateTo = new Date(dateFrom.getTime() + getRandomInteger(1, 5) * 60 * 60 * 1000);

  const offersCount = getRandomInteger(0, offerType.offers.length);
  const offers = getRandomSubset(offerType.offers, offersCount);

  return {
    id: String(pointId++),
    type: offerType.type,
    destination,
    dateFrom,
    dateTo,
    basePrice: getRandomInteger(20, 500),
    offers,
    isFavorite: false
  };
};

const points = Array.from({ length: 5 }, generateRandomPoint);
export default points;
