import { FullSet, RefSet } from "./Set";

/**
 * Load any ref sets that are at least partly visible on the page and not already loading
 */
export function loadVisibleRefSets(refSets) {
  refSets.forEach((refSet) => {
    if (refSet.isVisibleAndNotLoading()) {
      refSet.loadFullSet();
    }
  });
}

/**
 * Change focus to the next tile in the desired direction
 */
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
        // Move up one row
        newY = y === 0 ? numSets-1 : y-1;
        break;
      case "ArrowDown":
        // Move down one row
        newY = y === numSets-1 ? 0 : y+1;
        break;
      case "ArrowLeft":
        // Move left one tile, wrapping to the end of the row if necessary
        newX = x === 0 ? numItemsInCurrentSet-1 : x-1;
        break;
      case "ArrowRight":
        // Move right one tile, wrapping to the start of the row if necessary
        newX = x === numItemsInCurrentSet-1 ? 0 : x+1;
        break;
      default:
        break;
    }
  }
  const newlySelectedElement = document.getElementById('item-'+newY+'-'+newX);

  // Smoothly move the element we want to select into view if it isn't already
  newlySelectedElement?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

  // Focus the desired element and prevent auto-scroll to ensure we get the smooth scroll interaction above
  newlySelectedElement?.focus({ preventScroll: true });

  // This callback just updates the current focusedX and focusedY vars
  callback(newX, newY);
}

/**
 * Parse out the initial data we get from the home api
 */
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

/**
 * Create a skeleton loading set with a header and 10 tiles
 */
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

/**
 * Tiles display a skeleton loading state by default. When the image is done loading, hide the skeleton element
 * and display the image element. This prevents the image from displaying partially while loading on slower networks.
 */
window.onImageLoad = function(parentIdx, idx) {
  const parentAndTileId = parentIdx+"-"+idx;
  let skeletonElement = document.getElementById('skeleton-'+parentAndTileId);
  skeletonElement.style.display = 'none';
  let imageElement = document.getElementById('image-'+parentAndTileId);
  imageElement.style.display = 'inline';
};

/**
 * Tiles display a skeleton loading state by default. If the image fails to load, hide the skeleton element
 * and display a decent empty tile with the item's title instead of the image.
 */
window.onImageError = function(parentIdx, idx) {
  const parentAndTileId = parentIdx+"-"+idx;
  let skeletonElement = document.getElementById('skeleton-'+parentAndTileId);
  skeletonElement.style.display = 'none';
  let titlePlaceholderElement = document.getElementById("tempTitle-"+parentAndTileId);
  titlePlaceholderElement.style.display = 'flex';
}