const mtg = require('mtgsdk');

var vdl = {
	state : {
		'cardNames' : [],
		'deck' : [],
		'deckName' : '',
		'queryList' : '',

	},
	//get user input from form
	getUserInput : function(){
	
	},
	//parse userinput decklist into a queryList that the mtgsdk can accept
	parseDecklist : function(deckLines){
	  var cardNamesArr = [];
	  var deck = [];


	  for (var i = 0; i < deckLines.length; i++){
	    var number = deckLines[i].substr(0,deckLines[i].indexOf(' ')); //4
	    //check if there's a number. treat lines without a number as a divider
	    var hasNumber = !isNaN(parseInt(number));
	    if (hasNumber) {
	      var name = deckLines[i].substr(deckLines[i].indexOf(' ')+1); //Lighting Bolt	    	
	    }
	    else {
	    	var name = deckLines[i];
	    }
	    //handle "aether" and split cards 
	    var queryName = name;
	    if (name.indexOf('aether') > -1) {
	    	console.log('found an aether');
				var queryName = name.replace ('aether', 'ether');
	    }
	    if (name.indexOf('//') > -1) {
	    	var queryName = name.substr(0, name.indexOf('//')).trim();
	    }

	    cardNamesArr.push(name);
	    deck.push({
	        'slot' : i,
	        'name' : name,
	        'queryName': queryName,
	        'quantity' : number,
	        'isDivider' : !hasNumber,
	        'attributes' : {}
	    });
	  };
	  vdl.state.deck = deck;
	  queryList = cardNamesArr.join('|');
	  vdl.state.queryList = queryList;

	  console.log('parseDecklist done, heres vdl.state:');
	  console.log(vdl.state);

		  //call requestCards here
	},
	//make the API call
	requestCards : function(cards){

	},
	//update the state, also add the state obj to localStorage
	updateState : function(cardNames, deck, deckName, queryList){
		if (cardNames) {
			this.state.cardNames = cardNames;
		}
		if (deck) {
			this.state.deck = deck;
		}
		if (deckName) {
			this.state.deckName = deckName;
		}
		if (queryList) {
			this.state.queryList = queryList;
		}
		vdl.updateLocalStorage(this.state);
	},
	updateLocalStorage : function(state){
		localStorage.setItem('visualDecklistState', state)
	},
	clearState : function(){
		this.state = {
			'cardNames' : [],
			'deck' : [],
			'deckName' : '',
			'queryList' : '',
		};
		this.updateLocalStorage(this.state);
	},
	render : function(deck){

	},
	init : function(){
		console.log('init');
		document.getElementById('button').addEventListener('click', function(){

			//activate please wait text
			document.getElementById('pleaseWait').className = 'please-wait';

			//get inputs
		  var deckName = document.getElementById('deckName').value;
		  var deckLines = document.getElementById('decklist').value.split('\n');
		  //strip empty elements from array. works because empty strings are falsey
		  deckLines = deckLines.filter(Boolean);
			
			//cardNames, deck, deckName, queryList
			vdl.updateState('', vdl.state.deck, deckName, vdl.state.queryList);

			vdl.parseDecklist(deckLines);			
		 }, false);
	},

	render : function(){

	},
}

vdl.init();
	