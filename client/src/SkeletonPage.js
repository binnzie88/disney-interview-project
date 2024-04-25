import { createSkeletonSet } from "./utils";

export class SkeletonPage extends HTMLElement {
  constructor() {
    super();
    let skeletonSets = "";
    for (let i = 0; i < 10; i++) {
      skeletonSets += createSkeletonSet(i);
    }
    this.innerHTML = `
      <div id="setContainers">
        `+skeletonSets+`
      </div>
    `;
  }
}

customElements.define('skeleton-page', SkeletonPage);