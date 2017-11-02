(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/ibc/src/mediasoup-client/lib/CommandQueue.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _events = require('events');

var _Logger = require('./Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _errors = require('./errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = new _Logger2.default('CommandQueue');

var CommandQueue = function (_EventEmitter) {
	(0, _inherits3.default)(CommandQueue, _EventEmitter);

	function CommandQueue() {
		(0, _classCallCheck3.default)(this, CommandQueue);

		var _this = (0, _possibleConstructorReturn3.default)(this, (CommandQueue.__proto__ || (0, _getPrototypeOf2.default)(CommandQueue)).call(this));

		_this.setMaxListeners(Infinity);

		// Closed flag.
		// @type {Boolean}
		_this._closed = false;

		// Busy running a command.
		// @type {Boolean}
		_this._busy = false;

		// Queue for pending commands. Each command is an Object with method,
		// resolve, reject, and other members (depending the case).
		// @type {Array<Object>}
		_this._queue = [];
		return _this;
	}

	(0, _createClass3.default)(CommandQueue, [{
		key: 'close',
		value: function close() {
			this._closed = true;
		}
	}, {
		key: 'push',
		value: function push(method, data) {
			var _this2 = this;

			var command = (0, _extends3.default)({ method: method }, data);

			logger.debug('push() [method:%s]', method);

			return new _promise2.default(function (resolve, reject) {
				var queue = _this2._queue;

				command.resolve = resolve;
				command.reject = reject;

				// Append command to the queue.
				queue.push(command);
				_this2._handlePendingCommands();
			});
		}
	}, {
		key: '_handlePendingCommands',
		value: function _handlePendingCommands() {
			var _this3 = this;

			if (this._busy) return;

			var queue = this._queue;

			// Take the first command.
			var command = queue[0];

			if (!command) return;

			this._busy = true;

			// Execute it.
			this._handleCommand(command).then(function () {
				_this3._busy = false;

				// Remove the first command (the completed one) from the queue.
				queue.shift();

				// And continue.
				_this3._handlePendingCommands();
			});
		}
	}, {
		key: '_handleCommand',
		value: function _handleCommand(command) {
			var _this4 = this;

			logger.debug('_handleCommand() [method:%s]', command.method);

			if (this._closed) {
				command.reject(new _errors.InvalidStateError('closed'));

				return _promise2.default.resolve();
			}

			var promiseHolder = { promise: null };

			this.emit('exec', command, promiseHolder);

			return _promise2.default.resolve().then(function () {
				return promiseHolder.promise;
			}).then(function (result) {
				logger.debug('_handleCommand() | command succeeded [method:%s]', command.method);

				if (_this4._closed) {
					command.reject(new _errors.InvalidStateError('closed'));

					return;
				}

				// Resolve the command with the given result (if any).
				command.resolve(result);
			}).catch(function (error) {
				logger.error('_handleCommand() | command failed [method:%s]: %o', command.method, error);

				// Reject the command with the error.
				command.reject(error);
			});
		}
	}]);
	return CommandQueue;
}(_events.EventEmitter);

exports.default = CommandQueue;

},{"./Logger":"/Users/ibc/src/mediasoup-client/lib/Logger.js","./errors":"/Users/ibc/src/mediasoup-client/lib/errors.js","babel-runtime/core-js/object/get-prototype-of":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/get-prototype-of.js","babel-runtime/core-js/promise":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/promise.js","babel-runtime/helpers/classCallCheck":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/classCallCheck.js","babel-runtime/helpers/createClass":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/createClass.js","babel-runtime/helpers/extends":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/extends.js","babel-runtime/helpers/inherits":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/inherits.js","babel-runtime/helpers/possibleConstructorReturn":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/possibleConstructorReturn.js","events":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/events/events.js"}],"/Users/ibc/src/mediasoup-client/lib/Consumer.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Logger = require('./Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _EnhancedEventEmitter2 = require('./EnhancedEventEmitter');

var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = new _Logger2.default('Consumer');

var Consumer = function (_EnhancedEventEmitter) {
	(0, _inherits3.default)(Consumer, _EnhancedEventEmitter);

	/**
  * @private
  *
  * @emits {originator: String, [appData]: Any} paused
  * @emits {originator: String, [appData]: Any} resumed
  * @emits unhandled
  * @emits {originator: String, [appData]: Any} closed
  *
  * @emits {[appData]: Any} @pause
  * @emits {[appData]: Any} @resume
  * @emits {originator: String} @close
  */
	function Consumer(id, kind, rtpParameters, peer, appData) {
		(0, _classCallCheck3.default)(this, Consumer);

		// Id.
		// @type {Number}
		var _this = (0, _possibleConstructorReturn3.default)(this, (Consumer.__proto__ || (0, _getPrototypeOf2.default)(Consumer)).call(this));

		_this._id = id;

		// Closed flag.
		// @type {Boolean}
		_this._closed = false;

		// Media kind.
		// @type {String}
		_this._kind = kind;

		// RTP parameters.
		// @type {RTCRtpParameters}
		_this._rtpParameters = rtpParameters;

		// Associated Peer.
		// @type {Peer}
		_this._peer = peer;

		// App custom data.
		// @type {Any}
		_this._appData = appData;

		// Whether we can receive this Consumer (based on our RTP capabilities).
		// @type {Boolean}
		_this._supported = false;

		// Whether this Consumer is being handled by a Transport.
		// @type {Boolean}
		_this._handled = false;

		// Remote track.
		// @type {MediaStreamTrack}
		_this._track = null;

		// Locally paused flag.
		// @type {Boolean}
		_this._locallyPaused = false;

		// Remotely paused flag.
		// @type {Boolean}
		_this._remotelyPaused = false;
		return _this;
	}

	/**
  * Class name.
  *
  * @return {String}
  */


	(0, _createClass3.default)(Consumer, [{
		key: 'close',


		/**
   * Closes the Consumer.
   * This is called when the local Room is closed.
   *
   * @private
   */
		value: function close() {
			logger.debug('close()');

			if (this._closed) return;

			this._closed = true;

			this.emit('@close', 'local');
			this.safeEmit('closed', 'local');

			this._destroy();
		}

		/**
   * My remote Consumer was closed.
   * Invoked via remote notification.
   *
   * @private
   *
   * @param {Any} [appData] - App custom data.
   */

	}, {
		key: 'remoteClose',
		value: function remoteClose(appData) {
			logger.debug('remoteClose()');

			if (this._closed) return;

			this._closed = true;

			this.emit('@close', 'remote');
			this.safeEmit('closed', 'remote', appData);

			this._destroy();
		}
	}, {
		key: '_destroy',
		value: function _destroy() {
			this._handled = false;

			try {
				this._track.stop();
			} catch (error) {}

			this._track = null;
		}

		/**
   * Pauses receiving media.
   *
   * @param {Any} [appData] - App custom data.
   *
   * @return {Boolean} true if paused.
   */

	}, {
		key: 'pause',
		value: function pause(appData) {
			logger.debug('pause()');

			if (this._closed) {
				logger.error('pause() | Consumer closed');

				return false;
			} else if (!this._handled) {
				logger.error('pause() | Consumer not handled');

				return false;
			} else if (this._locallyPaused) {
				return true;
			}

			this._locallyPaused = true;
			this._track.enabled = false;

			this.emit('@pause', appData);

			if (!this._remotelyPaused) this.safeEmit('paused', 'local', appData);

			// Return true if really paused.
			return this.paused;
		}

		/**
   * My remote Consumer was paused.
   * Invoked via remote notification.
   *
   * @private
   *
   * @param {Any} [appData] - App custom data.
   */

	}, {
		key: 'remotePause',
		value: function remotePause(appData) {
			logger.debug('remotePause()');

			if (this._closed || this._remotelyPaused) return;

			this._remotelyPaused = true;

			if (this._track) this._track.enabled = false;

			if (!this._locallyPaused) this.safeEmit('paused', 'remote', appData);
		}

		/**
   * Resumes receiving media.
   *
   * @param {Any} [appData] - App custom data.
   *
   * @return {Boolean} true if not paused.
   */

	}, {
		key: 'resume',
		value: function resume(appData) {
			logger.debug('resume()');

			if (this._closed) {
				logger.error('resume() | Consumer closed');

				return false;
			} else if (!this._handled) {
				logger.error('pause() | Consumer not handled');

				return false;
			} else if (!this._locallyPaused) {
				return true;
			}

			this._locallyPaused = false;

			this.emit('@resume', appData);

			if (!this._remotelyPaused) {
				this._track.enabled = true;

				this.safeEmit('resumed', 'local', appData);
			}

			// Return true if not paused.
			return !this.paused;
		}

		/**
   * My remote Consumer was resumed.
   * Invoked via remote notification.
   *
   * @private
   *
   * @param {Any} [appData] - App custom data.
   */

	}, {
		key: 'remoteResume',
		value: function remoteResume(appData) {
			logger.debug('remoteResume()');

			if (this._closed || !this._remotelyPaused) return;

			this._remotelyPaused = false;

			if (!this._locallyPaused) {
				if (this._track) this._track.enabled = false;

				this.safeEmit('resumed', 'remote', appData);
			}
		}

		/**
   * Mark this Consumer as suitable for reception or not.
   *
   * @private
   *
   * @param {Boolean} flag
   */

	}, {
		key: 'setSupported',
		value: function setSupported(flag) {
			this._supported = flag;
		}

		/**
   * Set this Consumer as handled or unhandled by a Transport.
   *
   * @private
   *
   * @param {Boolean|String} flag - If 'tmp' (String) it's considered as termporal.
   * @param {track} MediaStreamTrack
   */

	}, {
		key: 'setHandled',
		value: function setHandled(flag, track) {
			if (this._closed) return;

			var previous = this._handled;

			this._handled = flag;
			this._track = track || null;

			if (track && this.paused) this._track.enabled = false;

			if (flag === false || flag === 'tmp') {
				try {
					this._track.stop();
				} catch (error) {}

				this._track = null;
			}

			if (previous === true && flag === false) this.safeEmit('unhandled');
		}
	}, {
		key: 'klass',
		get: function get() {
			return 'Consumer';
		}

		/**
   * Consumer id.
   *
   * @return {Number}
   */

	}, {
		key: 'id',
		get: function get() {
			return this._id;
		}

		/**
   * Whether the Consumer is closed.
   *
   * @return {Boolean}
   */

	}, {
		key: 'closed',
		get: function get() {
			return this._closed;
		}

		/**
   * Media kind.
   *
   * @return {String}
   */

	}, {
		key: 'kind',
		get: function get() {
			return this._kind;
		}

		/**
   * RTP parameters.
   *
   * @return {RTCRtpParameters}
   */

	}, {
		key: 'rtpParameters',
		get: function get() {
			return this._rtpParameters;
		}

		/**
   * Associated Peer.
   *
   * @return {Peer}
   */

	}, {
		key: 'peer',
		get: function get() {
			return this._peer;
		}

		/**
   * App custom data.
   *
   * @return {Any}
   */

	}, {
		key: 'appData',
		get: function get() {
			return this._appData;
		}

		/**
   * Whether we can receive this Consumer (based on our RTP capabilities).
   *
   * @return {Boolean}
   */

	}, {
		key: 'supported',
		get: function get() {
			return this._supported;
		}

		/**
   * Whether this is being handled by a Transport.
   *
   * @return {Boolean}
   */

	}, {
		key: 'handled',
		get: function get() {
			return Boolean(this._handled);
		}

		/**
   * The associated track (if any yet).
   *
   * @return {MediaStreamTrack|Null}
   */

	}, {
		key: 'track',
		get: function get() {
			return this._track;
		}

		/**
   * Whether the Consumer is locally paused.
   *
   * @return {Boolean}
   */

	}, {
		key: 'locallyPaused',
		get: function get() {
			return this._locallyPaused;
		}

		/**
   * Whether the Consumer is remotely paused.
   *
   * @return {Boolean}
   */

	}, {
		key: 'remotelyPaused',
		get: function get() {
			return this._remotelyPaused;
		}

		/**
   * Whether the Consumer is paused.
   *
   * @return {Boolean}
   */

	}, {
		key: 'paused',
		get: function get() {
			return this._locallyPaused || this._remotelyPaused;
		}

		/**
   * Whether the Consumer is actually receiving media.
   *
   * @return {Boolean}
   */

	}, {
		key: 'active',
		get: function get() {
			return !this._closed && this.handled === true && !this.paused;
		}
	}]);
	return Consumer;
}(_EnhancedEventEmitter3.default);

exports.default = Consumer;

},{"./EnhancedEventEmitter":"/Users/ibc/src/mediasoup-client/lib/EnhancedEventEmitter.js","./Logger":"/Users/ibc/src/mediasoup-client/lib/Logger.js","babel-runtime/core-js/object/get-prototype-of":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/get-prototype-of.js","babel-runtime/helpers/classCallCheck":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/classCallCheck.js","babel-runtime/helpers/createClass":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/createClass.js","babel-runtime/helpers/inherits":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/inherits.js","babel-runtime/helpers/possibleConstructorReturn":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/possibleConstructorReturn.js"}],"/Users/ibc/src/mediasoup-client/lib/Device.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _bowser = require('bowser');

var _bowser2 = _interopRequireDefault(_bowser);

var _Logger = require('./Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _Chrome = require('./handlers/Chrome55');

var _Chrome2 = _interopRequireDefault(_Chrome);

var _Safari = require('./handlers/Safari11');

var _Safari2 = _interopRequireDefault(_Safari);

var _Firefox = require('./handlers/Firefox50');

var _Firefox2 = _interopRequireDefault(_Firefox);

var _Edge = require('./handlers/Edge11');

var _Edge2 = _interopRequireDefault(_Edge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = new _Logger2.default('Device');

/**
 * Class with static members representing the underlying device or browser.
 */

var Device = function () {
	function Device() {
		(0, _classCallCheck3.default)(this, Device);
	}

	(0, _createClass3.default)(Device, null, [{
		key: 'isSupported',


		/**
   * Whether this device is supported.
   *
   * @return {Boolean}
   */
		value: function isSupported() {
			if (!Device._detected) Device._detect();

			return Boolean(Device._handlerClass);
		}

		/**
   * Returns a suitable WebRTC handler class.
   *
   * @type {Class}
   */

	}, {
		key: '_detect',


		/**
   * Detects the current device/browser.
   *
   * @private
   */
		value: function _detect() {
			var ua = global.navigator.userAgent;
			var browser = _bowser2.default._detect(ua);

			Device._detected = true;
			Device._name = browser.name || 'unknown device';
			Device._version = browser.version || 'unknown vesion';
			Device._handlerClass = null;

			// Chrome, Chromium, Opera (desktop and mobile).
			if (_bowser2.default.check({ chrome: '55', chromium: '55', opera: '44' }, true, ua)) {
				Device._handlerClass = _Chrome2.default;
			}
			// Safari (desktop and mobile).
			else if (_bowser2.default.check({ safari: '11' }, true, ua)) {
					Device._handlerClass = _Safari2.default;
				}
				// Firefox (desktop and mobile).
				else if (_bowser2.default.check({ firefox: '50' }, true, ua)) {
						Device._handlerClass = _Firefox2.default;
					}
					// Edge (desktop).
					else if (_bowser2.default.check({ msedge: '11' }, true, ua)) {
							Device._handlerClass = _Edge2.default;
						}

			// TODO: More devices.

			if (Device.isSupported()) {
				logger.debug('device supported [name:%s, version:%s, handler:%s]', Device._name, Device._version, Device._handlerClass.name);
			} else {
				logger.warn('device not supported [name:%s, version:%s]', Device._name, Device._version);
			}
		}
	}, {
		key: 'name',

		/**
   * Get the device name.
   *
   * @return {String}
   */
		get: function get() {
			if (!Device._detected) Device._detect();

			return Device._name;
		}

		/**
   * Get the device version.
   *
   * @return {String}
   */

	}, {
		key: 'version',
		get: function get() {
			if (!Device._detected) Device._detect();

			return Device._version;
		}
	}, {
		key: 'Handler',
		get: function get() {
			if (!Device._detected) Device._detect();

			return Device._handlerClass;
		}
	}]);
	return Device;
}();

// Initialized flag.
// @type {Boolean}


exports.default = Device;
Device._detected = false;

// Device name.
// @type {String}
Device._name = undefined;

// Device version.
// @type {String}
Device._version = undefined;

// WebRTC hander for this device.
// @type {Class}
Device._handlerClass = null;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Logger":"/Users/ibc/src/mediasoup-client/lib/Logger.js","./handlers/Chrome55":"/Users/ibc/src/mediasoup-client/lib/handlers/Chrome55.js","./handlers/Edge11":"/Users/ibc/src/mediasoup-client/lib/handlers/Edge11.js","./handlers/Firefox50":"/Users/ibc/src/mediasoup-client/lib/handlers/Firefox50.js","./handlers/Safari11":"/Users/ibc/src/mediasoup-client/lib/handlers/Safari11.js","babel-runtime/helpers/classCallCheck":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/classCallCheck.js","babel-runtime/helpers/createClass":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/createClass.js","bowser":"/Users/ibc/src/mediasoup-client/node_modules/bowser/src/bowser.js"}],"/Users/ibc/src/mediasoup-client/lib/EnhancedEventEmitter.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _events = require('events');

var _Logger = require('./Logger');

var _Logger2 = _interopRequireDefault(_Logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = new _Logger2.default('EnhancedEventEmitter');

var EnhancedEventEmitter = function (_EventEmitter) {
	(0, _inherits3.default)(EnhancedEventEmitter, _EventEmitter);

	function EnhancedEventEmitter() {
		(0, _classCallCheck3.default)(this, EnhancedEventEmitter);

		var _this = (0, _possibleConstructorReturn3.default)(this, (EnhancedEventEmitter.__proto__ || (0, _getPrototypeOf2.default)(EnhancedEventEmitter)).call(this));

		_this.setMaxListeners(Infinity);
		return _this;
	}

	(0, _createClass3.default)(EnhancedEventEmitter, [{
		key: 'safeEmit',
		value: function safeEmit(event) {
			try {
				for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
					args[_key - 1] = arguments[_key];
				}

				this.emit.apply(this, [event].concat(args));
			} catch (error) {
				logger.error('event listener threw an error [event:%s]: %o', event, error);
			}
		}
	}, {
		key: 'safeEmitAsPromise',
		value: function safeEmitAsPromise() {
			var _this2 = this;

			for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				args[_key2] = arguments[_key2];
			}

			return new _promise2.default(function (resolve, reject) {
				var callback = function callback(result) {
					resolve(result);
				};

				var errback = function errback(error) {
					reject(error);
				};

				_this2.safeEmit.apply(_this2, args.concat([callback, errback]));
			});
		}
	}]);
	return EnhancedEventEmitter;
}(_events.EventEmitter);

exports.default = EnhancedEventEmitter;

},{"./Logger":"/Users/ibc/src/mediasoup-client/lib/Logger.js","babel-runtime/core-js/object/get-prototype-of":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/get-prototype-of.js","babel-runtime/core-js/promise":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/promise.js","babel-runtime/helpers/classCallCheck":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/classCallCheck.js","babel-runtime/helpers/createClass":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/createClass.js","babel-runtime/helpers/inherits":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/inherits.js","babel-runtime/helpers/possibleConstructorReturn":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/possibleConstructorReturn.js","events":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/events/events.js"}],"/Users/ibc/src/mediasoup-client/lib/Logger.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var APP_NAME = 'mediasoup-client';

var Logger = function () {
	function Logger(prefix) {
		(0, _classCallCheck3.default)(this, Logger);

		if (prefix) {
			this._debug = (0, _debug2.default)(APP_NAME + ':' + prefix);
			this._warn = (0, _debug2.default)(APP_NAME + ':WARN:' + prefix);
			this._error = (0, _debug2.default)(APP_NAME + ':ERROR:' + prefix);
		} else {
			this._debug = (0, _debug2.default)(APP_NAME);
			this._warn = (0, _debug2.default)(APP_NAME + ':WARN');
			this._error = (0, _debug2.default)(APP_NAME + ':ERROR');
		}

		/* eslint-disable no-console */
		this._debug.log = console.info.bind(console);
		this._warn.log = console.warn.bind(console);
		this._error.log = console.error.bind(console);
		/* eslint-enable no-console */
	}

	(0, _createClass3.default)(Logger, [{
		key: 'debug',
		get: function get() {
			return this._debug;
		}
	}, {
		key: 'warn',
		get: function get() {
			return this._warn;
		}
	}, {
		key: 'error',
		get: function get() {
			return this._error;
		}
	}]);
	return Logger;
}();

exports.default = Logger;

},{"babel-runtime/helpers/classCallCheck":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/classCallCheck.js","babel-runtime/helpers/createClass":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/createClass.js","debug":"/Users/ibc/src/mediasoup-client/node_modules/debug/src/browser.js"}],"/Users/ibc/src/mediasoup-client/lib/Peer.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Logger = require('./Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _EnhancedEventEmitter2 = require('./EnhancedEventEmitter');

var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = new _Logger2.default('Peer');

var Peer = function (_EnhancedEventEmitter) {
	(0, _inherits3.default)(Peer, _EnhancedEventEmitter);

	/**
  * @private
  *
  * @emits {consumer: Consumer} newconsumer
  * @emits {originator: String, [appData]: Any} closed
  * @emits {originator: String} @close
  */
	function Peer(name, appData) {
		(0, _classCallCheck3.default)(this, Peer);

		// Name.
		// @type {String}
		var _this = (0, _possibleConstructorReturn3.default)(this, (Peer.__proto__ || (0, _getPrototypeOf2.default)(Peer)).call(this));

		_this._name = name;

		// Closed flag.
		// @type {Boolean}
		_this._closed = false;

		// App custom data.
		// @type {Any}
		_this._appData = appData;

		// Map of Consumers indexed by id.
		// @type {map<Number, Consumer>}
		_this._consumers = new _map2.default();
		return _this;
	}

	/**
  * Peer name.
  *
  * @return {String}
  */


	(0, _createClass3.default)(Peer, [{
		key: 'close',


		/**
   * Closes the Peer.
   * This is called when the local Room is closed.
   *
   * @private
   */
		value: function close() {
			logger.debug('close()');

			if (this._closed) return;

			this._closed = true;

			this.emit('@close', 'local');
			this.safeEmit('closed', 'local');

			// Close all the Consumers.
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = (0, _getIterator3.default)(this._consumers.values()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var consumer = _step.value;

					consumer.close();
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}

		/**
   * The remote Peer or Room was closed.
   * Invoked via remote notification.
   *
   * @private
   *
   * @param {Any} [appData] - App custom data.
   */

	}, {
		key: 'remoteClose',
		value: function remoteClose(appData) {
			logger.debug('remoteClose()');

			if (this._closed) return;

			this._closed = true;

			this.emit('@close', 'remote');
			this.safeEmit('closed', 'remote', appData);

			// Close all the Consumers.
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = (0, _getIterator3.default)(this._consumers.values()), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var consumer = _step2.value;

					consumer.remoteClose();
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}
		}

		/**
   * Get the Consumer with the given id.
   *
   * @param {Number} id
   *
   * @return {Consumer}
   */

	}, {
		key: 'getConsumerById',
		value: function getConsumerById(id) {
			return this._consumers.get(id);
		}

		/**
   * Add an associated Consumer.
   *
   * @private
   *
   * @param {Consumer} consumer
   */

	}, {
		key: 'addConsumer',
		value: function addConsumer(consumer) {
			var _this2 = this;

			if (this._consumers.has(consumer.id)) throw new Error('Consumer already exists [id:' + consumer.id + ']');

			// Store it.
			this._consumers.set(consumer.id, consumer);

			// Handle it.
			consumer.on('@close', function () {
				_this2._consumers.delete(consumer.id);
			});

			// Emit event.
			this.safeEmit('newconsumer', consumer);
		}
	}, {
		key: 'name',
		get: function get() {
			return this._name;
		}

		/**
   * Whether the Peer is closed.
   *
   * @return {Boolean}
   */

	}, {
		key: 'closed',
		get: function get() {
			return this._closed;
		}

		/**
   * App custom data.
   *
   * @return {Any}
   */

	}, {
		key: 'appData',
		get: function get() {
			return this._appData;
		}

		/**
   * The list of Consumers.
   *
   * @return {Array<Consumer>}
   */

	}, {
		key: 'consumers',
		get: function get() {
			return (0, _from2.default)(this._consumers.values());
		}
	}]);
	return Peer;
}(_EnhancedEventEmitter3.default);

exports.default = Peer;

},{"./EnhancedEventEmitter":"/Users/ibc/src/mediasoup-client/lib/EnhancedEventEmitter.js","./Logger":"/Users/ibc/src/mediasoup-client/lib/Logger.js","babel-runtime/core-js/array/from":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/array/from.js","babel-runtime/core-js/get-iterator":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/get-iterator.js","babel-runtime/core-js/map":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/map.js","babel-runtime/core-js/object/get-prototype-of":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/get-prototype-of.js","babel-runtime/helpers/classCallCheck":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/classCallCheck.js","babel-runtime/helpers/createClass":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/createClass.js","babel-runtime/helpers/inherits":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/inherits.js","babel-runtime/helpers/possibleConstructorReturn":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/possibleConstructorReturn.js"}],"/Users/ibc/src/mediasoup-client/lib/Producer.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Logger = require('./Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _EnhancedEventEmitter2 = require('./EnhancedEventEmitter');

var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = new _Logger2.default('Producer');

var Producer = function (_EnhancedEventEmitter) {
	(0, _inherits3.default)(Producer, _EnhancedEventEmitter);

	/**
  * @private
  *
  * @emits {originator: String, [appData]: Any} paused
  * @emits {originator: String, [appData]: Any} resumed
  * @emits unhandled
  * @emits {originator: String, [appData]: Any} closed
  *
  * @emits {[appData]: Any} @pause
  * @emits {[appData]: Any} @resume
  * @emits {originator: String, [appData]: Any} @close
  *
  */
	function Producer(track, appData) {
		(0, _classCallCheck3.default)(this, Producer);

		// Id.
		// @type {Number}
		var _this = (0, _possibleConstructorReturn3.default)(this, (Producer.__proto__ || (0, _getPrototypeOf2.default)(Producer)).call(this));

		_this._id = utils.randomNumber();

		// Closed flag.
		// @type {Boolean}
		_this._closed = false;

		// Original track.
		// @type {MediaStreamTrack}
		_this._originalTrack = track;

		// Track cloned from the original one.
		// @type {MediaStreamTrack}
		_this._track = track.clone();

		// App custom data.
		// @type {Any}
		_this._appData = appData;

		// Whether this Producer is being handled by a Transport.
		// @type {Boolean}
		_this._handled = false;

		// RTP parameters.
		// @type {RTCRtpParameters}
		_this._rtpParameters = null;

		// Locally paused flag.
		// @type {Boolean}
		_this._locallyPaused = !_this._track.enabled;

		// Remotely paused flag.
		// @type {Boolean}
		_this._remotelyPaused = false;
		return _this;
	}

	/**
  * Class name.
  *
  * @return {String}
  */


	(0, _createClass3.default)(Producer, [{
		key: 'close',


		/**
   * Closes the Producer.
   *
   * @param {Any} [appData] - App custom data.
   */
		value: function close(appData) {
			logger.debug('close()');

			if (this._closed) return;

			this._closed = true;

			this.emit('@close', 'local', appData);
			this.safeEmit('closed', 'local', appData);

			this._destroy();
		}

		/**
   * My remote Producer was closed.
   * Invoked via remote notification.
   *
   * @private
   *
   * @param {Any} [appData] - App custom data.
   */

	}, {
		key: 'remoteClose',
		value: function remoteClose(appData) {
			logger.debug('remoteClose()');

			if (this._closed) return;

			this._closed = true;

			this.emit('@close', 'remote', appData);
			this.safeEmit('closed', 'remote', appData);

			this._destroy();
		}
	}, {
		key: '_destroy',
		value: function _destroy() {
			this._closed = true;
			this._handled = false;
			this._rtpParameters = null;

			try {
				this._track.stop();
			} catch (error) {}
		}

		/**
   * Pauses sending media.
   *
   * @param {Any} [appData] - App custom data.
   *
   * @return {Boolean} true if paused.
   */

	}, {
		key: 'pause',
		value: function pause(appData) {
			logger.debug('pause()');

			if (this._closed) {
				logger.error('pause() | Producer closed');

				return false;
			} else if (!this._handled) {
				logger.error('pause() | Producer not handled');

				return false;
			} else if (this._locallyPaused) {
				return true;
			}

			this._locallyPaused = true;
			this._track.enabled = false;

			this.emit('@pause', appData);

			if (!this._remotelyPaused) this.safeEmit('paused', 'local', appData);

			// Return true if really paused.
			return this.paused;
		}

		/**
   * My remote Producer was paused.
   * Invoked via remote notification.
   *
   * @private
   *
   * @param {Any} [appData] - App custom data.
   */

	}, {
		key: 'remotePause',
		value: function remotePause(appData) {
			logger.debug('remotePause()');

			if (this._closed || !this._handled || this._remotelyPaused) return;

			this._remotelyPaused = true;
			this._track.enabled = false;

			if (!this._locallyPaused) this.safeEmit('paused', 'remote', appData);
		}

		/**
   * Resumes sending media.
   *
   * @param {Any} [appData] - App custom data.
   *
   * @return {Boolean} true if not paused.
   */

	}, {
		key: 'resume',
		value: function resume(appData) {
			logger.debug('resume()');

			if (this._closed) {
				logger.error('resume() | Producer closed');

				return false;
			} else if (!this._handled) {
				logger.error('pause() | Producer not handled');

				return false;
			} else if (!this._locallyPaused) {
				return true;
			}

			this._locallyPaused = false;

			this.emit('@resume', appData);

			if (!this._remotelyPaused) {
				this._track.enabled = true;

				this.safeEmit('resumed', 'local', appData);
			}

			// Return true if not paused.
			return !this.paused;
		}

		/**
   * My remote Producer was resumed.
   * Invoked via remote notification.
   *
   * @private
   *
   * @param {Any} [appData] - App custom data.
   */

	}, {
		key: 'remoteResume',
		value: function remoteResume(appData) {
			logger.debug('remoteResume()');

			if (this._closed || !this._handled || !this._remotelyPaused) return;

			this._remotelyPaused = false;

			if (!this._locallyPaused) {
				this._track.enabled = true;

				this.safeEmit('resumed', 'remote', appData);
			}
		}

		/**
   * Set this Producer as handled or unhandled by a Transport.
   *
   * @private
   *
   * @param {Boolean|String} flag - If 'tmp' (String) it's considered as termporal.
   * @param {RTCRtpParameters} rtpParameters
   */

	}, {
		key: 'setHandled',
		value: function setHandled(flag, rtpParameters) {
			if (this._closed) return;

			var previous = this._handled;

			this._handled = flag;
			this._rtpParameters = rtpParameters;

			if (flag === false || flag === 'tmp') this._rtpParameters = null;

			if (previous === true && flag === false) this.safeEmit('unhandled');
		}
	}, {
		key: 'klass',
		get: function get() {
			return 'Producer';
		}

		/**
   * Producer id.
   *
   * @return {Number}
   */

	}, {
		key: 'id',
		get: function get() {
			return this._id;
		}

		/**
   * Whether the Producer is closed.
   *
   * @return {Boolean}
   */

	}, {
		key: 'closed',
		get: function get() {
			return this._closed;
		}

		/**
   * Media kind.
   *
   * @return {String}
   */

	}, {
		key: 'kind',
		get: function get() {
			return this._track.kind;
		}

		/**
   * The associated track.
   *
   * @return {MediaStreamTrack}
   */

	}, {
		key: 'track',
		get: function get() {
			return this._track;
		}

		/**
   * The associated original track.
   *
   * @return {MediaStreamTrack}
   */

	}, {
		key: 'originalTrack',
		get: function get() {
			return this._originalTrack;
		}

		/**
   * App custom data.
   *
   * @return {Any}
   */

	}, {
		key: 'appData',
		get: function get() {
			return this._appData;
		}

		/**
   * Whether this is being handled by a Transport.
   *
   * @return {Boolean}
   */

	}, {
		key: 'handled',
		get: function get() {
			return Boolean(this._handled);
		}

		/**
   * RTP parameters.
   *
   * @return {RTCRtpParameters}
   */

	}, {
		key: 'rtpParameters',
		get: function get() {
			return this._rtpParameters;
		}

		/**
   * Whether the Producer is locally paused.
   *
   * @return {Boolean}
   */

	}, {
		key: 'locallyPaused',
		get: function get() {
			return this._locallyPaused;
		}

		/**
   * Whether the Producer is remotely paused.
   *
   * @return {Boolean}
   */

	}, {
		key: 'remotelyPaused',
		get: function get() {
			return this._remotelyPaused;
		}

		/**
   * Whether the Producer is paused.
   *
   * @return {Boolean}
   */

	}, {
		key: 'paused',
		get: function get() {
			return this._locallyPaused || this._remotelyPaused;
		}

		/**
   * Whether the Producer is actually sending media.
   *
   * @return {Boolean}
   */

	}, {
		key: 'active',
		get: function get() {
			return !this._closed && this.handled === true && !this.paused;
		}
	}]);
	return Producer;
}(_EnhancedEventEmitter3.default);

