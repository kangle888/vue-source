export const patchClass = (el, value) => {
  if (value == null) {
    value = "";
  } else {
    el.className = value;
  }
};
