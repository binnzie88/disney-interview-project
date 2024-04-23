function loadHomePage() {
  let focusedX = -1;
  let focusedY = -1;
  let bodyElement = document.getElementById("root");
  document.onkeydown = (e) => {
    e.preventDefault();
    move(focusedX, focusedY, e.key, (x, y) => {
      focusedX = x;
      focusedY = y;
    });
  };

  axios.get(location.href + 'api/home').then((response) => {
    if (response.data?.error != null) {
      console.error("Error received:");
      console.error(response.data.error);
    } else if (response.data?.data == null || response.data?.data?.StandardCollection == null) {
      console.log("No data received");
    } else {
      const { containerSets, pageTitle } = processHomeJson(response.data.data.StandardCollection);

      document.title = pageTitle;
      numSets = containerSets.length;
      const divArray = containerSets.map((containerSet, idx) => {
        if (containerSet.isLoading) {
          return createSkeletonSet(idx);
        } else {
          const setTitle = containerSet.text.title.full.set.default.content;
          const itemTiles = containerSet.items.map((item, i) => buildItemTile(item, idx, i));
          let itemElements = '';
          itemTiles.forEach(tile => {
            itemElements += tile;
          });
          const setElement = `
            <div class="setContainer" id="container-`+idx+`">
              <div class="setHeader">`+setTitle+`</div>
              <div class="setItemsContainer">`+itemElements+`</div>
            </div>
          `;
          return setElement;
        }
      })
      let containerElements = '';
      divArray.forEach(element => {
        containerElements += element;
      });
      bodyElement.innerHTML = `<div id="setContainers">`+containerElements+`</div>`;
    }
  }).catch((e) => {
    console.error("Error getting home page content:");
    console.error(e);
  });
}

function processHomeJson(standardCollection) {
  const containers = standardCollection.containers;
  const pageTitle = standardCollection.text.title.full.collection.default.content;

  const containersWithRefSets = containers.map((container, idx) => {
    const containerSet = container.set;
    if (containerSet.items != null) {
      //we have the necessary items, pass the set through
      return containerSet;
    } else if (containerSet.refId != null) {
      const updateCollectionCallback = (containerSet) => {
        let collectionElement = document.getElementById("container-"+idx);
        if (collectionElement != null) {
          const setTitle = containerSet.text.title.full.set.default.content;
          const itemTiles = containerSet.items.map((item, i) => buildItemTile(item, idx, i));
          let itemElements = '';
          itemTiles.forEach(tile => {
            itemElements += tile;
          });
          collectionElement.innerHTML = `
            <div class="setContainer" id="container-`+idx+`">
              <div class="setHeader">`+setTitle+`</div>
              <div class="setItemsContainer">`+itemElements+`</div>
            </div>
          `;
        }
      };

      axios.get(location.href + 'api/ref/' + containerSet.refId).then((response) => {
        if (response.data?.error != null) {
          console.error("Error received:");
          console.error(response.data.error);
        } else if (response.data?.data == null) {
          console.log("No data received, but also no error");
        } else {
          const responseData = response.data?.data;
          const result = responseData.TrendingSet ??
            responseData.PersonalizedCuratedSet ??
            responseData.CuratedSet ??
            { isLoading: true };
          updateCollectionCallback(result);
        }
      }).catch((e) => {
        console.error("Error getting ref "+containerSet.refId+":");
        console.error(e);
      });

      return { isLoading: true };
    } else {
      //TODO: uncharted territory, log
      return null;
    }
  });

  return { containerSets: containersWithRefSets, pageTitle };
}

function buildItemTile(item, parentIdx, idx) {
  let imageUrl = "";
  let title = "";

  if (item.seriesId != null) {
    //item is a series, get values accordingly
    imageUrl = item.image.tile[1.78].series.default.url;
    title = item.text.title.full.series.default.content;
  } else if (item.programId != null) {
    // item is a program, get values accordingly
    imageUrl = item.image.tile[1.78].program.default.url;
    title = item.text.title.full.program.default.content;
  } else if (item.collectionId != null) {
    // item is a collection, get values accordingly
    imageUrl = item.image.tile[1.78].default.default.url;
    title = item.text.title.full.collection.default.content;
  }

  const parentAndTileId = parentIdx+"-"+idx;
  return `
    <div class="tileContainer" tabindex="-1" id="item-`+parentAndTileId+`">
      <div class="tileBorder">
        <div class="tileBackground">
          <div class="skeletonTile" id="skeleton-`+parentAndTileId+`"></div>
          <div class="titlePlaceholderContainer" style="display:none" id="tempTitle-`+parentAndTileId+`">
            <div class="itemTitle">`+title+`</div>
          </div>
          <img 
            style="display:none"
            id="image-`+parentAndTileId+`" 
            src="`+imageUrl+`" 
            onload="onImageLoad(`+parentIdx+`, `+idx+`)" 
            onerror="onImageError(`+parentIdx+`, `+idx+`)"
          >
        </div>
      </div>
    </div>
  `;
}

function onImageLoad(parentIdx, idx) {
  const parentAndTileId = parentIdx+"-"+idx;
  let skeletonElement = document.getElementById('skeleton-'+parentAndTileId);
  skeletonElement.style.display = 'none';
  let imageElement = document.getElementById('image-'+parentAndTileId);
  imageElement.style.display = 'inline';
};

function onImageError(parentIdx, idx) {
  const parentAndTileId = parentIdx+"-"+idx;
  let skeletonElement = document.getElementById('skeleton-'+parentAndTileId);
  skeletonElement.style.display = 'none';
  let titlePlaceholderElement = document.getElementById("tempTitle-"+parentAndTileId);
  titlePlaceholderElement.style.display = 'flex';
}

function move(x, y, direction, callback) {
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
        console.log("up");
        break;
      case "ArrowDown":
        newY = y === numSets-1 ? 0 : y+1;
        console.log("down");
        break;
      case "ArrowLeft":
        newX = x === 0 ? numItemsInCurrentSet-1 : x-1;
        break;
      case "ArrowRight":
        newX = x === numItemsInCurrentSet-1 ? 0 : x+1;
        break;
      default:
        console.log('Unsupported key pressed: '+direction);
        return;
    }
  }
  const newlySelectedElement = document.getElementById('item-'+newY+'-'+newX);
  newlySelectedElement?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  newlySelectedElement?.focus();
  callback(newX, newY);
}

function createSkeletonSet(setIdx) {
  let skeletonTiles = "";
  for (let i = 0; i < 10; i++) {
    skeletonTiles += `
      <div class="tileContainer" tabindex="-1" id="item-`+setIdx+`-`+i+`">
        <div class="skeletonTile"></div>
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

loadHomePage();