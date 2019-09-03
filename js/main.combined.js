/*!
 * jQuery Form Plugin
 * version: 4.2.2
 * Requires jQuery v1.7.2 or later
 * Project repository: https://github.com/jquery-form/form

 * Copyright 2017 Kevin Morris
 * Copyright 2006 M. Alsup

 * Dual licensed under the LGPL-2.1+ or MIT licenses
 * https://github.com/jquery-form/form#license

 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 */
/* global ActiveXObject */

/* eslint-disable */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], factory);
	} else if (typeof module === 'object' && module.exports) {
		// Node/CommonJS
		module.exports = function( root, jQuery ) {
			if (typeof jQuery === 'undefined') {
				// require('jQuery') returns a factory that requires window to build a jQuery instance, we normalize how we use modules
				// that require this pattern but the window provided is a noop if it's defined (how jquery works)
				if (typeof window !== 'undefined') {
					jQuery = require('jquery');
				}
				else {
					jQuery = require('jquery')(root);
				}
			}
			factory(jQuery);
			return jQuery;
		};
	} else {
		// Browser globals
		factory(jQuery);
	}

}(function ($) {
/* eslint-enable */
	'use strict';

	/*
		Usage Note:
		-----------
		Do not use both ajaxSubmit and ajaxForm on the same form. These
		functions are mutually exclusive. Use ajaxSubmit if you want
		to bind your own submit handler to the form. For example,

		$(document).ready(function() {
			$('#myForm').on('submit', function(e) {
				e.preventDefault(); // <-- important
				$(this).ajaxSubmit({
					target: '#output'
				});
			});
		});

		Use ajaxForm when you want the plugin to manage all the event binding
		for you. For example,

		$(document).ready(function() {
			$('#myForm').ajaxForm({
				target: '#output'
			});
		});

		You can also use ajaxForm with delegation (requires jQuery v1.7+), so the
		form does not have to exist when you invoke ajaxForm:

		$('#myForm').ajaxForm({
			delegation: true,
			target: '#output'
		});

		When using ajaxForm, the ajaxSubmit function will be invoked for you
		at the appropriate time.
	*/

	var rCRLF = /\r?\n/g;

	/**
	 * Feature detection
	 */
	var feature = {};

	feature.fileapi = $('<input type="file">').get(0).files !== undefined;
	feature.formdata = (typeof window.FormData !== 'undefined');

	var hasProp = !!$.fn.prop;

	// attr2 uses prop when it can but checks the return type for
	// an expected string. This accounts for the case where a form
	// contains inputs with names like "action" or "method"; in those
	// cases "prop" returns the element
	$.fn.attr2 = function() {
		if (!hasProp) {
			return this.attr.apply(this, arguments);
		}

		var val = this.prop.apply(this, arguments);

		if ((val && val.jquery) || typeof val === 'string') {
			return val;
		}

		return this.attr.apply(this, arguments);
	};

	/**
	 * ajaxSubmit() provides a mechanism for immediately submitting
	 * an HTML form using AJAX.
	 *
	 * @param	{object|string}	options		jquery.form.js parameters or custom url for submission
	 * @param	{object}		data		extraData
	 * @param	{string}		dataType	ajax dataType
	 * @param	{function}		onSuccess	ajax success callback function
	 */
	$.fn.ajaxSubmit = function(options, data, dataType, onSuccess) {
		// fast fail if nothing selected (http://dev.jquery.com/ticket/2752)
		if (!this.length) {
			log('ajaxSubmit: skipping submit process - no element selected');

			return this;
		}

		/* eslint consistent-this: ["error", "$form"] */
		var method, action, url, $form = this;

		if (typeof options === 'function') {
			options = {success: options};

		} else if (typeof options === 'string' || (options === false && arguments.length > 0)) {
			options = {
				'url'      : options,
				'data'     : data,
				'dataType' : dataType
			};

			if (typeof onSuccess === 'function') {
				options.success = onSuccess;
			}

		} else if (typeof options === 'undefined') {
			options = {};
		}

		method = options.method || options.type || this.attr2('method');
		action = options.url || this.attr2('action');

		url = (typeof action === 'string') ? $.trim(action) : '';
		url = url || window.location.href || '';
		if (url) {
			// clean url (don't include hash vaue)
			url = (url.match(/^([^#]+)/) || [])[1];
		}

		options = $.extend(true, {
			url       : url,
			success   : $.ajaxSettings.success,
			type      : method || $.ajaxSettings.type,
			iframeSrc : /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank'		// eslint-disable-line no-script-url
		}, options);

		// hook for manipulating the form data before it is extracted;
		// convenient for use with rich editors like tinyMCE or FCKEditor
		var veto = {};

		this.trigger('form-pre-serialize', [this, options, veto]);

		if (veto.veto) {
			log('ajaxSubmit: submit vetoed via form-pre-serialize trigger');

			return this;
		}

		// provide opportunity to alter form data before it is serialized
		if (options.beforeSerialize && options.beforeSerialize(this, options) === false) {
			log('ajaxSubmit: submit aborted via beforeSerialize callback');

			return this;
		}

		var traditional = options.traditional;

		if (typeof traditional === 'undefined') {
			traditional = $.ajaxSettings.traditional;
		}

		var elements = [];
		var qx, a = this.formToArray(options.semantic, elements, options.filtering);

		if (options.data) {
			var optionsData = $.isFunction(options.data) ? options.data(a) : options.data;

			options.extraData = optionsData;
			qx = $.param(optionsData, traditional);
		}

		// give pre-submit callback an opportunity to abort the submit
		if (options.beforeSubmit && options.beforeSubmit(a, this, options) === false) {
			log('ajaxSubmit: submit aborted via beforeSubmit callback');

			return this;
		}

		// fire vetoable 'validate' event
		this.trigger('form-submit-validate', [a, this, options, veto]);
		if (veto.veto) {
			log('ajaxSubmit: submit vetoed via form-submit-validate trigger');

			return this;
		}

		var q = $.param(a, traditional);

		if (qx) {
			q = (q ? (q + '&' + qx) : qx);
		}

		if (options.type.toUpperCase() === 'GET') {
			options.url += (options.url.indexOf('?') >= 0 ? '&' : '?') + q;
			options.data = null;	// data is null for 'get'
		} else {
			options.data = q;		// data is the query string for 'post'
		}

		var callbacks = [];

		if (options.resetForm) {
			callbacks.push(function() {
				$form.resetForm();
			});
		}

		if (options.clearForm) {
			callbacks.push(function() {
				$form.clearForm(options.includeHidden);
			});
		}

		// perform a load on the target only if dataType is not provided
		if (!options.dataType && options.target) {
			var oldSuccess = options.success || function(){};

			callbacks.push(function(data, textStatus, jqXHR) {
				var successArguments = arguments,
					fn = options.replaceTarget ? 'replaceWith' : 'html';

				$(options.target)[fn](data).each(function(){
					oldSuccess.apply(this, successArguments);
				});
			});

		} else if (options.success) {
			if ($.isArray(options.success)) {
				$.merge(callbacks, options.success);
			} else {
				callbacks.push(options.success);
			}
		}

		options.success = function(data, status, xhr) { // jQuery 1.4+ passes xhr as 3rd arg
			var context = options.context || this;		// jQuery 1.4+ supports scope context

			for (var i = 0, max = callbacks.length; i < max; i++) {
				callbacks[i].apply(context, [data, status, xhr || $form, $form]);
			}
		};

		if (options.error) {
			var oldError = options.error;

			options.error = function(xhr, status, error) {
				var context = options.context || this;

				oldError.apply(context, [xhr, status, error, $form]);
			};
		}

		if (options.complete) {
			var oldComplete = options.complete;

			options.complete = function(xhr, status) {
				var context = options.context || this;

				oldComplete.apply(context, [xhr, status, $form]);
			};
		}

		// are there files to upload?

		// [value] (issue #113), also see comment:
		// https://github.com/malsup/form/commit/588306aedba1de01388032d5f42a60159eea9228#commitcomment-2180219
		var fileInputs = $('input[type=file]:enabled', this).filter(function() {
			return $(this).val() !== '';
		});
		var hasFileInputs = fileInputs.length > 0;
		var mp = 'multipart/form-data';
		var multipart = ($form.attr('enctype') === mp || $form.attr('encoding') === mp);
		var fileAPI = feature.fileapi && feature.formdata;

		log('fileAPI :' + fileAPI);

		var shouldUseFrame = (hasFileInputs || multipart) && !fileAPI;
		var jqxhr;

		// options.iframe allows user to force iframe mode
		// 06-NOV-09: now defaulting to iframe mode if file input is detected
		if (options.iframe !== false && (options.iframe || shouldUseFrame)) {
			// hack to fix Safari hang (thanks to Tim Molendijk for this)
			// see: http://groups.google.com/group/jquery-dev/browse_thread/thread/36395b7ab510dd5d
			if (options.closeKeepAlive) {
				$.get(options.closeKeepAlive, function() {
					jqxhr = fileUploadIframe(a);
				});

			} else {
				jqxhr = fileUploadIframe(a);
			}

		} else if ((hasFileInputs || multipart) && fileAPI) {
			jqxhr = fileUploadXhr(a);

		} else {
			jqxhr = $.ajax(options);
		}

		$form.removeData('jqxhr').data('jqxhr', jqxhr);

		// clear element array
		for (var k = 0; k < elements.length; k++) {
			elements[k] = null;
		}

		// fire 'notify' event
		this.trigger('form-submit-notify', [this, options]);

		return this;

		// utility fn for deep serialization
		function deepSerialize(extraData) {
			var serialized = $.param(extraData, options.traditional).split('&');
			var len = serialized.length;
			var result = [];
			var i, part;

			for (i = 0; i < len; i++) {
				// #252; undo param space replacement
				serialized[i] = serialized[i].replace(/\+/g, ' ');
				part = serialized[i].split('=');
				// #278; use array instead of object storage, favoring array serializations
				result.push([decodeURIComponent(part[0]), decodeURIComponent(part[1])]);
			}

			return result;
		}

		// XMLHttpRequest Level 2 file uploads (big hat tip to francois2metz)
		function fileUploadXhr(a) {
			var formdata = new FormData();

			for (var i = 0; i < a.length; i++) {
				formdata.append(a[i].name, a[i].value);
			}

			if (options.extraData) {
				var serializedData = deepSerialize(options.extraData);

				for (i = 0; i < serializedData.length; i++) {
					if (serializedData[i]) {
						formdata.append(serializedData[i][0], serializedData[i][1]);
					}
				}
			}

			options.data = null;

			var s = $.extend(true, {}, $.ajaxSettings, options, {
				contentType : false,
				processData : false,
				cache       : false,
				type        : method || 'POST'
			});

			if (options.uploadProgress) {
				// workaround because jqXHR does not expose upload property
				s.xhr = function() {
					var xhr = $.ajaxSettings.xhr();

					if (xhr.upload) {
						xhr.upload.addEventListener('progress', function(event) {
							var percent = 0;
							var position = event.loaded || event.position;			/* event.position is deprecated */
							var total = event.total;

							if (event.lengthComputable) {
								percent = Math.ceil(position / total * 100);
							}

							options.uploadProgress(event, position, total, percent);
						}, false);
					}

					return xhr;
				};
			}

			s.data = null;

			var beforeSend = s.beforeSend;

			s.beforeSend = function(xhr, o) {
				// Send FormData() provided by user
				if (options.formData) {
					o.data = options.formData;
				} else {
					o.data = formdata;
				}

				if (beforeSend) {
					beforeSend.call(this, xhr, o);
				}
			};

			return $.ajax(s);
		}

		// private function for handling file uploads (hat tip to YAHOO!)
		function fileUploadIframe(a) {
			var form = $form[0], el, i, s, g, id, $io, io, xhr, sub, n, timedOut, timeoutHandle;
			var deferred = $.Deferred();

			// #341
			deferred.abort = function(status) {
				xhr.abort(status);
			};

			if (a) {
				// ensure that every serialized input is still enabled
				for (i = 0; i < elements.length; i++) {
					el = $(elements[i]);
					if (hasProp) {
						el.prop('disabled', false);
					} else {
						el.removeAttr('disabled');
					}
				}
			}

			s = $.extend(true, {}, $.ajaxSettings, options);
			s.context = s.context || s;
			id = 'jqFormIO' + new Date().getTime();
			var ownerDocument = form.ownerDocument;
			var $body = $form.closest('body');

			if (s.iframeTarget) {
				$io = $(s.iframeTarget, ownerDocument);
				n = $io.attr2('name');
				if (!n) {
					$io.attr2('name', id);
				} else {
					id = n;
				}

			} else {
				$io = $('<iframe name="' + id + '" src="' + s.iframeSrc + '" />', ownerDocument);
				$io.css({position: 'absolute', top: '-1000px', left: '-1000px'});
			}
			io = $io[0];


			xhr = { // mock object
				aborted               : 0,
				responseText          : null,
				responseXML           : null,
				status                : 0,
				statusText            : 'n/a',
				getAllResponseHeaders : function() {},
				getResponseHeader     : function() {},
				setRequestHeader      : function() {},
				abort                 : function(status) {
					var e = (status === 'timeout' ? 'timeout' : 'aborted');

					log('aborting upload... ' + e);
					this.aborted = 1;

					try { // #214, #257
						if (io.contentWindow.document.execCommand) {
							io.contentWindow.document.execCommand('Stop');
						}
					} catch (ignore) {}

					$io.attr('src', s.iframeSrc); // abort op in progress
					xhr.error = e;
					if (s.error) {
						s.error.call(s.context, xhr, e, status);
					}

					if (g) {
						$.event.trigger('ajaxError', [xhr, s, e]);
					}

					if (s.complete) {
						s.complete.call(s.context, xhr, e);
					}
				}
			};

			g = s.global;
			// trigger ajax global events so that activity/block indicators work like normal
			if (g && $.active++ === 0) {
				$.event.trigger('ajaxStart');
			}
			if (g) {
				$.event.trigger('ajaxSend', [xhr, s]);
			}

			if (s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false) {
				if (s.global) {
					$.active--;
				}
				deferred.reject();

				return deferred;
			}

			if (xhr.aborted) {
				deferred.reject();

				return deferred;
			}

			// add submitting element to data if we know it
			sub = form.clk;
			if (sub) {
				n = sub.name;
				if (n && !sub.disabled) {
					s.extraData = s.extraData || {};
					s.extraData[n] = sub.value;
					if (sub.type === 'image') {
						s.extraData[n + '.x'] = form.clk_x;
						s.extraData[n + '.y'] = form.clk_y;
					}
				}
			}

			var CLIENT_TIMEOUT_ABORT = 1;
			var SERVER_ABORT = 2;

			function getDoc(frame) {
				/* it looks like contentWindow or contentDocument do not
				 * carry the protocol property in ie8, when running under ssl
				 * frame.document is the only valid response document, since
				 * the protocol is know but not on the other two objects. strange?
				 * "Same origin policy" http://en.wikipedia.org/wiki/Same_origin_policy
				 */

				var doc = null;

				// IE8 cascading access check
				try {
					if (frame.contentWindow) {
						doc = frame.contentWindow.document;
					}
				} catch (err) {
					// IE8 access denied under ssl & missing protocol
					log('cannot get iframe.contentWindow document: ' + err);
				}

				if (doc) { // successful getting content
					return doc;
				}

				try { // simply checking may throw in ie8 under ssl or mismatched protocol
					doc = frame.contentDocument ? frame.contentDocument : frame.document;
				} catch (err) {
					// last attempt
					log('cannot get iframe.contentDocument: ' + err);
					doc = frame.document;
				}

				return doc;
			}

			// Rails CSRF hack (thanks to Yvan Barthelemy)
			var csrf_token = $('meta[name=csrf-token]').attr('content');
			var csrf_param = $('meta[name=csrf-param]').attr('content');

			if (csrf_param && csrf_token) {
				s.extraData = s.extraData || {};
				s.extraData[csrf_param] = csrf_token;
			}

			// take a breath so that pending repaints get some cpu time before the upload starts
			function doSubmit() {
				// make sure form attrs are set
				var t = $form.attr2('target'),
					a = $form.attr2('action'),
					mp = 'multipart/form-data',
					et = $form.attr('enctype') || $form.attr('encoding') || mp;

				// update form attrs in IE friendly way
				form.setAttribute('target', id);
				if (!method || /post/i.test(method)) {
					form.setAttribute('method', 'POST');
				}
				if (a !== s.url) {
					form.setAttribute('action', s.url);
				}

				// ie borks in some cases when setting encoding
				if (!s.skipEncodingOverride && (!method || /post/i.test(method))) {
					$form.attr({
						encoding : 'multipart/form-data',
						enctype  : 'multipart/form-data'
					});
				}

				// support timout
				if (s.timeout) {
					timeoutHandle = setTimeout(function() {
						timedOut = true; cb(CLIENT_TIMEOUT_ABORT);
					}, s.timeout);
				}

				// look for server aborts
				function checkState() {
					try {
						var state = getDoc(io).readyState;

						log('state = ' + state);
						if (state && state.toLowerCase() === 'uninitialized') {
							setTimeout(checkState, 50);
						}

					} catch (e) {
						log('Server abort: ', e, ' (', e.name, ')');
						cb(SERVER_ABORT);				// eslint-disable-line callback-return
						if (timeoutHandle) {
							clearTimeout(timeoutHandle);
						}
						timeoutHandle = undefined;
					}
				}

				// add "extra" data to form if provided in options
				var extraInputs = [];

				try {
					if (s.extraData) {
						for (var n in s.extraData) {
							if (s.extraData.hasOwnProperty(n)) {
								// if using the $.param format that allows for multiple values with the same name
								if ($.isPlainObject(s.extraData[n]) && s.extraData[n].hasOwnProperty('name') && s.extraData[n].hasOwnProperty('value')) {
									extraInputs.push(
									$('<input type="hidden" name="' + s.extraData[n].name + '">', ownerDocument).val(s.extraData[n].value)
										.appendTo(form)[0]);
								} else {
									extraInputs.push(
									$('<input type="hidden" name="' + n + '">', ownerDocument).val(s.extraData[n])
										.appendTo(form)[0]);
								}
							}
						}
					}

					if (!s.iframeTarget) {
						// add iframe to doc and submit the form
						$io.appendTo($body);
					}

					if (io.attachEvent) {
						io.attachEvent('onload', cb);
					} else {
						io.addEventListener('load', cb, false);
					}

					setTimeout(checkState, 15);

					try {
						form.submit();

					} catch (err) {
						// just in case form has element with name/id of 'submit'
						var submitFn = document.createElement('form').submit;

						submitFn.apply(form);
					}

				} finally {
					// reset attrs and remove "extra" input elements
					form.setAttribute('action', a);
					form.setAttribute('enctype', et); // #380
					if (t) {
						form.setAttribute('target', t);
					} else {
						$form.removeAttr('target');
					}
					$(extraInputs).remove();
				}
			}

			if (s.forceSync) {
				doSubmit();
			} else {
				setTimeout(doSubmit, 10); // this lets dom updates render
			}

			var data, doc, domCheckCount = 50, callbackProcessed;

			function cb(e) {
				if (xhr.aborted || callbackProcessed) {
					return;
				}

				doc = getDoc(io);
				if (!doc) {
					log('cannot access response document');
					e = SERVER_ABORT;
				}
				if (e === CLIENT_TIMEOUT_ABORT && xhr) {
					xhr.abort('timeout');
					deferred.reject(xhr, 'timeout');

					return;

				} else if (e === SERVER_ABORT && xhr) {
					xhr.abort('server abort');
					deferred.reject(xhr, 'error', 'server abort');

					return;
				}

				if (!doc || doc.location.href === s.iframeSrc) {
					// response not received yet
					if (!timedOut) {
						return;
					}
				}

				if (io.detachEvent) {
					io.detachEvent('onload', cb);
				} else {
					io.removeEventListener('load', cb, false);
				}

				var status = 'success', errMsg;

				try {
					if (timedOut) {
						throw 'timeout';
					}

					var isXml = s.dataType === 'xml' || doc.XMLDocument || $.isXMLDoc(doc);

					log('isXml=' + isXml);

					if (!isXml && window.opera && (doc.body === null || !doc.body.innerHTML)) {
						if (--domCheckCount) {
							// in some browsers (Opera) the iframe DOM is not always traversable when
							// the onload callback fires, so we loop a bit to accommodate
							log('requeing onLoad callback, DOM not available');
							setTimeout(cb, 250);

							return;
						}
						// let this fall through because server response could be an empty document
						// log('Could not access iframe DOM after mutiple tries.');
						// throw 'DOMException: not available';
					}

					// log('response detected');
					var docRoot = doc.body ? doc.body : doc.documentElement;

					xhr.responseText = docRoot ? docRoot.innerHTML : null;
					xhr.responseXML = doc.XMLDocument ? doc.XMLDocument : doc;
					if (isXml) {
						s.dataType = 'xml';
					}
					xhr.getResponseHeader = function(header){
						var headers = {'content-type': s.dataType};

						return headers[header.toLowerCase()];
					};
					// support for XHR 'status' & 'statusText' emulation :
					if (docRoot) {
						xhr.status = Number(docRoot.getAttribute('status')) || xhr.status;
						xhr.statusText = docRoot.getAttribute('statusText') || xhr.statusText;
					}

					var dt = (s.dataType || '').toLowerCase();
					var scr = /(json|script|text)/.test(dt);

					if (scr || s.textarea) {
						// see if user embedded response in textarea
						var ta = doc.getElementsByTagName('textarea')[0];

						if (ta) {
							xhr.responseText = ta.value;
							// support for XHR 'status' & 'statusText' emulation :
							xhr.status = Number(ta.getAttribute('status')) || xhr.status;
							xhr.statusText = ta.getAttribute('statusText') || xhr.statusText;

						} else if (scr) {
							// account for browsers injecting pre around json response
							var pre = doc.getElementsByTagName('pre')[0];
							var b = doc.getElementsByTagName('body')[0];

							if (pre) {
								xhr.responseText = pre.textContent ? pre.textContent : pre.innerText;
							} else if (b) {
								xhr.responseText = b.textContent ? b.textContent : b.innerText;
							}
						}

					} else if (dt === 'xml' && !xhr.responseXML && xhr.responseText) {
						xhr.responseXML = toXml(xhr.responseText);			// eslint-disable-line no-use-before-define
					}

					try {
						data = httpData(xhr, dt, s);						// eslint-disable-line no-use-before-define

					} catch (err) {
						status = 'parsererror';
						xhr.error = errMsg = (err || status);
					}

				} catch (err) {
					log('error caught: ', err);
					status = 'error';
					xhr.error = errMsg = (err || status);
				}

				if (xhr.aborted) {
					log('upload aborted');
					status = null;
				}

				if (xhr.status) { // we've set xhr.status
					status = ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) ? 'success' : 'error';
				}

				// ordering of these callbacks/triggers is odd, but that's how $.ajax does it
				if (status === 'success') {
					if (s.success) {
						s.success.call(s.context, data, 'success', xhr);
					}

					deferred.resolve(xhr.responseText, 'success', xhr);

					if (g) {
						$.event.trigger('ajaxSuccess', [xhr, s]);
					}

				} else if (status) {
					if (typeof errMsg === 'undefined') {
						errMsg = xhr.statusText;
					}
					if (s.error) {
						s.error.call(s.context, xhr, status, errMsg);
					}
					deferred.reject(xhr, 'error', errMsg);
					if (g) {
						$.event.trigger('ajaxError', [xhr, s, errMsg]);
					}
				}

				if (g) {
					$.event.trigger('ajaxComplete', [xhr, s]);
				}

				if (g && !--$.active) {
					$.event.trigger('ajaxStop');
				}

				if (s.complete) {
					s.complete.call(s.context, xhr, status);
				}

				callbackProcessed = true;
				if (s.timeout) {
					clearTimeout(timeoutHandle);
				}

				// clean up
				setTimeout(function() {
					if (!s.iframeTarget) {
						$io.remove();
					} else { // adding else to clean up existing iframe response.
						$io.attr('src', s.iframeSrc);
					}
					xhr.responseXML = null;
				}, 100);
			}

			var toXml = $.parseXML || function(s, doc) { // use parseXML if available (jQuery 1.5+)
				if (window.ActiveXObject) {
					doc = new ActiveXObject('Microsoft.XMLDOM');
					doc.async = 'false';
					doc.loadXML(s);

				} else {
					doc = (new DOMParser()).parseFromString(s, 'text/xml');
				}

				return (doc && doc.documentElement && doc.documentElement.nodeName !== 'parsererror') ? doc : null;
			};
			var parseJSON = $.parseJSON || function(s) {
				/* jslint evil:true */
				return window['eval']('(' + s + ')');			// eslint-disable-line dot-notation
			};

			var httpData = function(xhr, type, s) { // mostly lifted from jq1.4.4

				var ct = xhr.getResponseHeader('content-type') || '',
					xml = ((type === 'xml' || !type) && ct.indexOf('xml') >= 0),
					data = xml ? xhr.responseXML : xhr.responseText;

				if (xml && data.documentElement.nodeName === 'parsererror') {
					if ($.error) {
						$.error('parsererror');
					}
				}
				if (s && s.dataFilter) {
					data = s.dataFilter(data, type);
				}
				if (typeof data === 'string') {
					if ((type === 'json' || !type) && ct.indexOf('json') >= 0) {
						data = parseJSON(data);
					} else if ((type === 'script' || !type) && ct.indexOf('javascript') >= 0) {
						$.globalEval(data);
					}
				}

				return data;
			};

			return deferred;
		}
	};

	/**
	 * ajaxForm() provides a mechanism for fully automating form submission.
	 *
	 * The advantages of using this method instead of ajaxSubmit() are:
	 *
	 * 1: This method will include coordinates for <input type="image"> elements (if the element
	 *	is used to submit the form).
	 * 2. This method will include the submit element's name/value data (for the element that was
	 *	used to submit the form).
	 * 3. This method binds the submit() method to the form for you.
	 *
	 * The options argument for ajaxForm works exactly as it does for ajaxSubmit. ajaxForm merely
	 * passes the options argument along after properly binding events for submit elements and
	 * the form itself.
	 */
	$.fn.ajaxForm = function(options, data, dataType, onSuccess) {
		if (typeof options === 'string' || (options === false && arguments.length > 0)) {
			options = {
				'url'      : options,
				'data'     : data,
				'dataType' : dataType
			};

			if (typeof onSuccess === 'function') {
				options.success = onSuccess;
			}
		}

		options = options || {};
		options.delegation = options.delegation && $.isFunction($.fn.on);

		// in jQuery 1.3+ we can fix mistakes with the ready state
		if (!options.delegation && this.length === 0) {
			var o = {s: this.selector, c: this.context};

			if (!$.isReady && o.s) {
				log('DOM not ready, queuing ajaxForm');
				$(function() {
					$(o.s, o.c).ajaxForm(options);
				});

				return this;
			}

			// is your DOM ready?  http://docs.jquery.com/Tutorials:Introducing_$(document).ready()
			log('terminating; zero elements found by selector' + ($.isReady ? '' : ' (DOM not ready)'));

			return this;
		}

		if (options.delegation) {
			$(document)
				.off('submit.form-plugin', this.selector, doAjaxSubmit)
				.off('click.form-plugin', this.selector, captureSubmittingElement)
				.on('submit.form-plugin', this.selector, options, doAjaxSubmit)
				.on('click.form-plugin', this.selector, options, captureSubmittingElement);

			return this;
		}

		return this.ajaxFormUnbind()
			.on('submit.form-plugin', options, doAjaxSubmit)
			.on('click.form-plugin', options, captureSubmittingElement);
	};

	// private event handlers
	function doAjaxSubmit(e) {
		/* jshint validthis:true */
		var options = e.data;

		if (!e.isDefaultPrevented()) { // if event has been canceled, don't proceed
			e.preventDefault();
			$(e.target).closest('form').ajaxSubmit(options); // #365
		}
	}

	function captureSubmittingElement(e) {
		/* jshint validthis:true */
		var target = e.target;
		var $el = $(target);

		if (!$el.is('[type=submit],[type=image]')) {
			// is this a child element of the submit el?  (ex: a span within a button)
			var t = $el.closest('[type=submit]');

			if (t.length === 0) {
				return;
			}
			target = t[0];
		}

		var form = target.form;

		form.clk = target;

		if (target.type === 'image') {
			if (typeof e.offsetX !== 'undefined') {
				form.clk_x = e.offsetX;
				form.clk_y = e.offsetY;

			} else if (typeof $.fn.offset === 'function') {
				var offset = $el.offset();

				form.clk_x = e.pageX - offset.left;
				form.clk_y = e.pageY - offset.top;

			} else {
				form.clk_x = e.pageX - target.offsetLeft;
				form.clk_y = e.pageY - target.offsetTop;
			}
		}
		// clear form vars
		setTimeout(function() {
			form.clk = form.clk_x = form.clk_y = null;
		}, 100);
	}


	// ajaxFormUnbind unbinds the event handlers that were bound by ajaxForm
	$.fn.ajaxFormUnbind = function() {
		return this.off('submit.form-plugin click.form-plugin');
	};

	/**
	 * formToArray() gathers form element data into an array of objects that can
	 * be passed to any of the following ajax functions: $.get, $.post, or load.
	 * Each object in the array has both a 'name' and 'value' property. An example of
	 * an array for a simple login form might be:
	 *
	 * [ { name: 'username', value: 'jresig' }, { name: 'password', value: 'secret' } ]
	 *
	 * It is this array that is passed to pre-submit callback functions provided to the
	 * ajaxSubmit() and ajaxForm() methods.
	 */
	$.fn.formToArray = function(semantic, elements, filtering) {
		var a = [];

		if (this.length === 0) {
			return a;
		}

		var form = this[0];
		var formId = this.attr('id');
		var els = (semantic || typeof form.elements === 'undefined') ? form.getElementsByTagName('*') : form.elements;
		var els2;

		if (els) {
			els = $.makeArray(els); // convert to standard array
		}

		// #386; account for inputs outside the form which use the 'form' attribute
		// FinesseRus: in non-IE browsers outside fields are already included in form.elements.
		if (formId && (semantic || /(Edge|Trident)\//.test(navigator.userAgent))) {
			els2 = $(':input[form="' + formId + '"]').get(); // hat tip @thet
			if (els2.length) {
				els = (els || []).concat(els2);
			}
		}

		if (!els || !els.length) {
			return a;
		}

		if ($.isFunction(filtering)) {
			els = $.map(els, filtering);
		}

		var i, j, n, v, el, max, jmax;

		for (i = 0, max = els.length; i < max; i++) {
			el = els[i];
			n = el.name;
			if (!n || el.disabled) {
				continue;
			}

			if (semantic && form.clk && el.type === 'image') {
				// handle image inputs on the fly when semantic == true
				if (form.clk === el) {
					a.push({name: n, value: $(el).val(), type: el.type});
					a.push({name: n + '.x', value: form.clk_x}, {name: n + '.y', value: form.clk_y});
				}
				continue;
			}

			v = $.fieldValue(el, true);
			if (v && v.constructor === Array) {
				if (elements) {
					elements.push(el);
				}
				for (j = 0, jmax = v.length; j < jmax; j++) {
					a.push({name: n, value: v[j]});
				}

			} else if (feature.fileapi && el.type === 'file') {
				if (elements) {
					elements.push(el);
				}

				var files = el.files;

				if (files.length) {
					for (j = 0; j < files.length; j++) {
						a.push({name: n, value: files[j], type: el.type});
					}
				} else {
					// #180
					a.push({name: n, value: '', type: el.type});
				}

			} else if (v !== null && typeof v !== 'undefined') {
				if (elements) {
					elements.push(el);
				}
				a.push({name: n, value: v, type: el.type, required: el.required});
			}
		}

		if (!semantic && form.clk) {
			// input type=='image' are not found in elements array! handle it here
			var $input = $(form.clk), input = $input[0];

			n = input.name;

			if (n && !input.disabled && input.type === 'image') {
				a.push({name: n, value: $input.val()});
				a.push({name: n + '.x', value: form.clk_x}, {name: n + '.y', value: form.clk_y});
			}
		}

		return a;
	};

	/**
	 * Serializes form data into a 'submittable' string. This method will return a string
	 * in the format: name1=value1&amp;name2=value2
	 */
	$.fn.formSerialize = function(semantic) {
		// hand off to jQuery.param for proper encoding
		return $.param(this.formToArray(semantic));
	};

	/**
	 * Serializes all field elements in the jQuery object into a query string.
	 * This method will return a string in the format: name1=value1&amp;name2=value2
	 */
	$.fn.fieldSerialize = function(successful) {
		var a = [];

		this.each(function() {
			var n = this.name;

			if (!n) {
				return;
			}

			var v = $.fieldValue(this, successful);

			if (v && v.constructor === Array) {
				for (var i = 0, max = v.length; i < max; i++) {
					a.push({name: n, value: v[i]});
				}

			} else if (v !== null && typeof v !== 'undefined') {
				a.push({name: this.name, value: v});
			}
		});

		// hand off to jQuery.param for proper encoding
		return $.param(a);
	};

	/**
	 * Returns the value(s) of the element in the matched set. For example, consider the following form:
	 *
	 *	<form><fieldset>
	 *		<input name="A" type="text">
	 *		<input name="A" type="text">
	 *		<input name="B" type="checkbox" value="B1">
	 *		<input name="B" type="checkbox" value="B2">
	 *		<input name="C" type="radio" value="C1">
	 *		<input name="C" type="radio" value="C2">
	 *	</fieldset></form>
	 *
	 *	var v = $('input[type=text]').fieldValue();
	 *	// if no values are entered into the text inputs
	 *	v === ['','']
	 *	// if values entered into the text inputs are 'foo' and 'bar'
	 *	v === ['foo','bar']
	 *
	 *	var v = $('input[type=checkbox]').fieldValue();
	 *	// if neither checkbox is checked
	 *	v === undefined
	 *	// if both checkboxes are checked
	 *	v === ['B1', 'B2']
	 *
	 *	var v = $('input[type=radio]').fieldValue();
	 *	// if neither radio is checked
	 *	v === undefined
	 *	// if first radio is checked
	 *	v === ['C1']
	 *
	 * The successful argument controls whether or not the field element must be 'successful'
	 * (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
	 * The default value of the successful argument is true. If this value is false the value(s)
	 * for each element is returned.
	 *
	 * Note: This method *always* returns an array. If no valid value can be determined the
	 *	array will be empty, otherwise it will contain one or more values.
	 */
	$.fn.fieldValue = function(successful) {
		for (var val = [], i = 0, max = this.length; i < max; i++) {
			var el = this[i];
			var v = $.fieldValue(el, successful);

			if (v === null || typeof v === 'undefined' || (v.constructor === Array && !v.length)) {
				continue;
			}

			if (v.constructor === Array) {
				$.merge(val, v);
			} else {
				val.push(v);
			}
		}

		return val;
	};

	/**
	 * Returns the value of the field element.
	 */
	$.fieldValue = function(el, successful) {
		var n = el.name, t = el.type, tag = el.tagName.toLowerCase();

		if (typeof successful === 'undefined') {
			successful = true;
		}

		/* eslint-disable no-mixed-operators */
		if (successful && (!n || el.disabled || t === 'reset' || t === 'button' ||
			(t === 'checkbox' || t === 'radio') && !el.checked ||
			(t === 'submit' || t === 'image') && el.form && el.form.clk !== el ||
			tag === 'select' && el.selectedIndex === -1)) {
		/* eslint-enable no-mixed-operators */
			return null;
		}

		if (tag === 'select') {
			var index = el.selectedIndex;

			if (index < 0) {
				return null;
			}

			var a = [], ops = el.options;
			var one = (t === 'select-one');
			var max = (one ? index + 1 : ops.length);

			for (var i = (one ? index : 0); i < max; i++) {
				var op = ops[i];

				if (op.selected && !op.disabled) {
					var v = op.value;

					if (!v) { // extra pain for IE...
						v = (op.attributes && op.attributes.value && !(op.attributes.value.specified)) ? op.text : op.value;
					}

					if (one) {
						return v;
					}

					a.push(v);
				}
			}

			return a;
		}

		return $(el).val().replace(rCRLF, '\r\n');
	};

	/**
	 * Clears the form data. Takes the following actions on the form's input fields:
	 *  - input text fields will have their 'value' property set to the empty string
	 *  - select elements will have their 'selectedIndex' property set to -1
	 *  - checkbox and radio inputs will have their 'checked' property set to false
	 *  - inputs of type submit, button, reset, and hidden will *not* be effected
	 *  - button elements will *not* be effected
	 */
	$.fn.clearForm = function(includeHidden) {
		return this.each(function() {
			$('input,select,textarea', this).clearFields(includeHidden);
		});
	};

	/**
	 * Clears the selected form elements.
	 */
	$.fn.clearFields = $.fn.clearInputs = function(includeHidden) {
		var re = /^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i; // 'hidden' is not in this list

		return this.each(function() {
			var t = this.type, tag = this.tagName.toLowerCase();

			if (re.test(t) || tag === 'textarea') {
				this.value = '';

			} else if (t === 'checkbox' || t === 'radio') {
				this.checked = false;

			} else if (tag === 'select') {
				this.selectedIndex = -1;

			} else if (t === 'file') {
				if (/MSIE/.test(navigator.userAgent)) {
					$(this).replaceWith($(this).clone(true));
				} else {
					$(this).val('');
				}

			} else if (includeHidden) {
				// includeHidden can be the value true, or it can be a selector string
				// indicating a special test; for example:
				// $('#myForm').clearForm('.special:hidden')
				// the above would clean hidden inputs that have the class of 'special'
				if ((includeHidden === true && /hidden/.test(t)) ||
					(typeof includeHidden === 'string' && $(this).is(includeHidden))) {
					this.value = '';
				}
			}
		});
	};


	/**
	 * Resets the form data or individual elements. Takes the following actions
	 * on the selected tags:
	 * - all fields within form elements will be reset to their original value
	 * - input / textarea / select fields will be reset to their original value
	 * - option / optgroup fields (for multi-selects) will defaulted individually
	 * - non-multiple options will find the right select to default
	 * - label elements will be searched against its 'for' attribute
	 * - all others will be searched for appropriate children to default
	 */
	$.fn.resetForm = function() {
		return this.each(function() {
			var el = $(this);
			var tag = this.tagName.toLowerCase();

			switch (tag) {
			case 'input':
				this.checked = this.defaultChecked;
					// fall through

			case 'textarea':
				this.value = this.defaultValue;

				return true;

			case 'option':
			case 'optgroup':
				var select = el.parents('select');

				if (select.length && select[0].multiple) {
					if (tag === 'option') {
						this.selected = this.defaultSelected;
					} else {
						el.find('option').resetForm();
					}
				} else {
					select.resetForm();
				}

				return true;

			case 'select':
				el.find('option').each(function(i) {				// eslint-disable-line consistent-return
					this.selected = this.defaultSelected;
					if (this.defaultSelected && !el[0].multiple) {
						el[0].selectedIndex = i;

						return false;
					}
				});

				return true;

			case 'label':
				var forEl = $(el.attr('for'));
				var list = el.find('input,select,textarea');

				if (forEl[0]) {
					list.unshift(forEl[0]);
				}

				list.resetForm();

				return true;

			case 'form':
					// guard against an input with the name of 'reset'
					// note that IE reports the reset function as an 'object'
				if (typeof this.reset === 'function' || (typeof this.reset === 'object' && !this.reset.nodeType)) {
					this.reset();
				}

				return true;

			default:
				el.find('form,input,label,select,textarea').resetForm();

				return true;
			}
		});
	};

	/**
	 * Enables or disables any matching elements.
	 */
	$.fn.enable = function(b) {
		if (typeof b === 'undefined') {
			b = true;
		}

		return this.each(function() {
			this.disabled = !b;
		});
	};

	/**
	 * Checks/unchecks any matching checkboxes or radio buttons and
	 * selects/deselects and matching option elements.
	 */
	$.fn.selected = function(select) {
		if (typeof select === 'undefined') {
			select = true;
		}

		return this.each(function() {
			var t = this.type;

			if (t === 'checkbox' || t === 'radio') {
				this.checked = select;

			} else if (this.tagName.toLowerCase() === 'option') {
				var $sel = $(this).parent('select');

				if (select && $sel[0] && $sel[0].type === 'select-one') {
					// deselect all other options
					$sel.find('option').selected(false);
				}

				this.selected = select;
			}
		});
	};

	// expose debug var
	$.fn.ajaxSubmit.debug = false;

	// helper fn for console logging
	function log() {
		if (!$.fn.ajaxSubmit.debug) {
			return;
		}

		var msg = '[jquery.form] ' + Array.prototype.join.call(arguments, '');

		if (window.console && window.console.log) {
			window.console.log(msg);

		} else if (window.opera && window.opera.postError) {
			window.opera.postError(msg);
		}
	}
}));

/*! Picturefill - v2.3.1 - 2015-04-09
* http://scottjehl.github.io/picturefill
* Copyright (c) 2015 https://github.com/scottjehl/picturefill/blob/master/Authors.txt; Licensed MIT */
window.matchMedia||(window.matchMedia=function(){"use strict";var a=window.styleMedia||window.media;if(!a){var b=document.createElement("style"),c=document.getElementsByTagName("script")[0],d=null;b.type="text/css",b.id="matchmediajs-test",c.parentNode.insertBefore(b,c),d="getComputedStyle"in window&&window.getComputedStyle(b,null)||b.currentStyle,a={matchMedium:function(a){var c="@media "+a+"{ #matchmediajs-test { width: 1px; } }";return b.styleSheet?b.styleSheet.cssText=c:b.textContent=c,"1px"===d.width}}}return function(b){return{matches:a.matchMedium(b||"all"),media:b||"all"}}}()),function(a,b,c){"use strict";function d(b){"object"==typeof module&&"object"==typeof module.exports?module.exports=b:"function"==typeof define&&define.amd&&define("picturefill",function(){return b}),"object"==typeof a&&(a.picturefill=b)}function e(a){var b,c,d,e,f,i=a||{};b=i.elements||g.getAllElements();for(var j=0,k=b.length;k>j;j++)if(c=b[j],d=c.parentNode,e=void 0,f=void 0,"IMG"===c.nodeName.toUpperCase()&&(c[g.ns]||(c[g.ns]={}),i.reevaluate||!c[g.ns].evaluated)){if(d&&"PICTURE"===d.nodeName.toUpperCase()){if(g.removeVideoShim(d),e=g.getMatch(c,d),e===!1)continue}else e=void 0;(d&&"PICTURE"===d.nodeName.toUpperCase()||!g.sizesSupported&&c.srcset&&h.test(c.srcset))&&g.dodgeSrcset(c),e?(f=g.processSourceSet(e),g.applyBestCandidate(f,c)):(f=g.processSourceSet(c),(void 0===c.srcset||c[g.ns].srcset)&&g.applyBestCandidate(f,c)),c[g.ns].evaluated=!0}}function f(){function c(){clearTimeout(d),d=setTimeout(h,60)}g.initTypeDetects(),e();var d,f=setInterval(function(){return e(),/^loaded|^i|^c/.test(b.readyState)?void clearInterval(f):void 0},250),h=function(){e({reevaluate:!0})};a.addEventListener?a.addEventListener("resize",c,!1):a.attachEvent&&a.attachEvent("onresize",c)}if(a.HTMLPictureElement)return void d(function(){});b.createElement("picture");var g=a.picturefill||{},h=/\s+\+?\d+(e\d+)?w/;g.ns="picturefill",function(){g.srcsetSupported="srcset"in c,g.sizesSupported="sizes"in c,g.curSrcSupported="currentSrc"in c}(),g.trim=function(a){return a.trim?a.trim():a.replace(/^\s+|\s+$/g,"")},g.makeUrl=function(){var a=b.createElement("a");return function(b){return a.href=b,a.href}}(),g.restrictsMixedContent=function(){return"https:"===a.location.protocol},g.matchesMedia=function(b){return a.matchMedia&&a.matchMedia(b).matches},g.getDpr=function(){return a.devicePixelRatio||1},g.getWidthFromLength=function(a){var c;if(!a||a.indexOf("%")>-1!=!1||!(parseFloat(a)>0||a.indexOf("calc(")>-1))return!1;a=a.replace("vw","%"),g.lengthEl||(g.lengthEl=b.createElement("div"),g.lengthEl.style.cssText="border:0;display:block;font-size:1em;left:0;margin:0;padding:0;position:absolute;visibility:hidden",g.lengthEl.className="helper-from-picturefill-js"),g.lengthEl.style.width="0px";try{g.lengthEl.style.width=a}catch(d){}return b.body.appendChild(g.lengthEl),c=g.lengthEl.offsetWidth,0>=c&&(c=!1),b.body.removeChild(g.lengthEl),c},g.detectTypeSupport=function(b,c){var d=new a.Image;return d.onerror=function(){g.types[b]=!1,e()},d.onload=function(){g.types[b]=1===d.width,e()},d.src=c,"pending"},g.types=g.types||{},g.initTypeDetects=function(){g.types["image/jpeg"]=!0,g.types["image/gif"]=!0,g.types["image/png"]=!0,g.types["image/svg+xml"]=b.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image","1.1"),g.types["image/webp"]=g.detectTypeSupport("image/webp","data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=")},g.verifyTypeSupport=function(a){var b=a.getAttribute("type");if(null===b||""===b)return!0;var c=g.types[b];return"string"==typeof c&&"pending"!==c?(g.types[b]=g.detectTypeSupport(b,c),"pending"):"function"==typeof c?(c(),"pending"):c},g.parseSize=function(a){var b=/(\([^)]+\))?\s*(.+)/g.exec(a);return{media:b&&b[1],length:b&&b[2]}},g.findWidthFromSourceSize=function(c){for(var d,e=g.trim(c).split(/\s*,\s*/),f=0,h=e.length;h>f;f++){var i=e[f],j=g.parseSize(i),k=j.length,l=j.media;if(k&&(!l||g.matchesMedia(l))&&(d=g.getWidthFromLength(k)))break}return d||Math.max(a.innerWidth||0,b.documentElement.clientWidth)},g.parseSrcset=function(a){for(var b=[];""!==a;){a=a.replace(/^\s+/g,"");var c,d=a.search(/\s/g),e=null;if(-1!==d){c=a.slice(0,d);var f=c.slice(-1);if((","===f||""===c)&&(c=c.replace(/,+$/,""),e=""),a=a.slice(d+1),null===e){var g=a.indexOf(",");-1!==g?(e=a.slice(0,g),a=a.slice(g+1)):(e=a,a="")}}else c=a,a="";(c||e)&&b.push({url:c,descriptor:e})}return b},g.parseDescriptor=function(a,b){var c,d=b||"100vw",e=a&&a.replace(/(^\s+|\s+$)/g,""),f=g.findWidthFromSourceSize(d);if(e)for(var h=e.split(" "),i=h.length-1;i>=0;i--){var j=h[i],k=j&&j.slice(j.length-1);if("h"!==k&&"w"!==k||g.sizesSupported){if("x"===k){var l=j&&parseFloat(j,10);c=l&&!isNaN(l)?l:1}}else c=parseFloat(parseInt(j,10)/f)}return c||1},g.getCandidatesFromSourceSet=function(a,b){for(var c=g.parseSrcset(a),d=[],e=0,f=c.length;f>e;e++){var h=c[e];d.push({url:h.url,resolution:g.parseDescriptor(h.descriptor,b)})}return d},g.dodgeSrcset=function(a){a.srcset&&(a[g.ns].srcset=a.srcset,a.srcset="",a.setAttribute("data-pfsrcset",a[g.ns].srcset))},g.processSourceSet=function(a){var b=a.getAttribute("srcset"),c=a.getAttribute("sizes"),d=[];return"IMG"===a.nodeName.toUpperCase()&&a[g.ns]&&a[g.ns].srcset&&(b=a[g.ns].srcset),b&&(d=g.getCandidatesFromSourceSet(b,c)),d},g.backfaceVisibilityFix=function(a){var b=a.style||{},c="webkitBackfaceVisibility"in b,d=b.zoom;c&&(b.zoom=".999",c=a.offsetWidth,b.zoom=d)},g.setIntrinsicSize=function(){var c={},d=function(a,b,c){b&&a.setAttribute("width",parseInt(b/c,10))};return function(e,f){var h;e[g.ns]&&!a.pfStopIntrinsicSize&&(void 0===e[g.ns].dims&&(e[g.ns].dims=e.getAttribute("width")||e.getAttribute("height")),e[g.ns].dims||(f.url in c?d(e,c[f.url],f.resolution):(h=b.createElement("img"),h.onload=function(){if(c[f.url]=h.width,!c[f.url])try{b.body.appendChild(h),c[f.url]=h.width||h.offsetWidth,b.body.removeChild(h)}catch(a){}e.src===f.url&&d(e,c[f.url],f.resolution),e=null,h.onload=null,h=null},h.src=f.url)))}}(),g.applyBestCandidate=function(a,b){var c,d,e;a.sort(g.ascendingSort),d=a.length,e=a[d-1];for(var f=0;d>f;f++)if(c=a[f],c.resolution>=g.getDpr()){e=c;break}e&&(e.url=g.makeUrl(e.url),b.src!==e.url&&(g.restrictsMixedContent()&&"http:"===e.url.substr(0,"http:".length).toLowerCase()?void 0!==window.console&&console.warn("Blocked mixed content image "+e.url):(b.src=e.url,g.curSrcSupported||(b.currentSrc=b.src),g.backfaceVisibilityFix(b))),g.setIntrinsicSize(b,e))},g.ascendingSort=function(a,b){return a.resolution-b.resolution},g.removeVideoShim=function(a){var b=a.getElementsByTagName("video");if(b.length){for(var c=b[0],d=c.getElementsByTagName("source");d.length;)a.insertBefore(d[0],c);c.parentNode.removeChild(c)}},g.getAllElements=function(){for(var a=[],c=b.getElementsByTagName("img"),d=0,e=c.length;e>d;d++){var f=c[d];("PICTURE"===f.parentNode.nodeName.toUpperCase()||null!==f.getAttribute("srcset")||f[g.ns]&&null!==f[g.ns].srcset)&&a.push(f)}return a},g.getMatch=function(a,b){for(var c,d=b.childNodes,e=0,f=d.length;f>e;e++){var h=d[e];if(1===h.nodeType){if(h===a)return c;if("SOURCE"===h.nodeName.toUpperCase()){null!==h.getAttribute("src")&&void 0!==typeof console&&console.warn("The `src` attribute is invalid on `picture` `source` element; instead, use `srcset`.");var i=h.getAttribute("media");if(h.getAttribute("srcset")&&(!i||g.matchesMedia(i))){var j=g.verifyTypeSupport(h);if(j===!0){c=h;break}if("pending"===j)return!1}}}}return c},f(),e._=g,d(e)}(window,window.document,new window.Image);
(function(window, factory) {
	var lazySizes = factory(window, window.document);
	window.lazySizes = lazySizes;
	if(typeof module == 'object' && module.exports){
		module.exports = lazySizes;
	}
}(window, function l(window, document) {
	'use strict';
	/*jshint eqnull:true */
	if(!document.getElementsByClassName){return;}

	var lazySizesConfig;

	var docElem = document.documentElement;

	var supportPicture = window.HTMLPictureElement && ('sizes' in document.createElement('img'));

	var _addEventListener = 'addEventListener';

	var _getAttribute = 'getAttribute';

	var addEventListener = window[_addEventListener];

	var setTimeout = window.setTimeout;

	var rAF = window.requestAnimationFrame || setTimeout;

	var regPicture = /^picture$/i;

	var loadEvents = ['load', 'error', 'lazyincluded', '_lazyloaded'];

	var regClassCache = {};

	var forEach = Array.prototype.forEach;

	var hasClass = function(ele, cls) {
		if(!regClassCache[cls]){
			regClassCache[cls] = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		}
		return regClassCache[cls].test(ele[_getAttribute]('class') || '') && regClassCache[cls];
	};

	var addClass = function(ele, cls) {
		if (!hasClass(ele, cls)){
			ele.setAttribute('class', (ele[_getAttribute]('class') || '').trim() + ' ' + cls);
		}
	};

	var removeClass = function(ele, cls) {
		var reg;
		if ((reg = hasClass(ele,cls))) {
			ele.setAttribute('class', (ele[_getAttribute]('class') || '').replace(reg, ' '));
		}
	};

	var addRemoveLoadEvents = function(dom, fn, add){
		var action = add ? _addEventListener : 'removeEventListener';
		if(add){
			addRemoveLoadEvents(dom, fn);
		}
		loadEvents.forEach(function(evt){
			dom[action](evt, fn);
		});
	};

	var triggerEvent = function(elem, name, detail, noBubbles, noCancelable){
		var event = document.createEvent('CustomEvent');

		event.initCustomEvent(name, !noBubbles, !noCancelable, detail || {});

		elem.dispatchEvent(event);
		return event;
	};

	var updatePolyfill = function (el, full){
		var polyfill;
		if( !supportPicture && ( polyfill = (window.picturefill || lazySizesConfig.pf) ) ){
			polyfill({reevaluate: true, elements: [el]});
		} else if(full && full.src){
			el.src = full.src;
		}
	};

	var getCSS = function (elem, style){
		return (getComputedStyle(elem, null) || {})[style];
	};

	var getWidth = function(elem, parent, width){
		width = width || elem.offsetWidth;

		while(width < lazySizesConfig.minSize && parent && !elem._lazysizesWidth){
			width =  parent.offsetWidth;
			parent = parent.parentNode;
		}

		return width;
	};

	var throttle = function(fn){
		var running;
		var lastTime = 0;
		var Date = window.Date;
		var run = function(){
			running = false;
			lastTime = Date.now();
			fn();
		};
		var afterAF = function(){
			setTimeout(run);
		};
		var getAF = function(){
			rAF(afterAF);
		};

		return function(){
			if(running){
				return;
			}
			var delay = 125 - (Date.now() - lastTime);

			running =  true;

			if(delay < 6){
				delay = 6;
			}
			setTimeout(getAF, delay);
		};
	};

	/*
	 var throttle = function(fn){
	 var running;
	 var lastTime = 0;
	 var Date = window.Date;
	 var requestIdleCallback = window.requestIdleCallback;
	 var gDelay = 125;
	 var dTimeout = 999;
	 var timeout = dTimeout;
	 var fastCallThreshold = 0;
	 var run = function(){
	 running = false;
	 lastTime = Date.now();
	 fn();
	 };
	 var afterAF = function(){
	 setTimeout(run);
	 };
	 var getAF = function(){
	 rAF(afterAF);
	 };

	 if(requestIdleCallback){
	 gDelay = 66;
	 fastCallThreshold = 22;
	 getAF = function(){
	 requestIdleCallback(run, {timeout: timeout});
	 if(timeout !== dTimeout){
	 timeout = dTimeout;
	 }
	 };
	 }

	 return function(isPriority){
	 var delay;
	 if((isPriority = isPriority === true)){
	 timeout = 40;
	 }

	 if(running){
	 return;
	 }

	 running =  true;

	 if(isPriority || (delay = gDelay - (Date.now() - lastTime)) < fastCallThreshold){
	 getAF();
	 } else {
	 setTimeout(getAF, delay);
	 }
	 };
	 };
	 */

	var loader = (function(){
		var lazyloadElems, preloadElems, isCompleted, resetPreloadingTimer, loadMode, started;

		var eLvW, elvH, eLtop, eLleft, eLright, eLbottom;

		var defaultExpand, preloadExpand, hFac;

		var regImg = /^img$/i;
		var regIframe = /^iframe$/i;

		var supportScroll = ('onscroll' in window) && !(/glebot/.test(navigator.userAgent));

		var shrinkExpand = 0;
		var currentExpand = 0;

		var isLoading = 0;
		var lowRuns = 0;

		var resetPreloading = function(e){
			isLoading--;
			if(e && e.target){
				addRemoveLoadEvents(e.target, resetPreloading);
			}

			if(!e || isLoading < 0 || !e.target){
				isLoading = 0;
			}
		};

		var isNestedVisible = function(elem, elemExpand){
			var outerRect;
			var parent = elem;
			var visible = getCSS(document.body, 'visibility') == 'hidden' || getCSS(elem, 'visibility') != 'hidden';

			eLtop -= elemExpand;
			eLbottom += elemExpand;
			eLleft -= elemExpand;
			eLright += elemExpand;

			while(visible && (parent = parent.offsetParent) && parent != document.body && parent != docElem){
				visible = ((getCSS(parent, 'opacity') || 1) > 0);

				if(visible && getCSS(parent, 'overflow') != 'visible'){
					outerRect = parent.getBoundingClientRect();
					visible = eLright > outerRect.left &&
						eLleft < outerRect.right &&
						eLbottom > outerRect.top - 1 &&
						eLtop < outerRect.bottom + 1
					;
				}
			}

			return visible;
		};

		var checkElements = function() {
			var eLlen, i, rect, autoLoadElem, loadedSomething, elemExpand, elemNegativeExpand, elemExpandVal, beforeExpandVal;

			if((loadMode = lazySizesConfig.loadMode) && isLoading < 8 && (eLlen = lazyloadElems.length)){

				i = 0;

				lowRuns++;

				if(preloadExpand == null){
					if(!('expand' in lazySizesConfig)){
						lazySizesConfig.expand = docElem.clientHeight > 600 ? docElem.clientWidth > 600 ? 550 : 410 : 359;
					}

					defaultExpand = lazySizesConfig.expand;
					preloadExpand = defaultExpand * lazySizesConfig.expFactor;
				}

				if(currentExpand < preloadExpand && isLoading < 1 && lowRuns > 3 && loadMode > 2){
					currentExpand = preloadExpand;
					lowRuns = 0;
				} else if(loadMode > 1 && lowRuns > 2 && isLoading < 6){
					currentExpand = defaultExpand;
				} else {
					currentExpand = shrinkExpand;
				}

				for(; i < eLlen; i++){

					if(!lazyloadElems[i] || lazyloadElems[i]._lazyRace){continue;}

					if(!supportScroll){unveilElement(lazyloadElems[i]);continue;}

					if(!(elemExpandVal = lazyloadElems[i][_getAttribute]('data-expand')) || !(elemExpand = elemExpandVal * 1)){
						elemExpand = currentExpand;
					}

					if(beforeExpandVal !== elemExpand){
						eLvW = innerWidth + (elemExpand * hFac);
						elvH = innerHeight + elemExpand;
						elemNegativeExpand = elemExpand * -1;
						beforeExpandVal = elemExpand;
					}

					rect = lazyloadElems[i].getBoundingClientRect();

					if ((eLbottom = rect.bottom) >= elemNegativeExpand &&
						(eLtop = rect.top) <= elvH &&
						(eLright = rect.right) >= elemNegativeExpand * hFac &&
						(eLleft = rect.left) <= eLvW &&
						(eLbottom || eLright || eLleft || eLtop) &&
						((isCompleted && isLoading < 3 && !elemExpandVal && (loadMode < 3 || lowRuns < 4)) || isNestedVisible(lazyloadElems[i], elemExpand))){
						unveilElement(lazyloadElems[i]);
						loadedSomething = true;
						if(isLoading > 9){break;}
					} else if(!loadedSomething && isCompleted && !autoLoadElem &&
						isLoading < 4 && lowRuns < 4 && loadMode > 2 &&
						(preloadElems[0] || lazySizesConfig.preloadAfterLoad) &&
						(preloadElems[0] || (!elemExpandVal && ((eLbottom || eLright || eLleft || eLtop) || lazyloadElems[i][_getAttribute](lazySizesConfig.sizesAttr) != 'auto')))){
						autoLoadElem = preloadElems[0] || lazyloadElems[i];
					}
				}

				if(autoLoadElem && !loadedSomething){
					unveilElement(autoLoadElem);
				}
			}
		};

		var throttledCheckElements = throttle(checkElements);

		var switchLoadingClass = function(e){
			addClass(e.target, lazySizesConfig.loadedClass);
			removeClass(e.target, lazySizesConfig.loadingClass);
			addRemoveLoadEvents(e.target, rafSwitchLoadingClass);
		};
		var rafSwitchLoadingClass = function(e){
			e = {target: e.target};
			rAF(function(){
				switchLoadingClass(e);
			});
		};

		var changeIframeSrc = function(elem, src){
			try {
				elem.contentWindow.location.replace(src);
			} catch(e){
				elem.src = src;
			}
		};

		var handleSources = function(source){
			var customMedia, parent;

			var sourceSrcset = source[_getAttribute](lazySizesConfig.srcsetAttr);

			if( (customMedia = lazySizesConfig.customMedia[source[_getAttribute]('data-media') || source[_getAttribute]('media')]) ){
				source.setAttribute('media', customMedia);
			}

			if(sourceSrcset){
				source.setAttribute('srcset', sourceSrcset);
			}

			//https://bugzilla.mozilla.org/show_bug.cgi?id=1170572
			if(customMedia){
				parent = source.parentNode;
				parent.insertBefore(source.cloneNode(), source);
				parent.removeChild(source);
			}
		};

		var rafBatch = (function(){
			var isRunning;
			var batch = [];
			var runBatch = function(){
				while(batch.length){
					(batch.shift())();
				}
				isRunning = false;
			};
			var add = function(fn){
				batch.push(fn);
				if(!isRunning){
					isRunning = true;
					rAF(runBatch);
				}
			};

			return {
				add: add,
				run: runBatch
			};
		})();

		var unveilElement = function (elem){
			var src, srcset, parent, isPicture, event, firesLoad, width;

			var isImg = regImg.test(elem.nodeName);

			//allow using sizes="auto", but don't use. it's invalid. Use data-sizes="auto" or a valid value for sizes instead (i.e.: sizes="80vw")
			var sizes = isImg && (elem[_getAttribute](lazySizesConfig.sizesAttr) || elem[_getAttribute]('sizes'));
			var isAuto = sizes == 'auto';

			if( (isAuto || !isCompleted) && isImg && (elem.src || elem.srcset) && !elem.complete && !hasClass(elem, lazySizesConfig.errorClass)){return;}

			if(isAuto){
				width = elem.offsetWidth;
			}

			elem._lazyRace = true;
			isLoading++;

			if(lazySizesConfig.rC){
				width = lazySizesConfig.rC(elem, width) || width;
			}

			rafBatch.add(function lazyUnveil(){

				if(!(event = triggerEvent(elem, 'lazybeforeunveil')).defaultPrevented){

					if(sizes){
						if(isAuto){
							autoSizer.updateElem(elem, true, width);
							addClass(elem, lazySizesConfig.autosizesClass);
						} else {
							elem.setAttribute('sizes', sizes);
						}
					}

					srcset = elem[_getAttribute](lazySizesConfig.srcsetAttr);
					src = elem[_getAttribute](lazySizesConfig.srcAttr);

					if(isImg) {
						parent = elem.parentNode;
						isPicture = parent && regPicture.test(parent.nodeName || '');
					}

					firesLoad = event.detail.firesLoad || (('src' in elem) && (srcset || src || isPicture));

					event = {target: elem};

					if(firesLoad){
						addRemoveLoadEvents(elem, resetPreloading, true);
						clearTimeout(resetPreloadingTimer);
						resetPreloadingTimer = setTimeout(resetPreloading, 2500);

						addClass(elem, lazySizesConfig.loadingClass);
						addRemoveLoadEvents(elem, rafSwitchLoadingClass, true);
					}

					if(isPicture){
						forEach.call(parent.getElementsByTagName('source'), handleSources);
					}

					if(srcset){
						elem.setAttribute('srcset', srcset);
					} else if(src && !isPicture){
						if(regIframe.test(elem.nodeName)){
							changeIframeSrc(elem, src);
						} else {
							elem.src = src;
						}
					}

					if(srcset || isPicture){
						updatePolyfill(elem, {src: src});
					}
				}

				rAF(function(){
					if(elem._lazyRace){
						delete elem._lazyRace;
					}
					removeClass(elem, lazySizesConfig.lazyClass);

					if( !firesLoad || elem.complete ){
						if(firesLoad){
							resetPreloading(event);
						} else {
							isLoading--;
						}
						switchLoadingClass(event);
					}
				});
			});
		};

		var onload = function(){
			if(isCompleted){return;}
			if(Date.now() - started < 999){
				setTimeout(onload, 999);
				return;
			}
			var scrollTimer;
			var afterScroll = function(){
				lazySizesConfig.loadMode = 3;
				throttledCheckElements();
			};

			isCompleted = true;

			lazySizesConfig.loadMode = 3;

			if(document.hidden){
				checkElements();
				rafBatch.run();
			} else {
				throttledCheckElements();
			}

			addEventListener('scroll', function(){
				if(lazySizesConfig.loadMode == 3){
					lazySizesConfig.loadMode = 2;
				}
				clearTimeout(scrollTimer);
				scrollTimer = setTimeout(afterScroll, 99);
			}, true);
		};

		/*
		 var onload = function(){
		 var scrollTimer, timestamp;
		 var wait = 99;
		 var afterScroll = function(){
		 var last = (Date.now()) - timestamp;

		 // if the latest call was less that the wait period ago
		 // then we reset the timeout to wait for the difference
		 if (last < wait) {
		 scrollTimer = setTimeout(afterScroll, wait - last);

		 // or if not we can null out the timer and run the latest
		 } else {
		 scrollTimer = null;
		 lazySizesConfig.loadMode = 3;
		 throttledCheckElements();
		 }
		 };

		 isCompleted = true;
		 lowRuns += 8;

		 lazySizesConfig.loadMode = 3;

		 addEventListener('scroll', function(){
		 timestamp = Date.now();
		 if(!scrollTimer){
		 lazySizesConfig.loadMode = 2;
		 scrollTimer = setTimeout(afterScroll, wait);
		 }
		 }, true);
		 };
		 */

		return {
			_: function(){
				started = Date.now();

				lazyloadElems = document.getElementsByClassName(lazySizesConfig.lazyClass);
				preloadElems = document.getElementsByClassName(lazySizesConfig.lazyClass + ' ' + lazySizesConfig.preloadClass);
				hFac = lazySizesConfig.hFac;

				addEventListener('scroll', throttledCheckElements, true);

				addEventListener('resize', throttledCheckElements, true);

				if(window.MutationObserver){
					new MutationObserver( throttledCheckElements ).observe( docElem, {childList: true, subtree: true, attributes: true} );
				} else {
					docElem[_addEventListener]('DOMNodeInserted', throttledCheckElements, true);
					docElem[_addEventListener]('DOMAttrModified', throttledCheckElements, true);
					setInterval(throttledCheckElements, 999);
				}

				addEventListener('hashchange', throttledCheckElements, true);

				//, 'fullscreenchange'
				['focus', 'mouseover', 'click', 'load', 'transitionend', 'animationend', 'webkitAnimationEnd'].forEach(function(name){
					document[_addEventListener](name, throttledCheckElements, true);
				});

				if((/d$|^c/.test(document.readyState))){
					onload();
				} else {
					addEventListener('load', onload);
					document[_addEventListener]('DOMContentLoaded', throttledCheckElements);
					setTimeout(onload, 20000);
				}

				throttledCheckElements(lazyloadElems.length > 0);
			},
			checkElems: throttledCheckElements,
			unveil: unveilElement
		};
	})();


	var autoSizer = (function(){
		var autosizesElems;

		var sizeElement = function (elem, dataAttr, width){
			var sources, i, len, event;
			var parent = elem.parentNode;

			if(parent){
				width = getWidth(elem, parent, width);
				event = triggerEvent(elem, 'lazybeforesizes', {width: width, dataAttr: !!dataAttr});

				if(!event.defaultPrevented){
					width = event.detail.width;

					if(width && width !== elem._lazysizesWidth){
						elem._lazysizesWidth = width;
						width += 'px';
						elem.setAttribute('sizes', width);

						if(regPicture.test(parent.nodeName || '')){
							sources = parent.getElementsByTagName('source');
							for(i = 0, len = sources.length; i < len; i++){
								sources[i].setAttribute('sizes', width);
							}
						}

						if(!event.detail.dataAttr){
							updatePolyfill(elem, event.detail);
						}
					}
				}
			}
		};

		var updateElementsSizes = function(){
			var i;
			var len = autosizesElems.length;
			if(len){
				i = 0;

				for(; i < len; i++){
					sizeElement(autosizesElems[i]);
				}
			}
		};

		var throttledUpdateElementsSizes = throttle(updateElementsSizes);

		return {
			_: function(){
				autosizesElems = document.getElementsByClassName(lazySizesConfig.autosizesClass);
				addEventListener('resize', throttledUpdateElementsSizes);
			},
			checkElems: throttledUpdateElementsSizes,
			updateElem: sizeElement
		};
	})();

	var init = function(){
		if(!init.i){
			init.i = true;
			autoSizer._();
			loader._();
		}
	};

	(function(){
		var prop;

		var lazySizesDefaults = {
			lazyClass: 'lazyload',
			loadedClass: 'lazyloaded',
			loadingClass: 'lazyloading',
			preloadClass: 'lazypreload',
			errorClass: 'lazyerror',
			//strictClass: 'lazystrict',
			autosizesClass: 'lazyautosizes',
			srcAttr: 'data-src',
			srcsetAttr: 'data-srcset',
			sizesAttr: 'data-sizes',
			//preloadAfterLoad: false,
			minSize: 40,
			customMedia: {},
			init: true,
			expFactor: 1.7,
			hFac: 0.8,
			loadMode: 2
		};

		lazySizesConfig = window.lazySizesConfig || window.lazysizesConfig || {};

		for(prop in lazySizesDefaults){
			if(!(prop in lazySizesConfig)){
				lazySizesConfig[prop] = lazySizesDefaults[prop];
			}
		}

		window.lazySizesConfig = lazySizesConfig;

		setTimeout(function(){
			if(lazySizesConfig.init){
				init();
			}
		});
	})();

	return {
		cfg: lazySizesConfig,
		autoSizer: autoSizer,
		loader: loader,
		init: init,
		uP: updatePolyfill,
		aC: addClass,
		rC: removeClass,
		hC: hasClass,
		fire: triggerEvent,
		gW: getWidth
	};
}
));

// Keep js running for browsers without a console
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];
        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Cleave"] = factory();
	else
		root["Cleave"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	/**
	 * Construct a new Cleave instance by passing the configuration object
	 *
	 * @param {String | HTMLElement} element
	 * @param {Object} opts
	 */
	var Cleave = function (element, opts) {
	    var owner = this;
	    var hasMultipleElements = false;

	    if (typeof element === 'string') {
	        owner.element = document.querySelector(element);
	        hasMultipleElements = document.querySelectorAll(element).length > 1;
	    } else {
	      if (typeof element.length !== 'undefined' && element.length > 0) {
	        owner.element = element[0];
	        hasMultipleElements = element.length > 1;
	      } else {
	        owner.element = element;
	      }
	    }

	    if (!owner.element) {
	        throw new Error('[cleave.js] Please check the element');
	    }

	    if (hasMultipleElements) {
	      try {
	        // eslint-disable-next-line
	        console.warn('[cleave.js] Multiple input fields matched, cleave.js will only take the first one.');
	      } catch (e) {
	        // Old IE
	      }
	    }

	    opts.initValue = owner.element.value;

	    owner.properties = Cleave.DefaultProperties.assign({}, opts);

	    owner.init();
	};

	Cleave.prototype = {
	    init: function () {
	        var owner = this, pps = owner.properties;

	        // no need to use this lib
	        if (!pps.numeral && !pps.phone && !pps.creditCard && !pps.time && !pps.date && (pps.blocksLength === 0 && !pps.prefix)) {
	            owner.onInput(pps.initValue);

	            return;
	        }

	        pps.maxLength = Cleave.Util.getMaxLength(pps.blocks);

	        owner.isAndroid = Cleave.Util.isAndroid();
	        owner.lastInputValue = '';

	        owner.onChangeListener = owner.onChange.bind(owner);
	        owner.onKeyDownListener = owner.onKeyDown.bind(owner);
	        owner.onFocusListener = owner.onFocus.bind(owner);
	        owner.onCutListener = owner.onCut.bind(owner);
	        owner.onCopyListener = owner.onCopy.bind(owner);

	        owner.element.addEventListener('input', owner.onChangeListener);
	        owner.element.addEventListener('keydown', owner.onKeyDownListener);
	        owner.element.addEventListener('focus', owner.onFocusListener);
	        owner.element.addEventListener('cut', owner.onCutListener);
	        owner.element.addEventListener('copy', owner.onCopyListener);


	        owner.initPhoneFormatter();
	        owner.initDateFormatter();
	        owner.initTimeFormatter();
	        owner.initNumeralFormatter();

	        // avoid touch input field if value is null
	        // otherwise Firefox will add red box-shadow for <input required />
	        if (pps.initValue || (pps.prefix && !pps.noImmediatePrefix)) {
	            owner.onInput(pps.initValue);
	        }
	    },

	    initNumeralFormatter: function () {
	        var owner = this, pps = owner.properties;

	        if (!pps.numeral) {
	            return;
	        }

	        pps.numeralFormatter = new Cleave.NumeralFormatter(
	            pps.numeralDecimalMark,
	            pps.numeralIntegerScale,
	            pps.numeralDecimalScale,
	            pps.numeralThousandsGroupStyle,
	            pps.numeralPositiveOnly,
	            pps.stripLeadingZeroes,
	            pps.delimiter
	        );
	    },

	    initTimeFormatter: function() {
	        var owner = this, pps = owner.properties;

	        if (!pps.time) {
	            return;
	        }

	        pps.timeFormatter = new Cleave.TimeFormatter(pps.timePattern, pps.timeFormat);
	        pps.blocks = pps.timeFormatter.getBlocks();
	        pps.blocksLength = pps.blocks.length;
	        pps.maxLength = Cleave.Util.getMaxLength(pps.blocks);
	    },

	    initDateFormatter: function () {
	        var owner = this, pps = owner.properties;

	        if (!pps.date) {
	            return;
	        }

	        pps.dateFormatter = new Cleave.DateFormatter(pps.datePattern);
	        pps.blocks = pps.dateFormatter.getBlocks();
	        pps.blocksLength = pps.blocks.length;
	        pps.maxLength = Cleave.Util.getMaxLength(pps.blocks);
	    },

	    initPhoneFormatter: function () {
	        var owner = this, pps = owner.properties;

	        if (!pps.phone) {
	            return;
	        }

	        // Cleave.AsYouTypeFormatter should be provided by
	        // external google closure lib
	        try {
	            pps.phoneFormatter = new Cleave.PhoneFormatter(
	                new pps.root.Cleave.AsYouTypeFormatter(pps.phoneRegionCode),
	                pps.delimiter
	            );
	        } catch (ex) {
	            throw new Error('[cleave.js] Please include phone-type-formatter.{country}.js lib');
	        }
	    },

	    onKeyDown: function (event) {
	        var owner = this, pps = owner.properties,
	            charCode = event.which || event.keyCode,
	            Util = Cleave.Util,
	            currentValue = owner.element.value;

	        // if we got any charCode === 8, this means, that this device correctly
	        // sends backspace keys in event, so we do not need to apply any hacks
	        owner.hasBackspaceSupport = owner.hasBackspaceSupport || charCode === 8;
	        if (!owner.hasBackspaceSupport
	          && Util.isAndroidBackspaceKeydown(owner.lastInputValue, currentValue)
	        ) {
	            charCode = 8;
	        }

	        owner.lastInputValue = currentValue;

	        // hit backspace when last character is delimiter
	        var postDelimiter = Util.getPostDelimiter(currentValue, pps.delimiter, pps.delimiters);
	        if (charCode === 8 && postDelimiter) {
	            pps.postDelimiterBackspace = postDelimiter;
	        } else {
	            pps.postDelimiterBackspace = false;
	        }
	    },

	    onChange: function () {
	        this.onInput(this.element.value);
	    },

	    onFocus: function () {
	        var owner = this,
	            pps = owner.properties;

	        Cleave.Util.fixPrefixCursor(owner.element, pps.prefix, pps.delimiter, pps.delimiters);
	    },

	    onCut: function (e) {
	        this.copyClipboardData(e);
	        this.onInput('');
	    },

	    onCopy: function (e) {
	        this.copyClipboardData(e);
	    },

	    copyClipboardData: function (e) {
	        var owner = this,
	            pps = owner.properties,
	            Util = Cleave.Util,
	            inputValue = owner.element.value,
	            textToCopy = '';

	        if (!pps.copyDelimiter) {
	            textToCopy = Util.stripDelimiters(inputValue, pps.delimiter, pps.delimiters);
	        } else {
	            textToCopy = inputValue;
	        }

	        try {
	            if (e.clipboardData) {
	                e.clipboardData.setData('Text', textToCopy);
	            } else {
	                window.clipboardData.setData('Text', textToCopy);
	            }

	            e.preventDefault();
	        } catch (ex) {
	            //  empty
	        }
	    },

	    onInput: function (value) {
	        var owner = this, pps = owner.properties,
	            Util = Cleave.Util;

	        // case 1: delete one more character "4"
	        // 1234*| -> hit backspace -> 123|
	        // case 2: last character is not delimiter which is:
	        // 12|34* -> hit backspace -> 1|34*
	        // note: no need to apply this for numeral mode
	        var postDelimiterAfter = Util.getPostDelimiter(value, pps.delimiter, pps.delimiters);
	        if (!pps.numeral && pps.postDelimiterBackspace && !postDelimiterAfter) {
	            value = Util.headStr(value, value.length - pps.postDelimiterBackspace.length);
	        }

	        // phone formatter
	        if (pps.phone) {
	            if (pps.prefix && (!pps.noImmediatePrefix || value.length)) {
	                pps.result = pps.prefix + pps.phoneFormatter.format(value).slice(pps.prefix.length);
	            } else {
	                pps.result = pps.phoneFormatter.format(value);
	            }
	            owner.updateValueState();

	            return;
	        }

	        // numeral formatter
	        if (pps.numeral) {
	            if (pps.prefix && (!pps.noImmediatePrefix || value.length)) {
	                pps.result = pps.prefix + pps.numeralFormatter.format(value);
	            } else {
	                pps.result = pps.numeralFormatter.format(value);
	            }
	            owner.updateValueState();

	            return;
	        }

	        // date
	        if (pps.date) {
	            value = pps.dateFormatter.getValidatedDate(value);
	        }

	        // time
	        if (pps.time) {
	            value = pps.timeFormatter.getValidatedTime(value);
	        }

	        // strip delimiters
	        value = Util.stripDelimiters(value, pps.delimiter, pps.delimiters);

	        // strip prefix
	        // var strippedPreviousResult = Util.stripDelimiters(pps.result, pps.delimiter, pps.delimiters);
	        value = Util.getPrefixStrippedValue(value, pps.prefix, pps.prefixLength, pps.result, pps.delimiter, pps.delimiters);

	        // strip non-numeric characters
	        value = pps.numericOnly ? Util.strip(value, /[^\d]/g) : value;

	        // convert case
	        value = pps.uppercase ? value.toUpperCase() : value;
	        value = pps.lowercase ? value.toLowerCase() : value;

	        // prefix
	        if (pps.prefix && (!pps.noImmediatePrefix || value.length)) {
	            value = pps.prefix + value;

	            // no blocks specified, no need to do formatting
	            if (pps.blocksLength === 0) {
	                pps.result = value;
	                owner.updateValueState();

	                return;
	            }
	        }

	        // update credit card props
	        if (pps.creditCard) {
	            owner.updateCreditCardPropsByValue(value);
	        }

	        // strip over length characters
	        value = Util.headStr(value, pps.maxLength);

	        // apply blocks
	        pps.result = Util.getFormattedValue(
	            value,
	            pps.blocks, pps.blocksLength,
	            pps.delimiter, pps.delimiters, pps.delimiterLazyShow
	        );

	        owner.updateValueState();
	    },

	    updateCreditCardPropsByValue: function (value) {
	        var owner = this, pps = owner.properties,
	            Util = Cleave.Util,
	            creditCardInfo;

	        // At least one of the first 4 characters has changed
	        if (Util.headStr(pps.result, 4) === Util.headStr(value, 4)) {
	            return;
	        }

	        creditCardInfo = Cleave.CreditCardDetector.getInfo(value, pps.creditCardStrictMode);

	        pps.blocks = creditCardInfo.blocks;
	        pps.blocksLength = pps.blocks.length;
	        pps.maxLength = Util.getMaxLength(pps.blocks);

	        // credit card type changed
	        if (pps.creditCardType !== creditCardInfo.type) {
	            pps.creditCardType = creditCardInfo.type;

	            pps.onCreditCardTypeChanged.call(owner, pps.creditCardType);
	        }
	    },

	    updateValueState: function () {
	        var owner = this,
	            Util = Cleave.Util,
	            pps = owner.properties;

	        if (!owner.element) {
	            return;
	        }

	        var endPos = owner.element.selectionEnd;
	        var oldValue = owner.element.value;
	        var newValue = pps.result;

	        endPos = Util.getNextCursorPosition(endPos, oldValue, newValue, pps.delimiter, pps.delimiters);

	        // fix Android browser type="text" input field
	        // cursor not jumping issue
	        if (owner.isAndroid) {
	            window.setTimeout(function () {
	                owner.element.value = newValue;
	                Util.setSelection(owner.element, endPos, pps.document, false);
	                owner.callOnValueChanged();
	            }, 1);

	            return;
	        }

	        owner.element.value = newValue;
	        Util.setSelection(owner.element, endPos, pps.document, false);
	        owner.callOnValueChanged();
	    },

	    callOnValueChanged: function () {
	        var owner = this,
	            pps = owner.properties;

	        pps.onValueChanged.call(owner, {
	            target: {
	                value: pps.result,
	                rawValue: owner.getRawValue()
	            }
	        });
	    },

	    setPhoneRegionCode: function (phoneRegionCode) {
	        var owner = this, pps = owner.properties;

	        pps.phoneRegionCode = phoneRegionCode;
	        owner.initPhoneFormatter();
	        owner.onChange();
	    },

	    setRawValue: function (value) {
	        var owner = this, pps = owner.properties;

	        value = value !== undefined && value !== null ? value.toString() : '';

	        if (pps.numeral) {
	            value = value.replace('.', pps.numeralDecimalMark);
	        }

	        pps.postDelimiterBackspace = false;

	        owner.element.value = value;
	        owner.onInput(value);
	    },

	    getRawValue: function () {
	        var owner = this,
	            pps = owner.properties,
	            Util = Cleave.Util,
	            rawValue = owner.element.value;

	        if (pps.rawValueTrimPrefix) {
	            rawValue = Util.getPrefixStrippedValue(rawValue, pps.prefix, pps.prefixLength, pps.result, pps.delimiter, pps.delimiters);
	        }

	        if (pps.numeral) {
	            rawValue = pps.numeralFormatter.getRawValue(rawValue);
	        } else {
	            rawValue = Util.stripDelimiters(rawValue, pps.delimiter, pps.delimiters);
	        }

	        return rawValue;
	    },

	    getISOFormatDate: function () {
	        var owner = this,
	            pps = owner.properties;

	        return pps.date ? pps.dateFormatter.getISOFormatDate() : '';
	    },

	    getISOFormatTime: function () {
	        var owner = this,
	            pps = owner.properties;

	        return pps.time ? pps.timeFormatter.getISOFormatTime() : '';
	    },

	    getFormattedValue: function () {
	        return this.element.value;
	    },

	    destroy: function () {
	        var owner = this;

	        owner.element.removeEventListener('input', owner.onChangeListener);
	        owner.element.removeEventListener('keydown', owner.onKeyDownListener);
	        owner.element.removeEventListener('focus', owner.onFocusListener);
	        owner.element.removeEventListener('cut', owner.onCutListener);
	        owner.element.removeEventListener('copy', owner.onCopyListener);
	    },

	    toString: function () {
	        return '[Cleave Object]';
	    }
	};

	Cleave.NumeralFormatter = __webpack_require__(1);
	Cleave.DateFormatter = __webpack_require__(2);
	Cleave.TimeFormatter = __webpack_require__(3);
	Cleave.PhoneFormatter = __webpack_require__(4);
	Cleave.CreditCardDetector = __webpack_require__(5);
	Cleave.Util = __webpack_require__(6);
	Cleave.DefaultProperties = __webpack_require__(7);

	// for angular directive
	((typeof global === 'object' && global) ? global : window)['Cleave'] = Cleave;

	// CommonJS
	module.exports = Cleave;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	'use strict';

	var NumeralFormatter = function (numeralDecimalMark,
	                                 numeralIntegerScale,
	                                 numeralDecimalScale,
	                                 numeralThousandsGroupStyle,
	                                 numeralPositiveOnly,
	                                 stripLeadingZeroes,
	                                 delimiter) {
	    var owner = this;

	    owner.numeralDecimalMark = numeralDecimalMark || '.';
	    owner.numeralIntegerScale = numeralIntegerScale > 0 ? numeralIntegerScale : 0;
	    owner.numeralDecimalScale = numeralDecimalScale >= 0 ? numeralDecimalScale : 2;
	    owner.numeralThousandsGroupStyle = numeralThousandsGroupStyle || NumeralFormatter.groupStyle.thousand;
	    owner.numeralPositiveOnly = !!numeralPositiveOnly;
	    owner.stripLeadingZeroes = stripLeadingZeroes !== false;
	    owner.delimiter = (delimiter || delimiter === '') ? delimiter : ',';
	    owner.delimiterRE = delimiter ? new RegExp('\\' + delimiter, 'g') : '';
	};

	NumeralFormatter.groupStyle = {
	    thousand: 'thousand',
	    lakh:     'lakh',
	    wan:      'wan',
	    none:     'none'
	};

	NumeralFormatter.prototype = {
	    getRawValue: function (value) {
	        return value.replace(this.delimiterRE, '').replace(this.numeralDecimalMark, '.');
	    },

	    format: function (value) {
	        var owner = this, parts, partInteger, partDecimal = '';

	        // strip alphabet letters
	        value = value.replace(/[A-Za-z]/g, '')
	            // replace the first decimal mark with reserved placeholder
	            .replace(owner.numeralDecimalMark, 'M')

	            // strip non numeric letters except minus and "M"
	            // this is to ensure prefix has been stripped
	            .replace(/[^\dM-]/g, '')

	            // replace the leading minus with reserved placeholder
	            .replace(/^\-/, 'N')

	            // strip the other minus sign (if present)
	            .replace(/\-/g, '')

	            // replace the minus sign (if present)
	            .replace('N', owner.numeralPositiveOnly ? '' : '-')

	            // replace decimal mark
	            .replace('M', owner.numeralDecimalMark);

	        // strip any leading zeros
	        if (owner.stripLeadingZeroes) {
	            value = value.replace(/^(-)?0+(?=\d)/, '$1');
	        }

	        partInteger = value;

	        if (value.indexOf(owner.numeralDecimalMark) >= 0) {
	            parts = value.split(owner.numeralDecimalMark);
	            partInteger = parts[0];
	            partDecimal = owner.numeralDecimalMark + parts[1].slice(0, owner.numeralDecimalScale);
	        }

	        if (owner.numeralIntegerScale > 0) {
	          partInteger = partInteger.slice(0, owner.numeralIntegerScale + (value.slice(0, 1) === '-' ? 1 : 0));
	        }

	        switch (owner.numeralThousandsGroupStyle) {
	        case NumeralFormatter.groupStyle.lakh:
	            partInteger = partInteger.replace(/(\d)(?=(\d\d)+\d$)/g, '$1' + owner.delimiter);

	            break;

	        case NumeralFormatter.groupStyle.wan:
	            partInteger = partInteger.replace(/(\d)(?=(\d{4})+$)/g, '$1' + owner.delimiter);

	            break;

	        case NumeralFormatter.groupStyle.thousand:
	            partInteger = partInteger.replace(/(\d)(?=(\d{3})+$)/g, '$1' + owner.delimiter);

	            break;
	        }

	        return partInteger.toString() + (owner.numeralDecimalScale > 0 ? partDecimal.toString() : '');
	    }
	};

	module.exports = NumeralFormatter;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

	'use strict';

	var DateFormatter = function (datePattern) {
	    var owner = this;

	    owner.date = [];
	    owner.blocks = [];
	    owner.datePattern = datePattern;
	    owner.initBlocks();
	};

	DateFormatter.prototype = {
	    initBlocks: function () {
	        var owner = this;
	        owner.datePattern.forEach(function (value) {
	            if (value === 'Y') {
	                owner.blocks.push(4);
	            } else {
	                owner.blocks.push(2);
	            }
	        });
	    },

	    getISOFormatDate: function () {
	        var owner = this,
	            date = owner.date;

	        return date[2] ? (
	            date[2] + '-' + owner.addLeadingZero(date[1]) + '-' + owner.addLeadingZero(date[0])
	        ) : '';
	    },

	    getBlocks: function () {
	        return this.blocks;
	    },

	    getValidatedDate: function (value) {
	        var owner = this, result = '';

	        value = value.replace(/[^\d]/g, '');

	        owner.blocks.forEach(function (length, index) {
	            if (value.length > 0) {
	                var sub = value.slice(0, length),
	                    sub0 = sub.slice(0, 1),
	                    rest = value.slice(length);

	                switch (owner.datePattern[index]) {
	                case 'd':
	                    if (sub === '00') {
	                        sub = '01';
	                    } else if (parseInt(sub0, 10) > 3) {
	                        sub = '0' + sub0;
	                    } else if (parseInt(sub, 10) > 31) {
	                        sub = '31';
	                    }

	                    break;

	                case 'm':
	                    if (sub === '00') {
	                        sub = '01';
	                    } else if (parseInt(sub0, 10) > 1) {
	                        sub = '0' + sub0;
	                    } else if (parseInt(sub, 10) > 12) {
	                        sub = '12';
	                    }

	                    break;
	                }

	                result += sub;

	                // update remaining string
	                value = rest;
	            }
	        });

	        return this.getFixedDateString(result);
	    },

	    getFixedDateString: function (value) {
	        var owner = this, datePattern = owner.datePattern, date = [],
	            dayIndex = 0, monthIndex = 0, yearIndex = 0,
	            dayStartIndex = 0, monthStartIndex = 0, yearStartIndex = 0,
	            day, month, year, fullYearDone = false;

	        // mm-dd || dd-mm
	        if (value.length === 4 && datePattern[0].toLowerCase() !== 'y' && datePattern[1].toLowerCase() !== 'y') {
	            dayStartIndex = datePattern[0] === 'd' ? 0 : 2;
	            monthStartIndex = 2 - dayStartIndex;
	            day = parseInt(value.slice(dayStartIndex, dayStartIndex + 2), 10);
	            month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);

	            date = this.getFixedDate(day, month, 0);
	        }

	        // yyyy-mm-dd || yyyy-dd-mm || mm-dd-yyyy || dd-mm-yyyy || dd-yyyy-mm || mm-yyyy-dd
	        if (value.length === 8) {
	            datePattern.forEach(function (type, index) {
	                switch (type) {
	                case 'd':
	                    dayIndex = index;
	                    break;
	                case 'm':
	                    monthIndex = index;
	                    break;
	                default:
	                    yearIndex = index;
	                    break;
	                }
	            });

	            yearStartIndex = yearIndex * 2;
	            dayStartIndex = (dayIndex <= yearIndex) ? dayIndex * 2 : (dayIndex * 2 + 2);
	            monthStartIndex = (monthIndex <= yearIndex) ? monthIndex * 2 : (monthIndex * 2 + 2);

	            day = parseInt(value.slice(dayStartIndex, dayStartIndex + 2), 10);
	            month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);
	            year = parseInt(value.slice(yearStartIndex, yearStartIndex + 4), 10);

	            fullYearDone = value.slice(yearStartIndex, yearStartIndex + 4).length === 4;

	            date = this.getFixedDate(day, month, year);
	        }

	        owner.date = date;

	        return date.length === 0 ? value : datePattern.reduce(function (previous, current) {
	            switch (current) {
	            case 'd':
	                return previous + owner.addLeadingZero(date[0]);
	            case 'm':
	                return previous + owner.addLeadingZero(date[1]);
	            default:
	                return previous + (fullYearDone ? owner.addLeadingZeroForYear(date[2]) : '');
	            }
	        }, '');
	    },

	    getFixedDate: function (day, month, year) {
	        day = Math.min(day, 31);
	        month = Math.min(month, 12);
	        year = parseInt((year || 0), 10);

	        if ((month < 7 && month % 2 === 0) || (month > 8 && month % 2 === 1)) {
	            day = Math.min(day, month === 2 ? (this.isLeapYear(year) ? 29 : 28) : 30);
	        }

	        return [day, month, year];
	    },

	    isLeapYear: function (year) {
	        return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
	    },

	    addLeadingZero: function (number) {
	        return (number < 10 ? '0' : '') + number;
	    },

	    addLeadingZeroForYear: function (number) {
	        return (number < 10 ? '000' : (number < 100 ? '00' : (number < 1000 ? '0' : ''))) + number;
	    }
	};

	module.exports = DateFormatter;



/***/ }),
/* 3 */
/***/ (function(module, exports) {

	'use strict';

	var TimeFormatter = function (timePattern, timeFormat) {
	    var owner = this;

	    owner.time = [];
	    owner.blocks = [];
	    owner.timePattern = timePattern;
	    owner.timeFormat = timeFormat;
	    owner.initBlocks();
	};

	TimeFormatter.prototype = {
	    initBlocks: function () {
	        var owner = this;
	        owner.timePattern.forEach(function () {
	            owner.blocks.push(2);
	        });
	    },

	    getISOFormatTime: function () {
	        var owner = this,
	            time = owner.time;

	        return time[2] ? (
	            owner.addLeadingZero(time[0]) + ':' + owner.addLeadingZero(time[1]) + ':' + owner.addLeadingZero(time[2])
	        ) : '';
	    },

	    getBlocks: function () {
	        return this.blocks;
	    },

	    getTimeFormatOptions: function () {
	        var owner = this;
	        if (String(owner.timeFormat) === '12') {
	            return {
	                maxHourFirstDigit: 1,
	                maxHours: 12,
	                maxMinutesFirstDigit: 5,
	                maxMinutes: 60
	            };
	        }

	        return {
	            maxHourFirstDigit: 2,
	            maxHours: 23,
	            maxMinutesFirstDigit: 5,
	            maxMinutes: 60
	        };
	    },

	    getValidatedTime: function (value) {
	        var owner = this, result = '';

	        value = value.replace(/[^\d]/g, '');

	        var timeFormatOptions = owner.getTimeFormatOptions();

	        owner.blocks.forEach(function (length, index) {
	            if (value.length > 0) {
	                var sub = value.slice(0, length),
	                    sub0 = sub.slice(0, 1),
	                    rest = value.slice(length);

	                switch (owner.timePattern[index]) {

	                case 'h':
	                    if (parseInt(sub0, 10) > timeFormatOptions.maxHourFirstDigit) {
	                        sub = '0' + sub0;
	                    } else if (parseInt(sub, 10) > timeFormatOptions.maxHours) {
	                        sub = timeFormatOptions.maxHours + '';
	                    }

	                    break;

	                case 'm':
	                case 's':
	                    if (parseInt(sub0, 10) > timeFormatOptions.maxMinutesFirstDigit) {
	                        sub = '0' + sub0;
	                    } else if (parseInt(sub, 10) > timeFormatOptions.maxMinutes) {
	                        sub = timeFormatOptions.maxMinutes + '';
	                    }
	                    break;
	                }

	                result += sub;

	                // update remaining string
	                value = rest;
	            }
	        });

	        return this.getFixedTimeString(result);
	    },

	    getFixedTimeString: function (value) {
	        var owner = this, timePattern = owner.timePattern, time = [],
	            secondIndex = 0, minuteIndex = 0, hourIndex = 0,
	            secondStartIndex = 0, minuteStartIndex = 0, hourStartIndex = 0,
	            second, minute, hour;

	        if (value.length === 6) {
	            timePattern.forEach(function (type, index) {
	                switch (type) {
	                case 's':
	                    secondIndex = index * 2;
	                    break;
	                case 'm':
	                    minuteIndex = index * 2;
	                    break;
	                case 'h':
	                    hourIndex = index * 2;
	                    break;
	                }
	            });

	            hourStartIndex = hourIndex;
	            minuteStartIndex = minuteIndex;
	            secondStartIndex = secondIndex;

	            second = parseInt(value.slice(secondStartIndex, secondStartIndex + 2), 10);
	            minute = parseInt(value.slice(minuteStartIndex, minuteStartIndex + 2), 10);
	            hour = parseInt(value.slice(hourStartIndex, hourStartIndex + 2), 10);

	            time = this.getFixedTime(hour, minute, second);
	        }

	        if (value.length === 4 && owner.timePattern.indexOf('s') < 0) {
	            timePattern.forEach(function (type, index) {
	                switch (type) {
	                case 'm':
	                    minuteIndex = index * 2;
	                    break;
	                case 'h':
	                    hourIndex = index * 2;
	                    break;
	                }
	            });

	            hourStartIndex = hourIndex;
	            minuteStartIndex = minuteIndex;

	            second = 0;
	            minute = parseInt(value.slice(minuteStartIndex, minuteStartIndex + 2), 10);
	            hour = parseInt(value.slice(hourStartIndex, hourStartIndex + 2), 10);

	            time = this.getFixedTime(hour, minute, second);
	        }

	        owner.time = time;

	        return time.length === 0 ? value : timePattern.reduce(function (previous, current) {
	            switch (current) {
	            case 's':
	                return previous + owner.addLeadingZero(time[2]);
	            case 'm':
	                return previous + owner.addLeadingZero(time[1]);
	            case 'h':
	                return previous + owner.addLeadingZero(time[0]);
	            }
	        }, '');
	    },

	    getFixedTime: function (hour, minute, second) {
	        second = Math.min(parseInt(second || 0, 10), 60);
	        minute = Math.min(minute, 60);
	        hour = Math.min(hour, 60);

	        return [hour, minute, second];
	    },

	    addLeadingZero: function (number) {
	        return (number < 10 ? '0' : '') + number;
	    }
	};

	module.exports = TimeFormatter;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

	'use strict';

	var PhoneFormatter = function (formatter, delimiter) {
	    var owner = this;

	    owner.delimiter = (delimiter || delimiter === '') ? delimiter : ' ';
	    owner.delimiterRE = delimiter ? new RegExp('\\' + delimiter, 'g') : '';

	    owner.formatter = formatter;
	};

	PhoneFormatter.prototype = {
	    setFormatter: function (formatter) {
	        this.formatter = formatter;
	    },

	    format: function (phoneNumber) {
	        var owner = this;

	        owner.formatter.clear();

	        // only keep number and +
	        phoneNumber = phoneNumber.replace(/[^\d+]/g, '');

	        // strip non-leading +
	        phoneNumber = phoneNumber.replace(/^\+/, 'B').replace(/\+/g, '').replace('B', '+');

	        // strip delimiter
	        phoneNumber = phoneNumber.replace(owner.delimiterRE, '');

	        var result = '', current, validated = false;

	        for (var i = 0, iMax = phoneNumber.length; i < iMax; i++) {
	            current = owner.formatter.inputDigit(phoneNumber.charAt(i));

	            // has ()- or space inside
	            if (/[\s()-]/g.test(current)) {
	                result = current;

	                validated = true;
	            } else {
	                if (!validated) {
	                    result = current;
	                }
	                // else: over length input
	                // it turns to invalid number again
	            }
	        }

	        // strip ()
	        // e.g. US: 7161234567 returns (716) 123-4567
	        result = result.replace(/[()]/g, '');
	        // replace library delimiter with user customized delimiter
	        result = result.replace(/[\s-]/g, owner.delimiter);

	        return result;
	    }
	};

	module.exports = PhoneFormatter;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

	'use strict';

	var CreditCardDetector = {
	    blocks: {
	        uatp:          [4, 5, 6],
	        amex:          [4, 6, 5],
	        diners:        [4, 6, 4],
	        discover:      [4, 4, 4, 4],
	        mastercard:    [4, 4, 4, 4],
	        dankort:       [4, 4, 4, 4],
	        instapayment:  [4, 4, 4, 4],
	        jcb15:         [4, 6, 5],
	        jcb:           [4, 4, 4, 4],
	        maestro:       [4, 4, 4, 4],
	        visa:          [4, 4, 4, 4],
	        mir:           [4, 4, 4, 4],
	        unionPay:      [4, 4, 4, 4],
	        general:       [4, 4, 4, 4],
	        generalStrict: [4, 4, 4, 7]
	    },

	    re: {
	        // starts with 1; 15 digits, not starts with 1800 (jcb card)
	        uatp: /^(?!1800)1\d{0,14}/,

	        // starts with 34/37; 15 digits
	        amex: /^3[47]\d{0,13}/,

	        // starts with 6011/65/644-649; 16 digits
	        discover: /^(?:6011|65\d{0,2}|64[4-9]\d?)\d{0,12}/,

	        // starts with 300-305/309 or 36/38/39; 14 digits
	        diners: /^3(?:0([0-5]|9)|[689]\d?)\d{0,11}/,

	        // starts with 51-55/2221–2720; 16 digits
	        mastercard: /^(5[1-5]\d{0,2}|22[2-9]\d{0,1}|2[3-7]\d{0,2})\d{0,12}/,

	        // starts with 5019/4175/4571; 16 digits
	        dankort: /^(5019|4175|4571)\d{0,12}/,

	        // starts with 637-639; 16 digits
	        instapayment: /^63[7-9]\d{0,13}/,

	        // starts with 2131/1800; 15 digits
	        jcb15: /^(?:2131|1800)\d{0,11}/,

	        // starts with 2131/1800/35; 16 digits
	        jcb: /^(?:35\d{0,2})\d{0,12}/,

	        // starts with 50/56-58/6304/67; 16 digits
	        maestro: /^(?:5[0678]\d{0,2}|6304|67\d{0,2})\d{0,12}/,

	        // starts with 22; 16 digits
	        mir: /^220[0-4]\d{0,12}/,

	        // starts with 4; 16 digits
	        visa: /^4\d{0,15}/,

	        // starts with 62; 16 digits
	        unionPay: /^62\d{0,14}/
	    },

	    getInfo: function (value, strictMode) {
	        var blocks = CreditCardDetector.blocks,
	            re = CreditCardDetector.re;

	        // Some credit card can have up to 19 digits number.
	        // Set strictMode to true will remove the 16 max-length restrain,
	        // however, I never found any website validate card number like
	        // this, hence probably you don't want to enable this option.
	        strictMode = !!strictMode;

	        for (var key in re) {
	            if (re[key].test(value)) {
	                var block;

	                if (strictMode) {
	                    block = blocks.generalStrict;
	                } else {
	                    block = blocks[key];
	                }

	                return {
	                    type: key,
	                    blocks: block
	                };
	            }
	        }

	        return {
	            type:   'unknown',
	            blocks: strictMode ? blocks.generalStrict : blocks.general
	        };
	    }
	};

	module.exports = CreditCardDetector;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

	'use strict';

	var Util = {
	    noop: function () {
	    },

	    strip: function (value, re) {
	        return value.replace(re, '');
	    },

	    getPostDelimiter: function (value, delimiter, delimiters) {
	        // single delimiter
	        if (delimiters.length === 0) {
	            return value.slice(-delimiter.length) === delimiter ? delimiter : '';
	        }

	        // multiple delimiters
	        var matchedDelimiter = '';
	        delimiters.forEach(function (current) {
	            if (value.slice(-current.length) === current) {
	                matchedDelimiter = current;
	            }
	        });

	        return matchedDelimiter;
	    },

	    getDelimiterREByDelimiter: function (delimiter) {
	        return new RegExp(delimiter.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
	    },

	    getNextCursorPosition: function (prevPos, oldValue, newValue, delimiter, delimiters) {
	      // If cursor was at the end of value, just place it back.
	      // Because new value could contain additional chars.
	      if (oldValue.length === prevPos) {
	          return newValue.length;
	      }

	      return prevPos + this.getPositionOffset(prevPos, oldValue, newValue, delimiter ,delimiters);
	    },

	    getPositionOffset: function (prevPos, oldValue, newValue, delimiter, delimiters) {
	        var oldRawValue, newRawValue, lengthOffset;

	        oldRawValue = this.stripDelimiters(oldValue.slice(0, prevPos), delimiter, delimiters);
	        newRawValue = this.stripDelimiters(newValue.slice(0, prevPos), delimiter, delimiters);
	        lengthOffset = oldRawValue.length - newRawValue.length;

	        return (lengthOffset !== 0) ? (lengthOffset / Math.abs(lengthOffset)) : 0;
	    },

	    stripDelimiters: function (value, delimiter, delimiters) {
	        var owner = this;

	        // single delimiter
	        if (delimiters.length === 0) {
	            var delimiterRE = delimiter ? owner.getDelimiterREByDelimiter(delimiter) : '';

	            return value.replace(delimiterRE, '');
	        }

	        // multiple delimiters
	        delimiters.forEach(function (current) {
	            current.split('').forEach(function (letter) {
	                value = value.replace(owner.getDelimiterREByDelimiter(letter), '');
	            });
	        });

	        return value;
	    },

	    headStr: function (str, length) {
	        return str.slice(0, length);
	    },

	    getMaxLength: function (blocks) {
	        return blocks.reduce(function (previous, current) {
	            return previous + current;
	        }, 0);
	    },

	    // strip prefix
	    // Before type  |   After type    |     Return value
	    // PEFIX-...    |   PEFIX-...     |     ''
	    // PREFIX-123   |   PEFIX-123     |     123
	    // PREFIX-123   |   PREFIX-23     |     23
	    // PREFIX-123   |   PREFIX-1234   |     1234
	    getPrefixStrippedValue: function (value, prefix, prefixLength, prevResult, delimiter, delimiters) {
	        // No prefix
	        if (prefixLength === 0) {
	          return value;
	        }

	        // Pre result has issue
	        // Revert to raw prefix
	        if (prevResult.slice(0, prefixLength) !== prefix) {
	          return '';
	        }

	        var prevValue = this.stripDelimiters(prevResult, delimiter, delimiters);

	        // New value has issue, someone typed in between prefix letters
	        // Revert to pre value
	        if (value.slice(0, prefixLength) !== prefix) {
	          return prevValue.slice(prefixLength);
	        }

	        // No issue, strip prefix for new value
	        return value.slice(prefixLength);
	    },

	    getFirstDiffIndex: function (prev, current) {
	        var index = 0;

	        while (prev.charAt(index) === current.charAt(index)) {
	            if (prev.charAt(index++) === '') {
	                return -1;
	            }
	        }

	        return index;
	    },

	    getFormattedValue: function (value, blocks, blocksLength, delimiter, delimiters, delimiterLazyShow) {
	        var result = '',
	            multipleDelimiters = delimiters.length > 0,
	            currentDelimiter;

	        // no options, normal input
	        if (blocksLength === 0) {
	            return value;
	        }

	        blocks.forEach(function (length, index) {
	            if (value.length > 0) {
	                var sub = value.slice(0, length),
	                    rest = value.slice(length);

	                if (multipleDelimiters) {
	                    currentDelimiter = delimiters[delimiterLazyShow ? (index - 1) : index] || currentDelimiter;
	                } else {
	                    currentDelimiter = delimiter;
	                }

	                if (delimiterLazyShow) {
	                    if (index > 0) {
	                        result += currentDelimiter;
	                    }

	                    result += sub;
	                } else {
	                    result += sub;

	                    if (sub.length === length && index < blocksLength - 1) {
	                        result += currentDelimiter;
	                    }
	                }

	                // update remaining string
	                value = rest;
	            }
	        });

	        return result;
	    },

	    // move cursor to the end
	    // the first time user focuses on an input with prefix
	    fixPrefixCursor: function (el, prefix, delimiter, delimiters) {
	        if (!el) {
	            return;
	        }

	        var val = el.value,
	            appendix = delimiter || (delimiters[0] || ' ');

	        if (!el.setSelectionRange || !prefix || (prefix.length + appendix.length) < val.length) {
	            return;
	        }

	        var len = val.length * 2;

	        // set timeout to avoid blink
	        setTimeout(function () {
	            el.setSelectionRange(len, len);
	        }, 1);
	    },

	    setSelection: function (element, position, doc) {
	        if (element !== this.getActiveElement(doc)) {
	            return;
	        }

	        // cursor is already in the end
	        if (element && element.value.length <= position) {
	          return;
	        }

	        if (element.createTextRange) {
	            var range = element.createTextRange();

	            range.move('character', position);
	            range.select();
	        } else {
	            try {
	                element.setSelectionRange(position, position);
	            } catch (e) {
	                // eslint-disable-next-line
	                console.warn('The input element type does not support selection');
	            }
	        }
	    },

	    getActiveElement: function(parent) {
	        var activeElement = parent.activeElement;
	        if (activeElement && activeElement.shadowRoot) {
	            return this.getActiveElement(activeElement.shadowRoot);
	        }
	        return activeElement;
	    },

	    isAndroid: function () {
	        return navigator && /android/i.test(navigator.userAgent);
	    },

	    // On Android chrome, the keyup and keydown events
	    // always return key code 229 as a composition that
	    // buffers the user’s keystrokes
	    // see https://github.com/nosir/cleave.js/issues/147
	    isAndroidBackspaceKeydown: function (lastInputValue, currentInputValue) {
	        if (!this.isAndroid() || !lastInputValue || !currentInputValue) {
	            return false;
	        }

	        return currentInputValue === lastInputValue.slice(0, -1);
	    }
	};

	module.exports = Util;


/***/ }),
/* 7 */
/***/ (function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	/**
	 * Props Assignment
	 *
	 * Separate this, so react module can share the usage
	 */
	var DefaultProperties = {
	    // Maybe change to object-assign
	    // for now just keep it as simple
	    assign: function (target, opts) {
	        target = target || {};
	        opts = opts || {};

	        // credit card
	        target.creditCard = !!opts.creditCard;
	        target.creditCardStrictMode = !!opts.creditCardStrictMode;
	        target.creditCardType = '';
	        target.onCreditCardTypeChanged = opts.onCreditCardTypeChanged || (function () {});

	        // phone
	        target.phone = !!opts.phone;
	        target.phoneRegionCode = opts.phoneRegionCode || 'AU';
	        target.phoneFormatter = {};

	        // time
	        target.time = !!opts.time;
	        target.timePattern = opts.timePattern || ['h', 'm', 's'];
	        target.timeFormat = opts.timeFormat || '24';
	        target.timeFormatter = {};

	        // date
	        target.date = !!opts.date;
	        target.datePattern = opts.datePattern || ['d', 'm', 'Y'];
	        target.dateFormatter = {};

	        // numeral
	        target.numeral = !!opts.numeral;
	        target.numeralIntegerScale = opts.numeralIntegerScale > 0 ? opts.numeralIntegerScale : 0;
	        target.numeralDecimalScale = opts.numeralDecimalScale >= 0 ? opts.numeralDecimalScale : 2;
	        target.numeralDecimalMark = opts.numeralDecimalMark || '.';
	        target.numeralThousandsGroupStyle = opts.numeralThousandsGroupStyle || 'thousand';
	        target.numeralPositiveOnly = !!opts.numeralPositiveOnly;
	        target.stripLeadingZeroes = opts.stripLeadingZeroes !== false;

	        // others
	        target.numericOnly = target.creditCard || target.date || !!opts.numericOnly;

	        target.uppercase = !!opts.uppercase;
	        target.lowercase = !!opts.lowercase;

	        target.prefix = (target.creditCard || target.date) ? '' : (opts.prefix || '');
	        target.noImmediatePrefix = !!opts.noImmediatePrefix;
	        target.prefixLength = target.prefix.length;
	        target.rawValueTrimPrefix = !!opts.rawValueTrimPrefix;
	        target.copyDelimiter = !!opts.copyDelimiter;

	        target.initValue = (opts.initValue !== undefined && opts.initValue !== null) ? opts.initValue.toString() : '';

	        target.delimiter =
	            (opts.delimiter || opts.delimiter === '') ? opts.delimiter :
	                (opts.date ? '/' :
	                    (opts.time ? ':' :
	                        (opts.numeral ? ',' :
	                            (opts.phone ? ' ' :
	                                ' '))));
	        target.delimiterLength = target.delimiter.length;
	        target.delimiterLazyShow = !!opts.delimiterLazyShow;
	        target.delimiters = opts.delimiters || [];

	        target.blocks = opts.blocks || [];
	        target.blocksLength = target.blocks.length;

	        target.root = (typeof global === 'object' && global) ? global : window;
	        target.document = opts.document || target.root.document;

	        target.maxLength = 0;

	        target.backspace = false;
	        target.result = '';

	        target.onValueChanged = opts.onValueChanged || (function () {});

	        return target;
	    }
	};

	module.exports = DefaultProperties;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ })
/******/ ])
});
;

