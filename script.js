// Array to hold the particles
let particles = [];

// Variable to hold the time of the next explosion
let nextExplosion = 0;

// Constants for the range of time between explosions
const startSeconds = 5000;
const endSeconds = 60000;

// Array to hold the obstacles
let obstacles = [];
let cellSize = 75;
const particleAmount = 70;
let count = 0; // Add this line to keep track of the count
const victoryProsentage = 80;
const windowHeightForVictory = 200;
const windowWidthForVictory = 200;
const collisionRadius = 1.6;
let resetButton;

let formattedPercentage = 0;

function updateCountDisplay() {
	document.getElementById('countDisplay').innerText =
		'Count: ' + formattedPercentage + '%';
	console.log('🚀 ~ updateCountDisplay ~ count:', formattedPercentage);
}
function allParticlesInCenter() {
	for (let i = 0; i < particles.length; i++) {
		let dx = particles[i].pos.x - width / 2;
		let dy = particles[i].pos.y - height / 2;
		if (dx * dx + dy * dy > windowHeightForVictory * windowWidthForVictory) {
			return false;
		}
	}
	return true;
}
// The setup function runs once when the program starts
function setup() {
	// Create a canvas that fills the window
	createCanvas(windowWidth, windowHeight);
	// Initialize the particles array with 50 random particles
	for (let i = 0; i < particleAmount; i++) {
		particles[i] = new Particle(random(width), random(height));
	}

	// Set the time of the next explosion to a random time between startSeconds and endSeconds from now
	nextExplosion = millis() + random(startSeconds, endSeconds);
	let cols = floor(width / cellSize);
	let rows = floor(height / cellSize);

	// Initialize all cells as walls
	let cells = Array(cols * rows).fill(true);

	// Start from a random cell
	let start = floor(random(cols * rows));
	cells[start] = false;

	// List of walls
	let walls = getNeighbors(start, cols, rows);

	while (walls.length > 0) {
		// Pick a random wall from the list
		let wallIndex = floor(random(walls.length));
		let wall = walls[wallIndex];
		let neighbors = getNeighbors(wall, cols, rows);

		// If the wall separates two cells and only one of them is a passage, make the wall a passage
		let passages = neighbors.filter((neighbor) => !cells[neighbor]);
		if (passages.length === 1) {
			cells[wall] = false;
			walls.push(...neighbors.filter((neighbor) => cells[neighbor]));
		}

		// Remove the wall from the list
		walls.splice(wallIndex, 1);
	}

	// Create obstacles for all cells that are still walls
	for (let i = 0; i < cells.length; i++) {
		if (cells[i]) {
			let x = (i % cols) * cellSize + cellSize / 2;
			let y = floor(i / cols) * cellSize + cellSize / 2;
			let dx = x - width / 2;
			let dy = y - height / 2;
			if (dx * dx + dy * dy > windowHeightForVictory * windowWidthForVictory) {
				let color = random() > 0.5 ? 0 : 255; // Choose randomly between black and white
				obstacles.push({x, y, r: cellSize / 2, color});
			}
		}
	}
	resetButton = createButton('Reset');
	resetButton.position(50, 50);
	resetButton.mousePressed(reset);
}

function getNeighbors(index, cols, rows) {
	let neighbors = [];
	let x = index % cols;
	let y = floor(index / cols);

	if (x > 0) neighbors.push(index - 1); // left
	if (x < cols - 1) neighbors.push(index + 1); // right
	if (y > 0) neighbors.push(index - cols); // top
	if (y < rows - 1) neighbors.push(index + cols); // bottom

	return neighbors;
}
// The windowResized function is called whenever the window is resized
function windowResized() {
	// Resize the canvas to fill the window
	resizeCanvas(windowWidth, windowHeight);
}

