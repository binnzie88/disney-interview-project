/**
 * Note: not all data on the provided items is represented in these classes.
 * In a real-world scenario, this would get built out more thoroughly depending on the features/needs at hand.
 * For this project, I picked a subset of the data that I thought would be relevant.
 */

export class Item {
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

    // Display available ratings
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

    // Display original release date if available
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

    // Display label if item is a Disney+ original
    if (this.isDisneyPlusOriginal) {
      dialogTextContent += `
        <div class="disneyOriginal">
          <img src="../src/disney-favicon.png">
          Disney+ Original
        </div>
      `;
    }

    const videoArtUrl = this.getDefaultVideoArtUrl();
    const tileImageUrl = this.getTileImage(1.78);
    const dialogTextContainer = `<div class="dialogText">`+dialogTextContent+`</div>`;
    return (videoArtUrl != null && videoArtUrl !== '') ? 
    // If item has video art, display it with details layered on top
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
    // If item has a tile image but no video art, display the image with details listed below
    `
      <div class="dialogContentWithImage">
        <img src="`+tileImageUrl+`">
        `+dialogTextContainer+`
      </div>
    ` : 
    // If item has no video art or tile image, just display details
    `
      <div class="dialogContentNoMedia">
        `+dialogTextContainer+`
      </div>
    `;
  }

  /**
   * I opted to use a separate getTileElement function here rather than setting the object's innerHtml since I expect
   * that there would be different use cases for displaying items in a real-world scenario. In that case, I'd build
   * out other ways to visualize the item as needed.
   */
  getTileElement(setIdx, tileIdx) {
    // For this project, I chose to always display the 1.78 tile image. In a real-world scenario, I would
    // choose this more dynamically for different use cases
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

/**
 * In the provided home data, these are the only 3 item types. In a real-world scenario there may be
 * other possible options, and depending on those I would maybe tweak my implementation strategy here.
 */

export class CollectionItem extends Item {
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

export class SeriesItem extends Item {
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

export class ProgramItem extends Item {
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