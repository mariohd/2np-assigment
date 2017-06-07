var fs = require("fs");

let getFileLocation = () => {
	if (process.argv.length <= 2) {
		console.log("Usage: " + __filename + " SOME_TEXT_FILE");
		process.exit(-1);
	}

	return process.argv[2];
};

let readFileContent = (location) => fs.readFileSync(location, 'utf8');

let createInstance = (problem, index) => {
	let createActivity = (name, start, end) => {
		let activity = {name, start, end};
		activity.toString = () => `${name} - (${start}, ${end})`;
		return activity;
	};
	let instance = {index, activities: [] };
	let numbers = problem.split(' ');
	let size = numbers.shift();

	for (var i = 0; i < size * 2; i += 2) {
		instance.activities.push(
			createActivity(`A${ (i/2) + 1 }`, numbers[i], numbers[i+1])
		);
	}

	return instance;
};

let printInstances = (instances) => {
	instances.forEach((instance) => {
		console.log(`Instance: ${instance.index}`);
		instance.activities.forEach((activity) => {
			console.log(`\tActivity: ${ activity.toString() }`);
		});
	});
};

let startProcess = () => {
	let fileLocation = getFileLocation();
	let fileContent = readFileContent(fileLocation);
	let lines = fileContent.split('\n');
	let instancesToSolve = parseInt(lines.shift());
	let instances = lines.map(createInstance);
	printInstances(instances);
};

startProcess();
console.log("Complete");