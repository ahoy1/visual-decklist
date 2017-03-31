// js ajax functions
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
function drawError() {
  const container = document.getElementById('output');
  container.innerHTML = 'Bummer: there was an error!';
}
// handles the response, adds the html
function drawOutput(responseText) {
    // var container = document.getElementById('output');
    // container.innerHTML = responseText;
}
// helper function for cross-browser request object
function getRequest(url, postdata, success, error) {
  let req = false;
  try {
        // most browsers
    req = new XMLHttpRequest();
  } catch (e) {
        // IE old versions
    try {
      req = new ActiveXObject('Msxml2.XMLHTTP');
    } catch (e) {
            // try an older version
      try {
        req = new ActiveXObject('Microsoft.XMLHTTP');
      } catch (e) {
        return false;
      }
    }
  }
  if (!req) return false;
  if (typeof success !== 'function') success = function () {};
  if (typeof error !== 'function') error = function () {};
  req.onreadystatechange = function () {
    if (req.readyState == 4) {
    	console.log('saving done');
    	vdl.renderDeck();
      return req.status === 200 ? success(req.responseText) : error(req.status);
    }
  };
  req.open('POST', url, true);
  req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  		req.send(postdata);
    // req.send(null);
  return req;
}

// test if a file exists
function UrlExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404;
}

const mtg = require('mtgsdk');
// mtg.card.all({ name: 'ether hub|dismember'})
// 	.on('data', card => {
// 	    console.log(card.name);
// 	    console.log(card);
// 	}
// );

// removes duplicates from an array
function unique(arr) {
  const seen = {};
  return arr.filter(item => seen.hasOwnProperty(item) ? false : (seen[item] = true));
}

