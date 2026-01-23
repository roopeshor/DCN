/**
 * @typedef Message
 * @prop {string} msgContent
 * @prop {string} msgID
 * @prop {string} source
 * @prop {string} destination
 */

/**
 * An outlink, defines connecting node and corresponding svg line element
 * @typedef Outlink
 * @prop {MeshNode} connectingNode
 * @prop {SVGLineElement} svgLine
 */

/**
 * @typedef {0 | 1 | 2 | 3} MeshNodeStatus
 * 0 = idle
 * 1 = broadcasting starting point
 * 2 = broadcasting to others
 * 3 = received
 */

class MeshNode {
	/** @type {MeshNode[]} */
	neighbours = [];

	/** @type {NodeID[]}*/
	neighbourIDs = [];

	/** Local ID of node
	 * @type {string} */
	nodeID;

	/** list of all recent messages received
	 * @type {Message[]} */
	message_queue = [];

	/** @type {SVGCircleElement} */
	nodeCircleElement;
	/** @type {SVGTextElement} */
	nodeTextElement;


	associatedLabel;

	/** set of outward going connections
	 * @type {MeshEdge[]} */
	outlinks = [];
	/** set of inward coming connections
	 * @type {MeshEdge[]} */
	inlinks = [];

	/** @type {MeshNodeStatus} */
	nodeStatus = 0;

	/**
	 * 
	 * @param {NodeID} nodeID 
	 * @param {Point2D} nodeCanvasPosition 
	 */
	constructor(nodeID, nodeCanvasPosition) {
		let x = nodeCanvasPosition.x
		let y = nodeCanvasPosition.y
		this.nodeID = nodeID;
		let c = createSvgElement("circle");
		c.setAttribute("cx", x);
		c.setAttribute("cy", y);
		c.setAttribute("r", 15)
		c.setAttribute("fill", this.nodeColor);
		c.setAttribute("nodeID", this.nodeID);
		c.classList.add("draggable")
		
		let t = createSvgElement("text");
		t.setAttribute("x", x);
		t.setAttribute("y", y);
		t.innerHTML = nodeID;
		t.setAttribute("nodeID", nodeID)
		t.setAttribute("fill", this.nodeLabelColor);
		t.classList.add("draggable")
		this.nodeCircleElement = c;
		this.nodeTextElement = t;
	}

	/**
	 * Appends 
	 * @param {MeshNode} node 
	 */
	connect(node) {
		if (!this.neighbourIDs.includes(node.nodeID) && node.nodeID != this.nodeID) {
			let e = new MeshEdge(this.DOMPosition, node.DOMPosition);
			this.outlinks.push(e);
			node.inlinks.push(e);
		}
	}

	broadcast(msg, msg_id, sourceNodeName, destNodeName, chain, hops = 10) {
		if (destNodeName == this.nodeID && this.rx_chain.length == 0) {
			if (!this.msg_ids.includes(msg_id)) {
				// got new msg
				this.msges.push(msg);
				this.rx_chain = [...chain, this.nodeID];
				this.nodeStatus = 3;
			}
		} else if (hops > 1) {
			if (sourceNodeName == this.nodeID) {
				this.nodeStatus = 1;
			} else {
				this.nodeStatus = 2;
			}
			for (let node of this.neighbours) {
				node.broadcast(msg, msg_id, sourceNodeName, destNodeName, [...chain, this.nodeID], hops--);
			}
		} else {
			console.log("hop limit reached");

		}
	}

	/**
	 * Updates DOM position of node and related edges
	 * @param {Point2D} pos 
	 */
	updatePosition(pos) {
		this.nodeCircleElement.setAttribute("cx", pos.x)
		this.nodeCircleElement.setAttribute("cy", pos.y)
		this.nodeTextElement.setAttribute("x", pos.x)
		this.nodeTextElement.setAttribute("y", pos.y)

		this.outlinks.forEach(el => el.setStart(pos))
		this.inlinks.forEach(el => el.setEnd(pos))
	}

	/**
	 *
	 *
	 * @readonly
	 * @returns {Point2D}
	 */
	get DOMPosition() {
		return {
			x: parseFloat(this.nodeCircleElement.getAttribute("cx")),
			y: parseFloat(this.nodeCircleElement.getAttribute("cy"))
		}
	}
	get rxChainColor() {
		return "blue"
	}
	get nodeLabelColor() {
		return "white"
	}
	get nodeColor() {
		switch (this.nodeStatus) {
			case 0: return "green";
			case 1: return "red";
			case 2: return "#997617";
			case 3: return "blue";
			default: break;
		}
	}
	get nodeConnectColor() {
		switch (this.nodeStatus) {
			case 0: return "white";
			case 1: return "red";
			case 2: return "red";
			case 3: return "white";
			default: break;
		}
	}
}

class MeshEdge {
	/** @type {Point2D} */
	start = {};
	/** @type {Point2D} */
	end = {};

	/** @type {SVGLineElement} */
	edgeLineElement;
	color = "white";

	padding;

	constructor(start, end, pad = 22, col = "white") {
		let l = createSvgElement("line");
		this.edgeLineElement = l;
		this.padding = pad;
		this.color = col;
		l.setAttribute("marker-end", 'url(#arrow)')
		this.setStart(start);
		this.setEnd(end);
		this.setColor(col);
	}

	setColor(col) {
		this.color = col;
		this.edgeLineElement.setAttribute("stroke", this.color);
	}
	setStart(pt) {
		this.start = pt;
		this.edgeLineElement.setAttribute("x1", this.x1);
		this.edgeLineElement.setAttribute("y1", this.y1);
		if (this.end.x != undefined) this.setEnd(this.end);
	}
	setEnd(pt) {
		this.end = pt;
		let padFr = this.padding / this.length;

		let x2 = this.x2 - (this.x2 - this.x1) * padFr;
		let y2 = this.y2 - (this.y2 - this.y1) * padFr;
		this.edgeLineElement.setAttribute("x2", x2);
		this.edgeLineElement.setAttribute("y2", y2);
	}

	get x1() { return this.start.x }
	get y1() { return this.start.y }
	get x2() { return this.end.x }
	get y2() { return this.end.y }
	get length() {
		return Math.sqrt((this.x1 - this.x2) ** 2 + (this.y1 - this.y2) ** 2)
	}
}