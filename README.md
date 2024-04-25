# Disney Interview Project

## Overview
This is the backing code for my submission for the take-home coding assignment as part of the Disney interview process.

To view the app, visit https://disney-interview-project-8a34baf628fa.herokuapp.com/

## Supported Interactions/Browsers
- This project was built to work best on Google Chrome, but also works well on Firefox or Edge. _Safari is not supported._
- Mouse interactions (specifically, clicking and scrolling) are disabled to better mimic a living room device scenario.
- Since this page only supports keyboard navigation, it will not work with touch screens/mobile devices.
- Keyboard interactions are supported as follows (to mimic remote control interactions):
  - **Arrow Keys:** navigate around the page, changing which item is focused.
  - **Enter/Return/Space:** select an item (displays a dialog of information about the item).
  - **Escape/Delete/Backspace:** close the item dialog and go back to scrolling through items.

## Key Features
- Items smoothly scale up and show a white border when focused, then scale back down and remove the border when unfocused
- Ref sets only load once they are at least partly visible on the page
- Tile images only display once they are fully loaded so no partial images show up; tiles show a skeleton loading state while the image is loading
- If an image fails to load (see The Mandalorian tile in the first row), a default tile with the item's title is shown
- Overall page and individual sets scroll smoothly as you navigate through items
- Selecting an item (via Enter/Return/Space keys) displays a dialog with information about that item:
  - If the item has associated video art, the dialog loops that video art with item details on top of it
  - If the item has no video art but has a tile image, the dialog displays the image with item details below it
  - If the item has no video art or tile image, the dialog just displays item details