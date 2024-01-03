class GraphEditor {
  constructor(viewport, graph = new Graph()) {
    this.viewport = viewport;
    this.canvas = viewport.canvas;
    this.graph = graph;

    this.ctx = this.canvas.getContext('2d');

    this.hovered = null;
    this.selected = null;
    this.dragging = false;
    this.mouse = null;

    this.#addEventListeners();
  }

  #addEventListeners() {
    this.canvas.addEventListener('mousedown', this.#handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.#handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', () => this.dragging = false);
    this.canvas.addEventListener('contextmenu', event => event.preventDefault());
  }

  #handleMouseDown(event) {
    if (event.button === 2) { // right click
      if (this.selected) {
        this.selected = null;
      } else if (this.hovered) {
        this.#removePoint(this.hovered);
      }
    }

    if (event.button === 0) { // left click
      if (this.hovered) {
        this.#selectPoint(this.hovered);
        this.dragging = true;
        return;
      }

      this.graph.addPoint(this.mouse);
      this.#selectPoint(this.mouse);
      this.hovered = this.mouse;
    }
  }

  #handleMouseMove(event) {
    this.mouse = this.viewport.getMouse(event);

    this.hovered = getNearestPoint(this.mouse, this.graph.points, 10 * this.viewport.zoom);

    if (this.dragging) {
      this.selected.x = this.mouse.x;
      this.selected.y = this.mouse.y;
    }
  }

  #selectPoint(point) {
    if (this.selected) {
      this.graph.tryAddSegment(new Segment(this.selected, point));
    }

    this.selected = point;
  }

  #removePoint(point) {
    this.graph.removePoint(point);
    this.hovered = null;

    if (this.selected === point) {
      this.selected = null;
    }
  }

  display() {
    this.graph.draw(ctx);

    if (this.hovered) {
      this.hovered.draw(this.ctx, { fill: true });
    }
    if (this.selected) {
      const intent = this.hovered || this.mouse;
      new Segment(this.selected, intent).draw(ctx, { width: 1, dash: [5, 5] });
      this.selected.draw(this.ctx, { outline: true });
    }
  }

  dispose() {
    this.graph.dispose();
    this.selected = null;
    this.hovered = null;
  }
}