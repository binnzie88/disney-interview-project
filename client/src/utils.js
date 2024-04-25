import { FullSet, RefSet } from "./Set";

export function loadVisibleRefSets(refSets) {
  refSets.forEach((refSet) => {
    if (refSet.isVisibleAndNotLoading()) {
      refSet.loadFullSet();
    }
  });
}

export function moveFocus(x, y, direction, callback) {
  const activeElement = document.activeElement;
  const currentSet = activeElement?.parentElement;
  let newX = x;
  let newY = y;

  if (x === -1 && y === -1) {
    newX = 0;
    newY = 0;
  } else {
    const numItemsInCurrentSet = currentSet?.childElementCount ?? 0;
    const numSets = document.getElementById("setContainers")?.childElementCount ?? 0;
    switch (direction) {
      case "ArrowUp":
        newY = y === 0 ? numSets-1 : y-1;
        break;
      case "ArrowDown":
        newY = y === numSets-1 ? 0 : y+1;
        break;
      case "ArrowLeft":
        newX = x === 0 ? numItemsInCurrentSet-1 : x-1;
        break;
      case "ArrowRight":
        newX = x === numItemsInCurrentSet-1 ? 0 : x+1;
        break;
      default:
        break;
    }
  }
  const newlySelectedElement = document.getElementById('item-'+newY+'-'+newX);
  newlySelectedElement?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  newlySelectedElement?.focus({ preventScroll: true });
  callback(newX, newY);
}

export function parseHomeJson(standardCollection) {
  const containers = standardCollection.containers;
  const pageTitle = standardCollection.text?.title?.full?.collection?.default?.content;

  const containersWithRefSets = containers.map((container, idx) => {
    const containerSet = container.set;
    if (containerSet.items != null) {
      //we have the necessary items, pass the set through
      return new FullSet(containerSet, idx);
    } else if (containerSet.refId != null) {
      return new RefSet(containerSet, idx);
      
    } else {
      console.log("Encountered a set that is neither a fully loaded set nor a ref set:");
      console.log(containerSet);
      return null;
    }
  });

  return { containerSets: containersWithRefSets, pageTitle };
}

export function createSkeletonSet(setIdx) {
  let skeletonTiles = "";
  for (let i = 0; i < 10; i++) {
    skeletonTiles += `
      <div class="tileContainer" tabindex="-1" id="item-`+setIdx+`-`+i+`">
        <div class="skeletonTileContainer" id="skeleton-`+setIdx+`-`+i+`">
          <div class="skeletonTile"></div>
        </div>
      </div>
    `;
  }
  return `
    <div class="setContainer" id="container-`+setIdx+`">
      <div class="skeletonSetHeader setHeader"></div>
      <div class="setItemsContainer">`+skeletonTiles+`</div>
    </div>
  `;
}

window.onImageLoad = function(parentIdx, idx) {
  const parentAndTileId = parentIdx+"-"+idx;
  let skeletonElement = document.getElementById('skeleton-'+parentAndTileId);
  skeletonElement.style.display = 'none';
  let imageElement = document.getElementById('image-'+parentAndTileId);
  imageElement.style.display = 'inline';
};

window.onImageError = function(parentIdx, idx) {
  const parentAndTileId = parentIdx+"-"+idx;
  let skeletonElement = document.getElementById('skeleton-'+parentAndTileId);
  skeletonElement.style.display = 'none';
  let titlePlaceholderElement = document.getElementById("tempTitle-"+parentAndTileId);
  titlePlaceholderElement.style.display = 'flex';
}