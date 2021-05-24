/**
 * 音名から楽譜へのマッピングを行う
 * @param {String} sitch 音名
 */

function sitchToSitchHeight(sitch){
	// 高さ(C4の4などを拾う)
	let strLength = sitch.length;
	let octave = Number(sitch[strLength - 1]);
	// 音名と数値の対応 (C -> 0, D -> 1, ... A -> 5, B -> 6)
	let pitch = String(sitch[0]);
	let ht = 0;
	
	if (pitch == "C"){ht = 0;}
	else if(pitch == "D"){ht = 1;}
	else if(pitch == "E"){ht = 2;}
	else if(pitch == "F"){ht = 3;}
	else if(pitch == "G"){ht = 4;}
	else if(pitch == "A"){ht = 5;}
	else if(pitch == "B"){ht = 6;}
	else {ht = 0;}

	let ret = ht + 7 * (octave - 4);

	return ret;
}


/**
 * 音名から臨時記号に対応する値へのマッピング
 * @param {String} sitch 
 */
function sitchToAcc(sitch){
	let accLab = sitch.slice(1,sitch.length-1);

	if (accLab=="#" || accLab=="+"){
		return 1;
	}
	else if (accLab=="##" || accLab=="++"){
		return 2;
	}
	else if (accLab=="b" || accLab=="-"){
		return -1;
	}
	else if (accLab=="bb" || accLab=="--"){
		return -2;
	}
	else {
		return 0;
	}
}