!function(){function l(l,n){var u=l.split("."),t=Y;u[0]in t||!t.execScript||t.execScript("var "+u[0]);for(var e;u.length&&(e=u.shift());)u.length||void 0===n?t=t[e]?t[e]:t[e]={}:t[e]=n}function n(l,n){function u(){}u.prototype=n.prototype,l.M=n.prototype,l.prototype=new u,l.prototype.constructor=l,l.N=function(l,u,t){for(var e=Array(arguments.length-2),r=2;r<arguments.length;r++)e[r-2]=arguments[r];return n.prototype[u].apply(l,e)}}function u(l,n){null!=l&&this.a.apply(this,arguments)}function t(l){l.b=""}function e(l,n){l.sort(n||r)}function r(l,n){return l>n?1:l<n?-1:0}function i(l){var n,u=[],t=0;for(n in l)u[t++]=l[n];return u}function a(l,n){this.b=l,this.a={};for(var u=0;u<n.length;u++){var t=n[u];this.a[t.b]=t}}function d(l){return l=i(l.a),e(l,function(l,n){return l.b-n.b}),l}function o(l,n){switch(this.b=l,this.g=!!n.v,this.a=n.c,this.i=n.type,this.h=!1,this.a){case O:case H:case q:case X:case k:case L:case J:this.h=!0}this.f=n.defaultValue}function s(){this.a={},this.f=this.j().a,this.b=this.g=null}function f(l,n){for(var u=d(l.j()),t=0;t<u.length;t++){var e=u[t],r=e.b;if(null!=n.a[r]){l.b&&delete l.b[e.b];var i=11==e.a||10==e.a;if(e.g)for(var e=p(n,r)||[],a=0;a<e.length;a++){var o=l,s=r,c=i?e[a].clone():e[a];o.a[s]||(o.a[s]=[]),o.a[s].push(c),o.b&&delete o.b[s]}else e=p(n,r),i?(i=p(l,r))?f(i,e):m(l,r,e.clone()):m(l,r,e)}}}function p(l,n){var u=l.a[n];if(null==u)return null;if(l.g){if(!(n in l.b)){var t=l.g,e=l.f[n];if(null!=u)if(e.g){for(var r=[],i=0;i<u.length;i++)r[i]=t.b(e,u[i]);u=r}else u=t.b(e,u);return l.b[n]=u}return l.b[n]}return u}function c(l,n,u){var t=p(l,n);return l.f[n].g?t[u||0]:t}function h(l,n){var u;if(null!=l.a[n])u=c(l,n,void 0);else l:{if(u=l.f[n],void 0===u.f){var t=u.i;if(t===Boolean)u.f=!1;else if(t===Number)u.f=0;else{if(t!==String){u=new t;break l}u.f=u.h?"0":""}}u=u.f}return u}function g(l,n){return l.f[n].g?null!=l.a[n]?l.a[n].length:0:null!=l.a[n]?1:0}function m(l,n,u){l.a[n]=u,l.b&&(l.b[n]=u)}function b(l,n){var u,t=[];for(u in n)0!=u&&t.push(new o(u,n[u]));return new a(l,t)}/*

 Protocol Buffer 2 Copyright 2008 Google Inc.
 All other code copyright its respective owners.
 Copyright (C) 2010 The Libphonenumber Authors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function y(){s.call(this)}function v(){s.call(this)}function S(){s.call(this)}function _(){}function w(){}function A(){}/*

 Copyright (C) 2010 The Libphonenumber Authors.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function x(){this.a={}}function B(l){return 0==l.length||rl.test(l)}function C(l,n){if(null==n)return null;n=n.toUpperCase();var u=l.a[n];if(null==u){if(u=nl[n],null==u)return null;u=(new A).a(S.j(),u),l.a[n]=u}return u}function M(l){return l=ll[l],null==l?"ZZ":l[0]}function N(l){this.H=RegExp(" "),this.C="",this.m=new u,this.w="",this.i=new u,this.u=new u,this.l=!0,this.A=this.o=this.F=!1,this.G=x.b(),this.s=0,this.b=new u,this.B=!1,this.h="",this.a=new u,this.f=[],this.D=l,this.J=this.g=D(this,this.D)}function D(l,n){var u;if(null!=n&&isNaN(n)&&n.toUpperCase()in nl){if(u=C(l.G,n),null==u)throw Error("Invalid region code: "+n);u=h(u,10)}else u=0;return u=C(l.G,M(u)),null!=u?u:il}function G(l){for(var n=l.f.length,u=0;u<n;++u){var e=l.f[u],r=h(e,1);if(l.w==r)return!1;var i;i=l;var a=e,d=h(a,1);if(-1!=d.indexOf("|"))i=!1;else{d=d.replace(al,"\\d"),d=d.replace(dl,"\\d"),t(i.m);var o;o=i;var a=h(a,2),s="999999999999999".match(d)[0];s.length<o.a.b.length?o="":(o=s.replace(new RegExp(d,"g"),a),o=o.replace(RegExp("9","g")," ")),0<o.length?(i.m.a(o),i=!0):i=!1}if(i)return l.w=r,l.B=sl.test(c(e,4)),l.s=0,!0}return l.l=!1}function j(l,n){for(var u=[],t=n.length-3,e=l.f.length,r=0;r<e;++r){var i=l.f[r];0==g(i,3)?u.push(l.f[r]):(i=c(i,3,Math.min(t,g(i,3)-1)),0==n.search(i)&&u.push(l.f[r]))}l.f=u}function I(l,n){l.i.a(n);var u=n;if(el.test(u)||1==l.i.b.length&&tl.test(u)){var e,u=n;"+"==u?(e=u,l.u.a(u)):(e=ul[u],l.u.a(e),l.a.a(e)),n=e}else l.l=!1,l.F=!0;if(!l.l){if(!l.F)if(F(l)){if(U(l))return V(l)}else if(0<l.h.length&&(u=l.a.toString(),t(l.a),l.a.a(l.h),l.a.a(u),u=l.b.toString(),e=u.lastIndexOf(l.h),t(l.b),l.b.a(u.substring(0,e))),l.h!=P(l))return l.b.a(" "),V(l);return l.i.toString()}switch(l.u.b.length){case 0:case 1:case 2:return l.i.toString();case 3:if(!F(l))return l.h=P(l),E(l);l.A=!0;default:return l.A?(U(l)&&(l.A=!1),l.b.toString()+l.a.toString()):0<l.f.length?(u=K(l,n),e=$(l),0<e.length?e:(j(l,l.a.toString()),G(l)?T(l):l.l?R(l,u):l.i.toString())):E(l)}}function V(l){return l.l=!0,l.A=!1,l.f=[],l.s=0,t(l.m),l.w="",E(l)}function $(l){for(var n=l.a.toString(),u=l.f.length,t=0;t<u;++t){var e=l.f[t],r=h(e,1);if(new RegExp("^(?:"+r+")$").test(n))return l.B=sl.test(c(e,4)),n=n.replace(new RegExp(r,"g"),c(e,2)),R(l,n)}return""}function R(l,n){var u=l.b.b.length;return l.B&&0<u&&" "!=l.b.toString().charAt(u-1)?l.b+" "+n:l.b+n}function E(l){var n=l.a.toString();if(3<=n.length){for(var u=l.o&&0==l.h.length&&0<g(l.g,20)?p(l.g,20)||[]:p(l.g,19)||[],t=u.length,e=0;e<t;++e){var r=u[e];0<l.h.length&&B(h(r,4))&&!c(r,6)&&null==r.a[5]||(0!=l.h.length||l.o||B(h(r,4))||c(r,6))&&ol.test(h(r,2))&&l.f.push(r)}return j(l,n),n=$(l),0<n.length?n:G(l)?T(l):l.i.toString()}return R(l,n)}function T(l){var n=l.a.toString(),u=n.length;if(0<u){for(var t="",e=0;e<u;e++)t=K(l,n.charAt(e));return l.l?R(l,t):l.i.toString()}return l.b.toString()}function P(l){var n,u=l.a.toString(),e=0;return 1!=c(l.g,10)?n=!1:(n=l.a.toString(),n="1"==n.charAt(0)&&"0"!=n.charAt(1)&&"1"!=n.charAt(1)),n?(e=1,l.b.a("1").a(" "),l.o=!0):null!=l.g.a[15]&&(n=new RegExp("^(?:"+c(l.g,15)+")"),n=u.match(n),null!=n&&null!=n[0]&&0<n[0].length&&(l.o=!0,e=n[0].length,l.b.a(u.substring(0,e)))),t(l.a),l.a.a(u.substring(e)),u.substring(0,e)}function F(l){var n=l.u.toString(),u=new RegExp("^(?:\\+|"+c(l.g,11)+")"),u=n.match(u);return null!=u&&null!=u[0]&&0<u[0].length&&(l.o=!0,u=u[0].length,t(l.a),l.a.a(n.substring(u)),t(l.b),l.b.a(n.substring(0,u)),"+"!=n.charAt(0)&&l.b.a(" "),!0)}function U(l){if(0==l.a.b.length)return!1;var n,e=new u;l:{if(n=l.a.toString(),0!=n.length&&"0"!=n.charAt(0))for(var r,i=n.length,a=1;3>=a&&a<=i;++a)if(r=parseInt(n.substring(0,a),10),r in ll){e.a(n.substring(a)),n=r;break l}n=0}return 0!=n&&(t(l.a),l.a.a(e.toString()),e=M(n),"001"==e?l.g=C(l.G,""+n):e!=l.D&&(l.g=D(l,e)),l.b.a(""+n).a(" "),l.h="",!0)}function K(l,n){var u=l.m.toString();if(0<=u.substring(l.s).search(l.H)){var e=u.search(l.H),u=u.replace(l.H,n);return t(l.m),l.m.a(u),l.s=e,u.substring(0,l.s+1)}return 1==l.f.length&&(l.l=!1),l.w="",l.i.toString()}var Y=this;u.prototype.b="",u.prototype.set=function(l){this.b=""+l},u.prototype.a=function(l,n,u){if(this.b+=String(l),null!=n)for(var t=1;t<arguments.length;t++)this.b+=arguments[t];return this},u.prototype.toString=function(){return this.b};var J=1,L=2,O=3,H=4,q=6,X=16,k=18;s.prototype.set=function(l,n){m(this,l.b,n)},s.prototype.clone=function(){var l=new this.constructor;return l!=this&&(l.a={},l.b&&(l.b={}),f(l,this)),l},n(y,s);var Z=null;n(v,s);var z=null;n(S,s);var Q=null;y.prototype.j=function(){var l=Z;return l||(Z=l=b(y,{0:{name:"NumberFormat",I:"i18n.phonenumbers.NumberFormat"},1:{name:"pattern",required:!0,c:9,type:String},2:{name:"format",required:!0,c:9,type:String},3:{name:"leading_digits_pattern",v:!0,c:9,type:String},4:{name:"national_prefix_formatting_rule",c:9,type:String},6:{name:"national_prefix_optional_when_formatting",c:8,defaultValue:!1,type:Boolean},5:{name:"domestic_carrier_code_formatting_rule",c:9,type:String}})),l},y.j=y.prototype.j,v.prototype.j=function(){var l=z;return l||(z=l=b(v,{0:{name:"PhoneNumberDesc",I:"i18n.phonenumbers.PhoneNumberDesc"},2:{name:"national_number_pattern",c:9,type:String},9:{name:"possible_length",v:!0,c:5,type:Number},10:{name:"possible_length_local_only",v:!0,c:5,type:Number},6:{name:"example_number",c:9,type:String}})),l},v.j=v.prototype.j,S.prototype.j=function(){var l=Q;return l||(Q=l=b(S,{0:{name:"PhoneMetadata",I:"i18n.phonenumbers.PhoneMetadata"},1:{name:"general_desc",c:11,type:v},2:{name:"fixed_line",c:11,type:v},3:{name:"mobile",c:11,type:v},4:{name:"toll_free",c:11,type:v},5:{name:"premium_rate",c:11,type:v},6:{name:"shared_cost",c:11,type:v},7:{name:"personal_number",c:11,type:v},8:{name:"voip",c:11,type:v},21:{name:"pager",c:11,type:v},25:{name:"uan",c:11,type:v},27:{name:"emergency",c:11,type:v},28:{name:"voicemail",c:11,type:v},29:{name:"short_code",c:11,type:v},30:{name:"standard_rate",c:11,type:v},31:{name:"carrier_specific",c:11,type:v},33:{name:"sms_services",c:11,type:v},24:{name:"no_international_dialling",c:11,type:v},9:{name:"id",required:!0,c:9,type:String},10:{name:"country_code",c:5,type:Number},11:{name:"international_prefix",c:9,type:String},17:{name:"preferred_international_prefix",c:9,type:String},12:{name:"national_prefix",c:9,type:String},13:{name:"preferred_extn_prefix",c:9,type:String},15:{name:"national_prefix_for_parsing",c:9,type:String},16:{name:"national_prefix_transform_rule",c:9,type:String},18:{name:"same_mobile_and_fixed_line_pattern",c:8,defaultValue:!1,type:Boolean},19:{name:"number_format",v:!0,c:11,type:y},20:{name:"intl_number_format",v:!0,c:11,type:y},22:{name:"main_country_for_code",c:8,defaultValue:!1,type:Boolean},23:{name:"leading_digits",c:9,type:String},26:{name:"leading_zero_possible",c:8,defaultValue:!1,type:Boolean}})),l},S.j=S.prototype.j,_.prototype.a=function(l){throw new l.b,Error("Unimplemented")},_.prototype.b=function(l,n){if(11==l.a||10==l.a)return n instanceof s?n:this.a(l.i.prototype.j(),n);if(14==l.a){if("string"==typeof n&&W.test(n)){var u=Number(n);if(0<u)return u}return n}if(!l.h)return n;if(u=l.i,u===String){if("number"==typeof n)return String(n)}else if(u===Number&&"string"==typeof n&&("Infinity"===n||"-Infinity"===n||"NaN"===n||W.test(n)))return Number(n);return n};var W=/^-?[0-9]+$/;n(w,_),w.prototype.a=function(l,n){var u=new l.b;return u.g=this,u.a=n,u.b={},u},n(A,w),A.prototype.b=function(l,n){return 8==l.a?!!n:_.prototype.b.apply(this,arguments)},A.prototype.a=function(l,n){return A.M.a.call(this,l,n)};/*

 Copyright (C) 2010 The Libphonenumber Authors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
var ll={1:"US AG AI AS BB BM BS CA DM DO GD GU JM KN KY LC MP MS PR SX TC TT VC VG VI".split(" ")},nl={AG:[null,[null,null,"(?:268|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"268(?:4(?:6[0-38]|84)|56[0-2])\\d{4}",null,null,null,"2684601234",null,null,null,[7]],[null,null,"268(?:464|7(?:1[3-9]|2\\d|3[246]|64|[78][0-689]))\\d{4}",null,null,null,"2684641234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,"26848[01]\\d{4}",null,null,null,"2684801234",null,null,null,[7]],"AG",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,"26840[69]\\d{4}",null,null,null,"2684061234",null,null,null,[7]],null,"268",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],AI:[null,[null,null,"(?:264|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"2644(?:6[12]|9[78])\\d{4}",null,null,null,"2644612345",null,null,null,[7]],[null,null,"264(?:235|476|5(?:3[6-9]|8[1-4])|7(?:29|72))\\d{4}",null,null,null,"2642351234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"AI",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"264",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],AS:[null,[null,null,"(?:[58]\\d\\d|684|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"6846(?:22|33|44|55|77|88|9[19])\\d{4}",null,null,null,"6846221234",null,null,null,[7]],[null,null,"684(?:2(?:5[2468]|72)|7(?:3[13]|70))\\d{4}",null,null,null,"6847331234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"AS",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"684",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],BB:[null,[null,null,"(?:246|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"246(?:2(?:2[78]|7[0-4])|4(?:1[024-6]|2\\d|3[2-9])|5(?:20|[34]\\d|54|7[1-3])|6(?:2\\d|38)|7[35]7|9(?:1[89]|63))\\d{4}",null,null,null,"2464123456",null,null,null,[7]],[null,null,"246(?:2(?:[356]\\d|4[0-57-9]|8[0-79])|45\\d|69[5-7]|8(?:[2-5]\\d|83))\\d{4}",null,null,null,"2462501234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"(?:246976|900[2-9]\\d\\d)\\d{4}",null,null,null,"9002123456",null,null,null,[7]],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,"24631\\d{5}",null,null,null,"2463101234",null,null,null,[7]],"BB",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"246",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"246(?:292|367|4(?:1[7-9]|3[01]|44|67)|7(?:36|53))\\d{4}",null,null,null,"2464301234",null,null,null,[7]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],BM:[null,[null,null,"(?:441|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"441(?:2(?:02|23|[3479]\\d|61)|[46]\\d\\d|5(?:4\\d|60|89)|824)\\d{4}",null,null,null,"4412345678",null,null,null,[7]],[null,null,"441(?:[37]\\d|5[0-39])\\d{5}",null,null,null,"4413701234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"BM",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"441",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],BS:[null,[null,null,"(?:242|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"242(?:3(?:02|[236][1-9]|4[0-24-9]|5[0-68]|7[347]|8[0-4]|9[2-467])|461|502|6(?:0[1-4]|12|2[013]|[45]0|7[67]|8[78]|9[89])|7(?:02|88))\\d{4}",null,null,null,"2423456789",null,null,null,[7]],[null,null,"242(?:3(?:5[79]|7[56]|95)|4(?:[23][1-9]|4[1-35-9]|5[1-8]|6[2-8]|7\\d|81)|5(?:2[45]|3[35]|44|5[1-46-9]|65|77)|6[34]6|7(?:27|38)|8(?:0[1-9]|1[02-9]|2\\d|[89]9))\\d{4}",null,null,null,"2423591234",null,null,null,[7]],[null,null,"(?:242300|8(?:00|33|44|55|66|77|88)[2-9]\\d\\d)\\d{4}",null,null,null,"8002123456",null,null,null,[7]],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"BS",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"242",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"242225[0-46-9]\\d{3}",null,null,null,"2422250123"],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],CA:[null,[null,null,"(?:[2-8]\\d|90)\\d{8}",null,null,null,null,null,null,[10],[7]],[null,null,"(?:2(?:04|[23]6|[48]9|50)|3(?:06|43|65)|4(?:03|1[68]|3[178]|50)|5(?:06|1[49]|48|79|8[17])|6(?:04|13|39|47)|7(?:0[59]|78|8[02])|8(?:[06]7|19|25|73)|90[25])[2-9]\\d{6}",null,null,null,"5062345678",null,null,null,[7]],[null,null,"(?:2(?:04|[23]6|[48]9|50)|3(?:06|43|65)|4(?:03|1[68]|3[178]|50)|5(?:06|1[49]|48|79|8[17])|6(?:04|13|39|47)|7(?:0[59]|78|8[02])|8(?:[06]7|19|25|73)|90[25])[2-9]\\d{6}",null,null,null,"5062345678",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"(?:5(?:00|2[12]|33|44|66|77|88)|622)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,"600[2-9]\\d{6}",null,null,null,"6002012345"],"CA",1,"011","1",null,null,"1",null,null,1,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],DM:[null,[null,null,"(?:[58]\\d\\d|767|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"767(?:2(?:55|66)|4(?:2[01]|4[0-25-9])|50[0-4]|70[1-3])\\d{4}",null,null,null,"7674201234",null,null,null,[7]],[null,null,"767(?:2(?:[2-4689]5|7[5-7])|31[5-7]|61[1-7])\\d{4}",null,null,null,"7672251234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"DM",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"767",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],DO:[null,[null,null,"(?:[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"8(?:[04]9[2-9]\\d\\d|29(?:2(?:[0-59]\\d|6[04-9]|7[0-27]|8[0237-9])|3(?:[0-35-9]\\d|4[7-9])|[45]\\d\\d|6(?:[0-27-9]\\d|[3-5][1-9]|6[0135-8])|7(?:0[013-9]|[1-37]\\d|4[1-35689]|5[1-4689]|6[1-57-9]|8[1-79]|9[1-8])|8(?:0[146-9]|1[0-48]|[248]\\d|3[1-79]|5[01589]|6[013-68]|7[124-8]|9[0-8])|9(?:[0-24]\\d|3[02-46-9]|5[0-79]|60|7[0169]|8[57-9]|9[02-9])))\\d{4}",null,null,null,"8092345678",null,null,null,[7]],[null,null,"8[024]9[2-9]\\d{6}",null,null,null,"8092345678",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"DO",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"8[024]9",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],GD:[null,[null,null,"(?:473|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"473(?:2(?:3[0-2]|69)|3(?:2[89]|86)|4(?:[06]8|3[5-9]|4[0-49]|5[5-79]|73|90)|63[68]|7(?:58|84)|800|938)\\d{4}",null,null,null,"4732691234",null,null,null,[7]],[null,null,"473(?:4(?:0[2-79]|1[04-9]|2[0-5]|58)|5(?:2[01]|3[3-8])|901)\\d{4}",null,null,null,"4734031234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"GD",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"473",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],GU:[null,[null,null,"(?:[58]\\d\\d|671|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"671(?:3(?:00|3[39]|4[349]|55|6[26])|4(?:00|56|7[1-9]|8[0236-9])|5(?:55|6[2-5]|88)|6(?:3[2-578]|4[24-9]|5[34]|78|8[235-9])|7(?:[0479]7|2[0167]|3[45]|8[7-9])|8(?:[2-57-9]8|6[48])|9(?:2[29]|6[79]|7[1279]|8[7-9]|9[78]))\\d{4}",null,null,null,"6713001234",null,null,null,[7]],[null,null,"671(?:3(?:00|3[39]|4[349]|55|6[26])|4(?:00|56|7[1-9]|8[0236-9])|5(?:55|6[2-5]|88)|6(?:3[2-578]|4[24-9]|5[34]|78|8[235-9])|7(?:[0479]7|2[0167]|3[45]|8[7-9])|8(?:[2-57-9]8|6[48])|9(?:2[29]|6[79]|7[1279]|8[7-9]|9[78]))\\d{4}",null,null,null,"6713001234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"GU",1,"011","1",null,null,"1",null,null,1,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"671",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],JM:[null,[null,null,"(?:[58]\\d\\d|658|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"(?:658[2-9]\\d\\d|876(?:5(?:0[12]|1[0-468]|2[35]|63)|6(?:0[1-3579]|1[0237-9]|[23]\\d|40|5[06]|6[2-589]|7[05]|8[04]|9[4-9])|7(?:0[2-689]|[1-6]\\d|8[056]|9[45])|9(?:0[1-8]|1[02378]|[2-8]\\d|9[2-468])))\\d{4}",null,null,null,"8765230123",null,null,null,[7]],[null,null,"876(?:(?:2[14-9]|[348]\\d)\\d|5(?:0[3-9]|[2-57-9]\\d|6[0-24-9])|7(?:0[07]|7\\d|8[1-47-9]|9[0-36-9])|9(?:[01]9|9[0579]))\\d{4}",null,null,null,"8762101234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"JM",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"658|876",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],KN:[null,[null,null,"(?:[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"869(?:2(?:29|36)|302|4(?:6[015-9]|70))\\d{4}",null,null,null,"8692361234",null,null,null,[7]],[null,null,"869(?:5(?:5[6-8]|6[5-7])|66\\d|76[02-7])\\d{4}",null,null,null,"8697652917",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"KN",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"869",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],KY:[null,[null,null,"(?:345|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"345(?:2(?:22|44)|444|6(?:23|38|40)|7(?:4[35-79]|6[6-9]|77)|8(?:00|1[45]|25|[48]8)|9(?:14|4[035-9]))\\d{4}",null,null,null,"3452221234",null,null,null,[7]],[null,null,"345(?:32[1-9]|5(?:1[67]|2[5-79]|4[6-9]|50|76)|649|9(?:1[67]|2[2-9]|3[689]))\\d{4}",null,null,null,"3453231234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"(?:345976|900[2-9]\\d\\d)\\d{4}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"KY",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,"345849\\d{4}",null,null,null,"3458491234"],null,"345",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],LC:[null,[null,null,"(?:[58]\\d\\d|758|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"758(?:4(?:30|5\\d|6[2-9]|8[0-2])|57[0-2]|638)\\d{4}",null,null,null,"7584305678",null,null,null,[7]],[null,null,"758(?:28[4-7]|384|4(?:6[01]|8[4-9])|5(?:1[89]|20|84)|7(?:1[2-9]|2\\d|3[01]))\\d{4}",null,null,null,"7582845678",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"LC",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"758",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],MP:[null,[null,null,"(?:[58]\\d\\d|(?:67|90)0)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"670(?:2(?:3[3-7]|56|8[5-8])|32[1-38]|4(?:33|8[348])|5(?:32|55|88)|6(?:64|70|82)|78[3589]|8[3-9]8|989)\\d{4}",null,null,null,"6702345678",null,null,null,[7]],[null,null,"670(?:2(?:3[3-7]|56|8[5-8])|32[1-38]|4(?:33|8[348])|5(?:32|55|88)|6(?:64|70|82)|78[3589]|8[3-9]8|989)\\d{4}",null,null,null,"6702345678",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"MP",1,"011","1",null,null,"1",null,null,1,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"670",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],MS:[null,[null,null,"(?:(?:[58]\\d\\d|900)\\d\\d|66449)\\d{5}",null,null,null,null,null,null,[10],[7]],[null,null,"664491\\d{4}",null,null,null,"6644912345",null,null,null,[7]],[null,null,"66449[2-6]\\d{4}",null,null,null,"6644923456",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"MS",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"664",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],PR:[null,[null,null,"(?:[589]\\d\\d|787)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"(?:787|939)[2-9]\\d{6}",null,null,null,"7872345678",null,null,null,[7]],[null,null,"(?:787|939)[2-9]\\d{6}",null,null,null,"7872345678",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"PR",1,"011","1",null,null,"1",null,null,1,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"787|939",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],SX:[null,[null,null,"(?:(?:[58]\\d\\d|900)\\d|7215)\\d{6}",null,null,null,null,null,null,[10],[7]],[null,null,"7215(?:4[2-8]|8[239]|9[056])\\d{4}",null,null,null,"7215425678",null,null,null,[7]],[null,null,"7215(?:1[02]|2\\d|5[034679]|8[014-8])\\d{4}",null,null,null,"7215205678",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002123456"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002123456"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"SX",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"721",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],TC:[null,[null,null,"(?:[58]\\d\\d|649|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"649(?:712|9(?:4\\d|50))\\d{4}",null,null,null,"6497121234",null,null,null,[7]],[null,null,"649(?:2(?:3[129]|4[1-7])|3(?:3[1-389]|4[1-8])|4[34][1-3])\\d{4}",null,null,null,"6492311234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,"64971[01]\\d{4}",null,null,null,"6497101234",null,null,null,[7]],"TC",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"649",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],TT:[null,[null,null,"(?:[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"868(?:2(?:01|[23]\\d)|6(?:0[7-9]|1[02-8]|2[1-9]|[3-69]\\d|7[0-79])|82[124])\\d{4}",null,null,null,"8682211234",null,null,null,[7]],[null,null,"868(?:2(?:6[6-9]|[7-9]\\d)|[37](?:0[1-9]|1[02-9]|[2-9]\\d)|4[6-9]\\d|6(?:20|78|8\\d))\\d{4}",null,null,null,"8682911234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"TT",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"868",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,"868619\\d{4}",null,null,null,"8686191234",null,null,null,[7]]],US:[null,[null,null,"[2-9]\\d{9}",null,null,null,null,null,null,[10],[7]],[null,null,"(?:2(?:0[1-35-9]|1[02-9]|2[03-589]|3[149]|4[08]|5[1-46]|6[0279]|7[0269]|8[13])|3(?:0[1-57-9]|1[02-9]|2[0135]|3[0-24679]|4[67]|5[12]|6[014]|8[056])|4(?:0[124-9]|1[02-579]|2[3-5]|3[0245]|4[0235]|58|6[39]|7[0589]|8[04])|5(?:0[1-57-9]|1[0235-8]|20|3[0149]|4[01]|5[19]|6[1-47]|7[013-5]|8[056])|6(?:0[1-35-9]|1[024-9]|2[03689]|[34][016]|5[017]|6[0-279]|78|8[0-2])|7(?:0[1-46-8]|1[2-9]|2[04-7]|3[1247]|4[037]|5[47]|6[02359]|7[02-59]|8[156])|8(?:0[1-68]|1[02-8]|2[08]|3[0-28]|4[3578]|5[046-9]|6[02-5]|7[028])|9(?:0[1346-9]|1[02-9]|2[0589]|3[0146-8]|4[0179]|5[12469]|7[0-389]|8[04-69]))[2-9]\\d{6}",null,null,null,"2015550123",null,null,null,[7]],[null,null,"(?:2(?:0[1-35-9]|1[02-9]|2[03-589]|3[149]|4[08]|5[1-46]|6[0279]|7[0269]|8[13])|3(?:0[1-57-9]|1[02-9]|2[0135]|3[0-24679]|4[67]|5[12]|6[014]|8[056])|4(?:0[124-9]|1[02-579]|2[3-5]|3[0245]|4[0235]|58|6[39]|7[0589]|8[04])|5(?:0[1-57-9]|1[0235-8]|20|3[0149]|4[01]|5[19]|6[1-47]|7[013-5]|8[056])|6(?:0[1-35-9]|1[024-9]|2[03689]|[34][016]|5[017]|6[0-279]|78|8[0-2])|7(?:0[1-46-8]|1[2-9]|2[04-7]|3[1247]|4[037]|5[47]|6[02359]|7[02-59]|8[156])|8(?:0[1-68]|1[02-8]|2[08]|3[0-28]|4[3578]|5[046-9]|6[02-5]|7[028])|9(?:0[1346-9]|1[02-9]|2[0589]|3[0146-8]|4[0179]|5[12469]|7[0-389]|8[04-69]))[2-9]\\d{6}",null,null,null,"2015550123",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"US",1,"011","1",null,null,"1",null,null,1,[[null,"(\\d{3})(\\d{4})","$1-$2",["[2-9]"]],[null,"(\\d{3})(\\d{3})(\\d{4})","($1) $2-$3",["[2-9]"],null,null,1]],[[null,"(\\d{3})(\\d{3})(\\d{4})","$1-$2-$3",["[2-9]"]]],[null,null,null,null,null,null,null,null,null,[-1]],1,null,[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"710[2-9]\\d{6}",null,null,null,"7102123456"],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],VC:[null,[null,null,"(?:[58]\\d\\d|784|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"784(?:266|3(?:6[6-9]|7\\d|8[0-24-6])|4(?:38|5[0-36-8]|8[0-8])|5(?:55|7[0-2]|93)|638|784)\\d{4}",null,null,null,"7842661234",null,null,null,[7]],[null,null,"784(?:4(?:3[0-5]|5[45]|89|9[0-8])|5(?:2[6-9]|3[0-4]))\\d{4}",null,null,null,"7844301234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"VC",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"784",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],VG:[null,[null,null,"(?:284|[58]\\d\\d|900)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"284(?:(?:229|774|8(?:52|6[459]))\\d|4(?:22\\d|9(?:[45]\\d|6[0-5])))\\d{3}",null,null,null,"2842291234",null,null,null,[7]],[null,null,"284(?:(?:3(?:0[0-3]|4[0-7]|68|9[34])|54[0-57])\\d|4(?:(?:4[0-6]|68)\\d|9(?:6[6-9]|9\\d)))\\d{3}",null,null,null,"2843001234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"VG",1,"011","1",null,null,"1",null,null,null,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"284",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]],VI:[null,[null,null,"(?:(?:34|90)0|[58]\\d\\d)\\d{7}",null,null,null,null,null,null,[10],[7]],[null,null,"340(?:2(?:01|2[06-8]|44|77)|3(?:32|44)|4(?:22|7[34])|5(?:1[34]|55)|6(?:26|4[23]|77|9[023])|7(?:1[2-57-9]|27|7\\d)|884|998)\\d{4}",null,null,null,"3406421234",null,null,null,[7]],[null,null,"340(?:2(?:01|2[06-8]|44|77)|3(?:32|44)|4(?:22|7[34])|5(?:1[34]|55)|6(?:26|4[23]|77|9[023])|7(?:1[2-57-9]|27|7\\d)|884|998)\\d{4}",null,null,null,"3406421234",null,null,null,[7]],[null,null,"8(?:00|33|44|55|66|77|88)[2-9]\\d{6}",null,null,null,"8002345678"],[null,null,"900[2-9]\\d{6}",null,null,null,"9002345678"],[null,null,null,null,null,null,null,null,null,[-1]],[null,null,"5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}",null,null,null,"5002345678"],[null,null,null,null,null,null,null,null,null,[-1]],"VI",1,"011","1",null,null,"1",null,null,1,null,null,[null,null,null,null,null,null,null,null,null,[-1]],null,"340",[null,null,null,null,null,null,null,null,null,[-1]],[null,null,null,null,null,null,null,null,null,[-1]],null,null,[null,null,null,null,null,null,null,null,null,[-1]]]};x.b=function(){return x.a?x.a:x.a=new x};var ul={0:"0",1:"1",2:"2",3:"3",4:"4",5:"5",6:"6",7:"7",8:"8",9:"9","０":"0","１":"1","２":"2","３":"3","４":"4","５":"5","６":"6","７":"7","８":"8","９":"9","٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9","۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9"},tl=RegExp("[+＋]+"),el=RegExp("([0-9０-９٠-٩۰-۹])"),rl=/^\(?\$1\)?$/,il=new S;m(il,11,"NA");var al=/\[([^\[\]])*\]/g,dl=/\d(?=[^,}][^,}])/g,ol=RegExp("^[-x‐-―−ー－-／  ­​⁠　()（）［］.\\[\\]/~⁓∼～]*(\\$\\d[-x‐-―−ー－-／  ­​⁠　()（）［］.\\[\\]/~⁓∼～]*)+$"),sl=/[- ]/;N.prototype.K=function(){this.C="",t(this.i),t(this.u),t(this.m),this.s=0,this.w="",t(this.b),this.h="",t(this.a),this.l=!0,this.A=this.o=this.F=!1,this.f=[],this.B=!1,this.g!=this.J&&(this.g=D(this,this.D))},N.prototype.L=function(l){return this.C=I(this,l)},l("Cleave.AsYouTypeFormatter",N),l("Cleave.AsYouTypeFormatter.prototype.inputDigit",N.prototype.L),l("Cleave.AsYouTypeFormatter.prototype.clear",N.prototype.K)}.call("object"==typeof global&&global?global:window);

/*!
 * in-view 0.6.1 - Get notified when a DOM element enters or exits the viewport.
 * Copyright (c) 2016 Cam Wiegert <cam@camwiegert.com> - https://camwiegert.github.io/in-view
 * License: MIT
 */
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.inView=e():t.inView=e()}(this,function(){return function(t){function e(r){if(n[r])return n[r].exports;var i=n[r]={exports:{},id:r,loaded:!1};return t[r].call(i.exports,i,i.exports,e),i.loaded=!0,i.exports}var n={};return e.m=t,e.c=n,e.p="",e(0)}([function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}var i=n(2),o=r(i);t.exports=o["default"]},function(t,e){function n(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}t.exports=n},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var i=n(9),o=r(i),u=n(3),f=r(u),s=n(4),c=function(){if("undefined"!=typeof window){var t=100,e=["scroll","resize","load"],n={history:[]},r={offset:{},threshold:0,test:s.inViewport},i=(0,o["default"])(function(){n.history.forEach(function(t){n[t].check()})},t);e.forEach(function(t){return addEventListener(t,i)}),window.MutationObserver&&addEventListener("DOMContentLoaded",function(){new MutationObserver(i).observe(document.body,{attributes:!0,childList:!0,subtree:!0})});var u=function(t){if("string"==typeof t){var e=[].slice.call(document.querySelectorAll(t));return n.history.indexOf(t)>-1?n[t].elements=e:(n[t]=(0,f["default"])(e,r),n.history.push(t)),n[t]}};return u.offset=function(t){if(void 0===t)return r.offset;var e=function(t){return"number"==typeof t};return["top","right","bottom","left"].forEach(e(t)?function(e){return r.offset[e]=t}:function(n){return e(t[n])?r.offset[n]=t[n]:null}),r.offset},u.threshold=function(t){return"number"==typeof t&&t>=0&&t<=1?r.threshold=t:r.threshold},u.test=function(t){return"function"==typeof t?r.test=t:r.test},u.is=function(t){return r.test(t,r)},u.offset(0),u}};e["default"]=c()},function(t,e){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0});var r=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),i=function(){function t(e,r){n(this,t),this.options=r,this.elements=e,this.current=[],this.handlers={enter:[],exit:[]},this.singles={enter:[],exit:[]}}return r(t,[{key:"check",value:function(){var t=this;return this.elements.forEach(function(e){var n=t.options.test(e,t.options),r=t.current.indexOf(e),i=r>-1,o=n&&!i,u=!n&&i;o&&(t.current.push(e),t.emit("enter",e)),u&&(t.current.splice(r,1),t.emit("exit",e))}),this}},{key:"on",value:function(t,e){return this.handlers[t].push(e),this}},{key:"once",value:function(t,e){return this.singles[t].unshift(e),this}},{key:"emit",value:function(t,e){for(;this.singles[t].length;)this.singles[t].pop()(e);for(var n=this.handlers[t].length;--n>-1;)this.handlers[t][n](e);return this}}]),t}();e["default"]=function(t,e){return new i(t,e)}},function(t,e){"use strict";function n(t,e){var n=t.getBoundingClientRect(),r=n.top,i=n.right,o=n.bottom,u=n.left,f=n.width,s=n.height,c={t:o,r:window.innerWidth-u,b:window.innerHeight-r,l:i},a={x:e.threshold*f,y:e.threshold*s};return c.t>e.offset.top+a.y&&c.r>e.offset.right+a.x&&c.b>e.offset.bottom+a.y&&c.l>e.offset.left+a.x}Object.defineProperty(e,"__esModule",{value:!0}),e.inViewport=n},function(t,e){(function(e){var n="object"==typeof e&&e&&e.Object===Object&&e;t.exports=n}).call(e,function(){return this}())},function(t,e,n){var r=n(5),i="object"==typeof self&&self&&self.Object===Object&&self,o=r||i||Function("return this")();t.exports=o},function(t,e,n){function r(t,e,n){function r(e){var n=x,r=m;return x=m=void 0,E=e,w=t.apply(r,n)}function a(t){return E=t,j=setTimeout(h,e),M?r(t):w}function l(t){var n=t-O,r=t-E,i=e-n;return _?c(i,g-r):i}function d(t){var n=t-O,r=t-E;return void 0===O||n>=e||n<0||_&&r>=g}function h(){var t=o();return d(t)?p(t):void(j=setTimeout(h,l(t)))}function p(t){return j=void 0,T&&x?r(t):(x=m=void 0,w)}function v(){void 0!==j&&clearTimeout(j),E=0,x=O=m=j=void 0}function y(){return void 0===j?w:p(o())}function b(){var t=o(),n=d(t);if(x=arguments,m=this,O=t,n){if(void 0===j)return a(O);if(_)return j=setTimeout(h,e),r(O)}return void 0===j&&(j=setTimeout(h,e)),w}var x,m,g,w,j,O,E=0,M=!1,_=!1,T=!0;if("function"!=typeof t)throw new TypeError(f);return e=u(e)||0,i(n)&&(M=!!n.leading,_="maxWait"in n,g=_?s(u(n.maxWait)||0,e):g,T="trailing"in n?!!n.trailing:T),b.cancel=v,b.flush=y,b}var i=n(1),o=n(8),u=n(10),f="Expected a function",s=Math.max,c=Math.min;t.exports=r},function(t,e,n){var r=n(6),i=function(){return r.Date.now()};t.exports=i},function(t,e,n){function r(t,e,n){var r=!0,f=!0;if("function"!=typeof t)throw new TypeError(u);return o(n)&&(r="leading"in n?!!n.leading:r,f="trailing"in n?!!n.trailing:f),i(t,e,{leading:r,maxWait:e,trailing:f})}var i=n(7),o=n(1),u="Expected a function";t.exports=r},function(t,e){function n(t){return t}t.exports=n}])});
(function($) {
  return window.lazySizesConfig = {
    addClasses: true,
    preloadAfterLoad: false,
    threshold: 1
  };
});

