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
          <img src="../src/disney-favicon.png">
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