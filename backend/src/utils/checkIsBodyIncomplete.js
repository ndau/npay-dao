const checkIsBodyIncomplete = (body) => {
    const bodyValsArr = Object.values(body);
    let isAnyValUndefined = bodyValsArr.some(
      (item) => item === undefined || item === null
    );
    return isAnyValUndefined;
  };

  module.exports = checkIsBodyIncomplete;