const convertMilliSecondsToDaysAndHours = (_milliseconds: number) => {
  let days = undefined;
  let hours = _milliseconds / (1000 * 60 * 60);
  if (hours >= 24) {
    days = Math.floor(hours / 24);
    hours = Math.floor(hours % 24);
  }
  if (days) return [hours, days];
  else return [hours];
};

export const getHoursAndDaysFromMilliSeconds = (_milliseconds: number) => {
  const hoursAndDaysArr = convertMilliSecondsToDaysAndHours(_milliseconds);
  if (hoursAndDaysArr.length === 2) {
    return `${hoursAndDaysArr[1]}D ${Number(hoursAndDaysArr[0]) >= 1 ? `${hoursAndDaysArr[0].toFixed(0)} H` : ""}`;
  } else if (hoursAndDaysArr.length === 1) {
    return `${hoursAndDaysArr[0].toFixed(0)}H`;
  }
};
