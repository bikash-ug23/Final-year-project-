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
function newSlide(title,notes){const s=pres.addSlide({masterName:"CONTENT"});s.addText(title,{placeholder:"title"});if(notes)s.addNotes(notes);return s;}
const SUB=(b,sub,o={})=>[R(b,{italic:true,...o}),R(sub,{subscript:true,italic:true,...o})];

(async()=>{
const ic={book:await icon(FaBook),code:await icon(FaCode),chart:await icon(FaChartLine),search:await icon(FaSearch),ok:await icon(FaCheckCircle,"2E7D32"),warn:await icon(FaExclamationTriangle,"C62828"),rocket:await icon(FaRocket,"C62828")};
// ===== 1 Title =====
{const s=pres.addSlide({masterName:"TITLE_SLIDE"});
 s.addImage({path:path.join(__dirname,'logo.png'),x:4.3,y:0.45,w:1.4,h:1.4,altText:"NIT Silchar logo"});
 s.addText("Quantum Face Recognition with Multi-Gate Quantum Convolutional Neural Network",{placeholder:"title"});
 tx(s,"B. Tech. Project Mid-Semester Evaluation",{x:0.6,y:4.1,w:8.8,h:0.5,size:20,bold:true,color:C.accent1,align:"center"});
 tx(s,"Subrata Lodh (2314051)  |  Yesh Agarwal (2314080)",{x:0.6,y:4.85,w:8.8,h:0.45,size:17,align:"center"});
 tx(s,"Supervisor: Dr. Banani Basu",{x:0.6,y:5.3,w:8.8,h:0.45,size:17,align:"center"});
 tx(s,"Department of Electronics and Communication Engineering",{x:0.6,y:6.05,w:8.8,h:0.4,size:14,color:C.text2,align:"center"});
 tx(s,"National Institute of Technology Silchar, Assam (India) - 788010",{x:0.6,y:6.4,w:8.8,h:0.4,size:14,color:C.text2,align:"center"});
 s.addNotes("Hybrid quantum-classical face recognition: a 4-qubit filter with 8 trainable quantum parameters.");}
// ===== 2 Intro & Problem =====
{const s=newSlide("Introduction & Problem Statement","Face recognition pipeline; feature extraction decides accuracy. NISQ hardware has few qubits, so one qubit per pixel (2,304) is impossible; we use 4 qubits per 2x2 patch.");
 chev(s,["1  Acquire image","2  Pre-process","3  Extract features","4  Match identity"],0.5,1.3,8.8,0.7,2,{size:14});
 const w=2.1,g=0.2,y=2.3,h=1.55;
 stat(s,0.5,y,w,h,"97.35%","DeepFace accuracy on the LFW benchmark");
 stat(s,0.5+(w+g),y,w,h,"5 – 27","qubits on commonly accessible IBM devices");
 stat(s,0.5+2*(w+g),y,w,h,"2,304","qubits if every pixel of a 48×48 image needs its own",{pink:true});
 stat(s,0.5+3*(w+g),y,w,h,"4","qubits for one 2×2 patch, our approach",{dark:true});
 const rows=[["The challenge","NISQ devices offer only a few tens of reliable qubits, so a whole face cannot be encoded."],["The idea","Slide one small trainable 4-qubit circuit over 2×2 patches, like a CNN kernel."],["The problem","Recognise faces (ORL, Yale) with a hybrid network that has only 8 trainable quantum parameters."]];
 rows.forEach((r,i)=>{const yy=4.15+i*0.95;card(s,0.5,yy,2.0,0.82,i===2?C.accent2:C.background2,"label card");tx(s,r[0],{x:0.5,y:yy,w:2.0,h:0.82,size:16,bold:true,color:C.accent1,align:"center"});card(s,2.6,yy,6.9,0.82,i===2?C.accent2:C.background2,"text card");tx(s,r[1],{x:2.7,y:yy,w:6.7,h:0.82,size:15});});}
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
  tx(s,c[1].map((t,k)=>R(t,{bullet:{indent:14},breakLine:k<c[1].length-1,paraSpaceAfter:8})),{x:x+0.1,y:2.2,w:2.7,h:3.0,size:15,valign:"top"});});
 strip(s,0.5,5.5,9.0,1.25,[R("Research gap:  ",{bold:true,color:C.accent1}),R("small datasets, noise-free simulation and no hardware test in the reference work. We add an independent implementation, an analytical model of the filter and a cost and noise analysis.")],{size:15});}
