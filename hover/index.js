const person = document.querySelector("img#person");
const container = document.getElementById("container");
person.addEventListener(
  "mouseover",
  () => {
    container.style.filter = `brightness(50%)`;
    person.src = "./assets/error.gif";
  },
  false
);

person.addEventListener(
  "mouseout",
  () => {
    container.style.filter = `brightness(100%)`;
    person.src = "./assets/people.jpg";
  },
  false
);
