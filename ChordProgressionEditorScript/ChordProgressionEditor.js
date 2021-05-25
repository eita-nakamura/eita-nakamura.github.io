let orgKeyFifth = 0;
let targetKeyFifth = 0;
let inputChordProgression=''
let wordList=[]
let wordListTag=[]//0:chord symbol, 1:others
let transposedWordList=[]
let outputChordProgression=''
let playedNotes=[]//playedChords=[['C4,0,0.5],['E4,0,0.5],['G4,0.5,1]] etc. 1=QN
let BPM=120.;


class MIDIStrEvt{
	constructor(){
		this.time = 0;//msec単位
		this.pitch = 0;//
		this.channel = 0;
		this.onoff = 0;//0=on, 1=off
		this.vel = 80;//
	}
}//endclass MIDIStrEvt

function CompareMIDIStrEvt(a,b){
	if(a.time<b.time){return -1;
	}else if(a.time>b.time){return 1;
	}else if(a.onoff>b.onoff){return -1;
	}else if(a.onoff<b.onoff){return 1;
	}else{return 0;
	}//endif
}//end CompareMIDIStrEvt
//midiStrEvts.sort(CompareMIDIStrEvt)


$("#keyInput").keyup(function(e){
	if(e.keyCode==16 || (e.keyCode>=37 && e.keyCode<=40)){return;}
	let key=$("#keyInput").val();
	if(key[key.length-1]=='m'){
		key=key.slice(0,-1)
		orgKeyFifth=SitchClassToPytchClass(key)-3;
		document.getElementById("keyDegreeInput").value=orgKeyFifth;
	}else{
		orgKeyFifth=SitchClassToPytchClass(key);
		document.getElementById("keyDegreeInput").value=orgKeyFifth;
	}//endif
	inputChordProgression=$("#chordInput").val()
	ParseInputChordProgression();
	TransposeChordProgression();
	SetOutput();
	document.getElementById("chordOutput").value=outputChordProgression;
});

$("#keyDegreeInput").keyup(function(e){
	if(e.keyCode==16 || (e.keyCode>=37 && e.keyCode<=40)){return;}
	let degree=parseInt($("#keyDegreeInput").val());
	orgKeyFifth=degree;
	document.getElementById("keyInput").value=PytchClassToSitchClass(orgKeyFifth)+'/'+PytchClassToSitchClass(orgKeyFifth+3)+'m';
	inputChordProgression=$("#chordInput").val()
	ParseInputChordProgression();
	TransposeChordProgression();
	SetOutput();
	document.getElementById("chordOutput").value=outputChordProgression;
});

$("#chordInput").keyup(function(e){
	if(e.keyCode==16 || (e.keyCode>=37 && e.keyCode<=40)){return;}
	inputChordProgression=$("#chordInput").val()
	ParseInputChordProgression();
	TransposeChordProgression();
	SetOutput();
	document.getElementById("chordOutput").value=outputChordProgression;
});

function ParseInputChordProgression(){
	wordList=[];
	wordListTag=[];
	let curStatus=-1;//-1:init, 0:chordsymb, 1:others
	let word='';
	for(let i=0;i<inputChordProgression.length;i++){
		if(inputChordProgression[i]==' ' || inputChordProgression[i]=='\t' || inputChordProgression[i]=='|' || inputChordProgression[i]=='-'){
			if(curStatus==1){
			}else if(curStatus==0){
				wordList.push(word);
				wordListTag.push(curStatus);
				word='';
			}//endif
			curStatus=1;
		}else{
			if(curStatus==0){
			}else if(curStatus==1){
				wordList.push(word);
				wordListTag.push(curStatus);
				word='';
			}//endif
			curStatus=0;
		}//endif
		word+=inputChordProgression[i];
	}//endfor i
	wordList.push(word);
	wordListTag.push(curStatus);
//	console.log(wordList,wordListTag)
//	document.getElementById("chordOutput").value=chord.fullname;
}//end ParseInputChordProgression

function TransposeChordProgression(){
	document.getElementById("commentZone").innerHTML=''
	transposedWordList=wordList;
	for(let i=0;i<wordList.length;i++){
		if(wordListTag[i]>0){continue;}
		let chord=new ChordSymbol(wordList[i]);
		if(chord.CheckKnownChordType()>0){
			document.getElementById("commentZone").innerHTML="[Unknown] "+wordList[i];
			return;
		}//endif
		chord.TransposeFifth(targetKeyFifth-orgKeyFifth);
		transposedWordList[i]=chord.fullname;
	}//endfor i
}//end TransposeChordProgression