// ===== 5 Architecture =====
{const s=newSlide("System Architecture","Image -> 2x2 patches -> one shared 4-qubit filter -> 24x24x4 feature maps -> fully connected layer. Same 8 parameters for every patch.");
 const labels=[["Input","48×48 gray"],["Patches","2×2, stride 2"],["Quantum filter","4 qubits, 8 θ"],["Feature maps","24×24×4"],["FC + softmax","40 / 15 classes"]];
 labels.forEach((l,i)=>{const x=0.5+i*1.85,hi=i===2;card(s,x,1.3,1.55,1.1,hi?C.accent1:C.background2,"stage");
  tx(s,l[0],{x,y:1.38,w:1.55,h:0.5,size:15,bold:true,color:hi?C.background1:C.text1,align:"center"});tx(s,l[1],{x,y:1.85,w:1.55,h:0.45,size:13,color:hi?C.background1:C.text2,align:"center"});
  if(i<4)s.addShape(S.rightArrow,{x:x+1.58,y:1.72,w:0.24,h:0.26,fill:{color:C.accent3},line:{color:C.accent3,width:0},objectName:"arrow"});});
 tx(s,"quantum part",{x:0.5+2*1.85,y:2.45,w:1.55,h:0.3,size:11,color:C.accent1,align:"center",italic:true});tx(s,"classical part",{x:0.5+4*1.85,y:2.45,w:1.55,h:0.3,size:11,color:C.text2,align:"center",italic:true});
 // image grid
 const gx=0.8,gy=3.15,cs=0.34,n=8;for(let r=0;r<n;r++)for(let c=0;c<n;c++){const hl=(r===2||r===3)&&(c===4||c===5);s.addShape(S.rect,{x:gx+c*cs,y:gy+r*cs,w:cs,h:cs,fill:{color:hl?C.accent1:C.background2},line:{color:C.background1,width:1},objectName:hl?"patch cell":"pixel"});}
 tx(s,"one 2×2 patch = 4 pixels",{x:gx-0.2,y:gy+n*cs+0.05,w:n*cs+0.4,h:0.35,size:12,color:C.text2,align:"center"});
 s.addShape(S.rightArrow,{x:3.75,y:4.3,w:0.55,h:0.4,fill:{color:C.accent3},line:{color:C.accent3,width:0},objectName:"arrow"});
 card(s,4.4,3.55,2.3,1.9,C.accent2,"filter box");tx(s,"Quantum filter",{x:4.4,y:3.65,w:2.3,h:0.45,size:17,bold:true,color:C.accent1,align:"center"});tx(s,"same 8 parameters for every patch",{x:4.5,y:4.1,w:2.1,h:0.7,size:14,align:"center",valign:"top"});tx(s,"4 pixels in → 4 values out",{x:4.5,y:4.75,w:2.1,h:0.55,size:13,color:C.text2,align:"center"});
 s.addShape(S.rightArrow,{x:6.8,y:4.3,w:0.55,h:0.4,fill:{color:C.accent3},line:{color:C.accent3,width:0},objectName:"arrow"});
 [0,1,2,3].forEach(k=>{s.addShape(S.rect,{x:7.5+k*0.2,y:4.55-k*0.2,w:1.2,h:1.2,fill:{color:[C.accent6,C.accent3,C.text2,C.accent1][k]},line:{color:C.background1,width:1},objectName:"feature map "+(k+1)});});
 tx(s,"4 feature maps",{x:7.4,y:5.85,w:1.9,h:0.35,size:12,color:C.text2,align:"center"});
 strip(s,0.5,6.3,9.0,0.6,[R("24 × 24 = 576 patches   ×   4 outputs   =   2,304 features",{bold:true,color:C.accent1})],{size:17});}
