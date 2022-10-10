export const getModulesClasses = (
  _classes: string[],
  _styles: { readonly [key: string]: string }
): string => {
  let classNameString = "";

  if (_classes.length) {
    _classes.forEach((item) => {
      if (_styles && _styles[item]) {
        classNameString = classNameString + _styles[item] + " ";
      }
    });
  }

  return classNameString;
};
