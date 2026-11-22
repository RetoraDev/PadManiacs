/**
 * @class MenuBar
 * @category UI Classes
 * @summary Desktop-style top menu bar with dropdown submenus
 */
class MenuBar extends Phaser.Graphics {
  constructor(config = {}) {
    super(game, 0, 0);
    this.config = {
      height: 10,
      autoHide: true,
      showDelay: 180,
      hideTimeout: 350,
      visibleOnStart: false,
      paddingLeft: 2,
      paddingRight: 2,
      charWidth: 5,
      onRefresh: null,
      ...config
    };
    this.barHeight = this.config.height;
    this.sections = [];
    this.openPath = []; // [{container,highlight,bounds,itemRects,level,_parentItem}]
    this.active = false;
    this._showTimer = 0;
    this._hideTimer = 0;
    this._visibleState = !!this.config.visibleOnStart;
    this._tween = null;
    this._pressedItem = null;
    this._pressedSection = -1;
    this._sectionHitAreas = [];

    this.y = this._visibleState ? 0 : -this.barHeight;
    this.alpha = this._visibleState ? 1 : 0;
    this.visible = this._visibleState;

    this.bg = game.add.graphics(0, 0);
    this.addChild(this.bg);
    this.labelsLayer = game.add.sprite(0, 0);
    this.addChild(this.labelsLayer);
    this.menusLayer = game.add.sprite(0, 0);
    this.addChild(this.menusLayer);

    this.blocker = game.add.sprite(0, 0, null);
    this.blocker.width = game.width;
    this.blocker.height = game.height;
    const blockerGfx = game.add.graphics(0, 0);
    blockerGfx.beginFill(0x000000, 0);
    blockerGfx.drawRect(0, 0, game.width, game.height);
    blockerGfx.endFill();
    this.blocker.addChild(blockerGfx);
    this.blocker.inputEnabled = true;
    this.blocker.visible = true;
    this.addChildAt(this.blocker, 0);

    this._drawBar();
    game.add.existing(this);
  }

  setSections(sections) {
    this.sections = (sections || []).map(s => ({
      label: s.label,
      items: s.items || [],
      condition: s.condition,
      text: null, x: 0, width: 0
    }));
    this._layoutSections();
  }

  _sectionLabel(section) {
    const l = typeof section.label === 'function' ? section.label() : section.label;
    return __(l);
  }

  _isSectionVisible(section) {
    return !section.condition || section.condition();
  }

  _drawBar() {
    this.bg.clear();
    this.bg.beginFill(0x1a1a1a, 0.95);
    this.bg.drawRect(0, 0, game.width, this.barHeight);
    this.bg.endFill();
    this.bg.lineStyle(1, 0x444444, 1);
    this.bg.moveTo(0, this.barHeight - 0.5);
    this.bg.lineTo(game.width, this.barHeight - 0.5);
  }

  _layoutSections() {
    while (this.labelsLayer.children.length) this.labelsLayer.children[0].destroy();
    this._sectionHitAreas = [];
    let x = 4;
    this.sections.forEach((section, i) => {
      if (!this._isSectionVisible(section)) { section.x = x; section.width = 0; section.text = null; return; }
      const text = new Text(x, 1, this._sectionLabel(section), { ...FONTS.default });
      this.labelsLayer.addChild(text);
      const w = Math.max(20, text.width + 6);
      section.text = text;
      section.x = x;
      section.width = w;
      this._sectionHitAreas.push({ index: i, x: x - 2, y: 0, w: w + 4, h: this.barHeight });
      x += w + 2;
    });
  }

  isPointerOver() {
    const p = game.input.activePointer;
    if (!p) return false;
    const px = p.x, py = p.y;
    if (this.visible && py >= this.y && py <= this.y + this.barHeight && px >= 0 && px <= game.width) return true;
    return this._isPointerInOpenMenus(px, py);
  }

  isMenuActive() {
    return this.active || this.isPointerOver();
  }

  _isPointerInOpenMenus(px, py) {
    for (const m of this.openPath) {
      if (!m || !m.container || !m.container.visible) continue;
      const b = m.bounds;
      if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return true;
    }
    return false;
  }

  _show() {
    if (this._visibleState && this.alpha >= 1) { this.visible = true; this.y = 0; this.alpha = 1; game.activeMenuBar = this; return; }
    this._visibleState = true;
    this.visible = true;
    game.activeMenuBar = this;
    if (this._tween) this._tween.stop();
    this.y = -this.barHeight;
    this.alpha = 0;
    this._tween = game.add.tween(this).to({ y: 0, alpha: 1 }, 160, Phaser.Easing.Quadratic.Out, true);
  }

