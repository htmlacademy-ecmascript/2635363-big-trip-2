export const adaptPointToClient = (point, destinations, offersByType) => ({
  'id': point.id,
  'type': point.type,
  'dateFrom': point.date_from ? new Date(point.date_from) : null,
  'dateTo': point.date_to ? new Date(point.date_to) : null,
  'basePrice': point.base_price,
  'isFavorite': point.is_favorite,
  'destination': destinations.find((dest) => dest.id === point.destination) || null,
  'offers': point.offers
    .map((offerId) => {
      const offerGroup = offersByType.find((offer) => offer.type === point.type);
      return offerGroup?.offers.find((offer) => offer.id === offerId);
    })
    .filter(Boolean),
});

export const adaptPointToServer = (point) => {
  const adapted = {
    'type': point.type,
    'date_from': point.dateFrom instanceof Date ? point.dateFrom.toISOString() : point.dateFrom || null,
    'date_to': point.dateTo instanceof Date ? point.dateTo.toISOString() : point.dateTo || null,
    'base_price': point.basePrice,
    'is_favorite': point.isFavorite,
    'destination': point.destination?.id || point.destination || null,
    'offers': point.offers.map((offer) => offer.id || offer)
  };

  if (point.id && !point.id.startsWith('tmp-')) {
    adapted.id = point.id;
  }

  return adapted;
};
