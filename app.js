/**
 * Universidade de Fortaleza - UNIFOR.
 * Mestrado em Informática Aplicada - MIA.
 * Construção e Análise de Algoritmos - Prof. Napoleão. 
 * Projeto final - Seletor de atividades. 
 * Equipe: Mário Diniz e Jonas Luz.
 * Junho, 2017.
 * 
 */

/** Bibliotecas requeridas. */
var fs = require("fs");
var colors = require('colors');
var Matrix = require('node-matrix');

/** Recupera o nome do arquivo de entrada. */
let getFileLocation = () => {
	if (process.argv.length <= 2) {
		console.log("Usage: " + __filename + " SOME_TEXT_FILE");
		process.exit(-1);
	}

	return process.argv[2];
};

/** Lê o conteúdo do arquivo de entrada. */
let readFileContent = (location) => fs.readFileSync(location, 'utf8');

let createInstance = (problem, index) => {
	let createActivity = (index, start, end) => {
		let activity = {index, name: `A${index}`, start, end};
		activity.toString = () => `A${index} - (${start}, ${end})`;
		return activity;
	};
	let instance = { index: index + 1, activities: [] };
	let numbers = problem.split(' ').map(Number);
	let size = numbers.shift();

	for (let i = 0; i < size * 2; i += 2) {
		instance.activities.push(
			createActivity((i/2) + 1, numbers[i], numbers[i+1])
		);
	}

	return instance;
};

/**
 * Imprime a instância da atividade.
 * @param {*} instance a imprimir.
 */
let printGraphicalInstance = (instance) => {

	let addBorders = (line) => line.replace(/--/, ' |').substring(0, line.length-2) + '|';
	let printRule = () => {
		let rule = '';
		for (let i = 0; i < size + 1; i ++ ) {
			rule += ` ${ i.toString(32).toUpperCase()} `;
		}
		console.log(rule);
	}

	console.log(`Instance: ${instance.index} : ${ 	instance.activities.map((a) => a.name ) }`.bold);
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

/**
 * Resolve o problema de seleção de atividades.
 * @param {*} instances Lista de instâncias de atividades.
 */
let solveInstances = (instances) => {
	instances.forEach((instance) => {
		
		console.log(`INSTANCE ${instance.index} - STARTED`.green);
		console.log(`INSTANCE ${instance.index} - PROBLEM`.green);
		printGraphicalInstance(instance);

		console.log('Greedy Activity Selector'.toUpperCase().bold.red);
		let greedySolution = greedyActivitySelector(instance);
		console.log(`INSTANCE ${instance.index} - GREEDY SOLUTION`.green);
		printGraphicalInstance(greedySolution);
		
		console.log('Dynamic Activity Selector'.toUpperCase().bold.red);
		let dynamicSolution = dynamicActivitySelector(instance);
		console.log(`INSTANCE ${instance.index} - DYNAMIC SOLUTION`.green);
		console.log("C:", dynamicSolution.c);
		console.log("S:", dynamicSolution.s);
		printGraphicalInstance({ 
			index: instance.index, 
			activities: dynamicSolution.activities 
		});

		console.log(`INSTANCE ${instance.index} - ENDED \n`.green);
	});
}

/** Versão gulosa da solução. */
let greedyActivitySelector = (instance) => {
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
	return { activities: A, index: instance.index };
};

/** Versão em programação dinâmica da solução. */
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

		let getActivities = (matrix, i = 0, activities = []) => {
			let activity = matrix[i][matrix.numCols - 1];

			if (activity == 0) {
				return activities;
			}

			activities.push(activity);
			return getActivities(matrix, activity, activities);
		}
		let selectedActivities = getActivities(s);
		return {
			activities: activities.filter((a) => { 
				if (a.index) {
					return selectedActivities.includes(a.index); 
				} else {
					return false;
				}
			}),
			c,
			s
		};
	}

	return matrixChainOrder(instance.activities.slice());
} 

/** Rotina principal. */
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