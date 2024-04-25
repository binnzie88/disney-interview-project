import { SkeletonPage } from "./SkeletonPage";
import { loadVisibleRefSets, moveFocus, parseHomeJson } from "./utils";

function loadHomePage() {
  let fullSets = new Map();
  let refSets = new Map();
  let focusedX = -1;
  let focusedY = -1;
  const rootElement = document.getElementById("root");
  const dialog = document.getElementById("item-dialog");

  const skeletonPage = new SkeletonPage();
  rootElement.innerHTML = skeletonPage.innerHTML;
  
  document.onkeydown = (e) => {
    e.preventDefault();
    switch (e.key) {
      case "Enter":
        if (!dialog.open) {
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
        dialog.close();
        break;
      case "ArrowDown":
      case "ArrowUp":
      case "ArrowLeft":
      case "ArrowRight":
        if (!dialog.open) {
          moveFocus(focusedX, focusedY, e.key, (x, y) => {
            focusedX = x;
            focusedY = y;
          });
        }
        break;
      default:
        console.log('Unsupported key pressed: '+e.key);
        break;
    }
  };

  axios.get(location.href + 'api/home').then((response) => {
    if (response.data?.error != null) {
      console.error("Error received:");
      console.error(response.data.error);
    } else if (response.data?.data == null || response.data?.data?.StandardCollection == null) {
      console.log("No data received");
    } else {
      const { containerSets, pageTitle } = parseHomeJson(response.data.data.StandardCollection);
      document.title = pageTitle;

      let containerElements = '';
      containerSets.forEach((set, idx) => {
        if (set != null) {
          containerElements += set.setElement;
          if (set.setId != null) {
            fullSets.set(set.setId, set);
          } else if (set.refId != null) {
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
      loadVisibleRefSets(refSets);
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