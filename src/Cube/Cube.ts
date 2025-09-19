// Square.ts
import { Edge } from "../Edge/Edge";
import { GameObject } from "../GameObject";
import { Vector } from "../Vector";
import { objectEntries, objectFromEntries } from "../utils";

/**
 * Квадрат, ориентированный «как обычно» (грани параллельны осям координат).
 *
 *   topLeft ────── topRight
 *      │               │
 *      │   центр (center)
 *      │               │
 *   bottomLeft ── bottomRight
 */
export class Cube extends GameObject {
  /** Длина стороны квадрата */
  private _edge: number;
  public get edge(): number {
    return this._edge;
  }

  /** Половина стороны – удобно для вычисления координат вершин */
  private halfEdge: number;

  /** Вершины, расположенные относительно (0,0). */
  private readonly _normalVertices: Readonly<
    Record<
      "topLeft" | "topRight" | "bottomRight" | "bottomLeft",
      Vector
    >
  >;

  /** Вершины уже «перенесённые» в текущий центр. */
  private _vertices!: Record<
    keyof typeof this._normalVertices,
    Vector
  >;
  public get vertices() {
    return this._vertices;
  }

  /** Рёбра квадрата. */
  private _edges!: Readonly<
    Record<
      "top" | "right" | "bottom" | "left",
      Edge
    >
  >;
  public get edges() {
    return this._edges;
  }
  private set edges(v) {
    this._edges = v;
  }

  constructor(center: Vector, edge: number) {
    super(center, edge);
    this._edge = edge;
    this.halfEdge = edge / 2;

    // Вершины в локальной системе координат (центр в (0,0))
    this._normalVertices = {
      topLeft:    new Vector(-this.halfEdge, -this.halfEdge),
      topRight:   new Vector( this.halfEdge, -this.halfEdge),
      bottomRight:new Vector( this.halfEdge,  this.halfEdge),
      bottomLeft: new Vector(-this.halfEdge,  this.halfEdge),
    };

    this.solve();               // построить вершины и ребра
  }

  /** Перемещение квадрата. После смещения пересчитываем всё. */
  move(delta: Vector) {
    super.move(delta);
    this.solve();
  }

  /** Пересчитывает абсолютные вершины и ребра. */
  private solve = () => {
    // Переносим каждую «нормальную» вершину к текущему центру
    this._vertices = objectFromEntries(
      objectEntries(this._normalVertices).map(
        ([key, vec]) => [key, vec.add(this.center)]
      )
    ) as any;

    // Формируем четыре ребра
    this.edges = {
      top:    new Edge(this.vertices.topLeft,    this.vertices.topRight),
      right:  new Edge(this.vertices.topRight,   this.vertices.bottomRight),
      bottom: new Edge(this.vertices.bottomRight,this.vertices.bottomLeft),
      left:   new Edge(this.vertices.bottomLeft, this.vertices.topLeft),
    };
  };

  /** Проверка, находится ли точка внутри (или на границе) квадрата. */
  contains = (point: Vector): boolean => {
    const left   = this.vertices.bottomLeft.x;
    const right  = this.vertices.bottomRight.x;
    const top    = this.vertices.topLeft.y;
    const bottom = this.vertices.bottomLeft.y;

    return point.x >= left && point.x <= right &&
           point.y >= top  && point.y <= bottom;
  };

  /**
   * Возвращает массив знаковых расстояний от точки до каждого ребра.
   * Положительные значения – точка «снаружи» ребра, отрицательные – «внутри».
   */
  distanceToEdges(point: Vector): number[] {
    // Ориентация нормалей: наружные нормали указывают наружу,
    // поэтому внутри все расстояния ≤ 0.
    return [
      this.edges.top.distanceTo(point),      // сверху
      -this.edges.bottom.distanceTo(point),  // снизу
      this.edges.left.distanceTo(point),     // слева
      -this.edges.right.distanceTo(point),   // справа
    ];
  }

  /** Проверка, пересекается ли любой из рёбер квадрата с переданным ребром. */
  isCrossing = (edge: Edge): boolean => {
    return Object.values(this.edges).some(selfEdge =>
      selfEdge.isCrossing(edge)
    );
  };

  /** Отрисовка квадрата на Canvas. */
  draw = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.moveTo(this.vertices.topLeft.x, this.vertices.topLeft.y);
    ctx.lineTo(this.vertices.topRight.x,    this.vertices.topRight.y);
    ctx.lineTo(this.vertices.bottomRight.x, this.vertices.bottomRight.y);
    ctx.lineTo(this.vertices.bottomLeft.x,  this.vertices.bottomLeft.y);
    ctx.closePath();          // соединяем последнюю точку с первой
    ctx.fill();
  };
}
