"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(exports,"__esModule",{value:!0});var _mithril=require("mithril"),_mithril2=_interopRequireDefault(_mithril),_mithrilSlider=require("mithril-slider"),_mithrilSlider2=_interopRequireDefault(_mithrilSlider),_appAppStyler=require("app/app/styler"),_appAppStyler2=_interopRequireDefault(_appAppStyler),_mithrilSliderStyle=require("mithril-slider-style"),_mithrilSliderStyle2=_interopRequireDefault(_mithrilSliderStyle),_appAppCommon=require("app/app/common"),_appAppCommon2=_interopRequireDefault(_appAppCommon),_appPreloaderPreloader=require("app/preloader/preloader"),_appPreloaderPreloader2=_interopRequireDefault(_appPreloaderPreloader),_appAppGithub=require("app/app/github"),_appAppGithub2=_interopRequireDefault(_appAppGithub);_appAppStyler2.default.add("slider",_mithrilSliderStyle2.default);var loaded={},createPage=function(r){var p=r.currentIndex,e=r.listIndex,i=r.data,l=Math.abs(p-e)<2,t=l?(0,_mithril2.default)(".image-container",[(0,_mithril2.default)(".image",{config:function(r,p){p||_appAppCommon2.default.fadeInImage(r,i,function(){loaded[e]=!0})}}),loaded[e]?null:_appPreloaderPreloader2.default]):null;return(0,_mithril2.default)(".page",{key:e},t)},example={};example.view=function(r,e){return(0,_mithril2.default)("div",[_mithril2.default.component(_mithrilSlider2.default,{pageData:_appAppCommon2.default.getPageData,page:createPage,class:"example images"}),(0,_mithril2.default)(".slider-placeholder"),e.hideGithub?null:(0,_appAppGithub2.default)()])},exports.default=example,module.exports=exports.default;