function SetOutput(){
	outputChordProgression='';
	for(let i=0;i<transposedWordList.length;i++){
		outputChordProgression+=transposedWordList[i];
	}//endfor i

	let orgCP=outputChordProgression;
	let x;
	while(orgCP[0]==' ' || orgCP[0]=='|'){
		orgCP=orgCP.slice(1);
	}//endwhile
	while(orgCP[orgCP.length-1]==' ' || orgCP[orgCP.length-1]=='|'){
		orgCP=orgCP.slice(0,-1);
	}//endwhile
	for(let i=orgCP.length-1;i>=0;i-=1){
		if(orgCP[i]=='|' || orgCP[i]=='-'){
			orgCP=orgCP.slice(0,i+1)+' '+orgCP.slice(i+1);
			orgCP=orgCP.slice(0,i)+' '+orgCP.slice(i);
		}//endif
	}//endfor i

//console.log('bf ',orgCP)

	let rhythmParsedChords=[];//[[C4,-,-,Am],[]]

	orgCP=orgCP.split(/\s+/);
//console.log('sp ',orgCP)

	let tmp=[];
	for(let i=0;i<orgCP.length;i++){
		if(orgCP[i]=='|' || orgCP[i]==';'){
			rhythmParsedChords.push(tmp);
			tmp=[];
			continue;
		}//endif
		tmp.push(orgCP[i]);
	}//endfor i
	rhythmParsedChords.push(tmp);

	playedNotes=[];
	let curChord='NC';
	let spos,epos;
	for(let m=0;m<rhythmParsedChords.length;m++){
		let nChord=rhythmParsedChords[m].length;
		if( !(nChord==1||nChord==2||nChord==3||nChord==4||nChord==6||nChord==8||nChord==12||nChord==16) ){
			document.getElementById("commentZone").innerHTML="Rhythm error!";
			return;
		}//endif
		for(let k=0;k<nChord;k++){
			if(rhythmParsedChords[m][k]=="-"){
				for(let j=spos;j<epos;j++){
					playedNotes[j][2]+=4./parseFloat(nChord);
				}//endfor j
				continue;
			}//endif
			curChord=rhythmParsedChords[m][k];
			if(curChord=="NC"){continue;}
			let chord=new ChordSymbol(curChord);
			spos=playedNotes.length;
			playedNotes.push([chord.bass+'2',m*4.+(k*4.)/parseFloat(nChord), m*4.+((k+1)*4.)/parseFloat(nChord)]);
			playedNotes.push([chord.bass+'3',m*4.+(k*4.)/parseFloat(nChord), m*4.+((k+1)*4.)/parseFloat(nChord)]);
			for(let l=0;l<chord.pcset.length;l++){
				playedNotes.push([PitchClassToSitchClass(chord.pcset[l])+'4',m*4.+(k*4.)/parseFloat(nChord), m*4.+((k+1)*4.)/parseFloat(nChord)]);
			}//endfor l
			epos=playedNotes.length;
		}//endfor k
	}//endfor m

	SetListenButton();

}//end SetOutput


var synthOption = {
  oscillator: {
    type: "sine"
  },
  envelope: {
    attack: 0.001,
    decay: 0.3,
    sustain: 0.5,
    release: 1
  }
};


function SetListenButton(){

// 	var synth = new Tone.PolySynth(10).toMaster();
// 	document.getElementById('listenButton').addEventListener('click', function(event) {
// 		console.log('clicked');
// 		var now = Tone.now();
// 		for(let i=0,end=playedNotes.length;i<end;i+=1){
// 			synth.triggerAttackRelease(playedNotes[i][0],(playedNotes[i][2]-playedNotes[i][1])*60./BPM ,now+playedNotes[i][1]*60./BPM);
// 		}//endfor i
// 	});

	midiStrEvts=[];
	for(let i=0,end=playedNotes.length;i<end;i+=1){
		let midiStrEvt=new MIDIStrEvt();
		midiStrEvt.time=playedNotes[i][1]*60000./BPM;
		midiStrEvt.pitch=SitchToPitch(playedNotes[i][0]);
		midiStrEvt.vel=80;
		midiStrEvt.channel=0;
		midiStrEvt.onoff=0;
		midiStrEvts.push(midiStrEvt);
		let midiStrEvt_=new MIDIStrEvt();
		midiStrEvt_.time=playedNotes[i][2]*60000./BPM;
		midiStrEvt_.pitch=SitchToPitch(playedNotes[i][0]);
		midiStrEvt_.vel=80;
		midiStrEvt_.channel=0;
		midiStrEvt_.onoff=1;
		midiStrEvts.push(midiStrEvt_);
	}//endfor i

	midiStrEvts.sort(CompareMIDIStrEvt);

	ABCJS.renderMidi("midi", "" ,{qpm:120},{generateDownload: false, generateInline: true });
	let str='[';
	str+='[{"ticksToEvent":0,"track":1,"event":{"channel":0,"deltaTime":0,"programNumber":'+document.getElementById('instrumentsList').value+',"subtype":"programChange","type":"channel"}},0]';
	for(let n=0;n<midiStrEvts.length;n+=1){
		if(midiStrEvts[n].onoff==0){
			str+=',[{"ticksToEvent":0,"track":'+(midiStrEvts[n].channel+1)+',"event":{"deltaTime":0,"channel":'+midiStrEvts[n].channel+',"type":"channel","noteNumber":'+midiStrEvts[n].pitch+',"velocity":'+midiStrEvts[n].vel+',"subtype":"noteOn"}},';
		}else{
			str+=',[{"ticksToEvent":0,"track":'+(midiStrEvts[n].channel+1)+',"event":{"deltaTime":0,"channel":'+midiStrEvts[n].channel+',"type":"channel","noteNumber":'+midiStrEvts[n].pitch+',"velocity":'+midiStrEvts[n].vel+',"subtype":"noteOff"}},';
		}//endif
		if(n==0){
			str+='0]';
		}else{
			str+=(midiStrEvts[n].time-midiStrEvts[n-1].time)+']';
		}//endif
	}//endfor n
	str+=']';

//console.log(str);

	document.getElementsByClassName('abcjs-data')[0].textContent=str;

}//end SetListenButton


document.getElementById('labelForListen').addEventListener('click', function(event){
	console.log('clicked',document.getElementById('instrumentsList').value)
//	console.log(document.querySelector('[title="Click to play/pause."]'));
	document.querySelector('[title="Click to play/pause."]').click();
});

$("#listenSpeed").keyup(function(){
	BPM=Number($("#listenSpeed").val());
	SetListenButton()
});

$("#instrumentsList").change(function(){
	SetListenButton()
});