exports.default = Producer;

},{"./EnhancedEventEmitter":"/Users/ibc/src/mediasoup-client/lib/EnhancedEventEmitter.js","./Logger":"/Users/ibc/src/mediasoup-client/lib/Logger.js","./utils":"/Users/ibc/src/mediasoup-client/lib/utils.js","babel-runtime/core-js/object/get-prototype-of":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/get-prototype-of.js","babel-runtime/helpers/classCallCheck":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/classCallCheck.js","babel-runtime/helpers/createClass":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/createClass.js","babel-runtime/helpers/inherits":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/inherits.js","babel-runtime/helpers/possibleConstructorReturn":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/possibleConstructorReturn.js"}],"/Users/ibc/src/mediasoup-client/lib/Room.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Logger = require('./Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _EnhancedEventEmitter2 = require('./EnhancedEventEmitter');

var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);

var _errors = require('./errors');

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var _Device = require('./Device');

var _Device2 = _interopRequireDefault(_Device);

var _Transport = require('./Transport');

var _Transport2 = _interopRequireDefault(_Transport);

var _Producer = require('./Producer');

var _Producer2 = _interopRequireDefault(_Producer);

var _Peer = require('./Peer');

var _Peer2 = _interopRequireDefault(_Peer);

var _Consumer = require('./Consumer');

var _Consumer2 = _interopRequireDefault(_Consumer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = new _Logger2.default('Room');

var RoomState = {
	new: 'new',
	joining: 'joining',
	joined: 'joined',
	closed: 'closed'
};

/**
 * An instance of Room represents a remote multi conference and a local
 * peer that joins it.
 */

var Room = function (_EnhancedEventEmitter) {
	(0, _inherits3.default)(Room, _EnhancedEventEmitter);

	/**
  * Room class.
  *
  * @param {Object} [options]
  * @param {Number} [options.requestTimeout=10000] - Timeout for sent requests
  * (in milliseconds). Defaults to 10000 (10 seconds).
  * @param {Object} [options.transportOptions] - Transport options for mediasoup.
  * @param {Array<RTCIceServer>} [options.turnServers] - Array of TURN servers.
  * @param {Boolean} [hidden=false] - If true no remote Peers will be notified.
  *
  * @throws {Error} if device is not supported.
  *
  * @emits {request: Object, callback: Function, errback: Function} request
  * @emits {notification: Object} notify
  * @emits {peer: Peer} newpeer
  * @emits {originator: String, [appData]: Any} closed
  */
	function Room(options) {
		(0, _classCallCheck3.default)(this, Room);

		logger.debug('constructor() [options:%o]', options);

		var _this = (0, _possibleConstructorReturn3.default)(this, (Room.__proto__ || (0, _getPrototypeOf2.default)(Room)).call(this));

		if (!_Device2.default.isSupported()) throw new Error('current browser/device not supported');

		options = options || {};

		// Computed settings.
		// @type {Object}
		_this._settings = {
			requestTimeout: options.requestTimeout || 10000,
			transportOptions: options.transportOptions || {},
			turnServers: options.turnServers || [],
			hidden: Boolean(options.hidden)
		};

		// Room state.
		// @type {Boolean}
		_this._state = RoomState.new;

		// Map of Transports indexed by id.
		// @type {map<Number, Transport>}
		_this._transports = new _map2.default();

		// Map of Producers indexed by id.
		// @type {map<Number, Producer>}
		_this._producers = new _map2.default();

		// Map of Peers indexed by name.
		// @type {map<String, Peer>}
		_this._peers = new _map2.default();

		// Extended RTP capabilities.
		// @type {Object}
		_this._extendedRtpCapabilities = null;

		// Whether we can send audio/video based on computed extended RTP
		// capabilities.
		// @type {Object}
		_this._canSendByKind = {
			audio: false,
			video: false
		};
		return _this;
	}

	/**
  * Whether the Room is joined.
  *
  * @return {Boolean}
  */


	(0, _createClass3.default)(Room, [{
		key: 'join',


		/**
   * Start the procedures to join a remote room.
   *
   * @param {RTCRtpCapabilities} [roomRtpCapabilities] Remote room RTP capabilities.
   * If given, no request is sent to the server to discover them.
   * @param {Any} [appData] - App custom data.
   * @return {Promise}
   */
		value: function join(roomRtpCapabilities, appData) {
			var _this2 = this;

			if (!roomRtpCapabilities) logger.debug('join()');else logger.debug('join() [roomRtpCapabilities:%o]', roomRtpCapabilities);

			if (this._state !== RoomState.new) {
				return _promise2.default.reject(new _errors.InvalidStateError('invalid state "' + this._state + '"'));
			}

			this._state = RoomState.joining;

			var remoteRtpCapabilities = void 0;
			var localRtpCapabilities = void 0;

			return _promise2.default.resolve().then(function () {
				if (roomRtpCapabilities) return roomRtpCapabilities;

				return _this2._sendRequest('queryRoom').then(function (response) {
					var rtpCapabilities = response.rtpCapabilities;


					logger.debug('join() | got Room RTP capabilities:%o', rtpCapabilities);

					return rtpCapabilities;
				});
			}).then(function (rtpCapabilities) {
				remoteRtpCapabilities = rtpCapabilities;

				return _Device2.default.Handler.getLocalRtpCapabilities();
			}).then(function (rtpCapabilities) {
				localRtpCapabilities = rtpCapabilities;

				// Get extended RTP capabilities.
				_this2._extendedRtpCapabilities = utils.getExtendedRtpCapabilities(localRtpCapabilities, remoteRtpCapabilities);

				// Check whether we can send audio/video.
				_this2._canSendByKind.audio = utils.canSend('audio', _this2._extendedRtpCapabilities);
				_this2._canSendByKind.video = utils.canSend('video', _this2._extendedRtpCapabilities);

				// Generate our effective RTP capabilities for receiving media.
				var effectiveLocalRtpCapabilities = utils.getRtpCapabilities(_this2._extendedRtpCapabilities);

				logger.debug('join() | effective local RTP capabilities:%o', effectiveLocalRtpCapabilities);

				var data = {
					rtpCapabilities: effectiveLocalRtpCapabilities,
					appData: appData
				};

				return _this2._sendRequest('joinRoom', data).then(function (response) {
					return response.peers;
				});
			}).then(function (peers) {
				if (!_this2._settings.hidden) {
					// Handle Peers already existing in the room.
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = (0, _getIterator3.default)(peers || []), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var peerData = _step.value;

							try {
								_this2._handlePeerData(peerData);
							} catch (error) {
								logger.error('join() | error handling Peer:%o', error);
							}
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}
				} else if (peers.length > 0) {
					logger.error('join() | should not receive Peer list in hidden mode');
				}

				_this2._state = RoomState.joined;

				logger.debug('join() | joined the Room');

				// Return the list of already existing Peers.
				return _this2.peers;
			}).catch(function (error) {
				_this2._state = RoomState.new;

				throw error;
			});
		}

		/**
   * Leave the Room.
   *
   * @param {Any} [appData] - App custom data.
   */

	}, {
		key: 'leave',
		value: function leave(appData) {
			logger.debug('leave()');

			if (this.closed) return;

			// Send a notification.
			this._sendNotification('leaveRoom', { appData: appData });

			// Set closed state after sending the notification (otherwise the
			// notification won't be sent).
			this._state = RoomState.closed;

			this.safeEmit('closed', 'local', appData);

			// Close all the Transports.
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = (0, _getIterator3.default)(this._transports.values()), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var transport = _step2.value;

					transport.close();
				}

				// Close all the Producers.
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = (0, _getIterator3.default)(this._producers.values()), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var producer = _step3.value;

					producer.close();
				}

				// Close all the Peers.
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}

			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = (0, _getIterator3.default)(this._peers.values()), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var peer = _step4.value;

					peer.close();
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4.return) {
						_iterator4.return();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}
		}

		/**
   * The remote Room was closed or our remote Peer has been closed.
   * Invoked via remote notification.
   *
   * @private
   * @param {Any} [appData] - App custom data.
   */

	}, {
		key: 'remoteClose',
		value: function remoteClose(appData) {
			logger.debug('remoteClose()');

			if (this.closed) return;

			this._state = RoomState.closed;

			this.safeEmit('closed', 'remote', appData);

			// Close all the Transports.
			var _iteratorNormalCompletion5 = true;
			var _didIteratorError5 = false;
			var _iteratorError5 = undefined;

			try {
				for (var _iterator5 = (0, _getIterator3.default)(this._transports.values()), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
					var transport = _step5.value;

					transport.remoteClose();
				}

				// Close all the Producers.
			} catch (err) {
				_didIteratorError5 = true;
				_iteratorError5 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion5 && _iterator5.return) {
						_iterator5.return();
					}
				} finally {
					if (_didIteratorError5) {
						throw _iteratorError5;
					}
				}
			}

			var _iteratorNormalCompletion6 = true;
			var _didIteratorError6 = false;
			var _iteratorError6 = undefined;

			try {
				for (var _iterator6 = (0, _getIterator3.default)(this._producers.values()), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
					var producer = _step6.value;

					producer.remoteClose();
				}

				// Close all the Peers.
			} catch (err) {
				_didIteratorError6 = true;
				_iteratorError6 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion6 && _iterator6.return) {
						_iterator6.return();
					}
				} finally {
					if (_didIteratorError6) {
						throw _iteratorError6;
					}
				}
			}

			var _iteratorNormalCompletion7 = true;
			var _didIteratorError7 = false;
			var _iteratorError7 = undefined;

			try {
				for (var _iterator7 = (0, _getIterator3.default)(this._peers.values()), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
					var peer = _step7.value;

					peer.remoteClose();
				}
			} catch (err) {
				_didIteratorError7 = true;
				_iteratorError7 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion7 && _iterator7.return) {
						_iterator7.return();
					}
				} finally {
					if (_didIteratorError7) {
						throw _iteratorError7;
					}
				}
			}
		}

		/**
   * Whether we can send audio/video.
   *
   * @param {String} kind - 'audio' or 'video'.
   *
   * @return {Boolean}
   */

	}, {
		key: 'canSend',
		value: function canSend(kind) {
			if (!this.joined) throw new _errors.InvalidStateError('invalid state "' + this._state + '"');else if (kind !== 'audio' && kind !== 'video') throw new TypeError('invalid kind "' + kind + '"');

			return this._canSendByKind[kind];
		}

		/**
   * Creates a Transport.
   *
   * @param {String} direction - Must be 'send' or 'recv'.
   * @param {Any} [appData] - App custom data.
   *
   * @return {Transport}
   *
   * @throws {InvalidStateError} if not joined.
   * @throws {TypeError} if wrong arguments.
   */

	}, {
		key: 'createTransport',
		value: function createTransport(direction, appData) {
			var _this3 = this;

			logger.debug('createTransport() [direction:%s]', direction);

			if (!this.joined) throw new _errors.InvalidStateError('invalid state "' + this._state + '"');else if (direction !== 'send' && direction !== 'recv') throw new TypeError('invalid direction "' + direction + '"');

			// Create a new Transport.
			var transport = new _Transport2.default(direction, this._extendedRtpCapabilities, this._settings, appData);

			// Store it.
			this._transports.set(transport.id, transport);

			transport.on('@request', function (method, data, callback, errback) {
				_this3._sendRequest(method, data).then(callback || function () {}).catch(errback || function () {});
			});

			transport.on('@notify', function (method, data) {
				_this3._sendNotification(method, data);
			});

			transport.on('@close', function () {
				_this3._transports.delete(transport.id);
			});

			return transport;
		}

		/**
   * Creates a Producer.
   *
   * @param {MediaStreamTrack} track
   * @param {Any} [appData] - App custom data.
   *
   * @return {Producer}
   *
   * @throws {InvalidStateError} if not joined.
   * @throws {TypeError} if wrong arguments.
   * @throws {Error} if cannot send the given kind.
   */

	}, {
		key: 'createProducer',
		value: function createProducer(track, appData) {
			var _this4 = this;

			logger.debug('createProducer() [track:%o]', track);

			if (!this.joined) throw new _errors.InvalidStateError('invalid state "' + this._state + '"');else if (!(track instanceof MediaStreamTrack)) throw new TypeError('track is not a MediaStreamTrack');else if (!this._canSendByKind[track.kind]) throw new Error('cannot send ' + track.kind);else if (track.readyState === 'ended') throw new Error('track.readyState is "ended"');

			// Create a new Producer.
			var producer = new _Producer2.default(track, appData);

			// Store it.
			this._producers.set(producer.id, producer);

			producer.on('@close', function () {
				_this4._producers.delete(producer.id);
			});

			return producer;
		}

		/**
   * Get the Transport with the given id.
   *
   * @param {Number} id
   *
   * @return {Transport}
   */

	}, {
		key: 'getTransportById',
		value: function getTransportById(id) {
			return this._transports.get(id);
		}

		/**
   * Get the Producer with the given id.
   *
   * @param {Number} id
   *
   * @return {Producer}
   */

	}, {
		key: 'getProducerById',
		value: function getProducerById(id) {
			return this._producers.get(id);
		}

		/**
   * Get the Peer with the given name.
   *
   * @param {String} name
   *
   * @return {Peer}
   */

	}, {
		key: 'getPeerById',
		value: function getPeerById(name) {
			return this._peers.get(name);
		}

		/**
   * Provide the local Room with a notification generated by mediasoup server.
   *
   * @param {Object} notification
   */

	}, {
		key: 'receiveNotification',
		value: function receiveNotification(notification) {
			try {
				if (this.closed) throw new _errors.InvalidStateError('Room closed');else if ((typeof notification === 'undefined' ? 'undefined' : (0, _typeof3.default)(notification)) !== 'object') throw new TypeError('wrong notification Object');else if (notification.notification !== true) throw new TypeError('not a notification');else if (typeof notification.method !== 'string') throw new TypeError('wrong/missing notification method');

				var method = notification.method;

				logger.debug('receiveNotification() [method:%s, notification:%o]', method, notification);

				switch (method) {
					case 'roomClosed':
						{
							var appData = notification.appData;


							this.remoteClose(appData);

							break;
						}

					case 'transportClosed':
						{
							var id = notification.id,
							    _appData = notification.appData;

							var transport = this._transports.get(id);

							if (!transport) throw new Error('Transport does not exist [id:"' + id + '"]');

							transport.remoteClose(_appData);

							break;
						}

					case 'newPeer':
						{
							this._ensureNotHidden();

							var name = notification.name;


							if (this._peers.has(name)) throw new Error('Peer already exists [name:"' + name + '"]');

							var peerData = notification;

							this._handlePeerData(peerData);

							break;
						}

					case 'peerClosed':
						{
							this._ensureNotHidden();

							var peerName = notification.name;
							var _appData2 = notification.appData;

							var peer = this._peers.get(peerName);

							if (!peer) throw new Error('no Peer found [name:"' + peerName + '"]');

							peer.remoteClose(_appData2);

							break;
						}

					case 'producerClosed':
						{
							var _id = notification.id,
							    _appData3 = notification.appData;

							var producer = this._producers.get(_id);

							if (!producer) throw new Error('Producer not found [id:' + _id + ']');

							producer.remoteClose(_appData3);

							break;
						}

					case 'producerPaused':
						{
							var _id2 = notification.id,
							    _appData4 = notification.appData;

							var _producer = this._producers.get(_id2);

							if (!_producer) throw new Error('Producer not found [id:' + _id2 + ']');

							_producer.remotePause(_appData4);

							break;
						}

					case 'producerResumed':
						{
							var _id3 = notification.id,
							    _appData5 = notification.appData;

							var _producer2 = this._producers.get(_id3);

							if (!_producer2) throw new Error('Producer not found [id:' + _id3 + ']');

							_producer2.remoteResume(_appData5);

							break;
						}

					case 'newConsumer':
						{
							this._ensureNotHidden();

							var _peerName = notification.peerName;

							var _peer = this._peers.get(_peerName);

							if (!_peer) throw new Error('no Peer found [name:"' + _peerName + '"]');

							var consumerData = notification;

							this._handleConsumerData(consumerData, _peer);

							break;
						}

					case 'consumerClosed':
						{
							this._ensureNotHidden();

							var _id4 = notification.id,
							    _peerName2 = notification.peerName,
							    _appData6 = notification.appData;

							var _peer2 = this._peers.get(_peerName2);

							if (!_peer2) throw new Error('no Peer found [name:"' + _peerName2 + '"]');

							var consumer = _peer2.getConsumerById(_id4);

							if (!consumer) throw new Error('Consumer not found [id:' + _id4 + ']');

							consumer.remoteClose(_appData6);

							break;
						}

					case 'consumerPaused':
						{
							this._ensureNotHidden();

							var _id5 = notification.id,
							    _peerName3 = notification.peerName,
							    _appData7 = notification.appData;

							var _peer3 = this._peers.get(_peerName3);

							if (!_peer3) throw new Error('no Peer found [name:"' + _peerName3 + '"]');

							var _consumer = _peer3.getConsumerById(_id5);

							if (!_consumer) throw new Error('Consumer not found [id:' + _id5 + ']');

							_consumer.remotePause(_appData7);

							break;
						}

					case 'consumerResumed':
						{
							this._ensureNotHidden();

							var _id6 = notification.id,
							    _peerName4 = notification.peerName,
							    _appData8 = notification.appData;

							var _peer4 = this._peers.get(_peerName4);

							var _consumer2 = _peer4.getConsumerById(_id6);

							if (!_consumer2) throw new Error('Consumer not found [id:' + _id6 + ']');

							_consumer2.remoteResume(_appData8);

							break;
						}

					default:
						throw new Error('unknown notification method "' + method + '"');
				}
			} catch (error) {
				logger.error('receiveNotification() failed [notification:%o]: %s', notification, error.toString());
			}
		}
	}, {
		key: '_sendRequest',
		value: function _sendRequest(method, data) {
			var _this5 = this;

			var request = (0, _extends3.default)({ method: method }, data);

			// Should never happen.
			// Ignore if closed.
			if (this.closed) {
				logger.error('_sendRequest() | Room closed [method:%s, request:%o]', method, request);

				return _promise2.default.reject(new _errors.InvalidStateError('Room closed'));
			}

			logger.debug('_sendRequest() [method:%s, request:%o]', method, request);

			return new _promise2.default(function (resolve, reject) {
				var done = false;

				var timer = setTimeout(function () {
					logger.error('request failed [method:%s]: timeout', method);

					done = true;
					reject(new _errors.TimeoutError('timeout'));
				}, _this5._settings.requestTimeout);

				// TODO: We could also handle room 'closed' event here.

				var callback = function callback(response) {
					if (done) return;

					done = true;
					clearTimeout(timer);

					if (_this5.closed) {
						logger.error('request failed [method:%s]: Room closed', method);

						reject(new Error('Room closed'));

						return;
					}

					logger.debug('request succeeded [method:%s, response:%o]', method, response);

					resolve(response);
				};

				var errback = function errback(message) {
					if (done) return;

					done = true;
					clearTimeout(timer);

					if (_this5.closed) {
						logger.error('request failed [method:%s]: Room closed', method);

						reject(new Error('Room closed'));

						return;
					}

					// Make sure message is a String.
					message = String(message);

					logger.error('request failed [method:%s]: %s', method, message);

					reject(new Error(message));
				};

				_this5.safeEmit('request', request, callback, errback);
			});
		}
	}, {
		key: '_sendNotification',
		value: function _sendNotification(method, data) {
			// Ignore if closed.
			if (this.closed) return;

			var notification = (0, _extends3.default)({ method: method, notification: true }, data);

			logger.debug('_sendNotification() [method:%s, notification:%o]', method, notification);

			this.safeEmit('notify', notification);
		}
	}, {
		key: '_ensureNotHidden',
		value: function _ensureNotHidden() {
			if (this._settings.hidden) throw new Error('hidden mode set');
		}
	}, {
		key: '_handlePeerData',
		value: function _handlePeerData(peerData) {
			var _this6 = this;

			var name = peerData.name,
			    consumers = peerData.consumers,
			    appData = peerData.appData;

			var peer = new _Peer2.default(name, appData);

			// Store it.
			this._peers.set(peer.name, peer);

			peer.on('@close', function () {
				_this6._peers.delete(peer.name);
			});

			// Add consumers.
			var _iteratorNormalCompletion8 = true;
			var _didIteratorError8 = false;
			var _iteratorError8 = undefined;

			try {
				for (var _iterator8 = (0, _getIterator3.default)(consumers), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
					var consumerData = _step8.value;

					try {
						this._handleConsumerData(consumerData, peer);
					} catch (error) {
						logger.error('error handling existing Consumer in Peer:%o', error);
					}
				}

				// If already joined emit event.
			} catch (err) {
				_didIteratorError8 = true;
				_iteratorError8 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion8 && _iterator8.return) {
						_iterator8.return();
					}
				} finally {
					if (_didIteratorError8) {
						throw _iteratorError8;
					}
				}
			}

			if (this.joined) this.safeEmit('newpeer', peer);
		}
	}, {
		key: '_handleConsumerData',
		value: function _handleConsumerData(producerData, peer) {
			var id = producerData.id,
			    kind = producerData.kind,
			    rtpParameters = producerData.rtpParameters,
			    paused = producerData.paused,
			    appData = producerData.appData;

			var consumer = new _Consumer2.default(id, kind, rtpParameters, peer, appData);
			var supported = utils.canReceive(consumer.rtpParameters, this._extendedRtpCapabilities);

			if (supported) consumer.setSupported(true);

			if (paused) consumer.remotePause();

			peer.addConsumer(consumer);
		}
	}, {
		key: 'joined',
		get: function get() {
			return this._state === RoomState.joined;
		}

		/**
   * Whether the Room is closed.
   *
   * @return {Boolean}
   */

	}, {
		key: 'closed',
		get: function get() {
			return this._state === RoomState.closed;
		}

		/**
   * The list of Transports.
   *
   * @return {Array<Transport>}
   */

	}, {
		key: 'transports',
		get: function get() {
			return (0, _from2.default)(this._transports.values());
		}

		/**
   * The list of Producers.
   *
   * @return {Array<Producer>}
   */

	}, {
		key: 'producers',
		get: function get() {
			return (0, _from2.default)(this._producers.values());
		}

		/**
   * The list of Peers.
   *
   * @return {Array<Peer>}
   */

	}, {
		key: 'peers',
		get: function get() {
			return (0, _from2.default)(this._peers.values());
		}
	}]);
	return Room;
}(_EnhancedEventEmitter3.default);

exports.default = Room;

},{"./Consumer":"/Users/ibc/src/mediasoup-client/lib/Consumer.js","./Device":"/Users/ibc/src/mediasoup-client/lib/Device.js","./EnhancedEventEmitter":"/Users/ibc/src/mediasoup-client/lib/EnhancedEventEmitter.js","./Logger":"/Users/ibc/src/mediasoup-client/lib/Logger.js","./Peer":"/Users/ibc/src/mediasoup-client/lib/Peer.js","./Producer":"/Users/ibc/src/mediasoup-client/lib/Producer.js","./Transport":"/Users/ibc/src/mediasoup-client/lib/Transport.js","./errors":"/Users/ibc/src/mediasoup-client/lib/errors.js","./utils":"/Users/ibc/src/mediasoup-client/lib/utils.js","babel-runtime/core-js/array/from":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/array/from.js","babel-runtime/core-js/get-iterator":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/get-iterator.js","babel-runtime/core-js/map":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/map.js","babel-runtime/core-js/object/get-prototype-of":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/get-prototype-of.js","babel-runtime/core-js/promise":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/promise.js","babel-runtime/helpers/classCallCheck":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/classCallCheck.js","babel-runtime/helpers/createClass":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/createClass.js","babel-runtime/helpers/extends":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/extends.js","babel-runtime/helpers/inherits":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/inherits.js","babel-runtime/helpers/possibleConstructorReturn":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/possibleConstructorReturn.js","babel-runtime/helpers/typeof":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/typeof.js"}],"/Users/ibc/src/mediasoup-client/lib/Transport.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Logger = require('./Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _EnhancedEventEmitter2 = require('./EnhancedEventEmitter');

var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var _Device = require('./Device');

var _Device2 = _interopRequireDefault(_Device);

var _CommandQueue = require('./CommandQueue');

var _CommandQueue2 = _interopRequireDefault(_CommandQueue);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = new _Logger2.default('Transport');

var Transport = function (_EnhancedEventEmitter) {
	(0, _inherits3.default)(Transport, _EnhancedEventEmitter);

	/**
  * @private
  *
  * @emits {state: String} connectionstatechange
  * @emits {originator: String, [appData]: Any} closed
  * @emits {method: String, [data]: Object, callback: Function, errback: Function} @request
  * @emits {method: String, [data]: Object} @notify
  * @emits {originator: String} @close
  */
	function Transport(direction, extendedRtpCapabilities, settings, appData) {
		(0, _classCallCheck3.default)(this, Transport);

		logger.debug('constructor() [direction:%s, extendedRtpCapabilities:%o]', direction, extendedRtpCapabilities);

		// Id.
		// @type {Number}
		var _this = (0, _possibleConstructorReturn3.default)(this, (Transport.__proto__ || (0, _getPrototypeOf2.default)(Transport)).call(this));

		_this._id = utils.randomNumber();

		// Closed flag.
		// @type {Boolean}
		_this._closed = false;

		// Direction.
		// @type {String}
		_this._direction = direction;

		// Room settings.
		// @type {Object}
		_this._settings = settings;

		// App custom data.
		// @type {Any}
		_this._appData = appData;

		// Map of Producers indexed by id.
		// @type {map<Number, Producer>}
		_this._producers = new _map2.default();

		// Map of Consumers indexed by id.
		// @type {map<Number, Consumer>}
		_this._consumers = new _map2.default();

		// Commands handler.
		// @type {CommandQueue}
		_this._commandQueue = new _CommandQueue2.default();

		// Device specific handler.
		_this._handler = new _Device2.default.Handler(direction, extendedRtpCapabilities, settings);

		// Transport state. Values can be:
		// 'new'/'connecting'/'connected'/'failed'/'disconnected'/'closed'
		// @type {String}
		_this._connectionState = 'new';

		_this._commandQueue.on('exec', _this._execCommand.bind(_this));
		_this._handleHandler();
		return _this;
	}

	/**
  * Transport id.
  *
  * @return {Number}
  */


	(0, _createClass3.default)(Transport, [{
		key: 'close',


		/**
   * Close the Transport.
   *
   * @param {Any} [appData] - App custom data.
   */
		value: function close(appData) {
			logger.debug('close()');

			if (this._closed) return;

			this._closed = true;

			this.safeEmit('@notify', 'closeTransport', { id: this._id, appData: appData });

			this.emit('@close', 'local');
			this.safeEmit('closed', 'local', appData);

			this._destroy();
		}

		/**
   * My remote Transport was closed.
   * Invoked via remote notification.
   *
   * @param {Any} [appData] - App custom data.
   */

	}, {
		key: 'remoteClose',
		value: function remoteClose(appData) {
			logger.debug('remoteClose()');

			if (this._closed) return;

			this._closed = true;

			this.emit('@close', 'remote');
			this.safeEmit('closed', 'remote', appData);

			this._destroy();
		}
	}, {
		key: '_destroy',
		value: function _destroy() {
			// Close the CommandQueue.
			this._commandQueue.close();

			// Close the handler.
			this._handler.close();

			// Unhandle all the Producers.
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = (0, _getIterator3.default)(this._producers.values()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var producer = _step.value;

					producer.setHandled(false);
				}

				// Unhandle all the Consumers.
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = (0, _getIterator3.default)(this._consumers.values()), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var consumer = _step2.value;

					consumer.setHandled(false);
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}
		}

		/**
   * Send the given Producer over this Transport.
   *
   * @param {Producer} producer
   *
   * @return {Promise}
   *
   * @example
   * transport.send(videoProducer)
   *   .then(() => {
   *     // Done
   *   });
   */

	}, {
		key: 'send',
		value: function send(producer) {
			logger.debug('send() [producer:%o]', producer);

			if (this._direction !== 'send') return _promise2.default.reject(new Error('cannot send on a receiving Transport'));else if (!producer || producer.klass !== 'Producer') return _promise2.default.reject(new TypeError('wrong Producer'));

			// Enqueue command.
			return this._commandQueue.push('addProducer', { producer: producer });
		}

		/**
   * Receive the given Consumer over this Transport.
   *
   * @param {Consumer} consumer
   *
   * @return {Promise}
   *
   * @example
   * transport.receive(aliceVideoConsumer)
   *   .then(() => {
   *     // Done
   *   });
   */

	}, {
		key: 'receive',
		value: function receive(consumer) {
			logger.debug('receive() [consumer:%o]', consumer);

			if (this._direction !== 'recv') return _promise2.default.reject(new Error('cannot receive on a sending Transport'));else if (!consumer || consumer.klass !== 'Consumer') return _promise2.default.reject(new TypeError('wrong Consumer'));

			// Enqueue command.
			return this._commandQueue.push('addConsumer', { consumer: consumer });
		}
	}, {
		key: '_handleHandler',
		value: function _handleHandler() {
			var _this2 = this;

			var handler = this._handler;

			handler.on('@connectionstatechange', function (state) {
				if (_this2._connectionState === state) return;

				_this2._connectionState = state;

				if (!_this2._closed) _this2.safeEmit('connectionstatechange', state);
			});

			handler.on('@needcreatetransport', function (transportLocalParameters, callback, errback) {
				var data = {
					id: _this2._id,
					options: _this2._settings.transportOptions,
					appData: _this2._appData
				};

				if (transportLocalParameters) data.dtlsParameters = transportLocalParameters.dtlsParameters;

				_this2.safeEmit('@request', 'createTransport', data, callback, errback);
			});

			handler.on('@needupdatetransport', function (transportLocalParameters) {
				var data = {
					id: _this2._id,
					dtlsParameters: transportLocalParameters.dtlsParameters
				};

				_this2.safeEmit('@notify', 'updateTransport', data);
			});
		}
	}, {
		key: '_execCommand',
		value: function _execCommand(command, promiseHolder) {
			var promise = void 0;

			try {
				switch (command.method) {
					case 'addProducer':
						{
							var producer = command.producer;


							promise = this._execAddProducer(producer);
							break;
						}

					case 'removeProducer':
						{
							var _producer = command.producer;


							promise = this._execRemoveProducer(_producer);
							break;
						}

					case 'addConsumer':
						{
							var consumer = command.consumer;


							promise = this._execAddConsumer(consumer);
							break;
						}

					case 'removeConsumer':
						{
							var _consumer = command.consumer;


							promise = this._execRemoveConsumer(_consumer);
							break;
						}

					default:
						{
							promise = _promise2.default.reject(new Error('unknown command method "' + command.method + '"'));
						}
				}
			} catch (error) {
				promise = _promise2.default.reject(error);
			}

			// Fill the given Promise holder.
			promiseHolder.promise = promise;
		}
	}, {
		key: '_execAddProducer',
		value: function _execAddProducer(producer) {
			var _this3 = this;

			logger.debug('_execAddProducer()');

			if (producer.closed) return _promise2.default.reject(new Error('Producer closed'));else if (producer.handled) return _promise2.default.reject(new Error('Producer already handled by a Transport'));

			var producerRtpParameters = void 0;

			producer.setHandled('tmp');

			// Call the handler.
			return _promise2.default.resolve().then(function () {
				return _this3._handler.addProducer(producer);
			}).then(function (rtpParameters) {
				producerRtpParameters = rtpParameters;

				var data = {
					id: producer.id,
					kind: producer.kind,
					transportId: _this3._id,
					rtpParameters: rtpParameters,
					appData: producer.appData
				};

				return _this3.safeEmitAsPromise('@request', 'createProducer', data);
			}).then(function () {
				producer.setHandled(true, producerRtpParameters);
				_this3._producers.set(producer.id, producer);
				_this3._handleProducer(producer);
			}).catch(function (error) {
				producer.setHandled(false);

				throw error;
			});
		}
	}, {
		key: '_execRemoveProducer',
		value: function _execRemoveProducer(producer) {
			logger.debug('_execRemoveProducer()');

			// Call the handler.
			return this._handler.removeProducer(producer);
		}
	}, {
		key: '_execAddConsumer',
		value: function _execAddConsumer(consumer) {
			var _this4 = this;

			logger.debug('_execAddConsumer()');

			if (consumer.closed) return _promise2.default.reject(new Error('Consumer closed'));else if (consumer.handled) return _promise2.default.reject(new Error('Consumer already handled by a Transport'));

			// Check whether we can receive this Consumer.
			if (!consumer.supported) {
				return _promise2.default.reject(new Error('cannot receive this Consumer, unsupported codecs'));
			}

			var consumerTrack = void 0;

			consumer.setHandled('tmp');

			// Call the handler.
			return _promise2.default.resolve().then(function () {
				return _this4._handler.addConsumer(consumer);
			}).then(function (track) {
				consumerTrack = track;

				var data = {
					id: consumer.id
				};

				return _this4.safeEmitAsPromise('@request', 'enableConsumer', data);
			}).then(function () {
				consumer.setHandled(true, consumerTrack);
				_this4._consumers.set(consumer.id, consumer);
				_this4._handleConsumer(consumer);

				return consumerTrack;
			}).catch(function (error) {
				consumer.setHandled(false);

				throw error;
			});
		}
	}, {
		key: '_execRemoveConsumer',
		value: function _execRemoveConsumer(consumer) {
			logger.debug('_execRemoveConsumer()');

			// Call the handler.
			return this._handler.removeConsumer(consumer);
		}
	}, {
		key: '_handleProducer',
		value: function _handleProducer(producer) {
			var _this5 = this;

			producer.on('@close', function (originator, appData) {
				_this5._producers.delete(producer.id);

				// Enqueue command.
				_this5._commandQueue.push('removeProducer', { producer: producer }).catch(function () {});

				if (originator === 'local') {
					_this5.safeEmit('@notify', 'closeProducer', { id: producer.id, appData: appData });
				}
			});

			producer.on('@pause', function (appData) {
				var data = {
					id: producer.id,
					appData: appData
				};

				_this5.safeEmit('@notify', 'pauseProducer', data);
			});

			producer.on('@resume', function (appData) {
				var data = {
					id: producer.id,
					appData: appData
				};

				_this5.safeEmit('@notify', 'resumeProducer', data);
			});
		}
	}, {
		key: '_handleConsumer',
		value: function _handleConsumer(consumer) {
			var _this6 = this;

			consumer.on('@close', function () {
				_this6._consumers.delete(consumer.id);

				// Enqueue command.
				_this6._commandQueue.push('removeConsumer', { consumer: consumer }).catch(function () {});
			});

			consumer.on('@pause', function (appData) {
				var data = {
					id: consumer.id,
					appData: appData
				};

				_this6.safeEmit('@notify', 'pauseConsumer', data);
			});

			consumer.on('@resume', function (appData) {
				var data = {
					id: consumer.id,
					appData: appData
				};

				_this6.safeEmit('@notify', 'resumeConsumer', data);
			});
		}
	}, {
		key: 'id',
		get: function get() {
			return this._id;
		}

		/**
   * Whether the Transport is closed.
   *
   * @return {Boolean}
   */

	}, {
		key: 'closed',
		get: function get() {
			return this._closed;
		}

		/**
   * Transport direction.
   *
   * @return {String}
   */

	}, {
		key: 'direction',
		get: function get() {
			return this._direction;
		}

		/**
   * App custom data.
   *
   * @return {Any}
   */

	}, {
		key: 'appData',
		get: function get() {
			return this._appData;
		}

		/**
   * Connection state.
   *
   * @return {String}
   */

	}, {
		key: 'connectionState',
		get: function get() {
			return this._connectionState;
		}
	}]);
	return Transport;
}(_EnhancedEventEmitter3.default);

exports.default = Transport;

},{"./CommandQueue":"/Users/ibc/src/mediasoup-client/lib/CommandQueue.js","./Device":"/Users/ibc/src/mediasoup-client/lib/Device.js","./EnhancedEventEmitter":"/Users/ibc/src/mediasoup-client/lib/EnhancedEventEmitter.js","./Logger":"/Users/ibc/src/mediasoup-client/lib/Logger.js","./utils":"/Users/ibc/src/mediasoup-client/lib/utils.js","babel-runtime/core-js/get-iterator":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/get-iterator.js","babel-runtime/core-js/map":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/map.js","babel-runtime/core-js/object/get-prototype-of":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/get-prototype-of.js","babel-runtime/core-js/promise":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/promise.js","babel-runtime/helpers/classCallCheck":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/classCallCheck.js","babel-runtime/helpers/createClass":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/createClass.js","babel-runtime/helpers/inherits":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/inherits.js","babel-runtime/helpers/possibleConstructorReturn":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/possibleConstructorReturn.js"}],"/Users/ibc/src/mediasoup-client/lib/errors.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.TimeoutError = exports.InvalidStateError = undefined;

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Error produced when calling a method in an invalid state.
 */
var InvalidStateError = exports.InvalidStateError = function (_Error) {
	(0, _inherits3.default)(InvalidStateError, _Error);

	function InvalidStateError(message) {
		(0, _classCallCheck3.default)(this, InvalidStateError);

		var _this = (0, _possibleConstructorReturn3.default)(this, (InvalidStateError.__proto__ || (0, _getPrototypeOf2.default)(InvalidStateError)).call(this, message));

		Object.defineProperty(_this, 'name', {
			enumerable: false,
			writable: false,
			value: 'InvalidStateError'
		});

		if (Error.hasOwnProperty('captureStackTrace')) // Just in V8.
			{
				Error.captureStackTrace(_this, InvalidStateError);
			} else {
			Object.defineProperty(_this, 'stack', {
				enumerable: false,
				writable: false,
				value: new Error(message).stack
			});
		}
		return _this;
	}

	return InvalidStateError;
}(Error);

/**
 * Error produced when a Promise is rejected due to a timeout.
 */


var TimeoutError = exports.TimeoutError = function (_Error2) {
	(0, _inherits3.default)(TimeoutError, _Error2);

	function TimeoutError(message) {
		(0, _classCallCheck3.default)(this, TimeoutError);

		var _this2 = (0, _possibleConstructorReturn3.default)(this, (TimeoutError.__proto__ || (0, _getPrototypeOf2.default)(TimeoutError)).call(this, message));

		Object.defineProperty(_this2, 'name', {
			enumerable: false,
			writable: false,
			value: 'TimeoutError'
		});

		if (Error.hasOwnProperty('captureStackTrace')) // Just in V8.
			{
				Error.captureStackTrace(_this2, TimeoutError);
			} else {
			Object.defineProperty(_this2, 'stack', {
				enumerable: false,
				writable: false,
				value: new Error(message).stack
			});
		}
		return _this2;
	}

	return TimeoutError;
}(Error);

},{"babel-runtime/core-js/object/get-prototype-of":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/get-prototype-of.js","babel-runtime/helpers/classCallCheck":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/classCallCheck.js","babel-runtime/helpers/inherits":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/inherits.js","babel-runtime/helpers/possibleConstructorReturn":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/possibleConstructorReturn.js"}],"/Users/ibc/src/mediasoup-client/lib/handlers/Chrome55.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _sdpTransform = require('sdp-transform');

var _sdpTransform2 = _interopRequireDefault(_sdpTransform);

var _Logger = require('../Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _EnhancedEventEmitter2 = require('../EnhancedEventEmitter');

var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);

var _utils = require('../utils');

var utils = _interopRequireWildcard(_utils);

var _commonUtils = require('./sdp/commonUtils');

var sdpCommonUtils = _interopRequireWildcard(_commonUtils);

var _planBUtils = require('./sdp/planBUtils');

var sdpPlanBUtils = _interopRequireWildcard(_planBUtils);

var _RemotePlanBSdp = require('./sdp/RemotePlanBSdp');

var _RemotePlanBSdp2 = _interopRequireDefault(_RemotePlanBSdp);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = new _Logger2.default('Chrome55');

var Handler = function (_EnhancedEventEmitter) {
	(0, _inherits3.default)(Handler, _EnhancedEventEmitter);

	function Handler(direction, rtpParametersByKind, settings) {
		(0, _classCallCheck3.default)(this, Handler);

		// RTCPeerConnection instance.
		// @type {RTCPeerConnection}
		var _this = (0, _possibleConstructorReturn3.default)(this, (Handler.__proto__ || (0, _getPrototypeOf2.default)(Handler)).call(this));

		_this._pc = new RTCPeerConnection({
			iceServers: settings.turnServers || [],
			iceTransportPolicy: 'relay',
			bundlePolicy: 'max-bundle',
			rtcpMuxPolicy: 'require'
		});

		// Generic sending RTP parameters for audio and video.
		// @type {Object}
		_this._rtpParametersByKind = rtpParametersByKind;

		// Remote SDP handler.
		// @type {RemotePlanBSdp}
		_this._remoteSdp = new _RemotePlanBSdp2.default(direction, rtpParametersByKind);

		// Handle RTCPeerConnection connection status.
		_this._pc.addEventListener('iceconnectionstatechange', function () {
			switch (_this._pc.iceConnectionState) {
				case 'checking':
					_this.emit('@connectionstatechange', 'connecting');
					break;
				case 'connected':
				case 'completed':
					_this.emit('@connectionstatechange', 'connected');
					break;
				case 'failed':
					_this.emit('@connectionstatechange', 'failed');
					break;
				case 'disconnected':
					_this.emit('@connectionstatechange', 'disconnected');
					break;
				case 'closed':
					_this.emit('@connectionstatechange', 'closed');
					break;
			}
		});
		return _this;
	}

	(0, _createClass3.default)(Handler, [{
		key: 'close',
		value: function close() {
			logger.debug('close()');

			// Close RTCPeerConnection.
			try {
				this._pc.close();
			} catch (error) {}
		}
	}]);
	return Handler;
}(_EnhancedEventEmitter3.default);

