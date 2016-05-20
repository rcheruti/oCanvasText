
$(document).on('DOMContentLoaded',function(){
  
  var canvas = oCanvas.create({ canvas:'#canvas1' });
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight / 2;
  
  $(window).on('resize',function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight / 2;
  });
  
  setTimeout(function(){
    var text = canvas.display.text({
      text: 'Texto que irá aparecer',
      x: 100,
      y: 40,
      size: 36,
      family: 'fredericka-the-great',
      fill:'#f00'
    });
    canvas.addChild(text);
  },500);
 
  
});
