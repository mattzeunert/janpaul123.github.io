(function() {
  var BackgroundView, ContentContainerView, IframeView, ItemView, MenuContainerView, Router, globalOnScroll, imageAngle, imageDistance, imageHeight, imageMargin, lastRotateAngle, log, makeBetweenMinus180And180, numberOfImages, pauseAllVimeoPlayers, rotateCarouselTo, setCss3, transitionEnd, updateCarouselOpacities, updateVimeoPlayers, vimeoPlayers,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  setCss3 = function($element, name, value, addBrowserToValue) {
    var browser, _i, _len, _ref, _results;
    _ref = ['', '-ms-', '-moz-', '-webkit-', '-o-'];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      browser = _ref[_i];
      if (addBrowserToValue) {
        _results.push($element.css(browser + name, browser + value));
      } else {
        _results.push($element.css(browser + name, value));
      }
    }
    return _results;
  };

  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

  log = function() {};

  transitionEnd = 'transitionend webkitTransitionEnd oTransitionEnd';

  window.selectedItemView = null;

  BackgroundView = (function(_super) {
    __extends(BackgroundView, _super);

    function BackgroundView() {
      this.moveBackgroundRightEnd = __bind(this.moveBackgroundRightEnd, this);
      this.moveBackgroundRightMiddle = __bind(this.moveBackgroundRightMiddle, this);
      this.moveBackgroundRightStart = __bind(this.moveBackgroundRightStart, this);
      this.moveBackgroundLeftEnd = __bind(this.moveBackgroundLeftEnd, this);
      this.moveBackgroundLeftStart = __bind(this.moveBackgroundLeftStart, this);
      this._onScroll = __bind(this._onScroll, this);
      return BackgroundView.__super__.constructor.apply(this, arguments);
    }

    BackgroundView.prototype._topOffset = 100;

    BackgroundView.prototype.template = function() {
      return '';
    };

    BackgroundView.prototype.onRender = function() {
      var _onScroll;
      this._height = 0;
      this.$window = $(window);
      _onScroll = _.throttle(this._onScroll, 5);
      this.$window.on('scroll', _onScroll);
      return _onScroll();
    };

    BackgroundView.prototype._onScroll = function() {
      if (this._stopUpdating) {
        return;
      }
      this._updateScroll();
      return this._updateHeight();
    };

    BackgroundView.prototype._updateScroll = function() {
      var x;
      this._y = this._scrollTopToY();
      x = (this._movedLeft ? -200 : 0);
      return setCss3(this.$el, 'transform', "translate3d(" + x + "px, " + (-this._y) + "px, -1px)");
    };

    BackgroundView.prototype._updateHeight = function() {
      if (this._y + this.$window.height() >= this._height - this._topOffset - 100) {
        this._height = this._y + this.$window.height() + this._topOffset + 500;
        return this.$el.height(this._height);
      }
    };

    BackgroundView.prototype._scrollTopToY = function() {
      var scrollTop;
      scrollTop = this._movedUp ? 0 : this._scrollTop();
      return Math.max(-this._topOffset, parseFloat((scrollTop / 4).toFixed(2)) + 0.005);
    };

    BackgroundView.prototype._scrollTop = function() {
      var _ref, _ref1;
      return (_ref = (_ref1 = window.contentContainerView) != null ? _ref1.scrollTop() : void 0) != null ? _ref : this.$window.scrollTop();
    };

    BackgroundView.prototype.moveBackgroundLeftStart = function() {
      log('moveBackgroundLeftStart');
      this.$el.off(transitionEnd);
      this._stopUpdating = false;
      this._movedLeft = true;
      this._movedUp = true;
      this._onScroll();
      this.$el.addClass('background-animating');
      return this.$el.on(transitionEnd, this.moveBackgroundLeftEnd);
    };

    BackgroundView.prototype.moveBackgroundLeftEnd = function() {
      log('moveBackgroundLeftEnd');
      this.$el.off(transitionEnd);
      this._stopUpdating = false;
      this._movedLeft = true;
      this._movedUp = false;
      this.$el.removeClass('background-animating');
      return this._onScroll();
    };

    BackgroundView.prototype.moveBackgroundRightStart = function() {
      log('moveBackgroundRightStart');
      this.$el.off(transitionEnd);
      this._onScroll();
      this._stopUpdating = true;
      this._movedLeft = false;
      return this._movedUp = false;
    };

    BackgroundView.prototype.moveBackgroundRightMiddle = function() {
      log('moveBackgroundRightMiddle');
      this.$el.off(transitionEnd);
      this.$el.addClass('background-animating');
      this._stopUpdating = false;
      this._movedLeft = false;
      this._movedUp = false;
      this._onScroll();
      return this.$el.on(transitionEnd, this.moveBackgroundRightEnd);
    };

    BackgroundView.prototype.moveBackgroundRightEnd = function() {
      log('moveBackgroundRightEnd');
      this.$el.off(transitionEnd);
      this.$el.removeClass('background-animating');
      this._stopUpdating = false;
      this._movedLeft = false;
      this._movedUp = false;
      return this._onScroll();
    };

    return BackgroundView;

  })(Backbone.Marionette.ItemView);

  ContentContainerView = (function(_super) {
    __extends(ContentContainerView, _super);

    function ContentContainerView() {
      this.moveContentRightEnd = __bind(this.moveContentRightEnd, this);
      this.moveContentRightMiddle = __bind(this.moveContentRightMiddle, this);
      this.moveContentRightStart = __bind(this.moveContentRightStart, this);
      this.showContentEnd = __bind(this.showContentEnd, this);
      this.showContentStart = __bind(this.showContentStart, this);
      this.template = __bind(this.template, this);
      return ContentContainerView.__super__.constructor.apply(this, arguments);
    }

    ContentContainerView.prototype.template = function() {
      return "<div class=\"js-iframe-region\"></div>";
    };

    ContentContainerView.prototype.regions = {
      iframeRegion: '.js-iframe-region'
    };

    ContentContainerView.prototype.showContentStart = function(url) {
      log('showContentStart');
      this._reset();
      $(window).scrollTop(0);
      return this.showIframe(url, (function(_this) {
        return function() {
          _this.$el.on(transitionEnd, _this.showContentEnd);
          return _this.$el.addClass('content-container-visible content-container-animated');
        };
      })(this));
    };

    ContentContainerView.prototype.showContentEnd = function() {
      log('showContentEnd');
      this._reset();
      this.$el.addClass('content-container-visible');
      $(window).scrollTop(0);
      return window.router.fixScrollPosition();
    };

    ContentContainerView.prototype.moveContentRightStart = function() {
      var _ref;
      log('moveContentRightStart');
      this._reset();
      this.$el.addClass('content-container-visible content-container-fixed');
      $(window).scrollTop(0);
      return (_ref = this.iframeRegion.currentView) != null ? _ref.deactivate() : void 0;
    };

    ContentContainerView.prototype.moveContentRightMiddle = function() {
      log('moveContentRightMiddle');
      this.$el.addClass('content-container-move-right');
      return this.$el.on(transitionEnd, this.moveContentRightEnd);
    };

    ContentContainerView.prototype.moveContentRightEnd = function() {
      log('moveContentRightEnd');
      this._reset();
      return this.iframeRegion.close();
    };

    ContentContainerView.prototype._reset = function() {
      this.$el.off(transitionEnd);
      return this.$el.removeClass('content-container-visible content-container-animated content-container-fixed content-container-move-right');
    };

    ContentContainerView.prototype.showIframe = function(url, onLoad) {
      var iframeView, onLoadOnce;
      onLoadOnce = _.once(onLoad);
      setTimeout(onLoadOnce, 500);
      iframeView = new IframeView({
        url: url
      });
      this.listenTo(iframeView, 'onLoad', onLoadOnce);
      return this.iframeRegion.show(iframeView);
    };

    ContentContainerView.prototype.scrollTop = function() {
      var _ref;
      return (_ref = this.iframeRegion.currentView) != null ? _ref.scrollTop() : void 0;
    };

    return ContentContainerView;

  })(Backbone.Marionette.Layout);

  MenuContainerView = (function(_super) {
    __extends(MenuContainerView, _super);

    function MenuContainerView() {
      this.moveMenuContainerRightEnd = __bind(this.moveMenuContainerRightEnd, this);
      this.moveMenuContainerRightMiddle = __bind(this.moveMenuContainerRightMiddle, this);
      this.moveMenuContainerRightStart = __bind(this.moveMenuContainerRightStart, this);
      this.moveMenuContainerLeftEnd = __bind(this.moveMenuContainerLeftEnd, this);
      this.moveMenuContainerLeftStart = __bind(this.moveMenuContainerLeftStart, this);
      return MenuContainerView.__super__.constructor.apply(this, arguments);
    }

    MenuContainerView.prototype.moveMenuContainerLeftStart = function() {
      log('moveMenuContainerLeftStart');
      this.$el.off(transitionEnd);
      this.$el.addClass('menu-container-move-left menu-container-animated');
      this.$el.height($(window).scrollTop() + $(window).height());
      return this.$el.on(transitionEnd, this.moveMenuContainerLeftEnd);
    };

    MenuContainerView.prototype.moveMenuContainerLeftEnd = function(e) {
      if (!((e == null) || e.target === this.$el[0])) {
        return;
      }
      log('moveMenuContainerLeftEnd');
      this.$el.off(transitionEnd);
      this.$el.hide();
      this.$el.removeClass('menu-container-move-left menu-container-animated');
      return this.$el.height('101%');
    };

    MenuContainerView.prototype.moveMenuContainerRightStart = function() {
      log('moveMenuContainerRightStart');
      this.$el.off(transitionEnd);
      this.$el.show();
      this.$el.css('visibility', 'hidden');
      return this.$el.removeClass('menu-container-move-left menu-container-animated');
    };

    MenuContainerView.prototype.moveMenuContainerRightMiddle = function() {
      log('moveMenuContainerRightMiddle');
      this.$el.off(transitionEnd);
      this.$el.addClass('menu-container-move-left');
      this.$el.removeClass('menu-container-animated');
      this.$el.css('visibility', 'visible');
      return window.requestAnimationFrame((function(_this) {
        return function() {
          return window.requestAnimationFrame(function() {
            _this.$el.addClass('menu-container-animated');
            _this.$el.removeClass('menu-container-move-left');
            _this.$el.on(transitionEnd, _this.moveMenuContainerRightEnd);
            contentContainerView.moveContentRightMiddle();
            return backgroundView.moveBackgroundRightMiddle();
          });
        };
      })(this));
    };

    MenuContainerView.prototype.moveMenuContainerRightEnd = function(e) {
      if (e.target !== this.$el[0]) {
        return;
      }
      log('moveMenuContainerRightEnd');
      this.$el.off(transitionEnd);
      this.$el.removeClass('menu-container-animated');
      window.selectedItemView.deselectItemEnd();
      return window.router.fixScrollPosition();
    };

    MenuContainerView.prototype.height = function() {
      return this.$('.js-menu').height();
    };

    return MenuContainerView;

  })(Backbone.Marionette.ItemView);

  ItemView = (function(_super) {
    __extends(ItemView, _super);

    function ItemView() {
      this.reset = __bind(this.reset, this);
      this.deselectItemEnd = __bind(this.deselectItemEnd, this);
      this.deselectItemMiddle = __bind(this.deselectItemMiddle, this);
      this.deselectItemStart = __bind(this.deselectItemStart, this);
      this.selectItemEnd = __bind(this.selectItemEnd, this);
      this.selectItemMiddle = __bind(this.selectItemMiddle, this);
      this.selectItemStart = __bind(this.selectItemStart, this);
      return ItemView.__super__.constructor.apply(this, arguments);
    }

    ItemView.prototype.initialize = function() {
      var innerLink, innerTime, linkHref;
      this._viewHref = this.$el.data('href') || this.$el.attr('href');
      linkHref = this.$el.attr('href');
      this.$el.attr('href', '#' + this.$el.attr('id'));
      innerLink = "<a href='" + linkHref + "' target='_blank'>" + (this.$el.data('host')) + "</a>";
      innerTime = _.compact([innerLink, this.$el.data('with'), this.$el.data('time')]).join(', ');
      this.$animatedEl = $("<div><a href='#' class='item-animated-back'><span class='icon-hand-left'></span> Back</a><div class='item-animated-inner'><div class='item-animated-inner-title'>" + (this.$el.html()) + "</div><div class='item-animated-inner-description'><div class='item-animated-inner-time'>" + innerTime + "</div>" + (this.$el.data('description')) + "</div></div></div>");
      this.$animatedEl.addClass(this.$el.attr('class'));
      this.$animatedEl.addClass('item-animated');
      return $('.js-item-animated-container').append(this.$animatedEl);
    };

    ItemView.prototype.href = function() {
      return this._viewHref;
    };

    ItemView.prototype.selectItemStart = function() {
      var offset, _ref;
      log('selectItemStart');
      if ((_ref = window.selectedItemView) != null) {
        _ref.deselectItemEnd();
      }
      window.selectedItemView = this;
      this.lastScrollTop = $(window).scrollTop();
      this.reset();
      offset = this.$el.offset();
      this.$animatedEl.css({
        left: offset.left,
        top: offset.top - $(window).scrollTop(),
        right: $(window).width() - offset.left - this.$el.outerWidth()
      });
      this.$animatedEl.addClass('item-animated-select-start item-animated-active');
      this.$el.addClass('item-hidden');
      menuContainerView.moveMenuContainerLeftStart();
      backgroundView.moveBackgroundLeftStart();
      _.delay(this.selectItemMiddle, 300);
      return _.delay(((function(_this) {
        return function() {
          return contentContainerView.showContentStart(_this.href());
        };
      })(this)), 650);
    };

    ItemView.prototype.selectItemMiddle = function() {
      log('selectItemMiddle');
      this.reset();
      this.$animatedEl.addClass('item-animated-select-middle item-animated-active');
      this.$el.addClass('item-hidden');
      return this.$animatedEl.on(transitionEnd, this.selectItemEnd);
    };

    ItemView.prototype.selectItemEnd = function(e) {
      var _ref;
      if (!((e == null) || e.target === this.$animatedEl[0])) {
        return;
      }
      log('selectItemEnd');
      if ((_ref = window.selectedItemView) != null) {
        _ref.deselectItemEnd();
      }
      window.selectedItemView = this;
      this.reset();
      this.$animatedEl.addClass('item-animated-select-end item-animated-active');
      return this.$el.addClass('item-hidden');
    };

    ItemView.prototype.deselectItemStart = function() {
      log('deselectItemStart');
      this.reset();
      this.$el.addClass('item-hidden');
      this.$animatedEl.addClass('item-animated-deselect-start item-animated-active');
      backgroundView.moveBackgroundRightStart();
      menuContainerView.moveMenuContainerRightStart();
      contentContainerView.moveContentRightStart();
      return window.requestAnimationFrame((function(_this) {
        return function() {
          return window.requestAnimationFrame(_this.deselectItemMiddle);
        };
      })(this));
    };

    ItemView.prototype.deselectItemMiddle = function() {
      var newScrollTop, offset;
      log('deselectItemMiddle');
      this.reset();
      this.$el.addClass('item-hidden');
      this.$animatedEl.addClass('item-animated-deselect-middle');
      $(window).scrollTop(1);
      newScrollTop = this._restoreScrollTop(this.lastScrollTop);
      $(window).scrollTop(newScrollTop);
      log('restoring scroll position', $(window).scrollTop(), newScrollTop, this.lastScrollTop);
      offset = this.$el.offset();
      this.$animatedEl.css({
        left: offset.left,
        top: offset.top - $(window).scrollTop(),
        right: $(window).width() - offset.left - this.$el.outerWidth() - 0.5
      });
      return _.delay(menuContainerView.moveMenuContainerRightMiddle, 300);
    };

    ItemView.prototype.deselectItemEnd = function() {
      log('deselectItemEnd');
      this.reset();
      window.selectedItemView = null;
      return _.defer(globalOnScroll);
    };

    ItemView.prototype.reset = function() {
      this.$el.removeClass('item-hidden');
      this.$animatedEl.css({
        left: '',
        top: '',
        right: ''
      });
      this.$animatedEl.removeClass('item-animated-select-start item-animated-select-middle item-animated-select-end');
      this.$animatedEl.removeClass('item-animated-deselect-start item-animated-deselect-middle');
      this.$animatedEl.removeClass('item-animated-active');
      return this.$animatedEl.off(transitionEnd);
    };

    ItemView.prototype._restoreScrollTop = function(scrollTop) {
      var offset, pageHeight, windowHeight, _ref;
      windowHeight = $(window).height();
      pageHeight = menuContainerView.height();
      offset = this.$el.offset();
      if (!((scrollTop != null) && (scrollTop + 100 < (_ref = offset.top) && _ref < scrollTop + windowHeight - 100))) {
        scrollTop = offset.top + 36 / 2 - windowHeight / 2;
      }
      if (scrollTop >= pageHeight - windowHeight) {
        scrollTop = pageHeight - windowHeight;
      }
      return Math.floor(scrollTop);
    };

    return ItemView;

  })(Backbone.Marionette.ItemView);

  IframeView = (function(_super) {
    __extends(IframeView, _super);

    function IframeView() {
      return IframeView.__super__.constructor.apply(this, arguments);
    }

    IframeView.prototype.template = function() {
      return '';
    };

    IframeView.prototype.onRender = function() {
      log('iframe onRender', this.options.url);
      this.$el.html("<iframe class='content-iframe' scrolling='yes' frameborder='0' src='" + this.options.url + "'></iframe>");
      return this._iframe().on('load', (function(_this) {
        return function() {
          return _this.onLoad();
        };
      })(this));
    };

    IframeView.prototype.onLoad = function() {
      log('iframe onLoad', this.options.url);
      this._active = true;
      this._setClass();
      this._bindScroll();
      return this.trigger('onLoad');
    };

    IframeView.prototype._iframe = function() {
      return this.$('iframe');
    };

    IframeView.prototype._setClass = function() {
      var doc;
      doc = this._document();
      if (doc) {
        $(doc.body.parentNode).addClass('jpp-iframe');
        return $(doc.documentElement).find('html').addClass('jpp-iframe');
      }
    };

    IframeView.prototype._bindScroll = function() {
      var $window, iframeWindow;
      if (this._document() == null) {
        return;
      }
      iframeWindow = this._iframe()[0].contentWindow;
      $window = $(window);
      if (iframeWindow) {
        return $(iframeWindow).on('scroll', (function() {
          return $window.trigger('scroll');
        }));
      }
    };

    IframeView.prototype.scrollTop = function() {
      var _ref;
      if (!this._active) {
        return null;
      }
      return (_ref = this._document()) != null ? _ref.body.scrollTop : void 0;
    };

    IframeView.prototype._document = function() {
      var e, _ref;
      try {
        return (_ref = this._iframe()[0].contentDocument) != null ? _ref : this._iframe()[0].contentWindow.document;
      } catch (_error) {
        e = _error;
        console.error(e);
        return null;
      }
    };

    IframeView.prototype.deactivate = function() {
      return this._active = false;
    };

    return IframeView;

  })(Backbone.Marionette.ItemView);

  Router = (function(_super) {
    __extends(Router, _super);

    function Router() {
      this._onScroll = __bind(this._onScroll, this);
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.routes = {
      '': '_showIndex',
      ':page': '_showPage'
    };

    Router.prototype.initialize = function() {
      this.$window = $(window);
      this.$window.on('scroll', _.throttle(this._onScroll, 5));
      this._onScroll();
      return this._onScroll();
    };

    Router.prototype._onScroll = function() {
      this._previousScrollTop = this._scrollTop;
      this._scrollTop = window.pageYOffset;
      log('@_scrollTop', this._scrollTop);
      return globalOnScroll();
    };

    Router.prototype.fixScrollPosition = function() {
      return this._previousScrollTop = this._scrollTop = window.pageYOffset;
    };

    Router.prototype._showIndex = function() {
      this._restoreScrollTop();
      return this._index();
    };

    Router.prototype._showPage = function(page) {
      if (!($("a[name=" + page + "]").length > 0)) {
        this._restoreScrollTop();
      }
      return this._page(page);
    };

    Router.prototype._restoreScrollTop = function() {
      var scrollTop;
      if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
        scrollTop = this._scrollTop;
      } else {
        scrollTop = this._previousScrollTop;
      }
      this.$window.scrollTop(scrollTop);
      return window.requestAnimationFrame((function(_this) {
        return function() {
          return _this.$window.scrollTop(scrollTop);
        };
      })(this));
    };

    Router.prototype.navigateToIndex = function() {
      this.navigate('');
      return this._index();
    };

    Router.prototype.navigateToPage = function(page) {
      this.navigate(page);
      return this._page(page);
    };

    Router.prototype._index = function() {
      if (this._loaded && (typeof selectedItemView !== "undefined" && selectedItemView !== null)) {
        selectedItemView.deselectItemStart();
      }
      return this._showBodyContent();
    };

    Router.prototype._page = function(page) {
      if (itemViews[page] != null) {
        if (!this._loaded || (typeof selectedItemView !== "undefined" && selectedItemView !== null)) {
          this._showFirstItemView(itemViews[page]);
        } else {
          itemViews[page].selectItemStart();
        }
      } else {
        this._index();
      }
      this._showBodyContent();
      return pauseAllVimeoPlayers();
    };

    Router.prototype._showFirstItemView = function(itemView) {
      itemView.selectItemEnd();
      menuContainerView.moveMenuContainerLeftEnd();
      contentContainerView.showContentStart(itemView.href());
      return backgroundView.moveBackgroundLeftEnd();
    };

    Router.prototype._showBodyContent = function() {
      this._loaded = true;
      return $('.body-loading').removeClass('body-loading');
    };

    return Router;

  })(Backbone.Router);

  $(function() {
    var el, email, _i, _len, _ref;
    window.backgroundView = new BackgroundView({
      el: $('.js-background')
    }).render();
    window.contentContainerView = new ContentContainerView({
      el: $('.js-content-container')
    }).render();
    window.menuContainerView = new MenuContainerView({
      el: $('.js-menu-container')
    });
    window.itemViews = {};
    _ref = $('.js-item');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      el = _ref[_i];
      window.itemViews[$(el).attr('id')] = new ItemView({
        el: el
      });
    }
    window.router = new Router;
    Backbone.history.start();
    email = 'mailto:j' + '@' + 'npaulpos';
    email += '.ma';
    return $('#email').attr('href', email);
  });

  globalOnScroll = function() {
    return updateVimeoPlayers();
  };

  vimeoPlayers = [];

  $(function() {
    return $('.js-vimeo-player').each(function() {
      var $iframe, player;
      $iframe = $(this);
      player = $f(this);
      return player.addEvent('ready', function() {
        vimeoPlayers.push({
          $iframe: $iframe,
          player: player
        });
        player.addEvent('pause', function() {
          $iframe.data('playing', '');
          return log('vimeo paused', $iframe[0]);
        });
        player.addEvent('play', function() {
          $iframe.data('playing', 'true');
          return log('vimeo playing', $iframe[0]);
        });
        return updateVimeoPlayers();
      });
    });
  });

  updateVimeoPlayers = function() {
    var boundingRect, vimeoPlayer, _i, _len, _results;
    if (selectedItemView) {
      return;
    }
    _results = [];
    for (_i = 0, _len = vimeoPlayers.length; _i < _len; _i++) {
      vimeoPlayer = vimeoPlayers[_i];
      boundingRect = vimeoPlayer.$iframe[0].getBoundingClientRect();
      if (boundingRect.bottom > 0 && boundingRect.top < window.innerHeight) {
        if (vimeoPlayer.$iframe.data('playing') !== 'true') {
          vimeoPlayer.player.api('play');
          _results.push(log('vimeo starting to play', vimeoPlayer.$iframe[0]));
        } else {
          _results.push(void 0);
        }
      } else if (vimeoPlayer.$iframe.data('playing') === 'true') {
        vimeoPlayer.player.api('pause');
        _results.push(log('vimeo starting to pause', vimeoPlayer.$iframe[0]));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  pauseAllVimeoPlayers = function() {
    var vimeoPlayer, _i, _len, _results;
    log('pauseAllVimeoPlayers');
    _results = [];
    for (_i = 0, _len = vimeoPlayers.length; _i < _len; _i++) {
      vimeoPlayer = vimeoPlayers[_i];
      if (vimeoPlayer.$iframe.data('playing') === 'true') {
        vimeoPlayer.player.api('pause');
        _results.push(log('vimeo starting to pause', vimeoPlayer.$iframe[0]));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  imageHeight = 250;

  imageMargin = 0;

  numberOfImages = 21;

  imageAngle = 360 / numberOfImages;

  imageDistance = (imageHeight / 2 + imageMargin) / Math.tan(imageAngle / 360 * Math.PI);

  lastRotateAngle = 0;

  makeBetweenMinus180And180 = function(angle) {
    return ((angle + 180 + 360 * 10000) % 360) - 180;
  };

  updateCarouselOpacities = function(selectedIndex) {
    return $('.carousel-inner img').each(function(index) {
      return $(this).css('opacity', Math.cos((selectedIndex - index) * imageAngle / 360 * 2 * Math.PI) / 2 + 0.6);
    });
  };

  rotateCarouselTo = function(selectedIndex) {
    var rotateAngle;
    rotateAngle = (selectedIndex - 1) * imageAngle;
    rotateAngle = lastRotateAngle - makeBetweenMinus180And180(lastRotateAngle - rotateAngle);
    lastRotateAngle = rotateAngle;
    return setCss3($('.carousel-inner'), 'transform', "translateZ(-" + imageDistance + "px) rotateX(" + rotateAngle + "deg)");
  };

  $(function() {
    $('.carousel-inner img').each(function(index) {
      var angle;
      angle = -(index - 1) * imageAngle;
      return setCss3($(this), 'transform', "rotateX(" + angle + "deg) translateZ(" + imageDistance + "px) translateX(-50%)");
    });
    rotateCarouselTo(0);
    updateCarouselOpacities(0);
    _.defer(function() {
      return setCss3($('.carousel-inner'), 'transition', 'transform 1s', true);
    });
    $('[data-carousel-index]').each(function() {
      var carouselIndex;
      carouselIndex = $(this).data('carousel-index');
      return $(this).on('mouseenter', function() {
        rotateCarouselTo(carouselIndex);
        return updateCarouselOpacities(carouselIndex);
      });
    });
    $('.js-menu-planet').click(function() {
      if (window.planetStartledTimeout != null) {
        clearTimeout(window.planetStartledTimeout);
      }
      if ($('.js-menu-planet-container').hasClass('menu-planet-container-startled')) {
        $('.js-menu-planet-container').addClass('menu-planet-container-fallen');
        return $('.js-menu-planet-subtext').addClass('menu-planet-subtext-crooked');
      } else {
        $('.js-menu-planet-container').addClass('menu-planet-container-startled');
        return window.planetStartledTimeout = setTimeout((function() {
          return $('.js-menu-planet-container').removeClass('menu-planet-container-startled');
        }), 5000);
      }
    });
    return $('.js-menu-social-satellite-container').click(function() {
      var unstartle;
      if (window.satelliteStartledTimeout != null) {
        clearTimeout(window.satelliteStartledTimeout);
      }
      unstartle = function() {
        return $('.js-menu-social-container').removeClass('menu-social-container-startled menu-social-container-startled2');
      };
      if ($('.js-menu-social-container').hasClass('menu-social-container-startled2')) {
        return $('.js-menu-social-container').addClass('menu-social-container-startled3');
      } else if ($('.js-menu-social-container').hasClass('menu-social-container-startled')) {
        $('.js-menu-social-container').addClass('menu-social-container-startled2');
        return window.satelliteStartledTimeout = setTimeout(unstartle, 5000);
      } else {
        $('.js-menu-social-container').addClass('menu-social-container-startled');
        return window.satelliteStartledTimeout = setTimeout(unstartle, 5000);
      }
    });
  });

}).call(this);