var SendHandler = function (_Handler) {
	(0, _inherits3.default)(SendHandler, _Handler);

	function SendHandler(rtpParametersByKind, settings) {
		(0, _classCallCheck3.default)(this, SendHandler);

		// Got transport local and remote parameters.
		// @type {Boolean}
		var _this2 = (0, _possibleConstructorReturn3.default)(this, (SendHandler.__proto__ || (0, _getPrototypeOf2.default)(SendHandler)).call(this, 'send', rtpParametersByKind, settings));

		_this2._transportReady = false;

		// Local stream.
		// @type {MediaStream}
		_this2._stream = new MediaStream();
		return _this2;
	}

	(0, _createClass3.default)(SendHandler, [{
		key: 'addProducer',
		value: function addProducer(producer) {
			var _this3 = this;

			var track = producer.track;


			logger.debug('addProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);

			var localSdpObj = void 0;

			return _promise2.default.resolve().then(function () {
				// Add the track to the local stream.
				_this3._stream.addTrack(track);

				// Add the stream to the PeerConnection.
				_this3._pc.addStream(_this3._stream);

				return _this3._pc.createOffer();
			}).then(function (offer) {
				return _this3._pc.setLocalDescription(offer);
			}).then(function () {
				if (!_this3._transportReady) return _this3._setupTransport();
			}).then(function () {
				localSdpObj = _sdpTransform2.default.parse(_this3._pc.localDescription.sdp);

				var remoteSdp = _this3._remoteSdp.createAnswerSdp(localSdpObj);
				var answer = { type: 'answer', sdp: remoteSdp };

				return _this3._pc.setRemoteDescription(answer);
			}).then(function () {
				var rtpParameters = utils.clone(_this3._rtpParametersByKind[producer.kind]);

				// Fill the RTP parameters for this track.
				sdpPlanBUtils.fillRtpParametersForTrack(rtpParameters, localSdpObj, track);

				return rtpParameters;
			}).catch(function (error) {
				// Panic here. Try to undo things.

				_this3._stream.removeTrack(track);
				_this3._pc.addStream(_this3._stream);

				throw error;
			});
		}
	}, {
		key: 'removeProducer',
		value: function removeProducer(producer) {
			var _this4 = this;

			var track = producer.track;


			logger.debug('removeProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);

			return _promise2.default.resolve().then(function () {
				// Remove the track from the local stream.
				_this4._stream.removeTrack(track);

				// Add the stream to the PeerConnection.
				_this4._pc.addStream(_this4._stream);

				return _this4._pc.createOffer();
			}).then(function (offer) {
				return _this4._pc.setLocalDescription(offer);
			}).catch(function (error) {
				// NOTE: If there are no sending tracks, setLocalDescription() will fail with
				// "Failed to create channels". If so, ignore it.
				if (_this4._stream.getTracks().length === 0) {
					logger.warn('removeProducer() | ignoring expected error due no sending tracks: %s', error.toString());

					return;
				}

				throw error;
			}).then(function () {
				if (_this4._pc.signalingState === 'stable') return;

				var localSdpObj = _sdpTransform2.default.parse(_this4._pc.localDescription.sdp);
				var remoteSdp = _this4._remoteSdp.createAnswerSdp(localSdpObj);
				var answer = { type: 'answer', sdp: remoteSdp };

				return _this4._pc.setRemoteDescription(answer);
			});
		}
	}, {
		key: '_setupTransport',
		value: function _setupTransport() {
			var _this5 = this;

			logger.debug('_setupTransport()');

			return _promise2.default.resolve().then(function () {
				// Get our local DTLS parameters.
				var transportLocalParameters = {};
				var sdp = _this5._pc.localDescription.sdp;
				var sdpObj = _sdpTransform2.default.parse(sdp);
				var dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);

				// Let's decide that we'll be DTLS server (because we can).
				dtlsParameters.role = 'server';

				transportLocalParameters.dtlsParameters = dtlsParameters;

				// Provide the remote SDP handler with transport local parameters.
				_this5._remoteSdp.setTransportLocalParameters(transportLocalParameters);

				// We need transport remote parameters.
				return _this5.safeEmitAsPromise('@needcreatetransport', transportLocalParameters);
			}).then(function (transportRemoteParameters) {
				// Provide the remote SDP handler with transport remote parameters.
				_this5._remoteSdp.setTransportRemoteParameters(transportRemoteParameters);

				_this5._transportReady = true;
			});
		}
	}]);
	return SendHandler;
}(Handler);

var RecvHandler = function (_Handler2) {
	(0, _inherits3.default)(RecvHandler, _Handler2);

	function RecvHandler(rtpParametersByKind, settings) {
		(0, _classCallCheck3.default)(this, RecvHandler);

		// Got transport remote parameters.
		// @type {Boolean}
		var _this6 = (0, _possibleConstructorReturn3.default)(this, (RecvHandler.__proto__ || (0, _getPrototypeOf2.default)(RecvHandler)).call(this, 'recv', rtpParametersByKind, settings));

		_this6._transportCreated = false;

		// Got transport local parameters.
		// @type {Boolean}
		_this6._transportUpdated = false;

		// Seen media kinds.
		// @type {Set<String>}
		_this6._kinds = new _set2.default();

		// Map of Consumers information indexed by consumer.id.
		// - kind {String}
		// - trackId {String}
		// - ssrc {Number}
		// - rtxSsrc {Number}
		// - cname {String}
		// @type {Map<Number, Object>}
		_this6._consumerInfos = new _map2.default();
		return _this6;
	}

	(0, _createClass3.default)(RecvHandler, [{
		key: 'addConsumer',
		value: function addConsumer(consumer) {
			var _this7 = this;

			logger.debug('addConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);

			if (this._consumerInfos.has(consumer.id)) return _promise2.default.reject('Consumer already added');

			var encoding = consumer.rtpParameters.encodings[0];
			var cname = consumer.rtpParameters.rtcp.cname;
			var consumerInfo = {
				kind: consumer.kind,
				trackId: 'consumer-' + consumer.kind + '-' + consumer.id,
				ssrc: encoding.ssrc,
				cname: cname
			};

			if (encoding.rtx && encoding.rtx.ssrc) consumerInfo.rtxSsrc = encoding.rtx.ssrc;

			this._consumerInfos.set(consumer.id, consumerInfo);
			this._kinds.add(consumer.kind);

			return _promise2.default.resolve().then(function () {
				if (!_this7._transportCreated) return _this7._setupTransport();
			}).then(function () {
				var remoteSdp = _this7._remoteSdp.createOfferSdp((0, _from2.default)(_this7._kinds), (0, _from2.default)(_this7._consumerInfos.values()));
				var offer = { type: 'offer', sdp: remoteSdp };

				return _this7._pc.setRemoteDescription(offer);
			}).then(function () {
				return _this7._pc.createAnswer();
			}).then(function (answer) {
				return _this7._pc.setLocalDescription(answer);
			}).then(function () {
				if (!_this7._transportUpdated) return _this7._updateTransport();
			}).then(function () {
				var stream = _this7._pc.getRemoteStreams()[0];
				var track = stream.getTrackById(consumerInfo.trackId);

				if (!track) throw new Error('remote track not found');

				return track;
			});
		}
	}, {
		key: 'removeConsumer',
		value: function removeConsumer(consumer) {
			var _this8 = this;

			logger.debug('removeConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);

			if (!this._consumerInfos.has(consumer.id)) return _promise2.default.reject('Consumer not found');

			this._consumerInfos.delete(consumer.id);

			return _promise2.default.resolve().then(function () {
				var remoteSdp = _this8._remoteSdp.createOfferSdp((0, _from2.default)(_this8._kinds), (0, _from2.default)(_this8._consumerInfos.values()));
				var offer = { type: 'offer', sdp: remoteSdp };

				return _this8._pc.setRemoteDescription(offer);
			}).then(function () {
				return _this8._pc.createAnswer();
			}).then(function (answer) {
				return _this8._pc.setLocalDescription(answer);
			});
		}
	}, {
		key: '_setupTransport',
		value: function _setupTransport() {
			var _this9 = this;

			logger.debug('_setupTransport()');

			return _promise2.default.resolve().then(function () {
				// We need transport remote parameters.
				return _this9.safeEmitAsPromise('@needcreatetransport', null);
			}).then(function (transportRemoteParameters) {
				// Provide the remote SDP handler with transport remote parameters.
				_this9._remoteSdp.setTransportRemoteParameters(transportRemoteParameters);

				_this9._transportCreated = true;
			});
		}
	}, {
		key: '_updateTransport',
		value: function _updateTransport() {
			logger.debug('_updateTransport()');

			// Get our local DTLS parameters.
			// const transportLocalParameters = {};
			var sdp = this._pc.localDescription.sdp;
			var sdpObj = _sdpTransform2.default.parse(sdp);
			var dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);
			var transportLocalParameters = { dtlsParameters: dtlsParameters };

			// We need to provide transport local parameters.
			this.safeEmit('@needupdatetransport', transportLocalParameters);

			this._transportUpdated = true;
		}
	}]);
	return RecvHandler;
}(Handler);

var Chrome55 = function () {
	(0, _createClass3.default)(Chrome55, null, [{
		key: 'getLocalRtpCapabilities',
		value: function getLocalRtpCapabilities() {
			logger.debug('getLocalRtpCapabilities()');

			var pc = new RTCPeerConnection({
				iceServers: [],
				iceTransportPolicy: 'relay',
				bundlePolicy: 'max-bundle',
				rtcpMuxPolicy: 'require'
			});

			return pc.createOffer({
				offerToReceiveAudio: true,
				offerToReceiveVideo: true
			}).then(function (offer) {
				try {
					pc.close();
				} catch (error) {}

				var sdpObj = _sdpTransform2.default.parse(offer.sdp);
				var localRtpCapabilities = sdpCommonUtils.extractRtpCapabilities(sdpObj);

				return localRtpCapabilities;
			}).catch(function (error) {
				try {
					pc.close();
				} catch (error2) {}

				throw error;
			});
		}
	}, {
		key: 'name',
		get: function get() {
			return 'Chrome55';
		}
	}]);

	function Chrome55(direction, extendedRtpCapabilities, settings) {
		(0, _classCallCheck3.default)(this, Chrome55);

		logger.debug('constructor() [direction:%s, extendedRtpCapabilities:%o]', direction, extendedRtpCapabilities);

		var rtpParametersByKind = void 0;

		switch (direction) {
			case 'send':
				{
					rtpParametersByKind = {
						audio: utils.getSendingRtpParameters('audio', extendedRtpCapabilities),
						video: utils.getSendingRtpParameters('video', extendedRtpCapabilities)
					};

					return new SendHandler(rtpParametersByKind, settings);
				}
			case 'recv':
				{
					rtpParametersByKind = {
						audio: utils.getReceivingFullRtpParameters('audio', extendedRtpCapabilities),
						video: utils.getReceivingFullRtpParameters('video', extendedRtpCapabilities)
					};

					return new RecvHandler(rtpParametersByKind, settings);
				}
		}
	}

	return Chrome55;
}();

exports.default = Chrome55;

},{"../EnhancedEventEmitter":"/Users/ibc/src/mediasoup-client/lib/EnhancedEventEmitter.js","../Logger":"/Users/ibc/src/mediasoup-client/lib/Logger.js","../utils":"/Users/ibc/src/mediasoup-client/lib/utils.js","./sdp/RemotePlanBSdp":"/Users/ibc/src/mediasoup-client/lib/handlers/sdp/RemotePlanBSdp.js","./sdp/commonUtils":"/Users/ibc/src/mediasoup-client/lib/handlers/sdp/commonUtils.js","./sdp/planBUtils":"/Users/ibc/src/mediasoup-client/lib/handlers/sdp/planBUtils.js","babel-runtime/core-js/array/from":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/array/from.js","babel-runtime/core-js/map":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/map.js","babel-runtime/core-js/object/get-prototype-of":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/get-prototype-of.js","babel-runtime/core-js/promise":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/promise.js","babel-runtime/core-js/set":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/set.js","babel-runtime/helpers/classCallCheck":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/classCallCheck.js","babel-runtime/helpers/createClass":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/createClass.js","babel-runtime/helpers/inherits":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/inherits.js","babel-runtime/helpers/possibleConstructorReturn":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/possibleConstructorReturn.js","sdp-transform":"/Users/ibc/src/mediasoup-client/node_modules/sdp-transform/lib/index.js"}],"/Users/ibc/src/mediasoup-client/lib/handlers/Edge11.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Logger = require('../Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _EnhancedEventEmitter2 = require('../EnhancedEventEmitter');

var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import * as utils from '../utils';

/* global RTCIceGatherer, RTCIceTransport, RTCDtlsTransport, RTCRtpReceiver */

var logger = new _Logger2.default('Edge11');

// const CNAME = `cname-${utils.randomNumber()}`;

var Edge11 = function (_EnhancedEventEmitter) {
	(0, _inherits3.default)(Edge11, _EnhancedEventEmitter);
	(0, _createClass3.default)(Edge11, null, [{
		key: 'getLocalRtpCapabilities',
		value: function getLocalRtpCapabilities() {
			logger.debug('getLocalRtpCapabilities()');

			// TODO: Not enough since Edge does not set mimeType, etc.
			return RTCRtpReceiver.getCapabilities();
		}
	}, {
		key: 'name',
		get: function get() {
			return 'Edge11';
		}
	}]);

	function Edge11(direction, extendedRtpCapabilities, settings) {
		(0, _classCallCheck3.default)(this, Edge11);

		logger.debug('constructor() [direction:%s, extendedRtpCapabilities:%o]', direction, extendedRtpCapabilities);

		// Got transport local and remote parameters.
		// @type {Boolean}
		var _this = (0, _possibleConstructorReturn3.default)(this, (Edge11.__proto__ || (0, _getPrototypeOf2.default)(Edge11)).call(this));

		_this._transportReady = false;

		// ICE gatherer.
		_this._iceGatherer = null;

		// ICE transport.
		_this._iceTransport = null;

		// DTLS transport.
		// @type {RTCDtlsTransport}
		_this._dtlsTransport = null;

		// Map of RTCRtpSenders indexed by Producer.id.
		// @type {Map<Number, RTCRtpSender}
		_this._rtpSenders = new _map2.default();

		// Map of RTCRtpReceivers indexed by Consumer.id.
		// @type {Map<Number, RTCRtpReceiver}
		_this._rtpReceivers = new _map2.default();

		_this._setIceGatherer(settings);
		_this._setIceTransport();
		_this._setDtlsTransport();

		// TODO
		return _this;
	}

	(0, _createClass3.default)(Edge11, [{
		key: 'close',
		value: function close() {
			logger.debug('close()');

			// Close the ICE gatherer.
			// NOTE: Not yet implemented by Edge.
			try {
				this._iceGatherer.close();
			} catch (error) {}

			// Close the ICE transport.
			try {
				this._iceTransport.stop();
			} catch (error) {}

			// Close the DTLS transport.
			try {
				this._dtlsTransport.stop();
			} catch (error) {}

			// Close RTCRtpSenders.
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = (0, _getIterator3.default)(this._rtpSenders.values()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var rtpSender = _step.value;

					try {
						rtpSender.stop();
					} catch (error) {}
				}

				// Close RTCRtpReceivers.
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = (0, _getIterator3.default)(this._rtpReceivers.values()), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var rtpReceiver = _step2.value;

					try {
						rtpReceiver.stop();
					} catch (error) {}
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}
		}
	}, {
		key: 'addProducer',
		value: function addProducer(producer) {
			var _this2 = this;

			var track = producer.track;


			logger.debug('addProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);

			return _promise2.default.resolve().then(function () {
				if (!_this2._transportReady) return _this2._setupTransport();
			});

			// TODO
		}
	}, {
		key: 'removeProducer',
		value: function removeProducer(producer) {
			var track = producer.track;


			logger.debug('removeProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);

			// TODO
		}
	}, {
		key: 'addConsumer',
		value: function addConsumer(consumer) {
			logger.debug('addConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);

			// TODO
		}
	}, {
		key: 'removeConsumer',
		value: function removeConsumer(consumer) {
			logger.debug('removeConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);

			// TODO
		}
	}, {
		key: '_setIceGatherer',
		value: function _setIceGatherer(settings) {
			var iceGatherer = new RTCIceGatherer({
				iceServers: settings.turnServers || [],
				gatherPolicy: 'relay'
			});

			iceGatherer.addEventListener('error', function (event) {
				var errorCode = event.errorCode,
				    errorText = event.errorText;


				logger.error('iceGatherer "error" event [errorCode:' + errorCode + ', errorText:' + errorText + ']');
			});

			// NOTE: Not yet implemented by Edge, which starts gathering automatically.
			try {
				iceGatherer.gather();
			} catch (error) {
				logger.debug('iceGatherer.gather() failed:' + error);
			}

			this._iceGatherer = iceGatherer;
		}
	}, {
		key: '_setIceTransport',
		value: function _setIceTransport() {
			var _this3 = this;

			var iceTransport = new RTCIceTransport(this._iceGatherer);

			// NOTE: Not yet implemented by Edge.
			iceTransport.addEventListener('statechange', function () {
				switch (iceTransport.state) {
					case 'checking':
						_this3.emit('@connectionstatechange', 'connecting');
						break;
					case 'connected':
					case 'completed':
						_this3.emit('@connectionstatechange', 'connected');
						break;
					case 'failed':
						_this3.emit('@connectionstatechange', 'failed');
						break;
					case 'disconnected':
						_this3.emit('@connectionstatechange', 'disconnected');
						break;
					case 'closed':
						_this3.emit('@connectionstatechange', 'closed');
						break;
				}
			});

			// NOTE: Not standard, but implemented by Edge.
			iceTransport.addEventListener('icestatechange', function () {
				switch (iceTransport.state) {
					case 'checking':
						_this3.emit('@connectionstatechange', 'connecting');
						break;
					case 'connected':
					case 'completed':
						_this3.emit('@connectionstatechange', 'connected');
						break;
					case 'failed':
						_this3.emit('@connectionstatechange', 'failed');
						break;
					case 'disconnected':
						_this3.emit('@connectionstatechange', 'disconnected');
						break;
					case 'closed':
						_this3.emit('@connectionstatechange', 'closed');
						break;
				}
			});

			iceTransport.addEventListener('candidatepairchange', function (event) {
				logger.debug('iceTransport "candidatepairchange" event [pair:' + event.pair + ']');
			});

			this._iceTransport = iceTransport;
		}
	}, {
		key: '_setDtlsTransport',
		value: function _setDtlsTransport() {
			var dtlsTransport = new RTCDtlsTransport(this._iceTransport);

			// NOTE: Not yet implemented by Edge.
			dtlsTransport.addEventListener('statechange', function () {
				logger.debug('dtlsTransport "statechange" event [state:' + dtlsTransport.state + ']');
			});

			// NOTE: Not standard, but implemented by Edge.
			dtlsTransport.addEventListener('dtlsstatechange', function () {
				logger.debug('dtlsTransport "dtlsstatechange" event [state:' + dtlsTransport.state + ']');
			});

			dtlsTransport.addEventListener('error', function (event) {
				var error = void 0;

				if (event.message) error = event.message;else if (event.error) error = event.error.message;

				logger.error('dtlsTransport "error" event:' + error);
			});

			this._dtlsTransport = dtlsTransport;
		}
	}, {
		key: '_setupTransport',
		value: function _setupTransport() {
			var _this4 = this;

			logger.debug('_setupTransport()');

			return _promise2.default.resolve().then(function () {
				// Get our local DTLS parameters.
				var transportLocalParameters = {};
				var dtlsParameters = _this4._dtlsTransport.getLocalParameters();

				// Let's decide that we'll be DTLS server (because we can).
				dtlsParameters.role = 'server';

				transportLocalParameters.dtlsParameters = dtlsParameters;

				// We need transport remote parameters.
				return _this4.safeEmitAsPromise('@needcreatetransport', transportLocalParameters);
			}).then(function (transportRemoteParameters) {
				var remoteIceParameters = transportRemoteParameters.iceParameters;
				var remoteIceCandidates = transportRemoteParameters.iceCandidates;
				var remoteDtlsParameters = transportRemoteParameters.dtlsParameters;

				// Start the RTCIceTransport.
				_this4._iceTransport.start(_this4._iceGatherer, remoteIceParameters, 'controlling');

				// Add remote ICE candidates.
				var _iteratorNormalCompletion3 = true;
				var _didIteratorError3 = false;
				var _iteratorError3 = undefined;

				try {
					for (var _iterator3 = (0, _getIterator3.default)(remoteIceCandidates), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
						var candidate = _step3.value;

						_this4._iceTransport.addRemoteCandidate(candidate);
					}

					// Also signal a 'complete' candidate as per spec.
					// NOTE: It should be {complete: true} but Edge prefers {}.
					// NOTE: If we don't signal end of candidates, the Edge RTCIceTransport
					// won't enter the 'completed' state.
				} catch (err) {
					_didIteratorError3 = true;
					_iteratorError3 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion3 && _iterator3.return) {
							_iterator3.return();
						}
					} finally {
						if (_didIteratorError3) {
							throw _iteratorError3;
						}
					}
				}

				_this4._iceTransport.addRemoteCandidate({});

				// Start the RTCDtlsTransport.
				_this4._dtlsTransport.start(remoteDtlsParameters);

				_this4._transportReady = true;
			});
		}
	}]);
	return Edge11;
}(_EnhancedEventEmitter3.default);

exports.default = Edge11;

},{"../EnhancedEventEmitter":"/Users/ibc/src/mediasoup-client/lib/EnhancedEventEmitter.js","../Logger":"/Users/ibc/src/mediasoup-client/lib/Logger.js","babel-runtime/core-js/get-iterator":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/get-iterator.js","babel-runtime/core-js/map":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/map.js","babel-runtime/core-js/object/get-prototype-of":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/get-prototype-of.js","babel-runtime/core-js/promise":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/promise.js","babel-runtime/helpers/classCallCheck":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/classCallCheck.js","babel-runtime/helpers/createClass":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/createClass.js","babel-runtime/helpers/inherits":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/inherits.js","babel-runtime/helpers/possibleConstructorReturn":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/possibleConstructorReturn.js"}],"/Users/ibc/src/mediasoup-client/lib/handlers/Firefox50.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _sdpTransform = require('sdp-transform');

var _sdpTransform2 = _interopRequireDefault(_sdpTransform);

var _Logger = require('../Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _EnhancedEventEmitter2 = require('../EnhancedEventEmitter');

var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);

var _utils = require('../utils');

var utils = _interopRequireWildcard(_utils);

var _commonUtils = require('./sdp/commonUtils');

var sdpCommonUtils = _interopRequireWildcard(_commonUtils);

var _unifiedPlanUtils = require('./sdp/unifiedPlanUtils');

var sdpUnifiedPlanUtils = _interopRequireWildcard(_unifiedPlanUtils);

var _RemoteUnifiedPlanSdp = require('./sdp/RemoteUnifiedPlanSdp');

var _RemoteUnifiedPlanSdp2 = _interopRequireDefault(_RemoteUnifiedPlanSdp);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = new _Logger2.default('Firefox50');

var Handler = function (_EnhancedEventEmitter) {
	(0, _inherits3.default)(Handler, _EnhancedEventEmitter);

	function Handler(direction, rtpParametersByKind, settings) {
		(0, _classCallCheck3.default)(this, Handler);

		// RTCPeerConnection instance.
		// @type {RTCPeerConnection}
		var _this = (0, _possibleConstructorReturn3.default)(this, (Handler.__proto__ || (0, _getPrototypeOf2.default)(Handler)).call(this));

		_this._pc = new RTCPeerConnection({
			iceServers: settings.turnServers || [],
			iceTransportPolicy: 'relay',
			bundlePolicy: 'max-bundle',
			rtcpMuxPolicy: 'require'
		});

		// Generic sending RTP parameters for audio and video.
		// @type {Object}
		_this._rtpParametersByKind = rtpParametersByKind;

		// Remote SDP handler.
		// @type {RemoteUnifiedPlanSdp}
		_this._remoteSdp = new _RemoteUnifiedPlanSdp2.default(direction, rtpParametersByKind);

		// Handle RTCPeerConnection connection status.
		_this._pc.addEventListener('iceconnectionstatechange', function () {
			switch (_this._pc.iceConnectionState) {
				case 'checking':
					_this.emit('@connectionstatechange', 'connecting');
					break;
				case 'connected':
				case 'completed':
					_this.emit('@connectionstatechange', 'connected');
					break;
				case 'failed':
					_this.emit('@connectionstatechange', 'failed');
					break;
				case 'disconnected':
					_this.emit('@connectionstatechange', 'disconnected');
					break;
				case 'closed':
					_this.emit('@connectionstatechange', 'closed');
					break;
			}
		});
		return _this;
	}

	(0, _createClass3.default)(Handler, [{
		key: 'close',
		value: function close() {
			logger.debug('close()');

			// Close RTCPeerConnection.
			try {
				this._pc.close();
			} catch (error) {}
		}
	}]);
	return Handler;
}(_EnhancedEventEmitter3.default);

var SendHandler = function (_Handler) {
	(0, _inherits3.default)(SendHandler, _Handler);

	function SendHandler(rtpParametersByKind, settings) {
		(0, _classCallCheck3.default)(this, SendHandler);

		// Got transport local and remote parameters.
		// @type {Boolean}
		var _this2 = (0, _possibleConstructorReturn3.default)(this, (SendHandler.__proto__ || (0, _getPrototypeOf2.default)(SendHandler)).call(this, 'send', rtpParametersByKind, settings));

		_this2._transportReady = false;

		// Local stream.
		// @type {MediaStream}
		_this2._stream = new MediaStream();
		return _this2;
	}

	(0, _createClass3.default)(SendHandler, [{
		key: 'addProducer',
		value: function addProducer(producer) {
			var _this3 = this;

			var track = producer.track;


			logger.debug('addProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);

			var rtpSender = void 0;
			var localSdpObj = void 0;

			return _promise2.default.resolve().then(function () {
				_this3._stream.addTrack(track);

				// Add the stream to the PeerConnection.
				rtpSender = _this3._pc.addTrack(track, _this3._stream);

				return _this3._pc.createOffer();
			}).then(function (offer) {
				return _this3._pc.setLocalDescription(offer);
			}).then(function () {
				if (!_this3._transportReady) return _this3._setupTransport();
			}).then(function () {
				localSdpObj = _sdpTransform2.default.parse(_this3._pc.localDescription.sdp);

				var remoteSdp = _this3._remoteSdp.createAnswerSdp(localSdpObj);
				var answer = { type: 'answer', sdp: remoteSdp };

				return _this3._pc.setRemoteDescription(answer);
			}).then(function () {
				var rtpParameters = utils.clone(_this3._rtpParametersByKind[producer.kind]);

				// Fill the RTP parameters for this track.
				sdpUnifiedPlanUtils.fillRtpParametersForTrack(rtpParameters, localSdpObj, track);

				return rtpParameters;
			}).catch(function (error) {
				// Panic here. Try to undo things.

				try {
					_this3._pc.removeTrack(rtpSender);
				} catch (error2) {}

				_this3._stream.removeTrack(track);

				throw error;
			});
		}
	}, {
		key: 'removeProducer',
		value: function removeProducer(producer) {
			var _this4 = this;

			var track = producer.track;


			logger.debug('removeProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);

			return _promise2.default.resolve().then(function () {
				// Get the associated RTCRtpSender.
				var rtpSender = _this4._pc.getSenders().find(function (s) {
					return s.track === track;
				});

				if (!rtpSender) throw new Error('local track not found');

				// Remove the associated RtpSender.
				_this4._pc.removeTrack(rtpSender);

				// Remove the track from the local stream.
				_this4._stream.removeTrack(track);

				// NOTE: If there are no sending tracks, setLocalDescription() will cause
				// Firefox to close DTLS. So for now, let's avoid such a SDP O/A and leave
				// at least a fake-active sending track.
				if (_this4._stream.getTracks().length === 0) return;

				return _promise2.default.resolve().then(function () {
					return _this4._pc.createOffer();
				}).then(function (offer) {
					return _this4._pc.setLocalDescription(offer);
				});
			}).then(function () {
				if (_this4._pc.signalingState === 'stable') return;

				var localSdpObj = _sdpTransform2.default.parse(_this4._pc.localDescription.sdp);
				var remoteSdp = _this4._remoteSdp.createAnswerSdp(localSdpObj);
				var answer = { type: 'answer', sdp: remoteSdp };

				return _this4._pc.setRemoteDescription(answer);
			});
		}
	}, {
		key: '_setupTransport',
		value: function _setupTransport() {
			var _this5 = this;

			logger.debug('_setupTransport()');

			return _promise2.default.resolve().then(function () {
				// Get our local DTLS parameters.
				var transportLocalParameters = {};
				var sdp = _this5._pc.localDescription.sdp;
				var sdpObj = _sdpTransform2.default.parse(sdp);
				var dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);

				// Let's decide that we'll be DTLS server (because we can).
				dtlsParameters.role = 'server';

				transportLocalParameters.dtlsParameters = dtlsParameters;

				// Provide the remote SDP handler with transport local parameters.
				_this5._remoteSdp.setTransportLocalParameters(transportLocalParameters);

				// We need transport remote parameters.
				return _this5.safeEmitAsPromise('@needcreatetransport', transportLocalParameters);
			}).then(function (transportRemoteParameters) {
				// Provide the remote SDP handler with transport remote parameters.
				_this5._remoteSdp.setTransportRemoteParameters(transportRemoteParameters);

				_this5._transportReady = true;
			});
		}
	}]);
	return SendHandler;
}(Handler);

var RecvHandler = function (_Handler2) {
	(0, _inherits3.default)(RecvHandler, _Handler2);

	function RecvHandler(rtpParametersByKind, settings) {
		(0, _classCallCheck3.default)(this, RecvHandler);

		// Got transport remote parameters.
		// @type {Boolean}
		var _this6 = (0, _possibleConstructorReturn3.default)(this, (RecvHandler.__proto__ || (0, _getPrototypeOf2.default)(RecvHandler)).call(this, 'recv', rtpParametersByKind, settings));

		_this6._transportCreated = false;

		// Got transport local parameters.
		// @type {Boolean}
		_this6._transportUpdated = false;

		// Map of Consumers information indexed by consumer.id.
		// - mid {String}
		// - kind {String}
		// - closed {Boolean}
		// - trackId {String}
		// - ssrc {Number}
		// - rtxSsrc {Number}
		// - cname {String}
		// @type {Map<Number, Object>}
		_this6._consumerInfos = new _map2.default();
		return _this6;
	}

	(0, _createClass3.default)(RecvHandler, [{
		key: 'addConsumer',
		value: function addConsumer(consumer) {
			var _this7 = this;

			logger.debug('addConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);

			if (this._consumerInfos.has(consumer.id)) return _promise2.default.reject('Consumer already added');

			var encoding = consumer.rtpParameters.encodings[0];
			var cname = consumer.rtpParameters.rtcp.cname;
			var consumerInfo = {
				mid: 'consumer-' + consumer.kind + '-' + consumer.id,
				kind: consumer.kind,
				closed: consumer.closed,
				trackId: 'consumer-' + consumer.kind + '-' + consumer.id,
				ssrc: encoding.ssrc,
				cname: cname
			};

			if (encoding.rtx && encoding.rtx.ssrc) consumerInfo.rtxSsrc = encoding.rtx.ssrc;

			this._consumerInfos.set(consumer.id, consumerInfo);

			return _promise2.default.resolve().then(function () {
				if (!_this7._transportCreated) return _this7._setupTransport();
			}).then(function () {
				var remoteSdp = _this7._remoteSdp.createOfferSdp((0, _from2.default)(_this7._consumerInfos.values()));
				var offer = { type: 'offer', sdp: remoteSdp };

				return _this7._pc.setRemoteDescription(offer);
			}).then(function () {
				return _this7._pc.createAnswer();
			}).then(function (answer) {
				return _this7._pc.setLocalDescription(answer);
			}).then(function () {
				if (!_this7._transportUpdated) return _this7._updateTransport();
			}).then(function () {
				var newRtpReceiver = _this7._pc.getReceivers().find(function (rtpReceiver) {
					var track = rtpReceiver.track;


					if (!track) return false;

					return track.id === consumerInfo.trackId;
				});

				if (!newRtpReceiver) throw new Error('remote track not found');

				return newRtpReceiver.track;
			});
		}
	}, {
		key: 'removeConsumer',
		value: function removeConsumer(consumer) {
			var _this8 = this;

			// TODO: If this is the last active Consumer, Firefox will close the DTLS.
			// This is noted in the TODO.md file.

			logger.debug('removeConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);

			var consumerInfo = this._consumerInfos.get(consumer.id);

			if (!consumerInfo) return _promise2.default.reject('Consumer not found');

			consumerInfo.closed = true;

			return _promise2.default.resolve().then(function () {
				var remoteSdp = _this8._remoteSdp.createOfferSdp((0, _from2.default)(_this8._consumerInfos.values()));
				var offer = { type: 'offer', sdp: remoteSdp };

				return _this8._pc.setRemoteDescription(offer);
			}).then(function () {
				return _this8._pc.createAnswer();
			}).then(function (answer) {
				return _this8._pc.setLocalDescription(answer);
			});
		}
	}, {
		key: '_setupTransport',
		value: function _setupTransport() {
			var _this9 = this;

			logger.debug('_setupTransport()');

			return _promise2.default.resolve().then(function () {
				// We need transport remote parameters.
				return _this9.safeEmitAsPromise('@needcreatetransport', null);
			}).then(function (transportRemoteParameters) {
				// Provide the remote SDP handler with transport remote parameters.
				_this9._remoteSdp.setTransportRemoteParameters(transportRemoteParameters);

				_this9._transportCreated = true;
			});
		}
	}, {
		key: '_updateTransport',
		value: function _updateTransport() {
			logger.debug('_updateTransport()');

			// Get our local DTLS parameters.
			// const transportLocalParameters = {};
			var sdp = this._pc.localDescription.sdp;
			var sdpObj = _sdpTransform2.default.parse(sdp);
			var dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);
			var transportLocalParameters = { dtlsParameters: dtlsParameters };

			// We need to provide transport local parameters.
			this.safeEmit('@needupdatetransport', transportLocalParameters);

			this._transportUpdated = true;
		}
	}]);
	return RecvHandler;
}(Handler);

var Firefox50 = function () {
	(0, _createClass3.default)(Firefox50, null, [{
		key: 'getLocalRtpCapabilities',
		value: function getLocalRtpCapabilities() {
			logger.debug('getLocalRtpCapabilities()');

			var pc = new RTCPeerConnection({
				iceServers: [],
				iceTransportPolicy: 'relay',
				bundlePolicy: 'max-bundle',
				rtcpMuxPolicy: 'require'
			});

			return pc.createOffer({
				offerToReceiveAudio: true,
				offerToReceiveVideo: true
			}).then(function (offer) {
				try {
					pc.close();
				} catch (error) {}

				var sdpObj = _sdpTransform2.default.parse(offer.sdp);
				var localRtpCapabilities = sdpCommonUtils.extractRtpCapabilities(sdpObj);

				return localRtpCapabilities;
			}).catch(function (error) {
				try {
					pc.close();
				} catch (error2) {}

				throw error;
			});
		}
	}, {
		key: 'name',
		get: function get() {
			return 'Firefox50';
		}
	}]);

	function Firefox50(direction, extendedRtpCapabilities, settings) {
		(0, _classCallCheck3.default)(this, Firefox50);

		logger.debug('constructor() [direction:%s, extendedRtpCapabilities:%o]', direction, extendedRtpCapabilities);

		var rtpParametersByKind = void 0;

		switch (direction) {
			case 'send':
				{
					rtpParametersByKind = {
						audio: utils.getSendingRtpParameters('audio', extendedRtpCapabilities),
						video: utils.getSendingRtpParameters('video', extendedRtpCapabilities)
					};

					return new SendHandler(rtpParametersByKind, settings);
				}
			case 'recv':
				{
					rtpParametersByKind = {
						audio: utils.getReceivingFullRtpParameters('audio', extendedRtpCapabilities),
						video: utils.getReceivingFullRtpParameters('video', extendedRtpCapabilities)
					};

					return new RecvHandler(rtpParametersByKind, settings);
				}
		}
	}

	return Firefox50;
}();

exports.default = Firefox50;

},{"../EnhancedEventEmitter":"/Users/ibc/src/mediasoup-client/lib/EnhancedEventEmitter.js","../Logger":"/Users/ibc/src/mediasoup-client/lib/Logger.js","../utils":"/Users/ibc/src/mediasoup-client/lib/utils.js","./sdp/RemoteUnifiedPlanSdp":"/Users/ibc/src/mediasoup-client/lib/handlers/sdp/RemoteUnifiedPlanSdp.js","./sdp/commonUtils":"/Users/ibc/src/mediasoup-client/lib/handlers/sdp/commonUtils.js","./sdp/unifiedPlanUtils":"/Users/ibc/src/mediasoup-client/lib/handlers/sdp/unifiedPlanUtils.js","babel-runtime/core-js/array/from":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/array/from.js","babel-runtime/core-js/map":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/map.js","babel-runtime/core-js/object/get-prototype-of":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/get-prototype-of.js","babel-runtime/core-js/promise":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/promise.js","babel-runtime/helpers/classCallCheck":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/classCallCheck.js","babel-runtime/helpers/createClass":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/createClass.js","babel-runtime/helpers/inherits":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/inherits.js","babel-runtime/helpers/possibleConstructorReturn":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/possibleConstructorReturn.js","sdp-transform":"/Users/ibc/src/mediasoup-client/node_modules/sdp-transform/lib/index.js"}],"/Users/ibc/src/mediasoup-client/lib/handlers/Safari11.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _sdpTransform = require('sdp-transform');

var _sdpTransform2 = _interopRequireDefault(_sdpTransform);

var _Logger = require('../Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _EnhancedEventEmitter2 = require('../EnhancedEventEmitter');

var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);

var _utils = require('../utils');

var utils = _interopRequireWildcard(_utils);

var _commonUtils = require('./sdp/commonUtils');

var sdpCommonUtils = _interopRequireWildcard(_commonUtils);

var _planBUtils = require('./sdp/planBUtils');

var sdpPlanBUtils = _interopRequireWildcard(_planBUtils);

var _RemotePlanBSdp = require('./sdp/RemotePlanBSdp');

var _RemotePlanBSdp2 = _interopRequireDefault(_RemotePlanBSdp);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = new _Logger2.default('Safari11');

var Handler = function (_EnhancedEventEmitter) {
	(0, _inherits3.default)(Handler, _EnhancedEventEmitter);

	function Handler(direction, rtpParametersByKind, settings) {
		(0, _classCallCheck3.default)(this, Handler);

		// RTCPeerConnection instance.
		// @type {RTCPeerConnection}
		var _this = (0, _possibleConstructorReturn3.default)(this, (Handler.__proto__ || (0, _getPrototypeOf2.default)(Handler)).call(this));

		_this._pc = new RTCPeerConnection({
			iceServers: settings.turnServers || [],
			iceTransportPolicy: 'relay',
			bundlePolicy: 'max-bundle',
			rtcpMuxPolicy: 'require'
		});

		// Generic sending RTP parameters for audio and video.
		// @type {Object}
		_this._rtpParametersByKind = rtpParametersByKind;

		// Remote SDP handler.
		// @type {RemotePlanBSdp}
		_this._remoteSdp = new _RemotePlanBSdp2.default(direction, rtpParametersByKind);

		// Handle RTCPeerConnection connection status.
		_this._pc.addEventListener('iceconnectionstatechange', function () {
			switch (_this._pc.iceConnectionState) {
				case 'checking':
					_this.emit('@connectionstatechange', 'connecting');
					break;
				case 'connected':
				case 'completed':
					_this.emit('@connectionstatechange', 'connected');
					break;
				case 'failed':
					_this.emit('@connectionstatechange', 'failed');
					break;
				case 'disconnected':
					_this.emit('@connectionstatechange', 'disconnected');
					break;
				case 'closed':
					_this.emit('@connectionstatechange', 'closed');
					break;
			}
		});
		return _this;
	}

	(0, _createClass3.default)(Handler, [{
		key: 'close',
		value: function close() {
			logger.debug('close()');

			// Close RTCPeerConnection.
			try {
				this._pc.close();
			} catch (error) {}
		}
	}]);
	return Handler;
}(_EnhancedEventEmitter3.default);

var SendHandler = function (_Handler) {
	(0, _inherits3.default)(SendHandler, _Handler);

	function SendHandler(rtpParametersByKind, settings) {
		(0, _classCallCheck3.default)(this, SendHandler);

		// Got transport local and remote parameters.
		// @type {Boolean}
		var _this2 = (0, _possibleConstructorReturn3.default)(this, (SendHandler.__proto__ || (0, _getPrototypeOf2.default)(SendHandler)).call(this, 'send', rtpParametersByKind, settings));

		_this2._transportReady = false;

		// Local stream.
		// @type {MediaStream}
		_this2._stream = new MediaStream();
		return _this2;
	}

	(0, _createClass3.default)(SendHandler, [{
		key: 'addProducer',
		value: function addProducer(producer) {
			var _this3 = this;

			var track = producer.track;


			logger.debug('addProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);

			var rtpSender = void 0;
			var localSdpObj = void 0;

			return _promise2.default.resolve().then(function () {
				_this3._stream.addTrack(track);

				// Add the stream to the PeerConnection.
				rtpSender = _this3._pc.addTrack(track, _this3._stream);

				return _this3._pc.createOffer();
			}).then(function (offer) {
				return _this3._pc.setLocalDescription(offer);
			}).then(function () {
				if (!_this3._transportReady) return _this3._setupTransport();
			}).then(function () {
				localSdpObj = _sdpTransform2.default.parse(_this3._pc.localDescription.sdp);

				var remoteSdp = _this3._remoteSdp.createAnswerSdp(localSdpObj);
				var answer = { type: 'answer', sdp: remoteSdp };

				return _this3._pc.setRemoteDescription(answer);
			}).then(function () {
				var rtpParameters = utils.clone(_this3._rtpParametersByKind[producer.kind]);

				// Fill the RTP parameters for this track.
				sdpPlanBUtils.fillRtpParametersForTrack(rtpParameters, localSdpObj, track);

				return rtpParameters;
			}).catch(function (error) {
				// Panic here. Try to undo things.

				try {
					_this3._pc.removeTrack(rtpSender);
				} catch (error2) {}

				_this3._stream.removeTrack(track);

				throw error;
			});
		}
	}, {
		key: 'removeProducer',
		value: function removeProducer(producer) {
			var _this4 = this;

			var track = producer.track;


			logger.debug('removeProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);

			return _promise2.default.resolve().then(function () {
				// Get the associated RTCRtpSender.
				var rtpSender = _this4._pc.getSenders().find(function (s) {
					return s.track === track;
				});

				if (!rtpSender) throw new Error('local track not found');

				// Remove the associated RtpSender.
				_this4._pc.removeTrack(rtpSender);

				// Remove the track from the local stream.
				_this4._stream.removeTrack(track);

				return _this4._pc.createOffer();
			}).then(function (offer) {
				return _this4._pc.setLocalDescription(offer);
			}).catch(function (error) {
				// NOTE: If there are no sending tracks, setLocalDescription() will fail with
				// "Failed to create channels". If so, ignore it.
				if (_this4._stream.getTracks().length === 0) {
					logger.warn('removeLocalTrack() | ignoring expected error due no sending tracks: %s', error.toString());

					return;
				}

				throw error;
			}).then(function () {
				if (_this4._pc.signalingState === 'stable') return;

				var localSdpObj = _sdpTransform2.default.parse(_this4._pc.localDescription.sdp);
				var remoteSdp = _this4._remoteSdp.createAnswerSdp(localSdpObj);
				var answer = { type: 'answer', sdp: remoteSdp };

				return _this4._pc.setRemoteDescription(answer);
			});
		}
	}, {
		key: '_setupTransport',
		value: function _setupTransport() {
			var _this5 = this;

			logger.debug('_setupTransport()');

			return _promise2.default.resolve().then(function () {
				// Get our local DTLS parameters.
				var transportLocalParameters = {};
				var sdp = _this5._pc.localDescription.sdp;
				var sdpObj = _sdpTransform2.default.parse(sdp);
				var dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);

				// Let's decide that we'll be DTLS server (because we can).
				dtlsParameters.role = 'server';

				transportLocalParameters.dtlsParameters = dtlsParameters;

				// Provide the remote SDP handler with transport local parameters.
				_this5._remoteSdp.setTransportLocalParameters(transportLocalParameters);

				// We need transport remote parameters.
				return _this5.safeEmitAsPromise('@needcreatetransport', transportLocalParameters);
			}).then(function (transportRemoteParameters) {
				// Provide the remote SDP handler with transport remote parameters.
				_this5._remoteSdp.setTransportRemoteParameters(transportRemoteParameters);

				_this5._transportReady = true;
			});
		}
	}]);
	return SendHandler;
}(Handler);

var RecvHandler = function (_Handler2) {
	(0, _inherits3.default)(RecvHandler, _Handler2);

	function RecvHandler(rtpParametersByKind, settings) {
		(0, _classCallCheck3.default)(this, RecvHandler);

		// Got transport remote parameters.
		// @type {Boolean}
		var _this6 = (0, _possibleConstructorReturn3.default)(this, (RecvHandler.__proto__ || (0, _getPrototypeOf2.default)(RecvHandler)).call(this, 'recv', rtpParametersByKind, settings));

		_this6._transportCreated = false;

		// Got transport local parameters.
		// @type {Boolean}
		_this6._transportUpdated = false;

		// Seen media kinds.
		// @type {Set<String>}
		_this6._kinds = new _set2.default();

		// Map of Consumers information indexed by consumer.id.
		// - kind {String}
		// - trackId {String}
		// - ssrc {Number}
		// - rtxSsrc {Number}
		// - cname {String}
		// @type {Map<Number, Object>}
		_this6._consumerInfos = new _map2.default();
		return _this6;
	}

	(0, _createClass3.default)(RecvHandler, [{
		key: 'addConsumer',
		value: function addConsumer(consumer) {
			var _this7 = this;

			logger.debug('addConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);

			if (this._consumerInfos.has(consumer.id)) return _promise2.default.reject('Consumer already added');

			var encoding = consumer.rtpParameters.encodings[0];
			var cname = consumer.rtpParameters.rtcp.cname;
			var consumerInfo = {
				kind: consumer.kind,
				trackId: 'consumer-' + consumer.kind + '-' + consumer.id,
				ssrc: encoding.ssrc,
				cname: cname
			};

			if (encoding.rtx && encoding.rtx.ssrc) consumerInfo.rtxSsrc = encoding.rtx.ssrc;

			this._consumerInfos.set(consumer.id, consumerInfo);
			this._kinds.add(consumer.kind);

			return _promise2.default.resolve().then(function () {
				if (!_this7._transportCreated) return _this7._setupTransport();
			}).then(function () {
				var remoteSdp = _this7._remoteSdp.createOfferSdp((0, _from2.default)(_this7._kinds), (0, _from2.default)(_this7._consumerInfos.values()));
				var offer = { type: 'offer', sdp: remoteSdp };

				return _this7._pc.setRemoteDescription(offer);
			}).then(function () {
				return _this7._pc.createAnswer();
			}).then(function (answer) {
				return _this7._pc.setLocalDescription(answer);
			}).then(function () {
				if (!_this7._transportUpdated) return _this7._updateTransport();
			}).then(function () {
				var newRtpReceiver = _this7._pc.getReceivers().find(function (rtpReceiver) {
					var track = rtpReceiver.track;


					if (!track) return false;

					return track.id === consumerInfo.trackId;
				});

				if (!newRtpReceiver) throw new Error('remote track not found');

				return newRtpReceiver.track;
			});
		}
	}, {
		key: 'removeConsumer',
		value: function removeConsumer(consumer) {
			var _this8 = this;

			logger.debug('removeConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);

			if (!this._consumerInfos.has(consumer.id)) return _promise2.default.reject('Consumer not found');

			this._consumerInfos.delete(consumer.id);

			return _promise2.default.resolve().then(function () {
				var remoteSdp = _this8._remoteSdp.createOfferSdp((0, _from2.default)(_this8._kinds), (0, _from2.default)(_this8._consumerInfos.values()));
				var offer = { type: 'offer', sdp: remoteSdp };

				return _this8._pc.setRemoteDescription(offer);
			}).then(function () {
				return _this8._pc.createAnswer();
			}).then(function (answer) {
				return _this8._pc.setLocalDescription(answer);
			});
		}
	}, {
		key: '_setupTransport',
		value: function _setupTransport() {
			var _this9 = this;

			logger.debug('_setupTransport()');

			return _promise2.default.resolve().then(function () {
				// We need transport remote parameters.
				return _this9.safeEmitAsPromise('@needcreatetransport', null);
			}).then(function (transportRemoteParameters) {
				// Provide the remote SDP handler with transport remote parameters.
				_this9._remoteSdp.setTransportRemoteParameters(transportRemoteParameters);

				_this9._transportCreated = true;
			});
		}
	}, {
		key: '_updateTransport',
		value: function _updateTransport() {
			logger.debug('_updateTransport()');

			// Get our local DTLS parameters.
			// const transportLocalParameters = {};
			var sdp = this._pc.localDescription.sdp;
			var sdpObj = _sdpTransform2.default.parse(sdp);
			var dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);
			var transportLocalParameters = { dtlsParameters: dtlsParameters };

			// We need to provide transport local parameters.
			this.safeEmit('@needupdatetransport', transportLocalParameters);

			this._transportUpdated = true;
		}
	}]);
	return RecvHandler;
}(Handler);

var Safari11 = function () {
	(0, _createClass3.default)(Safari11, null, [{
		key: 'getLocalRtpCapabilities',
		value: function getLocalRtpCapabilities() {
			logger.debug('getLocalRtpCapabilities()');

			var pc = new RTCPeerConnection({
				iceServers: [],
				iceTransportPolicy: 'relay',
				bundlePolicy: 'max-bundle',
				rtcpMuxPolicy: 'require'
			});

			pc.addTransceiver('audio');
			pc.addTransceiver('video');

			return pc.createOffer().then(function (offer) {
				try {
					pc.close();
				} catch (error) {}

				var sdpObj = _sdpTransform2.default.parse(offer.sdp);
				var localRtpCapabilities = sdpCommonUtils.extractRtpCapabilities(sdpObj);

				return localRtpCapabilities;
			}).catch(function (error) {
				try {
					pc.close();
				} catch (error2) {}

				throw error;
			});
		}
	}, {
		key: 'name',
		get: function get() {
			return 'Safari11';
		}
	}]);

	function Safari11(direction, extendedRtpCapabilities, settings) {
		(0, _classCallCheck3.default)(this, Safari11);

		logger.debug('constructor() [direction:%s, extendedRtpCapabilities:%o]', direction, extendedRtpCapabilities);

		var rtpParametersByKind = void 0;

		switch (direction) {
			case 'send':
				{
					rtpParametersByKind = {
						audio: utils.getSendingRtpParameters('audio', extendedRtpCapabilities),
						video: utils.getSendingRtpParameters('video', extendedRtpCapabilities)
					};

					return new SendHandler(rtpParametersByKind, settings);
				}
			case 'recv':
				{
					rtpParametersByKind = {
						audio: utils.getReceivingFullRtpParameters('audio', extendedRtpCapabilities),
						video: utils.getReceivingFullRtpParameters('video', extendedRtpCapabilities)
					};

					return new RecvHandler(rtpParametersByKind, settings);
				}
		}
	}

	return Safari11;
}();

exports.default = Safari11;

},{"../EnhancedEventEmitter":"/Users/ibc/src/mediasoup-client/lib/EnhancedEventEmitter.js","../Logger":"/Users/ibc/src/mediasoup-client/lib/Logger.js","../utils":"/Users/ibc/src/mediasoup-client/lib/utils.js","./sdp/RemotePlanBSdp":"/Users/ibc/src/mediasoup-client/lib/handlers/sdp/RemotePlanBSdp.js","./sdp/commonUtils":"/Users/ibc/src/mediasoup-client/lib/handlers/sdp/commonUtils.js","./sdp/planBUtils":"/Users/ibc/src/mediasoup-client/lib/handlers/sdp/planBUtils.js","babel-runtime/core-js/array/from":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/array/from.js","babel-runtime/core-js/map":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/map.js","babel-runtime/core-js/object/get-prototype-of":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/get-prototype-of.js","babel-runtime/core-js/promise":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/promise.js","babel-runtime/core-js/set":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/set.js","babel-runtime/helpers/classCallCheck":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/classCallCheck.js","babel-runtime/helpers/createClass":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/createClass.js","babel-runtime/helpers/inherits":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/inherits.js","babel-runtime/helpers/possibleConstructorReturn":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/possibleConstructorReturn.js","sdp-transform":"/Users/ibc/src/mediasoup-client/node_modules/sdp-transform/lib/index.js"}],"/Users/ibc/src/mediasoup-client/lib/handlers/sdp/RemotePlanBSdp.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _sdpTransform = require('sdp-transform');

var _sdpTransform2 = _interopRequireDefault(_sdpTransform);

var _Logger = require('../../Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _utils = require('../../utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = new _Logger2.default('RemotePlanBSdp');

var RemoteSdp = function () {
	function RemoteSdp(rtpParametersByKind) {
		(0, _classCallCheck3.default)(this, RemoteSdp);

		// Generic sending RTP parameters for audio and video.
		// @type {Object}
		this._rtpParametersByKind = rtpParametersByKind;

		// Transport local parameters, including DTLS parameteres.
		// @type {Object}
		this._transportLocalParameters = null;

		// Transport remote parameters, including ICE parameters, ICE candidates
		// and DTLS parameteres.
		// @type {Object}
		this._transportRemoteParameters = null;

		// SDP global fields.
		// @type {Object}
		this._sdpGlobalFields = {
			id: utils.randomNumber(),
			version: 0
		};
	}

	(0, _createClass3.default)(RemoteSdp, [{
		key: 'setTransportLocalParameters',
		value: function setTransportLocalParameters(transportLocalParameters) {
			logger.debug('setTransportLocalParameters() [transportLocalParameters:%o]', transportLocalParameters);

			this._transportLocalParameters = transportLocalParameters;
		}
	}, {
		key: 'setTransportRemoteParameters',
		value: function setTransportRemoteParameters(transportRemoteParameters) {
			logger.debug('setTransportRemoteParameters() [transportRemoteParameters:%o]', transportRemoteParameters);

			this._transportRemoteParameters = transportRemoteParameters;
		}
	}]);
	return RemoteSdp;
}();

var SendRemoteSdp = function (_RemoteSdp) {
	(0, _inherits3.default)(SendRemoteSdp, _RemoteSdp);

	function SendRemoteSdp(rtpParametersByKind) {
		(0, _classCallCheck3.default)(this, SendRemoteSdp);
		return (0, _possibleConstructorReturn3.default)(this, (SendRemoteSdp.__proto__ || (0, _getPrototypeOf2.default)(SendRemoteSdp)).call(this, rtpParametersByKind));
	}

	(0, _createClass3.default)(SendRemoteSdp, [{
		key: 'createAnswerSdp',
		value: function createAnswerSdp(localSdpObj) {
			logger.debug('createAnswerSdp()');

			if (!this._transportLocalParameters) throw new Error('no transport local parameters');else if (!this._transportRemoteParameters) throw new Error('no transport remote parameters');

			var localDtlsParameters = this._transportLocalParameters.dtlsParameters;
			var remoteIceParameters = this._transportRemoteParameters.iceParameters;
			var remoteIceCandidates = this._transportRemoteParameters.iceCandidates;
			var remoteDtlsParameters = this._transportRemoteParameters.dtlsParameters;
			var sdpObj = {};
			var mids = (localSdpObj.media || []).map(function (m) {
				return m.mid;
			});

			// Increase our SDP version.
			this._sdpGlobalFields.version++;

			sdpObj.version = 0;
			sdpObj.origin = {
				address: '0.0.0.0',
				ipVer: 4,
				netType: 'IN',
				sessionId: this._sdpGlobalFields.id,
				sessionVersion: this._sdpGlobalFields.version,
				username: 'mediasoup-client'
			};
			sdpObj.name = '-';
			sdpObj.timing = { start: 0, stop: 0 };
			sdpObj.icelite = remoteIceParameters.iceLite ? 'ice-lite' : null;
			sdpObj.msidSemantic = {
				semantic: 'WMS',
				token: '*'
			};
			sdpObj.groups = [{
				type: 'BUNDLE',
				mids: mids.join(' ')
			}];
			sdpObj.media = [];

			sdpObj.fingerprint = {
				type: remoteDtlsParameters.fingerprints[0].algorithm,
				hash: remoteDtlsParameters.fingerprints[0].value
			};

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = (0, _getIterator3.default)(localSdpObj.media || []), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var localMediaObj = _step.value;

					var kind = localMediaObj.type;
					var codecs = this._rtpParametersByKind[kind].codecs;
					var headerExtensions = this._rtpParametersByKind[kind].headerExtensions;
					var remoteMediaObj = {};

					remoteMediaObj.type = localMediaObj.type;
					remoteMediaObj.port = 7;
					remoteMediaObj.protocol = 'RTP/SAVPF';
					remoteMediaObj.connection = { ip: '127.0.0.1', version: 4 };
					remoteMediaObj.mid = localMediaObj.mid;

					remoteMediaObj.iceUfrag = remoteIceParameters.usernameFragment;
					remoteMediaObj.icePwd = remoteIceParameters.password;
					remoteMediaObj.candidates = [];

					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = (0, _getIterator3.default)(remoteIceCandidates), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							var candidate = _step2.value;

							var candidateObj = {};

							// mediasoup does not support non rtcp-mux so candidates component is
							// always RTP (1).
							candidateObj.component = 1;
							candidateObj.foundation = candidate.foundation;
							candidateObj.ip = candidate.ip;
							candidateObj.port = candidate.port;
							candidateObj.priority = candidate.priority;
							candidateObj.transport = candidate.protocol;
							candidateObj.type = candidate.type;
							if (candidate.tcpType) candidateObj.tcptype = candidate.tcpType;

							remoteMediaObj.candidates.push(candidateObj);
						}
					} catch (err) {
						_didIteratorError2 = true;
						_iteratorError2 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}
						} finally {
							if (_didIteratorError2) {
								throw _iteratorError2;
							}
						}
					}

					remoteMediaObj.endOfCandidates = 'end-of-candidates';

					// Announce support for ICE renomination.
					// https://tools.ietf.org/html/draft-thatcher-ice-renomination
					remoteMediaObj.iceOptions = 'renomination';

					switch (localDtlsParameters.role) {
						case 'client':
							remoteMediaObj.setup = 'active';
							break;
						case 'server':
							remoteMediaObj.setup = 'passive';
							break;
					}

					switch (localMediaObj.direction) {
						case 'sendrecv':
						case 'sendonly':
							remoteMediaObj.direction = 'recvonly';
							break;
						case 'recvonly':
						case 'inactive':
							remoteMediaObj.direction = 'inactive';
							break;
					}

					remoteMediaObj.rtp = [];
					remoteMediaObj.rtcpFb = [];
					remoteMediaObj.fmtp = [];

					var _iteratorNormalCompletion3 = true;
					var _didIteratorError3 = false;
					var _iteratorError3 = undefined;

					try {
						for (var _iterator3 = (0, _getIterator3.default)(codecs), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
							var codec = _step3.value;

							var rtp = {
								payload: codec.payloadType,
								codec: codec.name,
								rate: codec.clockRate
							};

							if (codec.channels > 1) rtp.encoding = codec.channels;

							remoteMediaObj.rtp.push(rtp);

							if (codec.parameters) {
								var paramFmtp = {
									payload: codec.payloadType,
									config: ''
								};

								var _iteratorNormalCompletion5 = true;
								var _didIteratorError5 = false;
								var _iteratorError5 = undefined;

								try {
									for (var _iterator5 = (0, _getIterator3.default)((0, _keys2.default)(codec.parameters)), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
										var key = _step5.value;

										if (paramFmtp.config) paramFmtp.config += ';';

										paramFmtp.config += key + '=' + codec.parameters[key];
									}
								} catch (err) {
									_didIteratorError5 = true;
									_iteratorError5 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion5 && _iterator5.return) {
											_iterator5.return();
										}
									} finally {
										if (_didIteratorError5) {
											throw _iteratorError5;
										}
									}
								}

								if (paramFmtp.config) remoteMediaObj.fmtp.push(paramFmtp);
							}

							if (codec.rtcpFeedback) {
								var _iteratorNormalCompletion6 = true;
								var _didIteratorError6 = false;
								var _iteratorError6 = undefined;

								try {
									for (var _iterator6 = (0, _getIterator3.default)(codec.rtcpFeedback), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
										var fb = _step6.value;

										remoteMediaObj.rtcpFb.push({
											payload: codec.payloadType,
											type: fb.type,
											subtype: fb.parameter
										});
									}
								} catch (err) {
									_didIteratorError6 = true;
									_iteratorError6 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion6 && _iterator6.return) {
											_iterator6.return();
										}
									} finally {
										if (_didIteratorError6) {
											throw _iteratorError6;
										}
									}
								}
							}
						}
					} catch (err) {
						_didIteratorError3 = true;
						_iteratorError3 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion3 && _iterator3.return) {
								_iterator3.return();
							}
						} finally {
							if (_didIteratorError3) {
								throw _iteratorError3;
							}
						}
					}

					remoteMediaObj.payloads = codecs.map(function (codec) {
						return codec.payloadType;
					}).join(' ');

					remoteMediaObj.ext = [];

					var _iteratorNormalCompletion4 = true;
					var _didIteratorError4 = false;
					var _iteratorError4 = undefined;

					try {
						for (var _iterator4 = (0, _getIterator3.default)(headerExtensions), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
							var ext = _step4.value;

							remoteMediaObj.ext.push({
								uri: ext.uri,
								value: ext.id
							});
						}
					} catch (err) {
						_didIteratorError4 = true;
						_iteratorError4 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion4 && _iterator4.return) {
								_iterator4.return();
							}
						} finally {
							if (_didIteratorError4) {
								throw _iteratorError4;
							}
						}
					}

					remoteMediaObj.rtcpMux = 'rtcp-mux';
					remoteMediaObj.rtcpRsize = 'rtcp-rsize';

					// Push it.
					sdpObj.media.push(remoteMediaObj);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			var sdp = _sdpTransform2.default.write(sdpObj);

			return sdp;
		}
	}]);
	return SendRemoteSdp;
}(RemoteSdp);