// ===== 6 Circuit + closed form =====
{const s=newSlide("Quantum Filter: Circuit & Closed Form","Encode with RY, train RZ and RX, entangle with a CNOT chain, measure Z. The output has a closed form: f_k is the product of single-qubit terms s_0..s_k, so f_3 depends on all four pixels. Verified numerically to 7e-16.");
 const h=img(s,"circuit.png",0.5,1.25,5.1);
 [["Encode","R","Y","(x)"],["Train","R","Z","/R",'X',"  8 θ"],["Entangle","CNOT chain"]];
 const tags=[["Encode","RY(x) per pixel"],["Train","RZ, RX: 8 θ"],["Entangle + measure","CNOT chain, ⟨Z⟩"]];
 tags.forEach((t,i)=>{const x=0.5+i*1.72;card(s,x,3.65,1.63,0.85,C.background2,"tag");tx(s,t[0],{x,y:3.68,w:1.63,h:0.4,size:13,bold:true,color:C.accent1,align:"center"});tx(s,t[1],{x,y:4.05,w:1.63,h:0.4,size:12,color:C.text2,align:"center"});});
 card(s,5.85,1.3,3.65,3.2,C.accent2,"equation card");
 tx(s,"Closed form",{x:5.95,y:1.35,w:3.45,h:0.45,size:17,bold:true,color:C.accent1});
 tx(s,[...SUB("s","i"),R(" = cos θ",{italic:true}),R("2i+1",{subscript:true,italic:true}),R(" cos ",{italic:true}),...SUB("x","i"),R("",{breakLine:true}),R("      + sin θ",{italic:true}),R("2i+1",{subscript:true,italic:true}),R(" sin θ",{italic:true}),R("2i",{subscript:true,italic:true}),R(" sin ",{italic:true}),...SUB("x","i")],{x:5.95,y:1.8,w:3.45,h:0.95,size:15});
 tx(s,[...SUB("f","k",{bold:true,color:C.accent1}),R(" = ",{bold:true,color:C.accent1}),...SUB("s","0",{bold:true,color:C.accent1}),...SUB("s","1",{bold:true,color:C.accent1}),R(" ⋯ ",{bold:true,color:C.accent1}),...SUB("s","k",{bold:true,color:C.accent1})],{x:5.95,y:2.8,w:3.45,h:0.7,size:26,align:"center"});
 tx(s,[R("f",{italic:true}),R("0",{subscript:true,italic:true}),R(" sees 1 pixel, "),R("f",{italic:true}),R("3",{subscript:true,italic:true}),R(" sees all 4 pixels. Checked against the full simulation: error 7×10⁻¹⁶",{})],{x:5.95,y:3.5,w:3.45,h:0.95,size:13,color:C.text2,valign:"top"});
 img(s,"s_filter.png",0.9,4.7,8.2);}
// ===== 7 Data =====
{const s=newSlide("Data & Pre-processing","ORL 400 images / 40 subjects; Yale 165 / 15. Grayscale, 48x48, min-max to [-1,1], times pi. The figure is illustrative with synthetic gray levels, showing why clipped z-scores saturate at +-pi.");
 [["ORL","400 images · 40 subjects","92×112 px · 10 per subject · split 280 / 120"],["Yale","165 images · 15 subjects","320×243 px · 11 per subject · split 120 / 45"]].forEach((d,i)=>{const x=0.5+i*4.6;card(s,x,1.3,4.4,1.25,C.background2,"dataset card");tx(s,d[0],{x:x+0.15,y:1.35,w:1.2,h:0.55,size:22,bold:true,color:C.accent1});tx(s,d[1],{x:x+1.2,y:1.35,w:3.1,h:0.55,size:16,bold:true});tx(s,d[2],{x:x+0.15,y:1.9,w:4.1,h:0.55,size:13,color:C.text2});});
 chev(s,["Grayscale","Resize 48×48","Min–max [−1, 1]","× π","Angle x"],0.5,2.75,8.8,0.55,4,{size:13});
 img(s,"s_scaling.png",0.5,3.45,9.0);
 strip(s,0.5,6.25,9.0,0.7,[R("Illustrative (synthetic gray levels): ",{bold:true,color:C.accent1}),R("clipped z-scores pile about a third of the pixels at ±π; min–max keeps the full angle range.")],{size:14});}
// ===== 8 Pixel scaling results =====
{const s=newSlide("Effect of Pixel Scaling","Min-max beat Gaussian z-score on all 10 seeds for both datasets. Gain 3.17 points on ORL and 8.44 on the original Yale setup. Explanation (saturation at +-pi) is plausible but untested.");
 img(s,"seedlines.png",0.5,1.3,9.0);
 stat(s,0.5,4.95,2.85,1.3,"10 / 10","seeds won by min–max, both datasets",{bigSize:30});
 stat(s,3.575,4.95,2.85,1.3,"+3.17 pts","ORL mean: 94.67 vs 91.50",{pink:true,bigSize:30});
 stat(s,6.65,4.95,2.85,1.3,"+8.44 pts","Yale mean (original set-up): 78.89 vs 70.44",{pink:true,bigSize:30});
 strip(s,0.5,6.4,9.0,0.55,[R("Likely reason (untested): ",{bold:true,color:C.accent1}),R("clipped z-scores saturate bright and dark pixels at ±π.")],{size:14});}
