import { SkeletonPage } from "./SkeletonPage";
import { getTutorialDialogContent, loadVisibleRefSets, moveFocus, parseHomeJson } from "./utils";

function loadHomePage() {
  let fullSets = new Map();
  let refSets = new Map();
  let focusedX = -1;
  let focusedY = -1;
  const rootElement = document.getElementById("root");
  const dialog = document.getElementById("item-dialog");

  // Display skeleton loading page while everything else loads
  const skeletonPage = new SkeletonPage();
  rootElement.innerHTML = skeletonPage.innerHTML;

  // Show the initial dialog to give users a tutorial for navigating the page
  dialog.innerHTML = getTutorialDialogContent();
  dialog.showModal();
  
  /**
   * Use keyboard to navigate page as if it were a remote.
   * The only supported key interactions are:
   *   - Arrow keys: change which tile is selected
   *   - Enter/Return: display dialog for currently-selected tile
   *   - Escape/Delete/Backspace: close dialog
   */
  document.onkeydown = (e) => {
    switch (e.code) {
      case "Enter":
      case "Space":
        // Show dialog for focused item
        if (!dialog.open) {
          e.preventDefault();
          const focusedTileElement = document.activeElement;
          const item = fullSets.get(focusedTileElement.dataset.setid)?.items?.get(focusedTileElement.dataset.itemid);
          if (item != null) {
            dialog.innerHTML = item.getDialogContent();
            dialog.showModal();
          }
        }
        break;
      case "Escape":
      case "Backspace":
      case "Delete":
        // Close dialog
        e.preventDefault();
        dialog.close();
        break;
      case "ArrowDown":
      case "ArrowUp":
      case "ArrowLeft":
      case "ArrowRight":
        // Move focus
        e.preventDefault();
        if (!dialog.open) {
          moveFocus(focusedX, focusedY, e.key, (x, y) => {
            focusedX = x;
            focusedY = y;
          });
        }
        break;
      default:
        e.preventDefault();
        console.log('Unsupported key pressed: '+e.key);
        break;
    }
  };

  // Prevent mouse click from impacting focused tile
  document.onmousedown = (e) => e.preventDefault();

  // Prevent mouse from scrolling page
  window.addEventListener("wheel", e => e.preventDefault(), { passive:false })

  // Get json data from home api and build home page
  axios.get(location.origin + '/api/home').then((response) => {
    if (response.data?.error != null) {
      console.error("Error received:");
      console.error(response.data.error);
    } else if (response.data?.data == null || response.data?.data?.StandardCollection == null) {
      console.log("No data received");
    } else {
      // Parse out data from home api
      const { containerSets, pageTitle } = parseHomeJson(response.data.data.StandardCollection);
      document.title = pageTitle;

      let containerElements = '';
      containerSets.forEach((set, idx) => {
        // Each non-null set can either be a ref set or a fully-loaded set
        if (set != null) {
          containerElements += set.setElement;
          if (set.setId != null) {
            // Set is a fully-loaded set, store it in fullSets
            fullSets.set(set.setId, set);
          } else if (set.refId != null) {
            // Set is a ref set, provide it with a post-load callback and store it in refSets
            set.setPostLoadCallback((fullSet) => {
              let collectionElement = document.getElementById("container-"+idx);
              collectionElement.innerHTML = fullSet.setElement;
              fullSets.set(fullSet.setId, fullSet);
              refSets.delete(set.refId);
            });
            refSets.set(set.refId, set);
          } else {
            console.log("Encountered a set that is neither a full set nor a ref set:");
            console.log(set);
          }
        }
      });

      rootElement.innerHTML = `<div id="setContainers">`+containerElements+`</div>`;

      // Load any ref sets that are already at least partly visible on the page
      loadVisibleRefSets(refSets);
      // On page scroll, load any ref sets that are newly visible and not already loading
      rootElement.addEventListener("scroll", () => {
        loadVisibleRefSets(refSets);
      });
    }
  }).catch((e) => {
    console.error("Error getting home page content:");
    console.error(e);
  });
}

loadHomePage();