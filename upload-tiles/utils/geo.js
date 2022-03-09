const TILE_SIZE = 256;
function project(x, y) {
    let siny = Math.sin((x * Math.PI) / 180);
    siny = Math.min(Math.max(siny, -0.9999), 0.9999);
    return {
        x: TILE_SIZE * (0.5 + y / 360),
        y: TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI))
    };
}
function coordToTile(x, y, zoom) {
    const scale = 1 << zoom;
    const worldCoordinate = project(x, y);
    return { 
        x: Math.floor((worldCoordinate.x * scale) / TILE_SIZE),
        y: Math.floor((worldCoordinate.y * scale) / TILE_SIZE)
    };
}

module.exports = {
    coordToTile,
};