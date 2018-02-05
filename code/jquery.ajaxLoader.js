/**
 * jQuery ajax page loader
 *
 * @see https://github.io/wannabeyourdrug/ajaxLoader
 * @author Gusev Danila <https://github.io/wannabeyourdrug>
 */
$.ajaxLoader = function(action = 'init',options) {
  /**
   * Gets current hash
   *
   * @return {String} hash
   */
  function getHash() {
    return window.location.href.replace(window.location.origin,'');
  }
  /**
   * Handler for config.elem click event
   *
   * @param {Event} event - click event
   * @param {Element} element - click target
   * @return {Bool} return true only then config.filter function returned false
   */
  function handler(event, element) {
    var config = window.ajaxLoader.config;
    if (!config.filter(element)) return true;
    var href = config.prefix + $(element).attr(config.attr) + config.suffix;
    event.preventDefault();
    $.ajaxLoader('load',href);
  }
  /**
   * Core funcction that loads the page
   *
   * @param {String} url - url to load
   * @return {Bool} true then loaded
   */
  function __load(url) {
    if (!window.ajaxLoader) return false;
    var config = window.ajaxLoader.config;
    config.before();
    if (window.ajaxLoader._loading) return false;
    window.ajaxLoader._loading = true;
    $.ajax({
      method: "POST",
      url: url,
      data: config.data,
      dataType: 'html',
      xhr: function(){
        var xhr = $.ajaxSettings.xhr();
        xhr.addEventListener("progress", config.progress, false);
        return xhr;
      },
      success: function(response, textStatus, request) {
        // parsing response headers
        request.getAllResponseHeaders().split("\r\n").forEach(function(header) {
          if (header.indexOf(config.headerPrefix) == 0) {
            header = header.substr(config.headerPrefix.length);
            var data = header.substr(header.indexOf(':')+2);
            header = header.substr(0,header.indexOf(':'));
            if (config.headers[header]) config.headers[header](data);
          }
        });

        if (textStatus != 'success') return false;

        // Filling config.target with loaded content
        $(config.target).html(response);

        // Setting click handlers to new targets
        // $(config.elem).off("click");
        $(config.elem).on(config.event,function(ev){
          handler(ev,this);
        });

        // Saving changes and updating history
        window.ajaxLoader.page = url;
        history.pushState('', '', url);

        window.ajaxLoader._loading = false;
        window.ajaxLoader.errors = 0;

        config.success();
        return true;
      },
      error: function(xhr) {
        // BUG: when error sometimes goes to infinity cicle
        window.ajaxLoader._loading = false;
        config.error(xhr);
        if (window.ajaxLoader.errors >= config.maxErrors) {
          console.log('Maximum Errors reached');
          window.ajaxLoader.page = window.ajaxLoader.backup;
        } else {
          window.ajaxLoader.errors++;
        }
        return __load(window.ajaxLoader.page);
      }
    });
  }

  var methods = {
    init: function(options) {
      window.ajaxLoader = {
        page: getHash(),
        backup: getHash(),
        config: $.extend({
          elem: 'a',
          attr: 'href',
          event: 'click',
          target: '',
          prefix: '',
          suffix: '',
          data: {},
          filter: function() {return true;},
          before: function() {},
          success: function() {},
          error: function() {},
          progress: function() {},
          maxErrors: 5,
          headerPrefix: 'Data-',
          headers: {}
        },options),
        errors: 0,
        _loading: false,
        bridge: {
          unload: ()=>{},
          loaded: ()=>{}
        }
      };

      // checking if "back" button was pressed
      setInterval(function() {
        if (window.ajaxLoader) {
          var hash = getHash();
          if (window.ajaxLoader.page != hash) {
            __load(hash);
          }
        }
      },250);

      $(window.ajaxLoader.config.elem).on("click",function(ev){
        handler(ev,this);
      });

      return true;
    },
    load: function(url) {
      window.ajaxLoader.bridge.unload(window.ajaxLoader.page);
      var res = window.ajaxLoader ? __load(url) : false;
      window.ajaxLoader.bridge.loaded(window.ajaxLoader.page);

      window.ajaxLoader.bridge = {
        unload: ()=>{},
        load: ()=>{}
      }
      return res;
    }
  }

  if (typeof action == 'object') {
    methods.init(action);
  } else if (methods[action]) {
    return methods[action](options);
  } else return undefined;
}
/**
 * Setter for bridges
 *
 * @param {String} type - type of bridge
 * @param {Function} callback - bridge
 * @return {Bool} if callback was setted
 */
$.ajaxLoader.bridge = function(type,callback = ()=>{}) {
  return window.ajaxLoader.bridge[type] ? (window.ajaxLoader.bridge[type] = callback) : false;
}
