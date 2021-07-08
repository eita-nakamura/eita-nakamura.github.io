
var seed = Math.floor( Math.random() * 10000 );

document.getElementById("DisplaySeed").innerHTML=String(seed);

var primeList=[1,7,11,13,17,19,23,29];

var orderInit=seed%30;
var orderPeriod=(Math.floor(seed/30))%8

let order=[]

var str='';
for(let i=0;i<30;i++){
	order.push( (primeList[orderPeriod]*i+orderInit)%30+1 );
	str+=' '+String((primeList[orderPeriod]*i+orderInit)%30+1);
}//endfor i


// var n1A = Math.floor( 100 + Math.random() * 400 );
// var n1B = Math.floor( 100 + Math.random() * 400 );
// var n2A = Math.floor( 100 + Math.random() * 400 );
// var n2B = Math.floor( 100 + Math.random() * 400 );
// 
// var str=' 1A '+String(n1A)+' 1B '+String(n1B)+' 2A '+String(n2A)+' 2B '+String(n2B);

// document.getElementById("Audio1A").src='https://creevo-music.com/api/static/project_'+String(n1A)+'_instr.mp3';
// document.getElementById("Audio1B").src='https://creevo-music.com/api/static/project_'+String(n1B)+'_instr.mp3';
// document.getElementById("Audio2A").src='https://creevo-music.com/api/static/project_'+String(n2A)+'_instr.mp3';
// document.getElementById("Audio2B").src='https://creevo-music.com/api/static/project_'+String(n2B)+'_instr.mp3';

document.getElementById("Test").innerHTML=str;




