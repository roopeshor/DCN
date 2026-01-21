const nodeIDs = [
	0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
	14, 15,16, 17, 18, 19
];
const connections = [
	//[start, end, isActive]
	[0, 1, 0],
	[0, 2, 0],
	[0, 3, 0],
	[0, 11, 0],
	[1, 4, 0],
	[1, 2, 0],
	[2, 5, 0],
	[2, 3, 0],
	[3, 6, 0],
	[3, 7, 0],
	[4, 5, 0],
	[5, 9, 0],
	[5, 6, 0],
	[6, 8, 0],
	[6, 10, 0],
	[7, 8, 0],
	[7, 11, 0],
	[11, 12, 0],
	[7, 12, 0],
	[8, 13, 0],
	[9, 13, 0],
	[10, 13, 0],
	[14, 13, 0],
	[14, 8, 0],
	[15, 14, 0],
	[15, 8, 0],
	[16, 12, 0],
	[17, 16, 0],
	[17, 15, 0],
	[7, 17, 0],
	[18, 15, 0],
	[17, 18, 0],
	[18, 14, 0],
	[19, 14, 0],
	[15, 19, 0],
];
const nodePositions = layoutGraph(nodeIDs, connections, W - 2 * PX, H - 2 * PY, 4000);

// create nodes:
/** @type {MeshNode[]} */
const nodeList = [];
for (let id of nodeIDs) {
	nodeList.push(new MeshNode(id, nodePositions[id]))
}
// define connections
for (let c of connections) {
	let [start, end, isActive] = c;
	let i = nodeIDs.indexOf(start);
	let j = nodeIDs.indexOf(end);
	nodeList[i].connect(end, nodeList[j]);
}

let SRC_NODE = 0;
let DEST_NODE = 19;

function startAnimation() {
	nodeList[SRC_NODE].broadcast("Hello", 0, SRC_NODE, DEST_NODE, [], 9)
	drawGraph();
	drawPath(nodeList, nodeList[DEST_NODE].rx_chain);
}

function drawPath(nodeList, chain) {
	
	for (let i = 1; i < chain.length; i++) {
		let node = nodeList[chain[i]];
		let pt = nodeList[chain[i-1]].canvasPos;
		console.log(pt)
			arrow(ctx, pt, node.canvasPos,
				node.rxChainColor
			);
		}
}
function drawGraph() {
	ctx.clearRect(-PX, -PY, W, H);
	for (let node of nodeList) {
		let pt = node.canvasPos;
		// draw connections
		for (let neigh of node.neighbours) {
			arrow(ctx, pt, neigh.canvasPos,
				node.nodeConnectColor
			);
		}
	}
	for (let node of nodeList) {
		let pt = node.canvasPos;
		label(ctx,
			node.node_id,
			pt,
			20,
			node.nodeColor
		)
	}
}

function advanceAnimation() {

}
startBtn.addEventListener("click", startAnimation);
nextBtn.addEventListener("click", advanceAnimation);

drawGraph();