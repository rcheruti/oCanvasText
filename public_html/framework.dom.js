
(function (window) {
  
  var undefined; // "undefined", deixar essa var sem valor !!!
  function _isStr( val ){ return typeof val === 'string'; }
  function _is$( val ){ return val instanceof $; }
  function _isUndefined( val ){ return val === undefined; }
  
  
  
  
  
  //===========================================================================
  //          Function prototype
  
  var FunctionProto = window.Function.prototype;
  if( !FunctionProto.bind ) FunctionProto.bind = function(that){
    var me = this, arr = Array.prototype.slice(arguments,1);
    return function(){
      return me.apply( that, arr );
    };
  };
  
  
  
  
  
  
  //===========================================================================
  //          EventTarget prototype

  var EventTypeProto = (window.EventTarget || window.Node).prototype;
  EventTypeProto.off = function (eventName, callback, useCapture) {
    return this.removeEventListener(eventName, callback, useCapture);
  };
  EventTypeProto.on = function (eventName, callback, useCapture) {
    this.addEventListener(eventName, callback, useCapture);
    return EventTypeProto.off.bind(this, eventName, callback, useCapture);
  };
  EventTypeProto.one = function (eventName, callback, useCapture, times) {
    if (!times)
      times = 1;
    else if (times < 1)
      return function () {};
    var _retirar = null;
    var _func = function () {
      callback();
      if (!--times)
        _retirar();
    };
    return _retirar = this.on(eventName, _func, useCapture);
  };
  
  EventTypeProto.bind = EventTypeProto.on;
  EventTypeProto.unbind = EventTypeProto.off;
  
  
  
  
  
  
  
  
  //===========================================================================
  //          Element prototype

  var ElementProto = window.Element.prototype;
  ElementProto.find = function (str) {
    var nodeList = this.querySelectorAll(str), len = nodeList.length;
    var arr = [];
    for (var i = 0; i < len; i++)
      arr.push(nodeList[i]);
    return $(arr);
  };
  if ('classList' in ElementProto) {
    ElementProto.hasClass = function () {
      return this.classList.contains.apply(this.classList, arguments );
    };
    ElementProto.addClass = function () {
      this.classList.add.apply(this.classList, arguments );
      return this;
    };
    ElementProto.removeClass = function () {
      this.classList.remove.apply(this.classList, arguments );
      return this;
    };
  } else {
    ElementProto.hasClass = function (str) {
      return new RegExp('\\b' + str + '\\b').test(this.className);
    };
    ElementProto.addClass = function () {
      var i = arguments.length, str;
      while( i-- ){
        str = arguments[i];
        if( !this.hasClass(str) ) this.className += ' ' + str;
      }
      return this;
    };
    ElementProto.removeClass = function (str) {
      var i = arguments.length, str;
      while( i-- ){
        str = arguments[i];
        this.className = this.className.replace(new RegExp('\\b'+ str+'\\b', 'g'), '');
      }
      return this;
    };
  }
  ElementProto.toggleClass = function (str) {
    if (this.hasClass(str))
      this.removeClass(str);
    else
      this.addClass(str);
    return this;
  };
  ElementProto.text = function (str){
    if( str === undefined ) return this.textContent;
    this.textContent = str;
    return this;
  };
  ElementProto.empty = function(){
    while(this.hasChildNodes()) {
      this.removeChild(this.firstChild);
    }
    return this;
  };
  ElementProto.html = function (str){
    if( str === undefined ) return this.innerHTML;
    this.innerHTML = str;
    return this;
  };
  ElementProto.attr = function( str, val ){
    if( str instanceof Object ){
      for( var g in str ){
        this.setAttribute( g, str[g] );
      }
      return this;
    }
    if( val === undefined ) return this.getAttribute( str );
    this.setAttribute( str, val );
    return this;
  };
  ElementProto.removeAttr = function( str ){
    this.removeAttribute(str);
    return this;
  };
  ElementProto.append = function( el ){
    if( el instanceof $ ){
      var len = el.length, i = len;
      while( i-- ) this.appendChild( el[len-i-1] );
    }else{
      this.appendChild( _idStr(el)? _createElFromStr(el) : el );
    }
    return this;
  };
  if(!ElementProto.remove) ElementProto.remove = function(){
    this.parentNode.removeChild( this );
    return this;
  };
  ElementProto.clone = function( val ){
    return this.cloneNode( val );
  };
  ElementProto.parent = function(){
    return this.parentNode;
  };
  ElementProto.replaceWith = function( el ){
    el = _idStr(el)? _createElFromStr(el) : el;
    this.parent().replaceChild( el, this );
    return el;
  };
  ElementProto.css = function( obj, val ){
    if( typeof obj === 'string' ){
      if( val === undefined ) 
        return window.getComputedStyle(this)[obj];
      this.style[obj] = val;
    }
    for( var g in obj ){
      this.style[g] = obj[g];
    }
    return this;
  };
  
  

  //===========================================================================
  //          $ function

  function $(param) {
    if (!(this instanceof $))
      return new $(param);
    if (param instanceof $)
      return param;
    if (typeof param === 'string')
      return ElementProto.find.call(document, param);
    if (typeof param === 'undefined')
      param = [];
    if (!(param instanceof Array))
      param = [param];

    for (var g in param)
      this.push(param[g]);
    if (!this.length)
      this.length = 0;

    _defineProperty(this, 5, 'length');
    return this;
  };
  var proto = ($.prototype = new Array());
  
  var funcs = [
      'bind',
      'unbind',
      'on',
      'off',
      'one',
      'find',
      'hasClass',
      'addClass',
      'removeClass',
      'toggleClass',
      'text',
      'empty',
      'attr',
      'removeAttr',
      'children',
      'remove',
      'clone',
      'parent',
      'append',
      'eq',
      'replaceWith',
      'css',
      'chidren',
      'html'
    ], funcsI = funcs.length;
    
    
    // comportamento padrão;
  while( funcsI-- ){ 
     _normalElementCall(proto, funcs[funcsI]);
  }
  
    //  Sobreescrever as funções que precisam de comportamento 'especial':
    
  proto.find = function (str) {
    var res = _forEachApply(this, ElementProto.find, [str]);
    var obj = $(), len = res.length;
    for (var i = 0; i < len; i++) {
      var resI = res[i], lenI = resI.length;
      for (var j = 0; j < lenI; j++) {
        obj.push(resI[j]);
      }
    }
    return obj;
  };
  proto.hasClass = function(){
    var res = _forEachApply(this, ElementProto.hasClass, arguments), i = res.length;
    while( i-- ) if( !res[i] ) return false;
    return true;
  };
  proto.text = function( str ){
    if( !this.length ) return '';
    var res = _forEachApply( str===undefined?[this[0]]:this , ElementProto.text, [str]);
    return res[0];
  };
  proto.chidren = function(str){
    if( str ) return $(_forEachApply(this, ElementProto.find, str));
    var res = [], len = this.length, i = len, j, lenJ, arrJ;
    while( i-- ){
      arrJ = this[len-i-1].children;
      j = lenJ = arrJ.length;
      while( j-- ){
        res.push( arrJ[lenJ-j-1] );
      }
    }
    return $( _removeEquals( res ) );
  };
  proto.html = function(str){
    if( !this.length ) return '';
    if( str ){
      _forEachApply(this, ElementProto.html, str);
      return this;
    }
    return this[0].html();
  };
  proto.eq = function(val){
    return $([ this[val] ]);
  };
  proto.clone = function(){
    return $( _forEachApply(this, ElementProto.clone, [true]) );
  };
  proto.parent = function(){
    return $( _removeEquals(  _forEachApply(this, ElementProto.parent) ) );
  };
  proto.replaceWith = function(){
    return $( _removeEquals(  _forEachApply(this, ElementProto.replaceWith, arguments) ) );
  };
  
  
    // bloquear a iteração desses elementos:
  funcsI = funcs.length;
  while( funcsI-- ){ 
    _defineProperty(proto, 5, funcs[funcsI]);
  }


  //===========================================================================
  //    Funções auxiliares
  
  
  function _normalElementCall(proto, funcName){
    proto[funcName] = function(){
      _forEachApply(this, ElementProto[funcName], arguments);
      return this;
    };
  }
  function _forEachApply(arr, func, arrApply) {
    var ret = [], len = arr.length;
    for (var i = 0; i < len; i++)
      ret.push(func.apply(arr[i], arrApply));
    return ret;
  }
  function _defineProperty(obj, intConf, prop ) {
    if (!intConf)
      intConf = 0;
    
    Object.defineProperty(obj, prop, {
      configurable: !!(1 & intConf),
      enumerable: !!(2 & intConf),
      writable: !!(4 & intConf),
      iterable: !!(8 & intConf)
        //value: conf.value,
        //get: conf.get,
        //set: conf.set
    });
  }
  function _removeEquals( arr ){
    var len = arr.length, i = len, j;
    while(i--){
      j = len - i;
      while(--j){
        if( arr[i] === arr[i+j] ) arr.splice(i+j, 1);
      }
    }
    return arr;
  }
  function _createElFromStr( str ){
    var div = document.createElement('div'),
        frag = document.createDocumentFragment(),
        len, i;
    div.innerHTML = str;
    len = i = div.childNodes.length;
    while(i--){
      frag.appendChild( div.childNodes[len-i-1] );
    }
    return frag;
  }





  //===========================================================================
  //    Publicando funções

  if (!window.$)
    window.$ = $;
  if (!window.$$)
    window.$$ = $;
  
  
  
  

})(window);