  _hide(force) {
    if (!force && (!this.config.autoHide || this.active || this._isPointerInOpenMenus(game.input.activePointer.x, game.input.activePointer.y))) return;
    if (!this._visibleState && !this.visible) return;
    this._visibleState = false;
    this.closeAllMenus();
    game.activeMenuBar = null;
    if (this._tween) this._tween.stop();
    this._tween = game.add.tween(this).to({ y: -this.barHeight, alpha: 0 }, 160, Phaser.Easing.Quadratic.In, true);
    this._tween.onComplete.addOnce(() => {
      if (!this._visibleState) {
        this.visible = false;
        if (game.activeMenuBar === this) game.activeMenuBar = null;
      }
    });
  }

  closeAllMenus() {
    this.active = false;
    this._pressedItem = null;
    this.openPath = [];
    while (this.menusLayer.children.length) this.menusLayer.children[0].destroy();
    this._clearSectionHighlights();
  }

  _clearSectionHighlights() {
    this._drawBar();
  }

  _highlightSection(index) {
    this._clearSectionHighlights();
    const s = this.sections[index];
    if (!s || !this._isSectionVisible(s)) return;
    this.bg.beginFill(0xffffff, 0.2);
    this.bg.drawRect(s.x - 2, 0, s.width + 4, this.barHeight);
    this.bg.endFill();
  }

  _getVisibleItems(items) {
    return (items || []).filter(it => !it.condition || it.condition());
  }

  _itemLabel(it) {
    if (it.separator) return '';
    const l = typeof it.label === 'function' ? it.label() : it.label;
    return __(l || '');
  }

  _calcMenuSize(items) {
    const padL = this.config.paddingLeft;
    const padR = this.config.paddingRight;
    const charW = this.config.charWidth;
    const visible = this._getVisibleItems(items);
    const hasSubmenu = visible.some(it => it.submenu && this._getVisibleItems(it.submenu).length);
    const arrowSpace = hasSubmenu ? 10 : 0;
    let maxLen = 0, labels = 0, seps = 0;
    let labelH = 8;
    visible.forEach(it => {
      if (it.separator) { seps++; return; }
      labels++;
      maxLen = Math.max(maxLen, this._itemLabel(it).length);
    });
    if (labels > 0) {
      const t = new Text(0, 0, 'Ag', { ...FONTS.default });
      labelH = Math.max(8, t.height);
      t.destroy();
    }
    const w = Math.max(40, padL + (maxLen * charW) + arrowSpace + padR + 8);
    const h = (labels * labelH) + (seps * 4) + 4;
    return { w, h, labelH, visible, hasSubmenu };
  }

  _openMenu(items, x, y, level, parentItem) {
    while (this.openPath.length > level) {
      const m = this.openPath.pop();
      if (m && m.container) m.container.destroy();
    }
    const size = this._calcMenuSize(items);
    let menuY = y;
    const totalH = size.h;
    const step = size.labelH || 8;
    if (menuY + totalH > game.height) {
      while (menuY + totalH > game.height && menuY > 10) menuY -= step;
      if (menuY < 10) menuY = 10;
    }
    let menuX = x;
    if (menuX + size.w > game.width) menuX = Math.max(0, (this.openPath[level - 1] ? this.openPath[level - 1].bounds.x - size.w + 1 : game.width - size.w));

    const container = game.add.graphics(menuX, menuY);
    this.menusLayer.addChild(container);
    container.beginFill(0x222222, 0.97);
    container.drawRect(0, 0, size.w, totalH);
    container.endFill();
    container.lineStyle(1, 0x555555, 1);
    container.drawRect(0, 0, size.w, totalH);

    const highlight = game.add.graphics(0, 0);
    container.addChild(highlight);

    const menuObj = { container, highlight, bounds: { x: menuX, y: menuY, w: size.w, h: totalH }, itemRects: [], level, labelH: size.labelH, _parentItem: parentItem || null };
    this.openPath.push(menuObj);
    this.active = true;

    let iy = 2;
    size.visible.forEach((it) => {
      if (it.separator) {
        const sep = game.add.graphics(0, iy + 1);
        sep.lineStyle(1, 0x666666, 0.8);
        sep.moveTo(3, 0); sep.lineTo(size.w - 3, 0);
        container.addChild(sep);
        menuObj.itemRects.push({ item: it, y: iy, h: 4, separator: true });
        iy += 4;
        return;
      }
      const lbl = this._itemLabel(it);
      const disabled = !!(it.disabled || (it.enabledCondition && !it.enabledCondition()));
      const t = new Text(this.config.paddingLeft + 4, iy, lbl, { ...FONTS.default });
      if (disabled) t.alpha = 0.45;
      container.addChild(t);
      const ih = size.labelH;
      const hasSub = it.submenu && this._getVisibleItems(it.submenu).length;
      if (hasSub) {
        const arrow = new Text(size.w - this.config.paddingRight - 8, iy, '>', { ...FONTS.default });
        if (disabled) arrow.alpha = 0.45;
        container.addChild(arrow);
      }
      menuObj.itemRects.push({ item: it, y: iy, h: ih, separator: false, hasSub, disabled });
      iy += ih;
    });
    return menuObj;
  }

