const nodeIDs = [
	0,
	1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
	14, 15, 16, 17, 18, 19
];
const connections = [
	//[start, end]
	[0, 1],
	[0, 2],
	[0, 3],
	[0, 11],
	[1, 4],
	[1, 2],
	[2, 5],
	[2, 3],
	[3, 6],
	[3, 7],
	[4, 5],
	[5, 9],
	[5, 6],
	[6, 8],
	[6, 10],
	[7, 8],
	[7, 11],
	[11, 12],
	[7, 12],
	[8, 13],
	[9, 13],
	[10, 13],
	[14, 13],
	[14, 8],
	[15, 14],
	[15, 8],
	[16, 12],
	[17, 16],
	[17, 15],
	[7, 17],
	[18, 15],
	[17, 18],
	[18, 14],
	[19, 14],
	[15, 19],
];
const nodePositions = layoutGraph(nodeIDs, connections, W, H, PX, PY, 4000);


// create nodes:
/** @type {Object<string, MeshNode>} */
const nodeList = {};

for (let id of nodeIDs) {
	nodeList[id] = new MeshNode(id, nodePositions[id]);
}

// define connections
for (let c of connections) {
	let [start, end, isActive] = c;
	nodeList[start].connect(nodeList[end]);
}

// append elemets
// edges
nodeIDs.forEach(id =>
	nodeList[id].outlinks.forEach(
		(el) => svg.appendChild(el.edgeLineElement)
	)
)

// nodes
nodeIDs.forEach(id =>
	svg.appendChild(nodeList[id].nodeCircleElement)
)

// nodes labels
nodeIDs.forEach(id =>
	svg.appendChild(nodeList[id].nodeTextElement)
)


// let SRC_NODE = 0;
// let DEST_NODE = 19;

function startAnimation() {

}

startBtn.addEventListener("click", startAnimation);
startAnimation();