// ===== 9 Training ORL =====
{const s=newSlide("Training Behaviour on ORL","Seed 0: loss falls from 3.03 to 0.0031; train accuracy reaches 100% at epoch 3; test accuracy 95.83% from epoch 14 (115 of 120).");
 img(s,"train.png",0.7,1.3,8.6);
 stat(s,0.5,4.8,2.85,1.35,"3.03 → 0.0031","training loss, epoch 1 to 30",{bigSize:24});
 stat(s,3.575,4.8,2.85,1.35,"100%","train accuracy from epoch 3",{bigSize:30});
 stat(s,6.65,4.8,2.85,1.35,"95.83%","test accuracy from epoch 14 (115 of 120)",{pink:true,bigSize:30});
 strip(s,0.5,6.3,9.0,0.65,[R("Some over-fitting: ",{bold:true,color:C.accent1}),R("4.17-point train–test gap, with 92,200 classical weights on 280 images.")],{size:14});}
// ===== 10 Ten-seed =====
{const s=newSlide("Ten-Seed Evaluation","Ten random 70:30 splits, 1000-shot test. ORL 94.667 +- 1.675 (max 97.5). Yale original 78.889, selected 85.556 +- 4.792 (max 91.111). One Yale test image = 2.22 points.");
 img(s,"s_seeds.png",0.5,1.3,9.0);
 stat(s,0.5,4.5,2.85,1.5,"94.67%","ORL mean · max 97.50 · std 1.68 · 120 test images",{bigSize:30});
 stat(s,3.575,4.5,2.85,1.5,"85.56%","Yale mean · max 91.11 · std 4.79 · 45 test images",{pink:true,bigSize:30});
 stat(s,6.65,4.5,2.85,1.5,"+6.7 pts","Yale after centre crop, lr 1e-3, 60 epochs (from 78.89%)",{dark:true,bigSize:30});
 strip(s,0.5,6.2,9.0,0.75,[R("Why Yale varies more: ",{bold:true,color:C.accent1}),R("one test image moves accuracy by 2.22 points (45 images) vs 0.83 on ORL (120).")],{size:14});}
// ===== 11 Yale study =====
{const s=newSlide("Yale: Tuning and Augmentation","Validation split 96/24 from the training set, seeds 0-2. Best: square crop, lr 1e-3, 60 epochs (76.4%). Augmentation lowered validation accuracy (77.8 -> 68.1) and widened the train-validation gap (22 -> 29 points).");
 img(s,"s_yale.png",0.5,1.3,9.0);
 stat(s,0.5,4.65,2.85,1.35,"76.4%","best validation: square crop, lr 1e-3, 60 epochs",{bigSize:30});
 stat(s,3.575,4.65,2.85,1.35,"77.8 → 68.1%","validation accuracy as augmentation increases",{pink:true,bigSize:24});
 stat(s,6.65,4.65,2.85,1.35,"22 → 29 pts","train–validation gap grows",{dark:true,bigSize:28});
 strip(s,0.5,6.2,9.0,0.75,[R("Augmentation did not help: ",{bold:true,color:C.accent1}),R("the model still fits 120 training images almost perfectly. The cause of the over-fitting is not yet isolated.")],{size:14});}
// ===== 12 Confusion matrices =====
{const s=newSlide("Where the Errors Are","Pooled over ten seeds: 1,200 ORL and 450 Yale test predictions. Yale matrix is from the earlier square-crop tuning run (84.89%).");
 img(s,"cm_orl.png",0.55,1.25,4.25);img(s,"cm_yale.png",5.2,1.25,4.25);
 tx(s,"ORL · 94.67% · 1,200 predictions",{x:0.55,y:5.15,w:4.25,h:0.35,size:13,bold:true,color:C.text2,align:"center"});tx(s,"Yale (tuning run) · 84.89% · 450 predictions",{x:5.2,y:5.15,w:4.25,h:0.35,size:13,bold:true,color:C.text2,align:"center"});
 card(s,0.5,5.65,4.4,1.25,C.background2,"insight");tx(s,[R("ORL: ",{bold:true,color:C.accent1}),R("strong diagonal; errors are scattered single confusions, no subject fails systematically.")],{x:0.6,y:5.65,w:4.2,h:1.25,size:14});
 card(s,5.1,5.65,4.4,1.25,C.accent2,"insight");tx(s,[R("Yale: ",{bold:true,color:C.accent1}),R("more off-diagonal confusion; subjects 7 and 8 are often read as 14, subject 5 as 13.")],{x:5.2,y:5.65,w:4.2,h:1.25,size:14});}
