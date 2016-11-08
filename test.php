<!-- <img src="http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=214383&type=card" alt=""> -->
<img src="img/blighted-agent.jpeg" alt="">
<script src="js/html2canvas.js"></script>
<script>
window.onload = function(){
	html2canvas(document.body, {
            "logging": true, //Enable log (use Web Console for get Errors and Warnings)
            "proxy":"http://localhost:8000/php/html2canvasproxy.php",
            "onrendered": function(canvas) {
                var img = new Image();
                img.onload = function() {
                    img.onload = null;
                    document.body.appendChild(canvas);
                    console.log(img);
                };
                img.onerror = function() {
                		console.log('img.onerror');
                    img.onerror = null;
                    if(window.console.log) {
                        window.console.log("Not loaded image from canvas.toDataURL");
                    } else {
                        alert("Not loaded image from canvas.toDataURL");
                    }
                };
                img.src = canvas.toDataURL("image/png");
            }
        });
}
</script>