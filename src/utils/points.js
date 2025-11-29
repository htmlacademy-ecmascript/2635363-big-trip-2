
export const filterPoints = (points, filterType) => {
  const now = new Date();

  switch (filterType) {
    case 'everything':
      return points;
    case 'future':
      return points.filter((point) => new Date(point.dateFrom) > now);
    case 'present':
      return points.filter((point) => new Date(point.dateFrom) <= now && new Date(point.dateTo) >= now);
    case 'past':
      return points.filter((point) => new Date(point.dateTo) < now);
    default:
      return points;
  }
};

export const sortPoints = (points, sortType) => {
  switch (sortType) {
    case 'day':
      return points.slice().sort((firstPoint, secondPoint) => new Date(firstPoint.dateFrom) - new Date(secondPoint.dateFrom));
    case 'time': {
      const getDuration = (point) => new Date(point.dateTo) - new Date(point.dateFrom);
      return points.slice().sort((firstPoint, secondPoint) => getDuration(secondPoint) - getDuration(firstPoint));
    }
    case 'price':
      return points.slice().sort((firstPoint, secondPoint) => secondPoint.basePrice - firstPoint.basePrice);
    default:
      return points;
  }
};
