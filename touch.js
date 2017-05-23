;(function( $ ) {
    // 返回的 事件对象
var touch = {},
    // 定时器ID
    touchTimeout,
    // 定时器ID
    tapTimeout,
    // 定时器ID
    swipeTimeout,
    // 定时器ID
    longTapTimeout,
    // 'longTap'事件的默认触发时间
    longTapDelay = 490,
    // 需要添加的所有方法名
    eventNames = [ 'swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap' ];

// 判断 滑动的方向
function swipeDirection( x1, x2, y1, y2 ) {
  return Math.abs( x1 - x2 ) >= Math.abs( y1 - y2 ) ?
        ( x1 - x2 > 0 ? 'Left' : 'Right' ) :
        ( y1 -y2 > 0 ? 'Up' : 'Down' );
}

// 触发 'longTap'事件，并清空 touch对象
function longTap() {
  // 清空定时器ID
  longTapTimeout = null;
  // touch.last不为空，说明已经触了'touchstart'事件
  if ( touch.last ) {
    // 主动触发 'longTap'事件
    touch.el.trigger( 'longTap' );
    // 清空 touch对象
    touch = {};
  }
}

// 取消 'longTap'事件
function cancelLongTap() {
  // 定时器ID存在的话
  if ( longTapTimeout ) {
    // 清除定时器
    clearTimeout( longTapTimeout );
    // 清空 定时器ID
    longTapTimeout = null;
  }
}

// 中止触发所有 'touch'事件
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
  return event.type === 'pointer' + type;
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

  $( document )
    .on( 'touchstart pointerdown', function( e ) {
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

    } )
    .on( 'touchmove pointermove', function( e ) {
      // 排除 非touch事件
      if ( ( _isPointerType = isPointerEventType( e, 'move' ) ) && isPrimaryTouch( e ) ) return;
      //console.info('e',e.touches[0]);
      // 获取 Touch对象
      firstTouch = _isPointerType ? e : e.touches[ 0 ];

      // 一旦触发了'touchmove'事件，就取消'longTap'事件
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
    .on( 'touchend pointerup', function( e ) {
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
            // 'doubleTap'事件的话
            if ( touch.isDoubleTap ) {
              // 触摸元素存在的话，就触发 'doubleTap'事件
              if ( touch.el ) touch.el.trigger( 'doubleTap', touch );
              // 清空 touch对象
              touch = {};
            } else {
              touchTimeout = setTimeout( function() {
                touchTimeout = null;
                if ( touch.el ) touch.el.trigger( 'singleTap', touch );
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
    .on( 'touchcancel pointercancel', cancelAll );
  // 移动滚动条时，移除所有touch事件
  //$( window ).on( 'scroll', cancelAll );
} );

// 遍历数组
eventNames.forEach( function( eventName ) {
  // 在 Base原型链上添加这些方法
  $.fn[ eventName ] = function( callback ) {
    // 注册事件，并返回 Base对象
    return this.on( eventName, callback );
  }
} );

// 将 Base对象作为参数传入
})( Base );
