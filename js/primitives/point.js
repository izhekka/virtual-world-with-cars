class Point extends Object{
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;

    this.hovered = false;
    this.selected = false;
  }

  equals(point) {
    return this.x === point.x && this.y === point.y;
  }

  draw(ctx, { size = 18, color = 'black', outline = false, fill = false } = {}) {
    const rad = size / 2;

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(this.x, this.y, rad, 0, Math.PI * 2);
    ctx.fill();

    if (outline || this.selected) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'yellow';
      ctx.arc(this.x, this.y, rad * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (fill || this.hovered) {
      ctx.beginPath();
      ctx.fillStyle = 'yellow';
      ctx.arc(this.x, this.y, rad * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}