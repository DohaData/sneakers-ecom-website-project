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

  // stripe payment
  const stripe = Stripe(
    "pk_test_oKhSR5nslBRnBZpjO6KuzZeX"
  );
  const elements = stripe.elements();

  // Create an instance of the card Element
  const card = elements.create("card");

  // Add an instance of the card Element into the `card-element` div
  card.mount("#card-element");

  // Handle real-time validation errors from the card Element
  card.on("change", function (event) {
    const displayError = document.getElementById("card-errors");
    if (event.error) {
      displayError.textContent = event.error.message;
    } else {
      displayError.textContent = "";
    }
  });

  // Handle form submission
  const form = document.getElementById("payment-form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    stripe.createToken(card).then(function (result) {
      if (result.error) {
        // Inform the customer that there was an error
        const errorElement = document.getElementById("card-errors");
        errorElement.textContent = result.error.message;
      } else {
        // Send the token to your server
        stripeTokenHandler(result.token);
      }
    });
  });

  // Submit the token to your server
  function stripeTokenHandler(token) {
    // Insert the token ID into the form so it gets submitted to the server
    const hiddenInput = document.createElement("input");
    hiddenInput.setAttribute("type", "hidden");
    hiddenInput.setAttribute("name", "stripeToken");
    hiddenInput.setAttribute("value", token.id);
    form.appendChild(hiddenInput);

    // Submit the form
    form.submit();
  }
};
