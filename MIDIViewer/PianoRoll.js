//BasicPitchCalculation.js
//Midi.js
//console.log(SitchToSitchHeight('E4'));
//console.log(i+' '+fileContent[i].split(/\s+/));

class PianoRollEvt{
	constructor(){
		this.ID=-1;
		this.ontime=-1;
		this.offtime=-1;
		this.sitch="NA";
		this.pitch=-1;
		this.onvel=80;
		this.offvel=80;
		this.channel=0;
		this.endtime=-1;
		this.label="";
		this.ext1=-1;
	}//end constructor

	FromSprEvt(evt){
		this.ID=Number(evt[0]);
		this.ontime=Number(evt[1]);
		this.offtime=Number(evt[2]);
		this.sitch=evt[3];
		this.pitch=SitchToPitch(evt[3]);
		this.onvel=Number(evt[4]);
		this.offvel=Number(evt[5]);
		this.channel=Number(evt[6]);
		this.endtime=-1;
		this.label="";
		this.ext1=-1;
	}//end FromSprEvt

}//endclass PianoRollEvt

class PianoRoll{

	constructor(){
		this.comments=[];
		this.evts=[];
		this.pedals=[];
		this.pedalIntervals=[];
		this.programChangeData=new Array(16);
		this.programChangeData.fill(0);
	}//end constructor

	Clear(){
		this.comments=[];
		this.evts=[];
		this.pedals=[];
		this.pedalIntervals=[];
		this.programChangeData=new Array(16);
		this.programChangeData.fill(0);
	}//end Clear

	ReadMIDIFile(file){
		this.Clear();
		var midi=new Midi();
		var tmp=midi.ReadFile(file);

console.log(tmp);

console.log(midi.evts.length);

		var onPosition=[];
		for(var i=0;i<16;i+=1){onPosition[i]=[];for(var j=0;j<128;j+=1){onPosition[i][j]=-1;}}//endfor i,j
		var evt=new PianoRollEvt();
		var curChan;

		for(var n=0,len=midi.evts.length;n<len;n+=1){

			if(midi.evts[n].mes[0]>=128 && midi.evts[n].mes[0]<160){//note-on or note-off event
				curChan=midi.evts[n].mes[0]%16;
				if(midi.evts[n].mes[0]>=144 && midi.evts[n].mes[2]>0){//note-on
					if(onPosition[curChan][midi.evts[n].mes[1]]>=0){
						console.log('Warning: (Double) note-on event before a note-off event '+PitchToSitch(midi.evts[n].mes[1]));
						this.evts[onPosition[curChan][midi.evts[n].mes[1]]].offtime=midi.evts[n].time;
						this.evts[onPosition[curChan][midi.evts[n].mes[1]]].offvel=-1;
					}//endif
					onPosition[curChan][midi.evts[n].mes[1]]=this.evts.length;
					evt.channel=curChan;
					evt.sitch=PitchToSitch(midi.evts[n].mes[1]);
					evt.pitch=midi.evts[n].mes[1];
					evt.onvel=midi.evts[n].mes[2];
					evt.offvel=0;
					evt.ontime=midi.evts[n].time;
					evt.offtime=evt.ontime+0.1;
					var evt_=JSON.stringify(evt);
					evt_=JSON.parse(evt_);
					this.evts.push(evt_);
				}else{//note-off
					if(onPosition[curChan][midi.evts[n].mes[1]]<0){
						console.log('Warning: Note-off event before a note-on event '+PitchToSitch(midi.evts[n].mes[1])+"\t"+midi.evts[n].time);
						continue;
					}//endif
					this.evts[onPosition[curChan][midi.evts[n].mes[1]]].offtime=midi.evts[n].time;
					if(midi.evts[n].mes[2]>0){
						this.evts[onPosition[curChan][midi.evts[n].mes[1]]].offvel=midi.evts[n].mes[2];
					}else{
						this.evts[onPosition[curChan][midi.evts[n].mes[1]]].offvel=80;
					}//endif
					onPosition[curChan][midi.evts[n].mes[1]]=-1;
				}//endif
			}//endif
		}//endfor n

		for(var i=0;i<16;i+=1)for(var j=0;j<128;j+=1){
			if(onPosition[i][j]>=0){
				console.log('Error: Note without a note-off event');
				console.log('ontime channel sitch : '+this.evts[onPosition[i][j]].ontime+"\t"+this.evts[onPosition[i][j]].channel+"\t"+this.evts[onPosition[i][j]].sitch);
				return;
			}//endif
		}//endfor i,j

		for(var n=0,len=this.evts.length;n<len;n+=1){
			this.evts[n].ID=n;
		}//endfor n
console.log(this.evts.length);
	}//end ReadMIDIFile

}//endclass PianoRoll