// ===== 13 Cost =====
{const s=newSlide("Cost of Training on Hardware","Hardware needs the parameter-shift rule: 17 runs per patch, 9,792 per image per step, 8.2e7 for one ORL run. Simulator backpropagation gives the same gradient (mismatch 2.2e-15) in one pass, so it is used for training. Test time uses 1000 shots.");
 img(s,"s_cost.png",0.5,1.3,9.0);
 card(s,0.5,4.5,9.0,0.95,C.accent2,"formula card");
 tx(s,[R("∂f/∂θ = ½ [ f(θ + π/2) − f(θ − π/2) ]",{bold:true,color:C.accent1})],{x:0.6,y:4.5,w:4.7,h:0.95,size:19,align:"center"});
 tx(s,"two extra runs per parameter on hardware; simulator backprop gives the same gradient in one pass",{x:5.4,y:4.5,w:4.0,h:0.95,size:13,color:C.text2});
 [["17","runs per patch (1 + 2×8)"],["9,792","runs per image per step"],["8.2×10⁷","runs for one ORL training run"],["2.2×10⁻¹⁵","backprop vs shift gradient mismatch"]].forEach((t,i)=>stat(s,0.5+i*2.3,5.65,2.1,1.3,t[0],t[1],{pink:i===1||i===2,bigSize:i===3?22:26,labSize:12}));}
// ===== 14 Conclusion / limitations / future =====
{const s=newSlide("Conclusion, Limitations & Future Scope","Achieved: pipeline, closed form verified, ORL 94.67%, Yale 85.56%. Limitations: noise-free simulation, Yale over-fitting, no ablation/noise study yet. Future: feature-extraction stage before the quantum layer so far fewer patches need circuit runs and real parameter-shift training becomes practical.");
 const cx=[0.5,3.55,6.6],cw=2.9;
 card(s,cx[0],1.3,cw,4.1,C.background2,"column");card(s,cx[1],1.3,cw,4.1,C.background2,"column");card(s,cx[2],1.3,cw,4.1,C.accent2,"column");
 s.addImage({data:ic.ok,x:cx[0]+0.15,y:1.42,w:0.4,h:0.4,altText:"check"});tx(s,"Achieved",{x:cx[0]+0.65,y:1.4,w:2.2,h:0.45,size:18,bold:true,color:C.accent5});
 tx(s,["MG-QCNN built in PennyLane + PyTorch","Closed-form filter verified","ORL 94.67%, Yale 85.56%","Min–max beats Gaussian on all seeds"].map((t,k,a)=>R(t,{bullet:{indent:14},breakLine:k<a.length-1,paraSpaceAfter:14})),{x:cx[0]+0.1,y:1.95,w:2.7,h:3.3,size:17,valign:"top"});
 s.addImage({data:ic.warn,x:cx[1]+0.15,y:1.42,w:0.4,h:0.4,altText:"warning"});tx(s,"Limitations",{x:cx[1]+0.65,y:1.4,w:2.2,h:0.45,size:18,bold:true,color:C.accent1});
 tx(s,["Noise-free simulation, not hardware","Yale over-fits: 100% train vs about 85% test","No ablation or noise study yet"].map((t,k,a)=>R(t,{bullet:{indent:14},breakLine:k<a.length-1,paraSpaceAfter:14})),{x:cx[1]+0.1,y:1.95,w:2.7,h:3.3,size:17,valign:"top"});
 s.addImage({data:ic.rocket,x:cx[2]+0.15,y:1.42,w:0.4,h:0.4,altText:"rocket"});tx(s,"Future scope",{x:cx[2]+0.65,y:1.4,w:2.2,h:0.45,size:18,bold:true,color:C.accent1});
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
