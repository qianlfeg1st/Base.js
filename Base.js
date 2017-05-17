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
    // 空数组
    emptyArray = [],
    // 数组对象的 slice方法
    slice = emptyArray.slice,
    // 数组对象的 filter方法
    filter = emptyArray.filter,
    // 数组对象的 concat方法
    concat = emptyArray.concat,
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

$.map = function( elements, callback ) {
  var value,
      values = [];

  // elements传递的是 类数组 或 数组
  if ( likeArray( elements ) ) {
    for ( var i = 0; i < elements.length; i++ ) {
      // 执行回调，并赋值
      value = callback( elements[ i ], i );
      // 过滤掉 null 和 undefined，并将结果写入数组
      if ( value != null ) values.push( value );
    }
  } else {
    // elements传递的是 对象
    for ( var key in elements ) {
      // 执行回调，并赋值
      value = callback( elements[ key ], key );
      // 过滤掉 null 和 undefined，并将结果写入数组
      if ( value != null ) values.push( value );
    }
  }

  return flatten(values);

}

// 类似得到一个数组的副本
function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }

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

  // Element
  if ( types.indexOf( 'Element' ) > 0 ) {
    return 'element';
  }

  // 默认返回 false
  return false;
}

// 是否为 布尔值
function isBoolean( val ) {
  return type( val ) === 'boolean';
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

  // 返回 param
  return param;
}

function ajax() {}

// ajax方法
/*
function ajax( {
  type = 'get',
  url = window.location.href,
  dataType = 'json',
  async = true,
  contentType = 'application/x-www-form-urlencoded',
  success = null,
  error = null,
  complete = null,
  beforeSend = null,
  data = null,
  headers = null
} = {} ) {
  // 存储XMLHttpRequest实例
  let xhr = null;

  // 存储请求成功后返回的数据
  let response = null;

  // 在发送请求前，是否取消请求
  let closed = true;

  // 是否使用了GET方式来请求
  let isGet = type === 'get' || type === 'GET' ? true : false;

  // 格式化发送到服务器的数据，转换为key=value&key=value这种格式
  let formatData = ()=> {
    // 如果用户设置了要发送的数据
    if (data) {
      let arr = [];
      for (let key in data) {
        arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
      }
      // 禁止浏览器缓存
      arr.push('time=' + (+new Date()));
      return arr.join('&');
    } else {
      return '';
    }
  };

  // 如果请求方式是GET且发送的数据不为空，在ULR后带上参数
  url = isGet ? url + '?' + formatData() : url;

  // 设置额外的HTTP头信息
  let setHeaders = ()=> {
    // 如果用户设置了额外的头信息
    if (headers) {
      for (let key in headers) {
        // 批量设置头信息
        xhr.setRequestHeader(key, headers[key]);
      }
    }
  };

  // 创建XMLHttpRequest实例
  try {
    // 尝试用标准方法创建XMLHttpRequest实例
    xhr = new XMLHttpRequest();
  } catch (e) {
    // 兼容IE6的方法
    xhr = new ActiveXObject('Microsoft.XMLHTTP');
  }

  // 初始化 HTTP请求
  xhr.open(type, url, async);

  // 执行beforeSend回调，并获取返回值
  closed = beforeSend ? beforeSend(xhr) : true;

  // 判断是否手动取消了请求
  if (closed || closed === undefined) {
    // 没有取消请求，发起请求
    isGet ? xhr.send(null) : (xhr.setRequestHeader('content-type', contentType), setHeaders(), xhr.send(formatData()));
  } else {
    // 取消请求
    return;
  }

  // 监听readyState属性
  xhr.onreadystatechange = ()=> {
    if (xhr.readyState === 4) {
      // 执行complete回调
      complete ? complete(xhr, xhr.status) : null;
      // 请求成功，状态>=200 && < 300 表示成功
      if (xhr.status >= 200 && xhr.status < 300) {
        switch (dataType) {
          case 'json':
            // 序列化JSON字符串
            response = jsonParse( xhr.responseText );
            break;
          case 'text':
            response = xhr.responseText;
            break;
          case 'xml':
            response = xhr.responseXML;
            break;
        }
        // 执行success回调
        success ? success(response, xhr.status, xhr) : null;
      // 请求失败
      } else {
        // 执行error回调
        error ? error(xhr.statusText, xhr.status, xhr) : null;
      }
    }
  }
  // 返回XMLHttpRequest实例
  return xhr;
}
*/

// 序列化JSON字符串
function jsonParse( str ) {
    try {
      // 返回 使用JSON.parse()序列化的字符串
      return JSON.parse( str );
    } catch (e) {
      // 返回 使用(new Function('return ' + str))()序列化的字符串
      return new Function( 'return ' + str )();
    }
}

// 反序列化JSON字符串
function jsonStr( obj ) {
  var i,
      arr = [];
  // 遍历对象
  for ( i in obj ) {
    // 将 xxx:xxx格式的字符串写入数组
    arr.push( i + ':' + obj[ i ] );
  }
  // 返回 反序列化后的字符串
  return '[{' + arr.join( ',' ) + '}]';
}

