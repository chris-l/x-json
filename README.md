# &lt;x-json&gt;


**&lt;x-json&gt;** is a web component for pretty-print and display a JSON string. (or an object that can be converted to JSON)

Is inspired by [Goldark/ng-json-explorer](https://github.com/Goldark/ng-json-explorer) for angular, and is actually using the same stylesheet. (But is not using any of the JavaScript code)

## Demo

Check a demo here: http://chris-l.github.io/x-json/

## Installation

You can just copy the `dist/x-json.html` file somewhere onto your server, or you can use bower:

```bash
bower install --save x-json
```

## Usage

```html
<script>
  if ('registerElement' in document
    && 'createShadowRoot' in HTMLElement.prototype
    && 'import' in document.createElement('link')
    && 'content' in document.createElement('template')) {
    // We're using a browser with native WC support!
  } else {
    document.write('<script src="https:\/\/cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/0.7.5/webcomponents.min.js"><\/script>')
  }
</script>
<link rel="import" href="x-json.html">
```

After that you can use it like this:

```html
<x-json id="myjson"></x-json>
<script>
  var obj = { id : 1, name : 'some', list : [ 1,2,3 ] };
  document.getElementById('myjson').data = obj;
</script>
```

If you are using Polymer, you can do it with binding like this: `data="{{obj}}"`.

You can also pass a JSON string as `data`:

```html
<x-json id="myjson" data="{&quot;list&quot;:[1,2,3]}"></x-json>
```

## License

[MIT License](http://opensource.org/licenses/MIT)
