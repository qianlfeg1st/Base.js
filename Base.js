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

base = {
  // 初始化方法
  init: function( selector, context ) {
    console.info('初始化开始!');
  }
};

// 将 局部变量$ 暴露给全局变量 $ 和 Base
window.$ = window.Base = $;

// 返回局部变量 $
return $;

})();
