
export const filterPoints = (points, filterType) => {
  const now = new Date();

  switch (filterType) {
    case 'everything':
      return points;
    case 'future':
      return points.filter((p) => new Date(p.dateFrom) > now);
    case 'present':
      return points.filter((p) => new Date(p.dateFrom) <= now && new Date(p.dateTo) >= now);
    case 'past':
      return points.filter((p) => new Date(p.dateTo) < now);
    default:
      return points;
  }
};

export const sortPoints = (points, sortType) => {
  switch (sortType) {
    case 'day':
      return points.slice().sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
    case 'time': {
      const getDuration = (p) => new Date(p.dateTo) - new Date(p.dateFrom);
      return points.slice().sort((a, b) => getDuration(b) - getDuration(a));
    }
    case 'price':
      return points.slice().sort((a, b) => b.basePrice - a.basePrice);
    default:
      return points;
  }
};
