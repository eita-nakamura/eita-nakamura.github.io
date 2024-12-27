//PianoRoll.js

//console.log(SitchToSitchHeight('E4'));
//console.log(i+' '+fileContent[i].split(/\s+/));
//console.log(MyAdd(1.5,2));

var files;
var midi=new Midi();
var pr_=new PianoRoll();
var pr=new PianoRoll();
var pr2=new PianoRoll();
var pr3=new PianoRoll();
var pr4=new PianoRoll();
var selectedInput = null;

var xoffset=100;
var heightC4=200;
var pxPerSec=200;
var legerWidth=0.5;
var heightUnit=10;
var maxTime=2.1;
var separate_staff = 200

window.onload = function(){
	Draw();
}//end onload

function ReadFile(file, file_idx){

		pr_=new PianoRoll();

	if(file.name.substr(file.name.length-4) == '.mid' || file.name.substr(file.name.length-4) == '.midi'){

		var reader = new FileReader();
		reader.readAsArrayBuffer(file);

		reader.onload = function(){
			midi=new Midi();
			var fileContent=new Uint8Array(reader.result);
			var ch=[];
			var pos=0;
			midi.evts=[];
			//Read header
			ch=fileContent.slice(pos,pos+4); pos+=4;
			if(!(ch[0]==77&&ch[1]==84&&ch[2]==104&&ch[3]==100)){console.log('Error: file does not start with MThd');return;}//endif
			ch=fileContent.slice(pos,pos+4); pos+=4;// track length=6
			ch=fileContent.slice(pos,pos+2); pos+=2;//format number==0 or 1
			midi.formatType=ch[1];
//console.log('formatType : '+midi.formatType);
			if(midi.formatType!=0 && midi.formatType!=1){console.log('Error: format type is not 0 nor 1');return;}
			ch=fileContent.slice(pos,pos+2); pos+=2;//number of track
			midi.nTrack=ch[1];
//console.log('Number of tracks : '+midi.nTrack);
			if(midi.nTrack<1){console.log('Error: track number less than 1');return;}
			ch=fileContent.slice(pos,pos+2); pos+=2;//tick per quater tone
			midi.TPQN=ch[0]*16*16+ch[1];
//console.log('TPQN : '+midi.TPQN);

			//Read track data
			var runningStatus;
			for(var i=0;i<midi.nTrack;i+=1){
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
 					midi.evts.push(midiMes);
					readTick=true;	
				}//endwhile

			}//endfor i

			midi.evts.sort(LessTickMidiMessage);

			// set times
			var tickPoint=0;
			var timePoint=0;
			var currDurQN=500000;
			for(var i=0,len=midi.evts.length;i<len;i+=1){
				midi.evts[i].time=timePoint+(1.*(midi.evts[i].tick-tickPoint)/(1.*midi.TPQN))*(currDurQN/1000000.);
// 				midi.evts[i].time=timePoint+((double)(midi.evts[i].tick-tickPoint)/(double)TPQN)*((double)currDurQN/1000000.);
				if(midi.evts[i].mes[0]==255 && midi.evts[i].mes[1]==81 && midi.evts[i].mes[2]==3){
					currDurQN=midi.evts[i].mes[3]*256*256+midi.evts[i].mes[4]*256+midi.evts[i].mes[5];
					timePoint=midi.evts[i].time;
					tickPoint=midi.evts[i].tick;
				}//endif
			}//endfor i

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
							pr_.evts[onPosition[curChan][midi.evts[n].mes[1]]].offtime=midi.evts[n].time;
							pr_.evts[onPosition[curChan][midi.evts[n].mes[1]]].offvel=-1;
						}//endif
						onPosition[curChan][midi.evts[n].mes[1]]=pr_.evts.length;
						evt.channel=curChan;
						evt.sitch=PitchToSitch(midi.evts[n].mes[1]);
						evt.pitch=midi.evts[n].mes[1];
						evt.onvel=midi.evts[n].mes[2];
						evt.offvel=0;
						evt.ontime=midi.evts[n].time;
						evt.offtime=evt.ontime+0.1;
						var evt_=JSON.stringify(evt);
						evt_=JSON.parse(evt_);
						pr_.evts.push(evt_);
					}else{//note-off
						if(onPosition[curChan][midi.evts[n].mes[1]]<0){
							console.log('Warning: Note-off event before a note-on event '+PitchToSitch(midi.evts[n].mes[1])+"\t"+midi.evts[n].time);
							continue;
						}//endif
						pr_.evts[onPosition[curChan][midi.evts[n].mes[1]]].offtime=midi.evts[n].time;
						if(midi.evts[n].mes[2]>0){
							pr_.evts[onPosition[curChan][midi.evts[n].mes[1]]].offvel=midi.evts[n].mes[2];
						}else{
							pr_.evts[onPosition[curChan][midi.evts[n].mes[1]]].offvel=80;
						}//endif
						onPosition[curChan][midi.evts[n].mes[1]]=-1;
					}//endif
				}//endif
			}//endfor n

			for(var i=0;i<16;i+=1)for(var j=0;j<128;j+=1){
				if(onPosition[i][j]>=0){
					console.log('Error: Note without a note-off event');
					console.log('ontime channel sitch : '+pr_.evts[onPosition[i][j]].ontime+"\t"+pr_.evts[onPosition[i][j]].channel+"\t"+pr_.evts[onPosition[i][j]].sitch);
					return;
				}//endif
			}//endfor i,j


			for(var n=0,len=pr_.evts.length;n<len;n+=1){
				pr_.evts[n].ID=n;
			}//endfor n
			var maxTime_ = 0
			if(pr_.evts.length>0){
				maxTime_=pr_.evts[pr_.evts.length-1].offtime+3;
			}else{
				maxTime_=2.1;
			}//endif
			if(maxTime_>maxTime){maxTime=maxTime_;}

			if(file_idx==1){
				pr=pr_;
			}else if(file_idx==2){
				pr2=pr_;
			}else if(file_idx==3){
				pr3=pr_;
			}else if(file_idx==4){
				pr4=pr_;
			}else{
				return
			}//endif

			Draw();

		}//end reader.onload

	}else if(file.name.substr(file.name.length-8) == '_ipr.txt'){

		let reader = new FileReader();
		reader.readAsText(file);
		reader.onload = function(){

			var fileContent = reader.result.split(/\n/);
			var len = fileContent.length;
			var evt=new PianoRollEvt();
			for(let i=0; i<len; i++){
				if(fileContent[i]==""){continue;}
				if(fileContent[i][0]=="/" || fileContent[i][0]=="#"){continue;}
//				console.log(fileContent[i]);
				evt_data = fileContent[i].split(/\t/);

				evt.ontime=Number(evt_data[1]);
				evt.offtime=Number(evt_data[2]);
				evt.pitch=parseInt(evt_data[3]);
				evt.sitch=PitchToSitch(evt.pitch);
				evt.onvel=parseInt(evt_data[4]);
				evt.offvel=parseInt(evt_data[5]);
				evt.channel=parseInt(evt_data[6]);

				var evt_=JSON.stringify(evt);
				evt_=JSON.parse(evt_);
				pr_.evts.push(evt_);

			}//endfor i

//console.log(pr_.evts.length);
			for(var n=0,len=pr_.evts.length;n<len;n+=1){
				pr_.evts[n].ID=n;
			}//endfor n
			var maxTime_ = 0
			if(pr_.evts.length>0){
				maxTime_=pr_.evts[pr_.evts.length-1].offtime+3;
			}else{
				maxTime_=2.1;
			}//endif
			if(maxTime_>maxTime){maxTime=maxTime_;}

			if(file_idx==1){
				pr=pr_;
			}else if(file_idx==2){
				pr2=pr_;
			}else if(file_idx==3){
				pr3=pr_;
			}else if(file_idx==4){
				pr4=pr_;
			}else{
				return
			}//endif

			Draw();

		}//end reader.onload

	}//endif filetype

