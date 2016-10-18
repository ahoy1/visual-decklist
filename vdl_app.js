const mtg = require('mtgsdk');

var vdl = {
	state : {
		'cardNames' : [];
		'queryList' : '';
		'deck' : [],
		'deckName' : '',
	},
	//get user input from form
	getUserInput : function(){
	
	},
	//parse userinput decklist into a queryList that the mtgsdk can accept
	parseDecklist : function(deckList){

	}.
	//make the API call
	requestCards : function(cards){

	},
	//update the state, also add the state obj to localStorage
	updateState : function(cardNames, queryList, deck, deckName){
		if (cardNames) {
			this.state.cardNames = cardNames;
		}
		if (queryList) {
			this.state.queryList = queryList;
		}
		if (deck) {
			this.state.deck = deck;
		}
		if (deckName) {
			this.state.deckName = deckName;
		}
		updateLocalStorage(this.state);
	},
	updateLocalStorage : function(state){
		localStorage.setItem('visualDecklistState', state)
	}
	clearState : function(){
		this.state = {
			'cardNames' : [];
			'queryList' : '';
			'deck' : [],
			'deckName' : '',
		};
		updateLocalStorage(this.state);
	}
	render : function(deck){

	},
	init : function(){
		document.getElementById('button').addEventListener('click', function(){

			//activate please wait text
			document.getElementById('pleaseWait').className = 'please-wait';

			//get inputs
		  var deckName = document.getElementById('deckName').value;
		  var queryList = document.getElementById('decklist').value.split('\n');
		  //strip empty elements from array. works because empty strings are falsey
		  queryList = queryList.filter(Boolean);
			
			//cardNames, queryList, deck, deckName
			this.updateState([], queryList, [], deckName);
			console.log(this.state);


		//   for (var i = 0; i < queryList.length; i++){
		//     var number = queryList[i].substr(0,queryList[i].indexOf(' ')); //4
		//     var name = queryList[i].substr(queryList[i].indexOf(' ')+1); //Lighting Bolt
		//     cardnames.push(name);
		//     deck.push({
		//         'cardslot' : i,
		//         'name' : name,
		//         'number' : number,
		//         'attributes' : {}
		//     });
		//   };

		//   cardnames = cardnames.join('|');
		//   var cardData = getCardsByNames(cardnames);
		// }, false);
	},

	render : function(){

	},
	