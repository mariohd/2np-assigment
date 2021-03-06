/**
 * Universidade de Fortaleza - UNIFOR.
 * Mestrado em Informática Aplicada - MIA.
 * Construção e Análise de Algoritmos - Prof. Napoleão. 
 * Projeto final - Seletor de atividades. 
 * Equipe: Mário Diniz e Jonas Luz.
 * Junho, 2017.
 * 
 */

 "use strict";

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

/** Guarda o resultado no arquivo de saída. */
let writeOutput = (result) => {
	const filename = process.argv.length < 4 ? 'saida.txt' : process.argv[3];
	let output = '';
	for (let s of result) {
		output += `${s.length} ${s.map((si) => si.index).join(' ')}\n`;
	}
	fs.writeFileSync(filename, output, 'utf-8');
	console.log(`File ${filename} written.`.toUpperCase().green);
}

/**
 * Gera a instância de atividades.
 * @param {*} problem 
 * @param {*} index 
 */
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
 * Imprime a instância de atividades.
 * @param {*} instance de problema a imprimir.
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
	let result = new Array();
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
		console.log("C+T(S):", dynamicSolution.c);
		printGraphicalInstance({ 
			index: instance.index, 
			activities: dynamicSolution.activities 
		});

		console.log(`INSTANCE ${instance.index} - ENDED \n`.green);

		result.push(dynamicSolution.activities);
	});

	return result;
}

/**
 * Versão gulosa da solução.
 * @param {*} instance instância de problema.
 */
let greedyActivitySelector = (instance) => {
	let activities = instance.activities.slice();	// faz uma cópia do vetor de atividades
	let A = [activities.shift()];					// inicia seleção pela atividade 1 e retira ela do vetor de atividades.
	let i = A[0];									// atividade anterior (a comparar).

	for (let activity of activities) {				// para cada atividade remanescente...
		if (i.end <= activity.start) {				// se não conflitar com a anterior...
			let copy = Object.assign({}, activity);	// faz uma cópia da ativadade...
			A.push(copy);							// a coloca no resultado...
			i = copy;								// e a define como anterior.
		}
	}
	return { activities: A, index: instance.index };
};

/**
 * Versão em programação dinâmica da solução.
 * @param {*} instance instância do problema.
 */
let dynamicActivitySelector = (instance) => {

	/**
	 * Gera a matriz de encadeamento das atividades, c
	 * @param {*} activities as atividades a encadear.
	 */
	let matrixChainOrder = (activities) => {

		// Adiciona as atividades artificiais em A(0) e A(n+1).
		activities.unshift({start: Number.NEGATIVE_INFINITY, end: Number.NEGATIVE_INFINITY});
		activities.push({start: Number.POSITIVE_INFINITY, end: Number.POSITIVE_INFINITY});

		let n = activities.length;							// quantidade de atividades.
		let c = Matrix({ rows: n, columns: n, values: 0 });	// max de atividades compatíveis.

		for (let L = 3; L <= n ; L ++) {			// intervalo tratado (entre i e j) (iniciando de 3 pois atividades menores não possuem ninguém no intervalo).
			for (let i = 0; i <= (n - L); i ++) {	// idx atividade anterior do intervalo.
				let j = i + L - 1;					// idx atividade posterior do intervalo.
				for (let k = i + 1; k <= j - 1; k++) { // idx ativ. candidata no intervalo.
					if (activities[k].start >= activities[i].end 		
					    && activities[k].end <= activities[j].start) { // se ativ. candidata é compatível...
						let q = c[i][k] + c[k][j] + 1;	// calcula a qtd de ativ. compatíveis que incluem k 
						if (q > c[i][j]) {				// se a qtd para k for a maior até agora para o intervalo...
							c[i][j] = q;				// atualiza o valor max. de atividades compatíveis no intervalo.
							c[j][i] = k;				// registra a atividade k selecionada.
						}
					}
				}
			}
		}

		/**
		 * Seleção recursiva das atividades.
		 * @param {*} matrix 		matriz de seleção das atividades.
		 * @param {*} i 			índice atual.
		 * @param {*} activities 	atividades selecionadas.
		 */
		let getActivities = (matrix, i = 0, activities = []) => {
			// recupera a atividade da última linha, linha i.
			let activity = matrix[matrix.numRows - 1][i];
			
			if (activity == 0) { 	// atividade idx 0 atingida...
				return activities;	// fim da recursão.
			}

			activities.push(activity);	// adiciona a atividade selecionada na solução.
			// recupera, recursivamente, as próximas atividades da solução, a partir desta.
			return getActivities(matrix, activity, activities);
		}

		// Seleciona as atividades da solução a partir da matriz c.
		let selectedActivities = getActivities(c);

		// retorno: as atividades selecionadas e a matriz de trabalho, para demonstração.
		return {
			activities: activities.filter((a) => { 
				if (a.index) {
					return selectedActivities.includes(a.index); 
				} else {
					return false;
				}
			}),
			c
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
	let result = solveInstances(instances);
	writeOutput(result);
};

startProcess();
console.log("COMPLETE".underline.green);