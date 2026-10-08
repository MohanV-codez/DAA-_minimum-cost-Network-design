/* =====================================================
   MINIMUM COST NETWORK DESIGN
   College Campus Mini Project

   Algorithm:
   Kruskal's Minimum Spanning Tree

   Technologies:
   HTML + CSS + JavaScript + SVG
===================================================== */


/* =====================================================
   GLOBAL DATA
===================================================== */

let buildings = [];

let connections = [];

let minimumNetwork = [];

let totalMinimumCost = 0;


/* =====================================================
   ADD BUILDING
===================================================== */

function addBuilding() {

    const input =
        document.getElementById("buildingInput");

    const name = input.value.trim();


    if (name === "") {

        alert("Please enter a building name.");

        return;
    }


    // Check duplicate building

    const exists = buildings.some(
        building =>
            building.name.toLowerCase() === name.toLowerCase()
    );


    if (exists) {

        alert("This building already exists.");

        return;
    }


    const building = {

        id: buildings.length,

        name: name

    };


    buildings.push(building);


    input.value = "";


    updateInterface();

    drawNetwork();

}


/* =====================================================
   ADD CONNECTION
===================================================== */

function addConnection() {

    const from =
        parseInt(
            document.getElementById("fromBuilding").value
        );

    const to =
        parseInt(
            document.getElementById("toBuilding").value
        );

    const cost =
        parseFloat(
            document.getElementById("costInput").value
        );


    if (isNaN(from) || isNaN(to)) {

        alert("Please select both buildings.");

        return;
    }


    if (from === to) {

        alert("A building cannot connect to itself.");

        return;
    }


    if (isNaN(cost) || cost <= 0) {

        alert("Please enter a valid cost.");

        return;
    }


    // Check duplicate connection

    const duplicate = connections.some(edge =>

        (edge.from === from && edge.to === to) ||

        (edge.from === to && edge.to === from)

    );


    if (duplicate) {

        alert("This connection already exists.");

        return;
    }


    connections.push({

        from: from,

        to: to,

        cost: cost

    });


    document.getElementById("costInput").value = "";


    minimumNetwork = [];

    totalMinimumCost = 0;


    updateInterface();

    drawNetwork();

    clearResult();

}


/* =====================================================
   UPDATE INTERFACE
===================================================== */

function updateInterface() {

    document.getElementById("buildingCount").textContent =
        buildings.length;


    document.getElementById("connectionCount").textContent =
        connections.length;


    document.getElementById("selectedCount").textContent =
        minimumNetwork.length;


    document.getElementById("totalCost").textContent =
        "₹" + formatNumber(totalMinimumCost);


    updateBuildingSelects();

    updateBuildingList();

}


/* =====================================================
   UPDATE SELECT DROPDOWNS
===================================================== */

function updateBuildingSelects() {

    const fromSelect =
        document.getElementById("fromBuilding");

    const toSelect =
        document.getElementById("toBuilding");


    fromSelect.innerHTML =
        '<option value="">Select Building</option>';

    toSelect.innerHTML =
        '<option value="">Select Building</option>';


    buildings.forEach(building => {

        const option1 =
            document.createElement("option");

        option1.value = building.id;

        option1.textContent = building.name;


        const option2 =
            document.createElement("option");

        option2.value = building.id;

        option2.textContent = building.name;


        fromSelect.appendChild(option1);

        toSelect.appendChild(option2);

    });

}


/* =====================================================
   UPDATE BUILDING LIST
===================================================== */

function updateBuildingList() {

    const list =
        document.getElementById("buildingList");


    if (buildings.length === 0) {

        list.innerHTML =
            '<p class="empty">No buildings added</p>';

        return;
    }


    list.innerHTML = "";


    buildings.forEach((building, index) => {

        const item =
            document.createElement("div");

        item.className = "building-item";


        item.innerHTML = `

            <div class="building-name">

                <span class="building-number">
                    ${index + 1}
                </span>

                ${escapeHTML(building.name)}

            </div>

            <button
                class="delete-building"
                onclick="deleteBuilding(${building.id})"
            >
                ×
            </button>

        `;


        list.appendChild(item);

    });

}


/* =====================================================
   DELETE BUILDING
===================================================== */

function deleteBuilding(id) {

    const building =
        buildings.find(b => b.id === id);


    if (!building) {

        return;
    }


    const confirmDelete =
        confirm(
            `Delete "${building.name}" and its connections?`
        );


    if (!confirmDelete) {

        return;
    }


    // Remove building

    buildings =
        buildings.filter(
            building => building.id !== id
        );


    // Remove connections related to building

    connections =
        connections.filter(
            edge =>
                edge.from !== id &&
                edge.to !== id
        );


    // Reassign IDs

    buildings.forEach((building, index) => {

        const oldId = building.id;

        building.id = index;


        connections.forEach(edge => {

            if (edge.from === oldId) {

                edge.from = index;

            }

            if (edge.to === oldId) {

                edge.to = index;

            }

        });

    });


    minimumNetwork = [];

    totalMinimumCost = 0;


    updateInterface();

    drawNetwork();

    clearResult();

}


