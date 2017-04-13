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
    // HTML代码片断的正则
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    // 空数组...
    emptyArray = [],
    // 数组对象的 slice方法
    slice = emptyArray.slice,
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
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'];

// 初始化
$ = function( selector, context ) {
  // 每次调用 $() 或 Base()，都会执行 base.init()进行初始化
  return base.init( selector, context );
};

$.each = function( elements, callback ) {
  // 类数组对象
  if ( likeArray( elements ) ) {
    for (var i = 0; i < elements; i++ ) {
      if ( callback.call( elements[ i ], i, elements[ i ] === false ) ) {
        return false;
      }
    }
  // 普通对象
  } else {
    for ( var key in elements ) {
      if ( callback.call( elements[ key ], key, elements[ key ] === false ) ) {
        return elements;
      }
    }
  }
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
  switch ( Object.prototype.toString.call( val ) ) {
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
    default:
      return false;
  }
}

// 判断数据是否是类数组对象，例如NodeList和argument
function likeArray( obj ) {
  var types = type( obj );
  var length = obj.length;
  // obj必须是对象，不能是数组、函数、window
  if ( typeof obj === 'object' && types !== 'array' && types !== 'function' && types !== 'window' ) {
    // obj中必须有length属性，length的值必须是Number类型，并且大于等于0
    if ( 'length' in obj && type( length ) === 'number' && length >= 0 ) {
      return true;
    }
  }
  return false;
}

base = {
  // 初始化方法
  init: function( selector, context ) {

    // DOM集合
    var dom;

    // selector 未传参，返回 空的Base对象
    if ( !selector ) return this.B();

    // selector 传递的是 字符串
    if ( type( selector ) === 'string' ) {
      // 去除字符串首尾的空格
      selector = selector.trim();

      // selector 传递的是 HTML
      if ( selector[ 0 ] === '<' && fragmentRE.test( selector ) ) {
        // 创建 DOM节点
        dom = this.fragment( selector, RegExp.$1, context );
        debugger;
        // 由于传入的是HTML 这里必须清空selector
        selector = null;
      } else {
        // context 传递了上下文
        if ( context !== undefined ) {
          // 在上下文中查找元素，并返回
          return $( contentx ).find( selector );
        } else {
          // 通过 选择器查找元素
          dom = this.qsa( document, selector );
        }
      }
    }

    // selector 传递的是 函数
    if ( type( selector ) === 'function' ) {
      // DOM构建完成后执行这个函数
      return $( documnet ).ready( selector );
    }

    // selector 传递的是 Base构造的实例
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
      // 顺便把 NodeList转换为数组，方便后面遍历
      dom = slice.call( container.childNodes );

      // 传入了上下文
      if ( type( properties ) ) {
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
  }
};

// Baase对象的原型链上的方法和属性
$.fn = {
  // 该属性的值是 工厂函数，而不是 构造函数
  constructor: base.B,
  length: 0,
  // 将一些操作数组的原生方法添加进来
  forEach: emptyArray.forEach,
  reduce: emptyArray.reduce,
  push: emptyArray.push,
  sort: emptyArray.sort,
  splice: emptyArray.splice,
  indexOf: emptyArray.indexOf,
  //
  each: function( callback ) {
    // 借用数组的 every方法 进行迭代
    emptyArray.every.call( this, function( item, index ) {
      return callback.call( item, index, item ) !== false;
    });
    return this;
  },
}


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
