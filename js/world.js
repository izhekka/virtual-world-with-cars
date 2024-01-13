class World {
  constructor(
    graph,
    roadWidth = 100,
    roadRoundness = 10,
    buildingWidth = 150,
    buildingMinLenght = 150,
    spacing = 50,
    treeSize = 160
  ) {
    this.graph = graph;
    this.roadWidth = roadWidth;
    this.roadRoundness = roadRoundness;
    this.buildingWidth = buildingWidth;
    this.buildingMinLenght = buildingMinLenght;
    this.spacing = spacing;
    this.treeSize = treeSize;

    this.envelopes = [];
    this.roadBorders = [];
    this.buildings = [];
    this.trees = [];
    this.laneGuids = [];

    this.markings = [];

    this.generate();
  }

  generate() {
    this.envelopes.length = 0;
    for (const seg of this.graph.segments) {
      this.envelopes.push(
        new Envelope(seg, this.roadWidth, this.roadRoundness)
      );
    }

    this.roadBorders = Polygon.union(this.envelopes.map(e => e.poly));
    this.buildings = this.#generateBuildings();
    this.trees = this.#generateTrees();

    this.laneGuids.length = 0;
    this.laneGuids.push(...this.#generateLaneGuids());
  }

  #generateBuildings() {
    const tmpEnvelopes = this.graph.segments
      .map(seg => new Envelope(
        seg,
        this.roadWidth + this.buildingWidth + this.spacing * 2,
        this.roadRoundness
      ));

    const guides = Polygon.union(tmpEnvelopes.map(e => e.poly))
        .filter(seg => seg.length() >= this.buildingMinLenght);

    const supports = [];
    for (const seg of guides) {
      const len = seg.length() + this.spacing;
      const buildingCount = Math.floor(len / (this.buildingMinLenght + this.spacing));
      const buildingLength = len / buildingCount - this.spacing;

      const dir = seg.directionVector();

      let q1 = seg.p1;
      let q2 = add(q1, scale(dir, buildingLength));
      supports.push(new Segment(q1, q2));

      for (let i = 2; i <= buildingCount; i++) {
        q1 = add(q2, scale(dir, this.spacing));
        q2 = add(q1, scale(dir, buildingLength));
        supports.push(new Segment(q1, q2));
      }
    }

    const bases = supports.map(seg => new Envelope(seg, this.buildingWidth).poly);

    const eps = 0.001;
    for (let i = 0; i < bases.length - 1; i++) {
      for (let j = i + 1; j < bases.length; j++) {
        if (bases[i].intersectsPoly(bases[j]) || bases[i].distanceToPoly(bases[j]) < this.spacing - eps) {
          bases.splice(j, 1);
          j--;
        }
      }
    }

    return bases.map(b => new Building(b));
  }

  #generateLaneGuids() {
    const tmpEnvelopes = this.graph.segments
      .map(seg => new Envelope(
        seg,
        this.roadWidth / 2,
        this.roadRoundness
      ));

    return Polygon.union(tmpEnvelopes.map(e => e.poly));
  }

  #generateTrees() {
    const points = [
      ...this.roadBorders.map(b => [b.p1, b.p2]).flat(),
      ...this.buildings.map(b => b.base.points).flat()
    ];
    const left = Math.min(...points.map(p => p.x));
    const right = Math.max(...points.map(p => p.x));
    const top = Math.min(...points.map(p => p.y));
    const bottom = Math.max(...points.map(p => p.y));

    const illegalPolys = [
      ...this.buildings.map(b => b.base),
      ...this.envelopes.map(e => e.poly)
    ];

    const trees = [];
    let tryCount = 0;
    while (tryCount < 100) {
      const p = new Point(
        lerp(left, right, Math.random()),
        lerp(top, bottom, Math.random())
      );

      // check if tree is inside or nearby some object
      let keep = true;
      for (const poly of illegalPolys) {
        if (poly.containsPoint(p) || poly.distanceToPoint(p) < this.treeSize / 2) {
          keep = false;
          break;
        }
      }

      // check if trees are too close
      if (keep) {
        for (const tree of trees) {
          if (distance(tree.center, p) < this.treeSize) {
            keep = false;
            break;
          }
        }
      }

      // check if a tree is too far from the infrastructure
      if (keep) {
        let closeToSomething = false;
        for (const poly of illegalPolys) {
          if (poly.distanceToPoint(p) < this.treeSize * 2) {
            closeToSomething = true;
            break;
          }
        }
        keep = closeToSomething;
      }

      tryCount++;

      if (keep) {
        trees.push(new Tree(p, this.treeSize));
        tryCount = 0;
      }
    }

    return trees;
  }

  draw(ctx, viewPoint) {
    for (const env of this.envelopes) {
      env.draw(ctx, { fill: '#bbb', stroke: '#bbb', lineWidth: 15 });
    }
    for (const marking of this.markings) {
      marking.draw(ctx);
    }
    for (const seg of this.graph.segments) {
      seg.draw(ctx, { color: 'white', width: 4, dash: [10, 10] });
    }
    for (const seg of this.roadBorders) {
      seg.draw(ctx, { color: 'white', width: 4 });
    }

    //
    const items = [ ...this.buildings, ...this.trees ];
    items.sort((a, b) => b.base.distanceToPoint(viewPoint) - a.base.distanceToPoint(viewPoint));

    for (const item of items) {
      item.draw(ctx, viewPoint);
    }
  }
}
