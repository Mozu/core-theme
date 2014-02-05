/* ========================================================================
 * Bootstrap: tooltip.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

/* ========================================================================
 * Bootstrap: popover.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#popovers
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

/* ========================================================================
 * Bootstrap: transition.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#transitions
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

+function(t){var e=function(t,e){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null,this.init("tooltip",t,e)};e.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1},e.prototype.init=function(e,o,i){this.enabled=!0,this.type=e,this.$element=t(o),this.options=this.getOptions(i);for(var n=this.options.trigger.split(" "),s=n.length;s--;){var r=n[s];if("click"==r)this.$element.on("click."+this.type,this.options.selector,t.proxy(this.toggle,this));else if("manual"!=r){var p="hover"==r?"mouseenter":"focus",a="hover"==r?"mouseleave":"blur";this.$element.on(p+"."+this.type,this.options.selector,t.proxy(this.enter,this)),this.$element.on(a+"."+this.type,this.options.selector,t.proxy(this.leave,this))}}this.options.selector?this._options=t.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},e.prototype.getDefaults=function(){return e.DEFAULTS},e.prototype.getOptions=function(e){return e=t.extend({},this.getDefaults(),this.$element.data(),e),e.delay&&"number"==typeof e.delay&&(e.delay={show:e.delay,hide:e.delay}),e},e.prototype.getDelegateOptions=function(){var e={},o=this.getDefaults();return this._options&&t.each(this._options,function(t,i){o[t]!=i&&(e[t]=i)}),e},e.prototype.enter=function(e){var o=e instanceof this.constructor?e:t(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);return clearTimeout(o.timeout),o.hoverState="in",o.options.delay&&o.options.delay.show?(o.timeout=setTimeout(function(){"in"==o.hoverState&&o.show()},o.options.delay.show),void 0):o.show()},e.prototype.leave=function(e){var o=e instanceof this.constructor?e:t(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);return clearTimeout(o.timeout),o.hoverState="out",o.options.delay&&o.options.delay.hide?(o.timeout=setTimeout(function(){"out"==o.hoverState&&o.hide()},o.options.delay.hide),void 0):o.hide()},e.prototype.show=function(){var e=t.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){if(this.$element.trigger(e),e.isDefaultPrevented())return;var o=this.tip();this.setContent(),this.options.animation&&o.addClass("fade");var i="function"==typeof this.options.placement?this.options.placement.call(this,o[0],this.$element[0]):this.options.placement,n=/\s?auto?\s?/i,s=n.test(i);s&&(i=i.replace(n,"")||"top"),o.detach().css({top:0,left:0,display:"block"}).addClass(i),this.options.container?o.appendTo(this.options.container):o.insertAfter(this.$element);var r=this.getPosition(),p=o[0].offsetWidth,a=o[0].offsetHeight;if(s){var h=this.$element.parent(),l=i,f=document.documentElement.scrollTop||document.body.scrollTop,c="body"==this.options.container?window.innerWidth:h.outerWidth(),u="body"==this.options.container?window.innerHeight:h.outerHeight(),d="body"==this.options.container?0:h.offset().left;i="bottom"==i&&r.top+r.height+a-f>u?"top":"top"==i&&r.top-f-a<0?"bottom":"right"==i&&r.right+p>c?"left":"left"==i&&r.left-p<d?"right":i,o.removeClass(l).addClass(i)}var v=this.getCalculatedOffset(i,r,p,a);this.applyPlacement(v,i),this.$element.trigger("shown.bs."+this.type)}},e.prototype.applyPlacement=function(t,e){var o,i=this.tip(),n=i[0].offsetWidth,s=i[0].offsetHeight,r=parseInt(i.css("margin-top"),10),p=parseInt(i.css("margin-left"),10);isNaN(r)&&(r=0),isNaN(p)&&(p=0),t.top=t.top+r,t.left=t.left+p,i.offset(t).addClass("in");var a=i[0].offsetWidth,h=i[0].offsetHeight;if("top"==e&&h!=s&&(o=!0,t.top=t.top+s-h),/bottom|top/.test(e)){var l=0;t.left<0&&(l=-2*t.left,t.left=0,i.offset(t),a=i[0].offsetWidth,h=i[0].offsetHeight),this.replaceArrow(l-n+a,a,"left")}else this.replaceArrow(h-s,h,"top");o&&i.offset(t)},e.prototype.replaceArrow=function(t,e,o){this.arrow().css(o,t?50*(1-t/e)+"%":"")},e.prototype.setContent=function(){var t=this.tip(),e=this.getTitle();t.find(".tooltip-inner")[this.options.html?"html":"text"](e),t.removeClass("fade in top bottom left right")},e.prototype.hide=function(){function e(){"in"!=o.hoverState&&i.detach()}var o=this,i=this.tip(),n=t.Event("hide.bs."+this.type);return this.$element.trigger(n),n.isDefaultPrevented()?void 0:(i.removeClass("in"),t.support.transition&&this.$tip.hasClass("fade")?i.one(t.support.transition.end,e).emulateTransitionEnd(150):e(),this.$element.trigger("hidden.bs."+this.type),this)},e.prototype.fixTitle=function(){var t=this.$element;(t.attr("title")||"string"!=typeof t.attr("data-original-title"))&&t.attr("data-original-title",t.attr("title")||"").attr("title","")},e.prototype.hasContent=function(){return this.getTitle()},e.prototype.getPosition=function(){var e=this.$element[0];return t.extend({},"function"==typeof e.getBoundingClientRect?e.getBoundingClientRect():{width:e.offsetWidth,height:e.offsetHeight},this.$element.offset())},e.prototype.getCalculatedOffset=function(t,e,o,i){return"bottom"==t?{top:e.top+e.height,left:e.left+e.width/2-o/2}:"top"==t?{top:e.top-i,left:e.left+e.width/2-o/2}:"left"==t?{top:e.top+e.height/2-i/2,left:e.left-o}:{top:e.top+e.height/2-i/2,left:e.left+e.width}},e.prototype.getTitle=function(){var t,e=this.$element,o=this.options;return t=e.attr("data-original-title")||("function"==typeof o.title?o.title.call(e[0]):o.title)},e.prototype.tip=function(){return this.$tip=this.$tip||t(this.options.template)},e.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},e.prototype.validate=function(){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},e.prototype.enable=function(){this.enabled=!0},e.prototype.disable=function(){this.enabled=!1},e.prototype.toggleEnabled=function(){this.enabled=!this.enabled},e.prototype.toggle=function(e){var o=e?t(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type):this;o.tip().hasClass("in")?o.leave(o):o.enter(o)},e.prototype.destroy=function(){this.hide().$element.off("."+this.type).removeData("bs."+this.type)};var o=t.fn.tooltip;t.fn.tooltip=function(o){return this.each(function(){var i=t(this),n=i.data("bs.tooltip"),s="object"==typeof o&&o;n||i.data("bs.tooltip",n=new e(this,s)),"string"==typeof o&&n[o]()})},t.fn.tooltip.Constructor=e,t.fn.tooltip.noConflict=function(){return t.fn.tooltip=o,this}}(window.jQuery),+function(t){var e=function(t,e){this.init("popover",t,e)};if(!t.fn.tooltip)throw new Error("Popover requires tooltip.js");e.DEFAULTS=t.extend({},t.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),e.prototype=t.extend({},t.fn.tooltip.Constructor.prototype),e.prototype.constructor=e,e.prototype.getDefaults=function(){return e.DEFAULTS},e.prototype.setContent=function(){var t=this.tip(),e=this.getTitle(),o=this.getContent();t.find(".popover-title")[this.options.html?"html":"text"](e),t.find(".popover-content")[this.options.html?"html":"text"](o),t.removeClass("fade top bottom left right in"),t.find(".popover-title").html()||t.find(".popover-title").hide()},e.prototype.hasContent=function(){return this.getTitle()||this.getContent()},e.prototype.getContent=function(){var t=this.$element,e=this.options;return t.attr("data-content")||("function"==typeof e.content?e.content.call(t[0]):e.content)},e.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")},e.prototype.tip=function(){return this.$tip||(this.$tip=t(this.options.template)),this.$tip};var o=t.fn.popover;t.fn.popover=function(o){return this.each(function(){var i=t(this),n=i.data("bs.popover"),s="object"==typeof o&&o;n||i.data("bs.popover",n=new e(this,s)),"string"==typeof o&&n[o]()})},t.fn.popover.Constructor=e,t.fn.popover.noConflict=function(){return t.fn.popover=o,this}}(window.jQuery),+function(t){function e(){var t=document.createElement("bootstrap"),e={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var o in e)if(void 0!==t.style[o])return{end:e[o]}}t.fn.emulateTransitionEnd=function(e){var o=!1,i=this;t(this).one(t.support.transition.end,function(){o=!0});var n=function(){o||t(i).trigger(t.support.transition.end)};return setTimeout(n,e),this},t(function(){t.support.transition=e()})}(window.jQuery);