function cookie() {}
// 获取 或 设置 cookie值
/*
function cookie( key, {
  value = '',
  domain = '',
  path = '',
  day = ''
} = {} ) {

  var cookieVal = document.cookie,
      index,
      param = {};

  // 传递了两个以下的参
  if ( arguments.length < 2 ) {
    // cookie值为空，就返回 看空字符串
    if ( !cookieVal ) return '';
    // 用'; '将cookie字符串分割成数组，然后遍历
    cookieVal.split('; ').forEach( function( item ) {
      // 第一次出现'='的位置
      index = item.indexOf('=');
      // 用下标的方式将属性和属性值写入对象
      param [ item.slice( 0 , index ) ] = item.slice( index + 1 );
    } );
    // key不为空
    if ( key ) {
      // key传递的必须是 字符串
      if ( isStr ) {
        // 返回 value值
        return param[ key ];
      }
    } else {
      // 返回 param对象
      return param;
    }
  }

  // 传递了两个参数
  if ( arguments.length === 2 ) {
    // 第二个参数传递的必须是 对象
    if ( isObject( arguments[ 1 ] ) ) {
      if ( day ) {
        // 当前时间
        var date = new Date();
        // 过期时间
        date.setTime( +date + day * 24 * 3600 * 1000 );
        // 设置过期时间的字符串
        day = ';expires=' + date.toUTCString();
      }
      // 设置 cookie
      document.cookie = key + '=' + encodeURIComponent( value ) + ';path=' + path + day + ';domain=' + domain + ';';
    }
  }
}
*/

// 获取 和 设置 localStorage
function storage( key, val ) {
  var storage = window.localStorage;

  // 宿主环境不存在localStorage这个API，就终止执行
  if ( !storage ) return;

  // 至少传递了两个参数
  if ( 1 in arguments ) {
    // 设置 localStorage
    storage.setItem( key, val );
  }

  if ( 0 in arguments ) {
    // 获取 localStorage
    return storage.getItem( key );
  } else {
    // 返回 Storage对象
    return storage;
  }
}

// 删除 和 清空 localStorage
function removeStorage( key ) {

  var storage = window.localStorage;

  // 宿主环境不存在localStorage这个API，就终止执行
  if ( !storage ) return;

  // 至少传递了一个参数
  if ( 0 in arguments ) {
    // 删除某个值
    storage.removeItem( key );
  // 没有传参
  } else {
    // 清空 localStorage
    storage.clear();
  }
}

// 获取指定元素的子节点(不包含文本节点)
function children( element ) {
  // element是元素节点
  if ( 'children' in element ) {
    // 转换为数组，并返回
    return slice.call( element.children );
  } else {
    // 遍历集合
    $.map( element.children, function( node ) {
      // 如果是元素节点，就返回
      if ( node.nodeType === 1 ) return node;
    } );
  }
}

