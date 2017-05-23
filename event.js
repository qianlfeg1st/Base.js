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
