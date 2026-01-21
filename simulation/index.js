
function layoutGraph(vertices, edges, W, H, iterations = 500) {
	const N = vertices.length;
	const index = new Map(vertices.map((v, i) => [v, i]));

	const pos = Array.from({ length: N }, () => ({
		x: Math.random() * W,
		y: Math.random() * H,
		vx: 0,
		vy: 0
	}));

	const k = Math.sqrt((W * H) / N);
	const damping = 0.85;
	const timestep = 0.1;
	const crossingStrength = 0.85;

	function repulsiveForce(d) {
		return (k * k) / (d + 0.01);
	}

	function attractiveForce(d) {
		return (d * d) / k;
	}

	// Segment intersection test
	function ccw(a, b, c) {
		return (c.y - a.y) * (b.x - a.x) >
			(b.y - a.y) * (c.x - a.x);
	}

	function segmentsIntersect(a, b, c, d) {
		return (
			ccw(a, c, d) !== ccw(b, c, d) &&
			ccw(a, b, c) !== ccw(a, b, d)
		);
	}

	for (let iter = 0; iter < iterations; iter++) {

		// Reset velocities
		for (let i = 0; i < N; i++) {
			pos[i].vx = 0;
			pos[i].vy = 0;
		}

		// Node–node repulsion
		for (let i = 0; i < N; i++) {
			for (let j = i + 1; j < N; j++) {
				const dx = pos[j].x - pos[i].x;
				const dy = pos[j].y - pos[i].y;
				const d = Math.hypot(dx, dy) + 0.01;
				const f = repulsiveForce(d);

				const fx = (dx / d) * f;
				const fy = (dy / d) * f;

				pos[i].vx -= fx;
				pos[i].vy -= fy;
				pos[j].vx += fx;
				pos[j].vy += fy;
			}
		}

		// Edge attraction
		for (const [a, b] of edges) {
			const i = index.get(a);
			const j = index.get(b);

			const dx = pos[j].x - pos[i].x;
			const dy = pos[j].y - pos[i].y;
			const d = Math.hypot(dx, dy) + 0.01;
			const f = attractiveForce(d);

			const fx = (dx / d) * f;
			const fy = (dy / d) * f;

			pos[i].vx += fx;
			pos[i].vy += fy;
			pos[j].vx -= fx;
			pos[j].vy -= fy;
		}

		// EDGE–EDGE CROSSING PENALTY  (NEW)
		for (let i = 0; i < edges.length; i++) {
			for (let j = i + 1; j < edges.length; j++) {

				const [a1, b1] = edges[i];
				const [a2, b2] = edges[j];

				// Skip shared endpoints
				if (a1 === a2 || a1 === b2 || b1 === a2 || b1 === b2) continue;

				const p1 = pos[index.get(a1)];
				const p2 = pos[index.get(b1)];
				const p3 = pos[index.get(a2)];
				const p4 = pos[index.get(b2)];

				if (segmentsIntersect(p1, p2, p3, p4)) {
					// Push endpoints away from intersection
					p1.vx -= crossingStrength;
					p1.vy -= crossingStrength;

					p2.vx += crossingStrength;
					p2.vy += crossingStrength;

					p3.vx += crossingStrength;
					p3.vy -= crossingStrength;

					p4.vx -= crossingStrength;
					p4.vy += crossingStrength;
				}
			}
		}

		// Update positions
		for (let i = 0; i < N; i++) {
			pos[i].x += pos[i].vx * timestep;
			pos[i].y += pos[i].vy * timestep;

			// Box constraint
			pos[i].x = Math.min(W, Math.max(0, pos[i].x));
			pos[i].y = Math.min(H, Math.max(0, pos[i].y));

			pos[i].vx *= damping;
			pos[i].vy *= damping;
		}
	}

	const result = {};
	vertices.forEach((v, i) => {
		result[v] = { x: pos[i].x, y: pos[i].y };
	});

	return result;
}


/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {*} x 
 * @param {*} y 
 * @param {*} r 
 */
function circle(ctx, { x, y }, r) {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.fill();
	ctx.closePath();
}

function line(ctx, p1, p2) {
	ctx.beginPath();
	ctx.moveTo(p1.x, p1.y);
	ctx.lineTo(p2.x, p2.y);
	ctx.stroke();
	ctx.closePath();
}

function arrow(
	ctx,
	{ x: x1, y: y1 },
	{ x: x2, y: y2 },
	color = "white",
	headLength = 20,
	headAngle = Math.PI / 6,
	sep = 23
) {
	const dx = x2 - x1;
	const dy = y2 - y1;
	const angle = Math.atan2(dy, dx);

	ctx.beginPath();

	// Main line
	let len = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
	let sepFr = sep / len;
	let ahx = x2 - (x2 - x1) * sepFr;
	let ahy = y2 - (y2 - y1) * sepFr;
	ctx.moveTo(
		x1 - (x1 - x2) * sepFr,
		y1 - (y1 - y2) * sepFr
	);
	ctx.lineTo(ahx, ahy);
	ctx.save();
	ctx.strokeStyle = color;
	ctx.stroke();
	ctx.fillStyle = ctx.strokeStyle;
	// Arrowhead
	ctx.moveTo(ahx, ahy);
	ctx.lineTo(
		ahx - headLength * Math.cos(angle - headAngle),
		ahy - headLength * Math.sin(angle - headAngle)
	);
	ctx.lineTo(
		ahx - headLength * Math.cos(angle + headAngle),
		ahy - headLength * Math.sin(angle + headAngle)
	);
	ctx.fill();
	ctx.restore();
	ctx.closePath();
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {*} txt 
 * @param {*} x 
 * @param {*} y 
 */
function text(ctx, txt, { x, y }, col = "white") {
	ctx.save();
	ctx.fillStyle = col;
	let tw = ctx.measureText(txt).width;
	ctx.fillText(txt, x - tw / 2, y);
	ctx.restore();
}

function label(ctx, txt, point, size = 20, bg = "green") {
	ctx.save();
	ctx.fillStyle = bg;
	circle(ctx, point, size);
	text(ctx, txt, point);
	ctx.restore();
}
const W = 800, H = 800;
// Padding within canvas
const PX = 70, PY = 70;

cvs.width = W;
cvs.height = H;
cvs.style.width = W / 1.25 + "px";
cvs.style.height = H / 1.25 + "px";

/** @type {CanvasRenderingContext2D} */
const ctx = cvs.getContext("2d");

ctx.fillRect(0, 0, W, H);
ctx.translate(PX, PY);
ctx.fillStyle = "green";
ctx.strokeStyle = "white";
ctx.lineWidth = "2";
ctx.textBaseline = "middle";
ctx.font = "20px Helvetica"
cvs.style.backgroundColor = "black"