// 对于通过字面量定义的对象和new Object的对象返回true，new Object时传参数的返回false
function isPlainObject( obj ) {
  return isObject( obj ) && !isWindow( obj ) && Object.getPrototypeOf( obj ) === Object.prototype;
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
        //dom = this.fragment( selector, RegExp.$1, context );
        // 由于传入的是HTML 这里必须清空selector
        //selector = null;
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

    // selector传递的是 Window对象
    if ( isWindow( selector ) ) {
      dom = [ selector ];
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
  concat: function(){
    var i, value, args = []
    for (i = 0; i < arguments.length; i++) {
      value = arguments[i]
      args[i] = base.isB(value) ? value.toArray() : value
    }
    return concat.apply(base.isB(this) ? this.toArray() : this, args)
  },
  // 遍历Base对象集合的方法，其实就是遍历数组
  each: function( callback ) {
    // 借用数组的 every方法进行迭代(第一次返回，就返回false)
    emptyArray.every.call( this, function( item, index ) {
      // 当callback(回调函数)返回false时，就停止迭代，否则会遍历整个数组
      return callback.call( item, index, item ) !== false;
    });
    // 返回 Base对象
    return this;
  },
  map: function( fn ) {
    return $( $.map( this, function( el, i ) {
      return fn.call( el, i, el );
    } ) );
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
      }, 0 );
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
    // 返回 Base对象集合的length属性
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
  // 获取 和 设置CSS值
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
  // 获取 和 设置 属性值
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
  // 获取 和 设置 文本内容
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
  // 获取 和 设置 html内容
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
  // 清空 Base对象集合里每个元素的内容
  empty: function() {
    // 遍历 Base对象集合，并返回 Base对象
    return this.each( function() {
      // 清空 DOM节点
      this.innerHTML = '';
    } );
  },
  // 获取 和 设置 value值
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
  },
  // 返回Base对象集合中的第一个元素
  first: function() {
    var element = this[ 0 ];
    return element && ( !isObject( element ) ? element : $( element ) );
  },
  // 返回Base对象集合中的最后一个元素
  last: function() {
    var element = this[ this.length - 1 ];
    return element && ( !isObject( element ) ? element : $( element ) );
  },
  // 获取集合的子集，从start开始，如果给定end，提取从从start开始到end结束的元素，但是不包含end位置的元素
  slice: function( start, end ) {
    // 借用数组的slice方法，并返回 Base对象
    return $( slice.apply( this, arguments ) );
  },
  // 从集合中获取给定索引值的元素(以0为基数)
  eq: function( index ) {
    return index === -1 ? this.slice( index ) : this.slice( index, +index + 1 );
  },
  // 向元素添加新的子节点，作为最后一个子节点
  append: function( html ) {
    // 遍历集合，并返回 Base对象
    return this.each( function() {
      // 添加子节点
      this.appendChild( base.fragment( html )[ 0 ] );
    } );
  },
  // 将匹配的元素插入到目标元素的末尾
  appendTo: function( target ) {
    var self = this;
    // 遍历集合，并返回 Base对象
    return $( target ).each( function() {
      // 添加子节点
      this.appendChild( base.fragment( self.selector )[ 0 ] );
    } );
  },
  // 获取 和 设置 data-x-x属性
  data: function( key, val ) {
    // 将key中的大写字母前面加上'-'，并转化为小写
    var name = 'data-' + key.replace( /([A-Z])/g, '-$1' ).toLowerCase();

    // 至少传递了两个参数
    if ( 1 in arguments ) {
      // 设置属性
      this.attr( name, val );
    } else {
      // 读取属性
      return this.attr( name );
    }

    // 返回 Base对象
    return this;
  },
  // 获取 元素节点，如果没有传递参数则以数组的方式返回所有元素
  get: function( index ) {
    // 至少传递了一个参数
    if ( 0 in arguments ) {
      // 返回 元素节点
      return this[ index ];
    } else {
      // 返回 数组
      return slice.call( this );
    }
  },
  // 设置元素的宽度，如果没有传参的话则获取集合中第一个元素的宽度
  width: function( val ) {
    // 至少传递了一个参数
    if ( 0 in arguments ) {
      // val传递的必须是 字符串、数字、函数中的一种
      if ( isSNF( val ) ) {
        // 遍历 Base对象集合，并返回 Base对象
        return this.each( function( index ) {
          // 设置元素的宽度
          $( this ).css( 'width', funcArg( this, val, index, $( this ).width() ) );
        } );
      }
    } else {
      // 返回 Base对象集合中第一个元素的宽度
      return +this.eq( 0 ).css( 'width' ).replace( /[a-zA-Z]/g, '' );
    }
  },
  // 设置元素的高度，如果没有传参的话则获取集合中第一个元素的高度
  height: function( val ) {
    // 至少传递了一个参数
    if ( 0 in arguments ) {
      // val传递的必须是 字符串、数字、函数中的一种
      if ( isSNF( val ) ) {
        // 遍历 Base对象集合，并返回 Base对象
        return this.each( function( index ) {
          // 设置元素的宽度
          $( this ).css( 'height', funcArg( this, val, index, $( this ).height() ) );
        } );
      }
    } else {
      // 返回 Base对象集合中第一个元素的宽度
      return +this.eq( 0 ).css( 'height' ).replace( /[a-zA-Z]/g, '' );
    }
  },
  // 显示 或 隐藏匹配的元素
  toggle: function( val ) {
    // 遍历Base对象集合，并返回 Base对象
    return this.each( function() {
      // 将元素节点转换为 Base对象
      var element = $( this );
      if ( val ) {
        // 显示元素
        element.show();
      } else {
        // 隐藏元素
        element.hide();
      }
    } );
  },
  // 获取元素的索引值
  index: function( selector ) {
    // 至少传了一个参数
    if ( 0 in arguments ) {
      // 返回 元素在Base对象集合中的索引值
      return this.indexOf( $( selector )[ 0 ] );
    } else {
      // 返回 Base对象集合的第一个元素在兄弟节点中的索引值
      return this.parent().children().indexOf( this[ 0 ] );
    }
  },
  // 获取 子元素
  children: function( selector ) {
    var arr = [];
    var node = [];

    // 遍历 Base对象集合
    this.each( function() {
      // 是元素节点，合并所有子节点数组
      if ( 'children' in this ) arr = arr.concat( slice.call( this.children ) );
    } );

    // 至少传递了一个参数
    if ( 0 in arguments ) {
      // 遍历数组
      $.each( arr, function( index, item ) {
        // 判断元素的父节点是否能匹配给定的选择器
        if ( base.matches( item.parentNode, selector ) ) {
          // 将匹配到的元素写入数组
          node.push( item );
        }
      } );
      // 返回 Base对象
      return $( node );
    }

    // 返回 Base对象
    return $( arr );
  },
  // 获取集合中第一个元素的下一个兄弟节点
  next: function() {
    return $( this.get( 0 ).nextElementSibling );
  },
  // 获取集合中第一个元素的上一个兄弟节点
  prev: function() {
    return $( this.get( 0 ).previousElementSibling );
  },
  // 获取集合中第一个元素的已定位的父元素，默认的父元素就是body
  offsetParent: function() {
    return $( this[ 0 ].offsetParent || document.body );
  },
  // 获取 和 设置 元素的位置
  offset:  function( obj ) {
    // 至少传递了一个参数
    if ( 0 in arguments ) {
      // 遍历 Base对象集合，并返回 Base对象
      return this.each( function( index ) {
            // 缓存 Base对象
        var $this = $( this ),
            // 处理参数是函数的情况
            coords = funcArg( this, obj, index, $this.offset() ),
            // 已定位的父元素的位置
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            };
        // 元素没有定位的话，就添加相对定位 'relative'
        if ( $this.css( 'position' ) === 'static' ) props[ 'position' ] = 'relative';
        // 设置位置
        $this.css( props );
      } );
    }
    // Base对象集合中没有元素，就返回 null
    if ( !this.size() ) return null;
    // 获取元素位置对象
    var point = this[ 0 ].getBoundingClientRect();
    // 返回 元素位置
    return {
      top: point.top + window.pageYOffset,
      bottom: point.bottom + window.pageYOffset,
      left: point.left + window.pageXOffset,
      right: point.right + window.pageXOffset,
      width: Math.round( point.width ),
      height: Math.round( point.height )
    }
  },
  // 获取集合中第一个元素的兄弟节点，如果给定选择器参数，过滤出符合选择器的元素
  siblings: function( selector ) {
    var nodes = [],
        $this = this.parent().children().not( this.selector );
    // 至少传了一个参数
    if ( 0 in arguments ) {
      // 遍历 Base对象集合
      $this.each( function() {
        // 能匹配给定的选择器的话
        if ( base.matches( this, selector ) ) {
          // 将 元素写入数组
          nodes.push( this );
        }
      } );
      // 返回 Base对象
      return $( nodes );
    }
    // 返回 Base对象
    return $this;
  },
  // 获取 和 设置 页面上的滚动元素 和 整个页面 向下滚动的距离
  scrollTop: function( val ) {
    // 集合中没有元素，就终止执行
    if ( !this.length ) return;
    // 缓存 集合的第一个元素
    var node = this[ 0 ];
    // 集合中的第一个元素是否拥有 scrollTop这个属性
    var hasScrollTop = 'scrollTop' in node;
    // 未传参
    if ( arguments.length === 0 ) {
      // 返回 body.scrollTop 或者 window.pageYOffset
      return hasScrollTop ? node.scrollTop : node.pageYOffset;
    }
    // 遍历 Base对象集合，并返回 Base对象
    return this.each( function() {
      // 存在 scrollTop属性的话
      if ( hasScrollTop ) {
        // 通过 scrollTop去设置
        this.scrollTop = val;
      } else {
        // 通过 scrollTo去设置
        this.scrollTo( this.scrollX, val );
      }
    } );
  },
  // 从元素本身开始，逐级向上级元素匹配，并返回最先匹配selector的元素
  closest: function( selector, context ) {
        // 缓存sDOM节点
    var nodes = [],
        // selector传递的不是对象的话(字符串)，就转换为 Base对象并赋值
        collection = isObject( selector ) && $( selector );

    // 遍历 Base对象集合，并返回 Base对象
    this.each( function( _, node ){
      // node不为空，并在Base对象中查找到了node节点 或者 selector(选择器字符串)不能匹配到node
      while ( node && !( collection ? collection.indexOf( node ) >= 0 : base.matches( node, selector ) ) ) {
        // 当node 不是 context、document时，获取父节点
        node = node !== context && !isDoc( node ) && node.parentNode;
      }
      // 当 node节点存在，并且在缓存中(nodes)查找不到的话，就将node节点写入缓存
      if ( node && nodes.indexOf( node ) < 0 ) nodes.push( node );
    } );
    // 返回 Base对象
    return $( nodes );
  }
}

