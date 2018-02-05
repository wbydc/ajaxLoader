# ajaxLoader
jQuery ajax page loader plugin

## Getting Started

Download script and connect it to your page with jQuery
```html
<script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
<script src="path/to/scriptLoader.min.js"></script>
```

## Usage

```html
<script>
  $.ajaxLoader(options);
  // or (only if loader was already initialized!):
  $.ajaxLoader('load',url);
</script>
```

where
* options - `object` with parametres
* url - `string` url to load

## Options

|Parameter|Type|Description|Default value|
|:---:|:---:|:-----:|:---:|
|elem|*String*|CSS selector of elements that will trigger function|`'a'`|
|attr|*String*|Attribute of element that stores url for next page|`'href'`|
|event|*String*|Event that should be handled|`'click'`|
|target|*String*|CSS selector of container that will be filled with result|`''`|
|prefix|*String*|Prefix for each url|`''`|
|suffix|*String*|Suffix for each url|`''`|
|data|*Object*|Data that will be sended to server with each request|`{}`|
|filter|*Function*|Function that gets element that triggered function. Should return `true` if all is ok and `false` if not||
|before|*Function*|Function that will be executed before request sended||
|success|*Function*|Function that will be executed afted request successfuly finished||
|error|*Function*|Function that will be executed if request fails||
|progress|*Function*|Event listener for xhr progress event||
|maxErrors|*Integer*|maximum errors that could be received untill script restarts|`5`|
|headerPrefix|*String*|Prefix for identify response headers to parse|`'Data-'`|
|headers|*Object*|Object of functions to handle response headers. Each function should be named as header, that this function will handle. (See example below) Receives header value|`{}`|

## Bridges

Here we have two bridges - functions that should link two pages
First bridge - 'unload' executes before request for new page and gets next page url
Second one - 'loaded' executes after new page was loaded and gets previous page url

```javascript
  $.ajaxLoader.bridge(type,callback);
```

where
* type - `string` bridge type ('unload' or 'loaded')
* callback - `function` bridge function

## Example

Basic example
```javascript
  $.ajaxLoader({
    // specifies where we will load content
    target: '#content',
    // adding 'ajax=true' to each request
    data: {
      ajax: true
    },
    // filtring elements so only items with 'href' attr starting with '/' and they don't have 'no-load' class
    filter: function(elem) {
      let href = $(elem).attr('href');
      if (href && href[0] != '#' && href[0] == '/' && href[1] != '/' && !$(elem).hasClass('no-load')) return true;
      return false;
    },
    // showing loader animation
    before: function() {
      $('#loading').show();
    },
    success: function() {
      // doing something (e.g. updating some handlers) and hiding loader animation
      $('#loading').hide();
    },
    // logging if error
    error: function(xhr) {
      console.log(xhr.statusText);
    },
    // setting handlers for special headers
    headers: {
      // handles 'Data-title' header
      title: (title)=>{
        document.title = decodeURI(title.replace(/\+/g,' ')).replace(/%2B/g,'+');
      },
      // handles 'Data-redirect' header
      redirect: (redirect)=>{
        location.replace(redirect);
        exit();
      },
      // handles 'Data-redirect' header
      refresh: (timeout)=>{
        setTimeout('window.location.reload()',refresh);
      }
    }
  });
```