var vdl = {
  state: {
    cardNames: [],
    deck: [],
    deckName: '',
    queryList: '',
  },
	// get user input from form
  getUserInput() {

  },
	// parse userinput decklist into a queryList that the mtgsdk can accept
  parseDecklist(deckLines) {
	  let queryListArr = [];
	  const deck = [];
	  var queryName = '';
	  let splitPartner = '';
	  let isSplit = false;

	  for (let i = 0; i < deckLines.length; i++) {
	  	queryName = '';
	  	splitPartner = '';
	  	isSplit = false;
	    const number = deckLines[i].substr(0, deckLines[i].indexOf(' ')); // 4
	    // check if there's a number. treat lines without a number as a divider
	    const hasNumber = !isNaN(parseInt(number));
	    if (hasNumber) {
	      var name = deckLines[i].substr(deckLines[i].indexOf(' ') + 1); // Lighting Bolt
	     	queryName = name.toLowerCase();

	     	// if (name.indexOf(',') > -1) {
	     	// 	var queryName = name.replace(',', '%2C');
	     	// }
		    // handle "aether" and split cards
		    if (name.indexOf('aether') > -1) {
      		var queryName = name.replace('aether', 'ether');
		    }
		    // handle split cards
		    if (name.indexOf('//') > -1) {
		    	isSplit = true;
		    	var queryName = name.substr(0, name.indexOf('//')).trim().toLowerCase();
		    }

		    queryListArr.push(queryName);
	    } else {
	    	var name = deckLines[i];
	    }

	    deck.push({
	        slot: i,
	        name,
	        queryName,
	        quantity: number,
	        isSplit,
	        splitPartner,
	        isDivider: !hasNumber,
	        attributes: {}
	    });
	  }
	  vdl.state.deck = deck;
	  queryListArr = unique(queryListArr);
	  vdl.state.queryList = queryListArr;
	  console.log('finished building query list');
    console.log(vdl.state);


		// call requestCards here
    vdl.updateLocalStorage(vdl.state);
    vdl.requestCards(vdl.state.queryList);
  },
	// make the API call
  requestCards(queryListArr) {
    const queryListString = queryListArr.join('|').toLowerCase();
  	const cardData = [];
	  const emitter = mtg.card.all({ name: queryListString });
	  emitter.on('data', (card) => {
	    cardData.push(card);
	  });
	  emitter.on('end', (finish) => {
	    for (let i = 0; i < cardData.length; i++) {
	      const thisCard = cardData[i];
	      const thisCardName = thisCard.name.toLowerCase();
	      for (let j = 0; j < vdl.state.deck.length; j++) {
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

	    // call the saveCardImages function
    vdl.saveCardImages();
	  });
  },
	// save card images to the server
  saveCardImages() {
    console.log('saveCardImages called');
    console.log(vdl.state);
    let queryStringURLs = 'cardurls=';
    let queryStringNames = 'cardnames=';
    const deck = vdl.state.deck;
    console.log(deck);

    for (let i = 0; i < deck.length; i++) {
      if (deck[i].isDivider != true) {
      	var cardname = deck[i].attributes.name.replace(',', '');
        queryStringURLs = `${queryStringURLs + deck[i].attributes.imageUrl.replace('&type=card', '%26type=card')},`;
        console.log(queryStringURLs);
        queryStringNames = `${queryStringNames + encodeURI(cardname)},`;
        console.log(queryStringNames);
        // queryStringURLs = `${queryStringURLs + deck[i].attributes.imageUrl.replace('&type=card', '%26type=card')},`;
        // console.log(queryStringURLs);
        // queryStringNames = `${queryStringNames + encodeURI(deck[i].attributes.name)},`;
        // console.log(queryStringNames);
      }
    }
    const queryString = `${queryStringURLs.replace(/,\s*$/, '')}&${queryStringNames.replace(/,\s*$/, '')}`;
    console.log(`query string is ${queryString}`);
    getOutput(queryString);
  },
	// update the state, also add the state obj to localStorage
  updateState(cardNames, deck, deckName, queryList) {
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
    console.log('updating state:');
    console.log(vdl.state);
    vdl.updateLocalStorage(vdl.state);
  },
  updateLocalStorage(state) {
    localStorage.setItem('visualDecklistState', JSON.stringify(state));
  },
  clearState() {
    this.state = {
      cardNames: [],
      deck: [],
      deckName: '',
      queryList: '',
    };
    this.updateLocalStorage(this.state);
  },
  renderDeck() {
  	//re-enable the button
  	document.getElementById('button').disabled = false;
    document.getElementById('pleaseWait').classList.remove('please-wait');

		// display the contents of .col-right
    document.querySelector('.col-right').classList.add('active');
    const deck = vdl.state.deck;
    const visualDeckList = document.getElementById('visualDeckList');
	  visualDeckList.innerHTML = '';
	  const deckNameTag = document.createElement('div');
	  deckNameTag.className = 'deck-name';
	  deckNameTag.innerHTML = `<div>${vdl.state.deckName}</div>`;
	  visualDeckList.appendChild(deckNameTag);
	  for (let i = 0; i < deck.length; i++) {
	    // create a row representing a deckslot
	    const row = document.createElement('div');
	    row.className = `card cardslot${i}`;

		  // add card darken filter
	    const cardDarkenTag = document.createElement('div');
	    cardDarkenTag.className = 'card-darken';

	    if (deck[i].isDivider) {
	    	// cardFlexTag & leftTagDiv is duplicated in either side of this if statement
	    	// these elements have to be appeneded to the DOM AFTER the cardBgTag div to
	    	// to make the screenshot work properly

	    	// add flex container
		    var cardFlexTag = document.createElement('div');
		    cardFlexTag.className = 'card-flex';

		    // add container for quantity and name
		    var leftDivTag = document.createElement('div');
		    cardFlexTag.appendChild(leftDivTag);

      row.className = `${row.className} divider`;
	    } else {
	    	// add card bg
		    const cardBgTag = document.createElement('div');
		    cardBgTag.className = 'card-bg';
		    row.appendChild(cardBgTag);

		    // add flex container
		    var cardFlexTag = document.createElement('div');
		    cardFlexTag.className = 'card-flex';

		    // add container for quantity and name
		    var leftDivTag = document.createElement('div');
		    cardFlexTag.appendChild(leftDivTag);

	    	if (deck[i].isSplit) {
	    		// cardBgTag.setAttribute('style', 'background-image:url("' + deck[i].attributes.imageUrl + '"), url("' + deck[i].attributes.imageUrl + '")');
	    		cardBgTag.setAttribute('style', `background-image:url("img/${encodeURIComponent(deck[i].attributes.name)}.jpg"), url("img/${encodeURIComponent(deck[i].attributes.name)}.jpg")`);
      		row.className = `${row.className} split-card`;
	    	}	    	else {
	    	  // cardBgTag.setAttribute('style', 'background-image:url("' + deck[i].attributes.imageUrl + '")');
	    		cardBgTag.setAttribute('style', `background-image:url("img/${encodeURIComponent(deck[i].attributes.name.replace(',', ''))}.jpg")`);
	    	}
	    	// add the quantity
		    const quantityTag = document.createElement('span');
		    quantityTag.className = 'card-quantity';
		    quantityTag.innerHTML = `${deck[i].quantity}&nbsp;`;
		    leftDivTag.appendChild(quantityTag);

		    // add the mana cost
		    const manaCostTag = document.createElement('div');
		    manaCostTag.className = 'mana-cost';
		    const thisManaCost = deck[i].attributes.manaCost;
		    if (typeof thisManaCost !== 'undefined') {
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

		  // add the name
	    const cardNameTag = document.createElement('span');
	    cardNameTag.className = 'card-name';
	    console.log(deck[i].name);
	    console.log(deck[i].name.length);
	    let nameHTML = deck[i].name;
	    if (deck[i].name.length > 17) {
	    	nameHTML = `<small>${deck[i].name}</small>`;
	    } 
	    console.log(`nameHTML is ${nameHTML}`);
	    // cardNameTag.innerHTML = deck[i].name;
	    cardNameTag.innerHTML = nameHTML;
	    leftDivTag.appendChild(cardNameTag);
	    visualDeckList.appendChild(row);
	  }

	  const builtWithTag = document.createElement('div');
	  builtWithTag.className = 'built-with';
	  builtWithTag.innerHTML = 'VisualDecklist.com';
	  visualDeckList.appendChild(builtWithTag);
	  document.getElementById('pleaseWait').className = 'hidden please-wait';


	  ga('send', 'event', 'DeckListBuilt');
	  return false;
  },
  init() {
    document.getElementById('button').addEventListener('click', () => {
    	this.disabled = true;
			// activate please wait text
      document.getElementById('pleaseWait').className = 'please-wait';

			// get inputs
		  const deckName = document.getElementById('deckName').value;
		  let deckLines = document.getElementById('decklist').value.split('\n');
		  // strip empty elements from array. works because empty strings are falsey
		  deckLines = deckLines.filter(Boolean);

		  // clear the state from the previous decklist, if there was one
		  vdl.clearState();

			// cardNames, deck, deckName, queryList
      vdl.updateState('', vdl.state.deck, deckName, vdl.state.queryList);

      vdl.parseDecklist(deckLines);
		 }, false);
  },
};

vdl.init();
