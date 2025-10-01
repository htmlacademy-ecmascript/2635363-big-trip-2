// mock/destinations.js
const destinations = [
  {
    id: 1,
    name: 'Amsterdam',
    description: 'Amsterdam is the capital of the Netherlands, known for its canals, museums, cycling culture, and vibrant nightlife.',
    pictures: [
      { src: 'https://loremflickr.com/248/152?random=1', description: 'Вид на канал' },
      { src: 'https://loremflickr.com/248/152?random=2', description: 'Трамвай в центре' }
    ]
  },
  {
    id: 2,
    name: 'Chamonix',
    description: 'Chamonix-Mont-Blanc (usually shortened to Chamonix) is a resort area near the junction of France, Switzerland and Italy. At the base of Mont Blanc, the highest summit in the Alps, it’s renowned for its skiing.',
    pictures: [
      { src: 'https://loremflickr.com/248/152?random=3', description: 'Вид на горы' },
      { src: 'https://loremflickr.com/248/152?random=4', description: 'Горнолыжная трасса' }
    ]
  },
  {
    id: 3,
    name: 'Geneva',
    description: 'Geneva is a city in Switzerland that lies at the southern tip of expansive Lac Léman (Lake Geneva). Surrounded by the Alps and Jura mountains, the city has views of dramatic Mont Blanc.',
    pictures: [
      { src: 'https://loremflickr.com/248/152?random=5', description: 'Озеро в Женеве' },
      { src: 'https://loremflickr.com/248/152?random=6', description: 'Фонтан Jet d’Eau' }
    ]
  }
];

export default destinations;
