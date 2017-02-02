# Content Slider for Mithril on mobile and desktop

Handles series of pageable content. This code is a Mithril component wrapper around [HammerJS](http://hammerjs.github.io/), with additional features.

**This repo tweaked by Tim Mensch to support Promises, carousel behavior and "dead" entries.**

## Examples

* [Slider Examples](http://arthurclemens.github.io/mithril-slider/index.html)


## Features

* Pages can be swiped or dragged.
* Page content can be anything that can be shown with HTML: a single image, a full web page, and so on.
* Pages can be grouped, for instance for series of thumbnails that are shown a group at a time.
* Page content can be lazily loaded (see example code).
* The slider can be controlled with next/previous buttons and queried for state.
* Right-to-left language support, using mirrored transitions.


## Installation

Use as npm module:

~~~bash
npm install mithril-slider
~~~

or download/clone from Github, then in the root directory: `npm install`

For working with the examples, see [Viewing the examples](#viewing-the-examples) below.



## Usage

~~~javascript
import slider from 'mithril-slider';
~~~

Call the slider as component, with (at least) parameters `pageData` and `page`:

~~~javascript
m.component(slider, {
	pageData: getPageData,
    page: createPage
})
~~~

For parameter `pageData`, create a function to fetch page data:

~~~javascript
const getPageData = () => {
    return m.request({
        method: 'GET',
        url: 'app/data/images.json',
        background: false
    });
};
~~~

The function needs to return a promise (which `m.request` does).

The data can be anything, as long as a list is passed in the end. For example:

	[
	    "app/images/img/1.jpg",
		"app/images/img/2.jpg",
		...
	]

or

	[
		{
			"title": "Love Valley, Cappadocia",
			"image": "app/images/img/1.jpg"
		},
		...
	]

For parameter `page`, create a function that returns a Mithril object for each single list item:

~~~javascript
const createPage = (opts) => {
	const data = opts.data;
    return m('.page', {
		style: {
			'background-image': 'url(' + data + ')'
		}
    });
};
~~~

This function will be called for all list items.

### Carousel behavior

To make it work like a carousel that displays a number of frames, you'll need to
tweak the CSS so that more than one frame is shown, and then set `centerIndex` to
the relative index of the item you want to center. So if you want to show three items,
you set `centerIndex` to 1; if you want to show five items, set it to 2. Whatever index
you select, that item should be centered.

~~~javascript
 m.component(slider, {
            pageData: ...,
            page: ...,
            centerIndex: 1
        });
~~~

### Dead items

If you want there to be extra items at the start and/or end that can't be selected,
set `reduceLength` to the number of dead items. Tested for 2, where the first and
last items can't be selected as the "center" item in a scroller.

Useful if you need a carousel that allows every possible item to be centered (selected).
You need to actually add extra "dead" items to the pageData array.

~~~javascript
 m.component(slider, {
            pageData: ...,
            page: ...,
            centerIndex: 1,
            reduceLength: 2
        });
~~~

Your createPage function will need to be modified if you want "dead" items there. For simplicity
I just put "null" in the slots where I want a dead item; if you do that, you can use code
that looks like this:

~~~javascript
const createPage = (opts) => {
	const data = opts.data;
    if (data === null) {
        return m("div.image.hidden"); // Use styles that make the div invisible, if necessary
    }
    // Normal page generation here
    return m('.page', {
		style: {
			'background-image': 'url(' + data + ')'
		}
    });
};
~~~


### Optimizing with lazy loading

The `createPage` function is called for all items in the list, so in the current form all images will get downloaded. For longer sliders this is not ideal, especially not on mobile.

We can optimize this by only loading the current, next and previous image:

~~~javascript
const createPage = (opts) => {
	const currentIndex = opts.currentIndex;
	const listIndex = opts.listIndex;
	const data = opts.data;
    const style = (Math.abs(currentIndex - listIndex) < 2)
        ? {
              'background-image': 'url(' + data + ')'
          }
        : {};
    return m('.page', {
        style: style
    });
};
~~~

### Sliding multiple pages

When showing more than one "page", for instance a series of thumbnails, simply use parameter `groupBy`:

~~~javascript
const mySlider = m.component(slider, {
    pageData: getPageData,
    page: createPage,
    groupBy: 3
});
~~~

For responsive interfaces, the number of pages within a group should be set dynamically (for instance divide the window width by the number of items to show).

No additional HTML markup is created for groups.

Use CSS to set the proper page size for each element.



### Accessing the slider directly

The above example is fine for simply interacting with the slider (swiping/dragging). For more advanced functionality - for instance to conditionally show next/previous buttons - we need to access the slider instance.

By passing parameter `sliderController`, we can get a reference to the slider controller. The parameter is actually a function reference, and we can use `m.prop` to store the controller for later reference:

~~~javascript
const app = {};
app.controller = () => {
    return {
        sliderController: m.prop()
    };
};
app.view = (ctrl) => {
    const mySlider = m.component(slider, {
        pageData: getPageData,
        page: page,
        sliderController: ctrl.sliderController,
        ...
    });
	...
};
~~~

Now we can access slider controller methods:

~~~javascript
const sliderController = ctrl.sliderController();
const button = sliderController ? m('a.next', {
    class: sliderController.hasNext() ? 'enabled' : '',
    onclick: () => sliderController.goNext()
}, 'Next') : null;
~~~


### Styling

Note: With horizontal orientation and `position: absolute`, the page must have a width;
With vertical orientation and `position: absolute`, the page must have a height.


Mithril Slider comes with a JavaScript based styling that uses [j2c](https://github.com/pygy/j2c), but there is no hard dependency - you can provide your own styles in any other way, for instance with the CSS file `mithril-slider.css` (generated by npm script `standalone-css`).


#### j2c styling

The j2c way goes like this. In your application file:

~~~javascript
import style from 'mithril-slider-style';
~~~

The examples app dir contains a convenience function to add the styles to the document head:

~~~javascript
import styler from 'app/app/styler';
styler.add('mithril-slider', style);
~~~


### Configuration parameters

| **Parameter** |  **Mandatory** | **Type** | **Default** | **Description** |
| ------------- | -------------- | -------- | ----------- | --------------- |
| **page** | required | Function :: ({data :: any, listIndex :: Number, currentIndex :: Number}) => Mithril Template or String | | Function that creates an page from data |
| **pageData** | required | Function :: () => Promise | | Function that fetches a list of page data; should return a promise; after resolving `m.redraw` is called |
| **sliderController** | optional | Function :: () => Function | | Receives the slider controller function |
| **class** | optional | String |  | Extra CSS class appended to 'slider' |
| **duration** | optional | Number | 200 | Default transition duration in ms (when not dragging); when dragging, duration is dependent on dragging velocity, this setting is the maximum duration for slow drags |
| **orientation** | optional | String | 'horizontal' | Either 'horizontal', 'vertical' or 'all'; translates to HammerJS's `direction` |
| **rtl** | optional | Boolean | `false` | Right-to-left language support (for instance Arabic and Hebrew); set to true to mirror transitions |
| **groupBy** | optional | Number | | Number of items within a group |
| **before** | optional | Mithril template or component | | Content shown before the pages; has class `before` |
| **after** | optional | Mithril template or component | | Content shown after the pages; has class `after` |
| **index** | optional | Number | 0 | Starting page index |
| **cancelDragFactor** | optional | Number | 1/5 | Fraction of page width below which the transition is cancelled |
| **getState**  | optional | Function(state {Object}) | | Callback function that accepts the slider state (Object with properties `index` {Number}, `hasNext` {Booleam}, `hasPrevious` {Boolean}, `pageEl` {HTMLElement}) |


### Slider controller methods

| **Method** |  **Type** | **Description** |
| ---------- | --------- | --------------- |
| **index** | index() => Number | The current page (index of the page list) |
| **hasNext** | hasNext() => Boolean | True if the current page has a next page  |
| **hasPrevious** | hasPrevious() => Boolean | True if the current page has a previous page  |
| **goTo** | goTo(index :: Number, duration :: Number) | Change the current page to the given index; transition duration is optional |
| **goCurrent** | goCurrent(duration :: Number) | Go to current page; useful after resize; transition duration is optional |
| **goNext** | goNext(duration :: Number) | Change the current page to the next index; if no next index exists, index is unchanged; transition duration is optional |
| **goPrevious** | goPrevious(duration :: Number) | Change the current page to the previous index; if no previous index exists, index is unchanged; transition duration is optional |



## Viewing the examples

* `cd examples/src`
* `npm install`

Start up a local server, for instance:

* `npm install -g http-server`

Then:

* `http-server .`


## Developing

The examples are currently set up in 2 ways (to keep things relatively flexible):

* `src` uses SystemJS - see the path configuration in examples/src/config.js
* `build` uses Browserify - see examples/src/scripts/build.js


For compiling/transpiling, you need to install the following:

~~~bash
npm install babel -g
~~~

### Scripts

Compile (transpile) everything:

~~~bash
npm run transpile
~~~

transpiles all es6 files to es5

While developing:

~~~bash
npm run watch
~~~

Watches changes to es6 files


## Size

Minified and gzipped: 1.8 Kb



## Dependencies

* [Mithril](https://www.npmjs.com/package/mithril)
* [HammerJS](http://hammerjs.github.io/)

Optional dependency:

* [j2c](https://github.com/pygy/j2c) - for creating js stylesheets



## Licence

MIT
