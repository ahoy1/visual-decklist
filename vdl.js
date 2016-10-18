const mtg = require('mtgsdk');

//removes duplicates from an array
function unique(arr) {
    var seen = {};
    return arr.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

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
	  var queryListArr = [];
	  var deck = [];
	  var queryName = '';

	  for (var i = 0; i < deckLines.length; i++){
	  	queryName = '';
	    var number = deckLines[i].substr(0,deckLines[i].indexOf(' ')); //4
	    //check if there's a number. treat lines without a number as a divider
	    var hasNumber = !isNaN(parseInt(number));
	    if (hasNumber) {
	      var name = deckLines[i].substr(deckLines[i].indexOf(' ')+1); //Lighting Bolt	

	     	//handle "aether" and split cards 
		    queryName = name;
		    if (name.indexOf('aether') > -1) {
					var queryName = name.replace ('aether', 'ether');
		    }
		    if (name.indexOf('//') > -1) {
		    	var queryName = name.substr(0, name.indexOf('//')).trim();
		    }

		    queryListArr.push(queryName);    	
	    }
	    else {
	    	var name = deckLines[i];
	    }

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
	  queryListArr = unique(queryListArr);
	  vdl.state.queryList = queryListArr;

		//call requestCards here
		 vdl.requestCards(vdl.state.queryList);
	},
	//make the API call
	requestCards : function(queryListArr){
		console.log('requestCards called');
		var queryListString = queryListArr.join('|');
		console.log('queryListString:' + queryListString);
  	var cardData = [];
	  var emitter = mtg.card.all({ name : queryListString });
	  emitter.on('data', card => {
	    cardData.push(card);
	  });
	  emitter.on('end', finish => {
	  	console.log('ended');
	  	console.log(cardData);

	    for (var i = 0; i < cardData.length; i++) {
	      var thisCard = cardData[i];
	      var thisCardName = thisCard.name.toLowerCase();
	      for (var j = 0; j < deck.length; j++) {
	        if (thisCardName === deck[j].name.toLowerCase()){
	          deck[j].attributes = thisCard;
	        }
	      }
	    }
	    console.log('finished requestCards, heres vdl.state again');
	    console.log(vdl.state);
	    return false;
	  });
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
	