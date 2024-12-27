//
//console.log(SitchToSitchHeight('E4'));
//console.log(i+' '+fileContent[i].split(/\s+/));

class MidiMessage{
	constructor(){
		this.mes=[];
		this.tick=-1;
		this.track=-1;
		this.time=-1;
	}//end constructor

	isEffNoteOn(){
		if(this.mes.length!=3){return false;}
		if(this.mes[0]>=144 && this.mes[0]<160 && this.mes[2]>0){
			return true;
		}else{
			return false;
		}//endif
	}//end isEffNoteOn

	isEffNoteOff(){
		if(this.mes.length!=3){return false;}
		if(this.mes[0]>=128 && this.mes[0]<144){
			return true;
		}else if(this.mes[0]>=144 && this.mes[0]<160 && this.mes[2]==0){
			return true;
		}else{
			return false;
		}//endif
	}//end isEffNoteOn
}//endclass MidiMessage

function LessTickMidiMessage(a,b){
	let comparison=0;
	if(a.tick < b.tick){
		comparison=-1;
	}else if(a.tick==b.tick){
		if(a.isEffNoteOff() && b.isEffNoteOn()){
			comparison=-1;
		}//endif
	}else{//if a.time > b.time
		comparison=1;
	}//endif
	return comparison;
}//end LessTickMidiMessage
//listMidiMessage.sort(LessTickMidiMessage);

class Midi{
	constructor(){
		this.evts=[];//vector<MidiMessage>
		this.nTrack=-1;
		this.TPQN=-1;
		this.formatType=-1;//=0 or 1
		this.programChangeData=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		this.strData='';
	}//end constructor

	Clear(){
		this.evts=[];//vector<MidiMessage>
		this.nTrack=-1;
		this.TPQN=-1;
		this.formatType=-1;//=0 or 1
		this.programChangeData=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		this.strData='';
	}//end Clear

