export const getDuration = (start, end) => {
  const ms = new Date(end) - new Date(start);
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}H ${minutes}M`;
  }
  return `${minutes}M`;
};