// 扩展，deep表示是否深度扩展
function extend( target, source, deep ) {
  // 遍历 source对象
  for ( var key in source ) {
    // 需要深度扩展
    if ( deep && ( isPlainObject( source[ key ] ) || isArray( source[ key ] ) ) ) {
      // 需要扩展的是对象，并且target相对的key不是对象
      if ( isPlainObject( source ) && !isPlainObject( target[ key ] ) ) {
        target[ key ] = {};
      }
      // 需要扩展的数据是数组，并且target相对应的key不是数组
      if ( isArray( source[ key ] ) && !isArray( target[ key ] ) ) {
        target[ key ]= [];
      }
      // 递归
      extend( target[ key ], source[ key ], deep );
    }
    if ( source[ key ] !== undefined ) {
      target[ key ] = source[ key ]
    }
  }
}

$.extend = function( target ) {
      // 表示是否深度扩展
  var deep,
      // 将 arguments转换为数组，并且删除第一个参数，然后赋值给 args
      args = slice.call( arguments, 1 );

  // target(第一个参数)传递的是 布尔值，表示是否深度扩展
  if ( isBoolean( target ) ) {
    // 将 target(布尔值) 赋值给deep
    deep = target;
    // 删除参数数组中的第一个成员(布尔值)，返回一个新的数组，然后赋值给 target变量
    target = args.shift();
  }
  // 遍历参数，全部扩展到 target上
  args.forEach( function( arg ) {
    extend( target, arg, deep );
  } );

  // 返回 target
  return target;
}

// 函数在JS中是一种特殊的对象，也能添加属性

// 获取数据类型
$.type = type;
// 获取url参数
$.param = param;
// ajax
$.ajax = ajax;
// JOSN序列化
$.parseJSON = jsonParse;
// JSON反序列化
$.strJSON = jsonStr;
// 获取和设置cookie
$.cookie = cookie;
// 获取和设置localStorage
$.storage = storage;
// 删除和清空localStorage
$.removeStorage = removeStorage;

$.isFunction = isFunction;
$.isStr = isStr;
$.isObject = isObject;
$.isPlainObject = isPlainObject;

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

