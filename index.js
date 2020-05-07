// get link elements
const links = document.getElementById("links");
const disp = document.getElementById("image-display");
const imgurls = ["/assets/maze.png", "/assets/spinny-graph.gif", ""];

links.addEventListener("mousemove", (e) => {
  const isChild = e.target !== links;
  if (!isChild) return;

  // get child id
  const childId = [...e.target.parentNode.children].indexOf(e.target);
  disp.style.backgroundImage = `url(${imgurls[childId]})`;
});