  _openSection(index) {
    if (!this.active && typeof this.config.onRefresh === 'function') this.config.onRefresh();
    const section = this.sections[index];
    if (!section || !this._isSectionVisible(section)) { this.closeAllMenus(); return; }
    this._highlightSection(index);
    const items = this._getVisibleItems(section.items);
    if (!items.length) { this.closeAllMenus(); return; }
    this._openMenu(section.items, section.x - 2, this.barHeight, 0, null);
  }

  update() {
    const p = game.input.activePointer;
    const px = p ? p.x : -1;
    const py = p ? p.y : -1;
    const inTop = py >= 0 && py <= Math.max(2, this.barHeight / 2);
    const overMenu = this.isPointerOver();

    if (this.config.autoHide) {
      if (inTop || overMenu || this.active) {
        this._hideTimer = 0;
        this._showTimer += game.time.elapsed;
        if (this._showTimer >= this.config.showDelay || this.active) this._show();
      } else {
        this._showTimer = 0;
        if (this._visibleState) {
          this._hideTimer += game.time.elapsed;
          if (this._hideTimer >= this.config.hideTimeout) this._hide(false);
        }
      }
    } else if (!this._visibleState) {
      this._show();
    }

    if (!this.visible) return;
    if (this.parent && this.parent.bringToTop) this.parent.bringToTop(this);
    else if (game.world && game.world.bringToTop) game.world.bringToTop(this);

    const overBar = py >= this.y && py <= this.y + this.barHeight && px >= 0 && px <= game.width;
    let hoverSection = -1;
    if (overBar) {
      for (const s of this._sectionHitAreas) {
        if (px >= s.x && px <= s.x + s.w) { hoverSection = s.index; break; }
      }
    }

    if (hoverSection !== -1) {
      if (this.active) {
        this._openSection(hoverSection);
      } else {
        this._highlightSection(hoverSection);
      }
      if (p.isDown) {
        if (this._pressedSection !== hoverSection) this._pressedSection = hoverSection;
      } else if (this._pressedSection === hoverSection) {
        if (this.active) this.closeAllMenus(); else this._openSection(hoverSection);
        this._pressedSection = -1;
      }
    } else {
      if (!this.active) this._clearSectionHighlights();
      if (!p.isDown) this._pressedSection = -1;
    }

    if (this.active) this._updateOpenMenus(px, py, p);
    if (!p.isDown) this._pressedSection = -1;
  }

  _updateOpenMenus(px, py, p) {
    if (!this.openPath.length) { this.active = false; return; }

    let hovered = null;
    for (let i = this.openPath.length - 1; i >= 0; i--) {
      const m = this.openPath[i];
      const b = m.bounds;
      if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
        for (const r of m.itemRects) {
          if (r.separator) continue;
          const ry = b.y + r.y;
          if (py >= ry && py <= ry + r.h) { hovered = { level: i, rect: r, menu: m }; break; }
        }
        if (!hovered) hovered = { level: i, rect: null, menu: m };
        break;
      }
    }

    for (let i = 0; i < this.openPath.length; i++) {
      const m = this.openPath[i];
      m.highlight.clear();
      if (hovered && hovered.level === i && hovered.rect && !hovered.rect.disabled) {
        const r = hovered.rect;
        m.highlight.beginFill(0xffffff, 0.3);
        m.highlight.drawRect(2, r.y, m.bounds.w - 4, r.h);
        m.highlight.endFill();
      }
    }

    if (hovered && hovered.rect) {
      const { menu, rect } = hovered;
      const item = rect.item;
      const hasSub = rect.hasSub;
      if (hasSub) {
        const existing = this.openPath[menu.level + 1];
        if (!existing || existing._parentItem !== item) {
          this._openMenu(item.submenu, menu.bounds.x + menu.bounds.w - 1, menu.bounds.y + rect.y - 2, menu.level + 1, item);
        }
      } else {
        while (this.openPath.length > menu.level + 1) {
          const cm = this.openPath.pop();
          if (cm && cm.container) cm.container.destroy();
        }
      }

      if (!rect.disabled && !hasSub) {
        if (p.isDown) this._pressedItem = item;
        else if (this._pressedItem === item) {
          const cb = item.callback;
          this.closeAllMenus();
          if (this.config.autoHide) this._hide(true);
          this._pressedItem = null;
          if (typeof cb === 'function') cb();
          return;
        }
      } else if (!p.isDown) {
        this._pressedItem = null;
      }
    } else {
      if (p.isDown) {
        const overBar = py >= this.y && py <= this.y + this.barHeight;
        const inMenu = this._isPointerInOpenMenus(px, py);
        if (!overBar && !inMenu) this.closeAllMenus();
      }
      if (!p.isDown) this._pressedItem = null;
    }

    if (!p.isDown) this._pressedItem = null;
  }

  destroy(...args) {
    this.closeAllMenus();
    if (this._tween) this._tween.stop();
    if (game.activeMenuBar === this) game.activeMenuBar = null;
    super.destroy(...args);
  }
}
