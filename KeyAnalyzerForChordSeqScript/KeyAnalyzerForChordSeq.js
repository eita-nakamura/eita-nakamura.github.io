// console.log(1>3);
//console.log(i+' '+fileContent[i].split(/\s+/));

var ParamLoaded = 0
var nRefChord;
var chordRefList=[];
var uniProb=[];
var biProb=[];
var parsedInputText;
var lastInputTextValue = '';
var chordList=[];
var keyTransitionLogP = Math.log(1./100000.);
var tonicSeq=[];
var chordSymbPos=[]
var colorList = ['#000000','#0072B2','#941651','#009E73','#D55E00','#56B4E9','#CC79A7','#E69F00','#555555','#7F1100','#79bb42','#1e1e78','#d91e4f'];

window.onload = function(){
	SetBoxSize();
	ReadParam(param_str);
//	console.log(db_str)
//	console.log(DB);
}//end onload

function SetBoxSize(){
	document.getElementById('display').style.width=(window.innerWidth-220)+'px';
	document.getElementById('displayRel').style.width=(window.innerWidth-220)+'px';
	document.getElementById('scrollBox').style.width=(window.innerWidth-220)+'px';
	document.getElementById('scrollBox2').style.width=(window.innerWidth-220)+'px';
	document.getElementById('scrollBox3').style.width=(window.innerWidth-220)+'px';
	document.getElementById('keyDisplayZone').style.width=(window.innerWidth-220)+'px';
	document.getElementById('inputTextZone').style.width=(window.innerWidth-240)+'px';
}//end SetBoxSize

function ReadParam(in_str){
//	console.log('ReadParam called');
	chordRefList = [];
	uniProb = [];
	biProb = [];
	let fileContent=in_str.split('\n');
//	console.log(fileContent[0]);
	let firstLineList = fileContent[0].split('\t');
	nRefChord = parseInt(firstLineList[0])
//	console.log(nRefChord);
	for(let i=0;i<nRefChord;i++){
		chordRefList.push(firstLineList[1+i])
	}//endfor i
//	console.log(chordRefList.length,chordRefList[0],chordRefList[nRefChord-1]);
	for(let i=0;i<=nRefChord;i++){
		uniProb.push(parseFloat(fileContent[1+i]));
	}//endfor i
	uniProb[nRefChord] = 1E-3;
//	console.log(uniProb.length,uniProb[0],uniProb[nRefChord]);
	let sum=0;
	for(let i=0;i<=nRefChord;i++){
		sum+=uniProb[i]
	}//endfor i
	for(let i=0;i<=nRefChord;i++){
		uniProb[i]=uniProb[i]/sum;
		uniProb[i]= Math.log(uniProb[i]);
	}//endfor i
	for(let ip=0;ip<=nRefChord;ip++){
		let tmpProb = []
		for(let i=0;i<=nRefChord;i++){
			tmpProb.push(parseFloat(fileContent[1+(nRefChord+1)*(ip+1)+i]));
		}//endfor i
		tmpProb[nRefChord] = 1E-3;
		let sum2=0;
		for(let i=0;i<=nRefChord;i++){
			sum2+=tmpProb[i]
		}//endfor i
		for(let i=0;i<=nRefChord;i++){
			tmpProb[i]=tmpProb[i]/sum2;
			tmpProb[i]= Math.log(tmpProb[i]);
		}//endfor i
		biProb.push(tmpProb)
	}//endfor ip
//	console.log(biProb.length,biProb[nRefChord][nRefChord]);

	ParamLoaded = 1
//	console.log('ParamLoaded',ParamLoaded);

//	console.log('Am',chordRefList.indexOf('Am'))
//	console.log('C',chordRefList.indexOf('C'))

}//end ReadParam


function ParseInputText(){
//	console.log('ParseInputText called');
	let allText=document.getElementById('inputTextZone').value;
	allText=allText.replaceAll('♭','b');
	allText=allText.replaceAll('♯','#');
//	console.log(allText);
	if(lastInputTextValue==allText){
		return;
	}else{
		lastInputTextValue=allText;
	}//endif
	allText=allText.split('\n');
	parsedInputText = []
	symPosList = []
	chordSymbPos = []
	let spacePattern = /[\s\t]+/;
	for(let i=0;i<allText.length;i++){
		parsedInputText.push( allText[i].split(/([\s\t]+)/g) );
		for(let j=0;j<parsedInputText[i].length;j++){
			if(parsedInputText[i][j]==''){continue;}
			if(spacePattern.test(parsedInputText[i][j])){continue;}
			symPosList.push([i,j]);
			chordSymbPos.push(String(i)+'-'+String(j))
		}//endfor j
	}//endfor i

	let unknownChordPos = -1
	chordList=[];
	for(let l=0;l<symPosList.length;l++){
		chordList.push( new ChordSymbol(parsedInputText[symPosList[l][0]][symPosList[l][1]]) )
		if(chordList[l].unknown>0){
			unknownChordPos=l;
			break;
		}//endif
	}//endfor l
//console.log(chordList);

	if(unknownChordPos>-1){
		let str='<font color="#d91e4f">Unknown chord:<br><br>';
		str+='　<strong>'+parsedInputText[symPosList[unknownChordPos][0]][symPosList[unknownChordPos][1]]+'</strong><br><br>';
		str+='Please fix.</font>';
		document.getElementById('infoDisplay').innerHTML=str;
		document.getElementById('keyDisplayZone').innerHTML='';
		return -1;
	}else{
		return 0;
	}//endif
//	console.log(symPosList);
//	console.log(parsedInputText[0])
}//end ParseInputText