// The drawObstacles function draws the obstacles
function drawObstacles() {
	for (let i = 0; i < obstacles.length; i++) {
		fill(obstacles[i].color); // Use the obstacle's color
		rect(
			obstacles[i].x,
			obstacles[i].y,
			obstacles[i].r * 2,
			obstacles[i].r * 2
		);
	}
}
// The draw function runs continuously until the program is stopped
function draw() {
	background(200);
	drawObstacles();

	for (let i = 0; i < particles.length; i++) {
		particles[i].update();
		particles[i].show();
	}

	if (millis() > nextExplosion) {
		explode();
		nextExplosion = millis() + random(startSeconds, endSeconds);
	}

	// Add these lines to check if all particles are in the center and increment the count if they are
	if (allParticlesInCenter()) {
		if (count > 50) count++;
	}

	// Add these lines to display the count at the top right of the screen
	fill(0);
	textSize(32);
	let percentage = (count / particles.length) * 100;
	formattedPercentage = percentage.toFixed(2);

	// Call this function whenever the count changes
	updateCountDisplay();
	if ((count / particles.length) * 100 >= victoryProsentage) {
		textSize(72); // Set the text size
		textFont('Helvetica'); // Set the font
		textAlign(CENTER, CENTER); // Center the text

		text('Victory!', width / 2, height / 2);
		resetButton.show();
	} else {
		resetButton.hide();
	}
}
function reset() {
	particles = Array.from(
		{length: 50},
		() => new Particle(random(width), random(height))
	);
	count = 0;
}
// The mousePressed function is called whenever the mouse is pressed
function mousePressed() {
	// For each particle
	for (let i = 0; i < particles.length; i++) {
		// Calculate a vector pointing from the particle to the mouse
		let dir = p5.Vector.sub(particles[i].pos, createVector(mouseX, mouseY));

		// Normalize the vector to get a unit vector
		dir.normalize();

		// Multiply the vector by 20 to increase its magnitude
		dir.mult(20);

		// Set the particle's velocity to this vector, causing it to move towards the mouse
		particles[i].vel = dir;
	}
}

// The explode function causes all particles to move in random directions
function explode() {
	// For each particle
	for (let i = 0; i < particles.length; i++) {
		// Calculate a random direction vector
		let dir = p5.Vector.random2D();

		// Multiply the vector by 20 to increase its magnitude
		dir.mult(20);

		// Set the particle's velocity to this vector, causing it to move in a random direction
		particles[i].vel = dir;
	}
}
/**
 * Represents a particle.
 * @constructor
 * @param {number} x - The x-coordinate of the particle's position.
 * @param {number} y - The y-coordinate of the particle's position.
 */
function Particle(x, y) {
	this.pos = createVector(x, y);
	this.vel = createVector(0, 0);
	this.acc = createVector(0, 0);
	this.color = [random(255), random(255), random(255)];
	this.inCenter = false;
	/**
	 * Updates the particle's position and velocity based on the mouse position and obstacles.
	 */
	this.update = function () {
		let mouse = createVector(mouseX, mouseY);
		this.acc = p5.Vector.sub(mouse, this.pos);
		this.acc.setMag(0.1);

		this.avoidObstacles();
		this.vel.add(this.acc);
		this.vel.limit(5);
		this.pos.add(this.vel);
		// Check if the particle is in the center
		let dx = this.pos.x - width / 2;
		let dy = this.pos.y - height / 2;
		let inCenter =
			dx * dx + dy * dy <= windowHeightForVictory * windowWidthForVictory;

		// If the particle just entered the center, increment the count
		if (inCenter && !this.inCenter) {
			count++;
		}

		// If the particle just left the center, decrement the count
		if (!inCenter && this.inCenter) {
			count--;
		}

		this.inCenter = inCenter;
	};

	/**
	 * Avoids obstacles by adjusting the particle's acceleration.
	 */
	// Method to avoid obstacles
	this.avoidObstacles = function () {
		// Loop over each obstacle
		for (let i = 0; i < obstacles.length; i++) {
			// Increase the radius for collision detection
			let biggerRadius = obstacles[i].r * collisionRadius; // Increase as needed

			// Check if the particle is inside the increased radius of the obstacle
			if (
				this.pos.x > obstacles[i].x - biggerRadius &&
				this.pos.x < obstacles[i].x + biggerRadius &&
				this.pos.y > obstacles[i].y - biggerRadius &&
				this.pos.y < obstacles[i].y + biggerRadius
			) {
				// Calculate a vector pointing from the obstacle to the particle
				let dir = p5.Vector.sub(
					this.pos,
					createVector(obstacles[i].x, obstacles[i].y)
				);

				// Normalize the vector to get a unit vector
				dir.normalize();

				// Set the magnitude of the vector to 0.5
				dir.setMag(0.5);

				// Add the direction vector to the particle's acceleration, causing it to move away from the obstacle
				this.acc.add(dir);
			}
		}
	};

	/**
	 * Displays the particle on the canvas.
	 */
	this.show = function () {
		fill(this.color);
		push();
		translate(this.pos.x, this.pos.y);
		rotate(this.vel.heading());
		triangle(-10, -5, 10, 0, -10, 5);
		pop();
	};
}
