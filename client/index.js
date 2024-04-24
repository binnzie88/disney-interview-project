class Set {
  constructor(set) {
    this.defaultTitle = set.text?.title?.full?.set?.default;
  }

  getDefaultTitleText() {
    return this.defaultTitle.content;
  }

  setHomePageIdx(idx) {
    this.idx = idx;
  }
}

class FullSet extends Set {
  constructor(set, idx) {
    super(set);
    this.type = set.type;
    this.meta = set.meta;
    this.setId = set.setId;
    this.items = new Map();
    this.idx = idx;
    
    let itemElements = '';
    set.items.forEach((rawItem, i) => {
      let item = rawItem;
      switch (rawItem.type) {
        case 'StandardCollection':
          item = new CollectionItem(rawItem, this.setId);
          break;
        case 'DmcSeries':
          item = new SeriesItem(rawItem, this.setId);
          break;
        case 'DmcVideo':
          item = new ProgramItem(rawItem, this.setId);
          break;
        default:
          console.log("Unsupported item type found: " + rawItem.type);
          break;
      }
      this.items.set(item.id, item);
      itemElements += item.getTileElement(this.idx, i);
    });
    this.setElement = `
      <div class="setContainer" id="container-`+idx+`">
        <div class="setHeader">`+this.getDefaultTitleText()+`</div>
        <div class="setItemsContainer">`+itemElements+`</div>
      </div>
    `;
  }
}

class RefSet extends Set {
  constructor(set, idx) {
    super(set);
    this.refId = set.refId;
    this.type = set.refType;
    this.isLoading = false;
    this.idx = idx;
    this.setElement = createSkeletonSet(idx);
  }

  setPostLoadCallback(callback) {
    this.postLoadCallback = callback;
  }

  isVisibleAndNotLoading() {
    const containerElement = document.getElementById("container-"+this.idx);
    const { top, bottom } = containerElement.getBoundingClientRect();
    const visibleHeight = window.innerHeight || document.documentElement.clientHeight;
    return !this.isLoading && (top > 0 && top < visibleHeight) || (bottom > 0 && bottom < visibleHeight);
  }

  loadFullSet() {
    this.isLoading = true;
    axios.get(location.href + 'api/ref/' + this.refId).then((response) => {
      if (response.data?.error != null) {
        console.error("Error received:");
        console.error(response.data.error);
        return null;
      } else if (response.data?.data == null) {
        console.log("No data received, but also no error");
        return null;
      } else {
        const responseData = response.data?.data;
        const result = responseData[Object.keys(responseData)[0]];
        this.postLoadCallback(new FullSet(result, this.idx));
      }
    }).catch((e) => {
      console.error("Error getting ref "+this.refId+":");
      console.error(e);
    });
  }
}

class Item {
  constructor(item, setId) {
    this.contentId = item.contentId;
    this.currentAvailability = item.currentAvailability;
    this.ratings = item.ratings;
    this.releases = item.releases;
    this.isDisneyPlusOriginal = item.tags?.some((tag) => tag.type === 'disneyPlusOriginal' && tag.value === 'true');
    this.tileImage = item.image?.tile;
    this.videoArt = item.videoArt;
    this.setId = setId;
  }

  getDefaultVideoArtUrl() {
    return this.videoArt?.[0]?.mediaMetadata?.urls?.[0]?.url;
  }