// 		var str='';
// 		for(var n=0,len=prevts.length;n<len;n+=1){
// 			str+=prevts[n].ID+'\t'+prevts[n].ontime+'\t'+prevts[n].offtime+'\t'+prevts[n].sitch+'\t'+prevts[n].channel+'\n';
// //console.log(prevts[n]);
// 		}//endfor n
// 		document.getElementById('tta').value=str;

}//end ReadFile

function Draw(){

//console.log(document.getElementById("timeScale").value);
	pxPerSec=document.getElementById("timeScale").value*200;

	var width=xoffset+maxTime*pxPerSec;
	document.getElementById('display').innerHTML='<svg id="mysvg" xmlns="http://www.w3.org/2000/svg" width="'+(width+20)+'" height="1000"></svg>';
	document.getElementById('display').style.width=(width+20)+'px';
	mysvg=document.getElementById('mysvg');

	for(var i=-5;i<=5;i+=1){
		if(i==0){continue;}
		var line1=document.createElementNS('http://www.w3.org/2000/svg','line');
		line1.setAttribute('x1',0);
		line1.setAttribute('x2',width);
		line1.setAttribute('y1',200+10*i);
		line1.setAttribute('y2',200+10*i);
		line1.setAttribute('stroke-opacity',1);
		line1.setAttribute('stroke','rgb(120,120,120)');
		line1.setAttribute('stroke-width',1);
		mysvg.appendChild(line1);
	}//endfor i

	for(var i=-5;i<=5;i+=1){
		if(i==0){continue;}
		var line1=document.createElementNS('http://www.w3.org/2000/svg','line');
		line1.setAttribute('x1',0);
		line1.setAttribute('x2',width);
		line1.setAttribute('y1',200+separate_staff+10*i);
		line1.setAttribute('y2',200+separate_staff+10*i);
		line1.setAttribute('stroke-opacity',1);
		line1.setAttribute('stroke','rgb(120,120,120)');
		line1.setAttribute('stroke-width',1);
		mysvg.appendChild(line1);
	}//endfor i

	for(var i=-5;i<=5;i+=1){
		if(i==0){continue;}
		var line1=document.createElementNS('http://www.w3.org/2000/svg','line');
		line1.setAttribute('x1',0);
		line1.setAttribute('x2',width);
		line1.setAttribute('y1',200+2*separate_staff+10*i);
		line1.setAttribute('y2',200+2*separate_staff+10*i);
		line1.setAttribute('stroke-opacity',1);
		line1.setAttribute('stroke','rgb(120,120,120)');
		line1.setAttribute('stroke-width',1);
		mysvg.appendChild(line1);
	}//endfor i

	for(var i=-5;i<=5;i+=1){
		if(i==0){continue;}
		var line1=document.createElementNS('http://www.w3.org/2000/svg','line');
		line1.setAttribute('x1',0);
		line1.setAttribute('x2',width);
		line1.setAttribute('y1',200+3*separate_staff+10*i);
		line1.setAttribute('y2',200+3*separate_staff+10*i);
		line1.setAttribute('stroke-opacity',1);
		line1.setAttribute('stroke','rgb(120,120,120)');
		line1.setAttribute('stroke-width',1);
		mysvg.appendChild(line1);
	}//endfor i

	var str='';

	for(var t=0;t<maxTime;t+=0.1){
		str+='<div style="position:absolute; left:'+(t*pxPerSec+xoffset-legerWidth)+'px; top:'+(heightC4-5*heightUnit-legerWidth)+'px; width:'+0+'px; height:'+(10*heightUnit+3*separate_staff)+'px; border:'+legerWidth+'px solid rgba(30,30,30,0.3);"></div>';
	}//endfor t
	for(var t=0;t<maxTime;t+=1){
		str+='<div style="position:absolute; left:'+(t*pxPerSec+xoffset-legerWidth)+'px; top:'+(heightC4-5*heightUnit-legerWidth)+'px; width:'+0+'px; height:'+(10*heightUnit+3*separate_staff)+'px; border:'+legerWidth+'px solid rgba(30,30,30,0.9);"></div>';
		str+='<div style="position:absolute; left:'+(t*pxPerSec+xoffset-4)+'px; top:'+(heightC4-5*heightUnit-legerWidth-20)+'px; width:'+0+'px; height:'+10*heightUnit+'px; color:rgba(30,30,30,0.3); font-size:12pt">'+t+'</div>';
	}//endfor t

	str+='<img src="img/Gclef.png" height="'+(7.5*heightUnit)+'" style="position:absolute; left:'+(20)+'px; top:'+(heightC4-6.5*heightUnit)+'px;"/>';
	str+='<img src="img/Fclef.png" height="'+(3.4*heightUnit)+'" style="position:absolute; left:'+(20+3)+'px; top:'+(heightC4+0.9*heightUnit)+'px;"/>';
	str+='<img src="img/Gclef.png" height="'+(7.5*heightUnit)+'" style="position:absolute; left:'+(20)+'px; top:'+(heightC4-6.5*heightUnit+separate_staff)+'px;"/>';
	str+='<img src="img/Fclef.png" height="'+(3.4*heightUnit)+'" style="position:absolute; left:'+(20+3)+'px; top:'+(heightC4+0.9*heightUnit+separate_staff)+'px;"/>';
	str+='<img src="img/Gclef.png" height="'+(7.5*heightUnit)+'" style="position:absolute; left:'+(20)+'px; top:'+(heightC4-6.5*heightUnit+2*separate_staff)+'px;"/>';
	str+='<img src="img/Fclef.png" height="'+(3.4*heightUnit)+'" style="position:absolute; left:'+(20+3)+'px; top:'+(heightC4+0.9*heightUnit+2*separate_staff)+'px;"/>';
	str+='<img src="img/Gclef.png" height="'+(7.5*heightUnit)+'" style="position:absolute; left:'+(20)+'px; top:'+(heightC4-6.5*heightUnit+3*separate_staff)+'px;"/>';
	str+='<img src="img/Fclef.png" height="'+(3.4*heightUnit)+'" style="position:absolute; left:'+(20+3)+'px; top:'+(heightC4+0.9*heightUnit+3*separate_staff)+'px;"/>';

	//Draw notes
for(var ii=1;ii<=4;ii++){
	if(ii==1){pr_=pr;
	}else if(ii==2){pr_=pr2;
	}else if(ii==3){pr_=pr3;
	}else if(ii==4){pr_=pr4;
	}//endif
//	+(ii-1)*separate_staff
	for(var i=0,len=pr_.evts.length;i<len;i+=1){
		var evt=pr_.evts[i];
		var sitchHeight=SitchToSitchHeight(evt.sitch);

		if(sitchHeight==0){
			str+='<div style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset-8)+'px; top:'+(heightC4-legerWidth+(ii-1)*separate_staff)+'px; width:'+16+'px; height:0px; border:'+legerWidth+'px solid rgba(0,0,0,1);"></div>';
		}else if(sitchHeight>11){
			for(let h=12,end=sitchHeight;h<=end;h+=2){
				str+='<div style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset-8)+'px;  top:'+(heightC4-0.5*heightUnit*h-legerWidth+(ii-1)*separate_staff)+'px;width:'+16+'px; height:0px; border:0.5px solid rgba(0,0,0,1);"></div>';
			}//endfor h
		}else if(sitchHeight<-11){
			for(let h=-12,end=sitchHeight;h>=end;h-=2){
				str+='<div style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset-8)+'px; top:'+(heightC4-0.5*heightUnit*h-legerWidth+(ii-1)*separate_staff)+'px; width:'+16+'px; height:0px; border:0.5px solid rgba(0,0,0,1);"></div>';
			}//endfor h
		}//endif

		if(evt.channel==0){
			str+='<div id="note'+evt.ID+'" contentEditable=true style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset)+'px; top:'+(-(1+sitchHeight)*5+heightC4+0.5+(ii-1)*separate_staff)+'px; width:'+(evt.offtime-evt.ontime)*pxPerSec+'px; height:9px; background-color:rgba(50,255,0,0.8); color:red; font-size:7px;"></div>';
			str+='<div style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset-1)+'px; top:'+(-(1+sitchHeight)*5+heightC4-0.5+(ii-1)*separate_staff)+'px; width:'+(evt.offtime-evt.ontime)*pxPerSec+'px; height:9px; border:1px solid rgba(20,20,20,0.7);"></div>';
		}else{
			str+='<div id="note'+evt.ID+'" contentEditable=true style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset)+'px; top:'+(-(1+sitchHeight)*5+heightC4+0.5+(ii-1)*separate_staff)+'px; width:'+(evt.offtime-evt.ontime)*pxPerSec+'px; height:9px; background-color:rgba(255,120,30,0.8); color:blue; font-size:7px;"></div>';
			str+='<div style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset-1)+'px; top:'+(-(1+sitchHeight)*5+heightC4-0.5+(ii-1)*separate_staff)+'px; width:'+(evt.offtime-evt.ontime)*pxPerSec+'px; height:9px; border:1px solid rgba(20,20,20,0.7);"></div>';
		}//endif

		var acc=SitchToAcc(evt.sitch);
		if(acc==1){
			str+='<img src="img/Sharp.png" height="'+(2*heightUnit)+'" style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset-9)+'px; top:'+(-(1+sitchHeight)*5+heightC4-1-0.4*heightUnit+(ii-1)*separate_staff)+'px;"/>';
		}else if(acc==2){
			str+='<img src="img/DoubleSharp.png" height="'+(heightUnit)+'" style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset-12)+'px; top:'+(-(1+sitchHeight)*5+heightC4-1+0.1*heightUnit+(ii-1)*separate_staff)+'px;"/>';
		}else if(acc==-1){
			str+='<img src="img/Flat.png" height="'+(1.7*heightUnit)+'" style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset-9)+'px; top:'+(-(1+sitchHeight)*5+heightC4-0.5-0.6*heightUnit+(ii-1)*separate_staff)+'px;"/>';
		}else if(acc==-2){
			str+='<img src="img/DoubleFlat.png" height="'+(1.7*heightUnit)+'" style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset-14)+'px; top:'+(-(1+sitchHeight)*5+heightC4-1-0.6*heightUnit+(ii-1)*separate_staff)+'px;"/>';
		}//endif
	}//endfor i
}//endfor ii

//	//Draw notes
//	for(var i=0,len=pr2.evts.length;i<len;i+=1){
//		var evt=pr2.evts[i];
//		var sitchHeight=SitchToSitchHeight(evt.sitch);
//
//		if(sitchHeight==0){
//			str+='<div style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset-8)+'px; top:'+(heightC4-legerWidth+separate_staff)+'px; width:'+16+'px; height:0px; border:'+legerWidth+'px solid rgba(0,0,0,1);"></div>';
//		}else if(sitchHeight>11){
//			for(let h=12,end=sitchHeight;h<=end;h+=2){
//				str+='<div style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset-8)+'px;  top:'+(heightC4-0.5*heightUnit*h-legerWidth+separate_staff)+'px;width:'+16+'px; height:0px; border:0.5px solid rgba(0,0,0,1);"></div>';
//			}//endfor h
//		}else if(sitchHeight<-11){
//			for(let h=-12,end=sitchHeight;h>=end;h-=2){
//				str+='<div style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset-8)+'px; top:'+(heightC4-0.5*heightUnit*h-legerWidth+separate_staff)+'px; width:'+16+'px; height:0px; border:0.5px solid rgba(0,0,0,1);"></div>';
//			}//endfor h
//		}//endif
//
//		if(evt.channel==0){
//			str+='<div id="note'+evt.ID+'" contentEditable=true style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset)+'px; top:'+(-(1+sitchHeight)*5+heightC4+0.5+separate_staff)+'px; width:'+(evt.offtime-evt.ontime)*pxPerSec+'px; height:9px; background-color:rgba(50,255,0,0.8); color:red; font-size:7px;"></div>';
//			str+='<div style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset-1)+'px; top:'+(-(1+sitchHeight)*5+heightC4-0.5+separate_staff)+'px; width:'+(evt.offtime-evt.ontime)*pxPerSec+'px; height:9px; border:1px solid rgba(20,20,20,0.7);"></div>';
//		}else{
//			str+='<div id="note'+evt.ID+'" contentEditable=true style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset)+'px; top:'+(-(1+sitchHeight)*5+heightC4+0.5+separate_staff)+'px; width:'+(evt.offtime-evt.ontime)*pxPerSec+'px; height:9px; background-color:rgba(255,120,30,0.8); color:blue; font-size:7px;"></div>';
//			str+='<div style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset-1)+'px; top:'+(-(1+sitchHeight)*5+heightC4-0.5+separate_staff)+'px; width:'+(evt.offtime-evt.ontime)*pxPerSec+'px; height:9px; border:1px solid rgba(20,20,20,0.7);"></div>';
//		}//endif
//
//		var acc=SitchToAcc(evt.sitch);
//		if(acc==1){
//			str+='<img src="img/Sharp.png" height="'+(2*heightUnit)+'" style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset-9)+'px; top:'+(-(1+sitchHeight)*5+heightC4-1-0.4*heightUnit+separate_staff)+'px;"/>';
//		}else if(acc==2){
//			str+='<img src="img/DoubleSharp.png" height="'+(heightUnit)+'" style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset-12)+'px; top:'+(-(1+sitchHeight)*5+heightC4-1+0.1*heightUnit+separate_staff)+'px;"/>';
//		}else if(acc==-1){
//			str+='<img src="img/Flat.png" height="'+(1.7*heightUnit)+'" style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset-9)+'px; top:'+(-(1+sitchHeight)*5+heightC4-0.5-0.6*heightUnit+separate_staff)+'px;"/>';
//		}else if(acc==-2){
//			str+='<img src="img/DoubleFlat.png" height="'+(1.7*heightUnit)+'" style="position:absolute; left:'+(evt.ontime*pxPerSec+xoffset-14)+'px; top:'+(-(1+sitchHeight)*5+heightC4-1-0.6*heightUnit+separate_staff)+'px;"/>';
//		}//endif
//	}//endfor i

	document.getElementById('display').innerHTML+=str;

}//end Draw


