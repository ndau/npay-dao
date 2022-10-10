function convertSecondsToVotingPeriod(_seconds) {
  let seconds = Number(_seconds).toFixed(2);
  let minutes = seconds / 60;
  if (minutes < 1) {
    let secondsText;
    if (seconds === 1) secondsText = `${seconds} second`;
    else secondsText = `${seconds} seconds`;

    votingPeriod = secondsText;
  } else {
    let hours = Math.floor(minutes / 60);
    if (hours < 1) {
      let minutesText;
      if (minutes === 1) minutesText = `${minutes} minute`;
      else minutesText = `${minutes} minutes`;

      votingPeriod = minutesText;
    } else {
      let days = Math.floor(hours / 24);

      if (days < 1) {
        let remainingMinutes = minutes % 60;
        let remainingMinutesText;

        if (remainingMinutes > 1)
          remainingMinutesText = `, ${remainingMinutes} minutes`;
        else if (remainingMinutes === 1)
          remainingMinutesText = `, ${remainingMinutes} minute`;

        votingPeriod = `${hours} hours` + `${remainingMinutesText ? remainingMinutesText : ""}`;
      } else {
        let months = Math.floor(days / 30);
        if (months < 1) {
          let remainingHours = hours % 24;
          let remainingHoursText;
          if (remainingHours > 1)
            remainingHoursText = `, ${remainingHours} hours`;
          else if (remainingHours === 1)
            remainingHoursText = `, ${remainingHours} hour`;

          if (days === 1)
            votingPeriod =
              `${days} day` + (remainingHoursText ? remainingHoursText : "");
          else
            votingPeriod =
              `${days} days` + (remainingHoursText ? remainingHoursText : "");
        } else {
          let years = Math.floor(months / 12);
          if (years < 1) {
            let remainingDays = days % 30;
            let remainingDaysText;
            if (remainingDays > 1)
              remainingDaysText = `, ${remainingDays} days`;
            else if (remainingDays === 1)
              remainingDaysText = `, ${remainingDays} day`;

            let monthsText;

            if (months === 1) {
              monthsText = `${months} month`;
            } else monthsText = `${months} months`;

            votingPeriod =
              (`${monthsText}`) + (remainingDaysText ? remainingDaysText : "");
          } else {
            let remainingMonths = months % 12;
            votingPeriod =
              `${years} years` +
              (remainingMonths > 1 ? `, ${remainingMonths} months` : "");
          }
        }
      }
    }
  }
  return votingPeriod;
}

module.exports = convertSecondsToVotingPeriod;
