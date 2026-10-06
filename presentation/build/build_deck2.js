const fs=require('fs'),path=require('path');
const pptxgen=require('pptxgenjs');
const React=require('react'),RDS=require('react-dom/server'),sharp=require('sharp');
const {FaBook,FaCode,FaChartLine,FaSearch,FaCheckCircle,FaExclamationTriangle,FaRocket}=require('react-icons/fa');
const SK=process.argv[2];const {applyTheme}=require(path.join(SK,'scripts/apply_theme.js'));
const OUT=process.argv[3];
const THEME={name:"QCNN",headFontFace:"Times New Roman",bodyFontFace:"Times New Roman",
 colors:{dk1:"212121",lt1:"FFFFFF",dk2:"455A64",lt2:"ECEFF1",accent1:"C62828",accent2:"FDECEA",accent3:"90A4AE",accent4:"8E1B1B",accent5:"2E7D32",accent6:"CFD8DC",hlink:"C62828",folHlink:"455A64"}};
const pres=new pptxgen();pres.layout='LAYOUT_4x3';pres.theme={headFontFace:THEME.headFontFace,bodyFontFace:THEME.bodyFontFace};
pres.title="Quantum Face Recognition with MG-QCNN – Mid-Semester";pres.author="Subrata Lodh, Yesh Agarwal";
const C=pres.SchemeColor;const S=pres.ShapeType;
const F=n=>path.join(__dirname,'fig',n);
const icon=async(Icon,color="FFFFFF")=>{const svg=RDS.renderToStaticMarkup(React.createElement(Icon,{color:"#"+color,size:256}));const b=await sharp(Buffer.from(svg)).png().toBuffer();return "image/png;base64,"+b.toString('base64');};
pres.defineSlideMaster({title:"CONTENT",background:{color:C.background1},
 objects:[{placeholder:{options:{name:"title",type:"title",x:0.5,y:0.3,w:9,h:0.8,fontSize:30,bold:true,align:"center",valign:"middle",color:C.text1,margin:0},text:""}}],
 slideNumber:{x:9.0,y:7.08,w:0.5,h:0.3,fontSize:10,color:"455A64"}});
pres.defineSlideMaster({title:"TITLE_SLIDE",background:{color:C.background1},
 objects:[{placeholder:{options:{name:"title",type:"title",x:0.6,y:2.05,w:8.8,h:1.8,fontSize:30,bold:true,align:"center",valign:"middle",color:C.text1,margin:0},text:""}}]});
// ---------- helpers ----------
const R=(t,o={})=>({text:t,options:o});
function tx(s,content,o){s.addText(content,{isTextBox:true,margin:o.margin??4,valign:o.valign||"middle",align:o.align||"left",fontSize:o.size||14,bold:o.bold,italic:o.italic,color:o.color||C.text1,x:o.x,y:o.y,w:o.w,h:o.h,paraSpaceAfter:o.psa,objectName:o.name,breakLine:o.breakLine,lineSpacingMultiple:o.lsm});}
function card(s,x,y,w,h,fill=C.background2,name){s.addShape(S.roundRect,{x,y,w,h,fill:{color:fill},line:{color:fill,width:0},rectRadius:0.08,objectName:name||"card"});}
function stat(s,x,y,w,h,big,label,o={}){const dark=o.dark,pink=o.pink;card(s,x,y,w,h,dark?C.text2:(pink?C.accent2:C.background2),"stat card");
 tx(s,big,{x,y:y+0.08,w,h:h*0.5,size:o.bigSize||28,bold:true,color:dark?C.background1:C.accent1,align:"center",name:"stat value"});
 tx(s,label,{x:x+0.1,y:y+h*0.52,w:w-0.2,h:h*0.44,size:o.labSize||12,color:dark?C.background1:C.text2,align:"center",valign:"top",name:"stat label"});}
function strip(s,x,y,w,h,runs,o={}){card(s,x,y,w,h,C.accent2,"note strip");tx(s,runs,{x:x+0.15,y,w:w-0.3,h,size:o.size||14,name:"note"});}
function img(s,file,x,y,w){const b=fs.readFileSync(F(file));const iw=b.readUInt32BE(16),ih=b.readUInt32BE(20);s.addImage({path:F(file),x,y,w,h:w*ih/iw,altText:o_alt(file)});return w*ih/iw;}
const o_alt=f=>({"s_scaling.png":"Illustrative pixel scaling comparison","s_filter.png":"Filter response plots","s_seeds.png":"Per-seed accuracy distribution","s_yale.png":"Yale tuning and augmentation results","s_cost.png":"Circuit cost and shot noise","circuit.png":"Four-qubit filter circuit","train.png":"ORL training curves","seedlines.png":"Per-seed accuracy min-max versus Gaussian","cm_orl.png":"ORL confusion matrix","cm_yale.png":"Yale confusion matrix"}[f]||f);
function chev(s,labels,x,y,w,h,hi,o={}){const n=labels.length,step=(w+0.0)/n;labels.forEach((l,i)=>{s.addShape(i===0?S.pentagon:S.chevron,{x:x+i*step,y,w:step+0.12,h,fill:{color:i===hi?C.accent1:C.text2},line:{color:C.background1,width:1.5},objectName:"step "+(i+1)});
 tx(s,l,{x:x+i*step+(i===0?0.05:0.22),y,w:step-(i===0?0.2:0.3),h,size:o.size||13,bold:true,color:C.background1,align:"center"});});}
