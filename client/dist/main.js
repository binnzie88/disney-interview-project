(()=>{"use strict";class e{constructor(e,t){this.contentId=e.contentId,this.currentAvailability=e.currentAvailability,this.ratings=e.ratings,this.releases=e.releases,this.isDisneyPlusOriginal=e.tags?.some((e=>"disneyPlusOriginal"===e.type&&"true"===e.value)),this.tileImage=e.image?.tile,this.videoArt=e.videoArt,this.setId=t}getDefaultVideoArtUrl(){return this.videoArt?.[0]?.mediaMetadata?.urls?.[0]?.url}getDialogContent(){let e='\n      <div class="dialogHeader">\n        '+this.getDefaultTitleText()+"\n      </div>\n    ";if(null!=this.ratings){let t="";this.ratings.forEach((e=>{const n=null!=e.system&&null!=e.value?e.system+" Rating: "+e.value:null;null!=n&&(t+='\n            <div class="rating">\n              <div class="ratingHeader">\n                '+n+"\n              </div>\n            </div>\n          ")})),""!==t&&(e+='\n          <div class="ratingsContainer">\n            '+t+"\n          </div>\n        ")}if(null!=this.releases){let t="";this.releases.forEach((e=>{if("original"===e.releaseType&&null!=e.releaseDate&&""!==e.releaseDate){const n=e.releaseDate.split("-"),i=new Date(n[0],n[1],n[2]);t+='\n              <div class="originalRelease">\n                Original Release: '+i.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})+"\n              </div>\n            "}})),""!==t&&(e+='\n          <div class="releasesContainer">\n            '+t+"\n          </div>\n        ")}this.isDisneyPlusOriginal&&(e+='\n        <div class="disneyOriginal">\n          <img src="../src/disney-favicon.png">\n          Disney+ Original\n        </div>\n      ');const t=this.getDefaultVideoArtUrl(),n=this.getTileImage(1.78),i='<div class="dialogText">'+e+"</div>";return null!=t&&""!==t?'\n      <div class="dialogContentWithVideo">\n        <div class="videoArt">\n          <video loop="true" autoplay>\n            <source src="'+t+'">\n          </video>\n        </div>\n        '+i+"\n      </div>\n    ":null!=n&&""!==n?'\n      <div class="dialogContentWithImage">\n        <img src="'+n+'">\n        '+i+"\n      </div>\n    ":'\n      <div class="dialogContentNoMedia">\n        '+i+"\n      </div>\n    "}getTileElement(e,t){const n=this.getTileImage(1.78),i=this.getDefaultTitleText(),s=e+"-"+t;return'\n      <div class="tileContainer" tabindex="-1" id="item-'+s+'" data-setId="'+this.setId+'" data-itemId="'+this.id+'">\n        <div class="tileBackground">\n          <div class="skeletonTileContainer" id="skeleton-'+s+'">\n            <div class="skeletonTile"></div>\n          </div>\n          <div class="titlePlaceholderContainer" style="display:none" id="tempTitle-'+s+'">\n            <div class="itemTitle">'+i+'</div>\n          </div>\n          <img \n            style="display:none"\n            id="image-'+s+'" \n            src="'+n+'" \n            onload="onImageLoad('+e+", "+t+')" \n            onerror="onImageError('+e+", "+t+')"\n          >\n        </div>\n      </div>\n    '}}class t extends e{type="StandardCollection";constructor(e,t){super(e,t),this.id=e.collectionId,this.defaultTitle=e.text?.title?.full?.collection?.default}getDefaultTitleText(){return this.defaultTitle.content}getTileImage(e){return this.tileImage[e]?.default?.default?.url}}class n extends e{type="DmcSeries";constructor(e,t){super(e,t),this.encodedSeriesId=e.encodedSeriesId,this.id=e.seriesId,this.defaultTitle=e.text?.title?.full?.series?.default}getDefaultTitleText(){return this.defaultTitle.content}getTileImage(e){return this.tileImage[e]?.series?.default?.url}}class i extends e{type="DmcVideo";constructor(e,t){super(e,t),this.id=e.programId,this.programType=e.programType,this.defaultTitle=e.text?.title?.full?.program?.default}getDefaultTitleText(){return this.defaultTitle.content}getTileImage(e){return this.tileImage[e]?.program?.default?.url}}class s{constructor(e){this.defaultTitle=e.text?.title?.full?.set?.default}getDefaultTitleText(){return this.defaultTitle.content}setHomePageIdx(e){this.idx=e}}class l extends s{constructor(e,s){super(e),this.type=e.type,this.meta=e.meta,this.setId=e.setId,this.items=new Map,this.idx=s;let l="";e.items.forEach(((e,s)=>{let a=e;switch(e.type){case"StandardCollection":a=new t(e,this.setId);break;case"DmcSeries":a=new n(e,this.setId);break;case"DmcVideo":a=new i(e,this.setId);break;default:console.log("Unsupported item type found: "+e.type)}this.items.set(a.id,a),l+=a.getTileElement(this.idx,s)})),this.setElement='\n      <div class="setContainer" id="container-'+s+'">\n        <div class="setHeader">'+this.getDefaultTitleText()+'</div>\n        <div class="setItemsContainer">'+l+"</div>\n      </div>\n    "}}class a extends s{constructor(e,t){super(e),this.refId=e.refId,this.type=e.refType,this.isLoading=!1,this.isLoaded=!1,this.idx=t,this.setElement=r(t)}setPostLoadCallback(e){this.postLoadCallback=e}isVisibleAndNotLoading(){const e=document.getElementById("container-"+this.idx),{top:t,bottom:n}=e.getBoundingClientRect(),i=window.innerHeight||document.documentElement.clientHeight;return!this.isLoading&&!this.isLoaded&&t>0&&t<i||n>0&&n<i}loadFullSet(){this.isLoaded||this.isLoading||(this.isLoading=!0,axios.get(location.origin+"/api/ref/"+this.refId).then((e=>{if(null!=e.data?.error)return console.error("Error received:"),console.error(e.data.error),null;if(null==e.data?.data)return console.log("No data received, but also no error"),null;{const t=e.data?.data,n=t[Object.keys(t)[0]];this.postLoadCallback(new l(n,this.idx)),this.isLoaded=!0}})).catch((e=>{console.error("Error getting ref "+this.refId+":"),console.error(e)})))}}function o(e){e.forEach((e=>{e.isVisibleAndNotLoading()&&e.loadFullSet()}))}function r(e){let t="";for(let n=0;n<10;n++)t+='\n      <div class="tileContainer" tabindex="-1" id="item-'+e+"-"+n+'">\n        <div class="skeletonTileContainer" id="skeleton-'+e+"-"+n+'">\n          <div class="skeletonTile"></div>\n        </div>\n      </div>\n    ';return'\n    <div class="setContainer" id="container-'+e+'">\n      <div class="skeletonSetHeader setHeader"></div>\n      <div class="setItemsContainer">'+t+"</div>\n    </div>\n  "}window.onImageLoad=function(e,t){const n=e+"-"+t;document.getElementById("skeleton-"+n).style.display="none",document.getElementById("image-"+n).style.display="inline"},window.onImageError=function(e,t){const n=e+"-"+t;document.getElementById("skeleton-"+n).style.display="none",document.getElementById("tempTitle-"+n).style.display="flex"};class d{constructor(){let e="";for(let t=0;t<10;t++)e+=r(t);this.innerHTML='\n      <div id="setContainers">\n        '+e+"\n      </div>\n    "}}!function(){let e=new Map,t=new Map,n=-1,i=-1;const s=document.getElementById("root"),r=document.getElementById("item-dialog"),c=new d;s.innerHTML=c.innerHTML,r.innerHTML='\n    <div class="dialogContentNoMedia">\n      <div class="dialogText">\n        <div class="dialogHeader">\n          Welcome!\n        </div>\n        This page is designed to mimic a living room device, so mouse interactions are disabled.<br/>\n        To interact with this page, use the following keys:\n        <ul>\n          <li>\n            Arrow Keys: navigate around the page and change the focused item.\n          </li>\n          <li>\n            Enter/Return/Space: select an item and view details about it.\n          </li>\n          <li>\n            Esc/Delete/Backspace: exit any currently-visible dialog.\n          </li>\n        </ul>\n      </div>\n      <button class="dialogButton" id="dialog-button">Let\'s go!</button>\n    </div>\n  ',r.showModal(),document.onkeydown=t=>{switch(t.code){case"Enter":case"Space":if(r.open){const e=document.getElementById("dialog-button");null!=e&&e===document.activeElement&&r.close()}else{t.preventDefault();const n=document.activeElement,i=e.get(n.dataset.setid)?.items?.get(n.dataset.itemid);null!=i&&(r.innerHTML=i.getDialogContent(),r.showModal())}break;case"Escape":case"Backspace":case"Delete":t.preventDefault(),r.close();break;case"ArrowDown":case"ArrowUp":case"ArrowLeft":case"ArrowRight":t.preventDefault(),r.open||function(e,t,s,l){const a=document.activeElement,o=a?.parentElement;let r=e,d=t;if(-1===e&&-1===t)r=0,d=0;else{const n=o?.childElementCount??0,i=document.getElementById("setContainers")?.childElementCount??0;switch(s){case"ArrowUp":d=0===t?i-1:t-1;break;case"ArrowDown":d=t===i-1?0:t+1;break;case"ArrowLeft":r=0===e?n-1:e-1;break;case"ArrowRight":r=e===n-1?0:e+1}}const c=document.getElementById("item-"+d+"-"+r);c?.scrollIntoView({behavior:"smooth",block:"center",inline:"nearest"}),c?.focus({preventScroll:!0}),((e,t)=>{n=e,i=t})(r,d)}(n,i,t.key);break;default:t.preventDefault(),console.log("Unsupported key pressed: "+t.key)}},document.onmousedown=e=>e.preventDefault(),window.addEventListener("wheel",(e=>e.preventDefault()),{passive:!1}),axios.get(location.origin+"/api/home").then((n=>{if(null!=n.data?.error)console.error("Error received:"),console.error(n.data.error);else if(null==n.data?.data||null==n.data?.data?.StandardCollection)console.log("No data received");else{const{containerSets:i,pageTitle:r}=function(e){const t=e.containers,n=e.text?.title?.full?.collection?.default?.content;return{containerSets:t.map(((e,t)=>{const n=e.set;return null!=n.items?new l(n,t):null!=n.refId?new a(n,t):(console.log("Encountered a set that is neither a fully loaded set nor a ref set:"),console.log(n),null)})),pageTitle:n}}(n.data.data.StandardCollection);document.title=r;let d="";i.forEach(((n,i)=>{null!=n&&(d+=n.setElement,null!=n.setId?e.set(n.setId,n):null!=n.refId?(n.setPostLoadCallback((s=>{document.getElementById("container-"+i).innerHTML=s.setElement,e.set(s.setId,s),t.delete(n.refId)})),t.set(n.refId,n)):(console.log("Encountered a set that is neither a full set nor a ref set:"),console.log(n)))})),s.innerHTML='<div id="setContainers">'+d+"</div>",o(t),s.addEventListener("scroll",(()=>{o(t)}))}})).catch((e=>{console.error("Error getting home page content:"),console.error(e)}))}()})();