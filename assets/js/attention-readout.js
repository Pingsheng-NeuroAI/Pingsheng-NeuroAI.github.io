(() => {
  const panel = document.getElementById("attention-readout");
  if (!panel) return;

  const slider = panel.querySelector("input");
  const queryLabel = panel.querySelector("[data-query-label]");
  const output = panel.querySelector("output");
  const rows = Array.from(panel.querySelectorAll("tr[data-key]"));

  function showReadout() {
    const query = Number(slider.value);
    // Scalar keys and the slider range keep the logits between -2 and 2.
    const scores = rows.map(row => Math.exp(query * Number(row.dataset.key)));
    const total = scores.reduce((sum, score) => sum + score, 0);
    let readout = 0;

    rows.forEach((row, index) => {
      const weight = scores[index] / total;
      const share = (100 * weight).toFixed(1) + "%";
      row.querySelector(".attention-readout__track span").style.width = share;
      row.querySelector("[data-weight]").textContent = share;
      readout += weight * Number(row.dataset.value);
    });

    queryLabel.textContent = query > 0 ? "+" + query : String(query);
    output.value = readout.toFixed(2);
  }

  slider.addEventListener("input", showReadout);
  showReadout();
  panel.hidden = false;
})();
