/* ========================================================================
 * Bootstrap: scrollspy.js v3.0.2
 * http://getbootstrap.com/javascript/#scrollspy
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

+function(t){function s(e,o){var i,r=t.proxy(this.process,this);this.$element=t(e).is("body")?t(window):t(e),this.$body=t("body"),this.$scrollElement=this.$element.on("scroll.bs.scroll-spy.data-api",r),this.options=t.extend({},s.DEFAULTS,o),this.selector=(this.options.target||(i=t(e).attr("href"))&&i.replace(/.*(?=#[^\s]+$)/,"")||"")+" .nav li > a",this.offsets=t([]),this.targets=t([]),this.activeTarget=null,this.refresh(),this.process()}s.DEFAULTS={offset:10},s.prototype.refresh=function(){var s=this.$element[0]==window?"offset":"position";this.offsets=t([]),this.targets=t([]);{var e=this;this.$body.find(this.selector).map(function(){var o=t(this),i=o.data("target")||o.attr("href"),r=/^#\w/.test(i)&&t(i);return r&&r.length&&[[r[s]().top+(!t.isWindow(e.$scrollElement.get(0))&&e.$scrollElement.scrollTop()),i]]||null}).sort(function(t,s){return t[0]-s[0]}).each(function(){e.offsets.push(this[0]),e.targets.push(this[1])})}},s.prototype.process=function(){var t,s=this.$scrollElement.scrollTop()+this.options.offset,e=this.$scrollElement[0].scrollHeight||this.$body[0].scrollHeight,o=e-this.$scrollElement.height(),i=this.offsets,r=this.targets,l=this.activeTarget;if(s>=o)return l!=(t=r.last()[0])&&this.activate(t);for(t=i.length;t--;)l!=r[t]&&s>=i[t]&&(!i[t+1]||s<=i[t+1])&&this.activate(r[t])},s.prototype.activate=function(s){this.activeTarget=s,t(this.selector).parents(".active").removeClass("active");var e=this.selector+'[data-target="'+s+'"],'+this.selector+'[href="'+s+'"]',o=t(e).parents("li").addClass("active");o.parent(".dropdown-menu").length&&(o=o.closest("li.dropdown").addClass("active")),o.trigger("activate")};var e=t.fn.scrollspy;t.fn.scrollspy=function(e){return this.each(function(){var o=t(this),i=o.data("bs.scrollspy"),r="object"==typeof e&&e;i||o.data("bs.scrollspy",i=new s(this,r)),"string"==typeof e&&i[e]()})},t.fn.scrollspy.Constructor=s,t.fn.scrollspy.noConflict=function(){return t.fn.scrollspy=e,this},t(window).on("load",function(){t('[data-spy="scroll"]').each(function(){var s=t(this);s.scrollspy(s.data())})})}(jQuery);