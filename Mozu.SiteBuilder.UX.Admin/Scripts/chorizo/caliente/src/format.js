(function(win, doc) {

	class ChorizoContentEditor {
		constructor() {}

		revealEditor(me) {
			var bar,
			styles = [{
				label: 'Heading 1',
				tagName: 'h1'
			}, {
				label: 'Heading 2',
				tagName: 'h2'
			}, {
				label: 'Normal',
				tagName: 'p'
			}, {
				label: 'Special',
				tagName: 'div',
				className: 'special'
			}],
			counter,
			contentFormatter = [
				'<ul>',
					'<li data-role="styles" class="mz-cms-styles"',
						'<span>Styles</span>',
						'<i class="fa fa-caret-down"></i>',
						'<ul></ul>',
					'</li>',
					'<li data-role="bold"><i class="fa fa-bold"></i></li>',
					'<li data-role="italic"><i class="fa fa-italic"></i></li>',
					'<li data-role="underline"><i class="fa fa-underline"></i></li>',
					'<li data-role="createLink"><i class="fa fa-link"></i></li>',
					'<li data-role="unlink"><i class="fa fa-unlink"></i></li>',
					'<li data-role="justifyLeft"><i class="fa fa-align-left"></i></li>',
					'<li data-role="justifyCenter"><i class="fa fa-align-center"></i></li>',
					'<li data-role="justifyRight"><i class="fa fa-align-right"></i></li>',
					'<li data-role="insertUnorderedList"><i class="fa fa-list-ul"></i></li>',
					'<li data-role="insertOrderedList"><i class="fa fa-list-ol"></i></li>',
					'<li data-role="indent"><i class="fa fa-indent"></i></li>',
					'<li data-role="outdent"><i class="fa fa-outdent"></i></li>',
				'</ul>'
			].join(''),
			contentEditor = doc.createElement('div'),
			urlTooltip = doc.createElement('div');

			var addClass = function (element, className) {
				if (element.getAttribute('class')) {
					element.setAttribute('class', element.getAttribute('class') + ' ' + className);
				} else {
					element.setAttribute('class', className);
				}
				return element;
			};

			urlTooltip = addClass(urlTooltip, 'mz-cms-tooltip');
			urlTooltip.innerHTML = '<input type="text" placeholder="http://">';

			var removeClass = function (element, className) {
				if (element.getAttribute('class')) {
					var newClass = element.getAttribute('class').split(className);
					if (newClass.length > 2) {
						newClass = newClass[0] + newClass[1];
					} else if (newClass.length == 1) {
						newClass = newClass[0];
					}

					element.setAttribute('class', newClass);
				}

				return element;
			};

			var _editingState = function () {
				me.element.querySelector('.mz-cms-content').contentEditable = true;
				me.element.setAttribute('class', me.element.getAttribute('class') + ' mz-cms-state-editing');
			}

			_editingState();

			contentEditor.setAttribute('class', 'mz-cms-format-bar');
			contentEditor.innerHTML = contentFormatter;


			if (!doc.querySelector('.mz-cms-tooltip')) {
				doc.body.appendChild(urlTooltip);
			}

			if (!doc.querySelector('.mz-cms-format-bar')) {
				doc.body.appendChild(contentEditor);
			} else {
				contentEditor.parentNode.removeChild(contentEditor);
				doc.body.appendChild(contentEditor);
			}

			counter = -1 * (contentEditor.offsetHeight / 2);

			var revealFormatter = setInterval(function () {
				counter += 1;
				contentEditor.style.top = counter.toString() + 'px';
				if (counter == 0) {
					clearInterval(revealFormatter);
				}
			}, 2);

			var customStyle = function (item) {
				var style = JSON.parse(item.getAttribute('data-style')),
					element;

				toggleDisplay('[data-role="styles"] ul');
				doc.execCommand('formatBlock', false, style.tagName);
			};

			var _buildStyles = function (styles) {
				styles.forEach( function (style, index) {
					var li = doc.createElement('li');
					li.innerHTML = style.label;
					li.setAttribute('data-style', JSON.stringify(style));
					li.setAttribute('data-role', 'style');
					doc.querySelector('[data-role="styles"] ul').appendChild(li);
				});
			};

			var createLink = function () {
				doc.execCommand('createLink', false, '#mz-cms-temp-link');
				if (doc.getElementsByClassName('mz-cms-tooltip')[0].offsetParent === null) {
					showTooltip();
				}
			};

			var showTooltip = function () {
				var posEl = doc.querySelector('[href="#mz-cms-temp-link"]'),
					left = 0,
					top = posEl.offsetHeight,
					coordinates = getOffset(posEl);

				posEl.setAttribute('style', 'display: inline-block;');
				posEl.appendChild(urlTooltip);
				urlTooltip.setAttribute('style', 'display: block; left: ' + posEl.offsetLeft + 'px; top: ' + (posEl.offsetHeight + posEl.offsetTop) + 'px;');

				urlTooltip.onchange = function () {
					this.parentNode.setAttribute('href', this.querySelector('input').value);
					this.querySelector('input').value = '';
					this.parentNode.removeChild(this);
					updateWidget();
				}

				function getOffset (elem) {

					if (elem.parentElement.id !== 'page-wrapper') {
						top += elem.offsetTop;

						if (elem.className != 'mz-layout-col mz-cms-col- mz-editing mz-cms-show-zone' && elem.tagName != 'B' && elem.tagName != 'I' && elem.tagName != 'U') {
							left += elem.offsetLeft;
						}
						getOffset(elem.parentElement);
					}

					return {x: left, y: top};
				}

				function closest (elem, selector) {
					var matchesSelector = elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;

					while (elem) {
						if (matchesSelector.call(elem, selector)) {
							return elem;
						} else {
							elem = elem.parentElement;
						}
					}
					return false;
				}
			};

			var _toggleStyles = function () {
				toggleDisplay('[data-role="styles"] ul');
			};

			var toggleDisplay = function (element) {
				var elementStyle = doc.querySelector(element).style.display;

				if (elementStyle === 'none' || elementStyle === '') {
					doc.querySelector(element).style.display = 'block';
				} else {
					doc.querySelector(element).style.display = 'none';
				}
			};

			var range = function (cfg) {
				var range,
					selection;

				if (!cfg) {
					selection = win.getSelection();

					range = selection.getRangeAt(0);

					return {
						container: range.commonAncestorContainer,
						endContainer: range.endContainer,
						endOffset: range.endOffset,
						startContainer: range.startContainer,
						startOffset: range.startOffset
					};
				}

				range = doc.createRange();

				range.selectNodeContents(cfg.container);
				range.setEnd(cfg.endContainer, cfg.endOffset);
				range.setStart(cfg.startContainer, cfg.startOffset);

				selection = win.getSelection();
				selection.removeAllRangers();
				selection.addRange(range);
			};

			_buildStyles(styles);

			var updateWidget = function () {
				var urlBox = me.element.querySelector('.mz-cms-tooltip');
				if (urlBox !== null) {
					urlBox.parentNode.removeChild(urlBox);
				}

				var newData = me.element.querySelector('.mz-cms-content').innerHTML;
				var oldData = JSON.parse(me.element.getAttribute('data-widget'));
				oldData.config.body = newData;
				me.element.setAttribute('data-widget', JSON.stringify(oldData));
			};

			contentEditor.onmousedown = function (e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				var item = e.target, 
					role;

				if (!item.hasAttribute('data-role')) {
					role = item.parentElement.getAttribute('data-role');
				} else {
					role = item.getAttribute('data-role');
				}

				switch (role) {
					case 'createLink':
						createLink();
						break;
					case 'style':
						customStyle(item);
						break;
					case 'styles':
						_toggleStyles();
						break;
					default:
						doc.execCommand(role, false, null);
						break;
				}
			}

			doc.querySelector('.mz-cms-content').onclick = function (event) {
				if (event.target.tagName == 'A') {
					urlTooltip.setAttribute('style', 'display: block; left: ' + event.target.offsetLeft + 'px; top: ' + (event.target.offsetHeight + event.target.offsetTop) + 'px;');
					if (event.target.getAttribute('href') != '#mz-cms-temp-link') {
						urlTooltip.querySelector('input').value = event.target.getAttribute('href');
					} else {
						urlTooltip.querySelector('input').value = '';
					}
					event.target.appendChild(urlTooltip);
				} else if (event.target.parentNode.className != 'mz-cms-tooltip') {
					urlTooltip.style.display = 'none';
					urlTooltip.querySelector('input').value = '';
					urlTooltip.parentNode.removeChild(urlTooltip);
				}
			}

			doc.onclick = function (event) {
				if (event.target.parentElement.tagName != 'LI' && event.target.parentElement.tagName != 'UL' && event.target.parentElement.tagName != 'A' && event.target.parentElement.tagName != 'I') {
					updateWidget();
					this.querySelector('.mz-cms-content').contentEditable = false;
					me.element = removeClass(me.element, 'mz-cms-state-editing');
					contentEditor.style.top = (-1 * (contentEditor.offsetHeight)).toString() + 'px';

					if (doc.querySelector('.mz-cms-format-bar')) {
						if (contentEditor.parentNode) {
							contentEditor.parentNode.removeChild(contentEditor);
						}
					}
				}
			}
		}
	}

	doc.addEventListener('DOMContentLoaded', function(){
		if (!win.Chorizo) {
			win.Chorizo = {};
		}

		Chorizo.contentEditor = new ChorizoContentEditor();
	});

})(window, document)