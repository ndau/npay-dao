function indexOfMax(arr: number[]) {
  if (arr.length === 0) {
    return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }

  //if draw, return -2 //if first and last index of found number aren't same, then indicates draw
  let firstIndex = arr.indexOf(arr[maxIndex]);
  let lastIndex = arr.lastIndexOf(arr[maxIndex]);

  if(firstIndex!==lastIndex){
    return -2
  }

  return maxIndex;
}

export { indexOfMax };
