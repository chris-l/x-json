/*jslint indent: 2, nomen: true, regexp: true */
/*global HTMLElement, map, window, document*/

(function () {
  'use strict';
  var importDoc, collapseFunction, xjsonPrototype, properties, map;

  map = Function.prototype.call.bind(Array.prototype.map);
  importDoc = (document._currentScript || document.currentScript).ownerDocument;


  /**
   * Create and add the shadow root to obj.root
   * If necessary, it will rewrite the style and add it to the document head
   *
   * @param {object} obj The element to add the shadow root.
   * @param {string} idTemplate The id of the template element.
   * @param {string} [elementName] The name element, used for rewriting the css.
   *                 If omited, it will use the idTemplate as name.
   */
  function addShadowRoot(obj, idTemplate, elementName) {
    var template, styleStr, newStyle, hasStyle, dummy;

    obj.root = obj.createShadowRoot();
    template = importDoc.querySelector('#' + idTemplate);
    obj.root.appendChild(template.content.cloneNode(true));

    hasStyle = /<style(.|\n)*<\/style>/m;
    if (window.ShadowDOMPolyfill && hasStyle.test(template.innerHTML)) {
      dummy = document.createElement('head');
      dummy.innerHTML = template.innerHTML;
      styleStr = map(dummy.getElementsByTagName('style'), function (style) {
        return style.innerHTML
          .replace(/:host/gm, elementName || idTemplate).replace(/::content/gm, '')
          .trim();
      }).join("\n");
      dummy = null;

      newStyle = document.createElement('style');
      newStyle.innerHTML = styleStr;
      document.getElementsByTagName('head')[0].appendChild(newStyle);
    }
  }



  /**
   * Uses Object.defineProperty to add setters and getters
   * to each property of the element.
   *
   * Each property is reflected to the equivalent DOM attribute
   * @param {object} obj The element to add the shadow root.
   * @param {object} props Object with the properties.
   */
  function prepareProperties(obj, props) {
    function toHyphens(str) {
      return str.replace(/([A-Z])/g, '-$1').toLowerCase();
    }
    function convert(val, desc) {
      if (desc.type === Number) {
        return parseInt(val, 10);
      }
      if (desc.type === String) {
        return String(val);
      }
      return val;
    }
    obj.props = {};

    Object.keys(props).forEach(function (name) {
      var attrName, desc, value;

      desc = props[name];
      attrName = toHyphens(name);
      value = desc.value;
      if (typeof value === 'function') {
        value = value();
      }

      if (obj.getAttribute(attrName) === null) {
        if (typeof obj.props[name] !== 'object') {
          obj.setAttribute(attrName, obj.props[name]);
        } else {
          obj.setAttribute(attrName, value);
        }
      }
      Object.defineProperty(obj, name, {
        get : function () {
          return obj.props[name] || convert(obj.getAttribute(attrName), desc) || value;
        },
        set : function (val) {
          obj.props[name] = val;
          if (typeof val !== 'object') {
            obj.setAttribute(attrName, val);
          }
          if (typeof obj[desc.observer] === 'function') {
            obj[desc.observer](val);
          }
        }
      });
    });
  }

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


  xjsonPrototype = Object.create(HTMLElement.prototype);
  properties = {
    data : {
      value : '',
      observer : 'dataChanged'
    }
  };
  xjsonPrototype.dataChanged = function (data) {
    var container = this.root.getElementById('container');

    if (data === '') {
      container.innerHTML = '';
      return;
    }
    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }

    container.innerHTML = str(JSON.parse(data));


    // Adding the function to collapse
    (function (container) {
      var list = container.querySelectorAll('.collapser');

      Array.prototype.forEach.call(list, collapseFunction);
    }(container));

  };
  xjsonPrototype.createdCallback = function () {
    addShadowRoot(this, 'x-json');
    prepareProperties(this, properties);
    this.dataChanged(this.data);
  };
  document.registerElement('x-json', {
    prototype : xjsonPrototype
  });
}());

