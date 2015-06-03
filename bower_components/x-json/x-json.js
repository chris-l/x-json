/*jslint indent: 2, newcap: true */
/*global Polymer*/

(function () {
  'use strict';
  var collapseFunction;
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


  Polymer({
    is : 'x-json',
    properties : {
      data : {
        value : '',
        observer : 'dataChanged'
      }
    },
    dataChanged: function (data) {

      if (data === '') {
        this.$.container.innerHTML = '';
        return;
      }
      if (typeof data !== 'string') {
        data = JSON.stringify(data);
      }

      this.$.container.innerHTML = str(JSON.parse(data));


      // Adding the function to collapse
      (function (container) {
        var list = Polymer.dom(container).querySelectorAll('.collapser');

        Array.prototype.forEach.call(list, collapseFunction);
      }(this.$.container));

    },
    ready : function () {
      this.dataChanged(this.data);
    }
  });
}());

