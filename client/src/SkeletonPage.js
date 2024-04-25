import { createSkeletonSet } from "./utils";

/**
 * This is the initial skeleton home page that displays while all the individual sets/items load
 */
export class SkeletonPage {
  constructor() {
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
