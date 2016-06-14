/* */ 
"format cjs";
(function(process) {
  ;
  (function(undefined) {
    var objectTypes = {
      'function': true,
      'object': true
    };
    var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports,
        freeSelf = objectTypes[typeof self] && self.Object && self,
        freeWindow = objectTypes[typeof window] && window && window.Object && window,
        freeModule = objectTypes[typeof module] && module && !module.nodeType && module,
        moduleExports = freeModule && freeModule.exports === freeExports && freeExports,
        freeGlobal = freeExports && freeModule && typeof global == 'object' && global && global.Object && global;
    var root = root = freeGlobal || ((freeWindow !== (this && this.window)) && freeWindow) || freeSelf || this;
    var Rx = {
      internals: {},
      config: {Promise: root.Promise},
      helpers: {}
    };
    var noop = Rx.helpers.noop = function() {},
        identity = Rx.helpers.identity = function(x) {
          return x;
        },
        defaultNow = Rx.helpers.defaultNow = Date.now,
        defaultComparer = Rx.helpers.defaultComparer = function(x, y) {
          return isEqual(x, y);
        },
        defaultSubComparer = Rx.helpers.defaultSubComparer = function(x, y) {
          return x > y ? 1 : (x < y ? -1 : 0);
        },
        defaultKeySerializer = Rx.helpers.defaultKeySerializer = function(x) {
          return x.toString();
        },
        defaultError = Rx.helpers.defaultError = function(err) {
          throw err;
        },
        isPromise = Rx.helpers.isPromise = function(p) {
          return !!p && typeof p.subscribe !== 'function' && typeof p.then === 'function';
        },
        isFunction = Rx.helpers.isFunction = (function() {
          var isFn = function(value) {
            return typeof value == 'function' || false;
          };
          if (isFn(/x/)) {
            isFn = function(value) {
              return typeof value == 'function' && toString.call(value) == '[object Function]';
            };
          }
          return isFn;
        }());
    function cloneArray(arr) {
      for (var a = [],
          i = 0,
          len = arr.length; i < len; i++) {
        a.push(arr[i]);
      }
      return a;
    }
    var errorObj = {e: {}};
    function tryCatcherGen(tryCatchTarget) {
      return function tryCatcher() {
        try {
          return tryCatchTarget.apply(this, arguments);
        } catch (e) {
          errorObj.e = e;
          return errorObj;
        }
      };
    }
    var tryCatch = Rx.internals.tryCatch = function tryCatch(fn) {
      if (!isFunction(fn)) {
        throw new TypeError('fn must be a function');
      }
      return tryCatcherGen(fn);
    };
    function thrower(e) {
      throw e;
    }
    Rx.config.longStackSupport = false;
    var hasStacks = false,
        stacks = tryCatch(function() {
          throw new Error();
        })();
    hasStacks = !!stacks.e && !!stacks.e.stack;
    var rStartingLine = captureLine(),
        rFileName;
    var STACK_JUMP_SEPARATOR = 'From previous event:';
    function makeStackTraceLong(error, observable) {
      if (hasStacks && observable.stack && typeof error === 'object' && error !== null && error.stack && error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1) {
        var stacks = [];
        for (var o = observable; !!o; o = o.source) {
          if (o.stack) {
            stacks.unshift(o.stack);
          }
        }
        stacks.unshift(error.stack);
        var concatedStacks = stacks.join('\n' + STACK_JUMP_SEPARATOR + '\n');
        error.stack = filterStackString(concatedStacks);
      }
    }
    function filterStackString(stackString) {
      var lines = stackString.split('\n'),
          desiredLines = [];
      for (var i = 0,
          len = lines.length; i < len; i++) {
        var line = lines[i];
        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
          desiredLines.push(line);
        }
      }
      return desiredLines.join('\n');
    }
    function isInternalFrame(stackLine) {
      var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
      if (!fileNameAndLineNumber) {
        return false;
      }
      var fileName = fileNameAndLineNumber[0],
          lineNumber = fileNameAndLineNumber[1];
      return fileName === rFileName && lineNumber >= rStartingLine && lineNumber <= rEndingLine;
    }
    function isNodeFrame(stackLine) {
      return stackLine.indexOf('(module.js:') !== -1 || stackLine.indexOf('(node.js:') !== -1;
    }
    function captureLine() {
      if (!hasStacks) {
        return;
      }
      try {
        throw new Error();
      } catch (e) {
        var lines = e.stack.split('\n');
        var firstLine = lines[0].indexOf('@') > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
          return;
        }
        rFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
      }
    }
    function getFileNameAndLineNumber(stackLine) {
      var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
      if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
      }
      var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
      if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
      }
      var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
      if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
      }
    }
    var EmptyError = Rx.EmptyError = function() {
      this.message = 'Sequence contains no elements.';
      this.name = 'EmptyError';
      Error.call(this);
    };
    EmptyError.prototype = Object.create(Error.prototype);
    var ObjectDisposedError = Rx.ObjectDisposedError = function() {
      this.message = 'Object has been disposed';
      this.name = 'ObjectDisposedError';
      Error.call(this);
    };
    ObjectDisposedError.prototype = Object.create(Error.prototype);
    var ArgumentOutOfRangeError = Rx.ArgumentOutOfRangeError = function() {
      this.message = 'Argument out of range';
      this.name = 'ArgumentOutOfRangeError';
      Error.call(this);
    };
    ArgumentOutOfRangeError.prototype = Object.create(Error.prototype);
    var NotSupportedError = Rx.NotSupportedError = function(message) {
      this.message = message || 'This operation is not supported';
      this.name = 'NotSupportedError';
      Error.call(this);
    };
    NotSupportedError.prototype = Object.create(Error.prototype);
    var NotImplementedError = Rx.NotImplementedError = function(message) {
      this.message = message || 'This operation is not implemented';
      this.name = 'NotImplementedError';
      Error.call(this);
    };
    NotImplementedError.prototype = Object.create(Error.prototype);
    var notImplemented = Rx.helpers.notImplemented = function() {
      throw new NotImplementedError();
    };
    var notSupported = Rx.helpers.notSupported = function() {
      throw new NotSupportedError();
    };
    var $iterator$ = (typeof Symbol === 'function' && Symbol.iterator) || '_es6shim_iterator_';
    if (root.Set && typeof new root.Set()['@@iterator'] === 'function') {
      $iterator$ = '@@iterator';
    }
    var doneEnumerator = Rx.doneEnumerator = {
      done: true,
      value: undefined
    };
    var isIterable = Rx.helpers.isIterable = function(o) {
      return o[$iterator$] !== undefined;
    };
    var isArrayLike = Rx.helpers.isArrayLike = function(o) {
      return o && o.length !== undefined;
    };
    Rx.helpers.iterator = $iterator$;
    var bindCallback = Rx.internals.bindCallback = function(func, thisArg, argCount) {
      if (typeof thisArg === 'undefined') {
        return func;
      }
      switch (argCount) {
        case 0:
          return function() {
            return func.call(thisArg);
          };
        case 1:
          return function(arg) {
            return func.call(thisArg, arg);
          };
        case 2:
          return function(value, index) {
            return func.call(thisArg, value, index);
          };
        case 3:
          return function(value, index, collection) {
            return func.call(thisArg, value, index, collection);
          };
      }
      return function() {
        return func.apply(thisArg, arguments);
      };
    };
    var dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'],
        dontEnumsLength = dontEnums.length;
    var argsClass = '[object Arguments]',
        arrayClass = '[object Array]',
        boolClass = '[object Boolean]',
        dateClass = '[object Date]',
        errorClass = '[object Error]',
        funcClass = '[object Function]',
        numberClass = '[object Number]',
        objectClass = '[object Object]',
        regexpClass = '[object RegExp]',
        stringClass = '[object String]';
    var toString = Object.prototype.toString,
        hasOwnProperty = Object.prototype.hasOwnProperty,
        supportsArgsClass = toString.call(arguments) == argsClass,
        supportNodeClass,
        errorProto = Error.prototype,
        objectProto = Object.prototype,
        stringProto = String.prototype,
        propertyIsEnumerable = objectProto.propertyIsEnumerable;
    try {
      supportNodeClass = !(toString.call(document) == objectClass && !({'toString': 0} + ''));
    } catch (e) {
      supportNodeClass = true;
    }
    var nonEnumProps = {};
    nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = {
      'constructor': true,
      'toLocaleString': true,
      'toString': true,
      'valueOf': true
    };
    nonEnumProps[boolClass] = nonEnumProps[stringClass] = {
      'constructor': true,
      'toString': true,
      'valueOf': true
    };
    nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = {
      'constructor': true,
      'toString': true
    };
    nonEnumProps[objectClass] = {'constructor': true};
    var support = {};
    (function() {
      var ctor = function() {
        this.x = 1;
      },
          props = [];
      ctor.prototype = {
        'valueOf': 1,
        'y': 1
      };
      for (var key in new ctor) {
        props.push(key);
      }
      for (key in arguments) {}
      support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');
      support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');
      support.nonEnumArgs = key != 0;
      support.nonEnumShadows = !/valueOf/.test(props);
    }(1));
    var isObject = Rx.internals.isObject = function(value) {
      var type = typeof value;
      return value && (type == 'function' || type == 'object') || false;
    };
    function keysIn(object) {
      var result = [];
      if (!isObject(object)) {
        return result;
      }
      if (support.nonEnumArgs && object.length && isArguments(object)) {
        object = slice.call(object);
      }
      var skipProto = support.enumPrototypes && typeof object == 'function',
          skipErrorProps = support.enumErrorProps && (object === errorProto || object instanceof Error);
      for (var key in object) {
        if (!(skipProto && key == 'prototype') && !(skipErrorProps && (key == 'message' || key == 'name'))) {
          result.push(key);
        }
      }
      if (support.nonEnumShadows && object !== objectProto) {
        var ctor = object.constructor,
            index = -1,
            length = dontEnumsLength;
        if (object === (ctor && ctor.prototype)) {
          var className = object === stringProto ? stringClass : object === errorProto ? errorClass : toString.call(object),
              nonEnum = nonEnumProps[className];
        }
        while (++index < length) {
          key = dontEnums[index];
          if (!(nonEnum && nonEnum[key]) && hasOwnProperty.call(object, key)) {
            result.push(key);
          }
        }
      }
      return result;
    }
    function internalFor(object, callback, keysFunc) {
      var index = -1,
          props = keysFunc(object),
          length = props.length;
      while (++index < length) {
        var key = props[index];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }
    function internalForIn(object, callback) {
      return internalFor(object, callback, keysIn);
    }
    function isNode(value) {
      return typeof value.toString != 'function' && typeof(value + '') == 'string';
    }
    var isArguments = function(value) {
      return (value && typeof value == 'object') ? toString.call(value) == argsClass : false;
    };
    if (!supportsArgsClass) {
      isArguments = function(value) {
        return (value && typeof value == 'object') ? hasOwnProperty.call(value, 'callee') : false;
      };
    }
    var isEqual = Rx.internals.isEqual = function(x, y) {
      return deepEquals(x, y, [], []);
    };
    function deepEquals(a, b, stackA, stackB) {
      if (a === b) {
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;
      if (a === a && (a == null || b == null || (type != 'function' && type != 'object' && otherType != 'function' && otherType != 'object'))) {
        return false;
      }
      var className = toString.call(a),
          otherClass = toString.call(b);
      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          return +a == +b;
        case numberClass:
          return (a != +a) ? b != +b : (a == 0 ? (1 / a == 1 / b) : a == +b);
        case regexpClass:
        case stringClass:
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        if (className != objectClass || (!support.nodeClass && (isNode(a) || isNode(b)))) {
          return false;
        }
        var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor,
            ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;
        if (ctorA != ctorB && !(hasOwnProperty.call(a, 'constructor') && hasOwnProperty.call(b, 'constructor')) && !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) && ('constructor' in a && 'constructor' in b)) {
          return false;
        }
      }
      var initedStack = !stackA;
      stackA || (stackA = []);
      stackB || (stackB = []);
      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      var result = true;
      stackA.push(a);
      stackB.push(b);
      if (isArr) {
        length = a.length;
        size = b.length;
        result = size == length;
        if (result) {
          while (size--) {
            var index = length,
                value = b[size];
            if (!(result = deepEquals(a[size], value, stackA, stackB))) {
              break;
            }
          }
        }
      } else {
        internalForIn(b, function(value, key, b) {
          if (hasOwnProperty.call(b, key)) {
            size++;
            return (result = hasOwnProperty.call(a, key) && deepEquals(a[key], value, stackA, stackB));
          }
        });
        if (result) {
          internalForIn(a, function(value, key, a) {
            if (hasOwnProperty.call(a, key)) {
              return (result = --size > -1);
            }
          });
        }
      }
      stackA.pop();
      stackB.pop();
      return result;
    }
    var hasProp = {}.hasOwnProperty,
        slice = Array.prototype.slice;
    var inherits = Rx.internals.inherits = function(child, parent) {
      function __() {
        this.constructor = child;
      }
      __.prototype = parent.prototype;
      child.prototype = new __();
    };
    var addProperties = Rx.internals.addProperties = function(obj) {
      for (var sources = [],
          i = 1,
          len = arguments.length; i < len; i++) {
        sources.push(arguments[i]);
      }
      for (var idx = 0,
          ln = sources.length; idx < ln; idx++) {
        var source = sources[idx];
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    };
    var addRef = Rx.internals.addRef = function(xs, r) {
      return new AnonymousObservable(function(observer) {
        return new BinaryDisposable(r.getDisposable(), xs.subscribe(observer));
      });
    };
    function arrayInitialize(count, factory) {
      var a = new Array(count);
      for (var i = 0; i < count; i++) {
        a[i] = factory();
      }
      return a;
    }
    var CompositeDisposable = Rx.CompositeDisposable = function() {
      var args = [],
          i,
          len;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
        len = args.length;
      } else {
        len = arguments.length;
        args = new Array(len);
        for (i = 0; i < len; i++) {
          args[i] = arguments[i];
        }
      }
      this.disposables = args;
      this.isDisposed = false;
      this.length = args.length;
    };
    var CompositeDisposablePrototype = CompositeDisposable.prototype;
    CompositeDisposablePrototype.add = function(item) {
      if (this.isDisposed) {
        item.dispose();
      } else {
        this.disposables.push(item);
        this.length++;
      }
    };
    CompositeDisposablePrototype.remove = function(item) {
      var shouldDispose = false;
      if (!this.isDisposed) {
        var idx = this.disposables.indexOf(item);
        if (idx !== -1) {
          shouldDispose = true;
          this.disposables.splice(idx, 1);
          this.length--;
          item.dispose();
        }
      }
      return shouldDispose;
    };
    CompositeDisposablePrototype.dispose = function() {
      if (!this.isDisposed) {
        this.isDisposed = true;
        var len = this.disposables.length,
            currentDisposables = new Array(len);
        for (var i = 0; i < len; i++) {
          currentDisposables[i] = this.disposables[i];
        }
        this.disposables = [];
        this.length = 0;
        for (i = 0; i < len; i++) {
          currentDisposables[i].dispose();
        }
      }
    };
    var Disposable = Rx.Disposable = function(action) {
      this.isDisposed = false;
      this.action = action || noop;
    };
    Disposable.prototype.dispose = function() {
      if (!this.isDisposed) {
        this.action();
        this.isDisposed = true;
      }
    };
    var disposableCreate = Disposable.create = function(action) {
      return new Disposable(action);
    };
    var disposableEmpty = Disposable.empty = {dispose: noop};
    var isDisposable = Disposable.isDisposable = function(d) {
      return d && isFunction(d.dispose);
    };
    var checkDisposed = Disposable.checkDisposed = function(disposable) {
      if (disposable.isDisposed) {
        throw new ObjectDisposedError();
      }
    };
    var disposableFixup = Disposable._fixup = function(result) {
      return isDisposable(result) ? result : disposableEmpty;
    };
    var SingleAssignmentDisposable = Rx.SingleAssignmentDisposable = function() {
      this.isDisposed = false;
      this.current = null;
    };
    SingleAssignmentDisposable.prototype.getDisposable = function() {
      return this.current;
    };
    SingleAssignmentDisposable.prototype.setDisposable = function(value) {
      if (this.current) {
        throw new Error('Disposable has already been assigned');
      }
      var shouldDispose = this.isDisposed;
      !shouldDispose && (this.current = value);
      shouldDispose && value && value.dispose();
    };
    SingleAssignmentDisposable.prototype.dispose = function() {
      if (!this.isDisposed) {
        this.isDisposed = true;
        var old = this.current;
        this.current = null;
        old && old.dispose();
      }
    };
    var SerialDisposable = Rx.SerialDisposable = function() {
      this.isDisposed = false;
      this.current = null;
    };
    SerialDisposable.prototype.getDisposable = function() {
      return this.current;
    };
    SerialDisposable.prototype.setDisposable = function(value) {
      var shouldDispose = this.isDisposed;
      if (!shouldDispose) {
        var old = this.current;
        this.current = value;
      }
      old && old.dispose();
      shouldDispose && value && value.dispose();
    };
    SerialDisposable.prototype.dispose = function() {
      if (!this.isDisposed) {
        this.isDisposed = true;
        var old = this.current;
        this.current = null;
      }
      old && old.dispose();
    };
    var BinaryDisposable = Rx.BinaryDisposable = function(first, second) {
      this._first = first;
      this._second = second;
      this.isDisposed = false;
    };
    BinaryDisposable.prototype.dispose = function() {
      if (!this.isDisposed) {
        this.isDisposed = true;
        var old1 = this._first;
        this._first = null;
        old1 && old1.dispose();
        var old2 = this._second;
        this._second = null;
        old2 && old2.dispose();
      }
    };
    var NAryDisposable = Rx.NAryDisposable = function(disposables) {
      this._disposables = disposables;
      this.isDisposed = false;
    };
    NAryDisposable.prototype.dispose = function() {
      if (!this.isDisposed) {
        this.isDisposed = true;
        for (var i = 0,
            len = this._disposables.length; i < len; i++) {
          this._disposables[i].dispose();
        }
        this._disposables.length = 0;
      }
    };
    var RefCountDisposable = Rx.RefCountDisposable = (function() {
      function InnerDisposable(disposable) {
        this.disposable = disposable;
        this.disposable.count++;
        this.isInnerDisposed = false;
      }
      InnerDisposable.prototype.dispose = function() {
        if (!this.disposable.isDisposed && !this.isInnerDisposed) {
          this.isInnerDisposed = true;
          this.disposable.count--;
          if (this.disposable.count === 0 && this.disposable.isPrimaryDisposed) {
            this.disposable.isDisposed = true;
            this.disposable.underlyingDisposable.dispose();
          }
        }
      };
      function RefCountDisposable(disposable) {
        this.underlyingDisposable = disposable;
        this.isDisposed = false;
        this.isPrimaryDisposed = false;
        this.count = 0;
      }
      RefCountDisposable.prototype.dispose = function() {
        if (!this.isDisposed && !this.isPrimaryDisposed) {
          this.isPrimaryDisposed = true;
          if (this.count === 0) {
            this.isDisposed = true;
            this.underlyingDisposable.dispose();
          }
        }
      };
      RefCountDisposable.prototype.getDisposable = function() {
        return this.isDisposed ? disposableEmpty : new InnerDisposable(this);
      };
      return RefCountDisposable;
    })();
    function ScheduledDisposable(scheduler, disposable) {
      this.scheduler = scheduler;
      this.disposable = disposable;
      this.isDisposed = false;
    }
    function scheduleItem(s, self) {
      if (!self.isDisposed) {
        self.isDisposed = true;
        self.disposable.dispose();
      }
    }
    ScheduledDisposable.prototype.dispose = function() {
      this.scheduler.schedule(this, scheduleItem);
    };
    var ScheduledItem = Rx.internals.ScheduledItem = function(scheduler, state, action, dueTime, comparer) {
      this.scheduler = scheduler;
      this.state = state;
      this.action = action;
      this.dueTime = dueTime;
      this.comparer = comparer || defaultSubComparer;
      this.disposable = new SingleAssignmentDisposable();
    };
    ScheduledItem.prototype.invoke = function() {
      this.disposable.setDisposable(this.invokeCore());
    };
    ScheduledItem.prototype.compareTo = function(other) {
      return this.comparer(this.dueTime, other.dueTime);
    };
    ScheduledItem.prototype.isCancelled = function() {
      return this.disposable.isDisposed;
    };
    ScheduledItem.prototype.invokeCore = function() {
      return disposableFixup(this.action(this.scheduler, this.state));
    };
    var Scheduler = Rx.Scheduler = (function() {
      function Scheduler() {}
      Scheduler.isScheduler = function(s) {
        return s instanceof Scheduler;
      };
      var schedulerProto = Scheduler.prototype;
      schedulerProto.schedule = function(state, action) {
        throw new NotImplementedError();
      };
      schedulerProto.scheduleFuture = function(state, dueTime, action) {
        var dt = dueTime;
        dt instanceof Date && (dt = dt - this.now());
        dt = Scheduler.normalize(dt);
        if (dt === 0) {
          return this.schedule(state, action);
        }
        return this._scheduleFuture(state, dt, action);
      };
      schedulerProto._scheduleFuture = function(state, dueTime, action) {
        throw new NotImplementedError();
      };
      Scheduler.now = defaultNow;
      Scheduler.prototype.now = defaultNow;
      Scheduler.normalize = function(timeSpan) {
        timeSpan < 0 && (timeSpan = 0);
        return timeSpan;
      };
      return Scheduler;
    }());
    var normalizeTime = Scheduler.normalize,
        isScheduler = Scheduler.isScheduler;
    (function(schedulerProto) {
      function invokeRecImmediate(scheduler, pair) {
        var state = pair[0],
            action = pair[1],
            group = new CompositeDisposable();
        action(state, innerAction);
        return group;
        function innerAction(state2) {
          var isAdded = false,
              isDone = false;
          var d = scheduler.schedule(state2, scheduleWork);
          if (!isDone) {
            group.add(d);
            isAdded = true;
          }
          function scheduleWork(_, state3) {
            if (isAdded) {
              group.remove(d);
            } else {
              isDone = true;
            }
            action(state3, innerAction);
            return disposableEmpty;
          }
        }
      }
      function invokeRecDate(scheduler, pair) {
        var state = pair[0],
            action = pair[1],
            group = new CompositeDisposable();
        action(state, innerAction);
        return group;
        function innerAction(state2, dueTime1) {
          var isAdded = false,
              isDone = false;
          var d = scheduler.scheduleFuture(state2, dueTime1, scheduleWork);
          if (!isDone) {
            group.add(d);
            isAdded = true;
          }
          function scheduleWork(_, state3) {
            if (isAdded) {
              group.remove(d);
            } else {
              isDone = true;
            }
            action(state3, innerAction);
            return disposableEmpty;
          }
        }
      }
      schedulerProto.scheduleRecursive = function(state, action) {
        return this.schedule([state, action], invokeRecImmediate);
      };
      schedulerProto.scheduleRecursiveFuture = function(state, dueTime, action) {
        return this.scheduleFuture([state, action], dueTime, invokeRecDate);
      };
    }(Scheduler.prototype));
    (function(schedulerProto) {
      Scheduler.prototype.schedulePeriodic = function(state, period, action) {
        if (typeof root.setInterval === 'undefined') {
          throw new NotSupportedError();
        }
        period = normalizeTime(period);
        var s = state,
            id = root.setInterval(function() {
              s = action(s);
            }, period);
        return disposableCreate(function() {
          root.clearInterval(id);
        });
      };
    }(Scheduler.prototype));
    (function(schedulerProto) {
      schedulerProto.catchError = schedulerProto['catch'] = function(handler) {
        return new CatchScheduler(this, handler);
      };
    }(Scheduler.prototype));
    var SchedulePeriodicRecursive = Rx.internals.SchedulePeriodicRecursive = (function() {
      function tick(command, recurse) {
        recurse(0, this._period);
        try {
          this._state = this._action(this._state);
        } catch (e) {
          this._cancel.dispose();
          throw e;
        }
      }
      function SchedulePeriodicRecursive(scheduler, state, period, action) {
        this._scheduler = scheduler;
        this._state = state;
        this._period = period;
        this._action = action;
      }
      SchedulePeriodicRecursive.prototype.start = function() {
        var d = new SingleAssignmentDisposable();
        this._cancel = d;
        d.setDisposable(this._scheduler.scheduleRecursiveFuture(0, this._period, tick.bind(this)));
        return d;
      };
      return SchedulePeriodicRecursive;
    }());
    var ImmediateScheduler = (function(__super__) {
      inherits(ImmediateScheduler, __super__);
      function ImmediateScheduler() {
        __super__.call(this);
      }
      ImmediateScheduler.prototype.schedule = function(state, action) {
        return disposableFixup(action(this, state));
      };
      return ImmediateScheduler;
    }(Scheduler));
    var immediateScheduler = Scheduler.immediate = new ImmediateScheduler();
    var CurrentThreadScheduler = (function(__super__) {
      var queue;
      function runTrampoline() {
        while (queue.length > 0) {
          var item = queue.dequeue();
          !item.isCancelled() && item.invoke();
        }
      }
      inherits(CurrentThreadScheduler, __super__);
      function CurrentThreadScheduler() {
        __super__.call(this);
      }
      CurrentThreadScheduler.prototype.schedule = function(state, action) {
        var si = new ScheduledItem(this, state, action, this.now());
        if (!queue) {
          queue = new PriorityQueue(4);
          queue.enqueue(si);
          var result = tryCatch(runTrampoline)();
          queue = null;
          if (result === errorObj) {
            thrower(result.e);
          }
        } else {
          queue.enqueue(si);
        }
        return si.disposable;
      };
      CurrentThreadScheduler.prototype.scheduleRequired = function() {
        return !queue;
      };
      return CurrentThreadScheduler;
    }(Scheduler));
    var currentThreadScheduler = Scheduler.currentThread = new CurrentThreadScheduler();
    var scheduleMethod,
        clearMethod;
    var localTimer = (function() {
      var localSetTimeout,
          localClearTimeout = noop;
      if (!!root.setTimeout) {
        localSetTimeout = root.setTimeout;
        localClearTimeout = root.clearTimeout;
      } else if (!!root.WScript) {
        localSetTimeout = function(fn, time) {
          root.WScript.Sleep(time);
          fn();
        };
      } else {
        throw new NotSupportedError();
      }
      return {
        setTimeout: localSetTimeout,
        clearTimeout: localClearTimeout
      };
    }());
    var localSetTimeout = localTimer.setTimeout,
        localClearTimeout = localTimer.clearTimeout;
    (function() {
      var nextHandle = 1,
          tasksByHandle = {},
          currentlyRunning = false;
      clearMethod = function(handle) {
        delete tasksByHandle[handle];
      };
      function runTask(handle) {
        if (currentlyRunning) {
          localSetTimeout(function() {
            runTask(handle);
          }, 0);
        } else {
          var task = tasksByHandle[handle];
          if (task) {
            currentlyRunning = true;
            var result = tryCatch(task)();
            clearMethod(handle);
            currentlyRunning = false;
            if (result === errorObj) {
              thrower(result.e);
            }
          }
        }
      }
      var reNative = new RegExp('^' + String(toString).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/toString| for [^\]]+/g, '.*?') + '$');
      var setImmediate = typeof(setImmediate = freeGlobal && moduleExports && freeGlobal.setImmediate) == 'function' && !reNative.test(setImmediate) && setImmediate;
      function postMessageSupported() {
        if (!root.postMessage || root.importScripts) {
          return false;
        }
        var isAsync = false,
            oldHandler = root.onmessage;
        root.onmessage = function() {
          isAsync = true;
        };
        root.postMessage('', '*');
        root.onmessage = oldHandler;
        return isAsync;
      }
      if (isFunction(setImmediate)) {
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          setImmediate(function() {
            runTask(id);
          });
          return id;
        };
      } else if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          process.nextTick(function() {
            runTask(id);
          });
          return id;
        };
      } else if (postMessageSupported()) {
        var MSG_PREFIX = 'ms.rx.schedule' + Math.random();
        function onGlobalPostMessage(event) {
          if (typeof event.data === 'string' && event.data.substring(0, MSG_PREFIX.length) === MSG_PREFIX) {
            runTask(event.data.substring(MSG_PREFIX.length));
          }
        }
        if (root.addEventListener) {
          root.addEventListener('message', onGlobalPostMessage, false);
        } else if (root.attachEvent) {
          root.attachEvent('onmessage', onGlobalPostMessage);
        } else {
          root.onmessage = onGlobalPostMessage;
        }
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          root.postMessage(MSG_PREFIX + currentId, '*');
          return id;
        };
      } else if (!!root.MessageChannel) {
        var channel = new root.MessageChannel();
        channel.port1.onmessage = function(e) {
          runTask(e.data);
        };
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          channel.port2.postMessage(id);
          return id;
        };
      } else if ('document' in root && 'onreadystatechange' in root.document.createElement('script')) {
        scheduleMethod = function(action) {
          var scriptElement = root.document.createElement('script');
          var id = nextHandle++;
          tasksByHandle[id] = action;
          scriptElement.onreadystatechange = function() {
            runTask(id);
            scriptElement.onreadystatechange = null;
            scriptElement.parentNode.removeChild(scriptElement);
            scriptElement = null;
          };
          root.document.documentElement.appendChild(scriptElement);
          return id;
        };
      } else {
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          localSetTimeout(function() {
            runTask(id);
          }, 0);
          return id;
        };
      }
    }());
    var DefaultScheduler = (function(__super__) {
      inherits(DefaultScheduler, __super__);
      function DefaultScheduler() {
        __super__.call(this);
      }
      function DefaultSchedulerDisposable(id) {
        this._id = id;
        this.isDisposed = false;
      }
      DefaultSchedulerDisposable.prototype.dispose = function() {
        if (!this.isDisposed) {
          this.isDisposed = true;
          localClearTimeout(this._id);
        }
      };
      DefaultScheduler.prototype.schedule = function(state, action) {
        var scheduler = this,
            disposable = new SingleAssignmentDisposable();
        var id = scheduleMethod(function() {
          !disposable.isDisposed && disposable.setDisposable(disposableFixup(action(scheduler, state)));
        });
        return new BinaryDisposable(disposable, new DefaultSchedulerDisposable(id));
      };
      DefaultScheduler.prototype._scheduleFuture = function(state, dueTime, action) {
        var scheduler = this,
            dt = Scheduler.normalize(dueTime),
            disposable = new SingleAssignmentDisposable();
        if (dt === 0) {
          return scheduler.schedule(state, action);
        }
        var id = localSetTimeout(function() {
          !disposable.isDisposed && disposable.setDisposable(disposableFixup(action(scheduler, state)));
        }, dt);
        return new BinaryDisposable(disposable, new DefaultSchedulerDisposable(id));
      };
      return DefaultScheduler;
    }(Scheduler));
    var defaultScheduler = Scheduler['default'] = Scheduler.async = new DefaultScheduler();
    var CatchScheduler = (function(__super__) {
      inherits(CatchScheduler, __super__);
      function CatchScheduler(scheduler, handler) {
        this._scheduler = scheduler;
        this._handler = handler;
        this._recursiveOriginal = null;
        this._recursiveWrapper = null;
        __super__.call(this);
      }
      CatchScheduler.prototype.schedule = function(state, action) {
        return this._scheduler.schedule(state, this._wrap(action));
      };
      CatchScheduler.prototype._scheduleFuture = function(state, dueTime, action) {
        return this._scheduler.schedule(state, dueTime, this._wrap(action));
      };
      CatchScheduler.prototype.now = function() {
        return this._scheduler.now();
      };
      CatchScheduler.prototype._clone = function(scheduler) {
        return new CatchScheduler(scheduler, this._handler);
      };
      CatchScheduler.prototype._wrap = function(action) {
        var parent = this;
        return function(self, state) {
          var res = tryCatch(action)(parent._getRecursiveWrapper(self), state);
          if (res === errorObj) {
            if (!parent._handler(res.e)) {
              thrower(res.e);
            }
            return disposableEmpty;
          }
          return disposableFixup(ret);
        };
      };
      CatchScheduler.prototype._getRecursiveWrapper = function(scheduler) {
        if (this._recursiveOriginal !== scheduler) {
          this._recursiveOriginal = scheduler;
          var wrapper = this._clone(scheduler);
          wrapper._recursiveOriginal = scheduler;
          wrapper._recursiveWrapper = wrapper;
          this._recursiveWrapper = wrapper;
        }
        return this._recursiveWrapper;
      };
      CatchScheduler.prototype.schedulePeriodic = function(state, period, action) {
        var self = this,
            failed = false,
            d = new SingleAssignmentDisposable();
        d.setDisposable(this._scheduler.schedulePeriodic(state, period, function(state1) {
          if (failed) {
            return null;
          }
          var res = tryCatch(action)(state1);
          if (res === errorObj) {
            failed = true;
            if (!self._handler(res.e)) {
              thrower(res.e);
            }
            d.dispose();
            return null;
          }
          return ret;
        }));
        return d;
      };
      return CatchScheduler;
    }(Scheduler));
    function IndexedItem(id, value) {
      this.id = id;
      this.value = value;
    }
    IndexedItem.prototype.compareTo = function(other) {
      var c = this.value.compareTo(other.value);
      c === 0 && (c = this.id - other.id);
      return c;
    };
    var PriorityQueue = Rx.internals.PriorityQueue = function(capacity) {
      this.items = new Array(capacity);
      this.length = 0;
    };
    var priorityProto = PriorityQueue.prototype;
    priorityProto.isHigherPriority = function(left, right) {
      return this.items[left].compareTo(this.items[right]) < 0;
    };
    priorityProto.percolate = function(index) {
      if (index >= this.length || index < 0) {
        return;
      }
      var parent = index - 1 >> 1;
      if (parent < 0 || parent === index) {
        return;
      }
      if (this.isHigherPriority(index, parent)) {
        var temp = this.items[index];
        this.items[index] = this.items[parent];
        this.items[parent] = temp;
        this.percolate(parent);
      }
    };
    priorityProto.heapify = function(index) {
      +index || (index = 0);
      if (index >= this.length || index < 0) {
        return;
      }
      var left = 2 * index + 1,
          right = 2 * index + 2,
          first = index;
      if (left < this.length && this.isHigherPriority(left, first)) {
        first = left;
      }
      if (right < this.length && this.isHigherPriority(right, first)) {
        first = right;
      }
      if (first !== index) {
        var temp = this.items[index];
        this.items[index] = this.items[first];
        this.items[first] = temp;
        this.heapify(first);
      }
    };
    priorityProto.peek = function() {
      return this.items[0].value;
    };
    priorityProto.removeAt = function(index) {
      this.items[index] = this.items[--this.length];
      this.items[this.length] = undefined;
      this.heapify();
    };
    priorityProto.dequeue = function() {
      var result = this.peek();
      this.removeAt(0);
      return result;
    };
    priorityProto.enqueue = function(item) {
      var index = this.length++;
      this.items[index] = new IndexedItem(PriorityQueue.count++, item);
      this.percolate(index);
    };
    priorityProto.remove = function(item) {
      for (var i = 0; i < this.length; i++) {
        if (this.items[i].value === item) {
          this.removeAt(i);
          return true;
        }
      }
      return false;
    };
    PriorityQueue.count = 0;
    var Notification = Rx.Notification = (function() {
      function Notification() {}
      Notification.prototype._accept = function(onNext, onError, onCompleted) {
        throw new NotImplementedError();
      };
      Notification.prototype._acceptObservable = function(onNext, onError, onCompleted) {
        throw new NotImplementedError();
      };
      Notification.prototype.accept = function(observerOrOnNext, onError, onCompleted) {
        return observerOrOnNext && typeof observerOrOnNext === 'object' ? this._acceptObservable(observerOrOnNext) : this._accept(observerOrOnNext, onError, onCompleted);
      };
      Notification.prototype.toObservable = function(scheduler) {
        var self = this;
        isScheduler(scheduler) || (scheduler = immediateScheduler);
        return new AnonymousObservable(function(o) {
          return scheduler.schedule(self, function(_, notification) {
            notification._acceptObservable(o);
            notification.kind === 'N' && o.onCompleted();
          });
        });
      };
      return Notification;
    })();
    var OnNextNotification = (function(__super__) {
      inherits(OnNextNotification, __super__);
      function OnNextNotification(value) {
        this.value = value;
        this.kind = 'N';
      }
      OnNextNotification.prototype._accept = function(onNext) {
        return onNext(this.value);
      };
      OnNextNotification.prototype._acceptObservable = function(o) {
        return o.onNext(this.value);
      };
      OnNextNotification.prototype.toString = function() {
        return 'OnNext(' + this.value + ')';
      };
      return OnNextNotification;
    }(Notification));
    var OnErrorNotification = (function(__super__) {
      inherits(OnErrorNotification, __super__);
      function OnErrorNotification(error) {
        this.error = error;
        this.kind = 'E';
      }
      OnErrorNotification.prototype._accept = function(onNext, onError) {
        return onError(this.error);
      };
      OnErrorNotification.prototype._acceptObservable = function(o) {
        return o.onError(this.error);
      };
      OnErrorNotification.prototype.toString = function() {
        return 'OnError(' + this.error + ')';
      };
      return OnErrorNotification;
    }(Notification));
    var OnCompletedNotification = (function(__super__) {
      inherits(OnCompletedNotification, __super__);
      function OnCompletedNotification() {
        this.kind = 'C';
      }
      OnCompletedNotification.prototype._accept = function(onNext, onError, onCompleted) {
        return onCompleted();
      };
      OnCompletedNotification.prototype._acceptObservable = function(o) {
        return o.onCompleted();
      };
      OnCompletedNotification.prototype.toString = function() {
        return 'OnCompleted()';
      };
      return OnCompletedNotification;
    }(Notification));
    var notificationCreateOnNext = Notification.createOnNext = function(value) {
      return new OnNextNotification(value);
    };
    var notificationCreateOnError = Notification.createOnError = function(error) {
      return new OnErrorNotification(error);
    };
    var notificationCreateOnCompleted = Notification.createOnCompleted = function() {
      return new OnCompletedNotification();
    };
    var Observer = Rx.Observer = function() {};
    Observer.prototype.toNotifier = function() {
      var observer = this;
      return function(n) {
        return n.accept(observer);
      };
    };
    Observer.prototype.asObserver = function() {
      var self = this;
      return new AnonymousObserver(function(x) {
        self.onNext(x);
      }, function(err) {
        self.onError(err);
      }, function() {
        self.onCompleted();
      });
    };
    Observer.prototype.checked = function() {
      return new CheckedObserver(this);
    };
    var observerCreate = Observer.create = function(onNext, onError, onCompleted) {
      onNext || (onNext = noop);
      onError || (onError = defaultError);
      onCompleted || (onCompleted = noop);
      return new AnonymousObserver(onNext, onError, onCompleted);
    };
    Observer.fromNotifier = function(handler, thisArg) {
      var cb = bindCallback(handler, thisArg, 1);
      return new AnonymousObserver(function(x) {
        return cb(notificationCreateOnNext(x));
      }, function(e) {
        return cb(notificationCreateOnError(e));
      }, function() {
        return cb(notificationCreateOnCompleted());
      });
    };
    Observer.prototype.notifyOn = function(scheduler) {
      return new ObserveOnObserver(scheduler, this);
    };
    Observer.prototype.makeSafe = function(disposable) {
      return new AnonymousSafeObserver(this._onNext, this._onError, this._onCompleted, disposable);
    };
    var AbstractObserver = Rx.internals.AbstractObserver = (function(__super__) {
      inherits(AbstractObserver, __super__);
      function AbstractObserver() {
        this.isStopped = false;
      }
      AbstractObserver.prototype.next = notImplemented;
      AbstractObserver.prototype.error = notImplemented;
      AbstractObserver.prototype.completed = notImplemented;
      AbstractObserver.prototype.onNext = function(value) {
        !this.isStopped && this.next(value);
      };
      AbstractObserver.prototype.onError = function(error) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.error(error);
        }
      };
      AbstractObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.completed();
        }
      };
      AbstractObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      AbstractObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.error(e);
          return true;
        }
        return false;
      };
      return AbstractObserver;
    }(Observer));
    var AnonymousObserver = Rx.AnonymousObserver = (function(__super__) {
      inherits(AnonymousObserver, __super__);
      function AnonymousObserver(onNext, onError, onCompleted) {
        __super__.call(this);
        this._onNext = onNext;
        this._onError = onError;
        this._onCompleted = onCompleted;
      }
      AnonymousObserver.prototype.next = function(value) {
        this._onNext(value);
      };
      AnonymousObserver.prototype.error = function(error) {
        this._onError(error);
      };
      AnonymousObserver.prototype.completed = function() {
        this._onCompleted();
      };
      return AnonymousObserver;
    }(AbstractObserver));
    var CheckedObserver = (function(__super__) {
      inherits(CheckedObserver, __super__);
      function CheckedObserver(observer) {
        __super__.call(this);
        this._observer = observer;
        this._state = 0;
      }
      var CheckedObserverPrototype = CheckedObserver.prototype;
      CheckedObserverPrototype.onNext = function(value) {
        this.checkAccess();
        var res = tryCatch(this._observer.onNext).call(this._observer, value);
        this._state = 0;
        res === errorObj && thrower(res.e);
      };
      CheckedObserverPrototype.onError = function(err) {
        this.checkAccess();
        var res = tryCatch(this._observer.onError).call(this._observer, err);
        this._state = 2;
        res === errorObj && thrower(res.e);
      };
      CheckedObserverPrototype.onCompleted = function() {
        this.checkAccess();
        var res = tryCatch(this._observer.onCompleted).call(this._observer);
        this._state = 2;
        res === errorObj && thrower(res.e);
      };
      CheckedObserverPrototype.checkAccess = function() {
        if (this._state === 1) {
          throw new Error('Re-entrancy detected');
        }
        if (this._state === 2) {
          throw new Error('Observer completed');
        }
        if (this._state === 0) {
          this._state = 1;
        }
      };
      return CheckedObserver;
    }(Observer));
    var ScheduledObserver = Rx.internals.ScheduledObserver = (function(__super__) {
      inherits(ScheduledObserver, __super__);
      function ScheduledObserver(scheduler, observer) {
        __super__.call(this);
        this.scheduler = scheduler;
        this.observer = observer;
        this.isAcquired = false;
        this.hasFaulted = false;
        this.queue = [];
        this.disposable = new SerialDisposable();
      }
      ScheduledObserver.prototype.next = function(value) {
        var self = this;
        this.queue.push(function() {
          self.observer.onNext(value);
        });
      };
      ScheduledObserver.prototype.error = function(e) {
        var self = this;
        this.queue.push(function() {
          self.observer.onError(e);
        });
      };
      ScheduledObserver.prototype.completed = function() {
        var self = this;
        this.queue.push(function() {
          self.observer.onCompleted();
        });
      };
      ScheduledObserver.prototype.ensureActive = function() {
        var isOwner = false;
        if (!this.hasFaulted && this.queue.length > 0) {
          isOwner = !this.isAcquired;
          this.isAcquired = true;
        }
        if (isOwner) {
          this.disposable.setDisposable(this.scheduler.scheduleRecursive(this, function(parent, self) {
            var work;
            if (parent.queue.length > 0) {
              work = parent.queue.shift();
            } else {
              parent.isAcquired = false;
              return;
            }
            var res = tryCatch(work)();
            if (res === errorObj) {
              parent.queue = [];
              parent.hasFaulted = true;
              return thrower(res.e);
            }
            self(parent);
          }));
        }
      };
      ScheduledObserver.prototype.dispose = function() {
        __super__.prototype.dispose.call(this);
        this.disposable.dispose();
      };
      return ScheduledObserver;
    }(AbstractObserver));
    var ObserveOnObserver = (function(__super__) {
      inherits(ObserveOnObserver, __super__);
      function ObserveOnObserver(scheduler, observer, cancel) {
        __super__.call(this, scheduler, observer);
        this._cancel = cancel;
      }
      ObserveOnObserver.prototype.next = function(value) {
        __super__.prototype.next.call(this, value);
        this.ensureActive();
      };
      ObserveOnObserver.prototype.error = function(e) {
        __super__.prototype.error.call(this, e);
        this.ensureActive();
      };
      ObserveOnObserver.prototype.completed = function() {
        __super__.prototype.completed.call(this);
        this.ensureActive();
      };
      ObserveOnObserver.prototype.dispose = function() {
        __super__.prototype.dispose.call(this);
        this._cancel && this._cancel.dispose();
        this._cancel = null;
      };
      return ObserveOnObserver;
    })(ScheduledObserver);
    var observableProto;
    var Observable = Rx.Observable = (function() {
      function makeSubscribe(self, subscribe) {
        return function(o) {
          var oldOnError = o.onError;
          o.onError = function(e) {
            makeStackTraceLong(e, self);
            oldOnError.call(o, e);
          };
          return subscribe.call(self, o);
        };
      }
      function Observable() {
        if (Rx.config.longStackSupport && hasStacks) {
          var oldSubscribe = this._subscribe;
          var e = tryCatch(thrower)(new Error()).e;
          this.stack = e.stack.substring(e.stack.indexOf('\n') + 1);
          this._subscribe = makeSubscribe(this, oldSubscribe);
        }
      }
      observableProto = Observable.prototype;
      Observable.isObservable = function(o) {
        return o && isFunction(o.subscribe);
      };
      observableProto.subscribe = observableProto.forEach = function(oOrOnNext, onError, onCompleted) {
        return this._subscribe(typeof oOrOnNext === 'object' ? oOrOnNext : observerCreate(oOrOnNext, onError, onCompleted));
      };
      observableProto.subscribeOnNext = function(onNext, thisArg) {
        return this._subscribe(observerCreate(typeof thisArg !== 'undefined' ? function(x) {
          onNext.call(thisArg, x);
        } : onNext));
      };
      observableProto.subscribeOnError = function(onError, thisArg) {
        return this._subscribe(observerCreate(null, typeof thisArg !== 'undefined' ? function(e) {
          onError.call(thisArg, e);
        } : onError));
      };
      observableProto.subscribeOnCompleted = function(onCompleted, thisArg) {
        return this._subscribe(observerCreate(null, null, typeof thisArg !== 'undefined' ? function() {
          onCompleted.call(thisArg);
        } : onCompleted));
      };
      return Observable;
    })();
    var ObservableBase = Rx.ObservableBase = (function(__super__) {
      inherits(ObservableBase, __super__);
      function fixSubscriber(subscriber) {
        return subscriber && isFunction(subscriber.dispose) ? subscriber : isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
      }
      function setDisposable(s, state) {
        var ado = state[0],
            self = state[1];
        var sub = tryCatch(self.subscribeCore).call(self, ado);
        if (sub === errorObj && !ado.fail(errorObj.e)) {
          thrower(errorObj.e);
        }
        ado.setDisposable(fixSubscriber(sub));
      }
      function ObservableBase() {
        __super__.call(this);
      }
      ObservableBase.prototype._subscribe = function(o) {
        var ado = new AutoDetachObserver(o),
            state = [ado, this];
        if (currentThreadScheduler.scheduleRequired()) {
          currentThreadScheduler.schedule(state, setDisposable);
        } else {
          setDisposable(null, state);
        }
        return ado;
      };
      ObservableBase.prototype.subscribeCore = notImplemented;
      return ObservableBase;
    }(Observable));
    var FlatMapObservable = Rx.FlatMapObservable = (function(__super__) {
      inherits(FlatMapObservable, __super__);
      function FlatMapObservable(source, selector, resultSelector, thisArg) {
        this.resultSelector = isFunction(resultSelector) ? resultSelector : null;
        this.selector = bindCallback(isFunction(selector) ? selector : function() {
          return selector;
        }, thisArg, 3);
        this.source = source;
        __super__.call(this);
      }
      FlatMapObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new InnerObserver(o, this.selector, this.resultSelector, this));
      };
      inherits(InnerObserver, AbstractObserver);
      function InnerObserver(observer, selector, resultSelector, source) {
        this.i = 0;
        this.selector = selector;
        this.resultSelector = resultSelector;
        this.source = source;
        this.o = observer;
        AbstractObserver.call(this);
      }
      InnerObserver.prototype._wrapResult = function(result, x, i) {
        return this.resultSelector ? result.map(function(y, i2) {
          return this.resultSelector(x, y, i, i2);
        }, this) : result;
      };
      InnerObserver.prototype.next = function(x) {
        var i = this.i++;
        var result = tryCatch(this.selector)(x, i, this.source);
        if (result === errorObj) {
          return this.o.onError(result.e);
        }
        isPromise(result) && (result = observableFromPromise(result));
        (isArrayLike(result) || isIterable(result)) && (result = Observable.from(result));
        this.o.onNext(this._wrapResult(result, x, i));
      };
      InnerObserver.prototype.error = function(e) {
        this.o.onError(e);
      };
      InnerObserver.prototype.onCompleted = function() {
        this.o.onCompleted();
      };
      return FlatMapObservable;
    }(ObservableBase));
    var Enumerable = Rx.internals.Enumerable = function() {};
    function IsDisposedDisposable(state) {
      this._s = state;
      this.isDisposed = false;
    }
    IsDisposedDisposable.prototype.dispose = function() {
      if (!this.isDisposed) {
        this.isDisposed = true;
        this._s.isDisposed = true;
      }
    };
    var ConcatEnumerableObservable = (function(__super__) {
      inherits(ConcatEnumerableObservable, __super__);
      function ConcatEnumerableObservable(sources) {
        this.sources = sources;
        __super__.call(this);
      }
      ConcatEnumerableObservable.prototype.subscribeCore = function(o) {
        var state = {isDisposed: false},
            subscription = new SerialDisposable();
        var cancelable = currentThreadScheduler.scheduleRecursive(this.sources[$iterator$](), function(e, self) {
          if (state.isDisposed) {
            return;
          }
          var currentItem = tryCatch(e.next).call(e);
          if (currentItem === errorObj) {
            return o.onError(currentItem.e);
          }
          if (currentItem.done) {
            return o.onCompleted();
          }
          var currentValue = currentItem.value;
          isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
          var d = new SingleAssignmentDisposable();
          subscription.setDisposable(d);
          d.setDisposable(currentValue.subscribe(new InnerObserver(o, self, e)));
        });
        return new NAryDisposable([subscription, cancelable, new IsDisposedDisposable(state)]);
      };
      inherits(InnerObserver, AbstractObserver);
      function InnerObserver(o, s, e) {
        this._o = o;
        this._s = s;
        this._e = e;
        AbstractObserver.call(this);
      }
      InnerObserver.prototype.onNext = function(x) {
        this._o.onNext(x);
      };
      InnerObserver.prototype.onError = function(e) {
        this._o.onError(e);
      };
      InnerObserver.prototype.onCompleted = function() {
        this._s(this._e);
      };
      return ConcatEnumerableObservable;
    }(ObservableBase));
    Enumerable.prototype.concat = function() {
      return new ConcatEnumerableObservable(this);
    };
    var CatchErrorObservable = (function(__super__) {
      inherits(CatchErrorObservable, __super__);
      function CatchErrorObservable(sources) {
        this.sources = sources;
        __super__.call(this);
      }
      CatchErrorObservable.prototype.subscribeCore = function(o) {
        var e = this.sources[$iterator$]();
        var state = {isDisposed: false},
            subscription = new SerialDisposable();
        var cancelable = currentThreadScheduler.scheduleRecursive(null, function(lastException, self) {
          if (state.isDisposed) {
            return;
          }
          var currentItem = tryCatch(e.next).call(e);
          if (currentItem === errorObj) {
            return o.onError(currentItem.e);
          }
          if (currentItem.done) {
            return lastException !== null ? o.onError(lastException) : o.onCompleted();
          }
          var currentValue = currentItem.value;
          isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
          var d = new SingleAssignmentDisposable();
          subscription.setDisposable(d);
          d.setDisposable(currentValue.subscribe(new InnerObserver(o, self)));
        });
        return new NAryDisposable([subscription, cancelable, new IsDisposedDisposable(state)]);
      };
      inherits(InnerObserver, AbstractObserver);
      function InnerObserver(o, recurse) {
        this._o = o;
        this._recurse = recurse;
        AbstractObserver.call(this);
      }
      InnerObserver.prototype.next = function(x) {
        this._o.onNext(x);
      };
      InnerObserver.prototype.error = function(e) {
        this._recurse(e);
      };
      InnerObserver.prototype.completed = function() {
        this._o.onCompleted();
      };
      return CatchErrorObservable;
    }(ObservableBase));
    Enumerable.prototype.catchError = function() {
      return new CatchErrorObservable(this);
    };
    Enumerable.prototype.catchErrorWhen = function(notificationHandler) {
      var sources = this;
      return new AnonymousObservable(function(o) {
        var exceptions = new Subject(),
            notifier = new Subject(),
            handled = notificationHandler(exceptions),
            notificationDisposable = handled.subscribe(notifier);
        var e = sources[$iterator$]();
        var state = {isDisposed: false},
            lastException,
            subscription = new SerialDisposable();
        var cancelable = currentThreadScheduler.scheduleRecursive(null, function(_, self) {
          if (state.isDisposed) {
            return;
          }
          var currentItem = tryCatch(e.next).call(e);
          if (currentItem === errorObj) {
            return o.onError(currentItem.e);
          }
          if (currentItem.done) {
            if (lastException) {
              o.onError(lastException);
            } else {
              o.onCompleted();
            }
            return;
          }
          var currentValue = currentItem.value;
          isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
          var outer = new SingleAssignmentDisposable();
          var inner = new SingleAssignmentDisposable();
          subscription.setDisposable(new BinaryDisposable(inner, outer));
          outer.setDisposable(currentValue.subscribe(function(x) {
            o.onNext(x);
          }, function(exn) {
            inner.setDisposable(notifier.subscribe(self, function(ex) {
              o.onError(ex);
            }, function() {
              o.onCompleted();
            }));
            exceptions.onNext(exn);
          }, function() {
            o.onCompleted();
          }));
        });
        return new NAryDisposable([notificationDisposable, subscription, cancelable, new IsDisposedDisposable(state)]);
      });
    };
    var RepeatEnumerable = (function(__super__) {
      inherits(RepeatEnumerable, __super__);
      function RepeatEnumerable(v, c) {
        this.v = v;
        this.c = c == null ? -1 : c;
      }
      RepeatEnumerable.prototype[$iterator$] = function() {
        return new RepeatEnumerator(this);
      };
      function RepeatEnumerator(p) {
        this.v = p.v;
        this.l = p.c;
      }
      RepeatEnumerator.prototype.next = function() {
        if (this.l === 0) {
          return doneEnumerator;
        }
        if (this.l > 0) {
          this.l--;
        }
        return {
          done: false,
          value: this.v
        };
      };
      return RepeatEnumerable;
    }(Enumerable));
    var enumerableRepeat = Enumerable.repeat = function(value, repeatCount) {
      return new RepeatEnumerable(value, repeatCount);
    };
    var OfEnumerable = (function(__super__) {
      inherits(OfEnumerable, __super__);
      function OfEnumerable(s, fn, thisArg) {
        this.s = s;
        this.fn = fn ? bindCallback(fn, thisArg, 3) : null;
      }
      OfEnumerable.prototype[$iterator$] = function() {
        return new OfEnumerator(this);
      };
      function OfEnumerator(p) {
        this.i = -1;
        this.s = p.s;
        this.l = this.s.length;
        this.fn = p.fn;
      }
      OfEnumerator.prototype.next = function() {
        return ++this.i < this.l ? {
          done: false,
          value: !this.fn ? this.s[this.i] : this.fn(this.s[this.i], this.i, this.s)
        } : doneEnumerator;
      };
      return OfEnumerable;
    }(Enumerable));
    var enumerableOf = Enumerable.of = function(source, selector, thisArg) {
      return new OfEnumerable(source, selector, thisArg);
    };
    var ObserveOnObservable = (function(__super__) {
      inherits(ObserveOnObservable, __super__);
      function ObserveOnObservable(source, s) {
        this.source = source;
        this._s = s;
        __super__.call(this);
      }
      ObserveOnObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new ObserveOnObserver(this._s, o));
      };
      return ObserveOnObservable;
    }(ObservableBase));
    observableProto.observeOn = function(scheduler) {
      return new ObserveOnObservable(this, scheduler);
    };
    var SubscribeOnObservable = (function(__super__) {
      inherits(SubscribeOnObservable, __super__);
      function SubscribeOnObservable(source, s) {
        this.source = source;
        this._s = s;
        __super__.call(this);
      }
      function scheduleMethod(scheduler, state) {
        var source = state[0],
            d = state[1],
            o = state[2];
        d.setDisposable(new ScheduledDisposable(scheduler, source.subscribe(o)));
      }
      SubscribeOnObservable.prototype.subscribeCore = function(o) {
        var m = new SingleAssignmentDisposable(),
            d = new SerialDisposable();
        d.setDisposable(m);
        m.setDisposable(this._s.schedule([this.source, d, o], scheduleMethod));
        return d;
      };
      return SubscribeOnObservable;
    }(ObservableBase));
    observableProto.subscribeOn = function(scheduler) {
      return new SubscribeOnObservable(this, scheduler);
    };
    var FromPromiseObservable = (function(__super__) {
      inherits(FromPromiseObservable, __super__);
      function FromPromiseObservable(p) {
        this.p = p;
        __super__.call(this);
      }
      FromPromiseObservable.prototype.subscribeCore = function(o) {
        this.p.then(function(data) {
          o.onNext(data);
          o.onCompleted();
        }, function(err) {
          o.onError(err);
        });
        return disposableEmpty;
      };
      return FromPromiseObservable;
    }(ObservableBase));
    var observableFromPromise = Observable.fromPromise = function(promise) {
      return new FromPromiseObservable(promise);
    };
    observableProto.toPromise = function(promiseCtor) {
      promiseCtor || (promiseCtor = Rx.config.Promise);
      if (!promiseCtor) {
        throw new NotSupportedError('Promise type not provided nor in Rx.config.Promise');
      }
      var source = this;
      return new promiseCtor(function(resolve, reject) {
        var value;
        source.subscribe(function(v) {
          value = v;
        }, reject, function() {
          resolve(value);
        });
      });
    };
    var ToArrayObservable = (function(__super__) {
      inherits(ToArrayObservable, __super__);
      function ToArrayObservable(source) {
        this.source = source;
        __super__.call(this);
      }
      ToArrayObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new InnerObserver(o));
      };
      inherits(InnerObserver, AbstractObserver);
      function InnerObserver(o) {
        this.o = o;
        this.a = [];
        AbstractObserver.call(this);
      }
      InnerObserver.prototype.next = function(x) {
        this.a.push(x);
      };
      InnerObserver.prototype.error = function(e) {
        this.o.onError(e);
      };
      InnerObserver.prototype.completed = function() {
        this.o.onNext(this.a);
        this.o.onCompleted();
      };
      return ToArrayObservable;
    }(ObservableBase));
    observableProto.toArray = function() {
      return new ToArrayObservable(this);
    };
    Observable.create = function(subscribe, parent) {
      return new AnonymousObservable(subscribe, parent);
    };
    var Defer = (function(__super__) {
      inherits(Defer, __super__);
      function Defer(factory) {
        this._f = factory;
        __super__.call(this);
      }
      Defer.prototype.subscribeCore = function(o) {
        var result = tryCatch(this._f)();
        if (result === errorObj) {
          return observableThrow(result.e).subscribe(o);
        }
        isPromise(result) && (result = observableFromPromise(result));
        return result.subscribe(o);
      };
      return Defer;
    }(ObservableBase));
    var observableDefer = Observable.defer = function(observableFactory) {
      return new Defer(observableFactory);
    };
    var EmptyObservable = (function(__super__) {
      inherits(EmptyObservable, __super__);
      function EmptyObservable(scheduler) {
        this.scheduler = scheduler;
        __super__.call(this);
      }
      EmptyObservable.prototype.subscribeCore = function(observer) {
        var sink = new EmptySink(observer, this.scheduler);
        return sink.run();
      };
      function EmptySink(observer, scheduler) {
        this.observer = observer;
        this.scheduler = scheduler;
      }
      function scheduleItem(s, state) {
        state.onCompleted();
        return disposableEmpty;
      }
      EmptySink.prototype.run = function() {
        var state = this.observer;
        return this.scheduler === immediateScheduler ? scheduleItem(null, state) : this.scheduler.schedule(state, scheduleItem);
      };
      return EmptyObservable;
    }(ObservableBase));
    var EMPTY_OBSERVABLE = new EmptyObservable(immediateScheduler);
    var observableEmpty = Observable.empty = function(scheduler) {
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      return scheduler === immediateScheduler ? EMPTY_OBSERVABLE : new EmptyObservable(scheduler);
    };
    var FromObservable = (function(__super__) {
      inherits(FromObservable, __super__);
      function FromObservable(iterable, mapper, scheduler) {
        this.iterable = iterable;
        this.mapper = mapper;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      FromObservable.prototype.subscribeCore = function(o) {
        var sink = new FromSink(o, this);
        return sink.run();
      };
      return FromObservable;
    }(ObservableBase));
    var FromSink = (function() {
      function FromSink(o, parent) {
        this.o = o;
        this.parent = parent;
      }
      FromSink.prototype.run = function() {
        var list = Object(this.parent.iterable),
            it = getIterable(list),
            o = this.o,
            mapper = this.parent.mapper;
        function loopRecursive(i, recurse) {
          var next = tryCatch(it.next).call(it);
          if (next === errorObj) {
            return o.onError(next.e);
          }
          if (next.done) {
            return o.onCompleted();
          }
          var result = next.value;
          if (isFunction(mapper)) {
            result = tryCatch(mapper)(result, i);
            if (result === errorObj) {
              return o.onError(result.e);
            }
          }
          o.onNext(result);
          recurse(i + 1);
        }
        return this.parent.scheduler.scheduleRecursive(0, loopRecursive);
      };
      return FromSink;
    }());
    var maxSafeInteger = Math.pow(2, 53) - 1;
    function StringIterable(s) {
      this._s = s;
    }
    StringIterable.prototype[$iterator$] = function() {
      return new StringIterator(this._s);
    };
    function StringIterator(s) {
      this._s = s;
      this._l = s.length;
      this._i = 0;
    }
    StringIterator.prototype[$iterator$] = function() {
      return this;
    };
    StringIterator.prototype.next = function() {
      return this._i < this._l ? {
        done: false,
        value: this._s.charAt(this._i++)
      } : doneEnumerator;
    };
    function ArrayIterable(a) {
      this._a = a;
    }
    ArrayIterable.prototype[$iterator$] = function() {
      return new ArrayIterator(this._a);
    };
    function ArrayIterator(a) {
      this._a = a;
      this._l = toLength(a);
      this._i = 0;
    }
    ArrayIterator.prototype[$iterator$] = function() {
      return this;
    };
    ArrayIterator.prototype.next = function() {
      return this._i < this._l ? {
        done: false,
        value: this._a[this._i++]
      } : doneEnumerator;
    };
    function numberIsFinite(value) {
      return typeof value === 'number' && root.isFinite(value);
    }
    function isNan(n) {
      return n !== n;
    }
    function getIterable(o) {
      var i = o[$iterator$],
          it;
      if (!i && typeof o === 'string') {
        it = new StringIterable(o);
        return it[$iterator$]();
      }
      if (!i && o.length !== undefined) {
        it = new ArrayIterable(o);
        return it[$iterator$]();
      }
      if (!i) {
        throw new TypeError('Object is not iterable');
      }
      return o[$iterator$]();
    }
    function sign(value) {
      var number = +value;
      if (number === 0) {
        return number;
      }
      if (isNaN(number)) {
        return number;
      }
      return number < 0 ? -1 : 1;
    }
    function toLength(o) {
      var len = +o.length;
      if (isNaN(len)) {
        return 0;
      }
      if (len === 0 || !numberIsFinite(len)) {
        return len;
      }
      len = sign(len) * Math.floor(Math.abs(len));
      if (len <= 0) {
        return 0;
      }
      if (len > maxSafeInteger) {
        return maxSafeInteger;
      }
      return len;
    }
    var observableFrom = Observable.from = function(iterable, mapFn, thisArg, scheduler) {
      if (iterable == null) {
        throw new Error('iterable cannot be null.');
      }
      if (mapFn && !isFunction(mapFn)) {
        throw new Error('mapFn when provided must be a function');
      }
      if (mapFn) {
        var mapper = bindCallback(mapFn, thisArg, 2);
      }
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new FromObservable(iterable, mapper, scheduler);
    };
    var FromArrayObservable = (function(__super__) {
      inherits(FromArrayObservable, __super__);
      function FromArrayObservable(args, scheduler) {
        this.args = args;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      FromArrayObservable.prototype.subscribeCore = function(observer) {
        var sink = new FromArraySink(observer, this);
        return sink.run();
      };
      return FromArrayObservable;
    }(ObservableBase));
    function FromArraySink(observer, parent) {
      this.observer = observer;
      this.parent = parent;
    }
    FromArraySink.prototype.run = function() {
      var observer = this.observer,
          args = this.parent.args,
          len = args.length;
      function loopRecursive(i, recurse) {
        if (i < len) {
          observer.onNext(args[i]);
          recurse(i + 1);
        } else {
          observer.onCompleted();
        }
      }
      return this.parent.scheduler.scheduleRecursive(0, loopRecursive);
    };
    var observableFromArray = Observable.fromArray = function(array, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new FromArrayObservable(array, scheduler);
    };
    var GenerateObservable = (function(__super__) {
      inherits(GenerateObservable, __super__);
      function GenerateObservable(state, cndFn, itrFn, resFn, s) {
        this._state = state;
        this._cndFn = cndFn;
        this._itrFn = itrFn;
        this._resFn = resFn;
        this._s = s;
        this._first = true;
        __super__.call(this);
      }
      function scheduleRecursive(self, recurse) {
        if (self._first) {
          self._first = false;
        } else {
          self._state = tryCatch(self._itrFn)(self._state);
          if (self._state === errorObj) {
            return self._o.onError(self._state.e);
          }
        }
        var hasResult = tryCatch(self._cndFn)(self._state);
        if (hasResult === errorObj) {
          return self._o.onError(hasResult.e);
        }
        if (hasResult) {
          var result = tryCatch(self._resFn)(self._state);
          if (result === errorObj) {
            return self._o.onError(result.e);
          }
          self._o.onNext(result);
          recurse(self);
        } else {
          self._o.onCompleted();
        }
      }
      GenerateObservable.prototype.subscribeCore = function(o) {
        this._o = o;
        return this._s.scheduleRecursive(this, scheduleRecursive);
      };
      return GenerateObservable;
    }(ObservableBase));
    Observable.generate = function(initialState, condition, iterate, resultSelector, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new GenerateObservable(initialState, condition, iterate, resultSelector, scheduler);
    };
    var NeverObservable = (function(__super__) {
      inherits(NeverObservable, __super__);
      function NeverObservable() {
        __super__.call(this);
      }
      NeverObservable.prototype.subscribeCore = function(observer) {
        return disposableEmpty;
      };
      return NeverObservable;
    }(ObservableBase));
    var NEVER_OBSERVABLE = new NeverObservable();
    var observableNever = Observable.never = function() {
      return NEVER_OBSERVABLE;
    };
    function observableOf(scheduler, array) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new FromArrayObservable(array, scheduler);
    }
    Observable.of = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      return new FromArrayObservable(args, currentThreadScheduler);
    };
    Observable.ofWithScheduler = function(scheduler) {
      var len = arguments.length,
          args = new Array(len - 1);
      for (var i = 1; i < len; i++) {
        args[i - 1] = arguments[i];
      }
      return new FromArrayObservable(args, scheduler);
    };
    var PairsObservable = (function(__super__) {
      inherits(PairsObservable, __super__);
      function PairsObservable(obj, scheduler) {
        this.obj = obj;
        this.keys = Object.keys(obj);
        this.scheduler = scheduler;
        __super__.call(this);
      }
      PairsObservable.prototype.subscribeCore = function(observer) {
        var sink = new PairsSink(observer, this);
        return sink.run();
      };
      return PairsObservable;
    }(ObservableBase));
    function PairsSink(observer, parent) {
      this.observer = observer;
      this.parent = parent;
    }
    PairsSink.prototype.run = function() {
      var observer = this.observer,
          obj = this.parent.obj,
          keys = this.parent.keys,
          len = keys.length;
      function loopRecursive(i, recurse) {
        if (i < len) {
          var key = keys[i];
          observer.onNext([key, obj[key]]);
          recurse(i + 1);
        } else {
          observer.onCompleted();
        }
      }
      return this.parent.scheduler.scheduleRecursive(0, loopRecursive);
    };
    Observable.pairs = function(obj, scheduler) {
      scheduler || (scheduler = currentThreadScheduler);
      return new PairsObservable(obj, scheduler);
    };
    var RangeObservable = (function(__super__) {
      inherits(RangeObservable, __super__);
      function RangeObservable(start, count, scheduler) {
        this.start = start;
        this.rangeCount = count;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      RangeObservable.prototype.subscribeCore = function(observer) {
        var sink = new RangeSink(observer, this);
        return sink.run();
      };
      return RangeObservable;
    }(ObservableBase));
    var RangeSink = (function() {
      function RangeSink(observer, parent) {
        this.observer = observer;
        this.parent = parent;
      }
      RangeSink.prototype.run = function() {
        var start = this.parent.start,
            count = this.parent.rangeCount,
            observer = this.observer;
        function loopRecursive(i, recurse) {
          if (i < count) {
            observer.onNext(start + i);
            recurse(i + 1);
          } else {
            observer.onCompleted();
          }
        }
        return this.parent.scheduler.scheduleRecursive(0, loopRecursive);
      };
      return RangeSink;
    }());
    Observable.range = function(start, count, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new RangeObservable(start, count, scheduler);
    };
    var RepeatObservable = (function(__super__) {
      inherits(RepeatObservable, __super__);
      function RepeatObservable(value, repeatCount, scheduler) {
        this.value = value;
        this.repeatCount = repeatCount == null ? -1 : repeatCount;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      RepeatObservable.prototype.subscribeCore = function(observer) {
        var sink = new RepeatSink(observer, this);
        return sink.run();
      };
      return RepeatObservable;
    }(ObservableBase));
    function RepeatSink(observer, parent) {
      this.observer = observer;
      this.parent = parent;
    }
    RepeatSink.prototype.run = function() {
      var observer = this.observer,
          value = this.parent.value;
      function loopRecursive(i, recurse) {
        if (i === -1 || i > 0) {
          observer.onNext(value);
          i > 0 && i--;
        }
        if (i === 0) {
          return observer.onCompleted();
        }
        recurse(i);
      }
      return this.parent.scheduler.scheduleRecursive(this.parent.repeatCount, loopRecursive);
    };
    Observable.repeat = function(value, repeatCount, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new RepeatObservable(value, repeatCount, scheduler);
    };
    var JustObservable = (function(__super__) {
      inherits(JustObservable, __super__);
      function JustObservable(value, scheduler) {
        this.value = value;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      JustObservable.prototype.subscribeCore = function(observer) {
        var sink = new JustSink(observer, this.value, this.scheduler);
        return sink.run();
      };
      function JustSink(observer, value, scheduler) {
        this.observer = observer;
        this.value = value;
        this.scheduler = scheduler;
      }
      function scheduleItem(s, state) {
        var value = state[0],
            observer = state[1];
        observer.onNext(value);
        observer.onCompleted();
        return disposableEmpty;
      }
      JustSink.prototype.run = function() {
        var state = [this.value, this.observer];
        return this.scheduler === immediateScheduler ? scheduleItem(null, state) : this.scheduler.schedule(state, scheduleItem);
      };
      return JustObservable;
    }(ObservableBase));
    var observableReturn = Observable['return'] = Observable.just = function(value, scheduler) {
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      return new JustObservable(value, scheduler);
    };
    var ThrowObservable = (function(__super__) {
      inherits(ThrowObservable, __super__);
      function ThrowObservable(error, scheduler) {
        this.error = error;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      ThrowObservable.prototype.subscribeCore = function(o) {
        var sink = new ThrowSink(o, this);
        return sink.run();
      };
      function ThrowSink(o, p) {
        this.o = o;
        this.p = p;
      }
      function scheduleItem(s, state) {
        var e = state[0],
            o = state[1];
        o.onError(e);
      }
      ThrowSink.prototype.run = function() {
        return this.p.scheduler.schedule([this.p.error, this.o], scheduleItem);
      };
      return ThrowObservable;
    }(ObservableBase));
    var observableThrow = Observable['throw'] = function(error, scheduler) {
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      return new ThrowObservable(error, scheduler);
    };
    var UsingObservable = (function(__super__) {
      inherits(UsingObservable, __super__);
      function UsingObservable(resFn, obsFn) {
        this._resFn = resFn;
        this._obsFn = obsFn;
        __super__.call(this);
      }
      UsingObservable.prototype.subscribeCore = function(o) {
        var disposable = disposableEmpty;
        var resource = tryCatch(this._resFn)();
        if (resource === errorObj) {
          return new BinaryDisposable(observableThrow(resource.e).subscribe(o), disposable);
        }
        resource && (disposable = resource);
        var source = tryCatch(this._obsFn)(resource);
        if (source === errorObj) {
          return new BinaryDisposable(observableThrow(source.e).subscribe(o), disposable);
        }
        return new BinaryDisposable(source.subscribe(o), disposable);
      };
      return UsingObservable;
    }(ObservableBase));
    Observable.using = function(resourceFactory, observableFactory) {
      return new UsingObservable(resourceFactory, observableFactory);
    };
    observableProto.amb = function(rightSource) {
      var leftSource = this;
      return new AnonymousObservable(function(observer) {
        var choice,
            leftChoice = 'L',
            rightChoice = 'R',
            leftSubscription = new SingleAssignmentDisposable(),
            rightSubscription = new SingleAssignmentDisposable();
        isPromise(rightSource) && (rightSource = observableFromPromise(rightSource));
        function choiceL() {
          if (!choice) {
            choice = leftChoice;
            rightSubscription.dispose();
          }
        }
        function choiceR() {
          if (!choice) {
            choice = rightChoice;
            leftSubscription.dispose();
          }
        }
        var leftSubscribe = observerCreate(function(left) {
          choiceL();
          choice === leftChoice && observer.onNext(left);
        }, function(e) {
          choiceL();
          choice === leftChoice && observer.onError(e);
        }, function() {
          choiceL();
          choice === leftChoice && observer.onCompleted();
        });
        var rightSubscribe = observerCreate(function(right) {
          choiceR();
          choice === rightChoice && observer.onNext(right);
        }, function(e) {
          choiceR();
          choice === rightChoice && observer.onError(e);
        }, function() {
          choiceR();
          choice === rightChoice && observer.onCompleted();
        });
        leftSubscription.setDisposable(leftSource.subscribe(leftSubscribe));
        rightSubscription.setDisposable(rightSource.subscribe(rightSubscribe));
        return new BinaryDisposable(leftSubscription, rightSubscription);
      });
    };
    function amb(p, c) {
      return p.amb(c);
    }
    Observable.amb = function() {
      var acc = observableNever(),
          items;
      if (Array.isArray(arguments[0])) {
        items = arguments[0];
      } else {
        var len = arguments.length;
        items = new Array(items);
        for (var i = 0; i < len; i++) {
          items[i] = arguments[i];
        }
      }
      for (var i = 0,
          len = items.length; i < len; i++) {
        acc = amb(acc, items[i]);
      }
      return acc;
    };
    var CatchObservable = (function(__super__) {
      inherits(CatchObservable, __super__);
      function CatchObservable(source, fn) {
        this.source = source;
        this._fn = fn;
        __super__.call(this);
      }
      CatchObservable.prototype.subscribeCore = function(o) {
        var d1 = new SingleAssignmentDisposable(),
            subscription = new SerialDisposable();
        subscription.setDisposable(d1);
        d1.setDisposable(this.source.subscribe(new CatchObserver(o, subscription, this._fn)));
        return subscription;
      };
      return CatchObservable;
    }(ObservableBase));
    var CatchObserver = (function(__super__) {
      inherits(CatchObserver, __super__);
      function CatchObserver(o, s, fn) {
        this._o = o;
        this._s = s;
        this._fn = fn;
        __super__.call(this);
      }
      CatchObserver.prototype.next = function(x) {
        this._o.onNext(x);
      };
      CatchObserver.prototype.completed = function() {
        return this._o.onCompleted();
      };
      CatchObserver.prototype.error = function(e) {
        var result = tryCatch(this._fn)(e);
        if (result === errorObj) {
          return this._o.onError(result.e);
        }
        isPromise(result) && (result = observableFromPromise(result));
        var d = new SingleAssignmentDisposable();
        this._s.setDisposable(d);
        d.setDisposable(result.subscribe(this._o));
      };
      return CatchObserver;
    }(AbstractObserver));
    observableProto['catch'] = function(handlerOrSecond) {
      return isFunction(handlerOrSecond) ? new CatchObservable(this, handlerOrSecond) : observableCatch([this, handlerOrSecond]);
    };
    var observableCatch = Observable['catch'] = function() {
      var items;
      if (Array.isArray(arguments[0])) {
        items = arguments[0];
      } else {
        var len = arguments.length;
        items = new Array(len);
        for (var i = 0; i < len; i++) {
          items[i] = arguments[i];
        }
      }
      return enumerableOf(items).catchError();
    };
    observableProto.combineLatest = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      if (Array.isArray(args[0])) {
        args[0].unshift(this);
      } else {
        args.unshift(this);
      }
      return combineLatest.apply(this, args);
    };
    function falseFactory() {
      return false;
    }
    function argumentsToArray() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      return args;
    }
    var CombineLatestObservable = (function(__super__) {
      inherits(CombineLatestObservable, __super__);
      function CombineLatestObservable(params, cb) {
        var len = params.length;
        this._params = params;
        this._cb = cb;
        this._hv = arrayInitialize(len, falseFactory);
        this._hvAll = false;
        this._done = arrayInitialize(len, falseFactory);
        this._v = new Array(len);
        __super__.call(this);
      }
      CombineLatestObservable.prototype.subscribeCore = function(observer) {
        var len = this._params.length,
            subscriptions = new Array(len);
        for (var i = 0; i < len; i++) {
          var source = this._params[i],
              sad = new SingleAssignmentDisposable();
          subscriptions[i] = sad;
          isPromise(source) && (source = observableFromPromise(source));
          sad.setDisposable(source.subscribe(new CombineLatestObserver(observer, i, this)));
        }
        return new NAryDisposable(subscriptions);
      };
      return CombineLatestObservable;
    }(ObservableBase));
    var CombineLatestObserver = (function(__super__) {
      inherits(CombineLatestObserver, __super__);
      function CombineLatestObserver(o, i, p) {
        this._o = o;
        this._i = i;
        this._p = p;
        __super__.call(this);
      }
      CombineLatestObserver.prototype.next = function(x) {
        this._p._v[this._i] = x;
        this._p._hv[this._i] = true;
        if (this._p._hvAll || (this._p._hvAll = this._p._hv.every(identity))) {
          var res = tryCatch(this._p._cb).apply(null, this._p._v);
          if (res === errorObj) {
            return this._o.onError(res.e);
          }
          this._o.onNext(res);
        } else if (this._p._done.filter(function(x, j) {
          return j !== this._i;
        }, this).every(identity)) {
          this._o.onCompleted();
        }
      };
      CombineLatestObserver.prototype.error = function(e) {
        this._o.onError(e);
      };
      CombineLatestObserver.prototype.completed = function() {
        this._p._done[this._i] = true;
        this._p._done.every(identity) && this._o.onCompleted();
      };
      return CombineLatestObserver;
    }(AbstractObserver));
    var combineLatest = Observable.combineLatest = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
      Array.isArray(args[0]) && (args = args[0]);
      return new CombineLatestObservable(args, resultSelector);
    };
    observableProto.concat = function() {
      for (var args = [],
          i = 0,
          len = arguments.length; i < len; i++) {
        args.push(arguments[i]);
      }
      args.unshift(this);
      return observableConcat.apply(null, args);
    };
    var ConcatObservable = (function(__super__) {
      inherits(ConcatObservable, __super__);
      function ConcatObservable(sources) {
        this.sources = sources;
        __super__.call(this);
      }
      ConcatObservable.prototype.subscribeCore = function(o) {
        var sink = new ConcatSink(this.sources, o);
        return sink.run();
      };
      function ConcatSink(sources, o) {
        this.sources = sources;
        this.o = o;
      }
      ConcatSink.prototype.run = function() {
        var isDisposed,
            subscription = new SerialDisposable(),
            sources = this.sources,
            length = sources.length,
            o = this.o;
        var cancelable = immediateScheduler.scheduleRecursive(0, function(i, self) {
          if (isDisposed) {
            return;
          }
          if (i === length) {
            return o.onCompleted();
          }
          var currentValue = sources[i];
          isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
          var d = new SingleAssignmentDisposable();
          subscription.setDisposable(d);
          d.setDisposable(currentValue.subscribe(function(x) {
            o.onNext(x);
          }, function(e) {
            o.onError(e);
          }, function() {
            self(i + 1);
          }));
        });
        return new CompositeDisposable(subscription, cancelable, disposableCreate(function() {
          isDisposed = true;
        }));
      };
      return ConcatObservable;
    }(ObservableBase));
    var observableConcat = Observable.concat = function() {
      var args;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
      } else {
        args = new Array(arguments.length);
        for (var i = 0,
            len = arguments.length; i < len; i++) {
          args[i] = arguments[i];
        }
      }
      return new ConcatObservable(args);
    };
    observableProto.concatAll = function() {
      return this.merge(1);
    };
    var MergeObservable = (function(__super__) {
      inherits(MergeObservable, __super__);
      function MergeObservable(source, maxConcurrent) {
        this.source = source;
        this.maxConcurrent = maxConcurrent;
        __super__.call(this);
      }
      MergeObservable.prototype.subscribeCore = function(observer) {
        var g = new CompositeDisposable();
        g.add(this.source.subscribe(new MergeObserver(observer, this.maxConcurrent, g)));
        return g;
      };
      return MergeObservable;
    }(ObservableBase));
    var MergeObserver = (function() {
      function MergeObserver(o, max, g) {
        this.o = o;
        this.max = max;
        this.g = g;
        this.done = false;
        this.q = [];
        this.activeCount = 0;
        this.isStopped = false;
      }
      MergeObserver.prototype.handleSubscribe = function(xs) {
        var sad = new SingleAssignmentDisposable();
        this.g.add(sad);
        isPromise(xs) && (xs = observableFromPromise(xs));
        sad.setDisposable(xs.subscribe(new InnerObserver(this, sad)));
      };
      MergeObserver.prototype.onNext = function(innerSource) {
        if (this.isStopped) {
          return;
        }
        if (this.activeCount < this.max) {
          this.activeCount++;
          this.handleSubscribe(innerSource);
        } else {
          this.q.push(innerSource);
        }
      };
      MergeObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      MergeObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.done = true;
          this.activeCount === 0 && this.o.onCompleted();
        }
      };
      MergeObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      MergeObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      };
      function InnerObserver(parent, sad) {
        this.parent = parent;
        this.sad = sad;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (!this.isStopped) {
          this.parent.o.onNext(x);
        }
      };
      InnerObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          var parent = this.parent;
          parent.g.remove(this.sad);
          if (parent.q.length > 0) {
            parent.handleSubscribe(parent.q.shift());
          } else {
            parent.activeCount--;
            parent.done && parent.activeCount === 0 && parent.o.onCompleted();
          }
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
          return true;
        }
        return false;
      };
      return MergeObserver;
    }());
    observableProto.merge = function(maxConcurrentOrOther) {
      return typeof maxConcurrentOrOther !== 'number' ? observableMerge(this, maxConcurrentOrOther) : new MergeObservable(this, maxConcurrentOrOther);
    };
    var observableMerge = Observable.merge = function() {
      var scheduler,
          sources = [],
          i,
          len = arguments.length;
      if (!arguments[0]) {
        scheduler = immediateScheduler;
        for (i = 1; i < len; i++) {
          sources.push(arguments[i]);
        }
      } else if (isScheduler(arguments[0])) {
        scheduler = arguments[0];
        for (i = 1; i < len; i++) {
          sources.push(arguments[i]);
        }
      } else {
        scheduler = immediateScheduler;
        for (i = 0; i < len; i++) {
          sources.push(arguments[i]);
        }
      }
      if (Array.isArray(sources[0])) {
        sources = sources[0];
      }
      return observableOf(scheduler, sources).mergeAll();
    };
    var CompositeError = Rx.CompositeError = function(errors) {
      this.name = "NotImplementedError";
      this.innerErrors = errors;
      this.message = 'This contains multiple errors. Check the innerErrors';
      Error.call(this);
    };
    CompositeError.prototype = Error.prototype;
    Observable.mergeDelayError = function() {
      var args;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
      } else {
        var len = arguments.length;
        args = new Array(len);
        for (var i = 0; i < len; i++) {
          args[i] = arguments[i];
        }
      }
      var source = observableOf(null, args);
      return new AnonymousObservable(function(o) {
        var group = new CompositeDisposable(),
            m = new SingleAssignmentDisposable(),
            isStopped = false,
            errors = [];
        function setCompletion() {
          if (errors.length === 0) {
            o.onCompleted();
          } else if (errors.length === 1) {
            o.onError(errors[0]);
          } else {
            o.onError(new CompositeError(errors));
          }
        }
        group.add(m);
        m.setDisposable(source.subscribe(function(innerSource) {
          var innerSubscription = new SingleAssignmentDisposable();
          group.add(innerSubscription);
          isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
          innerSubscription.setDisposable(innerSource.subscribe(function(x) {
            o.onNext(x);
          }, function(e) {
            errors.push(e);
            group.remove(innerSubscription);
            isStopped && group.length === 1 && setCompletion();
          }, function() {
            group.remove(innerSubscription);
            isStopped && group.length === 1 && setCompletion();
          }));
        }, function(e) {
          errors.push(e);
          isStopped = true;
          group.length === 1 && setCompletion();
        }, function() {
          isStopped = true;
          group.length === 1 && setCompletion();
        }));
        return group;
      });
    };
    var MergeAllObservable = (function(__super__) {
      inherits(MergeAllObservable, __super__);
      function MergeAllObservable(source) {
        this.source = source;
        __super__.call(this);
      }
      MergeAllObservable.prototype.subscribeCore = function(observer) {
        var g = new CompositeDisposable(),
            m = new SingleAssignmentDisposable();
        g.add(m);
        m.setDisposable(this.source.subscribe(new MergeAllObserver(observer, g)));
        return g;
      };
      function MergeAllObserver(o, g) {
        this.o = o;
        this.g = g;
        this.isStopped = false;
        this.done = false;
      }
      MergeAllObserver.prototype.onNext = function(innerSource) {
        if (this.isStopped) {
          return;
        }
        var sad = new SingleAssignmentDisposable();
        this.g.add(sad);
        isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
        sad.setDisposable(innerSource.subscribe(new InnerObserver(this, sad)));
      };
      MergeAllObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      MergeAllObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.done = true;
          this.g.length === 1 && this.o.onCompleted();
        }
      };
      MergeAllObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      MergeAllObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      };
      function InnerObserver(parent, sad) {
        this.parent = parent;
        this.sad = sad;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (!this.isStopped) {
          this.parent.o.onNext(x);
        }
      };
      InnerObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          var parent = this.parent;
          this.isStopped = true;
          parent.g.remove(this.sad);
          parent.done && parent.g.length === 1 && parent.o.onCompleted();
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
          return true;
        }
        return false;
      };
      return MergeAllObservable;
    }(ObservableBase));
    observableProto.mergeAll = function() {
      return new MergeAllObservable(this);
    };
    observableProto.onErrorResumeNext = function(second) {
      if (!second) {
        throw new Error('Second observable is required');
      }
      return onErrorResumeNext([this, second]);
    };
    var onErrorResumeNext = Observable.onErrorResumeNext = function() {
      var sources = [];
      if (Array.isArray(arguments[0])) {
        sources = arguments[0];
      } else {
        for (var i = 0,
            len = arguments.length; i < len; i++) {
          sources.push(arguments[i]);
        }
      }
      return new AnonymousObservable(function(observer) {
        var pos = 0,
            subscription = new SerialDisposable(),
            cancelable = immediateScheduler.scheduleRecursive(null, function(_, self) {
              var current,
                  d;
              if (pos < sources.length) {
                current = sources[pos++];
                isPromise(current) && (current = observableFromPromise(current));
                d = new SingleAssignmentDisposable();
                subscription.setDisposable(d);
                d.setDisposable(current.subscribe(observer.onNext.bind(observer), self, self));
              } else {
                observer.onCompleted();
              }
            });
        return new BinaryDisposable(subscription, cancelable);
      });
    };
    var SkipUntilObservable = (function(__super__) {
      inherits(SkipUntilObservable, __super__);
      function SkipUntilObservable(source, other) {
        this._s = source;
        this._o = isPromise(other) ? observableFromPromise(other) : other;
        this._open = false;
        __super__.call(this);
      }
      SkipUntilObservable.prototype.subscribeCore = function(o) {
        var leftSubscription = new SingleAssignmentDisposable();
        leftSubscription.setDisposable(this._s.subscribe(new SkipUntilSourceObserver(o, this)));
        isPromise(this._o) && (this._o = observableFromPromise(this._o));
        var rightSubscription = new SingleAssignmentDisposable();
        rightSubscription.setDisposable(this._o.subscribe(new SkipUntilOtherObserver(o, this, rightSubscription)));
        return new BinaryDisposable(leftSubscription, rightSubscription);
      };
      return SkipUntilObservable;
    }(ObservableBase));
    var SkipUntilSourceObserver = (function(__super__) {
      inherits(SkipUntilSourceObserver, __super__);
      function SkipUntilSourceObserver(o, p) {
        this._o = o;
        this._p = p;
        __super__.call(this);
      }
      SkipUntilSourceObserver.prototype.next = function(x) {
        this._p._open && this._o.onNext(x);
      };
      SkipUntilSourceObserver.prototype.error = function(err) {
        this._o.onError(err);
      };
      SkipUntilSourceObserver.prototype.onCompleted = function() {
        this._p._open && this._o.onCompleted();
      };
      return SkipUntilSourceObserver;
    }(AbstractObserver));
    var SkipUntilOtherObserver = (function(__super__) {
      inherits(SkipUntilOtherObserver, __super__);
      function SkipUntilOtherObserver(o, p, r) {
        this._o = o;
        this._p = p;
        this._r = r;
        __super__.call(this);
      }
      SkipUntilOtherObserver.prototype.next = function() {
        this._p._open = true;
        this._r.dispose();
      };
      SkipUntilOtherObserver.prototype.error = function(err) {
        this._o.onError(err);
      };
      SkipUntilOtherObserver.prototype.onCompleted = function() {
        this._r.dispose();
      };
      return SkipUntilOtherObserver;
    }(AbstractObserver));
    observableProto.skipUntil = function(other) {
      return new SkipUntilObservable(this, other);
    };
    var SwitchObservable = (function(__super__) {
      inherits(SwitchObservable, __super__);
      function SwitchObservable(source) {
        this.source = source;
        __super__.call(this);
      }
      SwitchObservable.prototype.subscribeCore = function(o) {
        var inner = new SerialDisposable(),
            s = this.source.subscribe(new SwitchObserver(o, inner));
        return new BinaryDisposable(s, inner);
      };
      inherits(SwitchObserver, AbstractObserver);
      function SwitchObserver(o, inner) {
        this.o = o;
        this.inner = inner;
        this.stopped = false;
        this.latest = 0;
        this.hasLatest = false;
        AbstractObserver.call(this);
      }
      SwitchObserver.prototype.next = function(innerSource) {
        var d = new SingleAssignmentDisposable(),
            id = ++this.latest;
        this.hasLatest = true;
        this.inner.setDisposable(d);
        isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
        d.setDisposable(innerSource.subscribe(new InnerObserver(this, id)));
      };
      SwitchObserver.prototype.error = function(e) {
        this.o.onError(e);
      };
      SwitchObserver.prototype.completed = function() {
        this.stopped = true;
        !this.hasLatest && this.o.onCompleted();
      };
      inherits(InnerObserver, AbstractObserver);
      function InnerObserver(parent, id) {
        this.parent = parent;
        this.id = id;
        AbstractObserver.call(this);
      }
      InnerObserver.prototype.next = function(x) {
        this.parent.latest === this.id && this.parent.o.onNext(x);
      };
      InnerObserver.prototype.error = function(e) {
        this.parent.latest === this.id && this.parent.o.onError(e);
      };
      InnerObserver.prototype.completed = function() {
        if (this.parent.latest === this.id) {
          this.parent.hasLatest = false;
          this.parent.isStopped && this.parent.o.onCompleted();
        }
      };
      return SwitchObservable;
    }(ObservableBase));
    observableProto['switch'] = observableProto.switchLatest = function() {
      return new SwitchObservable(this);
    };
    var TakeUntilObservable = (function(__super__) {
      inherits(TakeUntilObservable, __super__);
      function TakeUntilObservable(source, other) {
        this.source = source;
        this.other = isPromise(other) ? observableFromPromise(other) : other;
        __super__.call(this);
      }
      TakeUntilObservable.prototype.subscribeCore = function(o) {
        return new BinaryDisposable(this.source.subscribe(o), this.other.subscribe(new TakeUntilObserver(o)));
      };
      return TakeUntilObservable;
    }(ObservableBase));
    var TakeUntilObserver = (function(__super__) {
      inherits(TakeUntilObserver, __super__);
      function TakeUntilObserver(o) {
        this._o = o;
        __super__.call(this);
      }
      TakeUntilObserver.prototype.next = function() {
        this._o.onCompleted();
      };
      TakeUntilObserver.prototype.error = function(err) {
        this._o.onError(err);
      };
      TakeUntilObserver.prototype.onCompleted = noop;
      return TakeUntilObserver;
    }(AbstractObserver));
    observableProto.takeUntil = function(other) {
      return new TakeUntilObservable(this, other);
    };
    function falseFactory() {
      return false;
    }
    function argumentsToArray() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      return args;
    }
    var WithLatestFromObservable = (function(__super__) {
      inherits(WithLatestFromObservable, __super__);
      function WithLatestFromObservable(source, sources, resultSelector) {
        var len = sources.length;
        this._s = source;
        this._ss = sources;
        this._cb = resultSelector;
        this._hv = arrayInitialize(len, falseFactory);
        this._hvAll = false;
        this._v = new Array(len);
        __super__.call(this);
      }
      WithLatestFromObservable.prototype.subscribeCore = function(o) {
        var n = this._ss.length,
            subscriptions = new Array(n + 1);
        for (var i = 0; i < n; i++) {
          var other = this._ss[i],
              sad = new SingleAssignmentDisposable();
          isPromise(other) && (other = observableFromPromise(other));
          sad.setDisposable(other.subscribe(new WithLatestFromOtherObserver(o, i, this)));
          subscriptions[i] = sad;
        }
        var sad = new SingleAssignmentDisposable();
        sad.setDisposable(this._s.subscribe(new WithLatestFromSourceObserver(o, this)));
        subscriptions[n] = sad;
        return new NAryDisposable(subscriptions);
      };
      return WithLatestFromObservable;
    }(ObservableBase));
    var WithLatestFromOtherObserver = (function(__super__) {
      inherits(WithLatestFromOtherObserver, __super__);
      function WithLatestFromOtherObserver(o, i, p) {
        this._o = o;
        this._i = i;
        this._p = p;
        __super__.call(this);
      }
      WithLatestFromOtherObserver.prototype.next = function(x) {
        this._p._v[this._i] = x;
        this._p._hv[this._i] = true;
        this._p._hvAll = this._p._hv.every(identity);
      };
      WithLatestFromOtherObserver.prototype.error = function(e) {
        this._o.onError(e);
      };
      WithLatestFromOtherObserver.prototype.completed = noop;
      return WithLatestFromOtherObserver;
    }(AbstractObserver));
    var WithLatestFromSourceObserver = (function(__super__) {
      inherits(WithLatestFromSourceObserver, __super__);
      function WithLatestFromSourceObserver(o, p) {
        this._o = o;
        this._p = p;
        __super__.call(this);
      }
      WithLatestFromSourceObserver.prototype.next = function(x) {
        var allValues = [x].concat(this._p._v);
        if (!this._p._hvAll) {
          return;
        }
        var res = tryCatch(this._p._cb).apply(null, allValues);
        if (res === errorObj) {
          return this._o.onError(res.e);
        }
        this._o.onNext(res);
      };
      WithLatestFromSourceObserver.prototype.error = function(e) {
        this._o.onError(e);
      };
      WithLatestFromSourceObserver.prototype.completed = function() {
        this._o.onCompleted();
      };
      return WithLatestFromSourceObserver;
    }(AbstractObserver));
    observableProto.withLatestFrom = function() {
      if (arguments.length === 0) {
        throw new Error('invalid arguments');
      }
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
      Array.isArray(args[0]) && (args = args[0]);
      return new WithLatestFromObservable(this, args, resultSelector);
    };
    function falseFactory() {
      return false;
    }
    function emptyArrayFactory() {
      return [];
    }
    var ZipObservable = (function(__super__) {
      inherits(ZipObservable, __super__);
      function ZipObservable(sources, resultSelector) {
        var len = sources.length;
        this._s = sources;
        this._cb = resultSelector;
        this._done = arrayInitialize(len, falseFactory);
        this._q = arrayInitialize(len, emptyArrayFactory);
        __super__.call(this);
      }
      ZipObservable.prototype.subscribeCore = function(observer) {
        var n = this._s.length,
            subscriptions = new Array(n);
        for (var i = 0; i < n; i++) {
          var source = this._s[i],
              sad = new SingleAssignmentDisposable();
          subscriptions[i] = sad;
          isPromise(source) && (source = observableFromPromise(source));
          sad.setDisposable(source.subscribe(new ZipObserver(observer, i, this)));
        }
        return new NAryDisposable(subscriptions);
      };
      return ZipObservable;
    }(ObservableBase));
    var ZipObserver = (function(__super__) {
      inherits(ZipObserver, __super__);
      function ZipObserver(o, i, p) {
        this._o = o;
        this._i = i;
        this._p = p;
        __super__.call(this);
      }
      ZipObserver.prototype.next = function(x) {
        this._p._q[this._i].push(x);
        if (this._p._q.every(function(x) {
          return x.length > 0;
        })) {
          var queuedValues = this._p._q.map(function(x) {
            return x.shift();
          });
          var res = tryCatch(this._p._cb).apply(null, queuedValues);
          if (res === errorObj) {
            return this._o.onError(res.e);
          }
          this._o.onNext(res);
        } else if (this._p._done.filter(function(x, j) {
          return j !== this._i;
        }, this).every(identity)) {
          this._o.onCompleted();
        }
      };
      ZipObserver.prototype.error = function(e) {
        this._o.onError(e);
      };
      ZipObserver.prototype.completed = function() {
        this._p._done[this._i] = true;
        this._p._done.every(identity) && this._o.onCompleted();
      };
      return ZipObserver;
    }(AbstractObserver));
    observableProto.zip = function() {
      if (arguments.length === 0) {
        throw new Error('invalid arguments');
      }
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
      Array.isArray(args[0]) && (args = args[0]);
      var parent = this;
      args.unshift(parent);
      return new ZipObservable(args, resultSelector);
    };
    Observable.zip = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      if (Array.isArray(args[0])) {
        args = isFunction(args[1]) ? args[0].concat(args[1]) : args[0];
      }
      var first = args.shift();
      return first.zip.apply(first, args);
    };
    function falseFactory() {
      return false;
    }
    function emptyArrayFactory() {
      return [];
    }
    function argumentsToArray() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      return args;
    }
    observableProto.zipIterable = function() {
      if (arguments.length === 0) {
        throw new Error('invalid arguments');
      }
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
      var parent = this;
      args.unshift(parent);
      return new AnonymousObservable(function(o) {
        var n = args.length,
            queues = arrayInitialize(n, emptyArrayFactory),
            isDone = arrayInitialize(n, falseFactory);
        var subscriptions = new Array(n);
        for (var idx = 0; idx < n; idx++) {
          (function(i) {
            var source = args[i],
                sad = new SingleAssignmentDisposable();
            (isArrayLike(source) || isIterable(source)) && (source = observableFrom(source));
            sad.setDisposable(source.subscribe(function(x) {
              queues[i].push(x);
              if (queues.every(function(x) {
                return x.length > 0;
              })) {
                var queuedValues = queues.map(function(x) {
                  return x.shift();
                }),
                    res = tryCatch(resultSelector).apply(parent, queuedValues);
                if (res === errorObj) {
                  return o.onError(res.e);
                }
                o.onNext(res);
              } else if (isDone.filter(function(x, j) {
                return j !== i;
              }).every(identity)) {
                o.onCompleted();
              }
            }, function(e) {
              o.onError(e);
            }, function() {
              isDone[i] = true;
              isDone.every(identity) && o.onCompleted();
            }));
            subscriptions[i] = sad;
          })(idx);
        }
        return new CompositeDisposable(subscriptions);
      }, parent);
    };
    function asObservable(source) {
      return function subscribe(o) {
        return source.subscribe(o);
      };
    }
    observableProto.asObservable = function() {
      return new AnonymousObservable(asObservable(this), this);
    };
    function toArray(x) {
      return x.toArray();
    }
    function notEmpty(x) {
      return x.length > 0;
    }
    observableProto.bufferWithCount = function(count, skip) {
      typeof skip !== 'number' && (skip = count);
      return this.windowWithCount(count, skip).flatMap(toArray).filter(notEmpty);
    };
    var DematerializeObservable = (function(__super__) {
      inherits(DematerializeObservable, __super__);
      function DematerializeObservable(source) {
        this.source = source;
        __super__.call(this);
      }
      DematerializeObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new DematerializeObserver(o));
      };
      return DematerializeObservable;
    }(ObservableBase));
    var DematerializeObserver = (function(__super__) {
      inherits(DematerializeObserver, __super__);
      function DematerializeObserver(o) {
        this._o = o;
        __super__.call(this);
      }
      DematerializeObserver.prototype.next = function(x) {
        x.accept(this._o);
      };
      DematerializeObserver.prototype.error = function(e) {
        this._o.onError(e);
      };
      DematerializeObserver.prototype.completed = function() {
        this._o.onCompleted();
      };
      return DematerializeObserver;
    }(AbstractObserver));
    observableProto.dematerialize = function() {
      return new DematerializeObservable(this);
    };
    var DistinctUntilChangedObservable = (function(__super__) {
      inherits(DistinctUntilChangedObservable, __super__);
      function DistinctUntilChangedObservable(source, keyFn, comparer) {
        this.source = source;
        this.keyFn = keyFn;
        this.comparer = comparer;
        __super__.call(this);
      }
      DistinctUntilChangedObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new DistinctUntilChangedObserver(o, this.keyFn, this.comparer));
      };
      return DistinctUntilChangedObservable;
    }(ObservableBase));
    var DistinctUntilChangedObserver = (function(__super__) {
      inherits(DistinctUntilChangedObserver, __super__);
      function DistinctUntilChangedObserver(o, keyFn, comparer) {
        this.o = o;
        this.keyFn = keyFn;
        this.comparer = comparer;
        this.hasCurrentKey = false;
        this.currentKey = null;
        __super__.call(this);
      }
      DistinctUntilChangedObserver.prototype.next = function(x) {
        var key = x,
            comparerEquals;
        if (isFunction(this.keyFn)) {
          key = tryCatch(this.keyFn)(x);
          if (key === errorObj) {
            return this.o.onError(key.e);
          }
        }
        if (this.hasCurrentKey) {
          comparerEquals = tryCatch(this.comparer)(this.currentKey, key);
          if (comparerEquals === errorObj) {
            return this.o.onError(comparerEquals.e);
          }
        }
        if (!this.hasCurrentKey || !comparerEquals) {
          this.hasCurrentKey = true;
          this.currentKey = key;
          this.o.onNext(x);
        }
      };
      DistinctUntilChangedObserver.prototype.error = function(e) {
        this.o.onError(e);
      };
      DistinctUntilChangedObserver.prototype.completed = function() {
        this.o.onCompleted();
      };
      return DistinctUntilChangedObserver;
    }(AbstractObserver));
    observableProto.distinctUntilChanged = function(keyFn, comparer) {
      comparer || (comparer = defaultComparer);
      return new DistinctUntilChangedObservable(this, keyFn, comparer);
    };
    var TapObservable = (function(__super__) {
      inherits(TapObservable, __super__);
      function TapObservable(source, observerOrOnNext, onError, onCompleted) {
        this.source = source;
        this._oN = observerOrOnNext;
        this._oE = onError;
        this._oC = onCompleted;
        __super__.call(this);
      }
      TapObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new InnerObserver(o, this));
      };
      inherits(InnerObserver, AbstractObserver);
      function InnerObserver(o, p) {
        this.o = o;
        this.t = !p._oN || isFunction(p._oN) ? observerCreate(p._oN || noop, p._oE || noop, p._oC || noop) : p._oN;
        this.isStopped = false;
        AbstractObserver.call(this);
      }
      InnerObserver.prototype.next = function(x) {
        var res = tryCatch(this.t.onNext).call(this.t, x);
        if (res === errorObj) {
          this.o.onError(res.e);
        }
        this.o.onNext(x);
      };
      InnerObserver.prototype.error = function(err) {
        var res = tryCatch(this.t.onError).call(this.t, err);
        if (res === errorObj) {
          return this.o.onError(res.e);
        }
        this.o.onError(err);
      };
      InnerObserver.prototype.completed = function() {
        var res = tryCatch(this.t.onCompleted).call(this.t);
        if (res === errorObj) {
          return this.o.onError(res.e);
        }
        this.o.onCompleted();
      };
      return TapObservable;
    }(ObservableBase));
    observableProto['do'] = observableProto.tap = observableProto.doAction = function(observerOrOnNext, onError, onCompleted) {
      return new TapObservable(this, observerOrOnNext, onError, onCompleted);
    };
    observableProto.doOnNext = observableProto.tapOnNext = function(onNext, thisArg) {
      return this.tap(typeof thisArg !== 'undefined' ? function(x) {
        onNext.call(thisArg, x);
      } : onNext);
    };
    observableProto.doOnError = observableProto.tapOnError = function(onError, thisArg) {
      return this.tap(noop, typeof thisArg !== 'undefined' ? function(e) {
        onError.call(thisArg, e);
      } : onError);
    };
    observableProto.doOnCompleted = observableProto.tapOnCompleted = function(onCompleted, thisArg) {
      return this.tap(noop, null, typeof thisArg !== 'undefined' ? function() {
        onCompleted.call(thisArg);
      } : onCompleted);
    };
    observableProto['finally'] = function(action) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var subscription = tryCatch(source.subscribe).call(source, observer);
        if (subscription === errorObj) {
          action();
          return thrower(subscription.e);
        }
        return disposableCreate(function() {
          var r = tryCatch(subscription.dispose).call(subscription);
          action();
          r === errorObj && thrower(r.e);
        });
      }, this);
    };
    var IgnoreElementsObservable = (function(__super__) {
      inherits(IgnoreElementsObservable, __super__);
      function IgnoreElementsObservable(source) {
        this.source = source;
        __super__.call(this);
      }
      IgnoreElementsObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new InnerObserver(o));
      };
      function InnerObserver(o) {
        this.o = o;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = noop;
      InnerObserver.prototype.onError = function(err) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(err);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onCompleted();
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.observer.onError(e);
          return true;
        }
        return false;
      };
      return IgnoreElementsObservable;
    }(ObservableBase));
    observableProto.ignoreElements = function() {
      return new IgnoreElementsObservable(this);
    };
    var MaterializeObservable = (function(__super__) {
      inherits(MaterializeObservable, __super__);
      function MaterializeObservable(source, fn) {
        this.source = source;
        __super__.call(this);
      }
      MaterializeObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new MaterializeObserver(o));
      };
      return MaterializeObservable;
    }(ObservableBase));
    var MaterializeObserver = (function(__super__) {
      inherits(MaterializeObserver, __super__);
      function MaterializeObserver(o) {
        this._o = o;
        __super__.call(this);
      }
      MaterializeObserver.prototype.next = function(x) {
        this._o.onNext(notificationCreateOnNext(x));
      };
      MaterializeObserver.prototype.error = function(e) {
        this._o.onNext(notificationCreateOnError(e));
        this._o.onCompleted();
      };
      MaterializeObserver.prototype.completed = function() {
        this._o.onNext(notificationCreateOnCompleted());
        this._o.onCompleted();
      };
      return MaterializeObserver;
    }(AbstractObserver));
    observableProto.materialize = function() {
      return new MaterializeObservable(this);
    };
    observableProto.repeat = function(repeatCount) {
      return enumerableRepeat(this, repeatCount).concat();
    };
    observableProto.retry = function(retryCount) {
      return enumerableRepeat(this, retryCount).catchError();
    };
    observableProto.retryWhen = function(notifier) {
      return enumerableRepeat(this).catchErrorWhen(notifier);
    };
    var ScanObservable = (function(__super__) {
      inherits(ScanObservable, __super__);
      function ScanObservable(source, accumulator, hasSeed, seed) {
        this.source = source;
        this.accumulator = accumulator;
        this.hasSeed = hasSeed;
        this.seed = seed;
        __super__.call(this);
      }
      ScanObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new ScanObserver(o, this));
      };
      return ScanObservable;
    }(ObservableBase));
    var ScanObserver = (function(__super__) {
      inherits(ScanObserver, __super__);
      function ScanObserver(o, parent) {
        this._o = o;
        this._p = parent;
        this._fn = parent.accumulator;
        this._hs = parent.hasSeed;
        this._s = parent.seed;
        this._ha = false;
        this._a = null;
        this._hv = false;
        this._i = 0;
        __super__.call(this);
      }
      ScanObserver.prototype.next = function(x) {
        !this._hv && (this._hv = true);
        if (this._ha) {
          this._a = tryCatch(this._fn)(this._a, x, this._i, this._p);
        } else {
          this._a = this._hs ? tryCatch(this._fn)(this._s, x, this._i, this._p) : x;
          this._ha = true;
        }
        if (this._a === errorObj) {
          return this._o.onError(this._a.e);
        }
        this._o.onNext(this._a);
        this._i++;
      };
      ScanObserver.prototype.error = function(e) {
        this._o.onError(e);
      };
      ScanObserver.prototype.completed = function() {
        !this._hv && this._hs && this._o.onNext(this._s);
        this._o.onCompleted();
      };
      return ScanObserver;
    }(AbstractObserver));
    observableProto.scan = function() {
      var hasSeed = false,
          seed,
          accumulator = arguments[0];
      if (arguments.length === 2) {
        hasSeed = true;
        seed = arguments[1];
      }
      return new ScanObservable(this, accumulator, hasSeed, seed);
    };
    var SkipLastObservable = (function(__super__) {
      inherits(SkipLastObservable, __super__);
      function SkipLastObservable(source, c) {
        this.source = source;
        this._c = c;
        __super__.call(this);
      }
      SkipLastObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new SkipLastObserver(o, this._c));
      };
      return SkipLastObservable;
    }(ObservableBase));
    var SkipLastObserver = (function(__super__) {
      inherits(SkipLastObserver, __super__);
      function SkipLastObserver(o, c) {
        this._o = o;
        this._c = c;
        this._q = [];
        __super__.call(this);
      }
      SkipLastObserver.prototype.next = function(x) {
        this._q.push(x);
        this._q.length > this._c && this._o.onNext(this._q.shift());
      };
      SkipLastObserver.prototype.error = function(e) {
        this._o.onError(e);
      };
      SkipLastObserver.prototype.completed = function() {
        this._o.onCompleted();
      };
      return SkipLastObserver;
    }(AbstractObserver));
    observableProto.skipLast = function(count) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      return new SkipLastObservable(this, count);
    };
    observableProto.startWith = function() {
      var values,
          scheduler,
          start = 0;
      if (!!arguments.length && isScheduler(arguments[0])) {
        scheduler = arguments[0];
        start = 1;
      } else {
        scheduler = immediateScheduler;
      }
      for (var args = [],
          i = start,
          len = arguments.length; i < len; i++) {
        args.push(arguments[i]);
      }
      return enumerableOf([observableFromArray(args, scheduler), this]).concat();
    };
    var TakeLastObserver = (function(__super__) {
      inherits(TakeLastObserver, __super__);
      function TakeLastObserver(o, c) {
        this._o = o;
        this._c = c;
        this._q = [];
        __super__.call(this);
      }
      TakeLastObserver.prototype.next = function(x) {
        this._q.push(x);
        this._q.length > this._c && this._q.shift();
      };
      TakeLastObserver.prototype.error = function(e) {
        this._o.onError(e);
      };
      TakeLastObserver.prototype.completed = function() {
        while (this._q.length > 0) {
          this._o.onNext(this._q.shift());
        }
        this._o.onCompleted();
      };
      return TakeLastObserver;
    }(AbstractObserver));
    observableProto.takeLast = function(count) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        return source.subscribe(new TakeLastObserver(o, count));
      }, source);
    };
    var TakeLastBufferObserver = (function(__super__) {
      inherits(TakeLastBufferObserver, __super__);
      function TakeLastBufferObserver(o, c) {
        this._o = o;
        this._c = c;
        this._q = [];
        __super__.call(this);
      }
      TakeLastBufferObserver.prototype.next = function(x) {
        this._q.push(x);
        this._q.length > this._c && this._q.shift();
      };
      TakeLastBufferObserver.prototype.error = function(e) {
        this._o.onError(e);
      };
      TakeLastBufferObserver.prototype.completed = function() {
        this._o.onNext(this._q);
        this._o.onCompleted();
      };
      return TakeLastBufferObserver;
    }(AbstractObserver));
    observableProto.takeLastBuffer = function(count) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        return source.subscribe(new TakeLastBufferObserver(o, count));
      }, source);
    };
    observableProto.windowWithCount = function(count, skip) {
      var source = this;
      +count || (count = 0);
      Math.abs(count) === Infinity && (count = 0);
      if (count <= 0) {
        throw new ArgumentOutOfRangeError();
      }
      skip == null && (skip = count);
      +skip || (skip = 0);
      Math.abs(skip) === Infinity && (skip = 0);
      if (skip <= 0) {
        throw new ArgumentOutOfRangeError();
      }
      return new AnonymousObservable(function(observer) {
        var m = new SingleAssignmentDisposable(),
            refCountDisposable = new RefCountDisposable(m),
            n = 0,
            q = [];
        function createWindow() {
          var s = new Subject();
          q.push(s);
          observer.onNext(addRef(s, refCountDisposable));
        }
        createWindow();
        m.setDisposable(source.subscribe(function(x) {
          for (var i = 0,
              len = q.length; i < len; i++) {
            q[i].onNext(x);
          }
          var c = n - count + 1;
          c >= 0 && c % skip === 0 && q.shift().onCompleted();
          ++n % skip === 0 && createWindow();
        }, function(e) {
          while (q.length > 0) {
            q.shift().onError(e);
          }
          observer.onError(e);
        }, function() {
          while (q.length > 0) {
            q.shift().onCompleted();
          }
          observer.onCompleted();
        }));
        return refCountDisposable;
      }, source);
    };
    observableProto.flatMapConcat = observableProto.concatMap = function(selector, resultSelector, thisArg) {
      return new FlatMapObservable(this, selector, resultSelector, thisArg).merge(1);
    };
    observableProto.concatMapObserver = observableProto.selectConcatObserver = function(onNext, onError, onCompleted, thisArg) {
      var source = this,
          onNextFunc = bindCallback(onNext, thisArg, 2),
          onErrorFunc = bindCallback(onError, thisArg, 1),
          onCompletedFunc = bindCallback(onCompleted, thisArg, 0);
      return new AnonymousObservable(function(observer) {
        var index = 0;
        return source.subscribe(function(x) {
          var result;
          try {
            result = onNextFunc(x, index++);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
        }, function(err) {
          var result;
          try {
            result = onErrorFunc(err);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        }, function() {
          var result;
          try {
            result = onCompletedFunc();
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        });
      }, this).concatAll();
    };
    var DefaultIfEmptyObserver = (function(__super__) {
      inherits(DefaultIfEmptyObserver, __super__);
      function DefaultIfEmptyObserver(o, d) {
        this._o = o;
        this._d = d;
        this._f = false;
        __super__.call(this);
      }
      DefaultIfEmptyObserver.prototype.next = function(x) {
        this._f = true;
        this._o.onNext(x);
      };
      DefaultIfEmptyObserver.prototype.error = function(e) {
        this._o.onError(e);
      };
      DefaultIfEmptyObserver.prototype.completed = function() {
        !this._f && this._o.onNext(defaultValue);
        this._o.onCompleted();
      };
      return DefaultIfEmptyObserver;
    }(AbstractObserver));
    observableProto.defaultIfEmpty = function(defaultValue) {
      var source = this;
      defaultValue === undefined && (defaultValue = null);
      return new AnonymousObservable(function(o) {
        return source.subscribe(new DefaultIfEmptyObserver(o, defaultValue));
      }, source);
    };
    function arrayIndexOfComparer(array, item, comparer) {
      for (var i = 0,
          len = array.length; i < len; i++) {
        if (comparer(array[i], item)) {
          return i;
        }
      }
      return -1;
    }
    function HashSet(comparer) {
      this.comparer = comparer;
      this.set = [];
    }
    HashSet.prototype.push = function(value) {
      var retValue = arrayIndexOfComparer(this.set, value, this.comparer) === -1;
      retValue && this.set.push(value);
      return retValue;
    };
    var DistinctObservable = (function(__super__) {
      inherits(DistinctObservable, __super__);
      function DistinctObservable(source, keyFn, cmpFn) {
        this.source = source;
        this._keyFn = keyFn;
        this._cmpFn = cmpFn;
        __super__.call(this);
      }
      DistinctObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new DistinctObserver(o, this._keyFn, this._cmpFn));
      };
      return DistinctObservable;
    }(ObservableBase));
    var DistinctObserver = (function(__super__) {
      inherits(DistinctObserver, __super__);
      function DistinctObserver(o, keyFn, cmpFn) {
        this._o = o;
        this._keyFn = keyFn;
        this._h = new HashSet(cmpFn);
        __super__.call(this);
      }
      DistinctObserver.prototype.next = function(x) {
        var key = x;
        if (isFunction(this._keyFn)) {
          key = tryCatch(this._keyFn)(x);
          if (key === errorObj) {
            return this._o.onError(key.e);
          }
        }
        this._h.push(key) && this._o.onNext(x);
      };
      DistinctObserver.prototype.error = function(e) {
        this._o.onError(e);
      };
      DistinctObserver.prototype.completed = function() {
        this._o.onCompleted();
      };
      return DistinctObserver;
    }(AbstractObserver));
    observableProto.distinct = function(keySelector, comparer) {
      comparer || (comparer = defaultComparer);
      return new DistinctObservable(this, keySelector, comparer);
    };
    var MapObservable = (function(__super__) {
      inherits(MapObservable, __super__);
      function MapObservable(source, selector, thisArg) {
        this.source = source;
        this.selector = bindCallback(selector, thisArg, 3);
        __super__.call(this);
      }
      function innerMap(selector, self) {
        return function(x, i, o) {
          return selector.call(this, self.selector(x, i, o), i, o);
        };
      }
      MapObservable.prototype.internalMap = function(selector, thisArg) {
        return new MapObservable(this.source, innerMap(selector, this), thisArg);
      };
      MapObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new InnerObserver(o, this.selector, this));
      };
      inherits(InnerObserver, AbstractObserver);
      function InnerObserver(o, selector, source) {
        this.o = o;
        this.selector = selector;
        this.source = source;
        this.i = 0;
        AbstractObserver.call(this);
      }
      InnerObserver.prototype.next = function(x) {
        var result = tryCatch(this.selector)(x, this.i++, this.source);
        if (result === errorObj) {
          return this.o.onError(result.e);
        }
        this.o.onNext(result);
      };
      InnerObserver.prototype.error = function(e) {
        this.o.onError(e);
      };
      InnerObserver.prototype.completed = function() {
        this.o.onCompleted();
      };
      return MapObservable;
    }(ObservableBase));
    observableProto.map = observableProto.select = function(selector, thisArg) {
      var selectorFn = typeof selector === 'function' ? selector : function() {
        return selector;
      };
      return this instanceof MapObservable ? this.internalMap(selectorFn, thisArg) : new MapObservable(this, selectorFn, thisArg);
    };
    function plucker(args, len) {
      return function mapper(x) {
        var currentProp = x;
        for (var i = 0; i < len; i++) {
          var p = currentProp[args[i]];
          if (typeof p !== 'undefined') {
            currentProp = p;
          } else {
            return undefined;
          }
        }
        return currentProp;
      };
    }
    observableProto.pluck = function() {
      var len = arguments.length,
          args = new Array(len);
      if (len === 0) {
        throw new Error('List of properties cannot be empty.');
      }
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      return this.map(plucker(args, len));
    };
    observableProto.flatMapObserver = observableProto.selectManyObserver = function(onNext, onError, onCompleted, thisArg) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var index = 0;
        return source.subscribe(function(x) {
          var result;
          try {
            result = onNext.call(thisArg, x, index++);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
        }, function(err) {
          var result;
          try {
            result = onError.call(thisArg, err);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        }, function() {
          var result;
          try {
            result = onCompleted.call(thisArg);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        });
      }, source).mergeAll();
    };
    observableProto.flatMap = observableProto.selectMany = function(selector, resultSelector, thisArg) {
      return new FlatMapObservable(this, selector, resultSelector, thisArg).mergeAll();
    };
    Rx.Observable.prototype.flatMapLatest = function(selector, resultSelector, thisArg) {
      return new FlatMapObservable(this, selector, resultSelector, thisArg).switchLatest();
    };
    var SkipObservable = (function(__super__) {
      inherits(SkipObservable, __super__);
      function SkipObservable(source, count) {
        this.source = source;
        this.skipCount = count;
        __super__.call(this);
      }
      SkipObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new InnerObserver(o, this.skipCount));
      };
      function InnerObserver(o, c) {
        this.c = c;
        this.r = c;
        this.o = o;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (this.isStopped) {
          return;
        }
        if (this.r <= 0) {
          this.o.onNext(x);
        } else {
          this.r--;
        }
      };
      InnerObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onCompleted();
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      };
      return SkipObservable;
    }(ObservableBase));
    observableProto.skip = function(count) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      return new SkipObservable(this, count);
    };
    var SkipWhileObservable = (function(__super__) {
      inherits(SkipWhileObservable, __super__);
      function SkipWhileObservable(source, fn) {
        this.source = source;
        this._fn = fn;
        __super__.call(this);
      }
      SkipWhileObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new SkipWhileObserver(o, this));
      };
      return SkipWhileObservable;
    }(ObservableBase));
    var SkipWhileObserver = (function(__super__) {
      inherits(SkipWhileObserver, __super__);
      function SkipWhileObserver(o, p) {
        this._o = o;
        this._p = p;
        this._i = 0;
        this._r = false;
        __super__.call(this);
      }
      SkipWhileObserver.prototype.next = function(x) {
        if (!this._r) {
          var res = tryCatch(this._p._fn)(x, this._i++, this._p);
          if (res === errorObj) {
            return this._o.onError(res.e);
          }
          this._r = !res;
        }
        this._r && this._o.onNext(x);
      };
      SkipWhileObserver.prototype.error = function(e) {
        this._o.onError(e);
      };
      SkipWhileObserver.prototype.completed = function() {
        this._o.onCompleted();
      };
      return SkipWhileObserver;
    }(AbstractObserver));
    observableProto.skipWhile = function(predicate, thisArg) {
      var fn = bindCallback(predicate, thisArg, 3);
      return new SkipWhileObservable(this, fn);
    };
    var TakeObservable = (function(__super__) {
      inherits(TakeObservable, __super__);
      function TakeObservable(source, count) {
        this.source = source;
        this.takeCount = count;
        __super__.call(this);
      }
      TakeObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new InnerObserver(o, this.takeCount));
      };
      function InnerObserver(o, c) {
        this.o = o;
        this.c = c;
        this.r = c;
        this.isStopped = false;
      }
      InnerObserver.prototype = {
        onNext: function(x) {
          if (this.isStopped) {
            return;
          }
          if (this.r-- > 0) {
            this.o.onNext(x);
            this.r <= 0 && this.o.onCompleted();
          }
        },
        onError: function(err) {
          if (!this.isStopped) {
            this.isStopped = true;
            this.o.onError(err);
          }
        },
        onCompleted: function() {
          if (!this.isStopped) {
            this.isStopped = true;
            this.o.onCompleted();
          }
        },
        dispose: function() {
          this.isStopped = true;
        },
        fail: function(e) {
          if (!this.isStopped) {
            this.isStopped = true;
            this.o.onError(e);
            return true;
          }
          return false;
        }
      };
      return TakeObservable;
    }(ObservableBase));
    observableProto.take = function(count, scheduler) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      if (count === 0) {
        return observableEmpty(scheduler);
      }
      return new TakeObservable(this, count);
    };
    var TakeWhileObservable = (function(__super__) {
      inherits(TakeWhileObservable, __super__);
      function TakeWhileObservable(source, fn) {
        this.source = source;
        this._fn = fn;
        __super__.call(this);
      }
      TakeWhileObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new TakeWhileObserver(o, this));
      };
      return TakeWhileObservable;
    }(ObservableBase));
    var TakeWhileObserver = (function(__super__) {
      inherits(TakeWhileObserver, __super__);
      function TakeWhileObserver(o, p) {
        this._o = o;
        this._p = p;
        this._i = 0;
        this._r = true;
        __super__.call(this);
      }
      TakeWhileObserver.prototype.next = function(x) {
        if (this._r) {
          this._r = tryCatch(this._p._fn)(x, this._i++, this._p);
          if (this._r === errorObj) {
            return this._o.onError(this._r.e);
          }
        }
        if (this._r) {
          this._o.onNext(x);
        } else {
          this._o.onCompleted();
        }
      };
      TakeWhileObserver.prototype.error = function(e) {
        this._o.onError(e);
      };
      TakeWhileObserver.prototype.completed = function() {
        this._o.onCompleted();
      };
      return TakeWhileObserver;
    }(AbstractObserver));
    observableProto.takeWhile = function(predicate, thisArg) {
      var fn = bindCallback(predicate, thisArg, 3);
      return new TakeWhileObservable(this, fn);
    };
    var FilterObservable = (function(__super__) {
      inherits(FilterObservable, __super__);
      function FilterObservable(source, predicate, thisArg) {
        this.source = source;
        this.predicate = bindCallback(predicate, thisArg, 3);
        __super__.call(this);
      }
      FilterObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new InnerObserver(o, this.predicate, this));
      };
      function innerPredicate(predicate, self) {
        return function(x, i, o) {
          return self.predicate(x, i, o) && predicate.call(this, x, i, o);
        };
      }
      FilterObservable.prototype.internalFilter = function(predicate, thisArg) {
        return new FilterObservable(this.source, innerPredicate(predicate, this), thisArg);
      };
      inherits(InnerObserver, AbstractObserver);
      function InnerObserver(o, predicate, source) {
        this.o = o;
        this.predicate = predicate;
        this.source = source;
        this.i = 0;
        AbstractObserver.call(this);
      }
      InnerObserver.prototype.next = function(x) {
        var shouldYield = tryCatch(this.predicate)(x, this.i++, this.source);
        if (shouldYield === errorObj) {
          return this.o.onError(shouldYield.e);
        }
        shouldYield && this.o.onNext(x);
      };
      InnerObserver.prototype.error = function(e) {
        this.o.onError(e);
      };
      InnerObserver.prototype.completed = function() {
        this.o.onCompleted();
      };
      return FilterObservable;
    }(ObservableBase));
    observableProto.filter = observableProto.where = function(predicate, thisArg) {
      return this instanceof FilterObservable ? this.internalFilter(predicate, thisArg) : new FilterObservable(this, predicate, thisArg);
    };
    var TransduceObserver = (function(__super__) {
      inherits(TransduceObserver, __super__);
      function TransduceObserver(o, xform) {
        this._o = o;
        this._xform = xform;
        __super__.call(this);
      }
      TransduceObserver.prototype.next = function(x) {
        var res = tryCatch(this._xform['@@transducer/step']).call(this._xform, this._o, x);
        if (res === errorObj) {
          this._o.onError(res.e);
        }
      };
      TransduceObserver.prototype.error = function(e) {
        this._o.onError(e);
      };
      TransduceObserver.prototype.completed = function() {
        this._xform['@@transducer/result'](this._o);
      };
      return TransduceObserver;
    }(AbstractObserver));
    function transformForObserver(o) {
      return {
        '@@transducer/init': function() {
          return o;
        },
        '@@transducer/step': function(obs, input) {
          return obs.onNext(input);
        },
        '@@transducer/result': function(obs) {
          return obs.onCompleted();
        }
      };
    }
    observableProto.transduce = function(transducer) {
      var source = this;
      return new AnonymousObservable(function(o) {
        var xform = transducer(transformForObserver(o));
        return source.subscribe(new TransduceObserver(o, xform));
      }, source);
    };
    var AnonymousObservable = Rx.AnonymousObservable = (function(__super__) {
      inherits(AnonymousObservable, __super__);
      function fixSubscriber(subscriber) {
        return subscriber && isFunction(subscriber.dispose) ? subscriber : isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
      }
      function setDisposable(s, state) {
        var ado = state[0],
            self = state[1];
        var sub = tryCatch(self.__subscribe).call(self, ado);
        if (sub === errorObj && !ado.fail(errorObj.e)) {
          thrower(errorObj.e);
        }
        ado.setDisposable(fixSubscriber(sub));
      }
      function AnonymousObservable(subscribe, parent) {
        this.source = parent;
        this.__subscribe = subscribe;
        __super__.call(this);
      }
      AnonymousObservable.prototype._subscribe = function(o) {
        var ado = new AutoDetachObserver(o),
            state = [ado, this];
        if (currentThreadScheduler.scheduleRequired()) {
          currentThreadScheduler.schedule(state, setDisposable);
        } else {
          setDisposable(null, state);
        }
        return ado;
      };
      return AnonymousObservable;
    }(Observable));
    var AutoDetachObserver = (function(__super__) {
      inherits(AutoDetachObserver, __super__);
      function AutoDetachObserver(observer) {
        __super__.call(this);
        this.observer = observer;
        this.m = new SingleAssignmentDisposable();
      }
      var AutoDetachObserverPrototype = AutoDetachObserver.prototype;
      AutoDetachObserverPrototype.next = function(value) {
        var result = tryCatch(this.observer.onNext).call(this.observer, value);
        if (result === errorObj) {
          this.dispose();
          thrower(result.e);
        }
      };
      AutoDetachObserverPrototype.error = function(err) {
        var result = tryCatch(this.observer.onError).call(this.observer, err);
        this.dispose();
        result === errorObj && thrower(result.e);
      };
      AutoDetachObserverPrototype.completed = function() {
        var result = tryCatch(this.observer.onCompleted).call(this.observer);
        this.dispose();
        result === errorObj && thrower(result.e);
      };
      AutoDetachObserverPrototype.setDisposable = function(value) {
        this.m.setDisposable(value);
      };
      AutoDetachObserverPrototype.getDisposable = function() {
        return this.m.getDisposable();
      };
      AutoDetachObserverPrototype.dispose = function() {
        __super__.prototype.dispose.call(this);
        this.m.dispose();
      };
      return AutoDetachObserver;
    }(AbstractObserver));
    var InnerSubscription = function(s, o) {
      this._s = s;
      this._o = o;
    };
    InnerSubscription.prototype.dispose = function() {
      if (!this._s.isDisposed && this._o !== null) {
        var idx = this._s.observers.indexOf(this._o);
        this._s.observers.splice(idx, 1);
        this._o = null;
      }
    };
    var Subject = Rx.Subject = (function(__super__) {
      inherits(Subject, __super__);
      function Subject() {
        __super__.call(this);
        this.isDisposed = false;
        this.isStopped = false;
        this.observers = [];
        this.hasError = false;
      }
      addProperties(Subject.prototype, Observer.prototype, {
        _subscribe: function(o) {
          checkDisposed(this);
          if (!this.isStopped) {
            this.observers.push(o);
            return new InnerSubscription(this, o);
          }
          if (this.hasError) {
            o.onError(this.error);
            return disposableEmpty;
          }
          o.onCompleted();
          return disposableEmpty;
        },
        hasObservers: function() {
          return this.observers.length > 0;
        },
        onCompleted: function() {
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onCompleted();
            }
            this.observers.length = 0;
          }
        },
        onError: function(error) {
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            this.error = error;
            this.hasError = true;
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onError(error);
            }
            this.observers.length = 0;
          }
        },
        onNext: function(value) {
          checkDisposed(this);
          if (!this.isStopped) {
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onNext(value);
            }
          }
        },
        dispose: function() {
          this.isDisposed = true;
          this.observers = null;
        }
      });
      Subject.create = function(observer, observable) {
        return new AnonymousSubject(observer, observable);
      };
      return Subject;
    }(Observable));
    var AsyncSubject = Rx.AsyncSubject = (function(__super__) {
      inherits(AsyncSubject, __super__);
      function AsyncSubject() {
        __super__.call(this);
        this.isDisposed = false;
        this.isStopped = false;
        this.hasValue = false;
        this.observers = [];
        this.hasError = false;
      }
      addProperties(AsyncSubject.prototype, Observer, {
        _subscribe: function(o) {
          checkDisposed(this);
          if (!this.isStopped) {
            this.observers.push(o);
            return new InnerSubscription(this, o);
          }
          if (this.hasError) {
            o.onError(this.error);
          } else if (this.hasValue) {
            o.onNext(this.value);
            o.onCompleted();
          } else {
            o.onCompleted();
          }
          return disposableEmpty;
        },
        hasObservers: function() {
          checkDisposed(this);
          return this.observers.length > 0;
        },
        onCompleted: function() {
          var i,
              len;
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            var os = cloneArray(this.observers),
                len = os.length;
            if (this.hasValue) {
              for (i = 0; i < len; i++) {
                var o = os[i];
                o.onNext(this.value);
                o.onCompleted();
              }
            } else {
              for (i = 0; i < len; i++) {
                os[i].onCompleted();
              }
            }
            this.observers.length = 0;
          }
        },
        onError: function(error) {
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            this.hasError = true;
            this.error = error;
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onError(error);
            }
            this.observers.length = 0;
          }
        },
        onNext: function(value) {
          checkDisposed(this);
          if (this.isStopped) {
            return;
          }
          this.value = value;
          this.hasValue = true;
        },
        dispose: function() {
          this.isDisposed = true;
          this.observers = null;
          this.error = null;
          this.value = null;
        }
      });
      return AsyncSubject;
    }(Observable));
    var AnonymousSubject = Rx.AnonymousSubject = (function(__super__) {
      inherits(AnonymousSubject, __super__);
      function AnonymousSubject(observer, observable) {
        this.observer = observer;
        this.observable = observable;
        __super__.call(this);
      }
      addProperties(AnonymousSubject.prototype, Observer.prototype, {
        _subscribe: function(o) {
          return this.observable.subscribe(o);
        },
        onCompleted: function() {
          this.observer.onCompleted();
        },
        onError: function(error) {
          this.observer.onError(error);
        },
        onNext: function(value) {
          this.observer.onNext(value);
        }
      });
      return AnonymousSubject;
    }(Observable));
    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
      root.Rx = Rx;
      define(function() {
        return Rx;
      });
    } else if (freeExports && freeModule) {
      if (moduleExports) {
        (freeModule.exports = Rx).Rx = Rx;
      } else {
        freeExports.Rx = Rx;
      }
    } else {
      root.Rx = Rx;
    }
    var rEndingLine = captureLine();
  }.call(this));
})(require('process'));