// Classes
class action {
    constructor(name, id, log, requirements, itemRequirements, cost, time, complete, repeatable) {
        this.name = name;
        this.id = id;
        this.log = log;
        this.requirements = requirements;
        this.itemRequirements = itemRequirements;
        this.cost = cost;
        this.time = time;
        this.complete = complete;
        this.repeatable = repeatable;
    }
    runAction() {
        // Check if the player has enough items to run the action (the cost)
        var hasItems = true;
        if (this.cost.length > 0) {
            for (var i = 0; i < this.cost.length; i++) {
                if (inventory.find(obj => obj.name === this.cost[i].name).amount < this.cost[i].amount) {
                    hasItems = false;
                }
            }
        }
        if (hasItems) {
            // Remove the items from the player's inventory if there's a cost
            if (this.cost.length > 0) {
                for (var i = 0; i < this.cost.length; i++) {
                    inventory.find(obj => obj.name === this.cost[i].name).amount -= this.cost[i].amount;
                    updateInventory();
                }
            }
            // Start the timer (smoothly, so the player can see how much time is left)
            var time = this.time;
            var self = this;
            var id = this.id;
            // If action is not already running
            if (!intervals.find(obj => obj.id === id)) {
                intervals.push({id: id, interval: setInterval(function() {
                    time -= 0.01;
                    document.getElementById(id).innerHTML = self.name + " (" + time.toFixed(2) + "s)";
                    if (time <= 0) {
                        clearInterval(intervals.find(obj => obj.id === id).interval);
                        intervals.splice(intervals.indexOf(intervals.find(obj => obj.id === id)), 1);
                        self.complete();
                        log.unshift(self.log[Math.floor(Math.random()*self.log.length)]);
                        if (!actionsCompleted.includes(self.id)) {
                            actionsCompleted.push(self.id);
                        }
                        updateGame();
                    }
                }, 10)});
            }
        } else {
            log.unshift("You don't have enough items to do that.");
            updateGame();
        }
    }
}

// Variables
let log = [];
let actionsCompleted = [];
let loc = "the dark.";
let inventory = [];
let inventoryTotal = [];
let inventoryUnlocked = false;
let statsUnlocked = false;
let buildingsUnlocked = false;
let inventoryMax = 10;
let stats = [
    {name: "warmth", amount: 0, max: 15, unlocked: false}
];
let buildings = []
let actions = [
    new action("Awaken", 1, ["You awaken. You can't seem to recall anything, not even your own name. You seem to be in a small clearing in some sort of forest, tall trees surrounding you in the dark."],[],[],[],3,function(){},false),
    new action("Get up", 2, ["You stand up, brushing the dirt off of your clothes. Your legs feel wobbly and tired, but you'll manage for now."],[1],[],[],3,function(){},false),
    new action("Explore the area", 3, ["You walk around the forest, looking for anything to help you figure out where you are. Although you can't see any specific landmarks, there are plenty of sticks and twigs on the ground that could be useful."],[2],[],[],3,function(){},false),
    new action("Collect sticks", 4, ["You collect some sticks.","You pick up some sticks off the ground.","You pick up some sticks.","You find some sticks on the ground."],[3],[],[],1.5,function(){addResource("sticks",Math.floor(Math.random()*3)+1)},true),
    new action("Build a fire", 5, ["You build a fire using the sticks you've collected. It's not much, but it'll keep you warm."],[4],[{name: "sticks", amount: 5}],[{name: "sticks", amount: 8}],10,function(){
        statsUnlocked=true;
        stats.find(obj => obj.name === "warmth").unlocked = true;
        addBuilding("fire");
        loc = "camp.";
    },false),
    new action("Build a cart", 6, ["You build a small wooden cart from the sticks you've collected, allowing you to store a bit more stuff."],[4],[{name: "sticks", amount:10}],[{name: "sticks", amount: 10}],5,function(){
        inventoryMax += 10;
        addBuilding("cart");
    },false)
];
let intervals = [];

