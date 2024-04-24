class SkeletonPage extends HTMLElement {
  constructor() {
    super();
    let skeletonSets = "";
    for (let i = 0; i < 10; i++) {
      let skeletonTiles = "";
      for (let j = 0; j < 10; j++) {
        skeletonTiles += `
          <div class="tileContainer" tabindex="-1" id="item-`+i+`-`+j+`">
            <div class="skeletonTileContainer" id="skeleton-`+i+`-`+j+`">
              <div class="skeletonTile"></div>
            </div>
          </div>
        `;
      }
      skeletonSets += `
        <div class="setContainer" id="container-`+i+`">
          <div class="skeletonSetHeader setHeader"></div>
          <div class="setItemsContainer">`+skeletonTiles+`</div>
        </div>
      `;
    }
    this.innerHTML = `
      <div id="setContainers">
        `+skeletonSets+`
      </div>
    `;
  }
}

function addSkeletonPage() {
  customElements.define('skeleton-page', SkeletonPage);
}
