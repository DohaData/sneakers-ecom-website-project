function getVals() {
  var parent = this.parentNode;
  var slides = parent.getElementsByTagName("input");
  var slide1 = parseFloat(slides[0].value);
  var slide2 = parseFloat(slides[1].value);

  if (slide1 > slide2) {
      var tmp = slide2;
      slide2 = slide1;
      slide1 = tmp;
  }

  var displayElement = parent.getElementsByTagName("p")[0];
  displayElement.innerText = slide1 + " - " + slide2;

  var min = parseFloat(slides[0].min);
  var max = parseFloat(slides[0].max);

  var range1 = ((slide1 - min) / (max - min)) * 100;
  var range2 = ((slide2 - min) / (max - min)) * 100;

  parent.style.background = `linear-gradient(to right, #999 ${range1}%, #000 ${range1}%, #000 ${range2}%, #999 ${range2}%)`;
}

window.onload = function () {
  var sliderSections = document.getElementsByClassName("range-slider");
  for (var x = 0; x < sliderSections.length; x++) {
      var sliders = sliderSections[x].getElementsByTagName("input");
      for (var y = 0; y < sliders.length; y++) {
          if (sliders[y].type === "range") {
              sliders[y].oninput = getVals;
              sliders[y].oninput();
          }
      }
  }
};