/* =====================================================
   KRUSKAL'S ALGORITHM
===================================================== */


/*
    Disjoint Set / Union Find

    Used to detect cycles in the graph.
*/


class DisjointSet {

    constructor(size) {

        this.parent =
            Array.from(
                { length: size },
                (_, index) => index
            );

        this.rank =
            new Array(size).fill(0);

    }


    find(node) {

        if (this.parent[node] !== node) {

            this.parent[node] =
                this.find(this.parent[node]);

        }

        return this.parent[node];

    }


    union(a, b) {

        const rootA =
            this.find(a);

        const rootB =
            this.find(b);


        if (rootA === rootB) {

            return false;

        }


        if (this.rank[rootA] < this.rank[rootB]) {

            this.parent[rootA] = rootB;

        }

        else if (
            this.rank[rootA] >
            this.rank[rootB]
        ) {

            this.parent[rootB] = rootA;

        }

        else {

            this.parent[rootB] = rootA;

            this.rank[rootA]++;

        }


        return true;

    }

}


/* =====================================================
   CALCULATE MST
===================================================== */

function calculateMST() {

    if (buildings.length < 2) {

        alert(
            "Please add at least 2 buildings."
        );

        return;
    }


    if (connections.length === 0) {

        alert(
            "Please add network connections."
        );

        return;
    }


    /*
        Step 1:
        Sort edges by cost
    */

    const sortedEdges =
        [...connections].sort(
            (a, b) => a.cost - b.cost
        );


    /*
        Step 2:
        Create Disjoint Set
    */

    const ds =
        new DisjointSet(
            buildings.length
        );


    minimumNetwork = [];

    totalMinimumCost = 0;


    /*
        Step 3:
        Select cheapest edges
        without creating cycles
    */

    for (const edge of sortedEdges) {

        if (
            ds.union(
                edge.from,
                edge.to
            )
        ) {

            minimumNetwork.push(edge);

            totalMinimumCost += edge.cost;

        }


        /*
            MST for N nodes
            contains exactly N - 1 edges
        */

        if (
            minimumNetwork.length ===
            buildings.length - 1
        ) {

            break;

        }

    }


    /*
        Check whether graph is connected
    */

    if (
        minimumNetwork.length !==
        buildings.length - 1
    ) {

        alert(
            "Network cannot connect all buildings. " +
            "Please add more connections."
        );

        minimumNetwork = [];

        totalMinimumCost = 0;

        updateInterface();

        return;
    }


    updateInterface();

    displayResult();

    drawNetwork();

}


/* =====================================================
   DISPLAY RESULT
===================================================== */

function displayResult() {

    const table =
        document.getElementById("resultTable");


    document.getElementById("resultCost").textContent =
        "₹" + formatNumber(totalMinimumCost);


    let html = `

        <table>

            <thead>

                <tr>

                    <th>#</th>

                    <th>From</th>

                    <th>To</th>

                    <th>Installation Cost</th>

                </tr>

            </thead>

            <tbody>

    `;


    minimumNetwork.forEach(
        (edge, index) => {

            const from =
                buildings.find(
                    b => b.id === edge.from
                );


            const to =
                buildings.find(
                    b => b.id === edge.to
                );


            html += `

                <tr>

                    <td>${index + 1}</td>

                    <td>
                        ${escapeHTML(from.name)}
                    </td>

                    <td>
                        ${escapeHTML(to.name)}
                    </td>

                    <td class="cost-value">
                        ₹${formatNumber(edge.cost)}
                    </td>

                </tr>

            `;

        }
    );


    html += `

            </tbody>

        </table>

    `;


    table.innerHTML = html;

}


/* =====================================================
   CLEAR RESULT
===================================================== */

function clearResult() {

    document.getElementById("resultCost").textContent =
        "₹0";


    document.getElementById("resultTable").innerHTML = `

        <div class="no-result">

            Calculate the minimum network to see results.

        </div>

    `;

}


/* =====================================================
   DRAW NETWORK
===================================================== */