function ioBand(s,y,inp,comp,out){const h=1.0;
 card(s,0.5,y,2.9,h,C.background2,"input card");tx(s,"INPUT",{x:0.6,y:y+0.04,w:2.7,h:0.25,size:10,bold:true,color:C.accent1});tx(s,inp[0],{x:0.6,y:y+0.28,w:2.7,h:0.38,size:14,bold:true});tx(s,inp[1],{x:0.6,y:y+0.64,w:2.7,h:0.32,size:11,color:C.text2,valign:"top"});
 s.addShape(S.rightArrow,{x:3.45,y:y+0.35,w:0.35,h:0.3,fill:{color:C.accent3},line:{color:C.accent3,width:0},objectName:"arrow"});
 card(s,3.85,y,2.3,h,C.accent1,"component card");tx(s,comp[0],{x:3.9,y:y+0.1,w:2.2,h:0.45,size:15,bold:true,color:C.background1,align:"center"});tx(s,comp[1],{x:3.9,y:y+0.52,w:2.2,h:0.42,size:11,color:C.background1,align:"center",valign:"top"});
 s.addShape(S.rightArrow,{x:6.2,y:y+0.35,w:0.35,h:0.3,fill:{color:C.accent3},line:{color:C.accent3,width:0},objectName:"arrow"});
 card(s,6.6,y,2.9,h,C.accent2,"output card");tx(s,"OUTPUT",{x:6.7,y:y+0.04,w:2.7,h:0.25,size:10,bold:true,color:C.accent1});tx(s,out[0],{x:6.7,y:y+0.28,w:2.7,h:0.38,size:14,bold:true});tx(s,out[1],{x:6.7,y:y+0.64,w:2.7,h:0.32,size:11,color:C.text2,valign:"top"});}
function newSlide(title,notes){const s=pres.addSlide({masterName:"CONTENT"});s.addText(title,{placeholder:"title"});if(notes)s.addNotes(notes);return s;}
const SUB=(b,sub,o={})=>[R(b,{italic:true,...o}),R(sub,{subscript:true,italic:true,...o})];

