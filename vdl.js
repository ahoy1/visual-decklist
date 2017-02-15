//js ajax functions
function getOutput(postdata) {
  getRequest(
    	'save-to-server.php', // URL for the PHP file
       postdata, 		// our POST data
       drawOutput,  // handle successful request
       drawError    // handle error
  );
  return false;
} 

// handles drawing an error message
function drawError () {
    var container = document.getElementById('output');
    container.innerHTML = 'Bummer: there was an error!';
}
// handles the response, adds the html
function drawOutput(responseText) {
    //var container = document.getElementById('output');
    //container.innerHTML = responseText;
}
// helper function for cross-browser request object
function getRequest(url, postdata, success, error) {
    var req = false;
    try{
        // most browsers
        req = new XMLHttpRequest();
    } catch (e){
        // IE old versions
        try{
            req = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            // try an older version
            try{
                req = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e){
                return false;
            }
        }
    }
    if (!req) return false;
    if (typeof success != 'function') success = function () {};
    if (typeof error!= 'function') error = function () {};
    req.onreadystatechange = function(){
        if(req .readyState == 4){
            return req.status === 200 ? 
                success(req.responseText) : error(req.status)
            ;
        }
    }
    req.open("POST", url, true);
      req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  		req.send(postdata); 
    //req.send(null);
    return req;
}

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

	    console.log(cardData);
	
	    //call the saveCardImages function
			vdl.saveCardImages();
	  });
	},
	//save card images to the server
	saveCardImages : function(){	
		console.log('saveCardImages called');
		console.log(vdl.state);
		var queryStringURLs = "cardurls=";
		var queryStringNames = "cardnames=";
		var deck = vdl.state.deck;

		for (var i = 0; i < deck.length; i++) {
			if (deck[i].isDivider != true) {
				queryStringURLs = queryStringURLs + deck[i].attributes.imageUrl.replace('&type=card', '%26type=card') + ',';
				console.log(queryStringURLs);
				queryStringNames = queryStringNames + encodeURI(deck[i].attributes.name) + ',';
			}
		}
		var queryString = queryStringURLs.replace(/,\s*$/, "") + '&' + queryStringNames.replace(/,\s*$/, "");
		console.log(`query string is ${queryString}`);
		getOutput(queryString);
		vdl.renderDeck();
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
		//display the contents of .col-right
		document.querySelector('.col-right').classList.add('active');
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

	    if (deck[i].isDivider) {

	    	//cardFlexTag & leftTagDiv is duplicated in either side of this if statement
	    	//these elements have to be appeneded to the DOM AFTER the cardBgTag div to
	    	//to make the screenshot work properly

	    	//add flex container 
		    var cardFlexTag = document.createElement('div');
		    cardFlexTag.className = 'card-flex';

		    //add container for quantity and name
		    var leftDivTag = document.createElement('div');
		    cardFlexTag.appendChild(leftDivTag);

				row.className = row.className + ' divider';
	    }
	    else {

	    	//add card bg 
		    var cardBgTag = document.createElement('div');
		    cardBgTag.className = 'card-bg';
		    row.appendChild(cardBgTag);

		    //add flex container 
		    var cardFlexTag = document.createElement('div');
		    cardFlexTag.className = 'card-flex';

		    //add container for quantity and name
		    var leftDivTag = document.createElement('div');
		    cardFlexTag.appendChild(leftDivTag);

	    	if (deck[i].isSplit){
	    		//cardBgTag.setAttribute('style', 'background-image:url("' + deck[i].attributes.imageUrl + '"), url("' + deck[i].attributes.imageUrl + '")');
	    		cardBgTag.setAttribute('style', 'background-image:url("img/' + encodeURIComponent(deck[i].attributes.name) + '.jpg"), url("img/' + encodeURIComponent(deck[i].attributes.name) + '.jpg")');
					row.className = row.className + ' split-card';
	    	}
	    	else {
	    	  //cardBgTag.setAttribute('style', 'background-image:url("' + deck[i].attributes.imageUrl + '")');
	    		cardBgTag.setAttribute('style', 'background-image:url("img/' + encodeURIComponent(deck[i].attributes.name) + '.jpg")');
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
		      thisManaCostHTML = thisManaCostHTML.replace(/{/g, '<span class="mana m-');
		      thisManaCostHTML = thisManaCostHTML.replace(/\//g, '');
		      thisManaCostHTML = thisManaCostHTML.replace(/}/g, '"></span>');
		      console.log(thisManaCostHTML);
		      manaCostTag.innerHTML = thisManaCostHTML;
		    }
		    cardFlexTag.appendChild(manaCostTag);
			}
	    row.appendChild(cardDarkenTag);

	    row.appendChild(cardFlexTag);
			
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
	