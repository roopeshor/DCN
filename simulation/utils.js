/**
 * @typedef {string} NodeID
 */

/**
 * @typedef Point2D
 * @prop {number} x
 * @prop {number} y
 * 
 */

/**
 * 
 * @param {string} tag 
 * @returns {SVGElement}
 */
function createSvgElement(tag) {
	return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

/**
 * Distributes graph vertices nearly (half of the time)
 * @param {NodeID} vertices 
 * @param {nodeID[]} edges 
 * @param {number} W 
 * @param {number} H 
 * @param {number} iterations 
 * @returns {Point2D[]}
 */
function layoutGraph(vertices, edges, W, H, px, py, iterations = 500) {
	const N = vertices.length;
	W -= px * 2;
	H -= py * 2;
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
		result[v] = { x: pos[i].x + px, y: pos[i].y + py };
	});

	return result;
}