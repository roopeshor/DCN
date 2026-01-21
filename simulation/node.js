/**
 * @typedef {0 | 1 | 2 | 3} MeshNodeStatus
 * 0 = idle
 * 1 = broadcasting starting point
 * 2 = broadcasting to others
 * 3 = received
 */

class MeshNode {
	neighboursNames = [];
	canvasPos;
	/** @type {MeshNode[]} */
	neighbours = [];
	node_id;
	msges = [];
	msg_ids = [];
	rx_chain = [];
	/** @type {MeshNodeStatus} */
	nodeStatus = 0;
	constructor(node_id, canvasPos) {
		this.node_id = node_id;
		this.canvasPos = canvasPos;
	}
	/**
	 * 
	 * @param {string} node_id 
	 * @param {Node} node 
	 */
	connect(node_id, node) {
		if (!this.neighboursNames.includes(node_id)) {
			this.neighboursNames.push(node_id)
			this.neighbours.push(node)
		}
	}

	broadcast(msg, msg_id, sourceNodeName, destNodeName, chain, hops = 10) {
		if (destNodeName == this.node_id && this.rx_chain.length == 0) {
			if (!this.msg_ids.includes(msg_id)) {
				// got new msg
				this.msges.push(msg);
				this.rx_chain = [...chain, this.node_id];
				this.nodeStatus = 3;
			}
		} else if (hops > 1) {
			if (sourceNodeName == this.node_id) {
				this.nodeStatus = 1;
			} else {
				this.nodeStatus = 2;
			}
			for (let node of this.neighbours) {
				node.broadcast(msg, msg_id, sourceNodeName, destNodeName, [...chain, this.node_id], hops--);
			}
		} else {
			console.log("hop limit reached");
			
		}
	}

	get rxChainColor() {
		return "blue"
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