function ClearDisplay(){
	maxTime=2.1;
	pr=[];
	document.getElementById('filename1').value='';
	Draw();
}//end ClearDisplay


var elDrop = document.getElementById('dropzone');

elDrop.addEventListener('dragover', function(event) {
	event.preventDefault();
	event.dataTransfer.dropEffect = 'copy';
	elDrop.classList.add('dropover');
});

elDrop.addEventListener('dragleave', function(event) {
	elDrop.classList.remove('dropover');
});

elDrop.addEventListener('drop', function(event) {
	event.preventDefault();
	elDrop.classList.remove('dropover');
	files=event.dataTransfer.files;
	document.getElementById('filename1').value='';
	for(var i=0;i<files.length;i+=1){
		ReadFile(files[i], 1);
		document.getElementById('filename1').value+=files[i].name+'\n';
	}//endfor i
});

$("#filein1").change(function(evt){
	files=evt.target.files;
	document.getElementById('filename1').value='';
	for(var i=0;i<files.length;i+=1){
		ReadFile(files[i], 1);
		document.getElementById('filename1').value+=files[i].name+'\n';
	}//endfor i
});


var elDrop2 = document.getElementById('dropzone2');

elDrop2.addEventListener('dragover', function(event) {
	event.preventDefault();
	event.dataTransfer.dropEffect = 'copy';
	elDrop2.classList.add('dropover');
});

