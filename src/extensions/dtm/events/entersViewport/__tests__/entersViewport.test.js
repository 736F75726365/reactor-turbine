'use strict';

describe('entersViewport event type', function() {
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  var delegate;
  var aElement;
  var bElement;

  function createElements() {
    aElement = document.createElement('div');
    aElement.id = 'a';
    aElement.innerHTML = 'a';
    document.body.insertBefore(aElement, document.body.firstChild);

    bElement = document.createElement('div');
    bElement.id = 'b';
    bElement.innerHTML = 'b';
    aElement.appendChild(bElement);
  }

  function removeElements() {
    if (aElement) {
      document.body.removeChild(aElement);
    }
    aElement = bElement = null;
  }

  function assertTriggerCall(options) {
    expect(options.call.args[0].type).toBe('inview');
    expect(options.call.args[0].target).toBe(options.target);
    expect(options.call.args[0].inviewDelay).toBe(options.delay);
    expect(options.call.args[1]).toBe(options.relatedElement);
  }

  beforeAll(function() {
    jasmine.clock().install();
    var publicRequire = require('../../../__tests__/helpers/stubPublicRequire')();
    var delegateInjector = require('inject!../entersViewport');
    delegate = delegateInjector({
      poll: publicRequire('poll'),
      createDataStash: publicRequire('createDataStash'),
      resourceProvider: publicRequire('resourceProvider')
    });
  });

  afterAll(function() {
    jasmine.clock().uninstall();
  });

  beforeEach(function() {
    createElements();
  });

  afterEach(function() {
    removeElements();
    window.scrollTo(0, 0);
  });

  it('calls trigger with event and related element', function() {
    var aTrigger = jasmine.createSpy();

    delegate({
      selector: '#a'
    }, aTrigger);

    // Give time for the poller to cycle.
    jasmine.clock().tick(10000);

    assertTriggerCall({
      call: aTrigger.calls.mostRecent(),
      relatedElement: aElement,
      target: aElement
    });
  });

  it('triggers multiple rules targeting the same element with no delay', function() {
    var aTrigger = jasmine.createSpy();
    var a2Trigger = jasmine.createSpy();

    delegate({
      selector: '#a'
    }, aTrigger);

    delegate({
      selector: '#a'
    }, a2Trigger);

    // Give time for the poller to cycle.
    jasmine.clock().tick(10000);

    expect(aTrigger.calls.count()).toEqual(1);
    expect(a2Trigger.calls.count()).toEqual(1);
  });

  it('triggers multiple rules targeting the same element with same delay', function() {
    var aTrigger = jasmine.createSpy();
    var a2Trigger = jasmine.createSpy();

    delegate({
      selector: '#a',
      delay: 100000
    }, aTrigger);

    delegate({
      selector: '#a',
      delay: 100000
    }, a2Trigger);

    // Give time for the poller to cycle.
    jasmine.clock().tick(50000);

    expect(aTrigger.calls.count()).toEqual(0);
    expect(a2Trigger.calls.count()).toEqual(0);

    jasmine.clock().tick(100000);

    expect(aTrigger.calls.count()).toEqual(1);
    expect(a2Trigger.calls.count()).toEqual(1);
  });

  it('triggers multiple rules targeting the same element with different delays', function() {
    var aTrigger = jasmine.createSpy();
    var a2Trigger = jasmine.createSpy();

    delegate({
      selector: '#a',
      delay: 100000
    }, aTrigger);

    delegate({
      selector: '#a',
      delay: 200000
    }, a2Trigger);

    // Give time for the poller to cycle.
    jasmine.clock().tick(50000);

    expect(aTrigger.calls.count()).toEqual(0);
    expect(a2Trigger.calls.count()).toEqual(0);

    jasmine.clock().tick(100000);

    expect(aTrigger.calls.count()).toEqual(1);
    expect(a2Trigger.calls.count()).toEqual(0);

    jasmine.clock().tick(100000);

    expect(aTrigger.calls.count()).toEqual(1);
    expect(a2Trigger.calls.count()).toEqual(1);
  });

  it('triggers multiple rules targeting the same element with different selectors', function() {
    var aTrigger = jasmine.createSpy();
    var a2Trigger = jasmine.createSpy();

    delegate({
      selector: '#a'
    }, aTrigger);

    delegate({
      selector: 'div#a'
    }, a2Trigger);

    // Give time for the poller to cycle.
    jasmine.clock().tick(10000);

    expect(aTrigger.calls.count()).toEqual(1);
    expect(a2Trigger.calls.count()).toEqual(1);
  });

  it('triggers rule when elementProperties match', function() {
    var bTrigger = jasmine.createSpy();

    delegate({
      selector: '#b',
      elementProperties: {
        innerHTML: 'b'
      }
    }, bTrigger);

    // Give time for the poller to cycle.
    jasmine.clock().tick(10000);

    expect(bTrigger.calls.count()).toEqual(1);
  });

  it('does not trigger rule when elementProperties do not match', function() {
    var bTrigger = jasmine.createSpy();

    delegate({
      selector: '#b',
      elementProperties: {
        innerHTML: 'no match'
      }
    }, bTrigger);

    // Give time for the poller to cycle.
    jasmine.clock().tick(10000);

    expect(bTrigger.calls.count()).toEqual(0);
  });

  // iOS Safari doesn't allow iframes to have overflow (scrollbars) but instead pushes the
  // iframe's height to match the height of the content. Since by default Karma loads tests into an
  // iFrame, these scrolling tests fail. There is a setting to not use an iFrame, but it's not
  // awesome because you have to make sure every browser you're testing on is not blocking pop-ups.
  // That is, until this issue is resolved: https://github.com/karma-runner/karma/issues/849
  // Until then, we're skipping these tests on iOS.
  if (!isIOS) {
    describe('with scrolling', function() {
      it('triggers rule with no delay', function() {
        aElement.style.position = 'absolute';
        aElement.style.top = '3000px';

        var aTrigger = jasmine.createSpy();

        delegate({
          selector: '#a'
        }, aTrigger);

        Simulate.event(window, 'scroll');

        // The rule shouldn't be triggered because the element isn't in view.
        expect(aTrigger.calls.count()).toEqual(0);

        window.scrollTo(0, 3000);
        Simulate.event(window, 'scroll');

        expect(aTrigger.calls.count()).toEqual(1);
      });

      it('triggers rules with various delays targeting elements at various positions', function() {
        aElement.style.position = 'absolute';
        aElement.style.top = '10000px';

        bElement.style.position = 'absolute';
        bElement.style.top = '10000px';

        var aTrigger = jasmine.createSpy();
        var bTrigger = jasmine.createSpy();
        var b2Trigger = jasmine.createSpy();

        delegate({
          selector: '#a'
        }, aTrigger);

        delegate({
          selector: '#b',
          delay: 50000
        }, bTrigger);

        delegate({
          selector: '#b',
          delay: 200000
        }, b2Trigger);

        Simulate.event(window, 'scroll');

        expect(aTrigger.calls.count()).toEqual(0);
        expect(bTrigger.calls.count()).toEqual(0);
        expect(b2Trigger.calls.count()).toEqual(0);

        window.scrollTo(0, 10000);
        Simulate.event(window, 'scroll');

        expect(aTrigger.calls.count()).toEqual(1);
        expect(bTrigger.calls.count()).toEqual(0);
        expect(b2Trigger.calls.count()).toEqual(0);

        window.scrollTo(0, 0);
        Simulate.event(window, 'scroll');

        window.scrollTo(0, 10000);
        Simulate.event(window, 'scroll');

        // The first trigger should only be called the first time the element comes into view.
        expect(aTrigger.calls.count()).toEqual(1);
        expect(bTrigger.calls.count()).toEqual(0);
        expect(b2Trigger.calls.count()).toEqual(0);

        window.scrollTo(0, 20000);
        Simulate.event(window, 'scroll');

        expect(aTrigger.calls.count()).toEqual(1);
        expect(bTrigger.calls.count()).toEqual(0);
        expect(b2Trigger.calls.count()).toEqual(0);

        window.scrollTo(0, 0);
        Simulate.event(window, 'scroll');

        // Give enough time for the configured delay time to pass. The b element rules
        // shouldn't be triggered because the b element is no longer in view.
        jasmine.clock().tick(100000);

        expect(aTrigger.calls.count()).toEqual(1);
        expect(bTrigger.calls.count()).toEqual(0);
        expect(b2Trigger.calls.count()).toEqual(0);

        window.scrollTo(0, 20000);
        Simulate.event(window, 'scroll');

        // Give time for the poller to cycle and enough time for the configured delay time to
        // pass. The second trigger should be called.
        jasmine.clock().tick(50000);
        expect(aTrigger.calls.count()).toEqual(1);
        expect(bTrigger.calls.count()).toEqual(1);
        expect(b2Trigger.calls.count()).toEqual(0);

        // A different rule watching for the same element but an even longer delay time? Oh my!
        jasmine.clock().tick(200000);
        expect(aTrigger.calls.count()).toEqual(1);
        expect(bTrigger.calls.count()).toEqual(1);
        expect(b2Trigger.calls.count()).toEqual(1);
      });
    });
  }
});
