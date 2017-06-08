var fs = require("fs");
var colors = require('colors');
var Matrix = require('node-matrix');

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
	let instance = { index: index + 1, activities: [] };
	let numbers = problem.split(' ').map(Number);
	let size = numbers.shift();

	for (let i = 0; i < size * 2; i += 2) {
		instance.activities.push(
			createActivity(`A${ (i/2) + 1 }`, numbers[i], numbers[i+1])
		);
	}

	return instance;
};

let printGraphicalInstance = (instance) => {

	let addBorders = (line) => line.replace(/--/, ' |').substring(0, line.length-2) + '|';
	let printRule = () => {
		let rule = '';
		for (let i = 0; i < size + 1; i ++ ) {
			rule += ` ${ i.toString(32).toUpperCase()} `;
		}
		console.log(rule);
	}

	console.log(`Instance: ${instance.index}`.bold);
	let size = Math.max.apply(Math, instance.activities.map((i) => i.end));
	printRule();
	instance.activities.forEach((activity) => {
		let emptySpaces = '   '.repeat(activity.start);
		let ocurring = emptySpaces + '---'.repeat(activity.end - activity.start + 1);
		let ended =  addBorders(ocurring) + '   '.repeat(size - activity.end);
		let subtitles = ended + `   ${ activity.toString()}`;
		console.log(subtitles);
	});
	printRule();
	console.log('');
};

let solveInstances = (instances) => {
	instances.forEach((instance) => {
		/*
		console.log(`INSTANCE ${instance.index} - STARTED`.green);
		console.log(`INSTANCE ${instance.index} - PROBLEM`.green);
		printGraphicalInstance(instance);

		let greedySolution = greedyActivitySelector(instance);
		console.log(`INSTANCE ${instance.index} - GREEDY SOLUTION`.green);
		printGraphicalInstance(greedySolution);
		*/
		let dynamicSolution = dynamicActivitySelector(instance);
		console.log(`INSTANCE ${instance.index} - DYNAMIC SOLUTION`.green);
		console.log(dynamicSolution);
		//printGraphicalInstance(dynamicSolution);

		console.log(`INSTANCE ${instance.index} - ENDED \n`.green);
	});
}

let greedyActivitySelector = (instance) => {
	console.log('Greedy Activity Selector'.toUpperCase().bold.red);
	let activities = instance.activities.slice();
	let A = [activities.shift()];
	let i = A[0];

	for (activity of activities) {
		if (i.end <= activity.start) {
			let copy = Object.assign({}, activity);
			A.push(copy);
			i = copy;
		}
	}
	console.log(A.map((a) => a.name ) + '\n');
	return { activities: A, index: instance.index };
};

let dynamicActivitySelector = (instance) => {
	let matrixChainOrder = (activities) => {
		activities.unshift({start: Number.NEGATIVE_INFINITY, end: Number.NEGATIVE_INFINITY});
		activities.push({start: Number.POSITIVE_INFINITY, end: Number.POSITIVE_INFINITY});

		let n = activities.length;
		let c = Matrix({ rows: n, columns: n, values: 0 });
		let s = Matrix({ rows: n, columns: n, values: 0 });

		for (let L = 3; L <= n ; L ++) {
			for (let i = 0; i <= (n - L); i ++) {
				let j = i + L - 1;
				for (let k = i + 1; k <= j - 1; k++) {
					if (activities[k].start >= activities[i].end && activities[k].end <= activities[j].start) {
						let q = c[i][k] + c[k][j] + 1; 
						if (q > c[i][j]) {
							c[i][j] = q;
							s[i][j] = k;
						}
					}
				}
			}
		}

		return {c , s};
	}

	return matrixChainOrder(instance.activities.slice());
} 

let startProcess = () => {
	let fileLocation = getFileLocation();
	let fileContent = readFileContent(fileLocation);
	let lines = fileContent.split('\n');
	let instancesToSolve = parseInt(lines.shift());
	let instances = lines.map(createInstance);
	solveInstances(instances);
};

startProcess();
console.log("COMPLETE".underline.green);