/*jslint browser: true, indent: 2, nomen: true */

(function (window) {
  'use strict';
  var collapseFunction, xjsonPrototype, properties, addShadowRoot, declaredProps;


  /**
   * Create and add the shadow root to obj.root
   * If necessary, it will rewrite the style and add it to the document head
   *
   * @param {object} obj The element to add the shadow root.
   * @param {string} idTemplate The id of the template element.
   * @param {string} [elementName] The name element, used for rewriting the css.
   *                 If omited, it will use the idTemplate as name.
   */
  addShadowRoot = (function () {
    var importDoc, shimStyle;
    importDoc = (document._currentScript || document.currentScript).ownerDocument;

    if (window.ShadowDOMPolyfill) {
      shimStyle = document.createElement('style');
      document.head.insertBefore(shimStyle, document.head.firstChild);
    }

    return function (obj, idTemplate, elementName) {
      var template, list;

      obj.root = obj.createShadowRoot();
      template = importDoc.getElementById(idTemplate);
      obj.root.appendChild(template.content.cloneNode(true));

      if (window.ShadowDOMPolyfill) {
        list = obj.root.getElementsByTagName('style');
        Array.prototype.forEach.call(list, function (style) {
          if (!template.shimmed) {
            shimStyle.innerHTML += style.innerHTML
              .replace(/:host\b/gm, elementName || idTemplate)
              .replace(/::shadow\b/gm, ' ')
              .replace(/::content\b/gm, ' ');
          }
          style.parentNode.removeChild(style);
        });
        template.shimmed = true;
      }
    };
  }());



  /**
   * Uses Object.defineProperty to add setters and getters
   * to each property of the element.
   *
   * @param {object} obj The element to add the shadow root.
   * @param {object} props Object with the properties.
   */
  declaredProps = (function () {
    var exports = {};

    function toHyphens(str) {
      return str.replace(/([A-Z])/g, '-$1').toLowerCase();
    }
    function toCamelCase(str) {
      return str.split('-')
        .map(function (x, i) {
          return i === 0 ? x : x[0].toUpperCase() + x.slice(1);
        }).join('');
    }

    exports.syncProperty = function (obj, props, attr, val) {
      var name = toCamelCase(attr);
      if (props[name]) {
        obj[name] = JSON.parse(val);
      }
    };

    exports.init = function (obj, props) {
      Object.defineProperty(obj, 'props', {
        enumerable : false,
        configurable : true,
        value : {}
      });

      Object.keys(props).forEach(function (name) {
        var attrName = toHyphens(name), desc, value;

        desc = props[name].type ? props[name] : { type : props[name] };
        value = typeof desc.value === 'function' ? desc.value() : desc.value;
        obj.props[name] = obj[name] || value;

        if (obj.getAttribute(attrName) !== null) {
          obj.props[name] = JSON.parse(obj.getAttribute(attrName));
        }
        Object.defineProperty(obj, name, {
          get : function () {
            return obj.props[name] || JSON.parse(obj.getAttribute(attrName));
          },
          set : function (val) {
            var old = obj.props[name];
            obj.props[name] = val;
            if (typeof obj[desc.observer] === 'function') {
              obj[desc.observer](val, old);
            }
          }
        });
      });
    };

    return exports;
  }());

  function isCollapsible(obj) {
    return Array.isArray(obj) || (typeof obj === 'object' && obj !== null);
  }
  collapseFunction = function (collapser) {
    collapser.addEventListener('click', function () {
      var ul = this.parentNode.getElementsByTagName('ul')[0];

      if (ul.style.display === 'none') {
        ul.style.display = 'block';
        this.innerHTML = '-';
      } else {
        ul.style.display = 'none';
        this.innerHTML = '+';
      }
    });
  };

  function str(obj) {
    var head, elements, tail, collapser;
    collapser = '<div class="collapser">-</div>';


    if (Array.isArray(obj)) {
      head = '[<ul class="array collapsible">';
      elements = obj.map(function (ele) {
        var col = (isCollapsible(ele)) ? collapser : '';

        return '<li>' + col + str(ele);
      });

      tail = (function (ele) {
        var out = '</ul>]';
        return ele.length > 0 ? '</li>' + out : out;
      }(elements));

      return head + elements.join(',</li>') + tail;
    }


    if (typeof obj === 'object') {
      // The case of null
      if (obj === null) {
        return '<span class="null">null</span>';
      }

      head = '{<ul class="obj collapsible">';
      elements = Object.keys(obj).map(function (key) {
        var col = (isCollapsible(obj[key])) ? collapser : '';

        return '<li>' + col + '<span class="prop"><span class="q">"</span>' +
          key + '<span class="q">"</span></span>: ' +
          str(obj[key]);
      });

      tail = (function (ele) {
        var out = '</ul>}';
        return ele.length > 0 ? '</li>' + out : out;
      }(elements));

      return head + elements.join(',</li>') + tail;
    }


    // Primitive values
    if (typeof obj === 'number') {
      return '<span class="num">' + JSON.stringify(obj) + '</span>';
    }
    if (typeof obj === 'string') {
      return '<span class="string">' + JSON.stringify(obj) + '</span>';
    }
    if (typeof obj === 'boolean') {
      return '<span class="bool">' + JSON.stringify(obj) + '</span>';
    }


    // In case of some weird case.
    return '<span>' + JSON.stringify(obj, null, ' ') + '</span>';
  }


  xjsonPrototype = Object.create(window.HTMLElement.prototype);
  properties = {
    data : {
      value : '',
      type : 'Object',
      observer : 'dataChanged'
    }
  };
  xjsonPrototype.dataChanged = function (data) {
    var container = this.root.getElementById('container');

    if (data === '') {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = str(data);


    // Adding the function to collapse
    (function (container) {
      var list = container.querySelectorAll('.collapser');

      Array.prototype.forEach.call(list, collapseFunction);
    }(container));

  };

  /*jslint unparam:true*/
  xjsonPrototype.attributeChangedCallback = function (attr, oldVal, newVal) {
    declaredProps.syncProperty(this, properties, attr, newVal);
  };
  /*jslint unparam:false*/

  xjsonPrototype.createdCallback = function () {
    addShadowRoot(this, 'x-json');
    declaredProps.init(this, properties);
    this.dataChanged(this.data);
  };
  document.registerElement('x-json', {
    prototype : xjsonPrototype
  });
}(this));