function SitchToPitch(sitch){
	let p_rel,p;
	if(sitch[0]=='C'){p_rel=60;
	}else if(sitch[0]=='D'){p_rel=62;
	}else if(sitch[0]=='E'){p_rel=64;
	}else if(sitch[0]=='F'){p_rel=65;
	}else if(sitch[0]=='G'){p_rel=67;
	}else if(sitch[0]=='A'){p_rel=69;
	}else if(sitch[0]=='B'){p_rel=71;
	}//endif
	sitch=sitch.slice(1);
	let oct=Number(sitch[sitch.length-1]);
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


function SitchClassToPitchClass(sitch){
	let p_rel,p;
	if(sitch[0]=='C'){p_rel=0;
	}else if(sitch[0]=='D'){p_rel=2;
	}else if(sitch[0]=='E'){p_rel=4;
	}else if(sitch[0]=='F'){p_rel=5;
	}else if(sitch[0]=='G'){p_rel=7;
	}else if(sitch[0]=='A'){p_rel=9;
	}else if(sitch[0]=='B'){p_rel=11;
	}//endif
	sitch=sitch.slice(1);
	p=p_rel+12;
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
	return p%12;
}//end SitchClassToPitchClass

function SitchToAcc(sitch){
//	let accLab=sitch.substr(1,sitch.size()-2);
	let accLab=sitch.slice(1,-1);
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

function SitchToPytchClass(sitch){
	let pytch;
	if(sitch[0]=='F'){pytch=-1;
	}else if(sitch[0]=='C'){pytch=0;
	}else if(sitch[0]=='G'){pytch=1;
	}else if(sitch[0]=='D'){pytch=2;
	}else if(sitch[0]=='A'){pytch=3;
	}else if(sitch[0]=='E'){pytch=4;
	}else if(sitch[0]=='B'){pytch=5;
	}else{pytch=-100;//rest R
	}//endif
	pytch+=SitchToAcc(sitch)*7;
	return pytch;
}//end SitchToPytchClass

function SitchClassToPytchClass(sitch){
	sitch+="4";
	return SitchToPytchClass(sitch);
}//end SitchClassToPytchClass


function PitchClassToSitchClass(pc){
	let q=(pc+120)%12;
	let qstr;
	switch(q){
		case 0 : qstr="C"; break;
		case 1 : qstr="C#"; break;
		case 2 : qstr="D"; break;
		case 3 : qstr="Eb"; break;
		case 4 : qstr="E"; break;
		case 5 : qstr="F"; break;
		case 6 : qstr="F#"; break;
		case 7 : qstr="G"; break;
		case 8 : qstr="Ab"; break;
		case 9 : qstr="A"; break;
		case 10 : qstr="Bb"; break;
		case 11 : qstr="B"; break;
	}//endswitch
	return qstr;
}//end PitchClassToSitchClass

function PytchClassToSitchClass(pytch){
	let sitchClass="";
	sitchClass=PitchClassToSitchClass( (((pytch+1+700)%7-1)*7+120)%12 );
	if(pytch>=13){
		sitchClass+="##";
	}else if(pytch>=6){
		sitchClass+="#";
	}else if(pytch<=-9){
		sitchClass+="bb";
	}else if(pytch<=-2){
		sitchClass+="b";
	}//endif
	return sitchClass;
}//end PytchClassToSitchClass

// function TransposeFifthSitch(sitch,keyfifthShift){
// 	if(sitch=="R"){return sitch;}
// 	let pitchShift = (keyfifthShift*7+1200)%12;
// 	//new pitch = prev pich + pitchShift
// 	let pitch=SitchToPitch(sitch);
// 	pitch+=pitchShift;
// 	let oct=sitch[sitch.size()-1]-'0';
// 	sitch.erase(sitch.end()-1);
// 	sitch=PytchClassToSitchClass(SitchClassToPytchClass(sitch)+keyfifthShift);
// 	stringstream ss;
// 	ss.str(""); ss<<oct;
// 	let tmpPitch=SitchToPitch(sitch+ss.str());
// 	oct+=(pitch-tmpPitch)/12;
// 	ss.str(""); ss<<oct;
// 	sitch+=ss.str();
// 	return sitch;
// }//end TransposeFifthSitch


class ChordSymbol{

	constructor(fullname_){
		if(fullname_===undefined){
			this.fullname="";//C#m7/E
			this.root="";//C#
			this.form="";//m7
			this.bass="";//E
			this.pcset=[];
			this.pcsetOrdered=[];
		}else{
			this.fullname=fullname_;
			this.InitFromFullname();
		}//endif
	}//end cnostructor

	InitFromFullname(){

		let str=this.fullname;
		if(this.fullname=="NC"){
			this.root="R";
			this.form="NC";
			this.bass="R";
		}else if(this.fullname.length==1){
			this.root=this.fullname;
			this.form="";
			this.bass=this.root;
		}else{
			if(this.fullname[1]=='#' || this.fullname[1]=='b'){
				this.root=this.fullname[0]+this.fullname[1]
				str=this.fullname.slice(2);
			}else{
				this.root=this.fullname[0]
				str=this.fullname.slice(1);
			}//endif
			if(str.indexOf("/")==-1){
				this.form=str;
				this.bass=this.root;
			}else{
				this.form=str.slice(0,str.indexOf("/"));
				this.bass=str.slice(str.indexOf("/")+1);
			}//endif
		}//endif

		//Normalize notation
		if(this.form=="maj7" || this.form=="Maj7"){
			this.form="M7"; if(this.bass==this.root){this.fullname=this.root+this.form;}else{this.fullname=this.root+this.form+"/"+this.bass;}//endif
		}else if(this.form=="(7)"){
			this.form="7"; if(this.bass==this.root){this.fullname=this.root+this.form;}else{this.fullname=this.root+this.form+"/"+this.bass;}//endif
		}else if(this.form=="mmaj7" || this.form=="min(maj7)" || this.form=="m(Maj7)"){
			this.form="mM7"; if(this.bass==this.root){this.fullname=this.root+this.form;}else{this.fullname=this.root+this.form+"/"+this.bass;}//endif
		}else if(this.form=="sus47" || this.form=="sus4(add7)" || this.form=="7sus4(add7)"){
			this.form="7sus4"; if(this.bass==this.root){this.fullname=this.root+this.form;}else{this.fullname=this.root+this.form+"/"+this.bass;}//endif
		}else if(this.form=="m7(b5)(addb5)"  || this.form=="m7-5"){
			this.form="m7(b5)"; if(this.bass==this.root){this.fullname=this.root+this.form;}else{this.fullname=this.root+this.form+"/"+this.bass;}//endif
		}else if(this.form=="9sus(add9)"){
			this.form="sus4(add9)"; if(this.bass==this.root){this.fullname=this.root+this.form;}else{this.fullname=this.root+this.form+"/"+this.bass;}//endif
		}else if(this.form=="m7(add7)"){
			this.form="m7"; if(this.bass==this.root){this.fullname=this.root+this.form;}else{this.fullname=this.root+this.form+"/"+this.bass;}//endif
		}else if(this.form=="m7sus4(add7)"){
			this.form="m7sus4"; if(this.bass==this.root){this.fullname=this.root+this.form;}else{this.fullname=this.root+this.form+"/"+this.bass;}//endif
		}else if(this.form=="7(b9)"){
			this.form="7(addb9)"; if(this.bass==this.root){this.fullname=this.root+this.form;}else{this.fullname=this.root+this.form+"/"+this.bass;}//endif
		}else if(this.form=="(add2)"){
			this.form="(add9)"; if(this.bass==this.root){this.fullname=this.root+this.form;}else{this.fullname=this.root+this.form+"/"+this.bass;}//endif
		}else if(this.form=="m(add2)"){
			this.form="m(add9)"; if(this.bass==this.root){this.fullname=this.root+this.form;}else{this.fullname=this.root+this.form+"/"+this.bass;}//endif
		}else if(this.form=="m(9)"){
			this.form="m9"; if(this.bass==this.root){this.fullname=this.root+this.form;}else{this.fullname=this.root+this.form+"/"+this.bass;}//endif
		}else if(this.form=="(11)"){
			this.form="11"; if(this.bass==this.root){this.fullname=this.root+this.form;}else{this.fullname=this.root+this.form+"/"+this.bass;}//endif
		}else if(this.form=="m(11)"){
			this.form="m11"; if(this.bass==this.root){this.fullname=this.root+this.form;}else{this.fullname=this.root+this.form+"/"+this.bass;}//endif
		}else if(this.form=="69(add9)"){
			this.form="6(add9)"; if(this.bass==this.root){this.fullname=this.root+this.form;}else{this.fullname=this.root+this.form+"/"+this.bass;}//endif
		}else if(this.form=="N.C." || this.form=="(N.C.)"){
			this.form="NC"; this.fullname="NC"; this.root="R"; this.bass="R";
		}//endif

//cout<<"fullname,root,form,bass:\t"<<fullname<<"\t"<<root<<"\t"<<form<<"\t"<<bass<<endl;
		this.SetPcset();
	}//end InitFromFullname

	WriteFullname(){
		if(this.root=="R"){this.fullname="NC"; return;}
		if(this.bass!=this.root){
			this.fullname=this.root+this.form+"/"+this.bass;
		}else{
			this.fullname=this.root+this.form;
		}//endif
	}//end WriteFullname

	Transpose(tonicTo){//new tonic = prev toni + tonicTo
		if(tonicTo==0 || this.root=="R"){return;}
		let newRootPC=(SitchClassToPitchClass(this.root)+tonicTo+120)%12;
		let newBassPC=(SitchClassToPitchClass(this.bass)+tonicTo+120)%12;
		this.root=PitchClassToSitchClass(newRootPC);
		this.bass=PitchClassToSitchClass(newBassPC);
		this.WriteFullname();
	}//end Transpose

	TransposeFifth(degreeDiff){//new degree = prev degree + degreeDiff
		if(degreeDiff==0 || this.root=="R"){return;}
		this.root=PytchClassToSitchClass(SitchClassToPytchClass(this.root)+degreeDiff);
		this.bass=PytchClassToSitchClass(SitchClassToPytchClass(this.bass)+degreeDiff);
		this.WriteFullname();
	}//end TransposeFifth

	FormToPcset(form_){
		let vi=[];
		if(form_=="NC"){
		}else if(form_==""){
			vi=[0,4,7];
		}else if(form_=="m"){
			vi=[0,3,7];
		}else if(form_=="7"){
			vi=[0,4,7,10];
		}else if(form_=="dim"){
			vi=[0,3,6];
		}else if(form_=="aug"){
			vi=[0,4,8];
		}else if(form_=="M7"){
			vi=[0,4,7,11];
		}else if(form_=="m7"){
			vi=[0,3,7,10];
		}else if(form_=="mM7"){
			vi=[0,3,7,11];
		}else if(form_=="m7(b5)"){//=half-diminished, tristan chord
			vi=[0,3,6,10];
		}else if(form_=="aug7"){
			vi=[0,4,8,11];
		}else if(form_=="dim7"){
			vi=[0,3,6,9];
		}else if(form_=="sus4"){
			vi=[0,5,7];
		}else if(form_=="6"){
			vi=[0,4,7,9];
		}else if(form_=="9"){
			vi=[0,2,4,7,10];
		}else if(form_=="M9"){
			vi=[0,2,4,7,11];
		}else if(form_=="m9"){
			vi=[0,2,3,7,10];
		}else if(form_=="(add9)"){
			vi=[0,2,4,7];
		}else if(form_=="7sus4" || form_=="sus47"){
			vi=[0,5,7,10];
		}else{
			vi=[0];
		}//endif
		return vi;
	}//end FormToPcset

	SetPcset(){
		this.pcset=this.FormToPcset(this.form);
		if(this.fullname=="NC"){this.pcset.clear(); this.pcsetOrdered.clear(); return;}
		let rootPitch=SitchClassToPitchClass(this.root);
		for(let k=0;k<this.pcset.length;k+=1){
			this.pcset[k]=(this.pcset[k]+rootPitch)%12;
		}//endfor k
		this.pcsetOrdered=this.pcset;
		this.pcset.sort();
	}//end SetPcset

	CheckKnownChordType(){
		let ret=0;//0:known, 1:unknown
		if(this.form=="" || this.form=="m" || this.form=="dim" || this.form=="aug"){
		}else if(this.form=="7" || this.form=="M7" || this.form=="m7" || this.form=="dim7" || this.form=="aug7" || this.form=="mM7" || this.form=="m7(b5)"){
		}else if(this.form=="9" || this.form=="m9" || this.form=="M9" || this.form=="6" || this.form=="m6" || this.form=="sus4" || this.form=="7sus4" || this.form=="11" || this.form=="m11"){
		}else if(this.form=="13" || this.form=="7(b5)" || this.form=="m13" || this.form=="6(add9)" || this.form=="sus4(add9)" || this.form=="aug9"){
		}else if(this.form=="7(addb9)" || this.form=="aug9" || this.form=="(add9)" || this.form=="sus2" || this.form=="9(b5)" || this.form=="9(#5)"){
		}else if(this.form=="m(#5)" || this.form=="7(add#9)" || this.form=="7(add#11)" || this.form=="7(#5)" || this.form=="7(addb13)" || this.form=="9(add#11)"){
		}else if(this.form=="NC" || this.form=="M7(#5)" || this.form=="13(b9)" || this.form=="m7(add11)" || this.form=="M7(add#11)" || this.form=="m7(#5)"){
		}else if(this.form=="M7(b5)" || this.form=="M13" || this.form=="13(b5)" || this.form=="m9(b5)" || this.form=="sus4(add13)" || this.form=="M9(add#11)"){
		}else if(this.form=="(omit3)" || this.form=="m(add9)" || this.form=="7(add13)" || this.form=="7(add11)" || this.form=="(b5)" || this.form=="m7sus4"){
//		}else if(this.form=="" || this.form=="" || this.form=="" || this.form=="" || this.form=="" || this.form==""){
		}else{
			ret=1;
//console.log("Unknown chord type:\t"+this.form+"\t"+this.fullname);
		}//endif
		return ret;
	}//end CheckKnownChordType

}//endclass ChordSymbol