function EstimateKey(){

	let len=chordList.length;
	let LP=[0,0,0,0,0,0,0,0,0,0,0,0];
	let amaxHist=[];
	let prePos=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],curPos=[0,0,0,0,0,0,0,0,0,0,0,0];
	tonicSeq = [];

	for(let l=0;l<len;l++){
		amaxHist.push([0,0,0,0,0,0,0,0,0,0,0,0]);

		for(let q=0;q<12;q++){
			chord=Object.create(chordList[l]);
			chord.Transpose(-q);
			tmp=chord.fullname;
			tmp=tmp.split("/")[0];
			curPos[q]=chordRefList.indexOf(tmp);
			if(curPos[q]<0){curPos[q]=nRefChord;}
//console.log(l,q,tmp,curPos[q])
		}//endfor q

		if(l==0){
			for(let q=0;q<12;q++){
				LP[q]+=uniProb[curPos[q]];
				prePos[q]=curPos[q];
			}//endfor q
		}else{//l>0
			preLP=LP.concat();
			for(let q=0;q<12;q++){
				LP[q]=-1E100;
				for(let qp=0;qp<12;qp++){
					logP=preLP[qp]+((q==qp)? 0:keyTransitionLogP);
					if(logP>LP[q]){
						LP[q]=logP;
						amaxHist[l][q]=qp;
					}//endif
				}//endfor qp
				LP[q]+=biProb[prePos[q]][curPos[q]];
				prePos[q]=curPos[q];
			}//endfor q
		}//endif

		tonicSeq.push(-1);
	}//endfor l

	tonicSeq[len-1]=0;
	for(let q=0;q<12;q++){
		if(LP[q]>LP[tonicSeq[len-1]]){tonicSeq[len-1]=q;}
	}//endfor q
	for(let l=len-2;l>=0;l-=1){
		tonicSeq[l]=amaxHist[l+1][tonicSeq[l+1]];
	}//endfor l

//console.log(tonicSeq[0]);
}//end EstimateKey


function SetDisplay(){
	let countTonic = [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0]]
	let tonicChangePos = [];
	let tonicChangeTonic = [];
	for(let l=0;l<tonicSeq.length;l++){
		countTonic[tonicSeq[l]][1]+=1;
		if(l==0){
			tonicChangePos.push(String(symPosList[l][0])+'-'+String(symPosList[l][1]));
			tonicChangeTonic.push(tonicSeq[l]);
		}else if(tonicSeq[l]!=tonicSeq[l-1]){
			tonicChangePos.push(String(symPosList[l][0])+'-'+String(symPosList[l][1]));
			tonicChangeTonic.push(tonicSeq[l]);
		}//endif
	}//endfor l
	countTonic.sort(function(a,b){return(b[1] - a[1]);});
//	console.log(countTonic);

	let tonicToRank = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
	for(let q=0;q<12;q++){
		tonicToRank[countTonic[q][0]]=q
	}//endfor q

	document.getElementById('infoDisplay').innerHTML='<font color="#555555">Used key(s)</font>';

	let str=''
	for(let q=0;q<12;q++){
		if(countTonic[q][1]==0){continue;}
		str+='<font color="'+colorList[q]+'">'+PitchClassToSitchClass(countTonic[q][0])+' major/'+PitchClassToSitchClass((countTonic[q][0]+9)%12)+' minor ('+String(TonicToKeyDegree(countTonic[q][0]))+')'+'</font><br>';
	}//endfor q
	document.getElementById('keyDisplayZone').innerHTML=str;

	str=''
	for(let i=0;i<parsedInputText.length;i++){
		for(let j=0;j<parsedInputText[i].length;j++){
			let pos = tonicChangePos.indexOf(String(i)+'-'+String(j))
			if(pos!=-1){
				if(pos==0){
					str+='<font color="'+colorList[tonicToRank[tonicChangeTonic[pos]]]+'">';
				}else{
					str+='</font><font color="'+colorList[tonicToRank[tonicChangeTonic[pos]]]+'">';
				}//endif
			}//endif
			str+=parsedInputText[i][j]
		}//endfor j
		str+='<br>'
	}//endfor i
	str+='</font>'
	document.getElementById('display').innerHTML=str;

	str=''
	for(let i=0;i<parsedInputText.length;i++){
		for(let j=0;j<parsedInputText[i].length;j++){
			let pos = tonicChangePos.indexOf(String(i)+'-'+String(j))
			let posChord = chordSymbPos.indexOf(String(i)+'-'+String(j))
			if(pos!=-1){
				if(pos==0){
					str+='<font color="'+colorList[tonicToRank[tonicChangeTonic[pos]]]+'">';
				}else{
					str+='</font><font color="'+colorList[tonicToRank[tonicChangeTonic[pos]]]+'">';
				}//endif
			}//endif
			if(posChord!=-1){
				chord=Object.create(chordList[posChord]);
				chord.Transpose(-tonicSeq[posChord]);
				str+=chord.fullname;
			}else{
				str+=parsedInputText[i][j];
			}//endif
		}//endfor j
		str+='<br>'
	}//endfor i
	str+='</font>'
	document.getElementById('displayRel').innerHTML=str;

	let clientHeight = document.getElementById('keyDisplayZone').clientHeight;
	document.getElementById('scrollBox3').style.height = clientHeight + 'px';

}//end SetDisplay


document.getElementById('inputTextZone').addEventListener('keyup', function(event){
	let statusOut = ParseInputText();
	if(statusOut==0){
		EstimateKey();
		SetDisplay();
	}//endif
// 	let str=songNameInput+'<br>'+artistNameInput+'<br>';
// 	document.getElementById('display').innerHTML=str;
});


//	console.log();





