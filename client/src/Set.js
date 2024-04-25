import { CollectionItem, SeriesItem, ProgramItem } from "./Item";
import { createSkeletonSet } from "./utils";

/**
 * Note: not all data on the provided sets is represented in these classes.
 * In a real-world scenario, this would get built out more thoroughly depending on the features/needs at hand.
 * For this project, I picked a subset of the data that I thought would be relevant.
 */

export class Set {
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

export class FullSet extends Set {
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

export class RefSet extends Set {
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
    // Get set data from the api by refId
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
        // The postLoadCallback here updates the tile element, stores the new full set, and removes the old ref set
        this.postLoadCallback(new FullSet(result, this.idx));
      }
    }).catch((e) => {
      console.error("Error getting ref "+this.refId+":");
      console.error(e);
    });
  }
}