;(function( $ ) {
    // Base对象集合每个元素对应的ID，初始值是 1
var _bid = 1,
    isPlainObject = $.isPlainObject;
    // 是否为函数
    isFunction = $.isFunction,
    // 是否为字符串
    isStr = $.isStr,
    // 是否为对象
    isObject = $.isObject,
    // 数组对象的slice方法
    slice = Array.prototype.slice,
    // 事件缓存池
    handlers = {},
    // 处理 mouseenter、mouseleave事件时使用(mouseenter、mouseleave不冒泡，mouseover、mouseout功能一样且支持冒泡)
    hover = {
      mouseenter: 'mouseover',
      mouseleave: 'mouseout'
    },
    // 是否支持 'onfocusin'事件(onfocusin 支持冒泡，onfocus 不支持冒泡)
    focusinSupported = 'onfocusin' in window,
    // 处理 focus、blur事件时使用
    focus = {
      focus: 'focusin',
      blur: 'focusout'
    },
    // 需要向代理事件对象里添加的方法
    eventMethods = {
      // 阻止默认事件
      preventDefault: 'isDefaultPrevented',
      // 阻止冒泡且阻止其它事件执行
      stopImmediatePropagation: 'isImmediatePropagationStopped',
      // 阻止事件冒泡
      stopPropagation: 'isPropagationStopped'
    },
    returnTrue = function() {
      return true;
    },
    returnFalse = function() {
      return false;
    },
    // 创建代理对象是，忽略对象的这些属性
    ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
    specialEvents={};

    specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents';

// 给 Base对象里的元素设置唯一的ID 或者 取出元素的ID
function bid( element ) {
  // 元素节点对象中已经存在这个ID，就返回这个ID。不存在的话，就在元素节点对象中写入一个ID(默认值是1)，并返回这个ID
  return element._bid || ( element._bid = _bid++ )
}

// 处理带有命名空间的事件，例子：'click.xxoo' => { e: 'click', ns: 'xxoo' }
// 这样的优点是，可以在一个元素上注册多个相同的事件，例子：$( '#xxoo' ).on( 'click.1 click.2 click.3', function() {} );
function parse( event ) {
  // 先转换为字符串，然后用'.'分割成数组
  var parts = ( '' + event ).split( '.' );
  // 返回 一个对象
  return {
    // 事件名
    e:  parts[ 0 ],
    // 命名空间
    ns: parts[ 1 ]
  }
}

// 找出复合条件的事件
// 将 'mouseenter' => 'mouseover'，'mouseleave' => 'mouseout'
// 将 'focus' => 'focusin'，'blur' => 'focusout'
function realEvent( type ) {
  return hover[ type ] || ( focusinSupported && focus[ type ] ) || type;
}

// 确定事件的执行阶段，冒泡阶段 或 捕获阶段
function eventCapture( handler, captureSetting ) {
  return handler.del &&
         // focus与blur事件不支持冒泡，利用捕获来替代冒泡
         ( !focusinSupported && ( handler.e in focus ) ) ||
         !!captureSetting
}

// 'event' => 代理的event对象，'source' => 原生的event对象
function compatible( event, source ) {
  // source传递了参数 或者 事件对象中没有 'isDefaultPrevented'方法
  if ( source || !event.isDefaultPrevented ) {
    // 将原生的事件对象拷贝给 source
    source || ( source = event );
    // 遍历 eventMethods对象
    $.each( eventMethods, function( key, val ) {
      // 获取 三个原生方法
      var sourceMethod = source[ key ];

      event[ key ] = function() {
        // 调用 对应的方法后，将其标记为true
        this[ val ] = returnTrue;
        //
        return sourceMethod && sourceMethod.apply( source, arguments );
      }
      // 在原生事件对象中添加 三个方法
      // 'isDefaultPrevented' => '阻止默认事件'
      // 'isImmediatePropagationStopped' => '阻止冒泡且阻止其它事件执行'
      // 'isPropagationStopped' => '阻止事件冒泡'
      event[ val ] = returnFalse;
    } );
    // 设置事件的执行时间
    event.timeStamp || ( event.timeStamp = Date.now() );
    // e.defaultPrevented：DOM3
    // 此处为查看默认事件是否已经被取消
    if (source.defaultPrevented !== undefined ? source.defaultPrevented :
        'returnValue' in source ? source.returnValue === false :
        source.getPreventDefault && source.getPreventDefault())
      event.isDefaultPrevented = returnTrue
  }
  return event;
}

// 创建代理对象
function createProxy( event ) {
  // 代理的对象
  var proxy = {
    // 存储原始的事件对象
    originalEvent: event
  };

  // 遍历 事件对象
  for (var key in event ) {
    // 排除掉几个特定的属性、方法 和 空属性
    if ( !ignoreProperties.test( key ) && event[ key ] !== undefined  ) {
      // 通过下标的方式，将属性和方法写入对象
      proxy[ key ] = event[ key ]
    }
  }
  // 返回 代理事件对象
  return compatible( proxy, event );
}

/**
 * 事件绑定
 * @param {NodeList}   element   元素节点
 * @param {String}     events    事件类型
 * @param {Function}   fn        回调函数
 * @param {String}     selector  【可选】 事件委托的节点选择器
 * @param {Object}     data      【可选】 额外的参数
 * @param {Function}   delegator 【可选】
 * @param {Boolean}    capture   【可选】 事件是否在捕获或冒泡阶段执行
 */
function add( element, events, fn, data, selector, delegator, capture ) {
      // Base对象集合中每个元素对应的 ID
  var id = bid( element ),
      // 在缓存中读取每个元素绑定过的事件，如果缓存中查找不到的话，就在缓存中添加一个元素，初始值是空数组，并且set的值也是空数组
      set = ( handlers[ id ] || ( handlers[ id ] = [] ) );

  // 传入多个事件的话，把 events(字符串)用空白字符分割成数组，然后遍历
  events.split( /\s/ ).forEach( function( event ) {
    // 注册DOMContentLoaded事件，直接调用 ready方法
    if ( event === 'ready' ) return $( document ).reday( fn );
    var callback = delegator || fn;
    // 处理带命名空间的事件
    var handler = parse( event );
    // 事件委托的节点选择器
    handler.sel = selector;
    // 传入事件的个数
    handler.i = set.length;
    // 是否移除事件
    handler.del = delegator;
    // 未处理过的回调函数
    handler.fn = fn;
    // 处理后的回调函数(扩展了事件对象，添加了几个属性和方法)
    handler.proxy = function( e ) {
      // 给event添加了几个方法
      e = compatible( e );
      // 在回调中执行了'e.stopImmediatePropagation'方法，就终止执行
      if ( e.isImmediatePropagationStopped() ) return;
      // 在event中，增加data属性
      e.data = data;
      // 执行回调，并赋值
      // _args仅仅在trigger和triggerHandler方式调用时才有
      var result = callback.apply( element, e._args === undefined ? [ e ] : [ e ].concat( e._args ) );

      if ( result === false ) {
        // 阻止默认事件
        e.preventDefault();
        // 阻止事件冒泡
        e.stopPropagation();
      }
      return result;
    }

    // 处理 mouseover 和 mouseout事件
    if ( handler.e in hover ) {
      // 回调函数
      fn = function( e ) {
        // relatedTarget属性仅对mouseout,mouseover有效
        // mouseover而言，是指移入目标节点前离开的那个节点
        // mouseout而言，是指移出目标节点进入的那个节点
        var related = e.relatedTarget;
        //  事件已经触发完成
        if ( !related || ( related !== this && !$.contains( this, related ) ) ) {
          // 执行相应的事件处理函数
          return handler.fn.apply( this, arguments )
        }
      }
    }

    // 将事件对象(handler)写入handlers缓存中
    set.push( handler );

    // 支持'addEventListener'这个API的话
    if ( 'addEventListener' in element ) {
      // 注册事件
      element.addEventListener(
        // 事件名
        realEvent( handler.e ),
        // 回调函数
        handler.proxy,
        // 事件是否在捕获或冒泡阶段执行
        eventCapture( handler, capture )
      );
    }

  } );
}

// 找出符合条件的事件
function findHandlers( element, event, fn, selector ) {
  // 处理带命名空间的事件
  event = parse( event );
  // shi事件存在明媚空间的话，就生成命名空间的正则对象
  if ( event.ns ) var matcher = matcherFor( event.ns );
  // 返回符合条件的数组
  return ( handlers[ bid( element ) ] || [] .filter( function( handler ) {
    return handler
      // 判断事件类型是否相同
      && ( !event.e  || handler.e === event.e )
      // 判断事件命名空间是否相同
      && ( !event.ns || matcher.test( handler.ns ) )
      // 判断fn标识符是否相同
      && ( !fn       || bid( handler.fn ) === bid( fn ) )
      // 判断selector是否相同
      && ( !selector || handler.sel === selector )
  } ) );
}

// 生成命名空间的正则对象
function matcherFor( ns ) {
  return new RegExp( '(?:^| )' + ns.replace( ' ', ' .* ?' ) + '(?: |$)' );
}

// 移除事件方法
function remove( element, events, fn, selector, capture ) {

  // Base对象集合中每个元素对应的 ID
  var id = bid( element );

  // 把事件字符串(events)用空白字符串分割成数组，然后遍历
  ( events || '' ).split( /\s/ ).forEach( function( event ) {
    // 找出符合条件的事件(数组)，然后遍历数组
    findHandlers( element, event, fn, selector ).forEach( function( handler ) {
      // 删除事件缓存池中对应的事件
      delete handlers[ id ][ handler.i ];
      // 支持 'removeEventListener'这个API
      if ( 'removeEventListener' in element ) {
        // 移除事件
        element.removeEventListener(
          // 事件名
          realEvent(handler.e),
          // 事件的回调函数
          handler.proxy,
          //事件是否在捕获或冒泡阶段执行
          eventCapture( handler, capture )
        );
      }
    } );
  } );
}

// 添加事件绑定
$.fn.on = function( event, selector, data, callback, one ) {
  var autoRemove,
      delegator,
      $this = this;

  // 主要处理 on( { type: function() {}, type2: function() {} }, [selector] ) 这种情况
  if ( event && isObject( event ) ) {
    // 遍历对象
    $.each( event, function( type, fn ) {
      // 递归注册事件
      $this.on( type, selector, data, fn, one );
    } );
    // 返回 Base对象
    return $this;
  }

  // 主要处理 on( type, data ,function( e ){ ... } ) 这种情况
  if ( !isStr( selector ) && !isFunction( callback ) && callback !== false ) {
    // 第三个参数传递的可能是 函数
    callback = data;
    // 第二个参数传递的可能是 对象 或者 函数
    data = selector;
    // 清空第二个参数
    selector = undefined;
  }

  // 主要处理 on( type, function( e ){ ... } ) 这种情况
  if ( callback === undefined || data === false ) {
    // 第三个参数传递的是 函数
    callback = data;
    // 清空第三个参数
    data = undefined;
  }

  // 传入false为处理函数，默认为阻止默认事件，阻止冒泡
  // 例子 $('a').on( type, [selector], [data], false );
  if ( callback === false ) {
    // function(){ return false; } 的简写
    callback = returnFalse;
  }

  // 遍历 Base对象集合，并返回 Base对象
  return $this.each( function( index, element ) {
    // one传递了值，说明该事件只需要触发一次
    if ( one ) {
      // 移除事件绑定的匿名函数
      autoRemove = function( e ) {
        remove( element, e.type, callback );
        return callback.apply( this, arguments );
      }
    }

    // selector不为空
    if ( selector ) {
      //
      delegator = function( e ) {
            // 代理对象
        var evt,
            // 从元素本身开始，逐级向上级元素匹配，并返回最先匹配selector的元素
            match = $( e.target ).closest( selector, element ).get( 0 );

        // match不为空，并且子节点不能和父节点相同
        if ( match && match !== element ) {
          // 生成代理事件对象
          evt = $.extend( createProxy( e ), {
            currentTarget: match,
            liveFired: element
          } );
          return ( autoRemove || callback ).apply( match, [ evt ].concat( slice.call( arguments, 1 ) )
          );
        }
      }
    }

    // 核心，实现事件绑定
    add( element, event, callback, data, selector, delegator || autoRemove );
  } );
}

// 移除事件绑定
$.fn.off = function( event, selector, callback ) {
  var $this = this;

  // 主要处理 off( { type: handler, type2: handler2, ... }, [selector] ) 这种情况(注意：[selector]是可选参数)
  if ( event && !isStr( event ) ) {
    // 遍历 event
    $.each( event, function( type, fn ) {
      // 递归
      $this.off( type, selector, fn );
    } );
    // 返回 Base对象
    return $this;
  }

  // 主要处理 off( type, function(e){ ... } ) 这种情况
  if ( !isStr( selector ) && !isFunction( callback ) && callback !== false ) {
    // 第二个参数(selelctor)实际上传递的是回调函数(callback)
    callback = selector;
    // 清空 selector
    selector = undefined;
  }

  // 主要处理 off( type, [selecrtor], false ) 这种情况
  if ( callback === false ) {
    // 传入false为处理函数，阻止冒泡
    // function(){ return false; } 的简写
    callback = returnFalse;
  }

  // 遍历 Base对象集合，移除所有事件，并返回 Base对象
  return $this.each( function() {
    // 移除事件
    remove( this, event, callback, selector );
  } );
}

// 注册一个事件，执行一次到，就移除这个事件
$.fn.one = function( event, selector, data, callback ) {
  // 直接调用原型链上的on方法，但是这里传传递了了第五个参数
  return this.on( event, selector, data, callback, 'qianlifeng' );
}

// 创建并初始化一个事件
$.Event = function( type, props ) {
  // type传递的不是字符串(是对象)，其实这里的第一个参数传递的就是props
  if ( !isStr( type ) ) {
    // 无视第二个参数
    props = type;
    // 获取事件类型
    type = props.type;
  }
      // 创建 事件对象
      // click、mousedown、mouseup、mousemove 都属于 'MouseEvents'类型事件，所以需要特殊处理
  var event = document.createEvent( specialEvents[ type ] || 'Events' ),
      // 是否冒泡，默认值 false
      bubbles = false;

  // props不为空
  if ( props ) {
    // 遍历 props对象
    for ( var name in props ) {
      // 找到 'bubbles'的属性
      if ( name === 'bubbles' ) {
        // 将 其值转换为布尔值并赋值给 bubbles
        bubbles = !!props[ name ];
      } else {
        // 以下标的方式将 props对象中的属性和属性值写入 event对象
        event[ name ] = props[ name ];
      }
    }
  }
  // 初始化事件
  event.initEvent( type, bubbles, true );

  // 返回 代理事件对象
  return compatible( event );
}

// 主动触发事件
$.fn.trigger = function( event, args ) {
  // 获取 事件对象
  event = (isStr(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event);

  // 将参数args作为事件对象的属性写入
  event._args = args;

  // 遍历 Base对象集合，并返回 Base对象
  return this.each( function() {
    // 需要触发的是focus、blur类型的事件，并且DOM对象中'事件相关的属性'的值是函数，就执行这个函数
    if ( event.type in focus && isFunction( this[ event.type ] ) ) this[ event.type ]();
    // 'dispatchEvent'是浏览器原生触发事件的API
    if ( 'dispatchEvent' in this ) {
      // 触发事件
      this.dispatchEvent( event );
    } else {
      // 使用 triggerHandler方法来主动触发事件
      $( this ).triggerHandler( event, args );
    }
  } );
};

$.fn.triggerHandler = function( event, args ) {
  var e,
      result;

  this.each( function( i, element ) {
    e = createProxy( isStr( event ) ? $.Event( event ) : event );
    e._args = args;
    e.target = element;
    $.each( findHandlers( element, event.type || event ), function( i, handler ) {
      result = handler.proxy( e );
      if ( e.isImmediatePropagationStopped() ) return false
    } );
  } );
  return result;
}

// 将 Base对象作为参数传入
})( Base );

;(function( $ ) {
    // 返回的 事件对象
var touch = {},
    touchTimeout,
    tapTimeout,
    swipeTimeout,
    longTapTimeout,
    // 'longTap'(长按)事件的默认触发时间
    longTapDelay = 750,
    gesture,
    eventNames = [ 'swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap' ];

// 判断 滑动的方向
function swipeDirection( x1, x2, y1, y2 ) {
  return Math.abs( x1 - x2 ) >= Math.abs( y1 - y2 ) ?
        ( x1 - x2 > 0 ? 'Left' : 'Right' ) :
        ( y1 -y2 > 0 ? 'Up' : 'Down' );
}

// 设置 longTap(长按)，并清空 touch对象
function longTap() {
  // 清空定时器ID
  longTapTimeout = null;
  //
  if ( touch.last ) {
    touch.el.trigger( 'longTap' );
    // 清空 touch对象
    touch = {};
  }
}

// 取消 'longTap'(长按)事件
function cancelLongTap() {
  // 定时器ID存在的话
  if ( longTapTimeout ) {
    // 清除定时器
    clearTimeout( longTapTimeout );
    // 清空 定时器ID
    longTapTimeout = null;
  }
}

// 中止触发所有 touch事件
function cancelAll() {
  // 中止触发 'singleTap'事件
  if ( touchTimeout ) clearTimeout( touchTimeout );
  // 中止触发 'tap'事件
  if ( tapTimeout ) clearTimeout( tapTimeout );
  //  中止触发 'swipeXOO'事件
  if ( swipeTimeout ) clearTimeout( swipeTimeout );
  // 中止触发 'longTap'事件
  if ( longTapTimeout ) clearTimeout( longTapTimeout );
  // 清空 所有定时器ID
  touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null;
  // 清空 touch对象
  touch = {};
}

// 判断是否是一个 touch 或者 pointer事件对象
function isPrimaryTouch( e ) {
  return ( event.poniterType === 'touch' || event.poniterType === event.MSPOINTER_TYPE_TOUCH ) && event.isPrimary
}

// 判断是否是一个 Pointer Event类型的事件对象
function isPointerEventType( event, type ) {
  return ( event.type === 'pointer' + type || event.type.toLowerCase() === 'mspointer' + type );
}

$( document ).ready( function() {
      // 当前时间戳
  var now,
      // 触摸持续的时间
      delta,
      // 手指在X轴上移动的距离
      deltaX = 0,
      // 手指在Y轴上移动的距离
      deltaY = 0,
      // Touch事件对象
      firstTouch,
      // 是否是 touch类型的事件(包括 Touch Event、Pointer Event)
      _isPointerType;

  // 兼容 IE
  if ( 'MSGesture' in window ) {
    // 实例化手势对象
    gesture = new MSGesture();
    // 设置触发手势的元素
    gesture.target = document.body;
  }

  $( document )
    .on( 'touchstart MSPointerDown pointerdown', function( e ) {
      // 排除 非touch事件
      if ( ( _isPointerType = isPointerEventType( e, 'down' ) ) && isPrimaryTouch( e ) ) return;

      // 获取 Touch对象
      firstTouch = _isPointerType ? e : e.touches[ 0 ];

      // touch.x2'不为空说明，之前已经触发过 touchmove事件
      if ( e.touches && e.touches.length === 1 && touch.x2 ) {
        // 清空 'touchmove'后的X轴坐标
        touch.x2 = undefined;
        // 清空 'touchmove'后的Y轴坐标
        touch.y2 = undefined;
      }

      // 首次触摸的时间戳
      now = +new Date;

     // 触摸持续的时间
      delta = now - ( touch.last || now );

      // 获取触发事件的元素
      touch.el = $('tagName' in firstTouch.target ?
        firstTouch.target : firstTouch.target.parentNode)
      touchTimeout && clearTimeout(touchTimeout)

      // 记录 X轴坐标
      touch.x1 = firstTouch.pageX
      // 记录 Y轴坐标
      touch.y1 = firstTouch.pageY

      // 如果这是第二次触摸，并且间隔的时间小于 250毫秒，就认为是双击
      if ( delta > 0 && delta <= 250 ) touch.isDoubleTap = true;

      // 记录触发的时间
      touch.last = now;

      // 长按一定时间后，执行某些操作，并返回一个定时器ID(方便以后终止执行)
      longTapTimeout = setTimeout( longTap ,longTapDelay );

      //
      if ( gesture && _isPointerType ) gesture.addPointer( e.pointerId );
    } )
    .on( 'touchmove MSPointerMove pointermove', function( e ) {
      // 排除 非touch事件
      if ( ( _isPointerType = isPointerEventType( e, 'move' ) ) && isPrimaryTouch( e ) ) return;
      //console.info('e',e.touches[0]);
      // 获取 Touch对象
      firstTouch = _isPointerType ? e : e.touches[ 0 ];

      // 一旦触发了'touchmove'事件，就取消longTap(长按)事件
      cancelLongTap();

      // 记录手指滑动的 X轴坐标
      touch.x2 = firstTouch.pageX;
      // 记录手指滑动的 Y轴坐标
      touch.y2 = firstTouch.pageY;

      // 记录手指在 X轴上滑动的距离
      deltaX += Math.abs( touch.x1 - touch.x2 );
      // 记录手指在 Y轴上滑动的距离
      deltaY += Math.abs( touch.y1 - touch.y2 );
    } )
    .on( 'touchend MSPointerUp pointerup', function( e ) {
      // 排除 非touch事件
      if ( ( _isPointerType = isPointerEventType( e, 'up' ) ) && isPrimaryTouch( e ) ) return;

      // 一旦触发了'touchend'事件，就取消longTap(长按)事件
      cancelLongTap();

      // 处理 'swipe'事件
      // 手指在 'X轴' 或 'Y轴' 的位移大于 30
      if ( ( touch.x2 && Math.abs( touch.x1 - touch.x2 ) > 30 ) ||
           ( touch.y2 && Math.abs( touch.y1 - touch.y2 ) > 30 ) ) {
        // setTimeout在这里起到尾执行的作用
        swipeTimeout = setTimeout( function() {
          // 触摸元素不为空
          if ( touch.el ) {
            touch.deltaX = Math.abs( touch.x1 - touch.x2 );
            touch.deltaY = Math.abs( touch.y1 - touch.y2 );
            touch.direction = swipeDirection( touch.x1, touch.x2, touch.y1, touch.y2 );
            // 触发 'swipe'事件
            touch.el.trigger( 'swipe', touch );
            // 触发 'swipeLeft 或 swipeRight 或 swipeUp 或 swipeDown'事件
            touch.el.trigger( 'swipe' + ( swipeDirection( touch.x1, touch.x2, touch.y1, touch.y2 ) ), touch );
          }
          // 清空 touch对象
          touch = {};
        }, 0 );
      }

      // 处理 'tap'事件
      if ( 'last' in touch ) {
        // 手指在 'X轴' 和 'Y轴' 的位小于 30
        if ( deltaX < 30 && deltaY < 30 ) {
          tapTimeout = setTimeout( function() {
            var event = $.Event( 'tap' );
            event.cancelTouch = cancelAll;
            if ( touch.el ) touch.el.trigger( event );
            //
            if ( touch.isDoubleTap ) {
              // 触摸元素存在的话，触发 'doubleTap'事件
              if ( touch.el ) touch.el.trigger( 'doubleTap' );
              // 清空 touch对象
              touch = {};
            } else {
              touchTimeout = setTimeout( function() {
                touchTimeout = null;
                if ( touch.el ) touch.el.trigger( 'singleTap' );
                touch = {};
              }, 250 );
            }
          }, 0 );
        }
      } else {
        // 清空 touch对象
        touch = {};
      }
      // 清空 手指在X、Y轴移动的距离
      deltaX = deltaY = 0;
    } )
    .on( 'touchcancel MSPointerCancel pointercancel', cancelAll );
  // 移动滚动条时，移除所有touch事件
  $( window ).on( 'scroll', cancelAll );
} );

// 遍历数组
[ 'swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap' ].forEach( function( eventName ) {
  // 在 Base原型链上添加方法
  $.fn[ eventName ] = function( callback ) {
    // 注册事件，并返回 Base对象
    return this.on( eventName, callback );
  }
} );

// 将 Base对象作为参数传入
})( Base );
