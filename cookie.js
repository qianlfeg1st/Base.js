;(function( $ ) {

  let isStr = $.isStr
      isObject = $.isObject;

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

  $.cookie = cookie;

})( Base );
