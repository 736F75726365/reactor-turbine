/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

'use strict';

describe('function returned by createPublicRequire', function() {
  var injectCreatePublicRequire = require('inject!../createPublicRequire');

  it('should return the static core modules', function() {
    var promiseMock = {};
    var assignMock = {};
    var clientInfoMock = {};
    var loadScriptMock = {};
    var getQueryParamMock = {};
    var isPlainObjectMock = {};
    var getDataElementMock = {};
    var cookieMock = {};
    var debounceMock = {};
    var onceMock = {};
    var writeHtmlMock = {};
    var replaceTokensMock = {};
    var onPageBottomMock = {};
    var weakMapMock = {};
    var windowMock = {};
    var documentMock = {};

    var createPublicRequire = injectCreatePublicRequire({
      './public/Promise': promiseMock,
      './public/WeakMap': weakMapMock,
      './public/assign': assignMock,
      './public/clientInfo': clientInfoMock,
      './public/loadScript': loadScriptMock,
      './public/getQueryParam': getQueryParamMock,
      './public/isPlainObject': isPlainObjectMock,
      './public/getDataElementValue': getDataElementMock,
      './public/cookie': cookieMock,
      './public/debounce': debounceMock,
      './public/once': onceMock,
      './public/writeHtml': writeHtmlMock,
      './public/replaceTokens': replaceTokensMock,
      './public/onPageBottom': onPageBottomMock,
      'window': windowMock,
      'document': documentMock
    });

    var publicRequire = createPublicRequire();

    expect(publicRequire('@turbine/promise')).toBe(promiseMock);
    expect(publicRequire('@turbine/weak-map')).toBe(weakMapMock);
    expect(publicRequire('@turbine/assign')).toBe(assignMock);
    expect(publicRequire('@turbine/client-info')).toBe(clientInfoMock);
    expect(publicRequire('@turbine/load-script')).toBe(loadScriptMock);
    expect(publicRequire('@turbine/get-query-param')).toBe(getQueryParamMock);
    expect(publicRequire('@turbine/is-plain-object')).toBe(isPlainObjectMock);
    expect(publicRequire('@turbine/get-data-element-value')).toBe(getDataElementMock);
    expect(publicRequire('@turbine/cookie')).toBe(cookieMock);
    expect(publicRequire('@turbine/debounce')).toBe(debounceMock);
    expect(publicRequire('@turbine/once')).toBe(onceMock);
    expect(publicRequire('@turbine/write-html')).toBe(writeHtmlMock);
    expect(publicRequire('@turbine/replace-tokens')).toBe(replaceTokensMock);
    expect(publicRequire('@turbine/on-page-bottom')).toBe(onPageBottomMock);
    expect(publicRequire('@turbine/window')).toBe(windowMock);
    expect(publicRequire('@turbine/document')).toBe(documentMock);
  });

  it('should return the dynamic core modules', function() {
    var loggerMock = {};
    var buildInfoMock = {};
    var propertySettingsMock = {};
    var getExtensionSettingsMock = {};
    var getSharedModuleMock = {};
    var getHostedLibFileUrlMock = {};

    var createPublicRequire = injectCreatePublicRequire({});
    var publicRequire = createPublicRequire({
      logger: loggerMock,
      buildInfo: buildInfoMock,
      propertySettings: propertySettingsMock,
      getExtensionSettings: getExtensionSettingsMock,
      getSharedModuleExports: getSharedModuleMock,
      getHostedLibFileUrl: getHostedLibFileUrlMock
    });

    expect(publicRequire('@turbine/logger')).toBe(loggerMock);
    expect(publicRequire('@turbine/build-info')).toBe(buildInfoMock);
    expect(publicRequire('@turbine/property-settings')).toBe(propertySettingsMock);
    expect(publicRequire('@turbine/get-extension-settings'))
      .toBe(getExtensionSettingsMock);
    expect(publicRequire('@turbine/get-shared-module')).toBe(getSharedModuleMock);
    expect(publicRequire('@turbine/get-hosted-lib-file-url')).toBe(getHostedLibFileUrlMock);
  });

  it('should call for relative module when relative path is used', function() {
    var relativeModuleMock = {};

    var createPublicRequire = injectCreatePublicRequire({});

    var getModuleExportsByRelativePath = jasmine.createSpy().and.callFake(function() {
      return relativeModuleMock;
    });

    var publicRequire = createPublicRequire({
      getModuleExportsByRelativePath: getModuleExportsByRelativePath
    });

    expect(publicRequire('./foo/bar.js')).toBe(relativeModuleMock);
    expect(getModuleExportsByRelativePath).toHaveBeenCalledWith('./foo/bar.js');

    expect(publicRequire('../../foo/bar.js')).toBe(relativeModuleMock);
    expect(getModuleExportsByRelativePath).toHaveBeenCalledWith('../../foo/bar.js');
  });

  it('should throw error when a module that is neither core nor relative is required', function() {
    var createPublicRequire = injectCreatePublicRequire({});
    var publicRequire = createPublicRequire();
    expect(function() {
      publicRequire('@turbine/invalidmodulename');
    }).toThrowError(Error);
  });

});
