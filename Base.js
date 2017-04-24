// 使用 IIFE(立即执行函数表达式)，避免污染全局命名空间
(function( window ) {

// 开启严格模式
"use strict";

// 定义一些常用的变量
var $,
    base,
    // 版本号
    version = '0.0.1',
    // document对象
    document = window.document,
    // location对象
    location = window.location,
    // HTML代码片断的正则
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    // 空数组...
    emptyArray = [],
    // 数组对象的 slice方法
    slice = emptyArray.slice,
    // 数组对象的 filter方法
    filter = emptyArray.filter,
    // 创建 table元素
    table = document.createElement('table'),
    // 创建 tr元素
    tableRow = document.createElement('tr'),
    // 这里的用途是当需要给tr,tbody,thead,tfoot,td,th设置innerHTMl的时候，需要用其父元素作为容器来装载HTML字符串
    containers = {
      // 创建 div元素
      '*': document.createElement('div'),
      // 创建 tbody元素
      'tr': document.createElement('tbody'),
      'tbody': table,
      'thead': table,
      'tfoot': table,
      'td': tableRow,
      'th': tableRow,
    },
    // 可以使用Base自带的方法可以设置的属性
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],
    // 用来缓存正则
    classCache = {},
    // 缓存className
    classList,
    // 设置CSS时，不用加px单位的属性
    cssNumber = {
      'column-count': 1,
      'columns': 1,
      'font-weight': 1,
      'line-height': 1,
      'opacity': 1,
      'z-index': 1,
      'zoom': 1
    },
    // 缓存元素的display属性
    elementDisplay = {};

// 初始化
$ = function( selector, context ) {
  // 每次调用 $() 或 Base()，都会执行 base.init()进行初始化
  return base.init( selector, context );
};

$.each = function( elements, callback ) {
  // 类数组对象
  if ( likeArray( elements ) ) {
    for (var i = 0; i < elements.length; i++ ) {
      if ( callback.call( elements[ i ], i, elements[ i ] ) === false ) {
        return elements;
      }
    }
  // 普通对象
  } else {
    for ( var key in elements ) {
      if ( callback.call( elements[ key ], key, elements[ key ] ) === false ) {
        return elements;
      }
    }
  }
  return elements;
};

// Base构造函数
function B( dom, selector ) {
  // DOM集合存在的话，就获取它的长度，不存在的话，就等于0
  var len = dom ? dom.length : 0;
  // 将每个DOM节点分别写入对象
  for ( var i = 0; i < len; i++ ) {
    this[ i ] = dom[ i ];
  }
  // DOM集合的长度
  this.length = len;
  // selector 的默认值为 空字符串
  this.selector = selector || '';
}

// 判断数据类型
function type( val ) {
  // 获取val内部的 [[ class ]]值
  var types = Object.prototype.toString.call( val );

  switch ( types ) {
    // 函数
    case '[object Function]':
      return 'function';
    // window
    case '[object Window]':
      return 'window';
    // 对象
    case '[object Object]':
      return 'object';
    // 数组
    case '[object Array]':
      return 'array';
    // documnet
    case '[object HTMLDocument]':
      return 'document';
    // 字符串
    case '[object String]':
      return 'string';
    // 数字
    case '[object Number]':
      return 'number';
    // 布尔值
    case '[object Boolean]':
      return 'boolean';
    // null
    case '[object Null]':
      return 'null';
    // undefined
    case '[object Undefined]':
      return 'undefined';
    // date
    case '[object Date]':
      return 'date';
    // error
    case '[object Error]':
      return 'error';
    // symbol
    case '[object Symbol]':
      return 'symbol';
    // set
    case '[object Set]':
      return 'set';
    // weakset
    case '[object WeakSet]':
      return 'weakset';
    // map
    case '[object Map]':
      return 'map';
    // weakmap
    case '[object WeakMap]':
      return 'weakmap';
    // NodeList
    case '[object NodeList]':
      return 'NodeList';
    // NodeList
    case '[object HTMLCollection]':
      return 'NodeList';
  }

  if ( types.indexOf( 'Element' ) > 0 ) {
    return 'element';
  }

  // 默认返回 false
  return false;
}

// 是否为 字符串
function isStr( val ) {
  return type( val ) === 'string';
}

// 是否为 函数
function isFunction( val ) {
  return type( val ) === 'function';
}

// 是否为 对象
function isObject( val ) {
  return type( val ) === 'object';
}

// 是否为 数字
function isNum( val ) {
  return type( val ) === 'number';
}

// 是否为 Null
function isNull( val ) {
  return type( val ) === 'null';
}

// 是否为 数组
function isArray( val ) {
  return type( val ) === 'array';
}

// 是否为 window对象
function isWindow( val ) {
  return type( val ) === 'window';
}

// 是否为 undefined
function isUndefined( val ) {
  return type( val ) === 'undefined';
}

// 是否为 document
function isDoc( val ) {
  return type( val ) === 'document';
}

// 是否为 字符串、数字、函数中的一种
function isSNF( val ) {
  return isStr( val ) || isNum( val ) || isFunction( val );
}

// 判断数据是否是类数组对象，例如NodeList和argument
function likeArray( obj ) {
  var types = type( obj );
  var length = obj.length;
  // obj不能为空值 或 undefined
  if ( obj &&
      // obj必须是 对象
      isObject( obj ) &&
      // obj不能是 函数
      !isFunction( obj ) &&
      // obj不能是 window对象
      !isWindow( obj ) ) {
    // obj中必须有 length属性
    if ( 'length' in obj &&
        // length的值必须是数字
        isNum( length ) &&
        // length的值必须大于或等于0
        length >= 0 &&
        // length的值必须是整数
        length === Math.floor( length ) ) {
      return true;
    }
  }
  return false;
}

// 将给定的参数生成正则
function classRE( name ) {
  // 在缓存中能查找到 name
  if ( name in classCache ) {
    // 直接到缓存中取值
    return classCache[ name ];
  } else {
    // 将值写入缓存，并返回
    return classCache[ name ] = new RegExp('(^|\\s)' + name + '(\\s|$)');
  }
}

// 获取 和 设置 className
function className( node, value ) {
  // 非SVG元素的className值
  var klass = node.className || '';
  // 是否为SVG元素，klass的值不能为空(svg元素的className是一个SVGAnimatedString对象，里面包含了baseVal属性)，并且必须有baseVal属性
  var svg = klass && klass.baseVal !== undefined;

  // 传了一个参数
  if ( arguments.length === 1 ) {
    // 是 SVG元素
    if ( svg ) {
      // 返回 SVG元素的className
      return klass.baseVal;
    } else {
      // 返回 普通元素的className
      return node.className;
    }
  // 传了多个参数
  } else {
    // 是 SVG元素
    if ( svg ) {
      // 设置 SVG元素的className
      klass.baseVal = value;
    } else {
      // 设置 普通元素的className
      node.className = value;
    }
  }
}

// 这个函数在整个库中取着很重要的作用，处理参数(arg)为 函数 或 值 的情况
// 因为很多方法，不仅可以传递字符串，还能传递函数
function funcArg( context, arg, index, payload ) {
  // 处理arg是函数的情况
  if ( isFunction( arg ) ) {
    // 以context作为上下文执行函数，并返回
    return arg.call( context, index, payload );
  // 处理arg非函数的情况
  } else {
    // 返回 自身
    return arg;
  }
}

// 将字符串转换为驼峰格式，例子：font-size => fontSize
function camelCase( str ) {
  return str.replace( /-+(.)?/g, function( a, b ) {
    // 这里的参数b，就是 (.)? 里的值
    return b ? b.toUpperCase() : '';
  } );
}

// 将驼峰格式的字符串转换为'-'分割的形式 fontSize => font-size
function dasherize( str ) {
  return str.replace( /::/g, '/' )
             .replace( /([A-Z]+)([A-Z][a-z])/g, '$1_$2' )
             .replace( /([a-z\d])([A-Z])/g, '$1_$2' )
             .replace( /_/g, '-' )
             .toLowerCase();
}

// 在数组后面加上 'px'单位，列子： 100 => 100px
function maybeAddPx( name, val ) {
  // val 是数字
  if ( ( isNum( val ) ||
  // val 是字符串，同时转换为数字在转换为字符串后的值与val相等，列子：'100'
  ( isStr( val ) && val === (+val) + '' ) ) &&
  // name不在 cssNumber索引中
  !cssNumber[ name ] ) {
    // 在 末尾增加'px'，并返回
    return val + 'px';
  } else {
    // 不做处理
    return val;
  }
}

// 获取DOM节点默认的display的属性值
function defaultDisplay( nodeName ) {
  var element,
      display,
      body = document.body;

  // 在缓存中查找不到
  if ( !elementDisplay[ nodeName ] ) {
    // 创建元素
    element = document.createElement( nodeName );
    // 将元素插入到 body末尾
    body.appendChild( element );
    // 获取这个元素默认的display值
    display = getComputedStyle(element, '').getPropertyValue('display');
    // 移除刚刚插入的元素
    body.removeChild( element );
    // 缓存 display属性
    elementDisplay[ nodeName ] = display;
  }

  // 返回 缓存中的display的属性值
  return elementDisplay[ nodeName ];
}

// 设置 属性值
function setAttribute( node, name, val ) {
  // val传递的值是 null 或 undefined
  if ( isNull( val ) ) {
    // 移除这个属性
    node.removeAttribute( name );
  } else {
    // 设置 属性值
    node.setAttribute( name, val );
  }
}

// 数组去重，主要用来去除NodeList中重复的DOM节点
function unrepeat( array ) {
  // 遍历数组，并返回 过滤后的数组
  return filter.call( array, function( item, index ) {
    // 数组成员一次出现的位置与索引相等的话，就认为是不重复的值，反之就是重复的值
    return array.indexOf( item ) === index;
  } );
}

// 从NodeList(数组)中筛选出给定 selector的DOM节点
function filtered( nodes, selector, chilren ) {

  // Base对象集合的第一个元素的值是NULL的话，就返回 document对象
  if ( isNull( nodes[ 0 ] ) ) return $( document );

  // selector未传参
  return !selector ? $( nodes, chilren + ' parent' ) : $( nodes ).filter( selector );
}

// 获取 url地址中的参数，如果传参则获取一个对象
function param( str ) {
  var param = {},
      items,
      key,
      search = location.search,
      indexof;

  // url字符串问号开始后的字符串的长度必须大于0
  if ( search.length ) {
    indexof = search.indexOf( '=' ) > 0;
    // 参数字符串中必须有等号
    if ( indexof ) {
      // 先去掉第一个问号，然后再将字符串用'&'分割成数字，最后遍历
      search.substring( 1 ).split('&').forEach( function( item ) {
        // 将数组里的每个成员(字符串)，用等号再分割成数组，例子：'name=qianlifeng' => ['name', 'qianlifeng']
        items = item.split('=');
        // 属性名(key)
        key = decodeURIComponent( items[ 0 ] ).trim();
        // key不为空
        if ( key.length ) {
          // 通过下标的形式，将属性和属性值写入对象
          param[ key ] = decodeURIComponent( items[ 1 ] ).trim();
        }
      } );
    } else {
      // 去掉问号
      param = search.substring( 1 );
    }
  } else {
    // 空字符串
    param = '';
  }

  // 至少传了一个参数
  if ( 0 in arguments ) {
    // str传递的必须是 字符串
    if ( isStr( str ) && indexof ) {
      param = param[ str ];
    } else {
      // 空字符串
      param = '';
    }
  }

  // 最后返回 param
  return param;
}

// ajax方法
function ajax( _ref ) {
  var _ref$type = _ref.type,
      type = _ref$type === undefined ? 'get' : _ref$type,
      _ref$url = _ref.url,
      url = _ref$url === undefined ? window.location.href : _ref$url,
      _ref$dataType = _ref.dataType,
      dataType = _ref$dataType === undefined ? 'json' : _ref$dataType,
      _ref$async = _ref.async,
      async = _ref$async === undefined ? true : _ref$async,
      _ref$contentType = _ref.contentType,
      contentType = _ref$contentType === undefined ? 'application/x-www-form-urlencoded' : _ref$contentType,
      _ref$success = _ref.success,
      success = _ref$success === undefined ? null : _ref$success,
      _ref$error = _ref.error,
      error = _ref$error === undefined ? null : _ref$error,
      _ref$complete = _ref.complete,
      complete = _ref$complete === undefined ? null : _ref$complete,
      _ref$beforeSend = _ref.beforeSend,
      beforeSend = _ref$beforeSend === undefined ? null : _ref$beforeSend,
      _ref$data = _ref.data,
      data = _ref$data === undefined ? null : _ref$data,
      _ref$headers = _ref.headers,
      headers = _ref$headers === undefined ? null : _ref$headers;

  // 存储XMLHttpRequest实例
  var xhr = null;
  // 存储请求成功后返回的数据
  var response = null;
  // 在发送请求前，是否取消请求
  var closed = true;
  // 是否使用了GET方式来请求
  var isGet = type === 'get' || type === 'GET' ? true : false;

  // 格式化发送到服务器的数据，转换为key=value&key=value这种格式
  var formatData = function formatData() {
    // 如果用户设置了要发送的数据
    if ( data ) {
      var arr = [];
      for ( var key in data ) {
        arr.push( encodeURIComponent( key ) + '=' + encodeURIComponent( data[key] ) );
      }
      // 禁止浏览器缓存
      arr.push( 'time=' + +new Date() );
      return arr.join( '&' );
    }
  };

  // 如果请求方式是GET且发送的数据不为空，在ULR后带上参数
  url = isGet ? url + '?' + formatData() : url;

  // 设置额外的HTTP头信息
  var setHeaders = function setHeaders() {
    // 如果用户设置了额外的头信息
    if ( headers ) {
      for ( var key in headers ) {
        // 批量设置头信息
        xhr.setRequestHeader( key, headers[key] );
      }
    }
  };

  // 创建XMLHttpRequest实例
  try {
    // 尝试用标准方法创建XMLHttpRequest实例
    xhr = new XMLHttpRequest();
  } catch (e) {
    // 兼容IE6的方法
    xhr = new ActiveXObject( 'Microsoft.XMLHTTP' );
  }

  // 初始化 HTTP请求
  xhr.open( type, url, async );

  // 执行beforeSend回调，并获取返回值
  closed = beforeSend ? beforeSend( xhr ) : true;

  // 判断是否手动取消了请求
  if ( closed || closed === undefined ) {
    // 没有取消请求，发起请求
    isGet ? xhr.send( null ) : ( xhr.setRequestHeader( 'content-type', contentType ), setHeaders(), xhr.send( formatData() ) );
  } else {
    // 取消请求
    return;
  }

  // 监听readyState属性
  xhr.onreadystatechange = function () {
    if ( xhr.readyState === 4 ) {
      // 执行complete回调
      complete ? complete( xhr, xhr.status ) : null;
      // 请求成功，状态>=200 && < 300 表示成功
      if ( xhr.status >= 200 && xhr.status < 300 ) {
        switch ( dataType ) {
          case 'json':
            try {
              // 使用JSON.parse()序列化字符串
              response = JSON.parse( xhr.responseText );
            } catch (e) {
              // 使用(new Function('return ' + str))()序列化字符串
              response = new Function( 'return ' + xhr.responseText )();
            }
            break;
          case 'text':
            response = xhr.responseText;
            break;
          case 'xml':
            response = xhr.responseXML;
            break;
        }
        // 执行success回调
        success ? success( response, xhr.status, xhr ) : null;
      // 请求失败
      } else {
        // 执行error回调
        error ? error( xhr.statusText, xhr.status, xhr ) : null;
      }
    }
  };
  // 返回XMLHttpRequest实例
  return xhr;
}

base = {
  // 初始化方法
  init: function( selector, context ) {

    // DOM集合
    var dom;

    // selector 未传参，返回 空的Base对象
    if ( !selector ) return this.B();

    // selector 传递的是 字符串
    if ( isStr( selector ) ) {
      // 去除字符串首尾的空格
      selector = selector.trim();

      // selector 传递的是 HTML
      if ( selector[ 0 ] === '<' && fragmentRE.test( selector ) ) {
        // 创建 DOM节点
        dom = this.fragment( selector, RegExp.$1, context );
        // 由于传入的是HTML 这里必须清空selector
        selector = null;
      } else {
        // context 传递了上下文
        if ( context !== undefined ) {
          // 在上下文中查找元素，并返回
          return $( context ).find( selector );
        } else {
          // 通过 选择器查找元素
          dom = this.qsa( document, selector );
        }
      }
    }

    // selector 传递的是 函数
    if ( isFunction( selector ) ) {
      // DOM构建完成后执行这个函数
      return $( document ).ready( selector );
    }

    // selector 传递的是 Base对象
    if ( this.isB( selector ) ) {
      // 返回 selector对象
      return selector;
    }

    // selector 传递的是 DOM节点
    if ( Object.prototype.toString.call( selector ).indexOf( 'Element' ) > 0 ) {
      // 将DOM节点写入数组
      dom = [ selector ];
      // 由于传入的是对象 这里必须清空selector
      //selector = null;
    }

    // selector传递的是 数组
    if ( isArray( selector ) ) {
      // selector本身就是数组，所以直接赋值
      dom = selector;
      // 这里的contenxt是作为selector传值的
      selector = context;
    }

    // selector传递的是 Document对象
    if ( isDoc( selector ) ) {
      dom = [ document ];
      selector = null;
    }

    // 将结果集转换为 Base对象，并返回
    return this.B( dom, selector );
  },
  // 工厂方法
  B: function( dom, selector ) {
    // 返回 Base构造的实例
    return new B( dom, selector );
  },
  // 是否为Base构造的实例
  isB: function( obj ) {
    return obj instanceof base.B;
  },
  // DOM选择器方法
  qsa: function( element, selector ) {
        // 存储DOM节点
    var dom,
        // ID标识，selector的第一个字符是'#'，就认为是ID选择器
        maybeID = selector[ 0 ] === '#',
        // CLASS标识，selector非ID选择，并且第一个字符串是'.'，就认为是CLASS选择器
        maybeClass = !maybeID && selector[ 0 ] === '.',
        // 去除 ID或CLASS标识的第一个字符 '.name' => 'name' or '#name' => 'name'
        nameOnly = maybeID || maybeClass ? selector.slice( 1 ) : selector,
        // nameOnly是否是一个单词，不能含空格和其他特殊字符
        simpleSelectorRE = /^[\w-]*$/,
        // 检测selector是否为 单一选择器
        isSimple = simpleSelectorRE.test(nameOnly),
        // 检测宿主环境是否提供了 'getElementsByClassName' 这个API
        hasGetId = element.getElementById,
        // 检测宿主环境是否提供了 'getElementsByClassName' 这个API
        hasGetClass = element.getElementsByClassName;

    // selector是 简单选择器
    if ( isSimple && hasGetId && hasGetClass ) {
      // selector是 ID选择器
      if ( maybeID ) {
        // 获取到了DOM节点
        if ( dom = element.getElementById( nameOnly ) ) {
          // 将DOM节点写入数组
          return [dom];
        } else {
          // 返回 空数组
          return [];
        }
      }
      // selector是 CLASS选择器
      if ( maybeClass ) {
        // 把 NodeList转换为数组，并返回
        return slice.call( element.getElementsByClassName( nameOnly ) );
      }
      // selector是 元素选择器，既不是ID选择器，也不是CLASS选择器，就认为是元素选择器，注意这里传入的参数是selector，而不是nameOnly
      return slice.call( element.getElementsByTagName( selector ) );
    // selector是 高级选择器
    } else {
      // 把 NodeList转换为数组，并返回
      return slice.call( element.querySelectorAll( selector ) );
    }
  },
  // 创建DOM节点的方法
  fragment: function( html, name, properties ) {
    var dom,
        nodes,
        container,
        // 匹配单标签，类似 '<div>' or '<a/>'
        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        // 匹配非单独一个闭合标签的标签，类似将<div></div>写成了<div/>
        tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig;

    // html为 单标签，类似 '<div>' or '<a/>'
    if ( singleTagRE.test( html ) ) {
      // RegExp.$1 匹配到的第一个组，即 (\w+)
      dom = $( document.createElement( name || RegExp.$1 ) );
    }

    // DOM节点为空
    if ( !dom ) {
      // 将类似<div class="test"/>替换成<div class="test"></div>
      if ( html.replace ) html = html.replace( tagExpanderRE, '<$1><$2>' );
      // name 未传参，获取标签名
      if ( name === undefined ) name = fragmentRE.test( html ) && RegExp.$1;
      // 设置容器标签名，如果不是 tr、tbody、thead、tfoot、td、th，则容器标签名为 div
      if ( !( name in containers ) ) name = '*';
      // 创建容器，默认是 div元素
      container = containers[ name ];
      // 将HTML代码片段放入容器
      container.innerHTML = '' + html;
      // 获取容器的子节点，这样就把字符串转成 DOM节点了
      dom = $.each( slice.call( container.childNodes ), function() {
        container.removeChild( this );
      } );

      // 传入了上下文
      if ( isObject( properties ) ) {
        // 将DOM节点转换成Base对象，为了方便下面调用base上的方法
        nodes = $( dom );
        // 遍历对象，设置属性
        $.each( properties, function( key, value ) {
          if ( methodAttributes.indexOf( key ) > -1 ) {
            nodes[ key ]( value );
          } else {
            // 使用 Base对象的attr方法设置属性
            nodes.attr( key, value );
          }
        });
      }
    }

  return dom;
  },
  // 判断一个元素是否匹配给定的选择器
  matches: function( element, selector ) {
    // 必须传两个参数，并且element必须是元素节点，否则就返回 false
    if ( !selector || !element || element.nodeType !== 1 ) return false;
    // 浏览器提供的 MatchesSelector API
    var matchesSelector = element.matches || element.webkitMatchesSelector || element.mozMatchesSelector || element.oMatchesSelector || element.matchesSelector || element.msMatchesSelector;
    //
    if ( matchesSelector )return matchesSelector.call( element, selector );
  }
};

// Baase对象的原型链上的方法和属性
$.fn = {
  // 该属性的值是 工厂函数，而不是 构造函数
  constructor: base.B,
  length: 0,
  // 将一些操作数组的原生方法添加进来，由于Base对象是类数组对象，这样我们就能在Base对象上直接使用这些方法
  forEach: emptyArray.forEach,
  reduce: emptyArray.reduce,
  push: emptyArray.push,
  sort: emptyArray.sort,
  splice: emptyArray.splice,
  indexOf: emptyArray.indexOf,
  //  遍历数组的方法
  each: function( callback ) {
    // 借用数组的 every方法(第一次返回，就返回false) 进行迭代
    emptyArray.every.call( this, function( item, index ) {
      // 当callback(回调函数)返回false时，就停止迭代，否则会遍历整个数组
      return callback.call( item, index, item ) !== false;
    });
    // 返回 Base对象
    return this;
  },
  // 当DOM构建完成后执行回调函数
  ready: function( callback ) {
    // 匹配complete、loaded、interactive 三种状态
    var readyRE = /complete|loaded|interactive/;
    // 页面已经加载完成，并且body元素已经创建
    if ( readyRE.test( document.readyState ) && document.body ) {
      // setTimeout(function() {}, 0)在这里起到尾执行的作用
      setTimeout( function() {
        // 执行回调函数
        callback();
      } );
    // DOM还未构建完成
    } else {
      // 注册 DOMContentLoaded事件触发回调
      document.addEventListener( 'DOMContentLoaded', function() {
        // 执行回调函数
        callback();
      }, false );
    }
  },
  // 获取 DOM节点的数量
  size: function() {
    // 返回 DOM节点的个数
    return this.length;
  },
  // 检查 是否有元素含有指定的 类(class)
  hasClass: function( name ) {
    // 未传参数 或 传递了空字符串，返回 false
    if ( !name ) return false;
    // 借用数组的 some方法进行迭代(第一次返回true就返回true)
    return emptyArray.some.call( this, function( item ) {
      return classRE( name ).test( className( item ) );
    } );
  },
  // 添加 类(class)，多个类使用空格分隔
  addClass: function( name ) {
    // 未传参数 或 传递了空字符串，返回 Base对象
    if ( !name ) return this;
    // 遍历数组，并返回 Base对象
    return this.each( function( index ) {
      // 获取 className
      var cls = className( this );
      // 处理参数是函数的情况
      var newName = funcArg( this, name, index, cls );
      // 清空缓存，也可以在方法尾部清空
      classList = [];
      // 处理添加多个类的情况(将className用空格分割成字符串，然后遍历)
      newName.split( /\s+/g ).forEach( function( klass ) {
        // 没有重复的类(class)
        if ( !$( this ).hasClass( klass ) ) {
          // 将不重复的类写入数组
          classList.push( klass );
        }
      }, this );
      // classList不是空数组
      if ( classList.length ) {
        // 自身的className + ( 如果className不为空就增加一个空格，空的话就是一个空字符串 ) + 我们要增加的className(不能重复，用一个空格将数组拼接成字符串)
        cls = cls + ( cls ? ' ' : '' ) + classList.join(' ');
        // 设置 className
        className( this, cls );
      }
    } );
  },
  // 删除 类(class)，多个类使用空格分隔
  removeClass: function( name ) {
    // 遍历数组，并返回 Base对象
    return this.each( function( index ) {
      // 未传参数 或 传递了空字符串
      if ( !name ) {
        // 移除所有类(class)
        className( this, '' );
        // 中止遍历
        return;
      }
      // 获取 className，这里的classList是字符串类型
      classList = className( this );
      // 处理参数是函数的情况
      var newName = funcArg( this, name, index, classList );
      // 处理删除多个类的情况(将className用空格分割成字符串，然后遍历)
      newName.split( /\s+/g ).forEach( function( klass ) {
        // 将 className(字符串)中匹配到的字符串替换成 空格
        classList = classList.replace( classRE( klass ), ' ' );
      }, this );
      // 去除字符串首尾的空格，trim()是ES5原生方法
      classList = classList.trim();
      // 设置 className
      className( this, classList );
    } );
  },
  // 获取 或 设置CSS值
  css: function( property, val ) {
    // 获取对象集合的第一个元素
    var element = this[ 0 ];
    // 缓存 property的数据类型
    var types = type( property );
    // 缓存 格式化后的样式字符串
    var css = '';

    // 对象集合是空的话，就终止执行
    if ( !element ) return;

    // 只传了一个参数(获取 CSS值)
    if ( arguments.length === 1 ) {
      // property传递的是 字符串
      if ( isStr( property ) ) {
        // 因为内联样式的优先级最高，所以先查找内联样式，如果找不到再用 getComputedStyle方法获取元素所有的样式
        return element.style[ camelCase( property ) ] || getComputedStyle(element, '').getPropertyValue(property);
      }
      // property传递的是 数组
      if ( isArray( property ) ) {
        // 存储属性值
        var props = {};
        // 遍历数组
        $.each( property, function( index, item ){
          // 通过下标的形式将属性和属性值写入对象
          props[ item ] = element.style[ camelCase( item ) ] || getComputedStyle( element, '' ).getPropertyValue( item );
        } );
        // 返回 属性值对象
        return props;
      }
    }
    // property传递的是 字符串
    if ( isStr( property ) ) {
      // val值是null 或 undefine 或 空字符串 的情况，排除掉等于0的情况
      if ( !val && val !== 0 ) {
        // 遍历对象集合
        this.each( function() {
          // 删除样式
          this.style.removeProperty( dasherize( property ) );
        } );
      } else {
        // 格式化样式，例子：font-size: 24px
        css = dasherize( property ) + ':' + maybeAddPx( property, val ) + ';';
      }
    }
    // property传递的是 对象
    if ( isObject( property ) ) {
      // 遍历property对象
      for ( var key in property ) {
        // 属性值是null 或 undefine 或 空字符串 的情况，排除掉等于0的情况
        if ( !property[ key ] && property[ key ] !== 0 ) {
          // 遍历 Base对象
          this.each( function() {
            // 删除样式
            this.style.removeProperty( dasherize( key ) );
          } );
        } else {
          // 格式化样式，例子：color: red;font-size: 24px;
          css += dasherize( key ) + ':' + maybeAddPx( key, property[ key ] ) + ';';
        }
      }
    }

    // 遍历Base对象集合，并返回 Base对象
    return this.each( function() {
      // 设置 样式
      this.style.cssText += ';' + css;
    } );
  },
  // 显示元素
  show: function() {
    // 遍历 Base对象集合，并返回Base对象
    return this.each( function() {
      // 元素设置了行内样式
      if ( this.style.display === 'none' ) {
        // 清除行内的display样式，如果是块级元素会变成block，内联元素会变成inline(如果设置了内联或外联样式，则使用设置的值)
        this.style.display = '';
      }
      // 元素设置了 内联样式 或 外联样式(为了防止内行和外联同时设置了'display: none;')
      if ( getComputedStyle( this, '' ).getPropertyValue( 'display' ) === 'none' ) {
        // 将 display的样式还原成浏览器的默认值，defaultDisplay函数的作用是获取默认值
        this.style.display = defaultDisplay( this.nodeName );
      }
    } );
  },
  // 隐藏元素
  hide: function() {
    // 通过css方法设置，并返回 Base对象
    return this.css( 'display', 'none' );
  },
  // 获取 或 设置 属性值
  attr: function( name, val ) {
    var result,
        newValue,
        self;

    // 传了两个参数
    if ( arguments.length === 2 ) {
      // 第一个参数必须是字符串，第二个参数必须是函数、数字、字符串、Null之中的一种
      if ( isStr( name ) && ( isStr( val ) || isFunction( val ) || isNum( val ) || isNull( val ) ) ) {
        // 遍历 Base对象集合，并返回 Base对象
        return this.each( function( index ) {
          // 处理参数是函数的情况
          newValue = funcArg( this, val, index, this.getAttribute( name ) );
          // 设置 属性的值
          setAttribute( this, name, newValue );
        } );
      } else {
        // 终止执行
        return;
      }
    }

    // name传递的是 字符串(获取 Base对象集合第一个元素的属性值)
    if ( isStr( name ) ) {
      result = this[ 0 ].getAttribute( name );
    }

    // name传递的是 对象(批量 设置属性值)
    if ( isObject( name ) ) {
      // 遍历 Base对象集合，并返回 Base对象
      return this.each( function() {
        // DOM节点
        self = this;
        // 遍历 name对象
        $.each( name, function( key, val ) {
          // 设置 属性的值
          setAttribute( self ,key, val );
        } );
      } );
    }

    // 返回 属性的值
    return result;
  },
  // 删除属性值，多个属性使用空格分割
  removeAttr: function( name ) {
    // name传递的是 字符串
    if ( isStr( name ) ) {
      // 遍历 Base对象结合，并返回 Base对象
      return this.each( function() {
        // 必须是元素节点
        if ( this.nodeType === 1 ) {
          // 将字符串分割为数组，然后遍历
          name.split( /\s+/g ).forEach( function( item ) {
            // 移除属性
            setAttribute( this, item, null );
          }, this );
        }
      } );
    }
    // 返回 Base对象
    return this;
  },
  // 获取 或 设置 文本内容
  text: function( txt ) {
    // 至少传了一个参数，txt的值必须是字符串和数子和函数之中的一个
    if ( 0 in arguments && isSNF( txt ) ) {
      // 遍历 Base对象集合，并返回 Base对象
      return this.each( function( index ) {
        // 设置 文本内容
        this.textContent = funcArg( this, txt, index, this.textContent );
      } );
    }

    // 没有传参，Base对象中必须有一个元素
    if ( !( 0 in arguments ) && 0 in this ) {
      // 返回 Base对象集合中第一个元素的text字符串
      return this[ 0 ].textContent;
    }

    // 返回 Base对象
    return this;
  },
  // 获取 或 设置 html内容
  html: function( txt ) {
    // 至少传了一个参数，txt的值必须是字符串和数子和函数之中的一个
    if ( 0 in arguments && isSNF( txt ) ) {
      // 遍历 Base对象集合，并返回 Base对象
      return this.each( function( index ) {
        // 设置 html字符串
        this.innerHTML = funcArg( this, txt, index, this.innerHTML );
      } );
    }

    // 没有传参，Base对象中必须有一个元素
    if ( !( 0 in arguments ) && 0 in this ) {
      // 返回 Base对象集合中第一个元素的HTML字符串
      return this[ 0 ].innerHTML;
    }

    //返回 Base对象
    return this;
  },
  // 清空 元素里的DOM节点
  empty: function() {
    // 遍历 Base对象集合，并返回 Base对象
    return this.each( function() {
      // 清空 DOM节点
      this.innerHTML = '';
    } );
  },
  // 获取 或 设置 value值
  val: function( txt ) {
    // 至少传了一个参数，txt的值必须是字符串和数子和函数之中的一个
    if ( 0 in arguments && isSNF( txt ) ) {
      // txt传递的是 Null的话，就等于空字符串
      if ( isNull( txt ) ) txt = '';
      // 遍历 Base对象集合，并返回 Base对象
      return this.each( function( index ) {
        // 设置 value值
        this.value = funcArg( this, txt, index, this.value );
      } );
    }

    // 没有传参，Base对象中必须有一个元素
    if ( !( 0 in arguments ) && 0 in this ) {
      // 返回 Base对象集合中第一个元素的value值
      return this[ 0 ].value;
    }

    // 返回 Base对象
    return this;
  },
  // 在 Base对象集合中符合css选择器的元素
  find: function( selector ) {
    // selector未传参，返回 Base对象
    if ( !selector ) return this;
    // selector传递的是 字符串
    if ( isStr( selector ) ) {
      // 将 Base对象集合的第一个元素作为上下文传递到qsa方法，并返回 Base对象，这里的context是作为seletor传值的
      return $( base.qsa( this[ 0 ], selector ), this.selector + ' ' + selector );
    }
  },
  // 获取元素的父节点(不传值) || 如果 selector传递了选择器，则过滤出符合要求的元素
  // $( 'p' ).parent( '#n1' ) 等同于 $( 'p' ).parent().filet( 'n1' );
  parent: function( selector ) {
    var nodes = [];
    // 遍历 Base对象集合
    this.each( function( index ) {
      // 将每个元素的父节点写入数组
      nodes[ index ] = this.parentNode;
    } );
    // 这里最终返回的还是 Base对象，unrepeat函数的作用是去除重复的元素节点
    return filtered( unrepeat( nodes ), selector, this.selector );
  },
  // 在元素前插入内容(外部)
  before: function( html ) {
    return this.each( function() {
      this.parentNode.insertBefore( base.fragment( html )[ 0 ], this );
    } );
  },
  // 在元素后插入内容(外部)
  after: function( html ) {
    return this.each( function() {
      this.parentNode.insertBefore( base.fragment( html )[ 0 ], this.nextSibling );
    } );
  },
  // 过滤 Base对象对象集合，返回满足css选择器的集合
  filter: function( selector ) {
    // selector传递的是 函数，就返回 not方法的反值
    if (isFunction(selector)) return this.not( this.not( selector ) );
    // selector传递的是 字符串
    if ( isStr( selector ) ) {
      // 遍历 Base对象集合，并返回 Base对象(filter方法返回的是一个数组)
      return $( filter.call( this, function( item ) {
        // 通过 matches方法判断元素是否匹配给定的选择器，不匹配就返回 false
        return base.matches( item, selector );
        // 这里的contenxt是作为selector传值的
      } ), this.selector + selector );
    }
  },
  // 过滤 Base对象对象集合，返回不能满足css选择器的集合(和filter功能相反)
  not: function( selector ) {
    var nodes = [],
        excludes;

    // selector传递的是 函数
    if ( isFunction( selector ) ) {
      // 遍历 Base对象集合
      this.each( function( index ) {
        // 回调函数返回false时，就将元素写入数组
        if ( !funcArg( this, selector, index ) ) nodes.push( this );
      } );
    }

    // selector传递的是 字符串
    if ( isStr( selector ) ) {
      // 通过 filter方法 找出需要排除的元素
      excludes = this.filter( selector );
      // 遍历 Base对象集合
      this.forEach( function( item ) {
        // 排除掉要过过滤的元素
        if ( excludes.indexOf( item ) < 0 ) {
          // 将元素写入数组
          nodes.push( item )
        }
      } );
    }

    // 返回 Base对象
    return $( nodes );
  }
}

// 在JS中函数是一种特殊的对象，也能添加属性

// 静态方法 type()，将私有函数type()，暴露给外部使用
$.type = type;

// 静态方法 param()
$.param = param;

$.ajax = ajax;

// 构造函数B 的原型链指向 '$.fn'，那么B构造的实例都将继承 '$.fn'中的方法和属性
B.prototype = $.fn;

// 将 局部变量$ 暴露给全局变量 $ 和 Base
window.$ = window.Base = $;

// 返回局部变量 $
return $;

})(
  // 通过传入 window对象，可以使 window对象变为局部变量
  // 这样在代码中访问 window对象时，就不需要将作用域链退回到顶层作用域，从而可以更快的访问 window对象
  // 将window对象作为参数传入，还可以在代码压缩时进行优化
  typeof window !== 'undefined' ? window : this
);
