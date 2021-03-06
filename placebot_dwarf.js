// ==UserScript==
// @name         DwarfPlacer
// @namespace    dwarfplacer
// @version      0.4.0
// @description  /r/place bot for DF
// @author       NiftyManiac
// @match        https://www.reddit.com/place*
// @grant        none
// @updateURL https://raw.githubusercontent.com/NiftyManiac/placebot/master/placebot_dwarf.js
// ==/UserScript==

//based on something I found on t_d

(function() {
    'use strict';

var colorsABGR = [];
var colorsIndex = {};

var dwarf = {
  x: 0,
  y: 0,
  width: 44,
  height: 16,
  colors: [-1,3,14,3,14,14,14,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,14,3,14,3,-1,3,14,14,14,3,3,12,12,12,12,12,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,14,14,14,-1,14,14,3,6,7,12,11,11,11,11,11,12,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,14,-1,14,3,3,7,6,11,11,12,12,12,12,3,3,3,3,3,3,0,0,0,1,1,1,1,1,1,1,0,0,0,3,3,3,3,3,3,3,3,3,3,3,14,14,-1,14,3,12,12,11,6,7,3,3,3,3,3,3,3,3,3,3,0,0,1,1,1,1,1,1,1,1,1,0,0,3,3,3,3,3,3,3,3,3,3,3,3,14,-1,14,3,12,11,11,7,6,7,3,3,3,3,3,3,3,3,3,0,0,1,1,2,1,1,1,2,1,1,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,-1,14,14,12,11,12,3,7,6,7,3,3,3,3,3,1,1,1,0,0,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,3,3,3,3,3,3,14,-1,14,14,12,11,12,3,3,7,6,7,3,3,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,3,3,3,3,3,14,-1,14,14,12,11,12,3,3,3,1,1,2,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,3,3,3,14,-1,14,3,12,11,12,3,3,3,1,1,1,2,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,3,14,-1,14,14,3,12,3,3,3,3,1,1,1,1,7,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,14,-1,14,14,3,14,3,14,14,3,3,1,1,1,6,7,3,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,3,1,1,14,14,1,1,14,14,1,1,14,14,-1,3,14,14,14,14,14,14,14,14,3,14,14,7,6,3,3,1,1,1,0,0,0,0,0,0,0,0,0,0,14,14,1,1,14,14,14,14,14,3,14,14,14,15,-1,14,14,14,15,3,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,0,0,0,0,0,0,0,0,14,14,14,14,14,3,3,3,15,3,3,15,15,15,3,-1,15,14,14,15,15,15,14,3,14,15,14,14,14,3,14,14,14,14,14,14,0,0,0,0,0,0,0,0,3,15,15,15,15,15,15,15,3,3,14,3,3,15,15,-1,14,15,15,3,3,3,15,15,14,15,15,15,15,15,3,3,3,3,3,3,14,0,0,0,0,0,3,3,3,15,15,15,3,3,3,3,3,3,14,14,14,3,3]
};

//in order of priority
//x and y are bottom left corner of pattern
var groups = [
    {x: 107, y:641, dx:0, dy:0, n:1, box:dwarf},
    ];

//ignore these points
var exceptions = [];

var placed = 0;

// hooks
var client;
var canvasse;
var jQuery;

var test = 0;
var randomize = 1;
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
        colorsIndex[colorsABGR[i]] = i;
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
            var group = groups[groupi];
            var offset = 0;
            if(randomize==1){
                offset = Math.floor(Math.random()*group.box.colors.length);
            }
            next_pixel:
            for(var i=0; i<group.box.colors.length; i++){
                var index = (i + offset)%group.box.colors.length;

                if(group.box.colors[index] === -1){
                    continue next_pixel;
                }

                var targetPoint = getPoint(group.box,index);

                targetPoint.x = targetPoint.x + group.x + groupj*group.dx;
                targetPoint.y = targetPoint.y + group.y + groupj*group.dy;

                //if(targetPoint.x < 119){
                //    continue next_pixel;
                //}
                var pixelColor = getPixel(targetPoint.x, targetPoint.y);
                if(pixelColor !== colorsABGR[group.box.colors[index]]){
                    // don't replace red/blue tiles with yellow
                    //if(group.box.colors[index] == 8 && (pixelColor==colorsABGR[5] || pixelColor==colorsABGR[12] || pixelColor==colorsABGR[13] || pixelColor==colorsABGR[11])){ 
                    //    continue next_pixel;
                    //}
                    for(var excepi=0; excepi<exceptions.length; excepi++){
                        if(targetPoint.x==exceptions[excepi].x && targetPoint.y==exceptions[excepi].y){
                          continue next_pixel;
                        }
                    }
                    

                    client.setColor(group.box.colors[index]);
                    client.drawTile(targetPoint.x, targetPoint.y);
                    console.log("Drawing tile", targetPoint.x, targetPoint.y, "Color", group.box.colors[index], "OldColor",colorsIndex[pixelColor]);
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