function drawNetwork() {

    const svg =
        document.getElementById("networkSvg");

    const empty =
        document.getElementById("emptyNetwork");


    svg.innerHTML = "";


    if (buildings.length === 0) {

        empty.style.display = "block";

        return;
    }


    empty.style.display = "none";


    /*
        Calculate circular node positions
    */

    const centerX = 450;

    const centerY = 250;

    const radius = 180;


    const positions = {};


    buildings.forEach(
        (building, index) => {

            const angle =
                (
                    2 *
                    Math.PI *
                    index /
                    buildings.length
                ) -
                Math.PI / 2;


            positions[building.id] = {

                x:
                    centerX +
                    radius *
                    Math.cos(angle),

                y:
                    centerY +
                    radius *
                    Math.sin(angle)

            };

        }
    );


    /*
        Draw normal connections
    */

    connections.forEach(edge => {

        const start =
            positions[edge.from];

        const end =
            positions[edge.to];


        if (!start || !end) {

            return;
        }


        const isMST =
            minimumNetwork.some(
                selected =>
                    (
                        selected.from === edge.from &&
                        selected.to === edge.to
                    ) ||
                    (
                        selected.from === edge.to &&
                        selected.to === edge.from
                    )
            );


        // Line

        const line =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );


        line.setAttribute(
            "x1",
            start.x
        );

        line.setAttribute(
            "y1",
            start.y
        );

        line.setAttribute(
            "x2",
            end.x
        );

        line.setAttribute(
            "y2",
            end.y
        );


        line.classList.add(
            "network-edge"
        );


        if (isMST) {

            line.classList.add("mst");

        }


        svg.appendChild(line);


        /*
            Cost label
        */

        const text =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );


        const middleX =
            (start.x + end.x) / 2;

        const middleY =
            (start.y + end.y) / 2;


        text.setAttribute(
            "x",
            middleX
        );

        text.setAttribute(
            "y",
            middleY - 8
        );


        text.setAttribute(
            "text-anchor",
            "middle"
        );


        text.classList.add(
            "edge-cost"
        );


        text.textContent =
            "₹" + formatNumber(edge.cost);


        svg.appendChild(text);

    });


    /*
        Draw building nodes
    */

    buildings.forEach(building => {

        const position =
            positions[building.id];


        const group =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "g"
            );


        /*
            Circle
        */

        const circle =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );


        circle.setAttribute(
            "cx",
            position.x
        );

        circle.setAttribute(
            "cy",
            position.y
        );

        circle.setAttribute(
            "r",
            35
        );


        circle.classList.add(
            "node-circle"
        );


        group.appendChild(circle);


        /*
            Building name
        */

        const text =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );


        text.setAttribute(
            "x",
            position.x
        );

        text.setAttribute(
            "y",
            position.y
        );


        text.classList.add(
            "node-text"
        );


        /*
            Short name inside node
        */

        const shortName =
            getShortName(
                building.name
            );


        text.textContent =
            shortName;


        group.appendChild(text);


        /*
            Full name below node
        */

        const label =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );


        label.setAttribute(
            "x",
            position.x
        );

        label.setAttribute(
            "y",
            position.y + 55
        );


        label.setAttribute(
            "text-anchor",
            "middle"
        );


        label.style.fontSize =
            "12px";


        label.style.fill =
            "#4b5563";


        label.textContent =
            building.name;


        group.appendChild(label);


        svg.appendChild(group);

    });

}


/* =====================================================
   GET SHORT NAME
===================================================== */

function getShortName(name) {

    const words =
        name
            .trim()
            .split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 3)
            .toUpperCase();

    }


    return words
        .map(word => word[0])
        .join("")
        .substring(0, 3)
        .toUpperCase();

}


/* =====================================================
   LOAD SAMPLE COLLEGE DATA
===================================================== */

function loadSampleData() {

    /*
        Clear current data
    */

    buildings = [];

    connections = [];

    minimumNetwork = [];

    totalMinimumCost = 0;


    /*
        Sample Buildings
    */

    const names = [

        "Main Block",

        "CSE Block",

        "ECE Block",

        "Library",

        "Hostel",

        "Canteen",

        "Admin Block",

        "Lab"

    ];


    names.forEach(
        (name, index) => {

            buildings.push({

                id: index,

                name: name

            });

        }
    );


    /*
        Sample Connections
    */

    connections = [

        {
            from: 0,
            to: 1,
            cost: 500
        },

        {
            from: 0,
            to: 3,
            cost: 700
        },

        {
            from: 0,
            to: 6,
            cost: 600
        },

        {
            from: 1,
            to: 2,
            cost: 400
        },

        {
            from: 1,
            to: 3,
            cost: 300
        },

        {
            from: 1,
            to: 7,
            cost: 450
        },

        {
            from: 2,
            to: 3,
            cost: 350
        },

        {
            from: 2,
            to: 7,
            cost: 250
        },

        {
            from: 3,
            to: 4,
            cost: 800
        },

        {
            from: 3,
            to: 5,
            cost: 200
        },

        {
            from: 4,
            to: 5,
            cost: 350
        },

        {
            from: 4,
            to: 6,
            cost: 450
        },

        {
            from: 5,
            to: 6,
            cost: 300
        },

        {
            from: 6,
            to: 7,
            cost: 550
        },

        {
            from: 5,
            to: 7,
            cost: 500
        }

    ];


    updateInterface();

    calculateMST();

}


/* =====================================================
   RESET PROJECT
===================================================== */

function resetProject() {

    const confirmReset =
        confirm(
            "Are you sure you want to reset the project?"
        );


    if (!confirmReset) {

        return;
    }


    buildings = [];

    connections = [];

    minimumNetwork = [];

    totalMinimumCost = 0;


    updateInterface();

    drawNetwork();

    clearResult();

}


/* =====================================================
   FORMAT NUMBER
===================================================== */

function formatNumber(number) {

    return Number(number).toLocaleString(
        "en-IN"
    );

}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =====================================================
   INITIALIZE PROJECT
===================================================== */

updateInterface();

drawNetwork();