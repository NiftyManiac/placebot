// ==UserScript==
// @name         Placer
// @namespace    placer
// @version      0.2
// @description  /r/place bot
// @author       NiftyManiac
// @match        https://www.reddit.com/place*
// @grant        none
// @updateURL https://raw.githubusercontent.com/NiftyManiac/placebot/master/placebot.js
// ==/UserScript==

//based on something I found on t_d

(function() {
    'use strict';

    var colors = [
  3,2,3,2,
  2,8,2,2,
  2,2,8,2,
  2,8,2,2,
  3,2,3,2
];
var colorsABGR = [];

var box_r = {
  x: 0,
  y: 0,
  width: 4,
  height: 5,
  colors: [
  3,2,3,2,
  2,8,2,2,
  2,2,8,2,
  2,8,2,2,
  3,2,3,2
]
};
var box_u = {
  x: 0,
  y: 0,
  width: 5,
  height: 4,
  colors: [
  2,2,2,2,2,
  3,2,8,2,3,
  2,8,2,8,2,
  3,2,2,2,3
]
};

//in order of priority
//x and y are bottom left corner of pattern
var groups = [
    {x: 442, y:170, dx:0, dy:4, n:15, box:box_u},//left border of plagueis
    {x: 439, y:150, dx:0, dy:4, n:3, box:box_u},//left of "D"
    {x: 508, y:148, dx:-4, dy:0, n:12, box:box_r},//top border of plagueis
    {x: 519, y:138, dx:4, dy:0, n:12, box:box_r}  //top of /r/factorio
    ];

//ignore these points
var exceptions = [
    {x:443, y:143},
    {x:511, y:144},
    {x:511, y:148}
];

var placed = 0;

// hooks
var client;
var canvasse;
var jQuery;

var test = 0;
var refreshtime = 0;

// if there's an issue loading, reload after 5 sec
if (typeof r == 'undefined'){
    setTimeout(function(){location.reload();}, 5000);
}else{
    
    r.placeModule("Fact", function(e){
      client = e("client");
      canvasse = e("canvasse");
      jQuery = e("jQuery");

      for(var i=0; i<client.palette.length; i++){
        colorsABGR[i] = client.getPaletteColorABGR(i);
      }

      // Start
      console.log("Starting...");
      refreshtime = new Date().getTime();
      window.addEventListener('load', function() {
        attempt();
    }, false);

    });
}

function attempt(){
  var toWait = client.getCooldownTimeRemaining();
  if(toWait === 0 || test==1){
    if (refreshIfNeeded()){
        return;
    }
    outer:
    for(var groupi=0; groupi<groups.length; groupi++){
        for(var groupj=0; groupj<groups[groupi].n; groupj++){
            next_pixel:
            for(var i=0; i<colors.length; i++){
                if(colors[i] === -1){
                    continue next_pixel;
                }
                var group = groups[groupi];
                var targetPoint = getPoint(group.box,i);

                targetPoint.x = targetPoint.x + group.x + groupj*group.dx;
                targetPoint.y = targetPoint.y + group.y + groupj*group.dy;
                var pixelColor = getPixel(targetPoint.x, targetPoint.y);
                if(pixelColor !== colorsABGR[group.box.colors[i]]){
                    // don't replace red/blue tiles with yellow
                    if(colors[i] == 8 && (pixelColor==colorsABGR[5] || pixelColor==colorsABGR[12] || pixelColor==colorsABGR[13] || pixelColor==colorsABGR[11])){ 
                        continue next_pixel;
                    }
                    for(var excepi=0; excepi<exceptions.length; excepi++){
                        if(targetPoint.x==exceptions[excepi].x && targetPoint.y==exceptions[excepi].y){
                          continue next_pixel;
                        }
                    }

                    client.setColor(group.box.colors[i]);
                    client.drawTile(targetPoint.x, targetPoint.y);
                    console.log("Drawing tile", targetPoint.x, targetPoint.y, "Color", group.box.colors[i], "OldColor",pixelColor, "NewColor",colorsABGR[colors[i]]);
                    break outer;
                }
            }
        }
    }
    console.log("Done for now.");
  }
  setTimeout(attempt, Math.max(toWait + Math.round(Math.random() * 1500), 2000));
}


function refreshIfNeeded(){
    if(new Date().getTime() > refreshtime + 10000){ //60 s
        location.reload();
        return true;
    }
    return false;
}

function getPoint(box, i){
  var x = i % box.width;
  return {
    x: box.x + x,
    y: box.y + (i - x) / box.width - box.height + 1
  };
}

function getPixel(x, y){
  return canvasse.writeBuffer[canvasse.getIndexFromCoords(x, y)];
}
})();