// Functions
function includesEvery(ar1, ar2) {
    if(ar1.every(r => ar2.includes(r))){
        return true;
    }
}

function updateSidebar() {
    document.getElementById("log").innerHTML = "";
    for (var i = 0; i < log.length; i++) {
        document.getElementById("log").innerHTML += "<p>" + log[i] + "<p><br>";
    }
    document.getElementById("location").innerHTML = loc;
    document.title = loc;
}

function updateActions() {
    document.getElementById("actions").innerHTML = "";
    for (var i = 0; i < actions.length; i++) {
        if (includesEvery(actions[i].requirements, actionsCompleted) && (!actionsCompleted.includes(actions[i].id) || actions[i].repeatable)) {
            // Check if the player has enough items to unlock the action
            var hasItems = true;
            if (actions[i].itemRequirements.length > 0) {
                for (var j = 0; j < actions[i].itemRequirements.length; j++) {
                    if (inventoryTotal.find(obj => obj.name === actions[i].itemRequirements[j].name).amount < actions[i].itemRequirements[j].amount) {
                        hasItems = false;
                    }
                }
            }
            if (hasItems) {
                document.getElementById("actions").innerHTML += `<button onclick='actions[${i}].runAction()' id='${actions[i].id}'>` + actions[i].name + "</button><br>";
            }
        }
    }
}

function updateInventory() {
    if (inventoryUnlocked) {
        document.getElementById("inventory").innerHTML = "<h2>inventory.</h2><br>";
        for (var i = 0; i < inventory.length; i++) {
            document.getElementById("inventory").innerHTML += "<p>" + inventory[i].name + ". ~ " + inventory[i].amount + "/"+inventoryMax+"</p><br>";
        }
    }
}

function updateStats() {
    if (statsUnlocked) {
        document.getElementById("stats").innerHTML = "<h2>player.</h2><br>";
        for (var i = 0; i < stats.length; i++) {
            if (stats[i].unlocked) {
                document.getElementById("stats").innerHTML += "<p>" + stats[i].name + ". ~ " + stats[i].amount.toFixed(2) + "/" + stats[i].max + "</p><br>";
            }
        }
    }
}

function updateBuildings() {
    if (buildingsUnlocked) {
        document.getElementById("buildings").innerHTML = "<h2>buildings.</h2><br>";
        for (var i = 0; i < buildings.length; i++) {
            document.getElementById("buildings").innerHTML += "<p>" + buildings[i].name + ".</p><br>";
        }
    }
}

function addResource(name, amount) {
    inventoryUnlocked = true;
    if (inventory.find(obj => obj.name === name)) {
        inventory.find(obj => obj.name === name).amount += amount;
        inventoryTotal.find(obj => obj.name === name).amount += amount;
        if (inventory.find(obj => obj.name === name).amount > inventoryMax) {
            inventory.find(obj => obj.name === name).amount = inventoryMax;
            inventoryTotal.find(obj => obj.name === name).amount = inventoryMax;
        }
    } else {
        inventory.push({name: name, amount: amount});
        inventoryTotal.push({name: name, amount: amount});
        if (inventory.find(obj => obj.name === name).amount > inventoryMax) {
            inventory.find(obj => obj.name === name).amount = inventoryMax;
            inventoryTotal.find(obj => obj.name === name).amount = inventoryMax;
        }
    }
    updateGame();
}

function addBuilding(name) {
    buildingsUnlocked = true;
    buildings.push({name: name});
    updateGame();
}

function updateGame() {
    updateSidebar();
    updateActions();
    updateInventory();
    updateStats();
    updateBuildings();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main
updateGame();
//gameLoop();

// Game loop
setInterval(function(){
    if (buildings.find(obj => obj.name === "fire")) {
        stats.find(obj => obj.name === "warmth").amount += 0.01;
        if (stats.find(obj => obj.name === "warmth").amount > stats.find(obj => obj.name === "warmth").max) {
            stats.find(obj => obj.name === "warmth").amount = stats.find(obj => obj.name === "warmth").max;
        }
        updateStats();
    }
}, 10);