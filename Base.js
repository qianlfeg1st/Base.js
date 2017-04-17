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
    };

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
  // obj不能为空值 或 undefined
  if ( obj &&
      // obj必须是 对象
      typeof obj === 'object' &&
      // obj不能是 函数
      types !== 'function' &&
      // obj不能是 window对象
      types !== 'window' ) {
    // obj中必须有 length属性
    if ( 'length' in obj &&
        // length的值必须是数字
        type( length ) === 'number' &&
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
  if ( type( arg ) === 'function' ) {
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
  if ( ( type( val ) === 'number' ||
  // val 是字符串，同时转换为数字在转换为字符串后的值与val相等，列子：'100'
  ( type( val ) === 'string' && val === (+val) + '' ) ) &&
  // name不在 cssNumber索引中
  !cssNumber[ name ] ) {
    // 在 末尾增加'px'，并返回
    return val + 'px';
  } else {
    // 不做处理
    return val;
  }
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
      if ( types === 'string' ) {
        // 因为内联样式的优先级最高，所以先查找内联样式，如果找不到再用 getComputedStyle方法获取元素所有的样式
        return element.style[ camelCase( property ) ] || getComputedStyle(element, '').getPropertyValue(property);
      }
      // property传递的是 数组
      if ( types === 'array' ) {
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
      if ( types === 'string' ) {
        // val值是null 或 undefine 或 空字符串 的情况，排除掉等于0的情况
        if ( !val && val !== 0 ) {
          // 遍历对象集合
          this.each( function() {
            // 删除样式
            this.style.removeProperty( dasherize( property ) );
          } );
        } else {
          // 格式化样式，例子：font-size: 24px
          css = dasherize( property ) + ':' + maybeAddPx( property, val );
        }
      }
      // property传递的是 对象
      if ( types === 'object' ) {
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
  }
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
