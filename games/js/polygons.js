// simple polygon helper methods 
var Polygons = {
  getCentroid: function (polygon) {
    var coordCount = polygon.length / 2, totalX = 0, totalY = 0;
    for (var i = 0; i < polygon.length; i += 2) {
      var x = polygon[i], y = polygon[i + 1];
      totalX += x, totalY += y;
    }
    var centroidX = Math.round(totalX / coordCount);
    var centroidY = Math.round(totalY / coordCount);
    return {
      'x': centroidX,
      'y': centroidY
    }
  },
  crossingsForLine: function (x, y, x1, y1, x2, y2) {
    if (y1 > y2) return 0 - this.crossingsForLine(x, y, x2, y2, x1, y1);
    if (y1 == y2) return 0;
    if (y < y1 || y >= y2) return 0;
    if (x >= x1 && x >= x2) return 0;
    var t = (y - y1) / (y2 - y1);
    return ((x < x1 + t * (x2 - x1)) ? 1 : 0);
  },
  inPolygon: function (x, y, polygon) {
    // auto close the polygon by detecting if the last point is the same as the first. If not, add it   
    var firstPoint = { 'x': polygon[0], 'y': polygon[1] };
    var lastPoint = { 'x': polygon[polygon.length - 2], 'y': polygon[polygon.length - 1] };
    if (firstPoint.x != lastPoint.x || firstPoint.y != lastPoint.y)
      polygon.push(firstPoint.x, firstPoint.y);
    var result = 0;
    for (var p = 0; p < polygon.length; p += 2) {
      var x1 = polygon[p + 0];
      var y1 = polygon[p + 1];
      var x2 = polygon[p + 2];
      var y2 = polygon[p + 3];
      result += this.crossingsForLine(x, y, x1, y1, x2, y2);
    }
    return ((result & 1) == 1);
  },
  inAnyPolygon: function (x, y, polygonObj) {
    for (var name in polygonObj) {
      var polygon = polygonObj[name];
      if (this.inPolygon(x, y, polygon)) 
        return name;
    }
    return false;
  },
  calculateSurface: function (polygon) {
    var n = polygon.length;
    var surface = 0;
    for (var i = 0; i < n; i += 2) {
      var j = (i + 2) % n;
      var x1 = polygon[i];
      var y1 = polygon[i + 1];
      var x2 = polygon[j];
      var y2 = polygon[j + 1];
      surface += x1 * y2;
      surface -= y1 * x2;
    }
    surface = surface / 2;
    return Math.abs(surface);
  },
  movePolygon: function (dx, dy, polygon) {
    var n = polygon.length;
    for (var i = 0; i < n; i += 2) {
      polygon[i] += dx;
      polygon[i + 1] += dy;
    }
    return polygon;
  }
};