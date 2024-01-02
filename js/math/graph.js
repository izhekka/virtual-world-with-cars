class Graph {
  constructor(points = [], segments = []) {
    this.points = points;
    this.segments = segments;
  }

  addPoint(point) {
    this.points.push(point);
  }

  tryAddPoint(point) {
    if (!this.containsPoint(point)) {
      this.addPoint(point);
      return true;
    }
    return false;
  }

  containsPoint(point) {
    return this.points.find(p => p.equals(point));
  }

  removePoint(point) {
    const segs = this.getSegmentsWithPoint(point);
    for (const seg of segs) {
      this.removeSegment(seg);
    }

    this.points.splice(this.points.indexOf(point), 1);
  }

  addSegment(seg) {
    this.segments.push(seg);
  }

  tryAddSegment(seg) {
    if (!seg.p1.equals(seg.p2) && !this.containsSegment(seg)) {
      this.segments.push(seg);
      return true;
    }
    return false;
  }

  containsSegment(seg) {
    return this.segments.find(s => s.equals(seg));
  }

  removeSegment(seg) {
    this.segments.splice(this.segments.indexOf(seg), 1);
  }

  getSegmentsWithPoint(point) {
    return this.segments.filter(s => s.includes(point));
  }

  dispose() {
    this.points.length = 0;
    this.segments.length = 0;
  }

  draw(ctx) {
    for (const seg of this.segments) {
      seg.draw(ctx);
    }

    for (const point of this.points) {
      point.draw(ctx);
    }
  }
}