	ReadFile(file){
		this.Clear();
		var reader = new FileReader();
		reader.readAsArrayBuffer(file);

		reader.onload = function(){
			var fileContent=new Uint8Array(reader.result);
			var ch=[];
			var pos=0;
			this.evts=[];
			//Read header
			ch=fileContent.slice(pos,pos+4); pos+=4;
			if(!(ch[0]==77&&ch[1]==84&&ch[2]==104&&ch[3]==100)){console.log('Error: file does not start with MThd');return;}//endif
			ch=fileContent.slice(pos,pos+4); pos+=4;// track length=6
			ch=fileContent.slice(pos,pos+2); pos+=2;//format number==0 or 1
			this.formatType=ch[1];
//console.log('formatType : '+this.formatType);
			if(this.formatType!=0 && this.formatType!=1){console.log('Error: format type is not 0 nor 1');return;}
			ch=fileContent.slice(pos,pos+2); pos+=2;//number of track
			this.nTrack=ch[1];
//console.log('Number of tracks : '+this.nTrack);
			if(this.nTrack<1){console.log('Error: track number less than 1');return;}
			ch=fileContent.slice(pos,pos+2); pos+=2;//tick per quater tone
			this.TPQN=ch[0]*16*16+ch[1];
//console.log('TPQN : '+this.TPQN);

			//Read track data
			var runningStatus;
			for(var i=0;i<this.nTrack;i+=1){
				ch=fileContent.slice(pos,pos+4); pos+=4;//
				if(!(ch[0]==77&&ch[1]==84&&ch[2]==114&&ch[3]==107)){console.log('Error: track does not start with MTrk');return;}//endif
				ch=fileContent.slice(pos,pos+4); pos+=4;// track length
				var trk_len=ch[3]+16*16*(ch[2]+16*16*(ch[1]+16*16*ch[0]));
				ch=fileContent.slice(pos,pos+trk_len); pos+=trk_len;// track data
//console.log(trk_len);

				var curByte=0;
				var tick=0;//cumulative tick
				var deltaTick=0;
				var readTick=true;
				while(curByte<trk_len){
	
					var midiMes = new MidiMessage();
					midiMes.track=i;
					var vi=[];//vector<int>
	
					if(readTick){
						deltaTick=0;
						while(true){
							if(ch[curByte]<128){break;}
							deltaTick=128*deltaTick+(ch[curByte]-128);
							curByte+=1;
						}//endwhile
						deltaTick=128*deltaTick+ch[curByte];
						tick+=deltaTick;
						readTick=false; curByte+=1; continue;
					}//endif
	
					var vi=[];
					if((ch[curByte]>=128 && ch[curByte]<192) || (ch[curByte]>=224 && ch[curByte]<240)){
						runningStatus=ch[curByte];
						vi.push( ch[curByte] ); vi.push( ch[curByte+1] ); vi.push( ch[curByte+2] );
						curByte+=3;
					}else if(ch[curByte]>=192&&ch[curByte]<224){
						runningStatus=ch[curByte];
						vi.push( ch[curByte] ); vi.push( ch[curByte+1] );
						curByte+=2;
					}else if(ch[curByte]==240 || ch[curByte]==255){
						runningStatus=ch[curByte];
						vi.push( ch[curByte] );
						curByte+=1;
						if(runningStatus==255){
							vi.push( ch[curByte] );//type of metaevent
							curByte+=1;
						}//endif
						var numBytes=0;
						while(true){
							if(ch[curByte]<128) break;
							numBytes=128*numBytes+(ch[curByte]-128);
							vi.push( ch[curByte] );
							curByte+=1;
						}//endwhile
						numBytes=128*numBytes+ch[curByte];
						vi.push( ch[curByte] );
						for(var j=0;j<numBytes;j+=1){vi.push( ch[curByte+1+j] );}
						curByte+=1+numBytes;
					}else if(ch[curByte]<128){
						if((runningStatus>=128 && runningStatus<192) || (runningStatus>=224 && runningStatus<240)){
							vi.push( runningStatus ); vi.push( ch[curByte] ); vi.push( ch[curByte+1] );
							curByte+=2;
						}else if(runningStatus>=192 && runningStatus<224){
							vi.push( runningStatus ); vi.push( ch[curByte] );
							curByte+=1;
						}else if(runningStatus==240 || runningStatus==255){
							vi.push( runningStatus );
							if(runningStatus==255){curByte+=1; vi.push( ch[curByte] );}
							curByte+=1;
							var numBytes=0;
							while(true){
								if(ch[curByte]<128) break;
								numBytes=128*numBytes+(ch[curByte]-128);
								vi.push( ch[curByte] );
								curByte+=1;
							}//endwhile
							numBytes=128*numBytes+ch[curByte];
							vi.push( ch[curByte] );
							for(var j=0;j<numBytes;j+=1){vi.push( ch[curByte+1+j] );}
							curByte+=1+numBytes;
						}else{
							console.log('Error: runningStatus has an invalid value : '+runningStatus); return; break;
						}//endif
					}else{
						console.log('Error: unknown events in the trk : '+i+' '+curByte+' '+ch[curByte]); return; break;
					}//endif
	
					midiMes.tick=tick;
					midiMes.mes=vi;
 					this.evts.push(midiMes);
					readTick=true;	
				}//endwhile

			}//endfor i

			this.evts.sort(LessTickMidiMessage);

			// set times
			var tickPoint=0;
			var timePoint=0;
			var currDurQN=500000;
			for(var i=0,len=this.evts.length;i<len;i+=1){
				this.evts[i].time=timePoint+(1.*(this.evts[i].tick-tickPoint)/(1.*this.TPQN))*(currDurQN/1000000.);
// 				this.evts[i].time=timePoint+((double)(this.evts[i].tick-tickPoint)/(double)TPQN)*((double)currDurQN/1000000.);
				if(this.evts[i].mes[0]==255 && this.evts[i].mes[1]==81 && this.evts[i].mes[2]==3){
					currDurQN=this.evts[i].mes[3]*256*256+this.evts[i].mes[4]*256+this.evts[i].mes[5];
					timePoint=this.evts[i].time;
					tickPoint=this.evts[i].tick;
				}//endif
			}//endfor i

console.log(this.evts.length);
			return this.evts.length;

		}//end reader.onload

	}//end ReadFile


}//endclass Midi


