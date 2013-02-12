goog.provide('ol.source.DebugTileSource');

goog.require('ol.Size');
goog.require('ol.Tile');
goog.require('ol.TileCache');
goog.require('ol.TileCoord');
goog.require('ol.source.TileSource');
goog.require('ol.tilegrid.TileGrid');



/**
 * @constructor
 * @extends {ol.Tile}
 * @param {ol.TileCoord} tileCoord Tile coordinate.
 * @param {ol.tilegrid.TileGrid} tileGrid Tile grid.
 * @private
 */
ol.DebugTile_ = function(tileCoord, tileGrid) {

  goog.base(this, tileCoord);

  this.state = ol.TileState.LOADED;

  /**
   * @private
   * @type {ol.TileCoord}
   */
  this.tileCoord_ = tileCoord;

  /**
   * @private
   * @type {ol.Size}
   */
  this.tileSize_ = tileGrid.getTileSize();

  /**
   * @private
   * @type {Object.<number, HTMLCanvasElement>}
   */
  this.canvasByContext_ = {};

};
goog.inherits(ol.DebugTile_, ol.Tile);


/**
 * @inheritDoc
 */
ol.DebugTile_.prototype.getImage = function(opt_context) {
  var key = goog.isDef(opt_context) ? goog.getUid(opt_context) : -1;
  if (key in this.canvasByContext_) {
    return this.canvasByContext_[key];
  } else {

    var tileSize = this.tileSize_;

    var canvas = /** @type {HTMLCanvasElement} */
        (goog.dom.createElement(goog.dom.TagName.CANVAS));
    canvas.width = tileSize.width;
    canvas.height = tileSize.height;

    var context = canvas.getContext('2d');

    context.strokeStyle = 'black';
    context.strokeRect(0.5, 0.5, tileSize.width + 0.5, tileSize.height + 0.5);

    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = '24px sans-serif';
    context.fillText(
        this.tileCoord_.toString(), tileSize.width / 2, tileSize.height / 2);

    this.canvasByContext_[key] = canvas;
    return canvas;

  }
};



/**
 * @constructor
 * @extends {ol.source.TileSource}
 * @param {ol.source.DebugTileSourceOptions} options Options.
 */
ol.source.DebugTileSource = function(options) {

  goog.base(this, {
    extent: options.extent,
    projection: options.projection,
    tileGrid: options.tileGrid
  });

  /**
   * @private
   * @type {ol.TileCache}
   */
  this.tileCache_ = new ol.TileCache();

};
goog.inherits(ol.source.DebugTileSource, ol.source.TileSource);


/**
 * @inheritDoc
 */
ol.source.DebugTileSource.prototype.canExpireCache = function() {
  return this.tileCache_.canExpireCache();
};


/**
 * @inheritDoc
 */
ol.source.DebugTileSource.prototype.expireCache = function(usedTiles) {
  this.tileCache_.expireCache(usedTiles);
};


/**
 * @inheritDoc
 */
ol.source.DebugTileSource.prototype.getTile = function(tileCoord) {
  var key = tileCoord.toString();
  if (this.tileCache_.containsKey(key)) {
    return /** @type {ol.DebugTile_} */ (this.tileCache_.get(key));
  } else {
    var tile = new ol.DebugTile_(tileCoord, this.tileGrid);
    this.tileCache_.set(key, tile);
    return tile;
  }
};