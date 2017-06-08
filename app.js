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
	let instance = { index, activities: [] };
	let numbers = problem.split(' ').map(Number);
	let size = numbers.shift();

	for (let i = 0; i < size * 2; i += 2) {
		instance.activities.push(
			createActivity(`A${ (i/2) + 1 }`, numbers[i], numbers[i+1])
		);
	}

	return instance;
};

let printGraphicalInstances = (instances) => {

	let addBorders = (line) => line.replace(/--/, ' |').substring(0, line.length-2) + '|';

	instances.forEach((instance) => {
		console.log(`Instance: ${instance.index}`);
		let size = Math.max.apply(Math, instance.activities.map((i) => i.end));
		let strings = instance.activities.map((activity) => {
			let emptySpaces = '   '.repeat(activity.start);
			let ocurring = emptySpaces + '---'.repeat(activity.end - activity.start + 1);
			let ended =  addBorders(ocurring) + '   '.repeat(size - activity.end);
			let subtitles = ended + `   ${ activity.toString() } `;
			return subtitles;
		});
		let rule = '';
		for (let i = 0; i < size + 1; i ++ ) {
			rule += ` ${ i.toString(32).toUpperCase()} `;
		}

		strings.push(rule);
		strings.unshift(rule);
		strings.forEach((s) => console.log(s));
		console.log('');
	});
};

let greedyActivitySelector = (instances) => {
	console.log('Greedy Activity Selector \n'.toUpperCase());
	let instanceAnalysis = (instance) => {
		let activities = instance.activities.slice();
		let A = [activities.shift()];
		let i = A[0];

		for (activity of activities) {
			if (i.end <= activity.start) {
				A.push(activity);
				i = activity;
			}
		}
		console.log(A.map((a) => a.name ));
		console.log(`INSTANCE ${instance.index} ENDED`);
		console.log('');
		return A;
	};

	return instances.map(instanceAnalysis);
};

let startProcess = () => {
	let fileLocation = getFileLocation();
	let fileContent = readFileContent(fileLocation);
	let lines = fileContent.split('\n');
	let instancesToSolve = parseInt(lines.shift());
	let instances = lines.map(createInstance);
	greedyActivitySelector(instances);
	printGraphicalInstances(instances);
};

startProcess();
console.log("Complete");