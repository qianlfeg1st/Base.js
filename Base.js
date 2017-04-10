// 使用 IIFE(立即执行函数表达式)，避免污染全局命名空间
(function() {

// 定义一些常用的变量
var $,
    base;

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

base = {
  // 初始化方法
  init: function( selector, context ) {
    console.info('初始化开始!');
    // DOM集合
    var dom;

    // selector 为未参，返回 空的Base对象
    if ( !selector ) return this.B();
  },
  // 工厂方法
  B: function( dom, selector ) {
    // 返回 Base构造的实例
    return new B( dom, selector );
  }
};

// 将 局部变量$ 暴露给全局变量 $ 和 Base
window.$ = window.Base = $;

// 返回局部变量 $
return $;

})();
