# &lt;x-json&gt;


**&lt;x-json&gt;** is a web component for pretty-print and display a JSON string. (or an object that can be converted to JSON)

Is inspired by Goldark/ng-json-explorer for angular, and is actually using the same stylesheet. (But is not using any of the JavaScript code)

## Installation

You can just copy the `x-json.html`, `x-json.js` and `x-json.css` files somewhere onto your server, or you can use bower:

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
    document.write('<script src="https:\/\/cdnjs.cloudflare.com/ajax/libs/polymer/0.3.4/platform.js"><\/script>')
  }
</script>
<link rel="import" href="x-json.html">
```

After that you can use it like this:

```html
<x-json data="{{obj}}"></x-json>
```

## License

[MIT License](http://opensource.org/licenses/MIT)