var RecvRemoteSdp = function (_RemoteSdp2) {
	(0, _inherits3.default)(RecvRemoteSdp, _RemoteSdp2);

	function RecvRemoteSdp(rtpParametersByKind) {
		(0, _classCallCheck3.default)(this, RecvRemoteSdp);

		// Id of the unique MediaStream for all the remote tracks.
		var _this2 = (0, _possibleConstructorReturn3.default)(this, (RecvRemoteSdp.__proto__ || (0, _getPrototypeOf2.default)(RecvRemoteSdp)).call(this, rtpParametersByKind));

		_this2._streamId = 'recv-stream-' + utils.randomNumber();
		return _this2;
	}

	/**
  * @param {Array<String>} kinds - Media kinds.
  * @param {Array<Object>} consumerInfos - Consumer informations.
  * @return {String}
  */


	(0, _createClass3.default)(RecvRemoteSdp, [{
		key: 'createOfferSdp',
		value: function createOfferSdp(kinds, consumerInfos) {
			var _this3 = this;

			logger.debug('createOfferSdp()');

			if (!this._transportRemoteParameters) throw new Error('no transport remote parameters');

			var remoteIceParameters = this._transportRemoteParameters.iceParameters;
			var remoteIceCandidates = this._transportRemoteParameters.iceCandidates;
			var remoteDtlsParameters = this._transportRemoteParameters.dtlsParameters;
			var sdpObj = {};
			var mids = kinds;

			// Increase our SDP version.
			this._sdpGlobalFields.version++;

			sdpObj.version = 0;
			sdpObj.origin = {
				address: '0.0.0.0',
				ipVer: 4,
				netType: 'IN',
				sessionId: this._sdpGlobalFields.id,
				sessionVersion: this._sdpGlobalFields.version,
				username: 'mediasoup-client'
			};
			sdpObj.name = '-';
			sdpObj.timing = { start: 0, stop: 0 };
			sdpObj.icelite = remoteIceParameters.iceLite ? 'ice-lite' : null;
			sdpObj.msidSemantic = {
				semantic: 'WMS',
				token: '*'
			};
			sdpObj.groups = [{
				type: 'BUNDLE',
				mids: mids.join(' ')
			}];
			sdpObj.media = [];

			sdpObj.fingerprint = {
				type: remoteDtlsParameters.fingerprints[0].algorithm,
				hash: remoteDtlsParameters.fingerprints[0].value
			};

			var _iteratorNormalCompletion7 = true;
			var _didIteratorError7 = false;
			var _iteratorError7 = undefined;

			try {
				var _loop = function _loop() {
					var kind = _step7.value;

					var codecs = _this3._rtpParametersByKind[kind].codecs;
					var headerExtensions = _this3._rtpParametersByKind[kind].headerExtensions;
					var remoteMediaObj = {};

					remoteMediaObj.type = kind;
					remoteMediaObj.port = 7;
					remoteMediaObj.protocol = 'RTP/SAVPF';
					remoteMediaObj.connection = { ip: '127.0.0.1', version: 4 };
					remoteMediaObj.mid = kind;

					remoteMediaObj.iceUfrag = remoteIceParameters.usernameFragment;
					remoteMediaObj.icePwd = remoteIceParameters.password;
					remoteMediaObj.candidates = [];

					var _iteratorNormalCompletion8 = true;
					var _didIteratorError8 = false;
					var _iteratorError8 = undefined;

					try {
						for (var _iterator8 = (0, _getIterator3.default)(remoteIceCandidates), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
							var candidate = _step8.value;

							var candidateObj = {};

							// mediasoup does not support non rtcp-mux so candidates component is
							// always RTP (1).
							candidateObj.component = 1;
							candidateObj.foundation = candidate.foundation;
							candidateObj.ip = candidate.ip;
							candidateObj.port = candidate.port;
							candidateObj.priority = candidate.priority;
							candidateObj.transport = candidate.protocol;
							candidateObj.type = candidate.type;
							if (candidate.tcpType) candidateObj.tcptype = candidate.tcpType;

							remoteMediaObj.candidates.push(candidateObj);
						}
					} catch (err) {
						_didIteratorError8 = true;
						_iteratorError8 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion8 && _iterator8.return) {
								_iterator8.return();
							}
						} finally {
							if (_didIteratorError8) {
								throw _iteratorError8;
							}
						}
					}

					remoteMediaObj.endOfCandidates = 'end-of-candidates';

					// Announce support for ICE renomination.
					// https://tools.ietf.org/html/draft-thatcher-ice-renomination
					remoteMediaObj.iceOptions = 'renomination';

					remoteMediaObj.setup = 'actpass';

					if (consumerInfos.some(function (info) {
						return info.kind === kind;
					})) remoteMediaObj.direction = 'sendonly';else remoteMediaObj.direction = 'inactive';

					remoteMediaObj.rtp = [];
					remoteMediaObj.rtcpFb = [];
					remoteMediaObj.fmtp = [];

					var _iteratorNormalCompletion9 = true;
					var _didIteratorError9 = false;
					var _iteratorError9 = undefined;

					try {
						for (var _iterator9 = (0, _getIterator3.default)(codecs), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
							var codec = _step9.value;

							var rtp = {
								payload: codec.payloadType,
								codec: codec.name,
								rate: codec.clockRate
							};

							if (codec.channels > 1) rtp.encoding = codec.channels;

							remoteMediaObj.rtp.push(rtp);

							if (codec.parameters) {
								var paramFmtp = {
									payload: codec.payloadType,
									config: ''
								};

								var _iteratorNormalCompletion12 = true;
								var _didIteratorError12 = false;
								var _iteratorError12 = undefined;

								try {
									for (var _iterator12 = (0, _getIterator3.default)((0, _keys2.default)(codec.parameters)), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
										var key = _step12.value;

										if (paramFmtp.config) paramFmtp.config += ';';

										paramFmtp.config += key + '=' + codec.parameters[key];
									}
								} catch (err) {
									_didIteratorError12 = true;
									_iteratorError12 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion12 && _iterator12.return) {
											_iterator12.return();
										}
									} finally {
										if (_didIteratorError12) {
											throw _iteratorError12;
										}
									}
								}

								if (paramFmtp.config) remoteMediaObj.fmtp.push(paramFmtp);
							}

							if (codec.rtcpFeedback) {
								var _iteratorNormalCompletion13 = true;
								var _didIteratorError13 = false;
								var _iteratorError13 = undefined;

								try {
									for (var _iterator13 = (0, _getIterator3.default)(codec.rtcpFeedback), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
										var fb = _step13.value;

										remoteMediaObj.rtcpFb.push({
											payload: codec.payloadType,
											type: fb.type,
											subtype: fb.parameter
										});
									}
								} catch (err) {
									_didIteratorError13 = true;
									_iteratorError13 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion13 && _iterator13.return) {
											_iterator13.return();
										}
									} finally {
										if (_didIteratorError13) {
											throw _iteratorError13;
										}
									}
								}
							}
						}
					} catch (err) {
						_didIteratorError9 = true;
						_iteratorError9 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion9 && _iterator9.return) {
								_iterator9.return();
							}
						} finally {
							if (_didIteratorError9) {
								throw _iteratorError9;
							}
						}
					}

					remoteMediaObj.payloads = codecs.map(function (codec) {
						return codec.payloadType;
					}).join(' ');

					remoteMediaObj.ext = [];

					var _iteratorNormalCompletion10 = true;
					var _didIteratorError10 = false;
					var _iteratorError10 = undefined;

					try {
						for (var _iterator10 = (0, _getIterator3.default)(headerExtensions), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
							var ext = _step10.value;

							remoteMediaObj.ext.push({
								uri: ext.uri,
								value: ext.id
							});
						}
					} catch (err) {
						_didIteratorError10 = true;
						_iteratorError10 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion10 && _iterator10.return) {
								_iterator10.return();
							}
						} finally {
							if (_didIteratorError10) {
								throw _iteratorError10;
							}
						}
					}

					remoteMediaObj.rtcpMux = 'rtcp-mux';
					remoteMediaObj.rtcpRsize = 'rtcp-rsize';

					remoteMediaObj.ssrcs = [];
					remoteMediaObj.ssrcGroups = [];

					var _iteratorNormalCompletion11 = true;
					var _didIteratorError11 = false;
					var _iteratorError11 = undefined;

					try {
						for (var _iterator11 = (0, _getIterator3.default)(consumerInfos), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
							var info = _step11.value;

							if (info.kind !== kind) continue;

							remoteMediaObj.ssrcs.push({
								id: info.ssrc,
								attribute: 'msid',
								value: _this3._streamId + ' ' + info.trackId
							});

							remoteMediaObj.ssrcs.push({
								id: info.ssrc,
								attribute: 'mslabel',
								value: _this3._streamId
							});

							remoteMediaObj.ssrcs.push({
								id: info.ssrc,
								attribute: 'label',
								value: info.trackId
							});

							remoteMediaObj.ssrcs.push({
								id: info.ssrc,
								attribute: 'cname',
								value: info.cname
							});

							if (info.rtxSsrc) {
								remoteMediaObj.ssrcs.push({
									id: info.rtxSsrc,
									attribute: 'msid',
									value: _this3._streamId + ' ' + info.trackId
								});

								remoteMediaObj.ssrcs.push({
									id: info.rtxSsrc,
									attribute: 'mslabel',
									value: _this3._streamId
								});

								remoteMediaObj.ssrcs.push({
									id: info.rtxSsrc,
									attribute: 'label',
									value: info.trackId
								});

								remoteMediaObj.ssrcs.push({
									id: info.rtxSsrc,
									attribute: 'cname',
									value: info.cname
								});

								// Associate original and retransmission SSRC.
								remoteMediaObj.ssrcGroups.push({
									semantics: 'FID',
									ssrcs: info.ssrc + ' ' + info.rtxSsrc
								});
							}
						}

						// Push it.
					} catch (err) {
						_didIteratorError11 = true;
						_iteratorError11 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion11 && _iterator11.return) {
								_iterator11.return();
							}
						} finally {
							if (_didIteratorError11) {
								throw _iteratorError11;
							}
						}
					}

					sdpObj.media.push(remoteMediaObj);
				};

				for (var _iterator7 = (0, _getIterator3.default)(kinds), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
					_loop();
				}
			} catch (err) {
				_didIteratorError7 = true;
				_iteratorError7 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion7 && _iterator7.return) {
						_iterator7.return();
					}
				} finally {
					if (_didIteratorError7) {
						throw _iteratorError7;
					}
				}
			}

			var sdp = _sdpTransform2.default.write(sdpObj);

			return sdp;
		}
	}]);
	return RecvRemoteSdp;
}(RemoteSdp);

var RemotePlanBSdp = function RemotePlanBSdp(direction, rtpParametersByKind) {
	(0, _classCallCheck3.default)(this, RemotePlanBSdp);

	logger.debug('constructor() [direction:%s, rtpParametersByKind:%o]', direction, rtpParametersByKind);

	switch (direction) {
		case 'send':
			return new SendRemoteSdp(rtpParametersByKind);
		case 'recv':
			return new RecvRemoteSdp(rtpParametersByKind);
	}
};

exports.default = RemotePlanBSdp;

},{"../../Logger":"/Users/ibc/src/mediasoup-client/lib/Logger.js","../../utils":"/Users/ibc/src/mediasoup-client/lib/utils.js","babel-runtime/core-js/get-iterator":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/get-iterator.js","babel-runtime/core-js/object/get-prototype-of":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/get-prototype-of.js","babel-runtime/core-js/object/keys":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/keys.js","babel-runtime/helpers/classCallCheck":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/classCallCheck.js","babel-runtime/helpers/createClass":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/createClass.js","babel-runtime/helpers/inherits":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/inherits.js","babel-runtime/helpers/possibleConstructorReturn":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/possibleConstructorReturn.js","sdp-transform":"/Users/ibc/src/mediasoup-client/node_modules/sdp-transform/lib/index.js"}],"/Users/ibc/src/mediasoup-client/lib/handlers/sdp/RemoteUnifiedPlanSdp.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _sdpTransform = require('sdp-transform');

var _sdpTransform2 = _interopRequireDefault(_sdpTransform);

var _Logger = require('../../Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _utils = require('../../utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = new _Logger2.default('RemoteUnifiedPlanSdp');

var RemoteSdp = function () {
	function RemoteSdp(rtpParametersByKind) {
		(0, _classCallCheck3.default)(this, RemoteSdp);

		// Generic sending RTP parameters for audio and video.
		// @type {Object}
		this._rtpParametersByKind = rtpParametersByKind;

		// Transport local parameters, including DTLS parameteres.
		// @type {Object}
		this._transportLocalParameters = null;

		// Transport remote parameters, including ICE parameters, ICE candidates
		// and DTLS parameteres.
		// @type {Object}
		this._transportRemoteParameters = null;

		// SDP global fields.
		// @type {Object}
		this._sdpGlobalFields = {
			id: utils.randomNumber(),
			version: 0
		};
	}

	(0, _createClass3.default)(RemoteSdp, [{
		key: 'setTransportLocalParameters',
		value: function setTransportLocalParameters(transportLocalParameters) {
			logger.debug('setTransportLocalParameters() [transportLocalParameters:%o]', transportLocalParameters);

			this._transportLocalParameters = transportLocalParameters;
		}
	}, {
		key: 'setTransportRemoteParameters',
		value: function setTransportRemoteParameters(transportRemoteParameters) {
			logger.debug('setTransportRemoteParameters() [transportRemoteParameters:%o]', transportRemoteParameters);

			this._transportRemoteParameters = transportRemoteParameters;
		}
	}]);
	return RemoteSdp;
}();

var SendRemoteSdp = function (_RemoteSdp) {
	(0, _inherits3.default)(SendRemoteSdp, _RemoteSdp);

	function SendRemoteSdp(rtpParametersByKind) {
		(0, _classCallCheck3.default)(this, SendRemoteSdp);
		return (0, _possibleConstructorReturn3.default)(this, (SendRemoteSdp.__proto__ || (0, _getPrototypeOf2.default)(SendRemoteSdp)).call(this, rtpParametersByKind));
	}

	(0, _createClass3.default)(SendRemoteSdp, [{
		key: 'createAnswerSdp',
		value: function createAnswerSdp(localSdpObj) {
			logger.debug('createAnswerSdp()');

			if (!this._transportLocalParameters) throw new Error('no transport local parameters');else if (!this._transportRemoteParameters) throw new Error('no transport remote parameters');

			var localDtlsParameters = this._transportLocalParameters.dtlsParameters;
			var remoteIceParameters = this._transportRemoteParameters.iceParameters;
			var remoteIceCandidates = this._transportRemoteParameters.iceCandidates;
			var remoteDtlsParameters = this._transportRemoteParameters.dtlsParameters;
			var sdpObj = {};
			var mids = (localSdpObj.media || []).filter(function (m) {
				return m.mid;
			}).map(function (m) {
				return m.mid;
			});

			// Increase our SDP version.
			this._sdpGlobalFields.version++;

			sdpObj.version = 0;
			sdpObj.origin = {
				address: '0.0.0.0',
				ipVer: 4,
				netType: 'IN',
				sessionId: this._sdpGlobalFields.id,
				sessionVersion: this._sdpGlobalFields.version,
				username: 'mediasoup-client'
			};
			sdpObj.name = '-';
			sdpObj.timing = { start: 0, stop: 0 };
			sdpObj.icelite = remoteIceParameters.iceLite ? 'ice-lite' : null;
			sdpObj.msidSemantic = {
				semantic: 'WMS',
				token: '*'
			};

			if (mids.length > 0) {
				sdpObj.groups = [{
					type: 'BUNDLE',
					mids: mids.join(' ')
				}];
			}

			sdpObj.media = [];

			sdpObj.fingerprint = {
				type: remoteDtlsParameters.fingerprints[0].algorithm,
				hash: remoteDtlsParameters.fingerprints[0].value
			};

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = (0, _getIterator3.default)(localSdpObj.media || []), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var localMediaObj = _step.value;

					var closed = localMediaObj.direction === 'inactive';
					var kind = localMediaObj.type;
					var codecs = this._rtpParametersByKind[kind].codecs;
					var headerExtensions = this._rtpParametersByKind[kind].headerExtensions;
					var remoteMediaObj = {};

					remoteMediaObj.type = localMediaObj.type;
					remoteMediaObj.port = 7;
					remoteMediaObj.protocol = 'RTP/SAVPF';
					remoteMediaObj.connection = { ip: '127.0.0.1', version: 4 };
					remoteMediaObj.mid = localMediaObj.mid;

					remoteMediaObj.iceUfrag = remoteIceParameters.usernameFragment;
					remoteMediaObj.icePwd = remoteIceParameters.password;
					remoteMediaObj.candidates = [];

					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = (0, _getIterator3.default)(remoteIceCandidates), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							var candidate = _step2.value;

							var candidateObj = {};

							// mediasoup does not support non rtcp-mux so candidates component is
							// always RTP (1).
							candidateObj.component = 1;
							candidateObj.foundation = candidate.foundation;
							candidateObj.ip = candidate.ip;
							candidateObj.port = candidate.port;
							candidateObj.priority = candidate.priority;
							candidateObj.transport = candidate.protocol;
							candidateObj.type = candidate.type;
							if (candidate.tcpType) candidateObj.tcptype = candidate.tcpType;

							remoteMediaObj.candidates.push(candidateObj);
						}
					} catch (err) {
						_didIteratorError2 = true;
						_iteratorError2 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}
						} finally {
							if (_didIteratorError2) {
								throw _iteratorError2;
							}
						}
					}

					remoteMediaObj.endOfCandidates = 'end-of-candidates';

					// Announce support for ICE renomination.
					// https://tools.ietf.org/html/draft-thatcher-ice-renomination
					remoteMediaObj.iceOptions = 'renomination';

					switch (localDtlsParameters.role) {
						case 'client':
							remoteMediaObj.setup = 'active';
							break;
						case 'server':
							remoteMediaObj.setup = 'passive';
							break;
					}

					switch (localMediaObj.direction) {
						case 'sendrecv':
						case 'sendonly':
							remoteMediaObj.direction = 'recvonly';
							break;
						case 'recvonly':
						case 'inactive':
							remoteMediaObj.direction = 'inactive';
							break;
					}

					remoteMediaObj.rtp = [];
					remoteMediaObj.rtcpFb = [];
					remoteMediaObj.fmtp = [];

					var _iteratorNormalCompletion3 = true;
					var _didIteratorError3 = false;
					var _iteratorError3 = undefined;

					try {
						for (var _iterator3 = (0, _getIterator3.default)(codecs), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
							var codec = _step3.value;

							var rtp = {
								payload: codec.payloadType,
								codec: codec.name,
								rate: codec.clockRate
							};

							if (codec.channels > 1) rtp.encoding = codec.channels;

							remoteMediaObj.rtp.push(rtp);

							if (codec.parameters) {
								var paramFmtp = {
									payload: codec.payloadType,
									config: ''
								};

								var _iteratorNormalCompletion5 = true;
								var _didIteratorError5 = false;
								var _iteratorError5 = undefined;

								try {
									for (var _iterator5 = (0, _getIterator3.default)((0, _keys2.default)(codec.parameters)), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
										var key = _step5.value;

										if (paramFmtp.config) paramFmtp.config += ';';

										paramFmtp.config += key + '=' + codec.parameters[key];
									}
								} catch (err) {
									_didIteratorError5 = true;
									_iteratorError5 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion5 && _iterator5.return) {
											_iterator5.return();
										}
									} finally {
										if (_didIteratorError5) {
											throw _iteratorError5;
										}
									}
								}

								if (paramFmtp.config) remoteMediaObj.fmtp.push(paramFmtp);
							}

							if (codec.rtcpFeedback) {
								var _iteratorNormalCompletion6 = true;
								var _didIteratorError6 = false;
								var _iteratorError6 = undefined;

								try {
									for (var _iterator6 = (0, _getIterator3.default)(codec.rtcpFeedback), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
										var fb = _step6.value;

										remoteMediaObj.rtcpFb.push({
											payload: codec.payloadType,
											type: fb.type,
											subtype: fb.parameter
										});
									}
								} catch (err) {
									_didIteratorError6 = true;
									_iteratorError6 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion6 && _iterator6.return) {
											_iterator6.return();
										}
									} finally {
										if (_didIteratorError6) {
											throw _iteratorError6;
										}
									}
								}
							}
						}
					} catch (err) {
						_didIteratorError3 = true;
						_iteratorError3 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion3 && _iterator3.return) {
								_iterator3.return();
							}
						} finally {
							if (_didIteratorError3) {
								throw _iteratorError3;
							}
						}
					}

					remoteMediaObj.payloads = codecs.map(function (codec) {
						return codec.payloadType;
					}).join(' ');

					// NOTE: Firefox does not like a=extmap lines if a=inactive.
					if (!closed) {
						remoteMediaObj.ext = [];

						var _iteratorNormalCompletion4 = true;
						var _didIteratorError4 = false;
						var _iteratorError4 = undefined;

						try {
							for (var _iterator4 = (0, _getIterator3.default)(headerExtensions), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
								var ext = _step4.value;

								remoteMediaObj.ext.push({
									uri: ext.uri,
									value: ext.id
								});
							}
						} catch (err) {
							_didIteratorError4 = true;
							_iteratorError4 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion4 && _iterator4.return) {
									_iterator4.return();
								}
							} finally {
								if (_didIteratorError4) {
									throw _iteratorError4;
								}
							}
						}
					}

					remoteMediaObj.rtcpMux = 'rtcp-mux';
					remoteMediaObj.rtcpRsize = 'rtcp-rsize';

					// Push it.
					sdpObj.media.push(remoteMediaObj);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			var sdp = _sdpTransform2.default.write(sdpObj);

			return sdp;
		}
	}]);
	return SendRemoteSdp;
}(RemoteSdp);