elDrop2.addEventListener('dragleave', function(event) {
	elDrop2.classList.remove('dropover');
});

elDrop2.addEventListener('drop', function(event) {
	event.preventDefault();
	elDrop2.classList.remove('dropover');
	files=event.dataTransfer.files;
	document.getElementById('filename2').value='';
	for(var i=0;i<files.length;i+=1){
		ReadFile(files[i], 2);
		document.getElementById('filename2').value+=files[i].name+'\n';
	}//endfor i
});

$("#filein2").change(function(evt){
	files=evt.target.files;
	document.getElementById('filename2').value='';
	for(var i=0;i<files.length;i+=1){
		ReadFile(files[i], 2);
		document.getElementById('filename2').value+=files[i].name+'\n';
	}//endfor i
});

var elDrop3 = document.getElementById('dropzone3');

elDrop3.addEventListener('dragover', function(event) {
	event.preventDefault();
	event.dataTransfer.dropEffect = 'copy';
	elDrop3.classList.add('dropover');
});

elDrop3.addEventListener('dragleave', function(event) {
	elDrop3.classList.remove('dropover');
});

elDrop3.addEventListener('drop', function(event) {
	event.preventDefault();
	elDrop3.classList.remove('dropover');
	files=event.dataTransfer.files;
	document.getElementById('filename3').value='';
	for(var i=0;i<files.length;i+=1){
		ReadFile(files[i], 3);
		document.getElementById('filename3').value+=files[i].name+'\n';
	}//endfor i
});

