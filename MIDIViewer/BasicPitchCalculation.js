function SitchToPitch(sitch){
	var p_rel,p;
	if(sitch[0]=='C'){p_rel=60;
	}else if(sitch[0]=='D'){p_rel=62;
	}else if(sitch[0]=='E'){p_rel=64;
	}else if(sitch[0]=='F'){p_rel=65;
	}else if(sitch[0]=='G'){p_rel=67;
	}else if(sitch[0]=='A'){p_rel=69;
	}else if(sitch[0]=='B'){p_rel=71;
	}//endif
	sitch=sitch.slice(1);
	var oct=Number(sitch[sitch.length-1]);
	sitch=sitch.slice(0,sitch.length-1);
	p=p_rel+(oct-4)*12;
	if(sitch==""){p+=0;
	}else if(sitch=="#"){p+=1;
	}else if(sitch=="##"){p+=2;
	}else if(sitch=="b"){p-=1;
	}else if(sitch=="bb"){p-=2;
	}else if(sitch=="+"){p+=1;
	}else if(sitch=="++"){p+=2;
	}else if(sitch=="-"){p-=1;
	}else if(sitch=="--"){p-=2;
	}//endif
	return p;
}//end SitchToPitch

function SitchToSitchHeight(sitch){
	var oct=Number(sitch[sitch.length-1]);
	var ht;
	if(sitch[0]=='C'){ht=0;
	}else if(sitch[0]=='D'){ht=1;
	}else if(sitch[0]=='E'){ht=2;
	}else if(sitch[0]=='F'){ht=3;
	}else if(sitch[0]=='G'){ht=4;
	}else if(sitch[0]=='A'){ht=5;
	}else if(sitch[0]=='B'){ht=6;
	}else{ht=0;
	}//endif
	return ht+7*(oct-4);
}//end SitchToSitchHeight

function SitchToAcc(sitch){
	var accLab=sitch.slice(1,sitch.length-1);
	if(accLab==""){return 0;
	}else if(accLab=="#"){return 1;
	}else if(accLab=="##"){return 2;
	}else if(accLab=="b"){return -1;
	}else if(accLab=="bb"){return -2;
	}else if(accLab=="+"){return 1;
	}else if(accLab=="++"){return 2;
	}else if(accLab=="-"){return -1;
	}else if(accLab=="--"){return -2;
	}else{return 0;
	}//endif
}//end SitchToAcc

function PitchToSitch(p){//pithc to spelled pitch (sitch)
	var q=(p+120)%12;
	var qstr;
	switch(q){
		case 0 : qstr="C"; break;
		case 1 : qstr="C#"; break;
		case 2 : qstr="D"; break;
		case 3 : qstr="Eb"; break;
		case 4 : qstr="E"; break;
		case 5 : qstr="F"; break;
		case 6 : qstr="F#"; break;
		case 7 : qstr="G"; break;
		case 8 : qstr="G#"; break;
		case 9 : qstr="A"; break;
		case 10 : qstr="Bb"; break;
		case 11 : qstr="B"; break;
	}//endswitch
	return qstr+Math.floor(p/12-1);
}//end PitchToSitch