(async()=>{
const ic={book:await icon(FaBook),code:await icon(FaCode),chart:await icon(FaChartLine),search:await icon(FaSearch),ok:await icon(FaCheckCircle,"2E7D32"),warn:await icon(FaExclamationTriangle,"C62828"),rocket:await icon(FaRocket,"C62828"),rocketW:await icon(FaRocket,"FFFFFF")};
const bl=(arr,ps=8)=>arr.map((t,k)=>R(t,{bullet:{indent:14},breakLine:k<arr.length-1,paraSpaceAfter:ps}));
// ===== 1 Title =====
{const s=pres.addSlide({masterName:"TITLE_SLIDE"});
 s.addImage({path:path.join(__dirname,'logo.png'),x:4.3,y:0.45,w:1.4,h:1.4,altText:"NIT Silchar logo"});
 s.addText("Quantum Face Recognition with Multi-Gate Quantum Convolutional Neural Network",{placeholder:"title"});
 tx(s,"B. Tech. Project Mid-Semester Evaluation",{x:0.6,y:4.1,w:8.8,h:0.5,size:20,bold:true,color:C.accent1,align:"center"});
 tx(s,"Subrata Lodh (2314051)  |  Yesh Agarwal (2314080)",{x:0.6,y:4.85,w:8.8,h:0.45,size:17,align:"center"});
 tx(s,"Supervisor: Dr. Banani Basu",{x:0.6,y:5.3,w:8.8,h:0.45,size:17,align:"center"});
 tx(s,"Department of Electronics and Communication Engineering",{x:0.6,y:6.05,w:8.8,h:0.4,size:14,color:C.text2,align:"center"});
 tx(s,"National Institute of Technology Silchar, Assam (India) - 788010",{x:0.6,y:6.4,w:8.8,h:0.4,size:14,color:C.text2,align:"center"});}
// ===== 2 Intro & Problem =====
{const s=newSlide("Introduction & Problem Statement","Why: face recognition is everywhere and deep CNNs are costly. Quantum ML is a promising alternative, but today's devices have only a handful of qubits, so a face image cannot be loaded pixel by pixel. Problem: recognise faces with a quantum model that needs very few qubits.");
 const rows=[[ic.book,"Why it matters","Face recognition is used in banking, security and government services"],[ic.chart,"Why a new approach","Deep CNNs are near-human (DeepFace: 97.35% on LFW) but need ever more compute"],[ic.rocketW,"Why quantum","Quantum machine learning promises more efficient learning with far fewer trainable resources"]];
 rows.forEach((r,i)=>{const y=1.3+i*1.1;card(s,0.5,y,4.9,0.98,C.background2,"reason card");s.addShape(S.ellipse,{x:0.62,y:y+0.2,w:0.58,h:0.58,fill:{color:i===2?C.accent1:C.text2},line:{color:C.background1,width:0},objectName:"icon disc"});
  s.addImage({data:r[0],x:0.76,y:y+0.34,w:0.3,h:0.3,altText:r[1]+" icon"});tx(s,r[1],{x:1.35,y:y+0.05,w:3.95,h:0.35,size:15,bold:true,color:C.accent1});tx(s,r[2],{x:1.35,y:y+0.38,w:3.95,h:0.58,size:12.5,valign:"top"});});
 card(s,5.6,1.3,3.9,3.18,C.accent2,"chart card");tx(s,"The catch: qubits",{x:5.7,y:1.35,w:3.7,h:0.4,size:15,bold:true,color:C.accent1});
 s.addChart(pres.charts.BAR,[{name:"Qubits",labels:["Available (IBM)","Needed: 1 per pixel"],values:[27,2304]}],{x:5.65,y:1.75,w:3.8,h:2.7,barDir:"col",chartColors:["455A64","C62828"],showValue:true,dataLabelColor:"212121",dataLabelFontSize:13,dataLabelFontFace:"+mn-lt",dataLabelFormatCode:"#,##0",catAxisLabelColor:"212121",catAxisLabelFontSize:12,catAxisLabelFontFace:"+mn-lt",valAxisHidden:true,valGridLine:{style:"none"},catGridLine:{style:"none"},showLegend:false,valAxisMaxVal:2700,barGapWidthPct:60,invertedColors:["455A64"]});
 card(s,0.5,4.7,9.0,2.2,C.accent1,"problem statement");
 tx(s,"Problem statement",{x:0.7,y:4.8,w:8.6,h:0.45,size:17,bold:true,color:C.background1});
 tx(s,"Today’s noisy quantum devices offer only 5–27 reliable qubits, but a 48×48 face image has 2,304 pixels. How can faces be recognised with a quantum model that needs only a handful of qubits, and how well does it work?",{x:0.7,y:5.25,w:8.6,h:1.55,size:18,color:C.background1,valign:"top"});}
// ===== 3 Objectives =====
{const s=newSlide("Objectives","Four objectives: study, implement, evaluate, analyse.");
 const items=[[ic.book,"Study quantum ML","Angle encoding, variational circuits, quanvolution"],[ic.code,"Implement the MG-QCNN","PennyLane + PyTorch, with an analytical model of the filter"],[ic.chart,"Evaluate on ORL and Yale","10 random 70:30 splits, 1000 measurement shots"],[ic.search,"Analyse the design","Gates, entanglement, filter size, shot noise, hardware cost"]];
 items.forEach((it,i)=>{const x=0.5+(i%2)*4.6,y=1.4+Math.floor(i/2)*2.75;card(s,x,y,4.4,2.5,C.background2,"objective card");
  s.addShape(S.ellipse,{x:x+0.3,y:y+0.35,w:0.95,h:0.95,fill:{color:C.accent1},line:{color:C.accent1,width:0},objectName:"icon disc"});
  s.addImage({data:it[0],x:x+0.52,y:y+0.57,w:0.51,h:0.51,altText:it[1]+" icon"});
  tx(s,String(i+1),{x:x+3.5,y:y+0.2,w:0.7,h:0.6,size:32,bold:true,color:C.accent3,align:"right"});
  tx(s,it[1],{x:x+0.3,y:y+1.4,w:3.8,h:0.45,size:19,bold:true,color:C.accent1});
  tx(s,it[2],{x:x+0.3,y:y+1.85,w:3.8,h:0.55,size:14,valign:"top"});});}
// ===== 4 Literature =====
{const s=newSlide("Literature Review","Three strands; the MG-QCNN combines fixed circuit, trainable rotations, entanglement, all-qubit measurement and a sliding 2x2 filter.");
 const cols=[["Classical face recognition",["Gabor + KNN/SVM gave way to deep CNNs","High accuracy, heavy computation","Compute demand outgrows hardware"]],["Variational circuits",["Rotation angles act as weights","Trained by gradient descent","Barren plateaus favour small, fixed circuits"]],["Quantum convolution",["Henderson: random, fixed filter","Mattern: trainable but random","Oh: fixed, one measured qubit","MG-QCNN: fixed, trainable, all 4 qubits measured"]]];
 cols.forEach((c,i)=>{const x=0.5+i*3.05;card(s,x,1.35,2.9,3.95,i===2?C.accent2:C.background2,"column card");
  tx(s,c[0],{x:x+0.1,y:1.45,w:2.7,h:0.7,size:17,bold:true,color:C.accent1});
  tx(s,bl(c[1]),{x:x+0.1,y:2.2,w:2.7,h:3.0,size:15,valign:"top"});});
 strip(s,0.5,5.5,9.0,1.25,[R("Research gap:  ",{bold:true,color:C.accent1}),R("small datasets, noise-free simulation and no hardware test in the reference work. We add an independent implementation, an analytical model of the filter and a cost and noise analysis.")],{size:15});}
// ===== 5 Overview architecture =====
{const s=newSlide("Proposed Methodology: Overview Architecture","Five components. Each takes the previous output as input. Quantum part: circuit and measurement with 8 shared parameters. Classical part: pre-processing, patch extraction, classifier.");
 const comps=[["1  Pre-process","raw image","48×48 angles",0],["2  Patch extraction","48×48 angles","576 × 4 values",0],["3  Quantum circuit","4 angles","4-qubit state",1],["4  Measurement","4-qubit state","4 values f₀…f₃",1],["5  Classifier","24×24×4 = 2,304","40 / 15 probabilities",0]];
 comps.forEach((c,i)=>{const x=0.5+i*1.85,q=c[3];card(s,x,1.35,1.55,0.95,q?C.accent1:C.text2,"component");
  tx(s,c[0],{x,y:1.4,w:1.55,h:0.85,size:14,bold:true,color:C.background1,align:"center"});
  if(i<4)s.addShape(S.rightArrow,{x:x+1.58,y:1.68,w:0.24,h:0.26,fill:{color:C.accent3},line:{color:C.accent3,width:0},objectName:"arrow"});
  card(s,x,2.5,1.55,0.62,C.background2,"in");tx(s,[R("IN  ",{bold:true,color:C.accent1,fontSize:10}),R(c[1],{fontSize:12})],{x:x+0.03,y:2.5,w:1.5,h:0.62,size:12});
  card(s,x,3.2,1.55,0.62,C.accent2,"out");tx(s,[R("OUT  ",{bold:true,color:C.accent1,fontSize:10}),R(c[2],{fontSize:12})],{x:x+0.03,y:3.2,w:1.5,h:0.62,size:12});});
 tx(s,"quantum part: 4 qubits, 8 trainable parameters shared by all patches",{x:0.5+2*1.85,y:3.9,w:3.4,h:0.5,size:12,italic:true,color:C.accent1,align:"center"});
 const cd=[["Tools","PennyLane (quantum circuit), PyTorch (training); Kaggle notebooks"],["Datasets","ORL: 400 images, 40 subjects · Yale: 165 images, 15 subjects"],["Evaluation","10 random 70:30 splits, 1000 measurement shots"]];
 cd.forEach((c,i)=>{const x=0.5+i*3.05;card(s,x,4.65,2.9,1.45,C.background2,"info");tx(s,c[0],{x:x+0.1,y:4.7,w:2.7,h:0.4,size:16,bold:true,color:C.accent1});tx(s,c[1],{x:x+0.1,y:5.1,w:2.7,h:0.95,size:13.5,valign:"top"});});
 strip(s,0.5,6.3,9.0,0.6,[R("Next: one slide per component, each with its input and output",{bold:true,color:C.accent1})],{size:15});}
// ===== 6 Pre-processing =====
{const s=newSlide("Component 1: Data Pre-processing","Grayscale, resize to 48x48, per-image min-max to [-1,1], times pi. Yale also gets a centre square crop then an 85% centre crop. Min-max beat Gaussian z-score on all 10 ORL seeds (94.67 vs 91.50). Figure is illustrative with synthetic gray levels.");
 ioBand(s,1.25,["Raw gray image","ORL 92×112 · Yale 320×243"],["Pre-process","grayscale · resize · scale"],["48×48 angle matrix","each pixel in [−π, π]"]);
 img(s,"s_scaling.png",0.5,2.4,9.0);
 stat(s,0.5,5.2,2.85,1.15,"94.67%","ORL accuracy with min–max scaling",{bigSize:28});
 stat(s,3.575,5.2,2.85,1.15,"91.50%","ORL accuracy with Gaussian z-score",{bigSize:28});
 stat(s,6.65,5.2,2.85,1.15,"10 / 10","seeds won by min–max (+3.17 pts)",{pink:true,bigSize:28});
 strip(s,0.5,6.45,9.0,0.55,[R("Illustrative (synthetic gray levels): ",{bold:true,color:C.accent1}),R("clipped z-scores pile about a third of pixels at ±π.")],{size:13});}
// ===== 7 Patch extraction =====
{const s=newSlide("Component 2: Patch Extraction","A 2x2 window slides with stride 2: 24 x 24 = 576 non-overlapping patches, each flattened row-major into (x0, x1, x2, x3).");
 ioBand(s,1.25,["48×48 angle matrix","2,304 values"],["Patch extraction","2×2 window, stride 2"],["576 patches × 4 values","(x₀, x₁, x₂, x₃) each"]);
 const gx=0.9,gy=2.65,cs=0.36,n=8;const pc={"0,0":C.accent1,"0,1":C.text2,"1,0":C.accent3,"1,1":C.accent6};
 for(let r=0;r<n;r++)for(let c=0;c<n;c++){const k=`${Math.floor(r/2)},${Math.floor(c/2)}`;const col=pc[k];s.addShape(S.rect,{x:gx+c*cs,y:gy+r*cs,w:cs,h:cs,fill:{color:col||C.background2},line:{color:C.background1,width:1},objectName:col?"patch cell":"pixel"});}
 tx(s,"48×48 image (grid simplified)",{x:gx-0.3,y:gy+n*cs+0.03,w:n*cs+0.6,h:0.35,size:12,color:C.text2,align:"center"});
 s.addShape(S.rightArrow,{x:4.3,y:4.15,w:0.55,h:0.4,fill:{color:C.accent3},line:{color:C.accent3,width:0},objectName:"arrow"});
 const pl=[["patch 1",C.accent1],["patch 2",C.text2],["patch 3",C.accent3],["patch 4",C.accent6]];
 pl.forEach((p,i)=>{const y=2.7+i*0.72;s.addShape(S.rect,{x:5.0,y,w:0.35,h:0.55,fill:{color:p[1]},line:{color:p[1],width:0},objectName:"swatch"});card(s,5.4,y,4.1,0.55,C.background2,"patch row");tx(s,[R(p[0]+"  →  ("),R("x",{italic:true}),R("0",{subscript:true,italic:true}),R(", x"),R("1",{subscript:true}),R(", x"),R("2",{subscript:true}),R(", x"),R("3",{subscript:true}),R(")")],{x:5.5,y,w:3.9,h:0.55,size:14});});
 tx(s,"⋮  576 patches in total",{x:5.0,y:5.6,w:4.5,h:0.4,size:14,color:C.text2,italic:true});
 strip(s,0.5,6.2,9.0,0.7,[R("24 × 24 = 576 patches.  ",{bold:true,color:C.accent1}),R("Each patch has 4 pixels, so 4 qubits are enough whatever the image size.")],{size:15});}
// ===== 8 Quantum circuit =====
{const s=newSlide("Component 3: Quantum Circuit","Encode each pixel as an RY rotation on its own qubit, apply trainable RZ and RX rotations (8 parameters, shared by all patches), then entangle neighbours with a CNOT chain. 15 gates, depth 6, fixed (not random).");
 ioBand(s,1.25,["4 angles x₀…x₃","one patch"],["Quantum circuit","4 qubits · 15 gates"],["Entangled 4-qubit state","depends on all 4 pixels"]);
 img(s,"circuit.png",1.4,2.4,7.2);
 const t=[["Encode","RY(xᵢ) turns pixel i into a rotation"],["Train","RZ, RX: 8 parameters θ"],["Entangle","CNOT chain 0→1→2→3"]];
 t.forEach((c,i)=>{const x=0.5+i*3.05;card(s,x,5.4,2.9,1.45,i===1?C.accent2:C.background2,"tag");tx(s,c[0],{x,y:5.45,w:2.9,h:0.45,size:17,bold:true,color:C.accent1,align:"center"});tx(s,c[1],{x:x+0.1,y:5.95,w:2.7,h:0.8,size:14,align:"center",valign:"top"});});}
// ===== 9 Measurement =====
{const s=newSlide("Component 4: Measurement","Measure Pauli-Z on every qubit. Closed form: s_i = cos(th_2i+1) cos(x_i) + sin(th_2i+1) sin(th_2i) sin(x_i); f_k = s_0 ... s_k. Verified against the full simulation to 7e-16. At test time 1000 shots give std <= 0.032.");
 ioBand(s,1.25,["Entangled 4-qubit state","from the circuit"],["Measurement","Pauli-Z on all 4 qubits"],["4 values f₀…f₃","each in [−1, 1]"]);
 card(s,0.5,2.4,9.0,1.35,C.accent2,"equation card");
 tx(s,[R("one qubit:  ",{color:C.text2,fontSize:13}),...SUB("s","i"),R(" = cos θ",{italic:true}),R("2i+1",{subscript:true,italic:true}),R(" cos ",{italic:true}),...SUB("x","i"),R(" + sin θ",{italic:true}),R("2i+1",{subscript:true,italic:true}),R(" sin θ",{italic:true}),R("2i",{subscript:true,italic:true}),R(" sin ",{italic:true}),...SUB("x","i")],{x:0.65,y:2.45,w:8.7,h:0.55,size:16});
 tx(s,[R("with CNOTs:  ",{color:C.text2,fontSize:13}),...SUB("f","k",{bold:true,color:C.accent1}),R(" = ",{bold:true,color:C.accent1}),...SUB("s","0",{bold:true,color:C.accent1}),...SUB("s","1",{bold:true,color:C.accent1}),R(" ⋯ ",{bold:true,color:C.accent1}),...SUB("s","k",{bold:true,color:C.accent1}),R("     f₀ sees 1 pixel, f₃ sees all 4",{color:C.text2,fontSize:13})],{x:0.65,y:3.0,w:8.7,h:0.65,size:24});
 img(s,"s_filter.png",0.9,3.9,8.2);
 strip(s,0.5,6.3,9.0,0.6,[R("Verified: ",{bold:true,color:C.accent1}),R("closed form matches the full simulation to 7×10⁻¹⁶; 1000 shots add at most 0.032 noise.")],{size:14});}
// ===== 10 Classifier =====
{const s=newSlide("Component 5: Classifier","All 576 patches x 4 values = 2,304 features are flattened into a linear layer with softmax. Trained with cross-entropy and Adam (lr 1e-3). Parameters: 8 quantum + 2,304x40+40 = 92,200 classical on ORL; 8 + 34,575 on Yale.");
 ioBand(s,1.25,["24×24×4 feature maps","2,304 values"],["Classifier","flatten → FC → softmax"],["Class probabilities","40 (ORL) or 15 (Yale)"]);
 [0,1,2,3].forEach(k=>s.addShape(S.rect,{x:0.9+k*0.2,y:3.05-k*0.2,w:1.2,h:1.2,fill:{color:[C.accent6,C.accent3,C.text2,C.accent1][k]},line:{color:C.background1,width:1},objectName:"feature map "+(k+1)}));
 tx(s,"24×24×4",{x:0.7,y:4.35,w:1.9,h:0.35,size:13,color:C.text2,align:"center"});
 s.addShape(S.rightArrow,{x:2.85,y:3.2,w:0.4,h:0.35,fill:{color:C.accent3},line:{color:C.accent3,width:0},objectName:"arrow"});
 card(s,3.4,2.5,0.7,2.2,C.text2,"flatten");tx(s,"2,304",{x:3.4,y:3.2,w:0.7,h:0.8,size:12,bold:true,color:C.background1,align:"center"});tx(s,"flatten",{x:3.15,y:4.7,w:1.2,h:0.3,size:12,color:C.text2,align:"center"});
 s.addShape(S.rightArrow,{x:4.25,y:3.2,w:0.4,h:0.35,fill:{color:C.accent3},line:{color:C.accent3,width:0},objectName:"arrow"});
 card(s,4.8,2.5,1.5,2.2,C.accent1,"fc layer");tx(s,"Linear layer",{x:4.8,y:2.7,w:1.5,h:0.5,size:14,bold:true,color:C.background1,align:"center"});tx(s,"2,304 → 40 (15)",{x:4.8,y:3.3,w:1.5,h:0.8,size:12,color:C.background1,align:"center"});
 s.addShape(S.rightArrow,{x:6.45,y:3.2,w:0.4,h:0.35,fill:{color:C.accent3},line:{color:C.accent3,width:0},objectName:"arrow"});
 [0.5,0.8,2.0,0.6,0.35].forEach((v,i)=>{s.addShape(S.rect,{x:7.05+i*0.45,y:4.7-v,w:0.32,h:v,fill:{color:i===2?C.accent1:C.accent3},line:{color:i===2?C.accent1:C.accent3,width:0},objectName:"probability bar"});});
 tx(s,"softmax probabilities",{x:6.95,y:4.75,w:2.4,h:0.3,size:12,color:C.text2,align:"center"});
 const cd=[["Loss","softmax cross-entropy"],["Optimiser","Adam, learning rate 10⁻³"],["Trainable","8 quantum + 92,200 classical (ORL)"]];
 cd.forEach((c,i)=>{const x=0.5+i*3.05;card(s,x,5.35,2.9,1.25,i===2?C.accent2:C.background2,"info");tx(s,c[0],{x,y:5.4,w:2.9,h:0.45,size:16,bold:true,color:C.accent1,align:"center"});tx(s,c[1],{x:x+0.1,y:5.85,w:2.7,h:0.9,size:14,align:"center",valign:"top"});});}
// ===== 11 Training =====
{const s=newSlide("Training the Quantum Parameters","Hardware needs the parameter-shift rule: 17 runs per patch, 9,792 per image per step, 8.2e7 for one ORL run. Simulator backpropagation gives the same gradient (mismatch 2.2e-15) in one pass, so it is used for training.");
 ioBand(s,1.25,["Loss L","from the predictions"],["Gradient step","backprop (simulator)"],["Updated parameters","8 θ + classical weights"]);
 img(s,"s_cost.png",1.4,2.4,7.2);
 card(s,0.5,4.85,9.0,0.8,C.accent2,"formula card");
 tx(s,[R("∂f/∂θ = ½ [ f(θ + π/2) − f(θ − π/2) ]",{bold:true,color:C.accent1})],{x:0.6,y:4.85,w:4.7,h:0.8,size:18,align:"center"});
 tx(s,"parameter shift on hardware: two extra runs per parameter; backprop gives the same gradient in one pass",{x:5.4,y:4.85,w:4.0,h:0.8,size:12.5,color:C.text2});
 [["17","runs per patch"],["9,792","runs per image per step"],["8.2×10⁷","runs, one ORL training"],["2.2×10⁻¹⁵","gradient mismatch"]].forEach((t,i)=>stat(s,0.5+i*2.3,5.8,2.1,1.1,t[0],t[1],{pink:i===1||i===2,bigSize:i===3?20:24,labSize:11}));}
// ===== 12 Results ORL =====
{const s=newSlide("Results & Discussion: ORL","Ten random 70:30 splits, 1000-shot test: mean 94.667, max 97.5, std 1.675. Seed 0: loss 3.03 -> 0.0031, train accuracy 100% from epoch 3, test 95.83% from epoch 14. Min-max beats Gaussian on all 10 seeds (+3.17).");
 img(s,"train.png",0.5,1.3,5.5);
 img(s,"cm_orl.png",6.3,1.25,3.2);
 tx(s,"ORL confusion matrix, 10 seeds (1,200 predictions)",{x:6.15,y:4.25,w:3.5,h:0.5,size:11,color:C.text2,align:"center"});
 stat(s,0.5,3.55,2.7,1.15,"94.67%","mean test accuracy (max 97.50 · std 1.68)",{bigSize:28,labSize:11});
 stat(s,3.3,3.55,2.7,1.15,"100% → 95.83%","train from epoch 3 · test from epoch 14 (seed 0)",{pink:true,bigSize:20,labSize:11});
 card(s,0.5,4.95,9.0,1.75,C.background2,"discussion");tx(s,"Discussion",{x:0.65,y:5.0,w:3,h:0.4,size:16,bold:true,color:C.accent1});
 tx(s,bl(["Learns fast: test accuracy 63% → 92% in epoch 2, above 95% from epoch 7","Min–max scaling beats Gaussian on all 10 seeds (94.67% vs 91.50%)","Errors are scattered single confusions; the 4.17-point train–test gap shows some over-fitting"],7),{x:0.65,y:5.4,w:8.7,h:1.45,size:14,valign:"top"});}
// ===== 13 Results Yale =====
{const s=newSlide("Results & Discussion: Yale","Yale (15 subjects, 120 train / 45 test): mean 85.556, max 91.111, std 4.792, using a centre crop (85%), lr 1e-3, 60 epochs selected on a validation split. Augmentation lowered validation accuracy 77.8 -> 68.1 and widened the train-validation gap 22 -> 29 points. One test image = 2.22 points.");
 img(s,"s_yale2.png",0.5,1.25,9.0);
 img(s,"cm_yale.png",0.5,4.0,2.85);
 tx(s,"Yale confusion matrix (tuning run, 450 predictions)",{x:0.4,y:6.55,w:3.1,h:0.45,size:10,color:C.text2,align:"center"});
 stat(s,3.6,4.0,2.9,1.1,"85.56%","mean accuracy · max 91.11 · std 4.79",{bigSize:28,labSize:11});
 stat(s,6.6,4.0,2.9,1.1,"22 → 29 pts","train–validation gap with augmentation",{pink:true,bigSize:24,labSize:11});
 card(s,3.6,5.25,5.9,1.65,C.background2,"discussion");
 tx(s,bl(["Over-fits: 100% train accuracy on only 120 images","Augmentation did not help (validation 77.8 → 68.1%)","One test image = 2.22 points, so Yale varies more than ORL","Confusions: subjects 7, 8 read as 14; subject 5 as 13"],4),{x:3.7,y:5.3,w:5.7,h:1.55,size:12.5,valign:"top"});}
// ===== 14 Future work & conclusion =====
{const s=newSlide("Future Work & Conclusion","Achieved: pipeline, closed form verified, ORL 94.67%, Yale 85.56%. Limitations: noise-free simulation, Yale over-fitting, no ablation/noise study yet. Future: feature-extraction stage before the quantum layer so far fewer patches need circuit runs and real parameter-shift training becomes practical.");
 const cx=[0.5,3.55,6.6],cw=2.9;
 card(s,cx[0],1.3,cw,4.1,C.background2,"column");card(s,cx[1],1.3,cw,4.1,C.background2,"column");card(s,cx[2],1.3,cw,4.1,C.accent2,"column");
 s.addImage({data:ic.ok,x:cx[0]+0.15,y:1.42,w:0.4,h:0.4,altText:"check"});tx(s,"Achieved",{x:cx[0]+0.65,y:1.4,w:2.2,h:0.45,size:18,bold:true,color:C.accent5});
 tx(s,bl(["MG-QCNN built in PennyLane + PyTorch","Closed-form filter verified","ORL 94.67%, Yale 85.56%","Min–max beats Gaussian on all ORL seeds"],14),{x:cx[0]+0.1,y:1.95,w:2.7,h:3.3,size:16,valign:"top"});
 s.addImage({data:ic.warn,x:cx[1]+0.15,y:1.42,w:0.4,h:0.4,altText:"warning"});tx(s,"Limitations",{x:cx[1]+0.65,y:1.4,w:2.2,h:0.45,size:18,bold:true,color:C.accent1});
 tx(s,bl(["Noise-free simulation, not hardware","Yale over-fits: 100% train vs about 85% test","No ablation or noise study yet"],14),{x:cx[1]+0.1,y:1.95,w:2.7,h:3.3,size:16,valign:"top"});
 s.addImage({data:ic.rocket,x:cx[2]+0.15,y:1.42,w:0.4,h:0.4,altText:"rocket"});tx(s,"Future work",{x:cx[2]+0.65,y:1.4,w:2.2,h:0.45,size:18,bold:true,color:C.accent1});
 tx(s,"Add a feature-extraction stage before the quantum layer to cut the patches needing circuit runs",{x:cx[2]+0.1,y:1.95,w:2.7,h:1.1,size:15,valign:"top"});
 s.addChart(pres.charts.BAR,[{name:"Patches per image",labels:["Now","÷4","÷16"],values:[576,144,36]}],{x:cx[2]+0.05,y:3.05,w:2.8,h:2.3,barDir:"bar",chartColors:["C62828"],showValue:true,dataLabelColor:"212121",dataLabelFontSize:12,dataLabelFontFace:"+mn-lt",dataLabelPosition:"outEnd",catAxisLabelColor:"455A64",catAxisLabelFontSize:12,catAxisLabelFontFace:"+mn-lt",catAxisOrientation:"maxMin",valAxisHidden:true,valGridLine:{style:"none"},catGridLine:{style:"none"},showLegend:false,showTitle:true,title:"Patches per image",titleFontSize:12,titleFontFace:"+mn-lt",titleColor:"455A64",valAxisMaxVal:700,barGapWidthPct:45});
 card(s,0.5,5.6,9.0,1.3,C.accent1,"summary band");
 tx(s,[R("8 quantum parameters · ORL 94.67% · Yale 85.56%",{bold:true,color:C.background1,breakLine:true}),R("Fewer patches mean 4× to 16× fewer circuit runs and make real parameter-shift training practical.",{color:C.background1,fontSize:14})],{x:0.7,y:5.6,w:8.6,h:1.3,size:19,align:"center"});}
// ===== 15 References =====
{const s=newSlide("References","");
 const refs=["M. Wang, W. Deng, “Deep face recognition: A survey,” Neurocomputing, 2021.","N. C. Thompson et al., “The computational limits of deep learning,” arXiv:2007.05558, 2020.","J. Preskill, “Quantum computing in the NISQ era and beyond,” Quantum, 2018.","Y. Zhu et al., “Quantum face recognition with multigate quantum convolutional neural network,” IEEE Trans. Artif. Intell., 2024.","Y. LeCun et al., “Backpropagation applied to handwritten zip code recognition,” Neural Comput., 1989.","Y. Taigman et al., “DeepFace,” CVPR, 2014.","M. Cerezo et al., “Variational quantum algorithms,” Nat. Rev. Phys., 2021.","J. R. McClean et al., “Barren plateaus in quantum neural network training landscapes,” Nat. Commun., 2018.","Z. Holmes et al., “Connecting ansatz expressibility to gradient magnitudes and barren plateaus,” PRX Quantum, 2022.","I. Cong, S. Choi, M. D. Lukin, “Quantum convolutional neural networks,” Nat. Phys., 2019.","M. Henderson et al., “Quanvolutional neural networks,” Quantum Mach. Intell., 2020.","D. Mattern et al., “Variational quanvolutional neural networks with enhanced image encoding,” arXiv:2106.07327, 2021.","S. Oh, J. Choi, J. Kim, “A tutorial on quantum convolutional neural networks (QCNN),” ICTC, 2020.","S. Y.-C. Chen et al., “Quantum convolutional neural networks for high energy physics data analysis,” Phys. Rev. Res., 2022.","A. Senokosov et al., “Quantum machine learning for image classification,” arXiv:2304.09224, 2023.","T. Hur, L. Kim, D. K. Park, “Quantum convolutional neural network for classical data classification,” Quantum Mach. Intell., 2022.","F. S. Samaria, A. C. Harter, “Parameterisation of a stochastic model for human face identification,” WACV, 1994.","A. S. Georghiades et al., “From few to many,” FG, 2000.","D. P. Kingma, J. Ba, “Adam: A method for stochastic optimization,” ICLR, 2015.","V. Bergholm et al., “PennyLane,” arXiv:1811.04968, 2018.","A. Paszke et al., “PyTorch,” NeurIPS, 2019.","K. Mitarai et al., “Quantum circuit learning,” Phys. Rev. A, 2018.","M. Schuld et al., “Evaluating analytic gradients on quantum hardware,” Phys. Rev. A, 2019."];
 const half=12;[refs.slice(0,half),refs.slice(half)].forEach((col,ci)=>{tx(s,col.map((t,k)=>R(`[${ci*half+k+1}] ${t}`,{breakLine:k<col.length-1,paraSpaceAfter:6})),{x:0.5+ci*4.6,y:1.3,w:4.4,h:5.6,size:11,valign:"top"});});}
await pres.writeFile({fileName:OUT});
await applyTheme(OUT,THEME);
console.log("ok");})();
