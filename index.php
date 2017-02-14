<html>
	<head>
		<meta charset="UTF-8" />
	  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
	  <title>Visual Decklist Generator for Magic: The Gathering</title>
		<link rel="stylesheet" href="css/styles.css">
	</head>
	<body>	
	  <div class="top">
			<header>
				<div class="container">
					<h1>MTG Visual Decklist Generator</h1>
				</div>
			</header>
			<div class="container">
				<div class="row">
					<div class="col col-left">
					  <div id="search">
					  	<label for="#deckName">Deck Name</label>
					  	<input type="text" id="deckName" value="" placeholder="i.e. Modern Infect">
					  	<label for="decklist">Decklist</label>
					  	<textarea id="decklist" name="" id="" cols="30" rows="10" placeholder="4 Blighted Agent
3 Blossoming Defense
2 Breeding Pool
SIDEBOARD
3 Grafdigger's Cage
etc...">4 Blighted Agent
3 Blossoming Defense
2 Breeding Pool
SIDEBOARD
3 Grafdigger's Cage
etc...
</textarea>
							<button id="button">Generate Deck</button>
							<ul>
								<li>Enter cards 1-per-line, in the format "quantity name" (i.e. "4 Lightning Bolt")</li>
								<li>Enter split cards with "//" separating the car names ("Fire // Ice").</li>
								<li>Enter section dividers (sideboard, maybeboard, or any other divider you like) as their own line with no quantity</li>
							</ul>
					  </div>
					</div>
					<div class="col col-right">
						<p class="hidden please-wait" id="pleaseWait">Fetching card data...</p>
						<div id="visualDeckList" class="visual-deck-list">
						</div>
						<button id="screenShot">Generate Saveable PNG</button>
						<div id="imageContainer" style="width:350px;max-width:100%"></div>
					</div>
				</div>
			</div>
		</div>
		<div id="canvas-container" class="canvas-container">
			<span class="close">close</span>
			<p>Left click to save image</p>
		</div>
		<footer>
			<div class="container">
				<p>Spot a bug? Have comments, or suggestions? <a href="https://twitter.com/cob_is_online" target="_blank">Tweet at me</a> or email me at jacobpatrickharris@gmail.com</p>
				<p>Made possible thanks to the <a href="https://magicthegathering.io/" target="_blank">MTG API</a> and <a href="https://github.com/micku/mana-cost" target="_blank">micku's SVG mana cost library</a>. You can <a href="https://github.com/ahoy1/visual-decklist/" target="_blank">view this project on github</a>.</p>
				<p class="disclaimer">This website is not produced by, endorsed by, supported by, or affiliated with Wizards of the Coast. The copyright for Magic: the Gathering and all associated card names and card images are held by Wizards of the Coast.</p>
			</div>
		</footer>

		<script src="js/html2canvas.js"></script>
		<script src="js/bundle.js"></script>
		<script>
		function downloadCanvas(link, canvasId, filename) {
	    link.href = document.getElementById(canvasId).toDataURL();
	    link.download = filename;
		}

		window.onload = function(){
			var scaleBy = 5;
	    var w = 1000;
	    var h = 1000;
	    var div = document.querySelector('#visualDeckList');
	    var canvas = document.createElement('canvas');
	    canvas.width = w * scaleBy;
	    canvas.height = h * scaleBy;
	    canvas.style.width = w + 'px';
	    canvas.style.height = h + 'px';
	    var context = canvas.getContext('2d');
	    context.scale(scaleBy, scaleBy);

    	document.querySelector('#screenShot').addEventListener('click', function(){
    		console.log('screenshot button clicked');
    		html2canvas(div, {
        canvas:canvas,
        onrendered: function (canvas) {
            theCanvas = canvas;
            document.querySelector('#canvas-container').appendChild(canvas);
            document.body.classList.add('canvas-active');

            // Canvas2Image.saveAsPNG(canvas);
            // $(body).append(canvas);

        }
    });
				// html2canvas(document.querySelector('#visualDeckList'), {
    //         //"canvas": canvas,
    //         "logging": true, //Enable log (use Web Console for get Errors and Warnings)
    //         //"proxy":"php/html2canvasproxy.php",
    //         "onrendered": function(canvas) {
    //             var img = new Image();
    //             img.onload = function() {
    //                 img.onload = null;
    //                 document.body.appendChild(canvas);
    //                 console.log('img.onload');
    //             };
    //             img.onerror = function() {
    //             		console.log('img.onerror');
    //                 img.onerror = null;
    //                 if(window.console.log) {
    //                     window.console.log("Not loaded image from canvas.toDataURL");
    //                 } else {
    //                     alert("Not loaded image from canvas.toDataURL");
    //                 }
    //             };
    //             img.src = canvas.toDataURL("image/png");
    //         }
    //     });
    	});

    	document.querySelector('.close').addEventListener('click', function(){
				document.body.classList.remove('canvas-active');
				let theCanvas = document.querySelector("#canvas-container canvas");
				theCanvas.parentNode.removeChild(theCanvas);
    	});
    };
    
    //google analytics
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

      ga('create', 'UA-85791706-1', 'auto');
      ga('send', 'pageview');
    </script>
	</body>
</html>

