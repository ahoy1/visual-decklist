const mtg = require('mtgsdk');
// mtg.card.all({ name: 'ether hub|dismember'})
// 	.on('data', card => {
// 	    console.log(card.name);
// 	    console.log(card);
// 	}
// );


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
	  var splitPartner = '';
	  var isSplit = false;

	  for (var i = 0; i < deckLines.length; i++){
	  	queryName = '';
	  	splitPartner = '';
	  	isSplit = false;
	    var number = deckLines[i].substr(0,deckLines[i].indexOf(' ')); //4
	    //check if there's a number. treat lines without a number as a divider
	    var hasNumber = !isNaN(parseInt(number));
	    if (hasNumber) {
	      var name = deckLines[i].substr(deckLines[i].indexOf(' ')+1); //Lighting Bolt	

	     	//handle "aether" and split cards 
		    queryName = name.toLowerCase();
		    if (name.indexOf('aether') > -1) {
					var queryName = name.replace ('aether', 'ether');
		    }
		    //handle split cards
		    if (name.indexOf('//') > -1) {
		    	isSplit = true;
		    	var queryName = name.substr(0, name.indexOf('//')).trim().toLowerCase();

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
	        'isSplit' : isSplit,
	        'splitPartner' : splitPartner,
	        'isDivider' : !hasNumber,
	        'attributes' : {}
	    });
	  };
	  vdl.state.deck = deck;
	  queryListArr = unique(queryListArr);
	  vdl.state.queryList = queryListArr;

		//call requestCards here
		vdl.updateLocalStorage(vdl.state);
		vdl.requestCards(vdl.state.queryList);
	},
	//make the API call
	requestCards : function(queryListArr){
		var queryListString = queryListArr.join('|').toLowerCase();
  	var cardData = [];
	  var emitter = mtg.card.all({ name : queryListString });
	  emitter.on('data', card => {
	    cardData.push(card);
	  });
	  emitter.on('end', finish => {
	    for (var i = 0; i < cardData.length; i++) {
	      var thisCard = cardData[i];
	      var thisCardName = thisCard.name.toLowerCase();
	      for (var j = 0; j < vdl.state.deck.length; j++) {
	        // if (thisCardName === vdl.state.deck[j].name.toLowerCase()){
	        //   vdl.state.deck[j].attributes = thisCard;
	        // }

	        // do fuzzy matching to account for split cards
	        // this could cause problems if a split card name is contined w/in another card name
	        // think fire//ice and fireball
	        if (vdl.state.deck[j].name.toLowerCase().indexOf(thisCardName) > -1) {
	          vdl.state.deck[j].attributes = thisCard;	
	        }
	      }
	    }
	    //call the renderDeck function
			vdl.renderDeck();
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
		vdl.updateLocalStorage(vdl.state);
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
	renderDeck : function(){
		var deck = vdl.state.deck;
		var visualDeckList = document.getElementById('visualDeckList');
	  visualDeckList.innerHTML = '';
	  var deckNameTag = document.createElement('div');
	  deckNameTag.className = 'deck-name';
	  deckNameTag.innerHTML = '<div>' + vdl.state.deckName + '</div>';
	  visualDeckList.appendChild(deckNameTag);
	  for (var i = 0; i < deck.length; i++) {
	    //create a row representing a deckslot
	    var row = document.createElement('div');
	    row.className = 'card cardslot' + i;

		  //add card darken filter
	    var cardDarkenTag = document.createElement('div');
	    cardDarkenTag.className = 'card-darken';
	    row.appendChild(cardDarkenTag);

	    //add flex container 
	    var cardFlexTag = document.createElement('div');
	    cardFlexTag.className = 'card-flex';
	    row.appendChild(cardFlexTag);

	    //add container for quantity and name
	    var leftDivTag = document.createElement('div');
	    cardFlexTag.appendChild(leftDivTag);

	    if (deck[i].isDivider) {
				row.className = row.className + ' divider';
	    }
	    else{

	    	//add card bg 
		    var cardBgTag = document.createElement('div');
		    cardBgTag.className = 'card-bg';
		    row.appendChild(cardBgTag);

	    	if (deck[i].isSplit){
	    		cardBgTag.setAttribute('style', 'background-image:url("' + deck[i].attributes.imageUrl + '"), url("' + deck[i].attributes.imageUrl + '")');
					row.className = row.className + ' split-card';
	    	}
	    	else {
	    	  cardBgTag.setAttribute('style', 'background-image:url("' + deck[i].attributes.imageUrl + '")');
	    	}
	    	//add the quantity
		    var quantityTag = document.createElement('span');
		    quantityTag.className = 'card-quantity';
		    quantityTag.innerHTML = deck[i].quantity + '&nbsp;';
		    leftDivTag.appendChild(quantityTag);

		    //add the mana cost
		    var manaCostTag = document.createElement('div');
		    manaCostTag.className = 'mana-cost';
		    var thisManaCost = deck[i].attributes.manaCost;
		    if (typeof thisManaCost != 'undefined') {
		      thisManaCostHTML = thisManaCost.toLowerCase();
		      thisManaCostHTML = thisManaCostHTML.replace(/{/g, '<span class="mana small s');
		      thisManaCostHTML = thisManaCostHTML.replace(/\//g, '');
		      thisManaCostHTML = thisManaCostHTML.replace(/}/g, '"></span>');
		      manaCostTag.innerHTML = thisManaCostHTML;
		    }
		    cardFlexTag.appendChild(manaCostTag);
			}
		  //add the name
	    var cardNameTag = document.createElement('span');
	    cardNameTag.className = 'card-name';
	    cardNameTag.textContent = deck[i].name;
	    leftDivTag.appendChild(cardNameTag);
	    visualDeckList.appendChild(row);
	  }

	  var builtWithTag = document.createElement('div');
	  builtWithTag.className = 'built-with';
	  builtWithTag.innerHTML ='VisualDecklist.com';
	  visualDeckList.appendChild(builtWithTag);
	  document.getElementById('pleaseWait').className = 'hidden please-wait';


	  ga('send', 'event', 'DeckListBuilt');
	  return false;
	},
	init : function(){
		document.getElementById('button').addEventListener('click', function(){

			//activate please wait text
			document.getElementById('pleaseWait').className = 'please-wait';

			//get inputs
		  var deckName = document.getElementById('deckName').value;
		  var deckLines = document.getElementById('decklist').value.split('\n');
		  //strip empty elements from array. works because empty strings are falsey
		  deckLines = deckLines.filter(Boolean);

		  //clear the state from the previous decklist, if there was one
		  vdl.clearState();
			
			//cardNames, deck, deckName, queryList
			vdl.updateState('', vdl.state.deck, deckName, vdl.state.queryList);

			vdl.parseDecklist(deckLines);			
		 }, false);
	},
}

vdl.init();
	