jQuery(document).ready(function( $ ) {
	var loadmore = 'default';
	// Load More Click Events
	$('.load-more--blog').on('click', function(e){
		e.preventDefault();
		if ('filter' === loadmore) {
			loadMoreFilter();
		} else {
			loadMore();
		}
	});

	$('.load-more--search').on('click', function(e){
		e.preventDefault();
		loadMoreSearch();
	});

	// Load More for Blog 
	function loadMore(){
		var button = $('.load-more'),
		data = {
			'action': 'loadmore',
			'query': loadmore_params.posts,
			'page' : loadmore_params.current_page,
			'number_of_posts' : loadmore_params.number_of_posts
		}
		$.ajax({
			url : loadmore_params.ajaxurl, // AJAX handler
			data : data,
			type : 'POST',
			beforeSend : function ( xhr ) {
			},
			success : function( data ){
				console.log(data);
				if( data ) {
					addPosts(data, button);
					loadmore_params.current_page++;
				} else {
					button.hide(); // if no data, remove the button as well
				}
			}
		});
	}

	function addPosts(data, button){
		var count = 0;
		$(data).each(function(i){
			if ($(this).is('.item')) {
				var card = this;
				setTimeout(function(){
					$('.posts-container').append(card);
					imageFit($(card).find('.item__image img'));
				}, (i * 50));
				count++;
			}
		});
		if (10 > count) {
			button.hide();
		}
	}

// Load More function for Search Page
  function loadMoreSearch(){
    getFilters();
    var button = $('.load-more--search'),
    data = {
      'action': 'loadmore_search',
      'page' : loadmore_params.current_page,
      'search': searchValue
    }
    $.ajax({
      url : loadmore_params.ajaxurl, // AJAX handler
      data : data,
      type : 'POST',
      beforeSend : function ( xhr ) {
      },
      success : function( data ){
        console.log(data);
        if( data ) {
          addSearchPosts(data, button); 
          loadmore_params.current_page++;
        } else {
          button.hide(); // if no data, remove the button as well
        }
      }
    });
  }

  function getFilters() {
    searchValue = [];
    if ($('.search-form-interior__input').val()) {
      searchValue.push($('.search-form-interior__input').val());
    } else {
      searchValue = [];
    }
  }

	function addSearchPosts(data, button){
		var count = 0;
		console.log(data);
		$(data).each(function(i){
			if ($(this).is('.search-item')) {
				var card = this;
				setTimeout(function(){
					$('.search-item__container').append(card);
				}, (i * 50));
				count++;
			}
		});
		if (10 > count) {
			button.hide();
		}
	}


	//Search Filter for Blog
	$('#blog-search').on('submit', function(e){
		e.preventDefault();
		var filters = getSearchFilters();
		filterPosts(filters);
		loadmore = 'filter';
	});

	function filterPosts(filters){
		loadmore_params.current_page = 0;

		var button = $('.load-more--blog'),
	
		data = {
			'action': 'filter',
			'search': filters['search'],
		}
		$.ajax({
			url : loadmore_params.ajaxurl, // AJAX handler
			data : data,
			type : 'POST',
			beforeSend : function ( xhr ) {
			},

			success : function( data ){
				if( data ) {
					$('.load-more--blog').show();
					$('.posts-container').empty();
					// insert new posts
					addPosts(data, button);
					loadmore_params.current_page++;
				} 
				if ( data == 0 ) {
					button.hide();
					$('.posts-container').append('<p class="search-item__no-posts">No posts matched this search. Try searching something else.</p>');
				}
			}
		});
	}

	function getSearchFilters(){
		var filters = [];
		filters['search'] = ($('#blog-search-input').val()) ? $('#blog-search-input').val() : false;
		return filters;
	}

	//Load more for Blog with Filter
	function loadMoreFilter(){
		var button = $('.load-more--blog'),
		filters = getSearchFilters();

		data = {
			'action': 'loadmore_w_filter',
			'search': filters['search'],
			'page' : loadmore_params.current_page,
		}
		$.ajax({
			url : loadmore_params.ajaxurl, // AJAX handler
			data : data,
			type : 'POST',
			beforeSend : function ( xhr ) {
			},
			success : function( data ){
				if( data ) {
					// insert new posts
					addPosts(data, button);
					loadmore_params.current_page++;
				} else {
					button.hide(); // if no data, remove the button as well
				}
			}
		});
	}

});

