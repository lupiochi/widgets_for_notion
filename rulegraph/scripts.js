// Array to store steps and relationships
let steps = [];
let selectedNodes = [];
let manualEdges = []; // To store manually created edges

// Graph-related variables
let nodes = new vis.DataSet();
let edges = new vis.DataSet();
let network = null;

// Initialize the graph container and setup options
function initializeGraph() {
    const container = document.getElementById("graph");

    const data = { nodes, edges };
    const options = {
        layout: {
            hierarchical: false // Disable hierarchical layout for free movement
        },
        interaction: {
            dragNodes: true, // Allow dragging of nodes
            multiselect: true, // Allow selecting multiple nodes
        },
        edges: {
            smooth: {
                type: "cubicBezier",
                forceDirection: "horizontal", // Build horizontally
                roundness: 0.5,
            },
            color: { inherit: false },
            arrows: { to: { enabled: true, scaleFactor: 1.5 } }
        },
        nodes: {
            shape: 'box',
            font: {
                color: '#343434',
                size: 14,
                face: 'Arial',
            },
            margin: 10,
            borderWidth: 2,
            borderWidthSelected: 4,
        },
        physics: false, // Enable physics for natural node movement
    };

    network = new vis.Network(container, data, options);

    // Listen for node selection
    network.on('selectNode', function (params) {
        handleNodeSelection(params.nodes[0]);
    });

    // Listen for clicking on the background to deselect all nodes
    network.on('deselectNode', function (params) {
        if (params.nodes.length === 0) {
            clearNodeSelection();
        }
    });
}

// Handle selecting nodes for relationship creation
function handleNodeSelection(nodeId) {
    if (!selectedNodes.includes(nodeId)) {
        selectedNodes.push(nodeId);
    }

    if (selectedNodes.length === 2) {
        document.getElementById("relationship-form").classList.remove("hidden");
        document.getElementById("selectedNodes").innerText = selectedNodes.join(" and ");
    }
}

// Clear selected nodes when clicking on the background
function clearNodeSelection() {
    selectedNodes = [];
    document.getElementById("relationship-form").classList.add("hidden");
    document.getElementById("selectedNodes").innerText = '';
}

// Update the graph after adding a step, keeping manually created edges
function updateGraph() {
    edges.clear(); // Only clear edges

    // Add all steps as nodes (keep existing nodes and their positions)
    steps.forEach((step, index) => {
        const nodeId = index + 1;

        const color = getNodeColor(step.status);

        // If node exists, update its properties, otherwise, add a new one
        if (nodes.get(nodeId)) {
            nodes.update({
                id: nodeId,
                label: step.stepName,
                color: { background: color }
            });
        } else {
            nodes.add({
                id: nodeId,
                label: step.stepName,
                color: { background: color }
            });
        }

        // Add automatic dependencies as edges
        if (step.dependency) {
            const dependentIndex = steps.findIndex(s => s.stepName === step.dependency);
            if (dependentIndex >= 0) {
                const edgeOptions = getEdgeOptions(step.relationship);
                edges.add({ from: dependentIndex + 1, to: nodeId, ...edgeOptions });
            }
        }
    });

    // Add manually created edges back to the graph
    manualEdges.forEach(edge => {
        edges.add(edge);
    });
}

// Get node color based on status
function getNodeColor(status) {
    switch (status) {
        case 'notStarted':
            return '#97C2FC'; // Blue
        case 'inProgress':
            return '#FFEB3B'; // Yellow
        case 'completed':
            return '#4CAF50'; // Green
        default:
            return '#97C2FC'; // Default to Blue
    }
}