  getDialogContent() {
    let dialogTextContent = `
      <div class="dialogHeader">
        `+this.getDefaultTitleText()+`
      </div>
    `;

    if (this.ratings != null) {
      let ratingsElements = ``;
      this.ratings.forEach((rating) => {
        const systemAndValue = rating.system != null && rating.value != null
          ? rating.system + ` Rating: ` + rating.value
          : null;
        // Note: ignoring advisories and description for now since none of the provided items have advisories
        if (systemAndValue != null) {
          ratingsElements += `
            <div class="rating">
              <div class="ratingHeader">
                `+systemAndValue+`
              </div>
            </div>
          `;
        }
      });
      if (ratingsElements !== '') {
        dialogTextContent += `
          <div class="ratingsContainer">
            `+ratingsElements+`
          </div>
        `;
      }
    }

    if (this.releases != null) {
      let releaseElements = ``;
      this.releases.forEach((release) => {
        if (release.releaseType === 'original') {
          if (release.releaseDate != null && release.releaseDate !== '') {
            const parsedDate = release.releaseDate.split('-');
            const releaseDate = new Date(parsedDate[0], parsedDate[1], parsedDate[2]);
            releaseElements += `
              <div class="originalRelease">
                Original Release: `
                +releaseDate.toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric"})+`
              </div>
            `;
          }
        }
      });
      if (releaseElements !== '') {
        dialogTextContent += `
          <div class="releasesContainer">
            `+releaseElements+`
          </div>
        `;
      }
    }

    if (this.isDisneyPlusOriginal) {
      dialogTextContent += `
        <div class="disneyOriginal">
          <img src="/disney-favicon.png">
          Disney+ Original
        </div>
      `;
    }

    const videoArtUrl = this.getDefaultVideoArtUrl();
    const tileImageUrl = this.getTileImage(1.78);
    const dialogTextContainer = `<div class="dialogText">`+dialogTextContent+`</div>`;
    return (videoArtUrl != null && videoArtUrl !== '') ? 
    `
      <div class="dialogContentWithVideo">
        <div class="videoArt">
          <video loop="true" autoplay>
            <source src="`+videoArtUrl+`">
          </video>
        </div>
        `+dialogTextContainer+`
      </div>
    ` : (tileImageUrl != null && tileImageUrl !== '') ?
    `
      <div class="dialogContentWithImage">
        <img src="`+tileImageUrl+`">
        `+dialogTextContainer+`
      </div>
    ` : 
    `
      <div class="dialogContentNoMedia">
        `+dialogTextContainer+`
      </div>
    `;
  }

  getTileElement(setIdx, tileIdx) {
    const imageUrl = this.getTileImage(1.78);
    const title = this.getDefaultTitleText();

    const parentAndTileId = setIdx+"-"+tileIdx;
    return `
      <div class="tileContainer" tabindex="-1" id="item-`+parentAndTileId+`" data-setId="`+this.setId+`" data-itemId="`+this.id+`">
        <div class="tileBackground">
          <div class="skeletonTileContainer" id="skeleton-`+parentAndTileId+`">
            <div class="skeletonTile"></div>
          </div>
          <div class="titlePlaceholderContainer" style="display:none" id="tempTitle-`+parentAndTileId+`">
            <div class="itemTitle">`+title+`</div>
          </div>
          <img 
            style="display:none"
            id="image-`+parentAndTileId+`" 
            src="`+imageUrl+`" 
            onload="onImageLoad(`+setIdx+`, `+tileIdx+`)" 
            onerror="onImageError(`+setIdx+`, `+tileIdx+`)"
          >
        </div>
      </div>
    `;
  }
}

class CollectionItem extends Item {
  type = "StandardCollection";

  constructor(item, setId) {
    super(item, setId);
    this.id = item.collectionId;
    this.defaultTitle = item.text?.title?.full?.collection?.default;
  }

  getDefaultTitleText() {
    return this.defaultTitle.content;
  }

  getTileImage(size) {
    return this.tileImage[size]?.default?.default?.url;
  }
}

class SeriesItem extends Item {
  type = "DmcSeries";

  constructor(item, setId) {
    super(item, setId);
    this.encodedSeriesId = item.encodedSeriesId;
    this.id = item.seriesId;
    this.defaultTitle = item.text?.title?.full?.series?.default;
  }

  getDefaultTitleText() {
    return this.defaultTitle.content;
  }

  getTileImage(size) {
    return this.tileImage[size]?.series?.default?.url;
  }
}

class ProgramItem extends Item {
  type = "DmcVideo";

  constructor(item, setId) {
    super(item, setId);
    this.id = item.programId;
    this.programType = item.programType;
    this.defaultTitle = item.text?.title?.full?.program?.default;
  }

  getDefaultTitleText() {
    return this.defaultTitle.content;
  }

  getTileImage(size) {
    return this.tileImage[size]?.program?.default?.url;
  }
}

function loadHomePage() {
  let fullSets = new Map();
  let refSets = new Map();
  let focusedX = -1;
  let focusedY = -1;
  const rootElement = document.getElementById("root");
  const dialog = document.getElementById("item-dialog");
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
          move(focusedX, focusedY, e.key, (x, y) => {
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

function loadVisibleRefSets(refSets) {
  refSets.forEach((refSet) => {
    if (refSet.isVisibleAndNotLoading()) {
      refSet.loadFullSet();
    }
  });
}

function parseHomeJson(standardCollection) {
  const containers = standardCollection.containers;
  const pageTitle = standardCollection.text.title.full.collection.default.content;

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

function createSkeletonSet(setIdx) {
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

loadHomePage();