// 使用 IIFE(立即执行函数表达式)，避免污染全局命名空间
(function() {

// 定义一些常用的变量
var $,
    base,
    // document对象
    document = window.document,
    // 空数组...
    emptyArray = [],
    // 数组对象的 slice方法
    slice = emptyArray.slice;

// 初始化
$ = function( selector, context ) {
  // 每次调用 $() 或 Base()，都会执行 base.init()进行初始化
  return base.init( selector, context );
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

//
function isB( obj ) {
  return obj instanceof base.B;
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
    // DOM节点
    case '[object HTMLDivElement]':
      return 'dom'
    default:
      return false;
  }
}

base = {
  // 初始化方法
  init: function( selector, context ) {

    console.info('初始化开始!');

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
        dom = base.fragment( selector, RegExp.$1, context );
        // 由于传入的是HTML 这里必须清空selector
        selector = null;
      }

      // context 传递了上下文
      if ( context !== undefined ) {
        // 在上下文中查找元素，并返回
        return $( contentx ).find( selector );
      } else {
        // 通过 选择器查找元素
        dom = this.qsa( document, selector );
      }
    }

    // selector 传递的是 函数
    if ( type( selector ) === 'function' ) {
      // DOM构建完成后执行这个函数
      return $( documnet ).ready( selector );
    }

    // selector 传递的是 Base构造的实例
    if ( isB( selector ) ) {
      // 返回 selector对象
      return selector;
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
  }
};

// 将 局部变量$ 暴露给全局变量 $ 和 Base
window.$ = window.Base = $;

// 返回局部变量 $
return $;

})();
