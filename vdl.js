const mtg = require("mtgsdk");

var buildDeck = function(deck){
  var visualDeckList = document.getElementById('visualDeckList');
  visualDeckList.innerHTML = '';
  var deckNameTag = document.createElement('div');
  deckNameTag.className = 'deck-name';
  deckNameTag.innerHTML = '<div>' + deckName + '</div>';
  visualDeckList.appendChild(deckNameTag)
  for (var i = 0; i < deck.length; i++) {
    //create a row representing a deckslot
    var row = document.createElement('div');
    row.className = 'card cardslot' + i;
    row.setAttribute('style', 'background-image:url("' + deck[i].attributes.imageUrl + '")');

    //add container for quantity and name
    var leftDivTag = document.createElement('div');
    row.appendChild(leftDivTag);

    //add the number
    var cardNumberTag = document.createElement('span');
    cardNumberTag.className = 'card-quantity';
    cardNumberTag.innerHTML = deck[i].number + '&nbsp;';
    leftDivTag.appendChild(cardNumberTag);

    //add the name
    var cardNameTag = document.createElement('span');
    cardNameTag.className = 'card-name';
    cardNameTag.textContent = deck[i].attributes.name;
    leftDivTag.appendChild(cardNameTag);

    //add the mana cost
    var manaCostTag = document.createElement('div');
    manaCostTag.className = 'mana-cost';

    var thisManaCost = deck[i].attributes.manaCost;
    if (typeof thisManaCost != 'undefined') {
      thisManaCostHTML = thisManaCost.toLowerCase();
      thisManaCostHTML = thisManaCostHTML.replace(/{/g, '<span class="mana small s');
      thisManaCostHTML = thisManaCostHTML.replace(/}/g, '"></span>');
      manaCostTag.innerHTML = thisManaCostHTML;
    }
    row.appendChild(manaCostTag);
    visualDeckList.appendChild(row);
  } 
  return false;
}

getCardsByNames = function(cardnames){
  var cardData = [];
  var emitter = mtg.card.all({ name : cardnames });
  emitter.on('data', card => {
    cardData.push(card);
  });
  emitter.on('end', finish => {

    for (var i = 0; i < cardData.length; i++) {
      var thisCard = cardData[i];
      var thisCardName = thisCard.name.toLowerCase();
      var thisCardImg = thisCard.imageUrl;
      var thisCardManaCost = thisCard.manaCost;
      for (var j = 0; j < deck.length; j++) {
        if (thisCardName === deck[j].name.toLowerCase()){
          deck[j].attributes = thisCard;
        }
      }
    }
    buildDeck(deck);
    return false;
  });
}

//cache those element references
var btn = document.getElementById('button');  
var deck = [];
var deckName = '';
btn.addEventListener('click', function( event ) {
  deck = [];
  deckName = document.getElementById('deckName').value;
  var cardnames = [];
  var listItems = document.getElementById('decklist').value.split('\n');
  //strip empty elements from array. works because empty strings are falsey
  listItems = listItems.filter(Boolean);
  console.log('listItems');
  console.log(listItems);

  for (var i = 0; i < listItems.length; i++){
    var number = listItems[i].substr(0,listItems[i].indexOf(' ')); //4
    var name = listItems[i].substr(listItems[i].indexOf(' ')+1); //Lighting Bolt
    cardnames.push(name);
    deck.push({
        'cardslot' : i,
        'name' : name,
        'number' : number,
        'attributes' : {}
    });
  };

  cardnames = cardnames.join('|');
  var cardData = getCardsByNames(cardnames);
  
}, false);