$("#filein3").change(function(evt){
	files=evt.target.files;
	document.getElementById('filename3').value='';
	for(var i=0;i<files.length;i+=1){
		ReadFile(files[i], 3);
		document.getElementById('filename3').value+=files[i].name+'\n';
	}//endfor i
});

var elDrop4 = document.getElementById('dropzone4');

elDrop4.addEventListener('dragover', function(event) {
	event.preventDefault();
	event.dataTransfer.dropEffect = 'copy';
	elDrop4.classList.add('dropover');
});

elDrop4.addEventListener('dragleave', function(event) {
	elDrop4.classList.remove('dropover');
});

elDrop4.addEventListener('drop', function(event) {
	event.preventDefault();
	elDrop4.classList.remove('dropover');
	files=event.dataTransfer.files;
	document.getElementById('filename4').value='';
	for(var i=0;i<files.length;i+=1){
		ReadFile(files[i], 4);
		document.getElementById('filename4').value+=files[i].name+'\n';
	}//endfor i
});

$("#filein4").change(function(evt){
	files=evt.target.files;
	document.getElementById('filename4').value='';
	for(var i=0;i<files.length;i+=1){
		ReadFile(files[i], 4);
		document.getElementById('filename4').value+=files[i].name+'\n';
	}//endfor i
});


document.getElementById('drawButton').addEventListener('click', function(event){
	Draw();
});

document.getElementById('clearButton').addEventListener('click', function(event){
	ClearDisplay();
});