// Get edge options based on relationship type
function getEdgeOptions(relationship) {
    switch (relationship) {
        case 'solid':
            return { color: '#2B7CE9', width: 2 };
        case 'dashed':
            return { dashes: true, color: '#2B7CE9', width: 2 };
        case 'thick':
            return { color: '#2B7CE9', width: 5 };
        case 'dotted':
            return { dashes: [5, 5], color: '#2B7CE9', width: 2 };
        case 'colored-blue':
            return { color: '#0000FF', width: 2, arrows: { to: { enabled: true, type: 'arrow', scaleFactor: 1.5 } }, arrowStrikethrough: false };
        case 'colored-red':
            return { color: '#FF0000', width: 2, arrows: { to: { enabled: true, type: 'arrow', scaleFactor: 1.5 } }, arrowStrikethrough: false };
        default:
            return { color: '#2B7CE9', width: 2 };
    }
}

// Add a new step via the form
document.getElementById("addStep").addEventListener("click", addStep);

document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        addStep();
    }
});

// Function to update the dropdown with plain options (no groups)
function updateSuggestions() {
    const dropdown = document.getElementById('dependency');
    dropdown.innerHTML = '<option value="" disabled selected>Select a Dependency</option>'; // Reset dropdown

    steps.forEach(step => {
        const option = document.createElement('option');
        option.value = step.stepName;
        option.text = step.stepName;
        dropdown.appendChild(option);
    });
}

function addStep() {
    const stepName = document.getElementById("stepName").value.trim();
    const dependency = document.getElementById("dependency").value.trim();
    const status = document.getElementById("stepStatus").value;
    const relationship = document.getElementById("relationshipType").value;

    if (stepName) {
        steps.push({ stepName, dependency, relationship, status });
        updateGraph(); // Update the graph as soon as a step is added
        updateSuggestions(); // Update suggestions for "Depends on"
    } else {
        alert("Please enter a step name.");
    }

    // Clear inputs
    document.getElementById("stepName").value = '';
    document.getElementById("dependency").value = '';
}

// Update relationship between selected nodes and save manually created edges
document.getElementById("updateRelationship").addEventListener("click", function () {
    if (selectedNodes.length === 2) {
        const relationship = document.getElementById("relationshipEditor").value;

        const from = selectedNodes[0];
        const to = selectedNodes[1];

        // Remove existing edges between these nodes if any
        const existingEdge = edges.get({
            filter: function (item) {
                return (item.from === from && item.to === to) || (item.from === to && item.to === from);
            }
        });

        if (existingEdge.length > 0) {
            edges.remove(existingEdge.map(e => e.id));
        }

        // If the user selected "remove", do not add a new edge
        if (relationship !== 'remove') {
            const newEdge = { from, to, ...getEdgeOptions(relationship) };
            edges.add(newEdge);
            // Store the manually created edge
            manualEdges.push(newEdge);
        }

        // Clear the selection and hide the form
        clearNodeSelection();
    }
});

// Save graph as PNG using html2canvas
document.getElementById("saveGraph").addEventListener("click", function () {
    const graphContainer = document.getElementById("graph");

    // Use html2canvas to capture the graph as an image
    html2canvas(graphContainer).then(canvas => {
        // Create a link element and trigger the download
        const link = document.createElement("a");
        link.download = "graph.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
});

// Clear the graph
document.getElementById("clearGraph").addEventListener("click", function () {
    steps = [];
    selectedNodes = [];
    manualEdges = []; // Clear manually created edges
    nodes.clear();  // Clear the nodes from the graph
    edges.clear();  // Clear the edges from the graph
    updateSuggestions(); // Clear the suggestions list
});

// Undo the last step
document.getElementById("undoStep").addEventListener("click", function () {
    if (steps.length > 0) {
        // Remove the last step
        const lastStep = steps.pop();
        
        // Remove the corresponding node and edges
        const lastNodeId = steps.length + 1;
        nodes.remove(lastNodeId);
        
        // Remove any edges related to this node
        const connectedEdges = edges.get({
            filter: function (edge) {
                return edge.from === lastNodeId || edge.to === lastNodeId;
            }
        });

        edges.remove(connectedEdges.map(edge => edge.id));

        updateSuggestions(); // Update the suggestions list
    }
});


// Dynamically resize the graph when the window is resized
window.addEventListener("resize", function () {
    network.redraw(); // Redraw the graph to fit the new window size
});

// Initialize the graph when the page loads
initializeGraph();