var RecvRemoteSdp = function (_RemoteSdp2) {
	(0, _inherits3.default)(RecvRemoteSdp, _RemoteSdp2);

	function RecvRemoteSdp(rtpParametersByKind) {
		(0, _classCallCheck3.default)(this, RecvRemoteSdp);

		// Id of the unique MediaStream for all the remote tracks.
		var _this2 = (0, _possibleConstructorReturn3.default)(this, (RecvRemoteSdp.__proto__ || (0, _getPrototypeOf2.default)(RecvRemoteSdp)).call(this, rtpParametersByKind));

		_this2._streamId = 'recv-stream-' + utils.randomNumber();
		return _this2;
	}

	/**
  * @param {Array<Object>} consumerInfos - Consumer informations.
  * @return {String}
  */


	(0, _createClass3.default)(RecvRemoteSdp, [{
		key: 'createOfferSdp',
		value: function createOfferSdp(consumerInfos) {
			logger.debug('createOfferSdp()');

			if (!this._transportRemoteParameters) throw new Error('no transport remote parameters');

			var remoteIceParameters = this._transportRemoteParameters.iceParameters;
			var remoteIceCandidates = this._transportRemoteParameters.iceCandidates;
			var remoteDtlsParameters = this._transportRemoteParameters.dtlsParameters;
			var sdpObj = {};
			var mids = consumerInfos.filter(function (info) {
				return !info.closed;
			}).map(function (info) {
				return info.mid;
			});

			// Increase our SDP version.
			this._sdpGlobalFields.version++;

			sdpObj.version = 0;
			sdpObj.origin = {
				address: '0.0.0.0',
				ipVer: 4,
				netType: 'IN',
				sessionId: this._sdpGlobalFields.id,
				sessionVersion: this._sdpGlobalFields.version,
				username: 'mediasoup-client'
			};
			sdpObj.name = '-';
			sdpObj.timing = { start: 0, stop: 0 };
			sdpObj.icelite = remoteIceParameters.iceLite ? 'ice-lite' : null;
			sdpObj.msidSemantic = {
				semantic: 'WMS',
				token: '*'
			};

			if (mids.length > 0) {
				sdpObj.groups = [{
					type: 'BUNDLE',
					mids: mids.join(' ')
				}];
			}

			sdpObj.media = [];

			sdpObj.fingerprint = {
				type: remoteDtlsParameters.fingerprints[0].algorithm,
				hash: remoteDtlsParameters.fingerprints[0].value
			};

			var _iteratorNormalCompletion7 = true;
			var _didIteratorError7 = false;
			var _iteratorError7 = undefined;

			try {
				for (var _iterator7 = (0, _getIterator3.default)(consumerInfos), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
					var info = _step7.value;

					var closed = info.closed;
					var kind = info.kind;
					var codecs = this._rtpParametersByKind[kind].codecs;
					var headerExtensions = this._rtpParametersByKind[kind].headerExtensions;
					var remoteMediaObj = {};

					remoteMediaObj.type = kind;
					remoteMediaObj.port = 7;
					remoteMediaObj.protocol = 'RTP/SAVPF';
					remoteMediaObj.connection = { ip: '127.0.0.1', version: 4 };
					remoteMediaObj.mid = info.mid;
					remoteMediaObj.msid = this._streamId + ' ' + info.trackId;

					remoteMediaObj.iceUfrag = remoteIceParameters.usernameFragment;
					remoteMediaObj.icePwd = remoteIceParameters.password;
					remoteMediaObj.candidates = [];

					var _iteratorNormalCompletion8 = true;
					var _didIteratorError8 = false;
					var _iteratorError8 = undefined;

					try {
						for (var _iterator8 = (0, _getIterator3.default)(remoteIceCandidates), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
							var candidate = _step8.value;

							var candidateObj = {};

							// mediasoup does not support non rtcp-mux so candidates component is
							// always RTP (1).
							candidateObj.component = 1;
							candidateObj.foundation = candidate.foundation;
							candidateObj.ip = candidate.ip;
							candidateObj.port = candidate.port;
							candidateObj.priority = candidate.priority;
							candidateObj.transport = candidate.protocol;
							candidateObj.type = candidate.type;
							if (candidate.tcpType) candidateObj.tcptype = candidate.tcpType;

							remoteMediaObj.candidates.push(candidateObj);
						}
					} catch (err) {
						_didIteratorError8 = true;
						_iteratorError8 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion8 && _iterator8.return) {
								_iterator8.return();
							}
						} finally {
							if (_didIteratorError8) {
								throw _iteratorError8;
							}
						}
					}

					remoteMediaObj.endOfCandidates = 'end-of-candidates';

					// Announce support for ICE renomination.
					// https://tools.ietf.org/html/draft-thatcher-ice-renomination
					remoteMediaObj.iceOptions = 'renomination';

					remoteMediaObj.setup = 'actpass';

					if (!closed) remoteMediaObj.direction = 'sendonly';else remoteMediaObj.direction = 'inactive';

					remoteMediaObj.rtp = [];
					remoteMediaObj.rtcpFb = [];
					remoteMediaObj.fmtp = [];

					var _iteratorNormalCompletion9 = true;
					var _didIteratorError9 = false;
					var _iteratorError9 = undefined;

					try {
						for (var _iterator9 = (0, _getIterator3.default)(codecs), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
							var codec = _step9.value;

							var rtp = {
								payload: codec.payloadType,
								codec: codec.name,
								rate: codec.clockRate
							};

							if (codec.channels > 1) rtp.encoding = codec.channels;

							remoteMediaObj.rtp.push(rtp);

							if (codec.parameters) {
								var paramFmtp = {
									payload: codec.payloadType,
									config: ''
								};

								var _iteratorNormalCompletion11 = true;
								var _didIteratorError11 = false;
								var _iteratorError11 = undefined;

								try {
									for (var _iterator11 = (0, _getIterator3.default)((0, _keys2.default)(codec.parameters)), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
										var key = _step11.value;

										if (paramFmtp.config) paramFmtp.config += ';';

										paramFmtp.config += key + '=' + codec.parameters[key];
									}
								} catch (err) {
									_didIteratorError11 = true;
									_iteratorError11 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion11 && _iterator11.return) {
											_iterator11.return();
										}
									} finally {
										if (_didIteratorError11) {
											throw _iteratorError11;
										}
									}
								}

								if (paramFmtp.config) remoteMediaObj.fmtp.push(paramFmtp);
							}

							if (codec.rtcpFeedback) {
								var _iteratorNormalCompletion12 = true;
								var _didIteratorError12 = false;
								var _iteratorError12 = undefined;

								try {
									for (var _iterator12 = (0, _getIterator3.default)(codec.rtcpFeedback), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
										var fb = _step12.value;

										remoteMediaObj.rtcpFb.push({
											payload: codec.payloadType,
											type: fb.type,
											subtype: fb.parameter
										});
									}
								} catch (err) {
									_didIteratorError12 = true;
									_iteratorError12 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion12 && _iterator12.return) {
											_iterator12.return();
										}
									} finally {
										if (_didIteratorError12) {
											throw _iteratorError12;
										}
									}
								}
							}
						}
					} catch (err) {
						_didIteratorError9 = true;
						_iteratorError9 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion9 && _iterator9.return) {
								_iterator9.return();
							}
						} finally {
							if (_didIteratorError9) {
								throw _iteratorError9;
							}
						}
					}

					remoteMediaObj.payloads = codecs.map(function (codec) {
						return codec.payloadType;
					}).join(' ');

					// NOTE: Firefox does not like a=extmap lines if a=inactive.
					if (!closed) {
						remoteMediaObj.ext = [];

						var _iteratorNormalCompletion10 = true;
						var _didIteratorError10 = false;
						var _iteratorError10 = undefined;

						try {
							for (var _iterator10 = (0, _getIterator3.default)(headerExtensions), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
								var ext = _step10.value;

								remoteMediaObj.ext.push({
									uri: ext.uri,
									value: ext.id
								});
							}
						} catch (err) {
							_didIteratorError10 = true;
							_iteratorError10 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion10 && _iterator10.return) {
									_iterator10.return();
								}
							} finally {
								if (_didIteratorError10) {
									throw _iteratorError10;
								}
							}
						}
					}

					remoteMediaObj.rtcpMux = 'rtcp-mux';
					remoteMediaObj.rtcpRsize = 'rtcp-rsize';

					if (!closed) {
						remoteMediaObj.ssrcs = [];
						remoteMediaObj.ssrcGroups = [];

						remoteMediaObj.ssrcs.push({
							id: info.ssrc,
							attribute: 'cname',
							value: info.cname
						});

						if (info.rtxSsrc) {
							remoteMediaObj.ssrcs.push({
								id: info.rtxSsrc,
								attribute: 'cname',
								value: info.cname
							});

							// Associate original and retransmission SSRC.
							remoteMediaObj.ssrcGroups.push({
								semantics: 'FID',
								ssrcs: info.ssrc + ' ' + info.rtxSsrc
							});
						}
					}

					// Push it.
					sdpObj.media.push(remoteMediaObj);
				}
			} catch (err) {
				_didIteratorError7 = true;
				_iteratorError7 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion7 && _iterator7.return) {
						_iterator7.return();
					}
				} finally {
					if (_didIteratorError7) {
						throw _iteratorError7;
					}
				}
			}

			var sdp = _sdpTransform2.default.write(sdpObj);

			return sdp;
		}
	}]);
	return RecvRemoteSdp;
}(RemoteSdp);

var RemoteUnifiedPlanSdp = function RemoteUnifiedPlanSdp(direction, rtpParametersByKind) {
	(0, _classCallCheck3.default)(this, RemoteUnifiedPlanSdp);

	logger.debug('constructor() [direction:%s, rtpParametersByKind:%o]', direction, rtpParametersByKind);

	switch (direction) {
		case 'send':
			return new SendRemoteSdp(rtpParametersByKind);
		case 'recv':
			return new RecvRemoteSdp(rtpParametersByKind);
	}
};

exports.default = RemoteUnifiedPlanSdp;

},{"../../Logger":"/Users/ibc/src/mediasoup-client/lib/Logger.js","../../utils":"/Users/ibc/src/mediasoup-client/lib/utils.js","babel-runtime/core-js/get-iterator":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/get-iterator.js","babel-runtime/core-js/object/get-prototype-of":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/get-prototype-of.js","babel-runtime/core-js/object/keys":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/keys.js","babel-runtime/helpers/classCallCheck":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/classCallCheck.js","babel-runtime/helpers/createClass":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/createClass.js","babel-runtime/helpers/inherits":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/inherits.js","babel-runtime/helpers/possibleConstructorReturn":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/possibleConstructorReturn.js","sdp-transform":"/Users/ibc/src/mediasoup-client/node_modules/sdp-transform/lib/index.js"}],"/Users/ibc/src/mediasoup-client/lib/handlers/sdp/commonUtils.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

exports.extractRtpCapabilities = extractRtpCapabilities;
exports.extractDtlsParameters = extractDtlsParameters;

var _sdpTransform = require('sdp-transform');

var _sdpTransform2 = _interopRequireDefault(_sdpTransform);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Extract RTP capabilities from a SDP.
 *
 * @param {Object} sdpObj - SDP Object generated by sdp-transform.
 * @return {RTCRtpCapabilities}
 */
function extractRtpCapabilities(sdpObj) {
	// Map of RtpCodecParameters indexed by payload type.
	var codecsMap = new _map2.default();

	// Array of RtpHeaderExtensions.
	var headerExtensions = [];

	// Whether a m=audio/video section has been already found.
	var gotAudio = false;
	var gotVideo = false;

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = (0, _getIterator3.default)(sdpObj.media), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var m = _step.value;

			var kind = m.type;

			switch (kind) {
				case 'audio':
					{
						if (gotAudio) continue;

						gotAudio = true;
						break;
					}
				case 'video':
					{
						if (gotVideo) continue;

						gotVideo = true;
						break;
					}
				default:
					{
						continue;
					}
			}

			// Get codecs.
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = (0, _getIterator3.default)(m.rtp), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var rtp = _step2.value;

					var codec = {
						name: rtp.codec,
						mimeType: kind + '/' + rtp.codec,
						kind: kind,
						clockRate: rtp.rate,
						preferredPayloadType: rtp.payload,
						channels: rtp.encoding,
						rtcpFeedback: [],
						parameters: {}
					};

					if (!(codec.channels > 1)) delete codec.channels;

					codecsMap.set(codec.preferredPayloadType, codec);
				}

				// Get codec parameters.
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = (0, _getIterator3.default)(m.fmtp || []), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var fmtp = _step3.value;

					var parameters = _sdpTransform2.default.parseFmtpConfig(fmtp.config);
					var _codec = codecsMap.get(fmtp.payload);

					if (!_codec) continue;

					_codec.parameters = parameters;
				}

				// Get RTCP feedback for each codec.
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}

			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = (0, _getIterator3.default)(m.rtcpFb || []), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var fb = _step4.value;

					var _codec2 = codecsMap.get(fb.payload);

					if (!_codec2) continue;

					var feedback = {
						type: fb.type,
						parameter: fb.subtype || ''
					};

					_codec2.rtcpFeedback.push(feedback);
				}

				// Get RTP header extensions.
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4.return) {
						_iterator4.return();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}

			var _iteratorNormalCompletion5 = true;
			var _didIteratorError5 = false;
			var _iteratorError5 = undefined;

			try {
				for (var _iterator5 = (0, _getIterator3.default)(m.ext || []), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
					var ext = _step5.value;

					var headerExtension = {
						kind: kind,
						uri: ext.uri,
						preferredId: ext.value
					};

					headerExtensions.push(headerExtension);
				}
			} catch (err) {
				_didIteratorError5 = true;
				_iteratorError5 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion5 && _iterator5.return) {
						_iterator5.return();
					}
				} finally {
					if (_didIteratorError5) {
						throw _iteratorError5;
					}
				}
			}
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	var rtpCapabilities = {
		codecs: (0, _from2.default)(codecsMap.values()),
		headerExtensions: headerExtensions,
		fecMechanisms: [] // TODO
	};

	return rtpCapabilities;
}

/**
 * Extract DTLS parameters from a SDP.
 *
 * @param {Object} sdpObj - SDP Object generated by sdp-transform.
 * @return {RTCDtlsParameters}
 */
function extractDtlsParameters(sdpObj) {
	var media = getFirstActiveMediaSection(sdpObj);
	var fingerprint = media.fingerprint || sdpObj.fingerprint;
	var role = void 0;

	switch (media.setup) {
		case 'active':
			role = 'client';
			break;
		case 'passive':
			role = 'server';
			break;
		case 'actpass':
			role = 'auto';
			break;
	}

	var dtlsParameters = {
		role: role,
		fingerprints: [{
			algorithm: fingerprint.type,
			value: fingerprint.hash
		}]
	};

	return dtlsParameters;
}

/**
 * Get the first acive media section.
 *
 * @private
 * @param {Object} sdpObj - SDP Object generated by sdp-transform.
 * @return {Object} SDP media section as parsed by sdp-transform.
 */
function getFirstActiveMediaSection(sdpObj) {
	return (sdpObj.media || []).find(function (m) {
		return m.iceUfrag && m.port !== 0;
	});
}

},{"babel-runtime/core-js/array/from":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/array/from.js","babel-runtime/core-js/get-iterator":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/get-iterator.js","babel-runtime/core-js/map":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/map.js","sdp-transform":"/Users/ibc/src/mediasoup-client/node_modules/sdp-transform/lib/index.js"}],"/Users/ibc/src/mediasoup-client/lib/handlers/sdp/planBUtils.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.fillRtpParametersForTrack = fillRtpParametersForTrack;
/**
 * Fill the given RTP parameters for the given track.
 *
 * NOTE: Currently it assumes a single encoding (no simulcast).
 *
 * @param {RTCRtpParameters} rtpParameters -  RTP parameters to be filled.
 * @param {Object} sdpObj - Local SDP Object generated by sdp-transform.
 * @param {MediaStreamTrack} track
 */
function fillRtpParametersForTrack(rtpParameters, sdpObj, track) {
	var kind = track.kind;
	var encoding = {};
	var rtcp = {
		cname: null,
		reducedSize: true,
		mux: true
	};

	var mSection = (sdpObj.media || []).find(function (m) {
		return m.type === kind;
	});

	if (!mSection) throw new Error('m=' + kind + ' section not found');

	// Get the SSRC.

	var ssrcMsidLine = (mSection.ssrcs || []).find(function (line) {
		if (line.attribute !== 'msid') return false;

		var trackId = line.value.split(' ')[1];

		if (trackId === track.id) return true;
	});

	if (!ssrcMsidLine) throw new Error('a=ssrc line not found for local track [track.id:' + track.id + ']');

	var ssrc = ssrcMsidLine.id;

	encoding.ssrc = ssrc;

	// Get the SSRC for RTX.

	(mSection.ssrcGroups || []).some(function (line) {
		if (line.semantics !== 'FID') return;

		var ssrcs = line.ssrcs.split(/[ ]+/);

		if (Number(ssrcs[0]) === ssrc) {
			var rtxSsrc = Number(ssrcs[1]);

			encoding.rtx = { ssrc: rtxSsrc };

			return true;
		}
	});

	// Get RTCP info.

	var ssrcCnameLine = mSection.ssrcs.find(function (line) {
		return line.attribute === 'cname' && line.id === ssrc;
	});

	if (ssrcCnameLine) rtcp.cname = ssrcCnameLine.value;

	// Fill RTP parameters.
	rtpParameters.encodings = [encoding];
	rtpParameters.rtcp = rtcp;
}

},{}],"/Users/ibc/src/mediasoup-client/lib/handlers/sdp/unifiedPlanUtils.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.fillRtpParametersForTrack = fillRtpParametersForTrack;
/**
 * Fill the given RTP parameters for the given track.
 *
 * NOTE: Currently it assumes a single encoding (no simulcast).
 *
 * @param {RTCRtpParameters} rtpParameters -  RTP parameters to be filled.
 * @param {Object} sdpObj - Local SDP Object generated by sdp-transform.
 * @param {MediaStreamTrack} track
 */
function fillRtpParametersForTrack(rtpParameters, sdpObj, track) {
	var kind = track.kind;
	var encoding = {};
	var rtcp = {
		cname: null,
		reducedSize: true,
		mux: true
	};

	var mSection = (sdpObj.media || []).find(function (m) {
		if (m.type !== kind) return;

		var msidLine = m.msid;

		if (!msidLine) return;

		var trackId = msidLine.split(' ')[1];

		if (trackId === track.id) return true;
	});

	if (!mSection) throw new Error('m=' + kind + ' section not found');

	// Get the SSRC and CNAME.

	var ssrcCnameLine = (mSection.ssrcs || []).find(function (line) {
		return line.attribute === 'cname';
	});

	if (!ssrcCnameLine) throw new Error('a=ssrc line not found for local track [track.id:' + track.id + ']');

	var ssrc = ssrcCnameLine.id;

	encoding.ssrc = ssrcCnameLine.id;
	rtcp.cname = ssrcCnameLine.value;

	// Get the SSRC for RTX.

	(mSection.ssrcGroups || []).some(function (line) {
		if (line.semantics !== 'FID') return;

		var ssrcs = line.ssrcs.split(/[ ]+/);

		if (Number(ssrcs[0]) === ssrc) {
			var rtxSsrc = Number(ssrcs[1]);

			encoding.rtx = { ssrc: rtxSsrc };

			return true;
		}
	});

	// Fill RTP parameters.
	rtpParameters.encodings = [encoding];
	rtpParameters.rtcp = rtcp;
}

},{}],"/Users/ibc/src/mediasoup-client/lib/index.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Room = undefined;
exports.isDeviceSupported = isDeviceSupported;
exports.getDeviceInfo = getDeviceInfo;

var _Device = require('./Device');

var _Device2 = _interopRequireDefault(_Device);

var _Room = require('./Room');

var _Room2 = _interopRequireDefault(_Room);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Whether the current browser or device is supported.
 *
 * @return {Boolean}
 *
 * @example
 * isDeviceSupported()
 * // => true
 */
function isDeviceSupported() {
  return _Device2.default.isSupported();
}

/**
 * Get information regarding the current browser or device.
 *
 * @return {Object} - Object with `name` (String) and version {String}.
 *
 * @example
 * getDeviceInfo()
 * // => { name: "Chrome", version: "59.0" }
 */
function getDeviceInfo() {
  return {
    name: _Device2.default.name,
    version: _Device2.default.version
  };
}

/**
 * Expose the Room class.
 *
 * @example
 * const room = new Room();`
 */
exports.Room = _Room2.default;

},{"./Device":"/Users/ibc/src/mediasoup-client/lib/Device.js","./Room":"/Users/ibc/src/mediasoup-client/lib/Room.js"}],"/Users/ibc/src/mediasoup-client/lib/utils.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.randomNumber = randomNumber;
exports.clone = clone;
exports.getExtendedRtpCapabilities = getExtendedRtpCapabilities;
exports.getRtpCapabilities = getRtpCapabilities;
exports.canSend = canSend;
exports.canReceive = canReceive;
exports.getSendingRtpParameters = getSendingRtpParameters;
exports.getReceivingFullRtpParameters = getReceivingFullRtpParameters;

var _randomNumber = require('random-number');

var _randomNumber2 = _interopRequireDefault(_randomNumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var randomNumberGenerator = _randomNumber2.default.generator({
	min: 10000000,
	max: 99999999,
	integer: true
});

/**
 * Generates a random positive number between 10000000 and 99999999.
 *
 * @return {Number}
 */
function randomNumber() {
	return randomNumberGenerator();
}

/**
 * Clones the given Object/Array.
 *
 * @param {Object|Array} obj
 * @return {Object|Array}
 */
function clone(obj) {
	return JSON.parse((0, _stringify2.default)(obj));
}

/**
 * Generate extended RTP capabilities for sending and receiving.
 *
 * @param {RTCRtpCapabilities} localCaps - Local capabilities.
 * @param {RTCRtpCapabilities} remoteCaps - Remote capabilities.
 * @return {RTCExtendedRtpCapabilities}
 */
function getExtendedRtpCapabilities(localCaps, remoteCaps) {
	var extendedCaps = {
		codecs: [],
		headerExtensions: [],
		fecMechanisms: []
	};

	// Match media codecs and keep the order preferred by remoteCaps.
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		var _loop = function _loop() {
			var remoteCodec = _step.value;

			// TODO: Ignore pseudo-codecs and feature codecs.
			if (remoteCodec.name === 'rtx') return 'continue';

			var matchingLocalCodec = (localCaps.codecs || []).find(function (localCodec) {
				return matchCodecs(localCodec, remoteCodec);
			});

			if (matchingLocalCodec) {
				var extendedCodec = {
					name: remoteCodec.name,
					mimeType: remoteCodec.mimeType,
					kind: remoteCodec.kind,
					clockRate: remoteCodec.clockRate,
					sendPayloadType: matchingLocalCodec.preferredPayloadType,
					sendRtxPayloadType: null,
					recvPayloadType: remoteCodec.preferredPayloadType,
					recvRtxPayloadType: null,
					channels: remoteCodec.channels,
					rtcpFeedback: reduceRtcpFeedback(matchingLocalCodec, remoteCodec),
					parameters: remoteCodec.parameters
				};

				if (!(extendedCodec.channels > 1)) delete extendedCodec.channels;

				extendedCaps.codecs.push(extendedCodec);
			}
		};

		for (var _iterator = (0, _getIterator3.default)(remoteCaps.codecs || []), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var _ret = _loop();

			if (_ret === 'continue') continue;
		}

		// Match RTX codecs.
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		var _loop2 = function _loop2() {
			var extendedCodec = _step2.value;

			var matchingLocalRtxCodec = (localCaps.codecs || []).find(function (localCodec) {
				return localCodec.name === 'rtx' && localCodec.parameters.apt === extendedCodec.sendPayloadType;
			});

			var matchingRemoteRtxCodec = (remoteCaps.codecs || []).find(function (remoteCodec) {
				return remoteCodec.name === 'rtx' && remoteCodec.parameters.apt === extendedCodec.recvPayloadType;
			});

			if (matchingLocalRtxCodec && matchingRemoteRtxCodec) {
				extendedCodec.sendRtxPayloadType = matchingLocalRtxCodec.preferredPayloadType;
				extendedCodec.recvRtxPayloadType = matchingRemoteRtxCodec.preferredPayloadType;
			}
		};

		for (var _iterator2 = (0, _getIterator3.default)(extendedCaps.codecs || []), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			_loop2();
		}

		// Match header extensions.
	} catch (err) {
		_didIteratorError2 = true;
		_iteratorError2 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion2 && _iterator2.return) {
				_iterator2.return();
			}
		} finally {
			if (_didIteratorError2) {
				throw _iteratorError2;
			}
		}
	}

	var _iteratorNormalCompletion3 = true;
	var _didIteratorError3 = false;
	var _iteratorError3 = undefined;

	try {
		var _loop3 = function _loop3() {
			var remoteExt = _step3.value;

			var matchingLocalExt = (localCaps.headerExtensions || []).find(function (localExt) {
				return matchHeaderExtensions(localExt, remoteExt);
			});

			if (matchingLocalExt) {
				var extendedExt = {
					kind: remoteExt.kind,
					uri: remoteExt.uri,
					sendId: matchingLocalExt.preferredId,
					recvId: remoteExt.preferredId
				};

				extendedCaps.headerExtensions.push(extendedExt);
			}
		};

		for (var _iterator3 = (0, _getIterator3.default)(remoteCaps.headerExtensions || []), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
			_loop3();
		}
	} catch (err) {
		_didIteratorError3 = true;
		_iteratorError3 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion3 && _iterator3.return) {
				_iterator3.return();
			}
		} finally {
			if (_didIteratorError3) {
				throw _iteratorError3;
			}
		}
	}

	return extendedCaps;
}

/**
 * Generate RTP capabilities based on the given extended RTP capabilities.
 *
 * @param {RTCExtendedRtpCapabilities} extendedRtpCapabilities
 * @return {RTCRtpCapabilities}
 */
function getRtpCapabilities(extendedRtpCapabilities) {
	var caps = {
		codecs: [],
		headerExtensions: [],
		fecMechanisms: []
	};

	var _iteratorNormalCompletion4 = true;
	var _didIteratorError4 = false;
	var _iteratorError4 = undefined;

	try {
		for (var _iterator4 = (0, _getIterator3.default)(extendedRtpCapabilities.codecs), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
			var capCodec = _step4.value;

			var codec = {
				name: capCodec.name,
				mimeType: capCodec.mimeType,
				kind: capCodec.kind,
				clockRate: capCodec.clockRate,
				preferredPayloadType: capCodec.recvPayloadType,
				channels: capCodec.channels,
				rtcpFeedback: capCodec.rtcpFeedback,
				parameters: capCodec.parameters
			};

			if (!(codec.channels > 1)) delete codec.channels;

			caps.codecs.push(codec);

			// Add RTX codec.
			if (capCodec.recvRtxPayloadType) {
				var rtxCapCodec = {
					name: 'rtx',
					mimeType: capCodec.kind + '/rtx',
					clockRate: capCodec.clockRate,
					payloadType: capCodec.recvRtxPayloadType,
					parameters: {
						apt: capCodec.recvPayloadType
					}
				};

				caps.codecs.push(rtxCapCodec);
			}

			// TODO: In the future, we need to add FEC, CN, etc, codecs.
		}
	} catch (err) {
		_didIteratorError4 = true;
		_iteratorError4 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion4 && _iterator4.return) {
				_iterator4.return();
			}
		} finally {
			if (_didIteratorError4) {
				throw _iteratorError4;
			}
		}
	}

	var _iteratorNormalCompletion5 = true;
	var _didIteratorError5 = false;
	var _iteratorError5 = undefined;

	try {
		for (var _iterator5 = (0, _getIterator3.default)(extendedRtpCapabilities.headerExtensions), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
			var capExt = _step5.value;

			var ext = {
				kind: capExt.kind,
				uri: capExt.uri,
				preferredId: capExt.recvId
			};

			caps.headerExtensions.push(ext);
		}
	} catch (err) {
		_didIteratorError5 = true;
		_iteratorError5 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion5 && _iterator5.return) {
				_iterator5.return();
			}
		} finally {
			if (_didIteratorError5) {
				throw _iteratorError5;
			}
		}
	}

	caps.fecMechanisms = extendedRtpCapabilities.fecMechanisms;

	return caps;
}

/**
 * Whether media can be sent based on the given RTP capabilities.
 *
 * @param {String} kind
 * @param {RTCExtendedRtpCapabilities} extendedRtpCapabilities
 * @return {Boolean}
 */
function canSend(kind, extendedRtpCapabilities) {
	return extendedRtpCapabilities.codecs.some(function (codec) {
		return codec.kind === kind;
	});
}

/**
 * Whether the given RTP parameters can be received with the given RTP
 * capabilities.
 *
 * @param {RTCRtpParameters} rtpParameters
 * @param {RTCExtendedRtpCapabilities} extendedRtpCapabilities
 * @return {Boolean}
 */
function canReceive(rtpParameters, extendedRtpCapabilities) {
	var firstMediaCodec = rtpParameters.codecs[0];

	return extendedRtpCapabilities.codecs.some(function (codec) {
		return codec.recvPayloadType === firstMediaCodec.payloadType;
	});
}

/**
 * Generate RTP parameters of the given kind for sending media.
 * Just the first media codec per kind is considered.
 * NOTE: muxId, encodings and rtcp fields are left empty.
 *
 * @param {kind} kind
 * @param {RTCExtendedRtpCapabilities} extendedRtpCapabilities
 * @return {RTCRtpParameters}
 */
function getSendingRtpParameters(kind, extendedRtpCapabilities) {
	var params = {
		muxId: null,
		codecs: [],
		headerExtensions: [],
		encodings: [],
		rtcp: {}
	};

	var _iteratorNormalCompletion6 = true;
	var _didIteratorError6 = false;
	var _iteratorError6 = undefined;

	try {
		for (var _iterator6 = (0, _getIterator3.default)(extendedRtpCapabilities.codecs), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
			var capCodec = _step6.value;

			if (capCodec.kind !== kind) continue;

			var codec = {
				name: capCodec.name,
				mimeType: capCodec.mimeType,
				clockRate: capCodec.clockRate,
				payloadType: capCodec.sendPayloadType,
				channels: capCodec.channels,
				rtcpFeedback: capCodec.rtcpFeedback,
				parameters: capCodec.parameters
			};

			if (!(codec.channels > 1)) delete codec.channels;

			params.codecs.push(codec);

			// Add RTX codec.
			if (capCodec.sendRtxPayloadType) {
				var rtxCodec = {
					name: 'rtx',
					mimeType: capCodec.kind + '/rtx',
					clockRate: capCodec.clockRate,
					payloadType: capCodec.sendRtxPayloadType,
					parameters: {
						apt: capCodec.sendPayloadType
					}
				};

				params.codecs.push(rtxCodec);
			}

			// NOTE: We assume a single media codec plus an optional RTX codec for now.
			// TODO: In the future, we need to add FEC, CN, etc, codecs.
			break;
		}
	} catch (err) {
		_didIteratorError6 = true;
		_iteratorError6 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion6 && _iterator6.return) {
				_iterator6.return();
			}
		} finally {
			if (_didIteratorError6) {
				throw _iteratorError6;
			}
		}
	}

	var _iteratorNormalCompletion7 = true;
	var _didIteratorError7 = false;
	var _iteratorError7 = undefined;

	try {
		for (var _iterator7 = (0, _getIterator3.default)(extendedRtpCapabilities.headerExtensions), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
			var capExt = _step7.value;

			if (capExt.kind !== kind) continue;

			var ext = {
				uri: capExt.uri,
				id: capExt.sendId
			};

			params.headerExtensions.push(ext);
		}
	} catch (err) {
		_didIteratorError7 = true;
		_iteratorError7 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion7 && _iterator7.return) {
				_iterator7.return();
			}
		} finally {
			if (_didIteratorError7) {
				throw _iteratorError7;
			}
		}
	}

	return params;
}

/**
 * Generate RTP parameters of the given kind for receiving media.
 * All the media codecs per kind are considered. This is useful for generating
 * a SDP remote offer.
 * NOTE: muxId, encodings and rtcp fields are left empty.
 *
 * @param {String} kind
 * @param {RTCExtendedRtpCapabilities} extendedRtpCapabilities
 * @return {RTCRtpParameters}
 */
function getReceivingFullRtpParameters(kind, extendedRtpCapabilities) {
	var params = {
		muxId: null,
		codecs: [],
		headerExtensions: [],
		encodings: [],
		rtcp: {}
	};

	var _iteratorNormalCompletion8 = true;
	var _didIteratorError8 = false;
	var _iteratorError8 = undefined;

	try {
		for (var _iterator8 = (0, _getIterator3.default)(extendedRtpCapabilities.codecs), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
			var capCodec = _step8.value;

			if (capCodec.kind !== kind) continue;

			var codec = {
				name: capCodec.name,
				mimeType: capCodec.mimeType,
				clockRate: capCodec.clockRate,
				payloadType: capCodec.recvPayloadType,
				channels: capCodec.channels,
				rtcpFeedback: capCodec.rtcpFeedback,
				parameters: capCodec.parameters
			};

			if (!(codec.channels > 1)) delete codec.channels;

			params.codecs.push(codec);

			// Add RTX codec.
			if (capCodec.recvRtxPayloadType) {
				var rtxCodec = {
					name: 'rtx',
					mimeType: capCodec.kind + '/rtx',
					clockRate: capCodec.clockRate,
					payloadType: capCodec.recvRtxPayloadType,
					parameters: {
						apt: capCodec.recvPayloadType
					}
				};

				params.codecs.push(rtxCodec);
			}

			// TODO: In the future, we need to add FEC, CN, etc, codecs.
		}
	} catch (err) {
		_didIteratorError8 = true;
		_iteratorError8 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion8 && _iterator8.return) {
				_iterator8.return();
			}
		} finally {
			if (_didIteratorError8) {
				throw _iteratorError8;
			}
		}
	}

	var _iteratorNormalCompletion9 = true;
	var _didIteratorError9 = false;
	var _iteratorError9 = undefined;

	try {
		for (var _iterator9 = (0, _getIterator3.default)(extendedRtpCapabilities.headerExtensions), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
			var capExt = _step9.value;

			if (capExt.kind !== kind) continue;

			var ext = {
				uri: capExt.uri,
				id: capExt.recvId
			};

			params.headerExtensions.push(ext);
		}
	} catch (err) {
		_didIteratorError9 = true;
		_iteratorError9 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion9 && _iterator9.return) {
				_iterator9.return();
			}
		} finally {
			if (_didIteratorError9) {
				throw _iteratorError9;
			}
		}
	}

	return params;
}

function matchCodecs(aCodec, bCodec) {
	return aCodec.mimeType === bCodec.mimeType && aCodec.clockRate === bCodec.clockRate;
}

function matchHeaderExtensions(aExt, bExt) {
	return aExt.kind === bExt.kind && aExt.uri === bExt.uri;
}

