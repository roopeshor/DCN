const W = 600, H = 500;
// Padding within canvas
const PX = 70, PY = 70;

var svg = document.querySelector("svg");
window.svg = svg;
svg.setAttribute("viewBox", `0 0 ${W} ${H}`)
svg.style.width = W + "px";
svg.style.height = H + "px";

svg.addEventListener('mousedown', startDrag);
svg.addEventListener('mousemove', drag);
svg.addEventListener('mouseup', endDrag);
svg.addEventListener('mouseleave', endDrag);

/** @type {SVGElement} */
var selectedElement;
var mouseOffset;

function startDrag(evt) {
	if (evt.target.classList.contains('draggable')) {
		selectedElement = evt.target;
		let nodeID = String(selectedElement.getAttribute("nodeID"));

		mouseOffset = getMousePosition(evt);
		let nodePos = nodeList[nodeID].DOMPosition;
		mouseOffset.x -= parseFloat(nodePos.x);
		mouseOffset.y -= parseFloat(nodePos.y);
	}
}

function drag(evt) {
	if (selectedElement) {
		evt.preventDefault();
		var currentCoord = getMousePosition(evt);
		let nodeID = String(selectedElement.getAttribute("nodeID"));
		nodeList[nodeID].updatePosition({
			x: currentCoord.x - mouseOffset.x,
			y: currentCoord.y - mouseOffset.y
		});
	}
}

function endDrag() {
	selectedElement = null;
}

function getMousePosition(evt) {
	var CTM = svg.getScreenCTM();
	return {
		x: (evt.clientX - CTM.e) / CTM.a,
		y: (evt.clientY - CTM.f) / CTM.d
	};
}
