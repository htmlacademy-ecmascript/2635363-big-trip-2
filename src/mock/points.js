import { getRandomArrayElement, getRandomInteger } from '../utils/common';
import destinations from './destination.js';
import offersByType from './offer.js';

let pointId = 1;

export const generateRandomPoint = () => {
  const offerType = getRandomArrayElement(offersByType);

  const from = new Date();
  const to = new Date(from.getTime() + getRandomInteger(1, 5) * 60 * 60 * 1000);

  return {
    id: String(pointId++),
    type: offerType.type,
    destination: getRandomArrayElement(destinations).id,
    dateFrom: from,
    dateTo: to,
    basePrice: getRandomInteger(20, 500),
    offers: offerType.offers.map((offer) => offer.id),
  };
};

const points = Array.from({ length: 5 }, generateRandomPoint);
export default points;