function reduceRtcpFeedback(codecA, codecB) {
	var reducedRtcpFeedback = [];

	var _iteratorNormalCompletion10 = true;
	var _didIteratorError10 = false;
	var _iteratorError10 = undefined;

	try {
		var _loop4 = function _loop4() {
			var aFb = _step10.value;

			var matchingBFb = (codecB.rtcpFeedback || []).find(function (bFb) {
				return bFb.type === aFb.type && bFb.parameter === aFb.parameter;
			});

			if (matchingBFb) reducedRtcpFeedback.push(matchingBFb);
		};

		for (var _iterator10 = (0, _getIterator3.default)(codecA.rtcpFeedback || []), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
			_loop4();
		}
	} catch (err) {
		_didIteratorError10 = true;
		_iteratorError10 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion10 && _iterator10.return) {
				_iterator10.return();
			}
		} finally {
			if (_didIteratorError10) {
				throw _iteratorError10;
			}
		}
	}

	return reducedRtcpFeedback;
}

},{"babel-runtime/core-js/get-iterator":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/get-iterator.js","babel-runtime/core-js/json/stringify":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/json/stringify.js","random-number":"/Users/ibc/src/mediasoup-client/node_modules/random-number/index.js"}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/array/from.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/array/from"), __esModule: true };
},{"core-js/library/fn/array/from":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/array/from.js"}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/get-iterator.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/get-iterator.js"}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/json/stringify.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/json/stringify"), __esModule: true };
},{"core-js/library/fn/json/stringify":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/json/stringify.js"}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/map.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/map"), __esModule: true };
},{"core-js/library/fn/map":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/map.js"}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/assign.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/assign"), __esModule: true };
},{"core-js/library/fn/object/assign":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/object/assign.js"}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/create.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/object/create.js"}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/define-property.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/object/define-property.js"}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/get-prototype-of.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/get-prototype-of":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/object/get-prototype-of.js"}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/keys.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/keys"), __esModule: true };
},{"core-js/library/fn/object/keys":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/object/keys.js"}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/set-prototype-of.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/object/set-prototype-of.js"}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/promise.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };
},{"core-js/library/fn/promise":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/promise.js"}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/set.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/set"), __esModule: true };
},{"core-js/library/fn/set":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/set.js"}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/symbol.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/symbol/index.js"}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/symbol/iterator.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/symbol/iterator.js"}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/classCallCheck.js":[function(require,module,exports){
"use strict";

exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
},{}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/createClass.js":[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("../core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
},{"../core-js/object/define-property":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/define-property.js"}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/extends.js":[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _assign = require("../core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _assign2.default || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};
},{"../core-js/object/assign":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/assign.js"}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/inherits.js":[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _setPrototypeOf = require("../core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("../core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
  }

  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
};
},{"../core-js/object/create":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/create.js","../core-js/object/set-prototype-of":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/set-prototype-of.js","../helpers/typeof":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/typeof.js"}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/possibleConstructorReturn.js":[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
};
},{"../helpers/typeof":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/typeof.js"}],"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/typeof.js":[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _iterator = require("../core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require("../core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};
},{"../core-js/symbol":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/symbol.js","../core-js/symbol/iterator":"/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/symbol/iterator.js"}],"/Users/ibc/src/mediasoup-client/node_modules/bowser/src/bowser.js":[function(require,module,exports){
/*!
 * Bowser - a browser detector
 * https://github.com/ded/bowser
 * MIT License | (c) Dustin Diaz 2015
 */

!function (root, name, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(name, definition)
  else root[name] = definition()
}(this, 'bowser', function () {
  /**
    * See useragents.js for examples of navigator.userAgent
    */

  var t = true

  function detect(ua) {

    function getFirstMatch(regex) {
      var match = ua.match(regex);
      return (match && match.length > 1 && match[1]) || '';
    }

    function getSecondMatch(regex) {
      var match = ua.match(regex);
      return (match && match.length > 1 && match[2]) || '';
    }

    var iosdevice = getFirstMatch(/(ipod|iphone|ipad)/i).toLowerCase()
      , likeAndroid = /like android/i.test(ua)
      , android = !likeAndroid && /android/i.test(ua)
      , nexusMobile = /nexus\s*[0-6]\s*/i.test(ua)
      , nexusTablet = !nexusMobile && /nexus\s*[0-9]+/i.test(ua)
      , chromeos = /CrOS/.test(ua)
      , silk = /silk/i.test(ua)
      , sailfish = /sailfish/i.test(ua)
      , tizen = /tizen/i.test(ua)
      , webos = /(web|hpw)os/i.test(ua)
      , windowsphone = /windows phone/i.test(ua)
      , samsungBrowser = /SamsungBrowser/i.test(ua)
      , windows = !windowsphone && /windows/i.test(ua)
      , mac = !iosdevice && !silk && /macintosh/i.test(ua)
      , linux = !android && !sailfish && !tizen && !webos && /linux/i.test(ua)
      , edgeVersion = getFirstMatch(/edge\/(\d+(\.\d+)?)/i)
      , versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i)
      , tablet = /tablet/i.test(ua) && !/tablet pc/i.test(ua)
      , mobile = !tablet && /[^-]mobi/i.test(ua)
      , xbox = /xbox/i.test(ua)
      , result

    if (/opera/i.test(ua)) {
      //  an old Opera
      result = {
        name: 'Opera'
      , opera: t
      , version: versionIdentifier || getFirstMatch(/(?:opera|opr|opios)[\s\/](\d+(\.\d+)?)/i)
      }
    } else if (/opr|opios/i.test(ua)) {
      // a new Opera
      result = {
        name: 'Opera'
        , opera: t
        , version: getFirstMatch(/(?:opr|opios)[\s\/](\d+(\.\d+)?)/i) || versionIdentifier
      }
    }
    else if (/SamsungBrowser/i.test(ua)) {
      result = {
        name: 'Samsung Internet for Android'
        , samsungBrowser: t
        , version: versionIdentifier || getFirstMatch(/(?:SamsungBrowser)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/coast/i.test(ua)) {
      result = {
        name: 'Opera Coast'
        , coast: t
        , version: versionIdentifier || getFirstMatch(/(?:coast)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/yabrowser/i.test(ua)) {
      result = {
        name: 'Yandex Browser'
      , yandexbrowser: t
      , version: versionIdentifier || getFirstMatch(/(?:yabrowser)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/ucbrowser/i.test(ua)) {
      result = {
          name: 'UC Browser'
        , ucbrowser: t
        , version: getFirstMatch(/(?:ucbrowser)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/mxios/i.test(ua)) {
      result = {
        name: 'Maxthon'
        , maxthon: t
        , version: getFirstMatch(/(?:mxios)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/epiphany/i.test(ua)) {
      result = {
        name: 'Epiphany'
        , epiphany: t
        , version: getFirstMatch(/(?:epiphany)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/puffin/i.test(ua)) {
      result = {
        name: 'Puffin'
        , puffin: t
        , version: getFirstMatch(/(?:puffin)[\s\/](\d+(?:\.\d+)?)/i)
      }
    }
    else if (/sleipnir/i.test(ua)) {
      result = {
        name: 'Sleipnir'
        , sleipnir: t
        , version: getFirstMatch(/(?:sleipnir)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/k-meleon/i.test(ua)) {
      result = {
        name: 'K-Meleon'
        , kMeleon: t
        , version: getFirstMatch(/(?:k-meleon)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (windowsphone) {
      result = {
        name: 'Windows Phone'
      , windowsphone: t
      }
      if (edgeVersion) {
        result.msedge = t
        result.version = edgeVersion
      }
      else {
        result.msie = t
        result.version = getFirstMatch(/iemobile\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/msie|trident/i.test(ua)) {
      result = {
        name: 'Internet Explorer'
      , msie: t
      , version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
      }
    } else if (chromeos) {
      result = {
        name: 'Chrome'
      , chromeos: t
      , chromeBook: t
      , chrome: t
      , version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
      }
    } else if (/chrome.+? edge/i.test(ua)) {
      result = {
        name: 'Microsoft Edge'
      , msedge: t
      , version: edgeVersion
      }
    }
    else if (/vivaldi/i.test(ua)) {
      result = {
        name: 'Vivaldi'
        , vivaldi: t
        , version: getFirstMatch(/vivaldi\/(\d+(\.\d+)?)/i) || versionIdentifier
      }
    }
    else if (sailfish) {
      result = {
        name: 'Sailfish'
      , sailfish: t
      , version: getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/seamonkey\//i.test(ua)) {
      result = {
        name: 'SeaMonkey'
      , seamonkey: t
      , version: getFirstMatch(/seamonkey\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/firefox|iceweasel|fxios/i.test(ua)) {
      result = {
        name: 'Firefox'
      , firefox: t
      , version: getFirstMatch(/(?:firefox|iceweasel|fxios)[ \/](\d+(\.\d+)?)/i)
      }
      if (/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(ua)) {
        result.firefoxos = t
      }
    }
    else if (silk) {
      result =  {
        name: 'Amazon Silk'
      , silk: t
      , version : getFirstMatch(/silk\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/phantom/i.test(ua)) {
      result = {
        name: 'PhantomJS'
      , phantom: t
      , version: getFirstMatch(/phantomjs\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/slimerjs/i.test(ua)) {
      result = {
        name: 'SlimerJS'
        , slimer: t
        , version: getFirstMatch(/slimerjs\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/blackberry|\bbb\d+/i.test(ua) || /rim\stablet/i.test(ua)) {
      result = {
        name: 'BlackBerry'
      , blackberry: t
      , version: versionIdentifier || getFirstMatch(/blackberry[\d]+\/(\d+(\.\d+)?)/i)
      }
    }
    else if (webos) {
      result = {
        name: 'WebOS'
      , webos: t
      , version: versionIdentifier || getFirstMatch(/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i)
      };
      /touchpad\//i.test(ua) && (result.touchpad = t)
    }
    else if (/bada/i.test(ua)) {
      result = {
        name: 'Bada'
      , bada: t
      , version: getFirstMatch(/dolfin\/(\d+(\.\d+)?)/i)
      };
    }
    else if (tizen) {
      result = {
        name: 'Tizen'
      , tizen: t
      , version: getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i) || versionIdentifier
      };
    }
    else if (/qupzilla/i.test(ua)) {
      result = {
        name: 'QupZilla'
        , qupzilla: t
        , version: getFirstMatch(/(?:qupzilla)[\s\/](\d+(?:\.\d+)+)/i) || versionIdentifier
      }
    }
    else if (/chromium/i.test(ua)) {
      result = {
        name: 'Chromium'
        , chromium: t
        , version: getFirstMatch(/(?:chromium)[\s\/](\d+(?:\.\d+)?)/i) || versionIdentifier
      }
    }
    else if (/chrome|crios|crmo/i.test(ua)) {
      result = {
        name: 'Chrome'
        , chrome: t
        , version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
      }
    }
    else if (android) {
      result = {
        name: 'Android'
        , version: versionIdentifier
      }
    }
    else if (/safari|applewebkit/i.test(ua)) {
      result = {
        name: 'Safari'
      , safari: t
      }
      if (versionIdentifier) {
        result.version = versionIdentifier
      }
    }
    else if (iosdevice) {
      result = {
        name : iosdevice == 'iphone' ? 'iPhone' : iosdevice == 'ipad' ? 'iPad' : 'iPod'
      }
      // WTF: version is not part of user agent in web apps
      if (versionIdentifier) {
        result.version = versionIdentifier
      }
    }
    else if(/googlebot/i.test(ua)) {
      result = {
        name: 'Googlebot'
      , googlebot: t
      , version: getFirstMatch(/googlebot\/(\d+(\.\d+))/i) || versionIdentifier
      }
    }
    else {
      result = {
        name: getFirstMatch(/^(.*)\/(.*) /),
        version: getSecondMatch(/^(.*)\/(.*) /)
     };
   }

    // set webkit or gecko flag for browsers based on these engines
    if (!result.msedge && /(apple)?webkit/i.test(ua)) {
      if (/(apple)?webkit\/537\.36/i.test(ua)) {
        result.name = result.name || "Blink"
        result.blink = t
      } else {
        result.name = result.name || "Webkit"
        result.webkit = t
      }
      if (!result.version && versionIdentifier) {
        result.version = versionIdentifier
      }
    } else if (!result.opera && /gecko\//i.test(ua)) {
      result.name = result.name || "Gecko"
      result.gecko = t
      result.version = result.version || getFirstMatch(/gecko\/(\d+(\.\d+)?)/i)
    }

    // set OS flags for platforms that have multiple browsers
    if (!result.windowsphone && !result.msedge && (android || result.silk)) {
      result.android = t
    } else if (!result.windowsphone && !result.msedge && iosdevice) {
      result[iosdevice] = t
      result.ios = t
    } else if (mac) {
      result.mac = t
    } else if (xbox) {
      result.xbox = t
    } else if (windows) {
      result.windows = t
    } else if (linux) {
      result.linux = t
    }

    function getWindowsVersion (s) {
      switch (s) {
        case 'NT': return 'NT'
        case 'XP': return 'XP'
        case 'NT 5.0': return '2000'
        case 'NT 5.1': return 'XP'
        case 'NT 5.2': return '2003'
        case 'NT 6.0': return 'Vista'
        case 'NT 6.1': return '7'
        case 'NT 6.2': return '8'
        case 'NT 6.3': return '8.1'
        case 'NT 10.0': return '10'
        default: return undefined
      }
    }
    
    // OS version extraction
    var osVersion = '';
    if (result.windows) {
      osVersion = getWindowsVersion(getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i))
    } else if (result.windowsphone) {
      osVersion = getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i);
    } else if (result.mac) {
      osVersion = getFirstMatch(/Mac OS X (\d+([_\.\s]\d+)*)/i);
      osVersion = osVersion.replace(/[_\s]/g, '.');
    } else if (iosdevice) {
      osVersion = getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i);
      osVersion = osVersion.replace(/[_\s]/g, '.');
    } else if (android) {
      osVersion = getFirstMatch(/android[ \/-](\d+(\.\d+)*)/i);
    } else if (result.webos) {
      osVersion = getFirstMatch(/(?:web|hpw)os\/(\d+(\.\d+)*)/i);
    } else if (result.blackberry) {
      osVersion = getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i);
    } else if (result.bada) {
      osVersion = getFirstMatch(/bada\/(\d+(\.\d+)*)/i);
    } else if (result.tizen) {
      osVersion = getFirstMatch(/tizen[\/\s](\d+(\.\d+)*)/i);
    }
    if (osVersion) {
      result.osversion = osVersion;
    }

    // device type extraction
    var osMajorVersion = !result.windows && osVersion.split('.')[0];
    if (
         tablet
      || nexusTablet
      || iosdevice == 'ipad'
      || (android && (osMajorVersion == 3 || (osMajorVersion >= 4 && !mobile)))
      || result.silk
    ) {
      result.tablet = t
    } else if (
         mobile
      || iosdevice == 'iphone'
      || iosdevice == 'ipod'
      || android
      || nexusMobile
      || result.blackberry
      || result.webos
      || result.bada
    ) {
      result.mobile = t
    }

    // Graded Browser Support
    // http://developer.yahoo.com/yui/articles/gbs
    if (result.msedge ||
        (result.msie && result.version >= 10) ||
        (result.yandexbrowser && result.version >= 15) ||
		    (result.vivaldi && result.version >= 1.0) ||
        (result.chrome && result.version >= 20) ||
        (result.samsungBrowser && result.version >= 4) ||
        (result.firefox && result.version >= 20.0) ||
        (result.safari && result.version >= 6) ||
        (result.opera && result.version >= 10.0) ||
        (result.ios && result.osversion && result.osversion.split(".")[0] >= 6) ||
        (result.blackberry && result.version >= 10.1)
        || (result.chromium && result.version >= 20)
        ) {
      result.a = t;
    }
    else if ((result.msie && result.version < 10) ||
        (result.chrome && result.version < 20) ||
        (result.firefox && result.version < 20.0) ||
        (result.safari && result.version < 6) ||
        (result.opera && result.version < 10.0) ||
        (result.ios && result.osversion && result.osversion.split(".")[0] < 6)
        || (result.chromium && result.version < 20)
        ) {
      result.c = t
    } else result.x = t

    return result
  }

  var bowser = detect(typeof navigator !== 'undefined' ? navigator.userAgent || '' : '')

  bowser.test = function (browserList) {
    for (var i = 0; i < browserList.length; ++i) {
      var browserItem = browserList[i];
      if (typeof browserItem=== 'string') {
        if (browserItem in bowser) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get version precisions count
   *
   * @example
   *   getVersionPrecision("1.10.3") // 3
   *
   * @param  {string} version
   * @return {number}
   */
  function getVersionPrecision(version) {
    return version.split(".").length;
  }

  /**
   * Array::map polyfill
   *
   * @param  {Array} arr
   * @param  {Function} iterator
   * @return {Array}
   */
  function map(arr, iterator) {
    var result = [], i;
    if (Array.prototype.map) {
      return Array.prototype.map.call(arr, iterator);
    }
    for (i = 0; i < arr.length; i++) {
      result.push(iterator(arr[i]));
    }
    return result;
  }

  /**
   * Calculate browser version weight
   *
   * @example
   *   compareVersions(['1.10.2.1',  '1.8.2.1.90'])    // 1
   *   compareVersions(['1.010.2.1', '1.09.2.1.90']);  // 1
   *   compareVersions(['1.10.2.1',  '1.10.2.1']);     // 0
   *   compareVersions(['1.10.2.1',  '1.0800.2']);     // -1
   *
   * @param  {Array<String>} versions versions to compare
   * @return {Number} comparison result
   */
  function compareVersions(versions) {
    // 1) get common precision for both versions, for example for "10.0" and "9" it should be 2
    var precision = Math.max(getVersionPrecision(versions[0]), getVersionPrecision(versions[1]));
    var chunks = map(versions, function (version) {
      var delta = precision - getVersionPrecision(version);

      // 2) "9" -> "9.0" (for precision = 2)
      version = version + new Array(delta + 1).join(".0");

      // 3) "9.0" -> ["000000000"", "000000009"]
      return map(version.split("."), function (chunk) {
        return new Array(20 - chunk.length).join("0") + chunk;
      }).reverse();
    });

    // iterate in reverse order by reversed chunks array
    while (--precision >= 0) {
      // 4) compare: "000000009" > "000000010" = false (but "9" > "10" = true)
      if (chunks[0][precision] > chunks[1][precision]) {
        return 1;
      }
      else if (chunks[0][precision] === chunks[1][precision]) {
        if (precision === 0) {
          // all version chunks are same
          return 0;
        }
      }
      else {
        return -1;
      }
    }
  }

  /**
   * Check if browser is unsupported
   *
   * @example
   *   bowser.isUnsupportedBrowser({
   *     msie: "10",
   *     firefox: "23",
   *     chrome: "29",
   *     safari: "5.1",
   *     opera: "16",
   *     phantom: "534"
   *   });
   *
   * @param  {Object}  minVersions map of minimal version to browser
   * @param  {Boolean} [strictMode = false] flag to return false if browser wasn't found in map
   * @param  {String}  [ua] user agent string
   * @return {Boolean}
   */
  function isUnsupportedBrowser(minVersions, strictMode, ua) {
    var _bowser = bowser;

    // make strictMode param optional with ua param usage
    if (typeof strictMode === 'string') {
      ua = strictMode;
      strictMode = void(0);
    }

    if (strictMode === void(0)) {
      strictMode = false;
    }
    if (ua) {
      _bowser = detect(ua);
    }

    var version = "" + _bowser.version;
    for (var browser in minVersions) {
      if (minVersions.hasOwnProperty(browser)) {
        if (_bowser[browser]) {
          if (typeof minVersions[browser] !== 'string') {
            throw new Error('Browser version in the minVersion map should be a string: ' + browser + ': ' + String(minVersions));
          }

          // browser version and min supported version.
          return compareVersions([version, minVersions[browser]]) < 0;
        }
      }
    }

    return strictMode; // not found
  }

  /**
   * Check if browser is supported
   *
   * @param  {Object} minVersions map of minimal version to browser
   * @param  {Boolean} [strictMode = false] flag to return false if browser wasn't found in map
   * @param  {String}  [ua] user agent string
   * @return {Boolean}
   */
  function check(minVersions, strictMode, ua) {
    return !isUnsupportedBrowser(minVersions, strictMode, ua);
  }

  bowser.isUnsupportedBrowser = isUnsupportedBrowser;
  bowser.compareVersions = compareVersions;
  bowser.check = check;

  /*
   * Set our detect method to the main bowser object so we can
   * reuse it to test other user agents.
   * This is needed to implement future tests.
   */
  bowser._detect = detect;

  return bowser
});

},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/array/from.js":[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/es6.array.from');
module.exports = require('../../modules/_core').Array.from;
},{"../../modules/_core":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js","../../modules/es6.array.from":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.array.from.js","../../modules/es6.string.iterator":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.string.iterator.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/get-iterator.js":[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.get-iterator');
},{"../modules/core.get-iterator":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/core.get-iterator.js","../modules/es6.string.iterator":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.string.iterator.js","../modules/web.dom.iterable":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/web.dom.iterable.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/json/stringify.js":[function(require,module,exports){
var core  = require('../../modules/_core')
  , $JSON = core.JSON || (core.JSON = {stringify: JSON.stringify});
module.exports = function stringify(it){ // eslint-disable-line no-unused-vars
  return $JSON.stringify.apply($JSON, arguments);
};
},{"../../modules/_core":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/map.js":[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.map');
require('../modules/es7.map.to-json');
module.exports = require('../modules/_core').Map;
},{"../modules/_core":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js","../modules/es6.map":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.map.js","../modules/es6.object.to-string":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.object.to-string.js","../modules/es6.string.iterator":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.string.iterator.js","../modules/es7.map.to-json":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es7.map.to-json.js","../modules/web.dom.iterable":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/web.dom.iterable.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/object/assign.js":[function(require,module,exports){
require('../../modules/es6.object.assign');
module.exports = require('../../modules/_core').Object.assign;
},{"../../modules/_core":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js","../../modules/es6.object.assign":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.object.assign.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/object/create.js":[function(require,module,exports){
require('../../modules/es6.object.create');
var $Object = require('../../modules/_core').Object;
module.exports = function create(P, D){
  return $Object.create(P, D);
};
},{"../../modules/_core":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js","../../modules/es6.object.create":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.object.create.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/object/define-property.js":[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc){
  return $Object.defineProperty(it, key, desc);
};
},{"../../modules/_core":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js","../../modules/es6.object.define-property":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.object.define-property.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/object/get-prototype-of.js":[function(require,module,exports){
require('../../modules/es6.object.get-prototype-of');
module.exports = require('../../modules/_core').Object.getPrototypeOf;
},{"../../modules/_core":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js","../../modules/es6.object.get-prototype-of":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.object.get-prototype-of.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/object/keys.js":[function(require,module,exports){
require('../../modules/es6.object.keys');
module.exports = require('../../modules/_core').Object.keys;
},{"../../modules/_core":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js","../../modules/es6.object.keys":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.object.keys.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/object/set-prototype-of.js":[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/_core').Object.setPrototypeOf;
},{"../../modules/_core":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js","../../modules/es6.object.set-prototype-of":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.object.set-prototype-of.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/promise.js":[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
module.exports = require('../modules/_core').Promise;
},{"../modules/_core":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js","../modules/es6.object.to-string":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.object.to-string.js","../modules/es6.promise":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.promise.js","../modules/es6.string.iterator":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.string.iterator.js","../modules/web.dom.iterable":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/web.dom.iterable.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/set.js":[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.set');
require('../modules/es7.set.to-json');
module.exports = require('../modules/_core').Set;
},{"../modules/_core":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js","../modules/es6.object.to-string":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.object.to-string.js","../modules/es6.set":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.set.js","../modules/es6.string.iterator":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.string.iterator.js","../modules/es7.set.to-json":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es7.set.to-json.js","../modules/web.dom.iterable":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/web.dom.iterable.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/symbol/index.js":[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
require('../../modules/es7.symbol.async-iterator');
require('../../modules/es7.symbol.observable');
module.exports = require('../../modules/_core').Symbol;
},{"../../modules/_core":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js","../../modules/es6.object.to-string":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.object.to-string.js","../../modules/es6.symbol":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.symbol.js","../../modules/es7.symbol.async-iterator":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es7.symbol.async-iterator.js","../../modules/es7.symbol.observable":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es7.symbol.observable.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/symbol/iterator.js":[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/_wks-ext').f('iterator');
},{"../../modules/_wks-ext":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks-ext.js","../../modules/es6.string.iterator":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.string.iterator.js","../../modules/web.dom.iterable":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/web.dom.iterable.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_a-function.js":[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_add-to-unscopables.js":[function(require,module,exports){
module.exports = function(){ /* empty */ };
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_an-instance.js":[function(require,module,exports){
module.exports = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_an-object.js":[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_is-object.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_array-from-iterable.js":[function(require,module,exports){
var forOf = require('./_for-of');

module.exports = function(iter, ITERATOR){
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};

},{"./_for-of":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_for-of.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_array-includes.js":[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject')
  , toLength  = require('./_to-length')
  , toIndex   = require('./_to-index');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};
},{"./_to-index":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-index.js","./_to-iobject":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-iobject.js","./_to-length":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-length.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_array-methods.js":[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx      = require('./_ctx')
  , IObject  = require('./_iobject')
  , toObject = require('./_to-object')
  , toLength = require('./_to-length')
  , asc      = require('./_array-species-create');
module.exports = function(TYPE, $create){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX
    , create        = $create || asc;
  return function($this, callbackfn, that){
    var O      = toObject($this)
      , self   = IObject(O)
      , f      = ctx(callbackfn, that, 3)
      , length = toLength(self.length)
      , index  = 0
      , result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
},{"./_array-species-create":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_array-species-create.js","./_ctx":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_ctx.js","./_iobject":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iobject.js","./_to-length":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-length.js","./_to-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-object.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_array-species-constructor.js":[function(require,module,exports){
var isObject = require('./_is-object')
  , isArray  = require('./_is-array')
  , SPECIES  = require('./_wks')('species');

module.exports = function(original){
  var C;
  if(isArray(original)){
    C = original.constructor;
    // cross-realm fallback
    if(typeof C == 'function' && (C === Array || isArray(C.prototype)))C = undefined;
    if(isObject(C)){
      C = C[SPECIES];
      if(C === null)C = undefined;
    }
  } return C === undefined ? Array : C;
};
},{"./_is-array":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_is-array.js","./_is-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_is-object.js","./_wks":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_array-species-create.js":[function(require,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = require('./_array-species-constructor');

module.exports = function(original, length){
  return new (speciesConstructor(original))(length);
};
},{"./_array-species-constructor":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_array-species-constructor.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_classof.js":[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof')
  , TAG = require('./_wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./_cof":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_cof.js","./_wks":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_cof.js":[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_collection-strong.js":[function(require,module,exports){
'use strict';
var dP          = require('./_object-dp').f
  , create      = require('./_object-create')
  , redefineAll = require('./_redefine-all')
  , ctx         = require('./_ctx')
  , anInstance  = require('./_an-instance')
  , defined     = require('./_defined')
  , forOf       = require('./_for-of')
  , $iterDefine = require('./_iter-define')
  , step        = require('./_iter-step')
  , setSpecies  = require('./_set-species')
  , DESCRIPTORS = require('./_descriptors')
  , fastKey     = require('./_meta').fastKey
  , SIZE        = DESCRIPTORS ? '_s' : 'size';

var getEntry = function(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index !== 'F')return that._i[index];
  // frozen object case
  for(entry = that._f; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      anInstance(that, C, NAME, '_i');
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that._f == entry)that._f = next;
          if(that._l == entry)that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        anInstance(this, C, 'forEach');
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
          , entry;
        while(entry = entry ? entry.n : this._f){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if(DESCRIPTORS)dP(C.prototype, 'size', {
      get: function(){
        return defined(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that._f)that._f = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index !== 'F')that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function(C, NAME, IS_MAP){
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function(iterated, kind){
      this._t = iterated;  // target
      this._k = kind;      // kind
      this._l = undefined; // previous
    }, function(){
      var that  = this
        , kind  = that._k
        , entry = that._l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};
},{"./_an-instance":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_an-instance.js","./_ctx":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_ctx.js","./_defined":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_defined.js","./_descriptors":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_descriptors.js","./_for-of":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_for-of.js","./_iter-define":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-define.js","./_iter-step":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-step.js","./_meta":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_meta.js","./_object-create":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-create.js","./_object-dp":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-dp.js","./_redefine-all":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_redefine-all.js","./_set-species":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_set-species.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_collection-to-json.js":[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var classof = require('./_classof')
  , from    = require('./_array-from-iterable');
module.exports = function(NAME){
  return function toJSON(){
    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
    return from(this);
  };
};
},{"./_array-from-iterable":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_array-from-iterable.js","./_classof":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_classof.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_collection.js":[function(require,module,exports){
'use strict';
var global         = require('./_global')
  , $export        = require('./_export')
  , meta           = require('./_meta')
  , fails          = require('./_fails')
  , hide           = require('./_hide')
  , redefineAll    = require('./_redefine-all')
  , forOf          = require('./_for-of')
  , anInstance     = require('./_an-instance')
  , isObject       = require('./_is-object')
  , setToStringTag = require('./_set-to-string-tag')
  , dP             = require('./_object-dp').f
  , each           = require('./_array-methods')(0)
  , DESCRIPTORS    = require('./_descriptors');

module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
  var Base  = global[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  if(!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function(){
    new C().entries().next();
  }))){
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    C = wrapper(function(target, iterable){
      anInstance(target, C, NAME, '_c');
      target._c = new Base;
      if(iterable != undefined)forOf(iterable, IS_MAP, target[ADDER], target);
    });
    each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','),function(KEY){
      var IS_ADDER = KEY == 'add' || KEY == 'set';
      if(KEY in proto && !(IS_WEAK && KEY == 'clear'))hide(C.prototype, KEY, function(a, b){
        anInstance(this, C, KEY);
        if(!IS_ADDER && IS_WEAK && !isObject(a))return KEY == 'get' ? undefined : false;
        var result = this._c[KEY](a === 0 ? 0 : a, b);
        return IS_ADDER ? this : result;
      });
    });
    if('size' in proto)dP(C.prototype, 'size', {
      get: function(){
        return this._c.size;
      }
    });
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F, O);

  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

  return C;
};
},{"./_an-instance":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_an-instance.js","./_array-methods":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_array-methods.js","./_descriptors":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_descriptors.js","./_export":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_export.js","./_fails":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_fails.js","./_for-of":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_for-of.js","./_global":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_global.js","./_hide":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_hide.js","./_is-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_is-object.js","./_meta":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_meta.js","./_object-dp":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-dp.js","./_redefine-all":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_redefine-all.js","./_set-to-string-tag":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_set-to-string-tag.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js":[function(require,module,exports){
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_create-property.js":[function(require,module,exports){
'use strict';
var $defineProperty = require('./_object-dp')
  , createDesc      = require('./_property-desc');

module.exports = function(object, index, value){
  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};
},{"./_object-dp":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-dp.js","./_property-desc":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_property-desc.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_ctx.js":[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./_a-function":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_a-function.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_defined.js":[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_descriptors.js":[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_fails.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_dom-create.js":[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_global.js","./_is-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_is-object.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_enum-bug-keys.js":[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_enum-keys.js":[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys')
  , gOPS    = require('./_object-gops')
  , pIE     = require('./_object-pie');
module.exports = function(it){
  var result     = getKeys(it)
    , getSymbols = gOPS.f;
  if(getSymbols){
    var symbols = getSymbols(it)
      , isEnum  = pIE.f
      , i       = 0
      , key;
    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
  } return result;
};
},{"./_object-gops":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-gops.js","./_object-keys":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-keys.js","./_object-pie":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-pie.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_export.js":[function(require,module,exports){
var global    = require('./_global')
  , core      = require('./_core')
  , ctx       = require('./_ctx')
  , hide      = require('./_hide')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , IS_WRAP   = type & $export.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE]
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(a, b, c){
        if(this instanceof C){
          switch(arguments.length){
            case 0: return new C;
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if(IS_PROTO){
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"./_core":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js","./_ctx":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_ctx.js","./_global":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_global.js","./_hide":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_hide.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_fails.js":[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_for-of.js":[function(require,module,exports){
var ctx         = require('./_ctx')
  , call        = require('./_iter-call')
  , isArrayIter = require('./_is-array-iter')
  , anObject    = require('./_an-object')
  , toLength    = require('./_to-length')
  , getIterFn   = require('./core.get-iterator-method')
  , BREAK       = {}
  , RETURN      = {};
var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator, result;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if(result === BREAK || result === RETURN)return result;
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    result = call(iterator, f, step.value, entries);
    if(result === BREAK || result === RETURN)return result;
  }
};
exports.BREAK  = BREAK;
exports.RETURN = RETURN;
},{"./_an-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_an-object.js","./_ctx":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_ctx.js","./_is-array-iter":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_is-array-iter.js","./_iter-call":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-call.js","./_to-length":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-length.js","./core.get-iterator-method":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/core.get-iterator-method.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_global.js":[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_has.js":[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_hide.js":[function(require,module,exports){
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_descriptors.js","./_object-dp":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-dp.js","./_property-desc":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_property-desc.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_html.js":[function(require,module,exports){
module.exports = require('./_global').document && document.documentElement;
},{"./_global":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_global.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_ie8-dom-define.js":[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_descriptors.js","./_dom-create":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_dom-create.js","./_fails":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_fails.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_invoke.js":[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return              fn.apply(that, args);
};
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iobject.js":[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_cof.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_is-array-iter.js":[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./_iterators')
  , ITERATOR   = require('./_wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./_iterators":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iterators.js","./_wks":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_is-array.js":[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg){
  return cof(arg) == 'Array';
};
},{"./_cof":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_cof.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_is-object.js":[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-call.js":[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./_an-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_an-object.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-create.js":[function(require,module,exports){
'use strict';
var create         = require('./_object-create')
  , descriptor     = require('./_property-desc')
  , setToStringTag = require('./_set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./_hide":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_hide.js","./_object-create":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-create.js","./_property-desc":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_property-desc.js","./_set-to-string-tag":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_set-to-string-tag.js","./_wks":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-define.js":[function(require,module,exports){
'use strict';
var LIBRARY        = require('./_library')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , hide           = require('./_hide')
  , has            = require('./_has')
  , Iterators      = require('./_iterators')
  , $iterCreate    = require('./_iter-create')
  , setToStringTag = require('./_set-to-string-tag')
  , getPrototypeOf = require('./_object-gpo')
  , ITERATOR       = require('./_wks')('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./_export":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_export.js","./_has":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_has.js","./_hide":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_hide.js","./_iter-create":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-create.js","./_iterators":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iterators.js","./_library":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_library.js","./_object-gpo":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-gpo.js","./_redefine":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_redefine.js","./_set-to-string-tag":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_set-to-string-tag.js","./_wks":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-detect.js":[function(require,module,exports){
var ITERATOR     = require('./_wks')('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./_wks":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-step.js":[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iterators.js":[function(require,module,exports){
module.exports = {};
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_keyof.js":[function(require,module,exports){
var getKeys   = require('./_object-keys')
  , toIObject = require('./_to-iobject');
module.exports = function(object, el){
  var O      = toIObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./_object-keys":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-keys.js","./_to-iobject":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-iobject.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_library.js":[function(require,module,exports){
module.exports = true;
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_meta.js":[function(require,module,exports){
var META     = require('./_uid')('meta')
  , isObject = require('./_is-object')
  , has      = require('./_has')
  , setDesc  = require('./_object-dp').f
  , id       = 0;
var isExtensible = Object.isExtensible || function(){
  return true;
};
var FREEZE = !require('./_fails')(function(){
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function(it){
  setDesc(it, META, {value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  }});
};
var fastKey = function(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add metadata
    if(!create)return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function(it, create){
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return true;
    // not necessary to add metadata
    if(!create)return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function(it){
  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY:      META,
  NEED:     false,
  fastKey:  fastKey,
  getWeak:  getWeak,
  onFreeze: onFreeze
};
},{"./_fails":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_fails.js","./_has":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_has.js","./_is-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_is-object.js","./_object-dp":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-dp.js","./_uid":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_uid.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_microtask.js":[function(require,module,exports){
var global    = require('./_global')
  , macrotask = require('./_task').set
  , Observer  = global.MutationObserver || global.WebKitMutationObserver
  , process   = global.process
  , Promise   = global.Promise
  , isNode    = require('./_cof')(process) == 'process';

module.exports = function(){
  var head, last, notify;

  var flush = function(){
    var parent, fn;
    if(isNode && (parent = process.domain))parent.exit();
    while(head){
      fn   = head.fn;
      head = head.next;
      try {
        fn();
      } catch(e){
        if(head)notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if(parent)parent.enter();
  };

  // Node.js
  if(isNode){
    notify = function(){
      process.nextTick(flush);
    };
  // browsers with MutationObserver
  } else if(Observer){
    var toggle = true
      , node   = document.createTextNode('');
    new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
    notify = function(){
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if(Promise && Promise.resolve){
    var promise = Promise.resolve();
    notify = function(){
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function(){
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function(fn){
    var task = {fn: fn, next: undefined};
    if(last)last.next = task;
    if(!head){
      head = task;
      notify();
    } last = task;
  };
};
},{"./_cof":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_cof.js","./_global":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_global.js","./_task":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_task.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-assign.js":[function(require,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys  = require('./_object-keys')
  , gOPS     = require('./_object-gops')
  , pIE      = require('./_object-pie')
  , toObject = require('./_to-object')
  , IObject  = require('./_iobject')
  , $assign  = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || require('./_fails')(function(){
  var A = {}
    , B = {}
    , S = Symbol()
    , K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function(k){ B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
  var T     = toObject(target)
    , aLen  = arguments.length
    , index = 1
    , getSymbols = gOPS.f
    , isEnum     = pIE.f;
  while(aLen > index){
    var S      = IObject(arguments[index++])
      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
  } return T;
} : $assign;
},{"./_fails":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_fails.js","./_iobject":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iobject.js","./_object-gops":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-gops.js","./_object-keys":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-keys.js","./_object-pie":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-pie.js","./_to-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-object.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-create.js":[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = require('./_an-object')
  , dPs         = require('./_object-dps')
  , enumBugKeys = require('./_enum-bug-keys')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe')
    , i      = enumBugKeys.length
    , lt     = '<'
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_an-object.js","./_dom-create":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_dom-create.js","./_enum-bug-keys":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_enum-bug-keys.js","./_html":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_html.js","./_object-dps":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-dps.js","./_shared-key":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_shared-key.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-dp.js":[function(require,module,exports){
var anObject       = require('./_an-object')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , toPrimitive    = require('./_to-primitive')
  , dP             = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"./_an-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_an-object.js","./_descriptors":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_descriptors.js","./_ie8-dom-define":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_ie8-dom-define.js","./_to-primitive":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-primitive.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-dps.js":[function(require,module,exports){
var dP       = require('./_object-dp')
  , anObject = require('./_an-object')
  , getKeys  = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
},{"./_an-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_an-object.js","./_descriptors":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_descriptors.js","./_object-dp":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-dp.js","./_object-keys":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-keys.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-gopd.js":[function(require,module,exports){
var pIE            = require('./_object-pie')
  , createDesc     = require('./_property-desc')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , has            = require('./_has')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , gOPD           = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P){
  O = toIObject(O);
  P = toPrimitive(P, true);
  if(IE8_DOM_DEFINE)try {
    return gOPD(O, P);
  } catch(e){ /* empty */ }
  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
};
},{"./_descriptors":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_descriptors.js","./_has":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_has.js","./_ie8-dom-define":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_ie8-dom-define.js","./_object-pie":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-pie.js","./_property-desc":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_property-desc.js","./_to-iobject":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-iobject.js","./_to-primitive":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-primitive.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-gopn-ext.js":[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject')
  , gOPN      = require('./_object-gopn').f
  , toString  = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function(it){
  try {
    return gOPN(it);
  } catch(e){
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it){
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-gopn.js","./_to-iobject":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-iobject.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-gopn.js":[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys      = require('./_object-keys-internal')
  , hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
  return $keys(O, hiddenKeys);
};
},{"./_enum-bug-keys":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_enum-bug-keys.js","./_object-keys-internal":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-keys-internal.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-gops.js":[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-gpo.js":[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = require('./_has')
  , toObject    = require('./_to-object')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};
},{"./_has":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_has.js","./_shared-key":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_shared-key.js","./_to-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-object.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-keys-internal.js":[function(require,module,exports){
var has          = require('./_has')
  , toIObject    = require('./_to-iobject')
  , arrayIndexOf = require('./_array-includes')(false)
  , IE_PROTO     = require('./_shared-key')('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
},{"./_array-includes":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_array-includes.js","./_has":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_has.js","./_shared-key":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_shared-key.js","./_to-iobject":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-iobject.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-keys.js":[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = require('./_object-keys-internal')
  , enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"./_enum-bug-keys":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_enum-bug-keys.js","./_object-keys-internal":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-keys-internal.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-pie.js":[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-sap.js":[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export')
  , core    = require('./_core')
  , fails   = require('./_fails');
module.exports = function(KEY, exec){
  var fn  = (core.Object || {})[KEY] || Object[KEY]
    , exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
};
},{"./_core":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js","./_export":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_export.js","./_fails":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_fails.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_property-desc.js":[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_redefine-all.js":[function(require,module,exports){
var hide = require('./_hide');
module.exports = function(target, src, safe){
  for(var key in src){
    if(safe && target[key])target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};
},{"./_hide":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_hide.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_redefine.js":[function(require,module,exports){
module.exports = require('./_hide');
},{"./_hide":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_hide.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_set-proto.js":[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object')
  , anObject = require('./_an-object');
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
},{"./_an-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_an-object.js","./_ctx":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_ctx.js","./_is-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_is-object.js","./_object-gopd":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-gopd.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_set-species.js":[function(require,module,exports){
'use strict';
var global      = require('./_global')
  , core        = require('./_core')
  , dP          = require('./_object-dp')
  , DESCRIPTORS = require('./_descriptors')
  , SPECIES     = require('./_wks')('species');

module.exports = function(KEY){
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./_core":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js","./_descriptors":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_descriptors.js","./_global":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_global.js","./_object-dp":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-dp.js","./_wks":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_set-to-string-tag.js":[function(require,module,exports){
var def = require('./_object-dp').f
  , has = require('./_has')
  , TAG = require('./_wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./_has":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_has.js","./_object-dp":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-dp.js","./_wks":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_shared-key.js":[function(require,module,exports){
var shared = require('./_shared')('keys')
  , uid    = require('./_uid');
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"./_shared":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_shared.js","./_uid":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_uid.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_shared.js":[function(require,module,exports){
var global = require('./_global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./_global":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_global.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_species-constructor.js":[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject  = require('./_an-object')
  , aFunction = require('./_a-function')
  , SPECIES   = require('./_wks')('species');
module.exports = function(O, D){
  var C = anObject(O).constructor, S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};
},{"./_a-function":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_a-function.js","./_an-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_an-object.js","./_wks":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_string-at.js":[function(require,module,exports){
var toInteger = require('./_to-integer')
  , defined   = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./_defined":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_defined.js","./_to-integer":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-integer.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_task.js":[function(require,module,exports){
var ctx                = require('./_ctx')
  , invoke             = require('./_invoke')
  , html               = require('./_html')
  , cel                = require('./_dom-create')
  , global             = require('./_global')
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
var run = function(){
  var id = +this;
  if(queue.hasOwnProperty(id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function(event){
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!setTask || !clearTask){
  setTask = function setImmediate(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(require('./_cof')(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if(MessageChannel){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
    defer = function(id){
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./_cof":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_cof.js","./_ctx":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_ctx.js","./_dom-create":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_dom-create.js","./_global":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_global.js","./_html":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_html.js","./_invoke":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_invoke.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-index.js":[function(require,module,exports){
var toInteger = require('./_to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-integer.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-integer.js":[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-iobject.js":[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject')
  , defined = require('./_defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./_defined":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_defined.js","./_iobject":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iobject.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-length.js":[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./_to-integer":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-integer.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-object.js":[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./_defined":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_defined.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-primitive.js":[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"./_is-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_is-object.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_uid.js":[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks-define.js":[function(require,module,exports){
var global         = require('./_global')
  , core           = require('./_core')
  , LIBRARY        = require('./_library')
  , wksExt         = require('./_wks-ext')
  , defineProperty = require('./_object-dp').f;
module.exports = function(name){
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
};
},{"./_core":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js","./_global":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_global.js","./_library":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_library.js","./_object-dp":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-dp.js","./_wks-ext":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks-ext.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks-ext.js":[function(require,module,exports){
exports.f = require('./_wks');
},{"./_wks":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks.js":[function(require,module,exports){
var store      = require('./_shared')('wks')
  , uid        = require('./_uid')
  , Symbol     = require('./_global').Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
},{"./_global":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_global.js","./_shared":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_shared.js","./_uid":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_uid.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/core.get-iterator-method.js":[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./_classof":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_classof.js","./_core":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js","./_iterators":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iterators.js","./_wks":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/core.get-iterator.js":[function(require,module,exports){
var anObject = require('./_an-object')
  , get      = require('./core.get-iterator-method');
module.exports = require('./_core').getIterator = function(it){
  var iterFn = get(it);
  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};
},{"./_an-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_an-object.js","./_core":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js","./core.get-iterator-method":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/core.get-iterator-method.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.array.from.js":[function(require,module,exports){
'use strict';
var ctx            = require('./_ctx')
  , $export        = require('./_export')
  , toObject       = require('./_to-object')
  , call           = require('./_iter-call')
  , isArrayIter    = require('./_is-array-iter')
  , toLength       = require('./_to-length')
  , createProperty = require('./_create-property')
  , getIterFn      = require('./core.get-iterator-method');

$export($export.S + $export.F * !require('./_iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike)
      , C       = typeof this == 'function' ? this : Array
      , aLen    = arguments.length
      , mapfn   = aLen > 1 ? arguments[1] : undefined
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for(result = new C(length); length > index; index++){
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"./_create-property":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_create-property.js","./_ctx":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_ctx.js","./_export":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_export.js","./_is-array-iter":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_is-array-iter.js","./_iter-call":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-call.js","./_iter-detect":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-detect.js","./_to-length":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-length.js","./_to-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-object.js","./core.get-iterator-method":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/core.get-iterator-method.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.array.iterator.js":[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables')
  , step             = require('./_iter-step')
  , Iterators        = require('./_iterators')
  , toIObject        = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"./_add-to-unscopables":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_add-to-unscopables.js","./_iter-define":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-define.js","./_iter-step":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-step.js","./_iterators":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iterators.js","./_to-iobject":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-iobject.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.map.js":[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');

// 23.1 Map Objects
module.exports = require('./_collection')('Map', function(get){
  return function Map(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key){
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value){
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);
},{"./_collection":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_collection.js","./_collection-strong":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_collection-strong.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.object.assign.js":[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./_export');

$export($export.S + $export.F, 'Object', {assign: require('./_object-assign')});
},{"./_export":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_export.js","./_object-assign":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-assign.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.object.create.js":[function(require,module,exports){
var $export = require('./_export')
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', {create: require('./_object-create')});
},{"./_export":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_export.js","./_object-create":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-create.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.object.define-property.js":[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', {defineProperty: require('./_object-dp').f});
},{"./_descriptors":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_descriptors.js","./_export":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_export.js","./_object-dp":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-dp.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.object.get-prototype-of.js":[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject        = require('./_to-object')
  , $getPrototypeOf = require('./_object-gpo');

require('./_object-sap')('getPrototypeOf', function(){
  return function getPrototypeOf(it){
    return $getPrototypeOf(toObject(it));
  };
});
},{"./_object-gpo":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-gpo.js","./_object-sap":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-sap.js","./_to-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-object.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.object.keys.js":[function(require,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = require('./_to-object')
  , $keys    = require('./_object-keys');

require('./_object-sap')('keys', function(){
  return function keys(it){
    return $keys(toObject(it));
  };
});
},{"./_object-keys":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-keys.js","./_object-sap":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-sap.js","./_to-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-object.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.object.set-prototype-of.js":[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./_export');
$export($export.S, 'Object', {setPrototypeOf: require('./_set-proto').set});
},{"./_export":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_export.js","./_set-proto":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_set-proto.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.object.to-string.js":[function(require,module,exports){

},{}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.promise.js":[function(require,module,exports){
'use strict';
var LIBRARY            = require('./_library')
  , global             = require('./_global')
  , ctx                = require('./_ctx')
  , classof            = require('./_classof')
  , $export            = require('./_export')
  , isObject           = require('./_is-object')
  , aFunction          = require('./_a-function')
  , anInstance         = require('./_an-instance')
  , forOf              = require('./_for-of')
  , speciesConstructor = require('./_species-constructor')
  , task               = require('./_task').set
  , microtask          = require('./_microtask')()
  , PROMISE            = 'Promise'
  , TypeError          = global.TypeError
  , process            = global.process
  , $Promise           = global[PROMISE]
  , process            = global.process
  , isNode             = classof(process) == 'process'
  , empty              = function(){ /* empty */ }
  , Internal, GenericPromiseCapability, Wrapper;

var USE_NATIVE = !!function(){
  try {
    // correct subclassing with @@species support
    var promise     = $Promise.resolve(1)
      , FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function(exec){ exec(empty, empty); };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
  } catch(e){ /* empty */ }
}();

// helpers
var sameConstructor = function(a, b){
  // with library wrapper special case
  return a === b || a === $Promise && b === Wrapper;
};
var isThenable = function(it){
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var newPromiseCapability = function(C){
  return sameConstructor($Promise, C)
    ? new PromiseCapability(C)
    : new GenericPromiseCapability(C);
};
var PromiseCapability = GenericPromiseCapability = function(C){
  var resolve, reject;
  this.promise = new C(function($$resolve, $$reject){
    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject  = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject  = aFunction(reject);
};
var perform = function(exec){
  try {
    exec();
  } catch(e){
    return {error: e};
  }
};
var notify = function(promise, isReject){
  if(promise._n)return;
  promise._n = true;
  var chain = promise._c;
  microtask(function(){
    var value = promise._v
      , ok    = promise._s == 1
      , i     = 0;
    var run = function(reaction){
      var handler = ok ? reaction.ok : reaction.fail
        , resolve = reaction.resolve
        , reject  = reaction.reject
        , domain  = reaction.domain
        , result, then;
      try {
        if(handler){
          if(!ok){
            if(promise._h == 2)onHandleUnhandled(promise);
            promise._h = 1;
          }
          if(handler === true)result = value;
          else {
            if(domain)domain.enter();
            result = handler(value);
            if(domain)domain.exit();
          }
          if(result === reaction.promise){
            reject(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(result)){
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch(e){
        reject(e);
      }
    };
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if(isReject && !promise._h)onUnhandled(promise);
  });
};
var onUnhandled = function(promise){
  task.call(global, function(){
    var value = promise._v
      , abrupt, handler, console;
    if(isUnhandled(promise)){
      abrupt = perform(function(){
        if(isNode){
          process.emit('unhandledRejection', value, promise);
        } else if(handler = global.onunhandledrejection){
          handler({promise: promise, reason: value});
        } else if((console = global.console) && console.error){
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if(abrupt)throw abrupt.error;
  });
};
var isUnhandled = function(promise){
  if(promise._h == 1)return false;
  var chain = promise._a || promise._c
    , i     = 0
    , reaction;
  while(chain.length > i){
    reaction = chain[i++];
    if(reaction.fail || !isUnhandled(reaction.promise))return false;
  } return true;
};
var onHandleUnhandled = function(promise){
  task.call(global, function(){
    var handler;
    if(isNode){
      process.emit('rejectionHandled', promise);
    } else if(handler = global.onrejectionhandled){
      handler({promise: promise, reason: promise._v});
    }
  });
};
var $reject = function(value){
  var promise = this;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if(!promise._a)promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function(value){
  var promise = this
    , then;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if(promise === value)throw TypeError("Promise can't be resolved itself");
    if(then = isThenable(value)){
      microtask(function(){
        var wrapper = {_w: promise, _d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch(e){
    $reject.call({_w: promise, _d: false}, e); // wrap
  }
};

// constructor polyfill
if(!USE_NATIVE){
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor){
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch(err){
      $reject.call(this, err);
    }
  };
  Internal = function Promise(executor){
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = require('./_redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail   = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if(this._a)this._a.push(reaction);
      if(this._s)notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
  PromiseCapability = function(){
    var promise  = new Internal;
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject  = ctx($reject, promise, 1);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
require('./_set-to-string-tag')($Promise, PROMISE);
require('./_set-species')(PROMISE);
Wrapper = require('./_core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    var capability = newPromiseCapability(this)
      , $$reject   = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
    var capability = newPromiseCapability(this)
      , $$resolve  = capability.resolve;
    $$resolve(x);
    return capability.promise;
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function(iter){
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , resolve    = capability.resolve
      , reject     = capability.reject;
    var abrupt = perform(function(){
      var values    = []
        , index     = 0
        , remaining = 1;
      forOf(iterable, false, function(promise){
        var $index        = index++
          , alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function(value){
          if(alreadyCalled)return;
          alreadyCalled  = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , reject     = capability.reject;
    var abrupt = perform(function(){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  }
});
},{"./_a-function":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_a-function.js","./_an-instance":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_an-instance.js","./_classof":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_classof.js","./_core":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js","./_ctx":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_ctx.js","./_export":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_export.js","./_for-of":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_for-of.js","./_global":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_global.js","./_is-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_is-object.js","./_iter-detect":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-detect.js","./_library":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_library.js","./_microtask":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_microtask.js","./_redefine-all":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_redefine-all.js","./_set-species":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_set-species.js","./_set-to-string-tag":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_set-to-string-tag.js","./_species-constructor":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_species-constructor.js","./_task":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_task.js","./_wks":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.set.js":[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');

// 23.2 Set Objects
module.exports = require('./_collection')('Set', function(get){
  return function Set(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"./_collection":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_collection.js","./_collection-strong":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_collection-strong.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.string.iterator.js":[function(require,module,exports){
'use strict';
var $at  = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./_iter-define":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-define.js","./_string-at":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_string-at.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.symbol.js":[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global         = require('./_global')
  , has            = require('./_has')
  , DESCRIPTORS    = require('./_descriptors')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , META           = require('./_meta').KEY
  , $fails         = require('./_fails')
  , shared         = require('./_shared')
  , setToStringTag = require('./_set-to-string-tag')
  , uid            = require('./_uid')
  , wks            = require('./_wks')
  , wksExt         = require('./_wks-ext')
  , wksDefine      = require('./_wks-define')
  , keyOf          = require('./_keyof')
  , enumKeys       = require('./_enum-keys')
  , isArray        = require('./_is-array')
  , anObject       = require('./_an-object')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , createDesc     = require('./_property-desc')
  , _create        = require('./_object-create')
  , gOPNExt        = require('./_object-gopn-ext')
  , $GOPD          = require('./_object-gopd')
  , $DP            = require('./_object-dp')
  , $keys          = require('./_object-keys')
  , gOPD           = $GOPD.f
  , dP             = $DP.f
  , gOPN           = gOPNExt.f
  , $Symbol        = global.Symbol
  , $JSON          = global.JSON
  , _stringify     = $JSON && $JSON.stringify
  , PROTOTYPE      = 'prototype'
  , HIDDEN         = wks('_hidden')
  , TO_PRIMITIVE   = wks('toPrimitive')
  , isEnum         = {}.propertyIsEnumerable
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols     = shared('symbols')
  , OPSymbols      = shared('op-symbols')
  , ObjectProto    = Object[PROTOTYPE]
  , USE_NATIVE     = typeof $Symbol == 'function'
  , QObject        = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function(){
  return _create(dP({}, 'a', {
    get: function(){ return dP(this, 'a', {value: 7}).a; }
  })).a != 7;
}) ? function(it, key, D){
  var protoDesc = gOPD(ObjectProto, key);
  if(protoDesc)delete ObjectProto[key];
  dP(it, key, D);
  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function(tag){
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
  return typeof it == 'symbol';
} : function(it){
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D){
  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if(has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = _create(D, {enumerable: createDesc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P){
  anObject(it);
  var keys = enumKeys(P = toIObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P){
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key){
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
  it  = toIObject(it);
  key = toPrimitive(key, true);
  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
  var D = gOPD(it, key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it){
  var names  = gOPN(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
  var IS_OP  = it === ObjectProto
    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if(!USE_NATIVE){
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function(value){
      if(this === ObjectProto)$set.call(OPSymbols, value);
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f   = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f  = $propertyIsEnumerable;
  require('./_object-gops').f = $getOwnPropertySymbols;

  if(DESCRIPTORS && !require('./_library')){
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function(name){
    return wrap(wks(name));
  }
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

for(var symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);

for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    if(isSymbol(key))return keyOf(SymbolRegistry, key);
    throw TypeError(key + ' is not a symbol!');
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it){
    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
    var args = [it]
      , i    = 1
      , replacer, $replacer;
    while(arguments.length > i)args.push(arguments[i++]);
    replacer = args[1];
    if(typeof replacer == 'function')$replacer = replacer;
    if($replacer || !isArray(replacer))replacer = function(key, value){
      if($replacer)value = $replacer.call(this, key, value);
      if(!isSymbol(value))return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);
},{"./_an-object":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_an-object.js","./_descriptors":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_descriptors.js","./_enum-keys":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_enum-keys.js","./_export":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_export.js","./_fails":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_fails.js","./_global":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_global.js","./_has":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_has.js","./_hide":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_hide.js","./_is-array":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_is-array.js","./_keyof":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_keyof.js","./_library":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_library.js","./_meta":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_meta.js","./_object-create":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-create.js","./_object-dp":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-dp.js","./_object-gopd":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-gopd.js","./_object-gopn":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-gopn.js","./_object-gopn-ext":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-gopn-ext.js","./_object-gops":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-gops.js","./_object-keys":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-keys.js","./_object-pie":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-pie.js","./_property-desc":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_property-desc.js","./_redefine":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_redefine.js","./_set-to-string-tag":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_set-to-string-tag.js","./_shared":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_shared.js","./_to-iobject":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-iobject.js","./_to-primitive":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-primitive.js","./_uid":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_uid.js","./_wks":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks.js","./_wks-define":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks-define.js","./_wks-ext":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks-ext.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es7.map.to-json.js":[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = require('./_export');

$export($export.P + $export.R, 'Map', {toJSON: require('./_collection-to-json')('Map')});
},{"./_collection-to-json":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_collection-to-json.js","./_export":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_export.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es7.set.to-json.js":[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = require('./_export');

$export($export.P + $export.R, 'Set', {toJSON: require('./_collection-to-json')('Set')});
},{"./_collection-to-json":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_collection-to-json.js","./_export":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_export.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es7.symbol.async-iterator.js":[function(require,module,exports){
require('./_wks-define')('asyncIterator');
},{"./_wks-define":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks-define.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es7.symbol.observable.js":[function(require,module,exports){
require('./_wks-define')('observable');
},{"./_wks-define":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks-define.js"}],"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/web.dom.iterable.js":[function(require,module,exports){
require('./es6.array.iterator');
var global        = require('./_global')
  , hide          = require('./_hide')
  , Iterators     = require('./_iterators')
  , TO_STRING_TAG = require('./_wks')('toStringTag');

for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
  var NAME       = collections[i]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype;
  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}
},{"./_global":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_global.js","./_hide":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_hide.js","./_iterators":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iterators.js","./_wks":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks.js","./es6.array.iterator":"/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.array.iterator.js"}],"/Users/ibc/src/mediasoup-client/node_modules/debug/src/browser.js":[function(require,module,exports){
(function (process){
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))

},{"./debug":"/Users/ibc/src/mediasoup-client/node_modules/debug/src/debug.js","_process":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/process/browser.js"}],"/Users/ibc/src/mediasoup-client/node_modules/debug/src/debug.js":[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":"/Users/ibc/src/mediasoup-client/node_modules/ms/index.js"}],"/Users/ibc/src/mediasoup-client/node_modules/ms/index.js":[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],"/Users/ibc/src/mediasoup-client/node_modules/random-number/index.js":[function(require,module,exports){
void function(root){

  function defaults(options){
    var options = options || {}
    var min = options.min
    var max = options.max
    var integer = options.integer || false
    if ( min == null && max == null ) {
      min = 0
      max = 1
    } else if ( min == null ) {
      min = max - 1
    } else if ( max == null ) {
      max = min + 1
    }
    if ( max < min ) throw new Error('invalid options, max must be >= min')
    return {
      min:     min
    , max:     max
    , integer: integer
    }
  }

  function random(options){
    options = defaults(options)
    if ( options.max === options.min ) return options.min
    var r = Math.random() * (options.max - options.min + Number(!!options.integer)) + options.min
    return options.integer ? Math.floor(r) : r
  }

  function generator(options){
    options = defaults(options)
    return function(min, max, integer){
      options.min     = min != null ? min : options.min
      options.max     = max != null ? max : options.max
      options.integer = integer != null ? integer : options.integer
      return random(options)
    }
  }

  module.exports =  random
  module.exports.generator = generator
  module.exports.defaults = defaults
}(this)

},{}],"/Users/ibc/src/mediasoup-client/node_modules/sdp-transform/lib/grammar.js":[function(require,module,exports){
var grammar = module.exports = {
  v: [{
    name: 'version',
    reg: /^(\d*)$/
  }],
  o: [{ //o=- 20518 0 IN IP4 203.0.113.1
    // NB: sessionId will be a String in most cases because it is huge
    name: 'origin',
    reg: /^(\S*) (\d*) (\d*) (\S*) IP(\d) (\S*)/,
    names: ['username', 'sessionId', 'sessionVersion', 'netType', 'ipVer', 'address'],
    format: '%s %s %d %s IP%d %s'
  }],
  // default parsing of these only (though some of these feel outdated)
  s: [{ name: 'name' }],
  i: [{ name: 'description' }],
  u: [{ name: 'uri' }],
  e: [{ name: 'email' }],
  p: [{ name: 'phone' }],
  z: [{ name: 'timezones' }], // TODO: this one can actually be parsed properly..
  r: [{ name: 'repeats' }],   // TODO: this one can also be parsed properly
  //k: [{}], // outdated thing ignored
  t: [{ //t=0 0
    name: 'timing',
    reg: /^(\d*) (\d*)/,
    names: ['start', 'stop'],
    format: '%d %d'
  }],
  c: [{ //c=IN IP4 10.47.197.26
    name: 'connection',
    reg: /^IN IP(\d) (\S*)/,
    names: ['version', 'ip'],
    format: 'IN IP%d %s'
  }],
  b: [{ //b=AS:4000
    push: 'bandwidth',
    reg: /^(TIAS|AS|CT|RR|RS):(\d*)/,
    names: ['type', 'limit'],
    format: '%s:%s'
  }],
  m: [{ //m=video 51744 RTP/AVP 126 97 98 34 31
    // NB: special - pushes to session
    // TODO: rtp/fmtp should be filtered by the payloads found here?
    reg: /^(\w*) (\d*) ([\w\/]*)(?: (.*))?/,
    names: ['type', 'port', 'protocol', 'payloads'],
    format: '%s %d %s %s'
  }],
  a: [
    { //a=rtpmap:110 opus/48000/2
      push: 'rtp',
      reg: /^rtpmap:(\d*) ([\w\-\.]*)(?:\s*\/(\d*)(?:\s*\/(\S*))?)?/,
      names: ['payload', 'codec', 'rate', 'encoding'],
      format: function (o) {
        return (o.encoding) ?
          'rtpmap:%d %s/%s/%s':
          o.rate ?
          'rtpmap:%d %s/%s':
          'rtpmap:%d %s';
      }
    },
    { //a=fmtp:108 profile-level-id=24;object=23;bitrate=64000
      //a=fmtp:111 minptime=10; useinbandfec=1
      push: 'fmtp',
      reg: /^fmtp:(\d*) ([\S| ]*)/,
      names: ['payload', 'config'],
      format: 'fmtp:%d %s'
    },
    { //a=control:streamid=0
      name: 'control',
      reg: /^control:(.*)/,
      format: 'control:%s'
    },
    { //a=rtcp:65179 IN IP4 193.84.77.194
      name: 'rtcp',
      reg: /^rtcp:(\d*)(?: (\S*) IP(\d) (\S*))?/,
      names: ['port', 'netType', 'ipVer', 'address'],
      format: function (o) {
        return (o.address != null) ?
          'rtcp:%d %s IP%d %s':
          'rtcp:%d';
      }
    },
    { //a=rtcp-fb:98 trr-int 100
      push: 'rtcpFbTrrInt',
      reg: /^rtcp-fb:(\*|\d*) trr-int (\d*)/,
      names: ['payload', 'value'],
      format: 'rtcp-fb:%d trr-int %d'
    },
    { //a=rtcp-fb:98 nack rpsi
      push: 'rtcpFb',
      reg: /^rtcp-fb:(\*|\d*) ([\w-_]*)(?: ([\w-_]*))?/,
      names: ['payload', 'type', 'subtype'],
      format: function (o) {
        return (o.subtype != null) ?
          'rtcp-fb:%s %s %s':
          'rtcp-fb:%s %s';
      }
    },
    { //a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
      //a=extmap:1/recvonly URI-gps-string
      push: 'ext',
      reg: /^extmap:(\d+)(?:\/(\w+))? (\S*)(?: (\S*))?/,
      names: ['value', 'direction', 'uri', 'config'],
      format: function (o) {
        return 'extmap:%d' + (o.direction ? '/%s' : '%v') + ' %s' + (o.config ? ' %s' : '');
      }
    },
    { //a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:PS1uQCVeeCFCanVmcjkpPywjNWhcYD0mXXtxaVBR|2^20|1:32
      push: 'crypto',
      reg: /^crypto:(\d*) ([\w_]*) (\S*)(?: (\S*))?/,
      names: ['id', 'suite', 'config', 'sessionConfig'],
      format: function (o) {
        return (o.sessionConfig != null) ?
          'crypto:%d %s %s %s':
          'crypto:%d %s %s';
      }
    },
    { //a=setup:actpass
      name: 'setup',
      reg: /^setup:(\w*)/,
      format: 'setup:%s'
    },
    { //a=mid:1
      name: 'mid',
      reg: /^mid:([^\s]*)/,
      format: 'mid:%s'
    },
    { //a=msid:0c8b064d-d807-43b4-b434-f92a889d8587 98178685-d409-46e0-8e16-7ef0db0db64a
      name: 'msid',
      reg: /^msid:(.*)/,
      format: 'msid:%s'
    },
    { //a=ptime:20
      name: 'ptime',
      reg: /^ptime:(\d*)/,
      format: 'ptime:%d'
    },
    { //a=maxptime:60
      name: 'maxptime',
      reg: /^maxptime:(\d*)/,
      format: 'maxptime:%d'
    },
    { //a=sendrecv
      name: 'direction',
      reg: /^(sendrecv|recvonly|sendonly|inactive)/
    },
    { //a=ice-lite
      name: 'icelite',
      reg: /^(ice-lite)/
    },
    { //a=ice-ufrag:F7gI
      name: 'iceUfrag',
      reg: /^ice-ufrag:(\S*)/,
      format: 'ice-ufrag:%s'
    },
    { //a=ice-pwd:x9cml/YzichV2+XlhiMu8g
      name: 'icePwd',
      reg: /^ice-pwd:(\S*)/,
      format: 'ice-pwd:%s'
    },
    { //a=fingerprint:SHA-1 00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33
      name: 'fingerprint',
      reg: /^fingerprint:(\S*) (\S*)/,
      names: ['type', 'hash'],
      format: 'fingerprint:%s %s'
    },
    { //a=candidate:0 1 UDP 2113667327 203.0.113.1 54400 typ host
      //a=candidate:1162875081 1 udp 2113937151 192.168.34.75 60017 typ host generation 0 network-id 3 network-cost 10
      //a=candidate:3289912957 2 udp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 generation 0 network-id 3 network-cost 10
      //a=candidate:229815620 1 tcp 1518280447 192.168.150.19 60017 typ host tcptype active generation 0 network-id 3 network-cost 10
      //a=candidate:3289912957 2 tcp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 tcptype passive generation 0 network-id 3 network-cost 10
      push:'candidates',
      reg: /^candidate:(\S*) (\d*) (\S*) (\d*) (\S*) (\d*) typ (\S*)(?: raddr (\S*) rport (\d*))?(?: tcptype (\S*))?(?: generation (\d*))?(?: network-id (\d*))?(?: network-cost (\d*))?/,
      names: ['foundation', 'component', 'transport', 'priority', 'ip', 'port', 'type', 'raddr', 'rport', 'tcptype', 'generation', 'network-id', 'network-cost'],
      format: function (o) {
        var str = 'candidate:%s %d %s %d %s %d typ %s';

        str += (o.raddr != null) ? ' raddr %s rport %d' : '%v%v';

        // NB: candidate has three optional chunks, so %void middles one if it's missing
        str += (o.tcptype != null) ? ' tcptype %s' : '%v';

        if (o.generation != null) {
          str += ' generation %d';
        }

        str += (o['network-id'] != null) ? ' network-id %d' : '%v';
        str += (o['network-cost'] != null) ? ' network-cost %d' : '%v';
        return str;
      }
    },
    { //a=end-of-candidates (keep after the candidates line for readability)
      name: 'endOfCandidates',
      reg: /^(end-of-candidates)/
    },
    { //a=remote-candidates:1 203.0.113.1 54400 2 203.0.113.1 54401 ...
      name: 'remoteCandidates',
      reg: /^remote-candidates:(.*)/,
      format: 'remote-candidates:%s'
    },
    { //a=ice-options:google-ice
      name: 'iceOptions',
      reg: /^ice-options:(\S*)/,
      format: 'ice-options:%s'
    },
    { //a=ssrc:2566107569 cname:t9YU8M1UxTF8Y1A1
      push: 'ssrcs',
      reg: /^ssrc:(\d*) ([\w_]*)(?::(.*))?/,
      names: ['id', 'attribute', 'value'],
      format: function (o) {
        var str = 'ssrc:%d';
        if (o.attribute != null) {
          str += ' %s';
          if (o.value != null) {
            str += ':%s';
          }
        }
        return str;
      }
    },
    { //a=ssrc-group:FEC 1 2
      //a=ssrc-group:FEC-FR 3004364195 1080772241
      push: 'ssrcGroups',
      // token-char = %x21 / %x23-27 / %x2A-2B / %x2D-2E / %x30-39 / %x41-5A / %x5E-7E
      reg: /^ssrc-group:([\x21\x23\x24\x25\x26\x27\x2A\x2B\x2D\x2E\w]*) (.*)/,
      names: ['semantics', 'ssrcs'],
      format: 'ssrc-group:%s %s'
    },
    { //a=msid-semantic: WMS Jvlam5X3SX1OP6pn20zWogvaKJz5Hjf9OnlV
      name: 'msidSemantic',
      reg: /^msid-semantic:\s?(\w*) (\S*)/,
      names: ['semantic', 'token'],
      format: 'msid-semantic: %s %s' // space after ':' is not accidental
    },
    { //a=group:BUNDLE audio video
      push: 'groups',
      reg: /^group:(\w*) (.*)/,
      names: ['type', 'mids'],
      format: 'group:%s %s'
    },
    { //a=rtcp-mux
      name: 'rtcpMux',
      reg: /^(rtcp-mux)/
    },
    { //a=rtcp-rsize
      name: 'rtcpRsize',
      reg: /^(rtcp-rsize)/
    },
    { //a=sctpmap:5000 webrtc-datachannel 1024
      name: 'sctpmap',
      reg: /^sctpmap:([\w_\/]*) (\S*)(?: (\S*))?/,
      names: ['sctpmapNumber', 'app', 'maxMessageSize'],
      format: function (o) {
        return (o.maxMessageSize != null) ?
          'sctpmap:%s %s %s' :
          'sctpmap:%s %s';
      }
    },
    { //a=x-google-flag:conference
      name: 'xGoogleFlag',
      reg: /^x-google-flag:([^\s]*)/,
      format: 'x-google-flag:%s'
    },
    { //a=rid:1 send max-width=1280;max-height=720;max-fps=30;depend=0
      push: 'rids',
      reg: /^rid:([\d\w]+) (\w+)(?: ([\S| ]*))?/,
      names: ['id', 'direction', 'params'],
      format: function (o) {
        return (o.params) ? 'rid:%s %s %s' : 'rid:%s %s';
      }
    },
    { //a=imageattr:97 send [x=800,y=640,sar=1.1,q=0.6] [x=480,y=320] recv [x=330,y=250]
      //a=imageattr:* send [x=800,y=640] recv *
      //a=imageattr:100 recv [x=320,y=240]
      push: 'imageattrs',
      reg: new RegExp(
        //a=imageattr:97
        '^imageattr:(\\d+|\\*)' +
        //send [x=800,y=640,sar=1.1,q=0.6] [x=480,y=320]
        '[\\s\\t]+(send|recv)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*)' +
        //recv [x=330,y=250]
        '(?:[\\s\\t]+(recv|send)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*))?'
      ),
      names: ['pt', 'dir1', 'attrs1', 'dir2', 'attrs2'],
      format: function (o) {
        return 'imageattr:%s %s %s' + (o.dir2 ? ' %s %s' : '');
      }
    },
    { //a=simulcast:send 1,2,3;~4,~5 recv 6;~7,~8
      //a=simulcast:recv 1;4,5 send 6;7
      name: 'simulcast',
      reg: new RegExp(
        //a=simulcast:
        '^simulcast:' +
        //send 1,2,3;~4,~5
        '(send|recv) ([a-zA-Z0-9\\-_~;,]+)' +
        //space + recv 6;~7,~8
        '(?:\\s?(send|recv) ([a-zA-Z0-9\\-_~;,]+))?' +
        //end
        '$'
      ),
      names: ['dir1', 'list1', 'dir2', 'list2'],
      format: function (o) {
        return 'simulcast:%s %s' + (o.dir2 ? ' %s %s' : '');
      }
    },
    { //Old simulcast draft 03 (implemented by Firefox)
      //  https://tools.ietf.org/html/draft-ietf-mmusic-sdp-simulcast-03
      //a=simulcast: recv pt=97;98 send pt=97
      //a=simulcast: send rid=5;6;7 paused=6,7
      name: 'simulcast_03',
      reg: /^simulcast:[\s\t]+([\S+\s\t]+)$/,
      names: ['value'],
      format: 'simulcast: %s'
    },
    {
      //a=framerate:25
      //a=framerate:29.97
      name: 'framerate',
      reg: /^framerate:(\d+(?:$|\.\d+))/,
      format: 'framerate:%s'
    },
    { // any a= that we don't understand is kepts verbatim on media.invalid
      push: 'invalid',
      names: ['value']
    }
  ]
};

// set sensible defaults to avoid polluting the grammar with boring details
Object.keys(grammar).forEach(function (key) {
  var objs = grammar[key];
  objs.forEach(function (obj) {
    if (!obj.reg) {
      obj.reg = /(.*)/;
    }
    if (!obj.format) {
      obj.format = '%s';
    }
  });
});

},{}],"/Users/ibc/src/mediasoup-client/node_modules/sdp-transform/lib/index.js":[function(require,module,exports){
var parser = require('./parser');
var writer = require('./writer');

exports.write = writer;
exports.parse = parser.parse;
exports.parseFmtpConfig = parser.parseFmtpConfig;
exports.parseParams = parser.parseParams;
exports.parsePayloads = parser.parsePayloads;
exports.parseRemoteCandidates = parser.parseRemoteCandidates;
exports.parseImageAttributes = parser.parseImageAttributes;
exports.parseSimulcastStreamList = parser.parseSimulcastStreamList;

},{"./parser":"/Users/ibc/src/mediasoup-client/node_modules/sdp-transform/lib/parser.js","./writer":"/Users/ibc/src/mediasoup-client/node_modules/sdp-transform/lib/writer.js"}],"/Users/ibc/src/mediasoup-client/node_modules/sdp-transform/lib/parser.js":[function(require,module,exports){
var toIntIfInt = function (v) {
  return String(Number(v)) === v ? Number(v) : v;
};

var attachProperties = function (match, location, names, rawName) {
  if (rawName && !names) {
    location[rawName] = toIntIfInt(match[1]);
  }
  else {
    for (var i = 0; i < names.length; i += 1) {
      if (match[i+1] != null) {
        location[names[i]] = toIntIfInt(match[i+1]);
      }
    }
  }
};

var parseReg = function (obj, location, content) {
  var needsBlank = obj.name && obj.names;
  if (obj.push && !location[obj.push]) {
    location[obj.push] = [];
  }
  else if (needsBlank && !location[obj.name]) {
    location[obj.name] = {};
  }
  var keyLocation = obj.push ?
    {} :  // blank object that will be pushed
    needsBlank ? location[obj.name] : location; // otherwise, named location or root

  attachProperties(content.match(obj.reg), keyLocation, obj.names, obj.name);

  if (obj.push) {
    location[obj.push].push(keyLocation);
  }
};

var grammar = require('./grammar');
var validLine = RegExp.prototype.test.bind(/^([a-z])=(.*)/);

exports.parse = function (sdp) {
  var session = {}
    , media = []
    , location = session; // points at where properties go under (one of the above)

  // parse lines we understand
  sdp.split(/(\r\n|\r|\n)/).filter(validLine).forEach(function (l) {
    var type = l[0];
    var content = l.slice(2);
    if (type === 'm') {
      media.push({rtp: [], fmtp: []});
      location = media[media.length-1]; // point at latest media line
    }

    for (var j = 0; j < (grammar[type] || []).length; j += 1) {
      var obj = grammar[type][j];
      if (obj.reg.test(content)) {
        return parseReg(obj, location, content);
      }
    }
  });

  session.media = media; // link it up
  return session;
};

var paramReducer = function (acc, expr) {
  var s = expr.split(/=(.+)/, 2);
  if (s.length === 2) {
    acc[s[0]] = toIntIfInt(s[1]);
  }
  return acc;
};

exports.parseParams = function (str) {
  return str.split(/\;\s?/).reduce(paramReducer, {});
};

// For backward compatibility - alias will be removed in 3.0.0
exports.parseFmtpConfig = exports.parseParams;

exports.parsePayloads = function (str) {
  return str.split(' ').map(Number);
};

exports.parseRemoteCandidates = function (str) {
  var candidates = [];
  var parts = str.split(' ').map(toIntIfInt);
  for (var i = 0; i < parts.length; i += 3) {
    candidates.push({
      component: parts[i],
      ip: parts[i + 1],
      port: parts[i + 2]
    });
  }
  return candidates;
};

exports.parseImageAttributes = function (str) {
  return str.split(' ').map(function (item) {
    return item.substring(1, item.length-1).split(',').reduce(paramReducer, {});
  });
};

exports.parseSimulcastStreamList = function (str) {
  return str.split(';').map(function (stream) {
    return stream.split(',').map(function (format) {
      var scid, paused = false;

      if (format[0] !== '~') {
        scid = toIntIfInt(format);
      } else {
        scid = toIntIfInt(format.substring(1, format.length));
        paused = true;
      }

      return {
        scid: scid,
        paused: paused
      };
    });
  });
};

},{"./grammar":"/Users/ibc/src/mediasoup-client/node_modules/sdp-transform/lib/grammar.js"}],"/Users/ibc/src/mediasoup-client/node_modules/sdp-transform/lib/writer.js":[function(require,module,exports){
var grammar = require('./grammar');

// customized util.format - discards excess arguments and can void middle ones
var formatRegExp = /%[sdv%]/g;
var format = function (formatStr) {
  var i = 1;
  var args = arguments;
  var len = args.length;
  return formatStr.replace(formatRegExp, function (x) {
    if (i >= len) {
      return x; // missing argument
    }
    var arg = args[i];
    i += 1;
    switch (x) {
    case '%%':
      return '%';
    case '%s':
      return String(arg);
    case '%d':
      return Number(arg);
    case '%v':
      return '';
    }
  });
  // NB: we discard excess arguments - they are typically undefined from makeLine
};

var makeLine = function (type, obj, location) {
  var str = obj.format instanceof Function ?
    (obj.format(obj.push ? location : location[obj.name])) :
    obj.format;

  var args = [type + '=' + str];
  if (obj.names) {
    for (var i = 0; i < obj.names.length; i += 1) {
      var n = obj.names[i];
      if (obj.name) {
        args.push(location[obj.name][n]);
      }
      else { // for mLine and push attributes
        args.push(location[obj.names[i]]);
      }
    }
  }
  else {
    args.push(location[obj.name]);
  }
  return format.apply(null, args);
};

// RFC specified order
// TODO: extend this with all the rest
var defaultOuterOrder = [
  'v', 'o', 's', 'i',
  'u', 'e', 'p', 'c',
  'b', 't', 'r', 'z', 'a'
];
var defaultInnerOrder = ['i', 'c', 'b', 'a'];


module.exports = function (session, opts) {
  opts = opts || {};
  // ensure certain properties exist
  if (session.version == null) {
    session.version = 0; // 'v=0' must be there (only defined version atm)
  }
  if (session.name == null) {
    session.name = ' '; // 's= ' must be there if no meaningful name set
  }
  session.media.forEach(function (mLine) {
    if (mLine.payloads == null) {
      mLine.payloads = '';
    }
  });

  var outerOrder = opts.outerOrder || defaultOuterOrder;
  var innerOrder = opts.innerOrder || defaultInnerOrder;
  var sdp = [];

  // loop through outerOrder for matching properties on session
  outerOrder.forEach(function (type) {
    grammar[type].forEach(function (obj) {
      if (obj.name in session && session[obj.name] != null) {
        sdp.push(makeLine(type, obj, session));
      }
      else if (obj.push in session && session[obj.push] != null) {
        session[obj.push].forEach(function (el) {
          sdp.push(makeLine(type, obj, el));
        });
      }
    });
  });

  // then for each media line, follow the innerOrder
  session.media.forEach(function (mLine) {
    sdp.push(makeLine('m', grammar.m[0], mLine));

    innerOrder.forEach(function (type) {
      grammar[type].forEach(function (obj) {
        if (obj.name in mLine && mLine[obj.name] != null) {
          sdp.push(makeLine(type, obj, mLine));
        }
        else if (obj.push in mLine && mLine[obj.push] != null) {
          mLine[obj.push].forEach(function (el) {
            sdp.push(makeLine(type, obj, el));
          });
        }
      });
    });
  });

  return sdp.join('\r\n') + '\r\n';
};

},{"./grammar":"/Users/ibc/src/mediasoup-client/node_modules/sdp-transform/lib/grammar.js"}],"/Users/ibc/src/mediasoup-demo-2/app/lib/Logger.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var APP_NAME = 'mediasoup-demo';

var Logger = function () {
	function Logger(prefix) {
		(0, _classCallCheck3.default)(this, Logger);

		if (prefix) {
			this._debug = (0, _debug2.default)(APP_NAME + ':' + prefix);
			this._warn = (0, _debug2.default)(APP_NAME + ':WARN:' + prefix);
			this._error = (0, _debug2.default)(APP_NAME + ':ERROR:' + prefix);
		} else {
			this._debug = (0, _debug2.default)(APP_NAME);
			this._warn = (0, _debug2.default)(APP_NAME + ':WARN');
			this._error = (0, _debug2.default)(APP_NAME + ':ERROR');
		}

		/* eslint-disable no-console */
		this._debug.log = console.info.bind(console);
		this._warn.log = console.warn.bind(console);
		this._error.log = console.error.bind(console);
		/* eslint-enable no-console */
	}

	(0, _createClass3.default)(Logger, [{
		key: 'debug',
		get: function get() {
			return this._debug;
		}
	}, {
		key: 'warn',
		get: function get() {
			return this._warn;
		}
	}, {
		key: 'error',
		get: function get() {
			return this._error;
		}
	}]);
	return Logger;
}();

exports.default = Logger;

},{"babel-runtime/helpers/classCallCheck":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/babel-runtime/helpers/classCallCheck.js","babel-runtime/helpers/createClass":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/babel-runtime/helpers/createClass.js","debug":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/debug/src/browser.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/babel-runtime/core-js/get-iterator.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/get-iterator.js"][0].apply(exports,arguments)
},{"core-js/library/fn/get-iterator":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/fn/get-iterator.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/babel-runtime/core-js/object/define-property.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/object/define-property.js"][0].apply(exports,arguments)
},{"core-js/library/fn/object/define-property":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/fn/object/define-property.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/babel-runtime/core-js/promise.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/core-js/promise.js"][0].apply(exports,arguments)
},{"core-js/library/fn/promise":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/fn/promise.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/babel-runtime/helpers/classCallCheck.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/classCallCheck.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/babel-runtime/helpers/createClass.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/babel-runtime/helpers/createClass.js"][0].apply(exports,arguments)
},{"../core-js/object/define-property":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/babel-runtime/core-js/object/define-property.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/fn/get-iterator.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/get-iterator.js"][0].apply(exports,arguments)
},{"../modules/core.get-iterator":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/core.get-iterator.js","../modules/es6.string.iterator":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/es6.string.iterator.js","../modules/web.dom.iterable":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/web.dom.iterable.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/fn/object/define-property.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/object/define-property.js"][0].apply(exports,arguments)
},{"../../modules/_core":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_core.js","../../modules/es6.object.define-property":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/es6.object.define-property.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/fn/promise.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/fn/promise.js"][0].apply(exports,arguments)
},{"../modules/_core":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_core.js","../modules/es6.object.to-string":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/es6.object.to-string.js","../modules/es6.promise":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/es6.promise.js","../modules/es6.string.iterator":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/es6.string.iterator.js","../modules/web.dom.iterable":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/web.dom.iterable.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_a-function.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_a-function.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_add-to-unscopables.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_add-to-unscopables.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_an-instance.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_an-instance.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_an-object.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_an-object.js"][0].apply(exports,arguments)
},{"./_is-object":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_is-object.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_array-includes.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_array-includes.js"][0].apply(exports,arguments)
},{"./_to-index":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_to-index.js","./_to-iobject":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_to-iobject.js","./_to-length":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_to-length.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_classof.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_classof.js"][0].apply(exports,arguments)
},{"./_cof":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_cof.js","./_wks":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_cof.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_cof.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_core.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_core.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_ctx.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_ctx.js"][0].apply(exports,arguments)
},{"./_a-function":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_a-function.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_defined.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_defined.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_descriptors.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_descriptors.js"][0].apply(exports,arguments)
},{"./_fails":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_fails.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_dom-create.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_dom-create.js"][0].apply(exports,arguments)
},{"./_global":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_global.js","./_is-object":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_is-object.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_enum-bug-keys.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_enum-bug-keys.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_export.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_export.js"][0].apply(exports,arguments)
},{"./_core":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_core.js","./_ctx":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_ctx.js","./_global":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_global.js","./_hide":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_hide.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_fails.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_fails.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_for-of.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_for-of.js"][0].apply(exports,arguments)
},{"./_an-object":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_an-object.js","./_ctx":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_ctx.js","./_is-array-iter":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_is-array-iter.js","./_iter-call":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_iter-call.js","./_to-length":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_to-length.js","./core.get-iterator-method":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/core.get-iterator-method.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_global.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_global.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_has.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_has.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_hide.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_hide.js"][0].apply(exports,arguments)
},{"./_descriptors":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_descriptors.js","./_object-dp":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_object-dp.js","./_property-desc":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_property-desc.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_html.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_html.js"][0].apply(exports,arguments)
},{"./_global":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_global.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_ie8-dom-define.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_ie8-dom-define.js"][0].apply(exports,arguments)
},{"./_descriptors":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_descriptors.js","./_dom-create":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_dom-create.js","./_fails":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_fails.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_invoke.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_invoke.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_iobject.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iobject.js"][0].apply(exports,arguments)
},{"./_cof":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_cof.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_is-array-iter.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_is-array-iter.js"][0].apply(exports,arguments)
},{"./_iterators":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_iterators.js","./_wks":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_is-object.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_is-object.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_iter-call.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-call.js"][0].apply(exports,arguments)
},{"./_an-object":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_an-object.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_iter-create.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-create.js"][0].apply(exports,arguments)
},{"./_hide":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_hide.js","./_object-create":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_object-create.js","./_property-desc":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_property-desc.js","./_set-to-string-tag":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_set-to-string-tag.js","./_wks":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_iter-define.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-define.js"][0].apply(exports,arguments)
},{"./_export":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_export.js","./_has":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_has.js","./_hide":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_hide.js","./_iter-create":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_iter-create.js","./_iterators":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_iterators.js","./_library":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_library.js","./_object-gpo":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_object-gpo.js","./_redefine":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_redefine.js","./_set-to-string-tag":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_set-to-string-tag.js","./_wks":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_iter-detect.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-detect.js"][0].apply(exports,arguments)
},{"./_wks":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_iter-step.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iter-step.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_iterators.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_iterators.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_library.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_library.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_microtask.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_microtask.js"][0].apply(exports,arguments)
},{"./_cof":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_cof.js","./_global":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_global.js","./_task":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_task.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_object-create.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-create.js"][0].apply(exports,arguments)
},{"./_an-object":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_an-object.js","./_dom-create":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_dom-create.js","./_enum-bug-keys":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_enum-bug-keys.js","./_html":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_html.js","./_object-dps":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_object-dps.js","./_shared-key":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_shared-key.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_object-dp.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-dp.js"][0].apply(exports,arguments)
},{"./_an-object":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_an-object.js","./_descriptors":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_descriptors.js","./_ie8-dom-define":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_ie8-dom-define.js","./_to-primitive":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_to-primitive.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_object-dps.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-dps.js"][0].apply(exports,arguments)
},{"./_an-object":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_an-object.js","./_descriptors":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_descriptors.js","./_object-dp":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_object-dp.js","./_object-keys":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_object-keys.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_object-gpo.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-gpo.js"][0].apply(exports,arguments)
},{"./_has":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_has.js","./_shared-key":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_shared-key.js","./_to-object":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_to-object.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_object-keys-internal.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-keys-internal.js"][0].apply(exports,arguments)
},{"./_array-includes":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_array-includes.js","./_has":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_has.js","./_shared-key":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_shared-key.js","./_to-iobject":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_to-iobject.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_object-keys.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_object-keys.js"][0].apply(exports,arguments)
},{"./_enum-bug-keys":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_enum-bug-keys.js","./_object-keys-internal":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_object-keys-internal.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_property-desc.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_property-desc.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_redefine-all.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_redefine-all.js"][0].apply(exports,arguments)
},{"./_hide":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_hide.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_redefine.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_redefine.js"][0].apply(exports,arguments)
},{"./_hide":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_hide.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_set-species.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_set-species.js"][0].apply(exports,arguments)
},{"./_core":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_core.js","./_descriptors":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_descriptors.js","./_global":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_global.js","./_object-dp":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_object-dp.js","./_wks":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_set-to-string-tag.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_set-to-string-tag.js"][0].apply(exports,arguments)
},{"./_has":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_has.js","./_object-dp":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_object-dp.js","./_wks":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_shared-key.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_shared-key.js"][0].apply(exports,arguments)
},{"./_shared":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_shared.js","./_uid":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_uid.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_shared.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_shared.js"][0].apply(exports,arguments)
},{"./_global":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_global.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_species-constructor.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_species-constructor.js"][0].apply(exports,arguments)
},{"./_a-function":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_a-function.js","./_an-object":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_an-object.js","./_wks":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_string-at.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_string-at.js"][0].apply(exports,arguments)
},{"./_defined":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_defined.js","./_to-integer":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_to-integer.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_task.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_task.js"][0].apply(exports,arguments)
},{"./_cof":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_cof.js","./_ctx":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_ctx.js","./_dom-create":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_dom-create.js","./_global":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_global.js","./_html":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_html.js","./_invoke":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_invoke.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_to-index.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-index.js"][0].apply(exports,arguments)
},{"./_to-integer":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_to-integer.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_to-integer.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-integer.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_to-iobject.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-iobject.js"][0].apply(exports,arguments)
},{"./_defined":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_defined.js","./_iobject":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_iobject.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_to-length.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-length.js"][0].apply(exports,arguments)
},{"./_to-integer":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_to-integer.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_to-object.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-object.js"][0].apply(exports,arguments)
},{"./_defined":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_defined.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_to-primitive.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_to-primitive.js"][0].apply(exports,arguments)
},{"./_is-object":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_is-object.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_uid.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_uid.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_wks.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/_wks.js"][0].apply(exports,arguments)
},{"./_global":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_global.js","./_shared":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_shared.js","./_uid":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_uid.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/core.get-iterator-method.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/core.get-iterator-method.js"][0].apply(exports,arguments)
},{"./_classof":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_classof.js","./_core":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_core.js","./_iterators":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_iterators.js","./_wks":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/core.get-iterator.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/core.get-iterator.js"][0].apply(exports,arguments)
},{"./_an-object":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_an-object.js","./_core":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_core.js","./core.get-iterator-method":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/core.get-iterator-method.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/es6.array.iterator.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.array.iterator.js"][0].apply(exports,arguments)
},{"./_add-to-unscopables":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_add-to-unscopables.js","./_iter-define":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_iter-define.js","./_iter-step":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_iter-step.js","./_iterators":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_iterators.js","./_to-iobject":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_to-iobject.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/es6.object.define-property.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.object.define-property.js"][0].apply(exports,arguments)
},{"./_descriptors":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_descriptors.js","./_export":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_export.js","./_object-dp":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_object-dp.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/es6.object.to-string.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.object.to-string.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/es6.promise.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.promise.js"][0].apply(exports,arguments)
},{"./_a-function":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_a-function.js","./_an-instance":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_an-instance.js","./_classof":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_classof.js","./_core":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_core.js","./_ctx":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_ctx.js","./_export":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_export.js","./_for-of":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_for-of.js","./_global":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_global.js","./_is-object":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_is-object.js","./_iter-detect":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_iter-detect.js","./_library":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_library.js","./_microtask":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_microtask.js","./_redefine-all":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_redefine-all.js","./_set-species":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_set-species.js","./_set-to-string-tag":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_set-to-string-tag.js","./_species-constructor":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_species-constructor.js","./_task":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_task.js","./_wks":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_wks.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/es6.string.iterator.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/es6.string.iterator.js"][0].apply(exports,arguments)
},{"./_iter-define":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_iter-define.js","./_string-at":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_string-at.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/web.dom.iterable.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/core-js/library/modules/web.dom.iterable.js"][0].apply(exports,arguments)
},{"./_global":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_global.js","./_hide":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_hide.js","./_iterators":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_iterators.js","./_wks":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/_wks.js","./es6.array.iterator":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/core-js/library/modules/es6.array.iterator.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/debug/node_modules/ms/index.js":[function(require,module,exports){
arguments[4]["/Users/ibc/src/mediasoup-client/node_modules/ms/index.js"][0].apply(exports,arguments)
},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/debug/src/browser.js":[function(require,module,exports){
(function (process){
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
  '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
  '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
  '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
  '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
  '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
  '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
  '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
  '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
  '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
  '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))

},{"./debug":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/debug/src/debug.js","_process":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/process/browser.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/debug/src/debug.js":[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * Active `debug` instances.
 */
exports.instances = [];

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  var prevTime;

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);
  debug.destroy = destroy;

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  exports.instances.push(debug);

  return debug;
}

function destroy () {
  var index = exports.instances.indexOf(this);
  if (index !== -1) {
    exports.instances.splice(index, 1);
    return true;
  } else {
    return false;
  }
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var i;
  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }

  for (i = 0; i < exports.instances.length; i++) {
    var instance = exports.instances[i];
    instance.enabled = exports.enabled(instance.namespace);
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  if (name[name.length - 1] === '*') {
    return true;
  }
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/debug/node_modules/ms/index.js"}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/domready/ready.js":[function(require,module,exports){
/*!
  * domready (c) Dustin Diaz 2014 - License MIT
  */
!function (name, definition) {

  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()

}('domready', function () {

  var fns = [], listener
    , doc = document
    , hack = doc.documentElement.doScroll
    , domContentLoaded = 'DOMContentLoaded'
    , loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState)


  if (!loaded)
  doc.addEventListener(domContentLoaded, listener = function () {
    doc.removeEventListener(domContentLoaded, listener)
    loaded = 1
    while (listener = fns.shift()) listener()
  })

  return function (fn) {
    loaded ? setTimeout(fn, 0) : fns.push(fn)
  }

});

},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/events/events.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],"/Users/ibc/src/mediasoup-demo-2/app/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],"/Users/ibc/src/mediasoup-demo-2/app/test/DATA.js":[function(require,module,exports){
'use strict';

/* eslint-disable key-spacing */

exports.ROOM_OPTIONS = {
	requestTimeout: 10000,
	transportOptions: {
		tcp: false
	},
	__turnServers: [{
		urls: ['turn:worker2.versatica.com:3478?transport=udp'],
		username: 'testuser1',
		credential: 'testpasswd1'
	}],
	hidden: false
};

exports.ROOM_RTP_CAPABILITIES = {
	codecs: [{
		name: 'PCMA',
		mimeType: 'audio/PCMA',
		kind: 'audio',
		clockRate: 8000,
		preferredPayloadType: 8,
		rtcpFeedback: [],
		parameters: {}
	}, {
		name: 'opus',
		mimeType: 'audio/opus',
		kind: 'audio',
		clockRate: 48000,
		channels: 2,
		preferredPayloadType: 96,
		rtcpFeedback: [],
		parameters: {}
	}, {
		name: 'SILK',
		mimeType: 'audio/SILK',
		kind: 'audio',
		clockRate: 16000,
		preferredPayloadType: 97,
		rtcpFeedback: [],
		parameters: {}
	}, {
		name: 'VP9',
		mimeType: 'video/VP9',
		kind: 'video',
		clockRate: 90000,
		preferredPayloadType: 102,
		rtcpFeedback: [{
			parameter: '',
			type: 'nack'
		}, {
			parameter: 'pli',
			type: 'nack'
		}, {
			parameter: '',
			type: 'goog-remb'
		}, {
			parameter: 'bar',
			type: 'foo'
		}],
		parameters: {}
	}, {
		name: 'rtx',
		mimeType: 'video/rtx',
		kind: 'video',
		clockRate: 90000,
		preferredPayloadType: 103,
		rtcpFeedback: [],
		parameters: {
			apt: 102
		}
	}, {
		name: 'VP8',
		mimeType: 'video/VP8',
		kind: 'video',
		clockRate: 90000,
		preferredPayloadType: 100,
		rtcpFeedback: [{
			parameter: '',
			type: 'nack'
		}, {
			parameter: 'pli',
			type: 'nack'
		}, {
			parameter: '',
			type: 'goog-remb'
		}, {
			parameter: 'bar',
			type: 'foo'
		}],
		parameters: {}
	}, {
		name: 'rtx',
		mimeType: 'video/rtx',
		kind: 'video',
		clockRate: 90000,
		preferredPayloadType: 101,
		rtcpFeedback: [],
		parameters: {
			apt: 100
		}
	}],
	headerExtensions: [{
		kind: 'audio',
		uri: 'urn:ietf:params:rtp-hdrext:ssrc-audio-level',
		preferredId: 10
	}, {
		kind: 'video',
		uri: 'http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time',
		preferredId: 11
	}, {
		kind: 'video',
		uri: 'http://foo.bar',
		preferredId: 12
	}],
	fecMechanisms: []
};

exports.QUERY_ROOM_RESPONSE = {
	rtpCapabilities: exports.ROOM_RTP_CAPABILITIES
};

exports.JOIN_ROOM_RESPONSE = {
	peers: [{
		name: 'alice',
		appData: 'Alice iPad Pro',
		consumers: [{
			id: 3333,
			kind: 'audio',
			paused: false,
			appData: 'ALICE_MIC',
			rtpParameters: {
				muxId: null,
				codecs: [{
					name: 'PCMA',
					mimeType: 'audio/PCMA',
					clockRate: 8000,
					payloadType: 8,
					rtcpFeedback: [],
					parameters: {}
				}],
				headerExtensions: [{
					uri: 'urn:ietf:params:rtp-hdrext:ssrc-audio-level',
					id: 1
				}],
				encodings: [{
					ssrc: 33333333
				}],
				rtcp: {
					cname: 'ALICECNAME',
					reducedSize: true,
					mux: true
				}
			}
		}]
	}, {
		name: 'bob',
		appData: 'Bob HP Laptop',
		consumers: [{
			id: 6666,
			kind: 'audio',
			paused: false,
			appData: 'BOB_MIC',
			rtpParameters: {
				muxId: null,
				codecs: [{
					name: 'opus',
					mimeType: 'audio/opus',
					clockRate: 48000,
					channels: 2,
					payloadType: 96,
					rtcpFeedback: [],
					parameters: {}
				}],
				headerExtensions: [{
					uri: 'urn:ietf:params:rtp-hdrext:ssrc-audio-level',
					id: 1
				}],
				encodings: [{
					ssrc: 66666666
				}],
				rtcp: {
					cname: 'BOBCNAME',
					reducedSize: true,
					mux: true
				}
			}
		}]
	}]
};

exports.CREATE_TRANSPORT_1_RESPONSE = {
	iceParameters: {
		usernameFragment: 'server-usernamefragment-12345678',
		password: 'server-password-xxxxxxxx',
		iceLite: true
	},
	iceCandidates: [{
		foundation: 'F1',
		priority: 1234,
		ip: '1.2.3.4',
		protocol: 'udp',
		port: 9999,
		type: 'host'
	}],
	dtlsParameters: {
		fingerprints: [{
			algorithm: 'sha-256',
			value: 'FF:FF:39:66:A4:E2:66:60:30:18:A7:59:B3:AF:A5:33:58:5E:7F:69:A4:62:A6:D4:EB:9F:B7:42:05:35:FF:FF'
		}],
		role: 'client'
	}
};

exports.CREATE_TRANSPORT_2_RESPONSE = {
	iceParameters: {
		usernameFragment: 'server-usernamefragment-12345678',
		password: 'server-password-xxxxxxxx',
		iceLite: true
	},
	iceCandidates: [{
		foundation: 'F1',
		priority: 1234,
		ip: '1.2.3.4',
		protocol: 'udp',
		port: 9999,
		type: 'host'
	}],
	dtlsParameters: {
		fingerprints: [{
			algorithm: 'sha-256',
			value: 'FF:FF:39:66:A4:E2:66:60:30:18:A7:59:B3:AF:A5:33:58:5E:7F:69:A4:62:A6:D4:EB:9F:B7:42:05:35:FF:FF'
		}],
		role: 'auto'
	}
};

exports.ALICE_WEBCAM_NEW_CONSUMER_NOTIFICATION = {
	method: 'newConsumer',
	notification: true,
	id: 4444,
	peerName: 'alice',
	kind: 'video',
	paused: true,
	appData: 'ALICE_WEBCAM',
	rtpParameters: {
		muxId: null,
		codecs: [{
			name: 'VP8',
			mimeType: 'video/VP8',
			clockRate: 90000,
			payloadType: 100,
			rtcpFeedback: [{
				parameter: '',
				type: 'nack'
			}, {
				parameter: 'pli',
				type: 'nack'
			}, {
				parameter: '',
				type: 'goog-remb'
			}, {
				parameter: 'bar',
				type: 'foo'
			}],
			parameters: {}
		}, {
			name: 'rtx',
			mimeType: 'video/rtx',
			clockRate: 90000,
			payloadType: 101,
			rtcpFeedback: [],
			parameters: {
				apt: 100
			}
		}],
		headerExtensions: [{
			kind: 'video',
			uri: 'http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time',
			id: 11
		}, {
			kind: 'video',
			uri: 'http://foo.bar',
			id: 12
		}],
		encodings: [{
			ssrc: 444444441,
			rtx: {
				ssrc: 444444442
			}
		}],
		rtcp: {
			cname: 'ALICECNAME',
			reducedSize: true,
			mux: true
		}
	}
};

},{}],"/Users/ibc/src/mediasoup-demo-2/app/test/index.jsx":[function(require,module,exports){
'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _mediasoupClient = require('mediasoup-client');

var mediasoupClient = _interopRequireWildcard(_mediasoupClient);

var _domready = require('domready');

var _domready2 = _interopRequireDefault(_domready);

var _Logger = require('../lib/Logger');

var _Logger2 = _interopRequireDefault(_Logger);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DATA = require('./DATA');

window.mediasoupClient = mediasoupClient;

var logger = new _Logger2.default();

var SEND = true;
var SEND_AUDIO = true;
var SEND_VIDEO = false;
var RECV = true;

(0, _domready2.default)(function () {
	logger.debug('DOM ready');

	run();
});

function run() {
	logger.debug('run() [environment:%s]', "development");

	var transport1 = void 0;
	var transport2 = void 0;
	var audioTrack = void 0;
	var videoTrack = void 0;
	var audioProducer1 = void 0;
	var audioProducer2 = void 0;
	var videoProducer = void 0;

	logger.debug('calling room = new mediasoupClient.Room()');

	// const room = new mediasoupClient.Room();
	var room = new mediasoupClient.Room(DATA.ROOM_OPTIONS);

	window.room = room;

	room.on('closed', function (originator, appData) {
		logger.warn('room "closed" event [originator:%s, appData:%o]', originator, appData);
	});

	room.on('request', function (request, callback, errback) {
		logger.warn('sending request [method:%s]:%o', request.method, request);

		switch (request.method) {
			case 'queryRoom':
				{
					setTimeout(function () {
						callback(DATA.QUERY_ROOM_RESPONSE);
						errback('upppps');
					}, 200);
					break;
				}

			case 'joinRoom':
				{
					setTimeout(function () {
						callback(DATA.JOIN_ROOM_RESPONSE);
						// errback('upppps');
					}, 200);
					break;
				}

			case 'createTransport':
				{
					setTimeout(function () {
						switch (request.appData) {
							case 'TRANSPORT_1':
								callback(DATA.CREATE_TRANSPORT_1_RESPONSE);
								break;
							case 'TRANSPORT_2':
								callback(DATA.CREATE_TRANSPORT_2_RESPONSE);
								break;
							default:
								errback('upppps');
						}
					}, 250);
					break;
				}

			case 'createProducer':
				{
					setTimeout(function () {
						callback();
					}, 250);
					break;
				}

			case 'enableConsumer':
				{
					setTimeout(function () {
						callback();
					}, 500);
					break;
				}

			default:
				errback('NO IDEA ABOUT REQUEST METHOD "' + request.method + '"');
		}
	});

	room.on('notify', function (notification) {
		logger.warn('sending notification [method:%s]:%o', notification.method, notification);

		switch (notification.method) {
			case 'leaveRoom':
			case 'updateTransport':
			case 'closeTransport':
			case 'closeProducer':
			case 'pauseProducer':
			case 'resumeProducer':
			case 'pauseConsumer':
			case 'resumeConsumer':
				break;

			default:
				logger.error('NO IDEA ABOUT NOTIFICATION METHOD "' + notification.method + '"');
		}
	});

	room.on('newpeer', function (peer) {
		logger.warn('room "newpeer" event [name:"%s", peer:%o]', peer.name, peer);

		handlePeer(peer);
	});

	_promise2.default.resolve().then(function () {
		logger.debug('calling room.join()');

		var deviceInfo = mediasoupClient.getDeviceInfo();
		var appData = {
			device: deviceInfo.name + ' ' + deviceInfo.version
		};

		return room.join(null, appData);
		// return room.join(DATA.ROOM_RTP_CAPABILITIES, appData);
	}).then(function (peers) {
		if (!RECV) return;

		logger.debug('room.join() succeeded');

		logger.debug('calling transport2 = room.createTransport("recv")');

		transport2 = room.createTransport('recv', 'TRANSPORT_2');
		window.transport2 = transport2;
		window.pc2 = transport2._handler._pc;

		handleTransport(transport2);

		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = (0, _getIterator3.default)(peers), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var peer = _step.value;

				handlePeer(peer);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	}).then(function () {
		if (!SEND) return;

		if (room.canSend('audio')) logger.debug('can send audio');else logger.warn('cannot send audio');

		if (room.canSend('video')) logger.debug('can send video');else logger.warn('cannot send video');

		logger.debug('calling transport1 = room.createTransport("send")');

		transport1 = room.createTransport('send', 'TRANSPORT_1');
		window.transport1 = transport1;
		window.pc1 = transport1._handler._pc;

		handleTransport(transport1);

		logger.debug('calling getUserMedia()');

		return navigator.mediaDevices.getUserMedia({ audio: SEND_AUDIO, video: SEND_VIDEO });
	}).then(function (stream) {
		if (!SEND) return;

		audioTrack = stream.getAudioTracks()[0];
		videoTrack = stream.getVideoTracks()[0];
		window.audioTrack = audioTrack;
		window.videoTrack = videoTrack;
	})
	// Add Producers.
	.then(function () {
		if (audioTrack) {
			var deviceId = audioTrack.getSettings().deviceId;

			logger.debug('calling audioProducer1 = room.createProducer(audioTrack)');

			try {
				audioProducer1 = room.createProducer(audioTrack, deviceId + '-1');
				window.audioProducer1 = audioProducer1;

				handleProducer(audioProducer1);
			} catch (error) {
				logger.error(error);
			}

			logger.debug('calling audioProducer2 = room.createProducer(audioTrack)');

			try {
				audioProducer2 = room.createProducer(audioTrack, deviceId + '-2');
				window.audioProducer2 = audioProducer2;

				handleProducer(audioProducer2);
			} catch (error) {
				logger.error(error);
			}
		}

		if (videoTrack) {
			var _deviceId = videoTrack.getSettings().deviceId;

			logger.debug('calling videoProducer = room.createProducer(videoTrack)');

			try {
				videoProducer = room.createProducer(videoTrack, _deviceId + '-1');
				window.videoProducer = videoProducer;

				handleProducer(videoProducer);
			} catch (error) {
				logger.error(error);
			}
		}
	})
	// Receive notifications.
	.then(function () {
		if (!RECV) return;

		setTimeout(function () {
			room.receiveNotification(DATA.ALICE_WEBCAM_NEW_CONSUMER_NOTIFICATION);
		}, 2000);
	});
}

function handleTransport(transport) {
	logger.warn('handleTransport() [direction:%s, appData:"%s", transport:%o]', transport.direction, transport.appData, transport);

	transport.on('closed', function (originator, appData) {
		logger.warn('transport "closed" event [originator:%s, appData:%o, transport:%o]', originator, appData, transport);
	});

	transport.on('connectionstatechange', function (state) {
		logger.warn('transport "connectionstatechange" event [direction:%s, state:%s, transport:%o]', transport.direction, state, transport);
	});

	setInterval(function () {
		var queue = transport._commandQueue._queue;

		if (queue.length !== 0) logger.error('queue not empty [transport:%o, queue:%o]', transport, queue);
	}, 15000);
}

function handlePeer(peer) {
	logger.warn('handlePeer() [name:"%s", peer:%o]', peer.name, peer);

	switch (peer.name) {
		case 'alice':
			window.alice = peer;
			break;
		case 'bob':
			window.bob = peer;
			break;
	}

	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = (0, _getIterator3.default)(peer.consumers), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var consumer = _step2.value;

			handleConsumer(consumer);
		}
	} catch (err) {
		_didIteratorError2 = true;
		_iteratorError2 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion2 && _iterator2.return) {
				_iterator2.return();
			}
		} finally {
			if (_didIteratorError2) {
				throw _iteratorError2;
			}
		}
	}

	peer.on('closed', function (originator, appData) {
		logger.warn('peer "closed" event [name:"%s", originator:%s, appData:%o]', peer.name, originator, appData);
	});

	peer.on('newconsumer', function (consumer) {
		logger.warn('peer "newconsumer" event [name:"%s", id:%s, consumer:%o]', peer.name, consumer.id, consumer);

		handleConsumer(consumer);
	});
}

function handleProducer(producer) {
	var transport1 = window.transport1;

	logger.debug('handleProducer() [id:"%s", appData:%o, producer:%o]', producer.id, producer.appData, producer);

	logger.debug('handleProducer() | calling transport1.send(producer)');

	transport1.send(producer).then(function () {
		logger.debug('transport1.send(producer) succeeded');
	}).catch(function (error) {
		logger.error('transport1.send(producer) failed: %o', error);
	});

	producer.on('closed', function (originator, appData) {
		logger.warn('producer "closed" event [id:%s, originator:%s, appData:%o, producer:%o]', producer.id, originator, appData, producer);
	});

	producer.on('paused', function (originator, appData) {
		logger.warn('producer "paused" event [id:%s, originator:%s, appData:%o, producer:%o]', producer.id, originator, appData, producer);
	});

	producer.on('resumed', function (originator, appData) {
		logger.warn('producer "resumed" event [id:%s, originator:%s, appData:%o, producer:%o]', producer.id, originator, appData, producer);
	});

	producer.on('unhandled', function () {
		logger.warn('producer "unhandled" event [id:%s, producer:%o]', producer.id, producer);
	});
}

function handleConsumer(consumer) {
	var transport2 = window.transport2;

	logger.debug('handleConsumer() [id:"%s", appData:%o, consumer:%o]', consumer.id, consumer.appData, consumer);

	switch (consumer.appData) {
		case 'ALICE_MIC':
			window.aliceAudioConsumer = consumer;
			break;
		case 'ALICE_WEBCAM':
			window.aliceVideoConsumer = consumer;
			break;
		case 'BOB_MIC':
			window.bobAudioConsumer = consumer;
			break;
	}

	logger.debug('handleConsumer() calling transport2.receive(consumer)');

	transport2.receive(consumer).then(function (track) {
		logger.warn('transport2.receive(consumer) succeeded [track:%o]', track);
	}).catch(function (error) {
		logger.error('transport2.receive() failed:%o', error);
	});

	consumer.on('closed', function (originator, appData) {
		logger.warn('consumer "closed" event [id:%s, originator:%s, appData:%o, consumer:%o]', consumer.id, originator, appData, consumer);
	});

	consumer.on('paused', function (originator, appData) {
		logger.warn('consumer "paused" event [id:%s, originator:%s, appData:%o, consumer:%o]', consumer.id, originator, appData, consumer);
	});

	consumer.on('resumed', function (originator, appData) {
		logger.warn('consumer "resumed" event [id:%s, originator:%s, appData:%o, consumer:%o]', consumer.id, originator, appData, consumer);
	});

	consumer.on('unhandled', function () {
		logger.warn('consumer "unhandled" event [id:%s, consumer:%o]', consumer.id, consumer);
	});
}

// NOTE: Trigger server notifications.

window.notifyRoomClosed = function () {
	var room = window.room;
	var notification = {
		method: 'roomClosed',
		notification: true,
		appData: 'ha cascao la room remota!!!'
	};

	room.receiveNotification(notification);
};

window.notifyTransportClosed = function () {
	var room = window.room;
	var notification = {
		method: 'transportClosed',
		notification: true,
		id: room.transports[0].id,
		appData: 'admin closed your transport'
	};

	room.receiveNotification(notification);
};

window.notifyAudioProducer1Closed = function () {
	var room = window.room;
	var notification = {
		method: 'producerClosed',
		notification: true,
		id: window.audioProducer1.id,
		appData: 'te paro el micro por la fuerza'
	};

	room.receiveNotification(notification);
};

window.notifyAudioProducer1Paused = function () {
	var room = window.room;
	var notification = {
		method: 'producerPaused',
		notification: true,
		id: window.audioProducer1.id,
		appData: 'te pause el micro por la fuerza'
	};

	room.receiveNotification(notification);
};

window.notifyAudioProducer1Resumed = function () {
	var room = window.room;
	var notification = {
		method: 'producerResumed',
		notification: true,
		id: window.audioProducer1.id,
		appData: 'te resumo el micro'
	};

	room.receiveNotification(notification);
};

window.notifyAlicePeerClosed = function () {
	var room = window.room;
	var notification = {
		method: 'peerClosed',
		notification: true,
		name: 'alice',
		appData: 'peer left'
	};

	room.receiveNotification(notification);
};

window.notifyAliceAudioConsumerClosed = function () {
	var room = window.room;
	var notification = {
		method: 'consumerClosed',
		notification: true,
		peerName: 'alice',
		id: 3333,
		appData: 'mic broken'
	};

	room.receiveNotification(notification);
};

window.notifyAliceVideoConsumerClosed = function () {
	var room = window.room;
	var notification = {
		method: 'consumerClosed',
		notification: true,
		peerName: 'alice',
		id: 4444,
		appData: 'webcam broken'
	};

	room.receiveNotification(notification);
};

window.notifyAliceVideoConsumerPaused = function () {
	var room = window.room;
	var notification = {
		method: 'consumerPaused',
		notification: true,
		peerName: 'alice',
		id: 4444,
		appData: 'webcam paused'
	};

	room.receiveNotification(notification);
};

window.notifyAliceVideoConsumerResumed = function () {
	var room = window.room;
	var notification = {
		method: 'consumerResumed',
		notification: true,
		peerName: 'alice',
		id: 4444,
		appData: 'webcam resumed'
	};

	room.receiveNotification(notification);
};

// NOTE: Test pause/resume.

window.testPauseResume = function () {
	logger.debug('testPauseResume() with audioProducer1');

	var producer = window.audioProducer1;

	// producer.once('paused', () =>
	// {
	// 	producer.resume('I RESUME TO FUACK!!!');
	// });

	logger.debug('testPauseResume() | (1) calling producer.pause()');

	if (producer.pause('I PAUSE (1)')) {
		logger.warn('testPauseResume() | (1) producer.pause() succeeded [locallyPaused:%s]', producer.locallyPaused);
	} else {
		logger.error('testPauseResume() | (1) producer.pause() failed [locallyPaused:%s]', producer.locallyPaused);
	}

	logger.debug('testPauseResume() | (2) calling producer.pause()');

	if (producer.pause('I PAUSE (2)')) {
		logger.warn('testPauseResume() | (2) producer.pause() succeeded [locallyPaused:%s]', producer.locallyPaused);
	} else {
		logger.error('testPauseResume() | (2) producer.pause() failed [locallyPaused:%s]', producer.locallyPaused);
	}

	logger.debug('testPauseResume() | (3) calling producer.resume()');

	if (producer.resume('I RESUME (3)')) {
		logger.warn('testPauseResume() | (3) producer.resume() succeeded [locallyPaused:%s]', producer.locallyPaused);
	} else {
		logger.error('testPauseResume() | (3) producer.resume() failed [locallyPaused:%s]', producer.locallyPaused);
	}
};

// NOTE: For debugging.

window.dump1 = function () {
	var transport1 = window.transport1;
	var pc1 = transport1._handler._pc;

	if (pc1 && pc1.localDescription) logger.warn('PC1 SEND LOCAL OFFER:\n%s', pc1.localDescription.sdp);

	if (pc1 && pc1.remoteDescription) logger.warn('PC1 SEND REMOTE ANSWER:\n%s', pc1.remoteDescription.sdp);
};

window.dump2 = function () {
	var transport2 = window.transport2;
	var pc2 = transport2._handler._pc;

	if (pc2 && pc2.remoteDescription) logger.warn('PC2 RECV REMOTE OFFER:\n%s', pc2.remoteDescription.sdp);

	if (pc2 && pc2.localDescription) logger.warn('PC2 RECV LOCAL ANSWER:\n%s', pc2.localDescription.sdp);
};

},{"../lib/Logger":"/Users/ibc/src/mediasoup-demo-2/app/lib/Logger.js","./DATA":"/Users/ibc/src/mediasoup-demo-2/app/test/DATA.js","babel-runtime/core-js/get-iterator":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/babel-runtime/core-js/get-iterator.js","babel-runtime/core-js/promise":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/babel-runtime/core-js/promise.js","domready":"/Users/ibc/src/mediasoup-demo-2/app/node_modules/domready/ready.js","mediasoup-client":"/Users/ibc/src/mediasoup-client/lib/index.js"}]},{},["/Users/ibc/src/mediasoup-demo-2/app/test/index.jsx"])