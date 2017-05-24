;(function( $ ) {

  let isStr = $.isStr;

  // 获取 url地址中的参数，如果传参则获取一个对象
  function param( str ) {
    var param = {},
        items,
        key,
        search = location.search,
        indexof = search.indexOf( '=' ) > 0;

    // url字符串问号开始后的字符串的长度必须大于0
    if ( search.length ) {
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

  $.param = param;

}( Base ));
