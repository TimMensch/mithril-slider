"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(exports,"__esModule",{value:!0});var _mithril=require("mithril"),_mithril2=_interopRequireDefault(_mithril),_mithrilSlider=require("mithril-slider"),_mithrilSlider2=_interopRequireDefault(_mithrilSlider),_appAppCommon=require("app/app/common"),_appAppCommon2=_interopRequireDefault(_appAppCommon),_appPreloaderPreloader=require("app/preloader/preloader"),_appPreloaderPreloader2=_interopRequireDefault(_appPreloaderPreloader),_appAppStyler=require("app/app/styler"),_appAppStyler2=_interopRequireDefault(_appAppStyler),_pagesStyle=require("./pages-style"),_pagesStyle2=_interopRequireDefault(_pagesStyle);_appAppStyler2.default.add("pages",_pagesStyle2.default);var dummyText="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",DATA_URL="app/pages/data.json",callRight=function(i){for(var t=arguments.length,a=Array(t>1?t-1:0),e=1;t>e;e++)a[e-1]=arguments[e];return function(){for(var t=arguments.length,r=Array(t),e=0;t>e;e++)r[e]=arguments[e];return i.apply(void 0,r.concat(a))}},createPage=function(e){var i=e.currentIndex,t=e.listIndex,a=e.data,r=Math.abs(i-t)<2,l=r?(0,_mithril2.default)(".page-content",(0,_mithril2.default)(".article",[(0,_mithril2.default)(".image-container",[(0,_mithril2.default)(".image",{config:function(e,t){t||_appAppCommon2.default.fadeInImage(e,a.image)}}),_appPreloaderPreloader2.default]),(0,_mithril2.default)(".article-content",[(0,_mithril2.default)(".title",a.title),(0,_mithril2.default)("p",dummyText)])])):null;return(0,_mithril2.default)(".page",{key:t},l)},example={};example.view=function(){return _mithril2.default.component(_mithrilSlider2.default,{pageData:callRight(_appAppCommon2.default.getPageData,DATA_URL),page:createPage,class:"example pages"})},exports.default=example,module.exports=exports.default;