jQuery(document).ready(function( $ ) {

	// Mobile Nav Open/Close
	$('.header__btn').on('click', function(){
		$('body').toggleClass('expand');
	});

	//close menu when click outside it
	$(document).on('touchend mouseup', function (e) {
		if (!$('.header').is(e.target) && $('.header').has(e.target).length === 0) {
			$('body').removeClass('expand');
		}
	});

	//Mobile Nav Sub Menus
	$('.nav__arrow--mobile').on('click', function(){
		$(this).siblings('.sub-menu').toggleClass('sub-menu--expand');
		$(this).siblings('.nav__link').toggleClass('nav__link--active');
		$(this).toggleClass('nav__arrow--active');
	});

	//Toggle Search Form
	$('.search-form__icon').click(function(e){
		$(this).toggleClass('search-form__icon--active');
		$('.search-form__input').toggleClass('search-form__input--active');
		$(this).parent('.search-form__inner').toggleClass('search-form__inner--active');
		$('.header__join-btn').toggleClass('header__join-btn--hide')
	});

	// Window Size Changing - Img Fit
	$(window).resize(function() {
		$('.item__image img, .feature__image img, .banner__image img, .post-grid__image img, .carousel-video__image img, .card__image img, .cta__image img, .marquee__image img, .grid-people__image img, .featured-image__image img').each(function(){
			imageFit(this);
		});
	});

	// Carousel Height
	$('.carousel-video').on('setPosition', function () {
    $(this).find('.slick-slide').height('auto');
    var slickTrack = $(this).find('.slick-track');
    var slickTrackHeight = $(slickTrack).height();
    $(this).find('.slick-slide').css('height', slickTrackHeight + 'px');
  });

  // Modal
	if ($('.text-modal').length) {
		$('.text-modal').each(function(i){
			var modal = $(this);
			var modalTarget = modal.attr('id');
			var openModal = $('a[href="#' + modalTarget + '"]');
			var closeModal = $(this).find('.text-modal__close');

			// Open Modal
			$(openModal).on('click', function(e){
				e.preventDefault();
				openTextModal(modal);
			});
			// Close modal (close button)
			$(closeModal).on('click', function(e){
				e.preventDefault();
				closeTextModal(modal);
			});
			// Close modal click
			$(window).on('click touchstart', function(e){
				if (e.target == $(modal)[0]) {
					e.preventDefault();
					closeTextModal(modal);
				}
			});
		});

		// Open Modal
		function openTextModal(modal){
			$('body').addClass('modal');
			modal.parents('.card').addClass('card--has-modal');
			modal.addClass('text-modal--show');
		}

		// Close Modal
		function closeTextModal(modal){
			$('body').removeClass('modal');
			modal.parents('.card').removeClass('card--has-modal');
			modal.removeClass('text-modal--show');
		}
	}

	// Video Modal
	if ($('.video-modal').length) {
		$('.video-modal').each(function(i){
			var modal = $(this);
			var modalTarget = modal.attr('id');
			var openModal = $('a[href="#' + modalTarget + '"]');
			var closeModal = $(this).find('.video-modal__close');
			var playerID = $(modal).find('.modal__video-player').attr('id').replace('player', '');

			// Open Modal
			$(openModal).on('click', function(e){
				e.preventDefault();
				openVideoModal(modal, playerID);
			});
			// Close modal (close button)
			$(closeModal).on('click', function(e){
				e.preventDefault();
				closeVideoModal(modal, playerID);
			});
			// Close modal click
			$(window).on('click touchstart', function(e){
				if (e.target == $(modal)[0]) {
					e.preventDefault();
					closeVideoModal(modal, playerID);
				}
			});
		});
		// Open Modal
		function openVideoModal(modal, playerID){
			$('body').addClass('modal');
			modal.addClass('video-modal--show');
			player[playerID].play();
		}
		// Close Modal
		function closeVideoModal(modal, playerID){
			player[playerID].pause();
			$('body').removeClass('modal');
			modal.removeClass('video-modal--show');
		}
	}

	// Remove/add titles from links on hover
	$('[title]').each(function(){
		$(this).data('original-title', $(this).attr('title'));
	}).hover(
	  function () {
			$(this).attr('title','')
	  }, function () {
			$(this).attr('title',$(this).data('original-title'))
	});

	//social share sticky
	function socialShareSticky(){
		var footerTop = $('.author').offset().top;
		var socialShareHeight = $('.share-links').outerHeight();
		var stopPoint = footerTop - socialShareHeight;

		if($(this).scrollTop() < socialShareTop) {
			socialShare.removeClass("share-links-fixed");
			socialShare.removeClass("share-links-stop");
		}
		if ($(this).scrollTop() > socialShareTop) {
			socialShare.addClass("share-links-fixed");
			socialShare.removeClass("share-links-stop");
		}
		if ($(this).scrollTop() >= stopPoint) {
			socialShare.removeClass("share-links-fixed");
			socialShare.addClass("share-links-stop");
		}
	}

	if($('.share-links').length) {
		var socialShare = $('.share-links');
		var socialShareTop = $('.share-links').offset().top;
		$(window).scroll(function () {
			socialShareSticky();
		});
	}

	//Fellow Alumni/Current Switch
	if($('#current').is(':checked')){
		$('#current-grid').show();
		$('#alumni-grid').hide();
	}
	if($('#alumni').is(':checked')){
		$('#alumni-grid').show();
		$('#current-grid').hide();
	}
	$('.toggle').change(function(e){
		if($('#current').is(':checked')){
			$('#current-grid').show();
			$('#alumni-grid').hide();
		}
		if($('#alumni').is(':checked')){
			$('#alumni-grid').show();
			$('#current-grid').hide();
		}
	})

	// Popup window
	$('.popup').click(function(event) {
    var width  = 575,
        height = 400,
        left   = ($(window).width()  - width)  / 2,
        top    = ($(window).height() - height) / 2,
        url    = this.href,
        opts   = 'status=1' +
                 ',width='  + width  +
                 ',height=' + height +
                 ',top='    + top    +
                 ',left='   + left;

    window.open(url, '_blank', opts);
    return false;
	});

}); // End Document Ready