const fs=require('fs');
const D=require('docx');
const {Document,Packer,Paragraph,TextRun,ImageRun,Table,TableRow,TableCell,WidthType,AlignmentType,BorderStyle,ShadingType,Footer,PageNumber,Tab,TabStopType,Math:M,MathRun,MathSubScript,MathSuperScript,MathSubSuperScript,MathFraction,MathSum,MathRoundBrackets,MathSquareBrackets,VerticalAlign}=D;
const FIG=process.argv[2], OUT=process.argv[3];
const FONT="Times New Roman", SZ=20; // 10pt
// ---------- text helpers ----------
function rich(t,o={}){ // **bold**, *italic*, ~sub~, ^sup^
  const runs=[];const re=/(\*\*[^*]+\*\*|\*[^*]+\*|~[^~]+~|\^[^^]+\^)/g;let last=0,m;
  const mk=(s,x={})=>new TextRun({text:s,font:FONT,size:o.size||SZ,...o.run,...x});
  while((m=re.exec(t))){ if(m.index>last)runs.push(mk(t.slice(last,m.index)));
    const s=m[0];
    if(s.startsWith('**'))runs.push(mk(s.slice(2,-2),{bold:true}));
    else if(s[0]==='*')runs.push(mk(s.slice(1,-1),{italics:true}));
    else if(s[0]==='~')runs.push(mk(s.slice(1,-1),{subScript:true}));
    else runs.push(mk(s.slice(1,-1),{superScript:true}));
    last=m.index+s.length;}
  if(last<t.length)runs.push(mk(t.slice(last)));
  return runs;}
const P=(t,o={})=>new Paragraph({alignment:o.align||AlignmentType.JUSTIFIED,spacing:{after:o.after??70,before:o.before||0,line:o.line||240},keepNext:o.keepNext,children:rich(t,o)});
const H1=t=>new Paragraph({spacing:{before:140,after:60},keepNext:true,children:[new TextRun({text:t,bold:true,font:FONT,size:25})]});
const H2=t=>new Paragraph({spacing:{before:80,after:40},keepNext:true,children:[new TextRun({text:t,bold:true,italics:true,font:FONT,size:SZ})]});
const CAP=(t,o={})=>new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:o.before??20,after:o.after??90},keepNext:o.keepNext,children:rich(t,{size:18})});
const bullet=(t)=>new Paragraph({numbering:{reference:"b",level:0},alignment:AlignmentType.JUSTIFIED,spacing:{after:30,line:240},children:rich(t)});
const num=(t)=>new Paragraph({numbering:{reference:"n",level:0},alignment:AlignmentType.JUSTIFIED,spacing:{after:30,line:250},children:rich(t)});
function img(file,wIn,o={}){const path=`${FIG}/${file}`;const b=fs.readFileSync(path);
  // read PNG size
  const w=b.readUInt32BE(16),h=b.readUInt32BE(20);const W=Math.round(wIn*96),H=Math.round(W*h/w);
  return new Paragraph({alignment:AlignmentType.CENTER,keepNext:true,spacing:{before:o.before??40,after:0},children:[new ImageRun({type:"png",data:b,transformation:{width:W,height:H}})]});}
function imgRun(file,wIn){const b=fs.readFileSync(`${FIG}/${file}`);const w=b.readUInt32BE(16),h=b.readUInt32BE(20);const W=Math.round(wIn*96);return new ImageRun({type:"png",data:b,transformation:{width:W,height:Math.round(W*h/w)}});}
// ---------- math helpers ----------
const r=t=>new MathRun(t);
const fl=a=>a.flat(Infinity);
const sub=(b,s)=>new MathSubScript({children:[r(b)],subScript:[r(s)]});
const sup=(b,s)=>new MathSuperScript({children:[r(b)],superScript:[r(s)]});
const br=(...c)=>[r("("),...c,r(")")];
const sq=(...c)=>[r("["),...c,r("]")];
const frac=(n,d)=>new MathFraction({numerator:fl(n),denominator:fl(d)});
const sumOver=(lo,hi,body)=>new MathSum({children:fl(body),subScript:[r(lo)],superScript:[r(hi)]});
const tens=()=>new D.MathSubSuperScript({children:[r("⨂")],subScript:[r("i=0")],superScript:[r("3")]});
const ketM=l=>r(`§KET:${l}§`);const braketM=r("§BRAKET§");
const ket_unused=t=>[r("\u2223"),...(Array.isArray(t)?t:[r(t)]),r("⟩")];
function EQ(children,n){return new Paragraph({tabStops:[{type:TabStopType.CENTER,position:4680},{type:TabStopType.RIGHT,position:9360}],spacing:{before:50,after:70},children:[new TextRun({children:[new Tab()],font:FONT,size:SZ}),new M({children:fl(children)}),new TextRun({children:[new Tab(),`(${n})`],font:FONT,size:SZ})]});}
// ---------- table helper ----------
const bd={style:BorderStyle.SINGLE,size:4,color:"999999"};const borders={top:bd,bottom:bd,left:bd,right:bd};
function table(widths,rows,o={}){const total=widths.reduce((a,b)=>a+b,0);const fs_=o.size||18;
  return new Table({width:{size:total,type:WidthType.DXA},columnWidths:widths,alignment:AlignmentType.CENTER,
   rows:rows.map((row,ri)=>new TableRow({cantSplit:true,tableHeader:ri===0,children:row.map((c,ci)=>new TableCell({width:{size:widths[ci],type:WidthType.DXA},borders,verticalAlign:VerticalAlign.CENTER,
     shading:ri===0?{type:ShadingType.CLEAR,fill:"E7EAF0",color:"auto"}:(o.hl&&o.hl.includes(ri)?{type:ShadingType.CLEAR,fill:"FCEBEB",color:"auto"}:undefined),
     margins:{top:25,bottom:25,left:70,right:70},
     children:[new Paragraph({keepNext:ri<rows.length-1,alignment:(ci===0&&!o.centerFirst)?AlignmentType.LEFT:AlignmentType.CENTER,spacing:{after:0},children:rich(String(c),{size:fs_,run:{bold:ri===0}})})]}))}))});}
const gap=(a=40)=>new Paragraph({spacing:{after:a},children:[]});

// ================= CONTENT =================
const C=[];
// ---- cover page (layout of the original report's first page) ----
const CV=[];
const cvp=(t,o={})=>new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:o.before||0,after:o.after||0,line:276},border:o.border,children:t?[new TextRun({text:t,font:FONT,size:28,bold:!!o.bold})]:[]});
CV.push(cvp("B. Tech. PROJECT REPORT (Mid-Semester Evaluation)",{after:240,border:{bottom:{style:BorderStyle.SINGLE,size:6,color:"2E6E8E",space:6}}}));
CV.push(cvp("QUANTUM FACE RECOGNITION WITH MULTI-GATE QUANTUM CONVOLUTIONAL NEURAL NETWORK",{bold:true,before:500}));
CV.push(cvp("Submitted by:",{bold:true,before:900}));
CV.push(cvp("Subrata Lodh (2314051),",{bold:true,before:600}));
CV.push(cvp("Yesh Agarwal (2314080)",{bold:true}));
CV.push(cvp("SUPERVISOR NAME: Dr. Banani Basu",{bold:true,before:1500}));
CV.push(cvp("SUPERVISOR’S SIGNATURE",{bold:true,before:800}));
CV.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:300,after:300},children:[imgRun("image1.png",2.0)]}));
CV.push(cvp("DEPARTMENT OF ELECTRONICS AND COMMUNICATION ENGINEERING",{bold:true,before:400}));
CV.push(cvp("NATIONAL INSTITUTE OF TECHNOLOGY SILCHAR, ASSAM (INDIA)-788010",{bold:true,before:500}));

C.push(H1("Abstract"));
C.push(P("Face recognition is one of the most widely deployed biometric technologies, and deep convolutional neural networks (CNNs) dominate it, but at a steadily growing computational cost [1, 2]. Quantum machine learning offers an alternative, yet today’s noisy intermediate-scale quantum (NISQ) devices provide only a handful of qubits, so a whole face image cannot be encoded with one qubit per pixel [3, 4]. This project studies and implements the multi-gate quantum convolutional neural network (MG-QCNN) of Zhu *et al.* [4], a hybrid model in which a four-qubit variational circuit acts as a convolution filter sliding over the image. Each 2×2 patch is angle-encoded with R~Y~ gates, processed by trainable R~Z~ and R~X~ rotations (eight parameters) and a CNOT chain, and read out as Pauli-Z expectation values; a fully connected layer classifies the resulting 24×24×4 feature maps."));
C.push(P("Up to mid-semester we implemented the complete pipeline in PennyLane and PyTorch, derived a closed-form expression for the filter output and confirmed it against the circuit (maximum error 7×10^−16^), and analysed the training cost of the hardware-compatible parameter-shift rule against simulator backpropagation, which gives identical gradients (agreement 2.2×10^−15^). Evaluated with 1000 shots over ten random splits, the model reaches a mean test accuracy of **94.67%** (max 97.50%, std 1.68) on ORL and **85.56%** (max 91.11%, std 4.79) on Yale. On Yale the training accuracy reaches 100% on only 120 images, and data augmentation did not help, which points to over-fitting. Min–max pixel scaling beat Gaussian scaling on both datasets. Remaining work: ablations, noise studies, hardware readiness and a feature-extraction stage to reduce circuit cost."));

C.push(H1("1. Introduction"));
C.push(P("Face recognition identifies or verifies a person from a face image and is used in banking, security and government services. A typical system pre-processes the image, extracts facial features and matches them against known identities; feature-extraction quality largely decides accuracy [1]. Classical methods such as KNN and SVM were replaced by deep learning, in particular CNNs [5], whose shared kernels suit images with correlated neighbouring pixels (DeepFace: 97.35% on LFW [6]), but at ever larger compute budgets [2]."));
C.push(P("Quantum computing is a candidate for more efficient learning [3, 7], but current NISQ hardware offers only a few tens of reliable qubits, so a practical approach must extract features from small regions with few qubits, like a classical kernel that processes one window at a time. The MG-QCNN of Zhu *et al.* [4] follows this idea: a fixed four-qubit variational circuit is used as a “quanvolutional” filter on every 2×2 patch. The objectives of the project are:"));
C.push(num("To study quantum machine learning: angle encoding, variational circuits and quanvolution."));
C.push(num("To implement the MG-QCNN with PennyLane and PyTorch and derive its filter function analytically."));
C.push(num("To evaluate it on the ORL and Yale databases with a statistically sound protocol (ten random splits, finite-shot testing)."));
C.push(num("To analyse the role of gates, entanglement, filter size, shot noise and hardware cost."));

C.push(H1("2. Literature Review"));
C.push(P("**Classical face recognition.** Hand-crafted features (Gabor responses, elastic graph matching) with KNN or SVM gave way to deep CNNs [1], whose computational requirements grow faster than hardware efficiency [2]; this motivates models with far fewer trainable resources. **Variational circuits and quanvolution.** Variational quantum algorithms train a parameterised circuit with a classical optimiser: rotation angles act as weights, the output is an expectation value, and parameters are updated by gradient descent [7]. They are the natural building block for hybrid networks on NISQ devices [3]. Highly random or expressive circuits on many qubits suffer from barren plateaus, where gradients vanish exponentially [8, 9], so small, fixed, structured circuits are preferred. Cong *et al.* introduced a QCNN for many-body physics without a sliding filter, which would need one qubit per pixel for images [10]. Henderson *et al.* proposed the quanvolutional network with random, non-trainable filters [11]; Mattern *et al.* added trainable gates (VQNN) but kept random circuits [12]; Oh *et al.* used a fixed circuit with one measured qubit and several kernels [13]. Other hybrids are HQCCNN [14], HQNN [15] and a QCNN for classical data [16]. In [4] these models use 11 to 22 gates and 2,304 (HQNN) to 23,040 (HQCCNN) quantum parameters on Yale, measure either all or a single qubit, and only VQNN uses a random circuit."));
C.push(P("**Research gap.** The MG-QCNN [4] combines a fixed circuit, trainable R~X~/R~Z~ rotations after R~Y~ encoding, CNOT entanglement, measurement of all qubits and a sliding 2×2 filter. The authors note that only small datasets were used, simulation was noise-free, a 3×3 kernel is already near the barren-plateau limit, and no hardware experiment was run. Independent implementation, a careful statistical evaluation, an analytical understanding of the filter and an analysis of the training cost and noise are therefore the focus of our work.",{before:60}));

C.push(H1("3. Methodology"));
C.push(H2("3.1 System overview and data"));
C.push(P("The system is a hybrid network with one quantum convolution layer followed by one classical fully connected layer (Fig. 1). A 48×48 grayscale image is divided into non-overlapping 2×2 patches (stride 2), giving *M* = 24×24 = 576 patches. The same four-qubit circuit is applied to every patch and returns four real numbers, so the layer outputs a 24×24×4 tensor, which is flattened to 2304 values and mapped to the 40 ORL subjects (15 for Yale) by a linear layer with softmax."));
C.push(img("image2.png",5.0,{before:0}));
C.push(CAP("**Fig. 1.** Overall architecture of the implemented MG-QCNN."));
C.push(P("The ORL database [17] has 400 images of 40 subjects (92×112 pixels, 10 per subject, varying expression, lighting and glasses); the Yale database [18] has 165 images of 15 subjects (11 each; 320×243 pixels; centre-/left-/right-light, glasses, happy, sad, sleepy, surprised, wink, normal). Images are converted to grayscale and resized to 48×48 (for Yale a centred square crop followed by a further 85% centre crop). Loaders assert the image counts (Kaggle duplicates and an extra non-ORL subject are removed). Splits are random 70:30 for ORL (280/120) and 120/45 for Yale. Each pixel *a* is scaled per image by min–max to [−1, 1] and multiplied by π, so it becomes a rotation angle:"));
C.push(EQ([sub("x","i"),r(" = π"),br(frac([r("2"),br(sub("a","i"),r(" − "),sub("a","min"))],[sub("a","max"),r(" − "),sub("a","min")]),r(" − 1"))],1));
C.push(P("Min–max scaling was compared with per-image z-score standardisation clipped to [−1, 1] (the variant described in [4]); on identical splits min–max was higher on all ten seeds for both datasets (Table 2), so it was adopted. A plausible reason is that min–max uses the full angle range for every image, whereas clipping saturates bright and dark pixels at ±π; this explanation was not tested separately."));

C.push(H2("3.2 Quantum convolution layer"));
C.push(P("**Encoder.** The four pixels of a patch **x** = (*x*~0~,…,*x*~3~) are loaded onto four qubits initialised in |0⟩ by R~Y~ rotations, where for a Pauli operator *P* the rotation is R~P~(φ) = exp(−iφ*P*/2) = cos(φ/2) *I* − i sin(φ/2) *P*. Each qubit then sits on the Bloch sphere at (sin *x*~i~, 0, cos *x*~i~):"));
C.push(EQ([ketM("ψ_0"),r(" = "),tens(),sub("R","Y"),br(sub("x","i")),ketM("0"),r(",   i = 0,…,3")],2));
C.push(P("**Variational circuit.** Each qubit passes through a trainable R~Z~ and R~X~, giving eight parameters θ~0~…θ~7~ (θ~2i~ for R~Z~, θ~2i+1~ for R~X~) shared by all patches, exactly like classical kernel weights. A chain of three CNOT gates entangles neighbouring qubits, so the outputs depend on correlations between pixels. The filter has 15 gates (4 R~Y~, 4 R~Z~, 4 R~X~, 3 CNOT) and depth six (Fig. 2). The circuit is fixed rather than random, which makes results reproducible and helps avoid barren plateaus [8, 9]:"));
C.push(EQ([ketM("ψ"),r(" = C "),tens(),sq(sub("R","X"),br(sub("θ","2i+1")),sub("R","Z"),br(sub("θ","2i")),sub("R","Y"),br(sub("x","i"))),ketM("0000"),r(",   C = "),sub("CNOT","2→3"),sub("CNOT","1→2"),sub("CNOT","0→1")],3));
C.push(P("**Decoder.** All four qubits are measured and the Pauli-Z expectation value of each is the feature value (exact in training, estimated from 1000 shots at test time):"));
C.push(EQ([sub("f","k"),br(r("x, θ")),r(" = "),braketM],4));
C.push(img("image5.png",3.3,{before:20}));
C.push(CAP("**Fig. 2.** Four-qubit MG-QCNN filter drawn from the implemented PennyLane circuit.",{after:60}));
C.push(P("**Closed-form filter output.** The pre-CNOT state is a product state. For one qubit, R~Y~(*x*) places the Bloch vector at (sin *x*, 0, cos *x*); R~Z~(θ~Z~) rotates it about z and R~X~(θ~X~) about x, giving the z-component"));
C.push(EQ([sub("s","i"),r(" = cos"),sub("θ","2i+1"),r(" cos "),sub("x","i"),r(" + sin"),sub("θ","2i+1"),r(" sin"),sub("θ","2i"),r(" sin "),sub("x","i")],5));
C.push(P("A CNOT with control *c* and target *t* maps *Z*~t~ → *Z*~c~*Z*~t~ and leaves *Z*~c~ unchanged. Propagating *Z*~k~ back through the chain gives *C*^†^*Z*~k~*C* = *Z*~0~*Z*~1~⋯*Z*~k~, hence"));
C.push(EQ([sub("f","k"),r(" = "),sub("s","0"),sub("s","1"),r("⋯"),sub("s","k")],6));
C.push(P("This was checked numerically against the full state-vector circuit on 200 random patches and parameter sets (maximum difference 6.7×10^−16^). It shows that (i) *f*~0~ depends on pixel 0 only and *f*~3~ on all four pixels, so entanglement is what lets the outputs combine neighbouring pixels (Fig. 3b); without CNOTs each output is just *s*~k~ of one pixel; (ii) every output is a bounded sinusoid in each pixel and in each θ (Fig. 3a); and (iii) since each θ enters with frequency one, the parameter-shift rule below is exact. Overall the model is a softmax classifier on 2304 trigonometric pixel features controlled by only eight quantum parameters."));
C.push(img("fig_filter.png",5.0,{before:20}));
C.push(CAP("**Fig. 3.** (a) Single-qubit response *s*~i~(*x*~i~) for three settings of (θ~Z~, θ~X~). (b) The entangled output *f*~1~ = *s*~0~*s*~1~ as a function of two pixels, using the closed form in Eq. (6)."));

C.push(H2("3.3 Classifier, loss and training"));
C.push(P("Let **F** ∈ ℝ^2304^ hold the 576×4 feature values and **z** = **WF** + **b** the logits. The network is trained with softmax cross-entropy over *N* samples with true classes *y*~n~ and *K* classes (40 or 15):"));
C.push(EQ([r("L = − "),frac([r("1")],[r("N")]),sumOver("n=1","N",[r("ln "),frac([r("exp"),br(sub("z","n,yₙ"))],[sumOver("c=1","K",[r("exp"),br(sub("z","n,c"))])])])],7));
C.push(P("Because the filter weights are shared, the gradient for each quantum parameter sums over all patches *p*:"));
C.push(EQ([frac([r("∂L")],[r("∂"),sub("θ","m")]),r(" = "),sumOver("p=1","576",[sumOver("k=0","3",[frac([r("∂L")],[r("∂"),sub("F","p,k")]),frac([r("∂"),sub("f","k"),br(sub("x","p")),r(" ")],[r("∂"),sub("θ","m")])])])],8));
C.push(P("The eight quantum parameters and the classical weights are updated together with Adam [19] at learning rate 10^−3^. For ORL the model has 8 quantum + 2304×40 + 40 = 92,200 classical parameters (92,208 in total); for Yale 8 + 34,575 = 34,583. The classical head therefore holds almost all trainable weights, and the quantum filter determines which features it sees. Table 1 lists the configuration; all runs use ten random splits (seeds 0–9), 1000 test shots, Python, PyTorch 2.11 and PennyLane 0.45.1 on Kaggle."));
C.push(CAP("**Table 1.** Experimental configuration.",{before:20,after:30,keepNext:true}));
C.push(table([2500,3430,3430],[["Item","ORL","Yale"],["Input / filter / stride","48×48 gray / 2×2 / 2","Same, after 85% centre crop"],["Qubits / quantum params","4 / 8 (shared by all patches)","Same"],["Feature map / classifier","24×24×4 = 2304 → FC (40)","2304 → FC (15)"],["Loss / optimiser","Cross-entropy / Adam, lr 10^−3^","Cross-entropy / Adam, lr 10^−3^"],["Epochs / batch size","30 / 10","60 / 6"],["Train / test split","280 / 120 (70:30)","120 / 45"]]));

C.push(H2("3.4 Gradient computation and cost on hardware"));
C.push(P("On real hardware the quantum state cannot be read out, so gradients come from the parameter-shift rule [22, 23]: for a gate exp(−iθ*P*/2) with Pauli generator *P* (R~X~, R~Z~) the exact derivative of an expectation value is"));
C.push(EQ([frac([r("∂f")],[r("∂θ")]),r(" = "),frac([r("1")],[r("2")]),sq(r("f"),br(r("θ + π/2")),r(" − f"),br(r("θ − π/2")))],9));
C.push(P("This costs two extra runs per parameter. Since all four qubits are measured in one run, one patch needs 1 forward + 2×8 shifted = 17 runs, so one image and one gradient step need"));
C.push(EQ([sub("N","runs"),r(" = "),br(r("1 + 2P")),r("M = 17 × 576 = 9,792,")],10));
C.push(P("with *P* = 8 parameters and *M* = 576 patches. Over an ORL training run (280 images × 30 epochs) this is about 8.2×10^7^ circuit executions, and about 3.5×10^7^ for Yale; at 1000 shots each the ORL run alone would need about 8.2×10^10^ measurements, before any queue time on cloud hardware. Inference needs only the *M* = 576 forward runs per image (Fig. 4a). The cost grows linearly with the number of patches."));
C.push(P("A state-vector simulator stores the whole state, so the same function is differentiated by backpropagation in one forward and backward pass with all patches of a mini-batch processed together. Both give the exact derivative of the same noise-free expectation value, so the gradients are mathematically identical; on 20 random patches the eight components agree to 2.2×10^−15^. Backpropagation is therefore used for training, purely for speed (about 1.3 s per epoch and 40 s per 30-epoch ORL run), and the layer is run with 1000 shots at test time. Each expectation estimated from *N*~s~ shots has standard deviation"));
C.push(EQ([r("σ = "),new D.MathRadical({children:[frac([r("1 − "),sup("f","2")],[sub("N","s")])]}),r(" ≤ "),frac([r("1")],[new D.MathRadical({children:[sub("N","s")]})]),r(" ≈ 0.032 for "),sub("N","s"),r(" = 1000")],11));
C.push(img("fig_cost.png",5.0,{before:20}));
C.push(CAP("**Fig. 4.** (a) Circuit runs per image and gradient step against the number of patches *M*. (b) Standard error of a Pauli-Z estimate against the number of shots."));
C.push(P("This is a classical simulation: a real implementation would submit the same circuit to a processor and train with the parameter-shift rule on shot-based estimates, where gate, decoherence and read-out errors also affect gradients and accuracy."));
C.push(P("**Differences from the reference protocol [4].** Pixel scaling: min–max instead of Gaussian (tested, Section 4.2). Yale optimiser setting: lr 10^−3^ and 60 epochs, selected on a validation split, instead of 10^−4^ and 30 epochs. Mini-batch: 10 (ORL) and 6 (Yale) images. Everything else (circuit, 2×2 filter, stride 2, Adam, 1000 shots, 7:3 random splits) follows [4]."));

C.push(H1("4. Work Done Till Mid-Semester and Results"));
C.push(H2("4.1 Implementation and training behaviour"));
C.push(P("The pipeline was implemented in Kaggle notebooks (one per dataset, same model code): a data loader with count checks; the quantum layer as a PyTorch module with an exact mode (backpropagation) for training and a 1000-shot mode for testing, where all patches of a mini-batch are sent to the circuit in one broadcast call; the full model; and a ten-seed loop with a new split, fresh initialisation and full training run per seed. The circuit was verified independently: 15 gates as in [4], eight trainable parameters, outputs within [−1, 1], matching backpropagation and parameter-shift gradients, and agreement with Eq. (6)."));
C.push(P("For ORL seed 0 (Fig. 5) the loss falls from 3.03 in epoch 1 to 0.0031 at epoch 30. Training accuracy reaches 100% in epoch 3, while test accuracy rises from 63.33% (epoch 1) to 91.67% (epoch 2), exceeds 95% from epoch 7 and stays at 95.83% from epoch 14 (115 of 120 images). The 4.17-point train–test gap with 92,200 classical weights on 280 images shows some over-fitting."));
C.push(img("image8.png",3.9,{before:20}));
C.push(CAP("**Fig. 5.** Training of MG-QCNN on ORL, seed 0 (30 epochs, lr 10^−3^): (a) loss, log scale; (b) training and test accuracy."));

C.push(H2("4.2 Ten-seed evaluation"));
C.push(P("Table 2, Fig. 6 and Fig. 7 give the 1000-shot test accuracy of each split. On ORL the mean is 94.667% (max 97.500%, std 1.675). On Yale the original set-up (full-frame resize, lr 10^−4^, 30 epochs) gave 78.889% (max 86.667%, std 5.984) and the selected set-up (85% centre crop, lr 10^−3^, 60 epochs) 85.556% (max 91.111%, std 4.792). The larger Yale spread is expected: one of 45 test images changes accuracy by 2.22 points, against 0.83 points on ORL (population standard deviations). Gaussian normalisation was lower on every seed, by 3.17 points on average for ORL and 8.44 for the original Yale set-up."));
C.push(CAP("**Table 2.** Test accuracy (%) per seed, 1000 shots. “Gauss.” is z-score normalisation; the Yale “orig.” set-up is full-frame resize, lr 10^−4^, 30 epochs; “sel.” is the selected set-up.",{before:20,after:30,keepNext:true}));
const rows3=[["Seed","ORL min–max","ORL Gauss.","Yale orig. min–max","Yale orig. Gauss.","Yale sel. min–max"],
["0","95.83","94.17","82.22","77.78","91.11"],["1","91.67","89.17","82.22","71.11","88.89"],["2","94.17","91.67","68.89","64.44","82.22"],["3","95.00","90.00","77.78","71.11","82.22"],["4","94.17","92.50","82.22","71.11","84.44"],["5","97.50","92.50","86.67","75.56","91.11"],["6","96.67","90.83","84.44","68.89","84.44"],["7","94.17","92.50","71.11","64.44","84.44"],["8","95.00","91.67","82.22","80.00","91.11"],["9","92.50","90.00","71.11","60.00","75.56"],
["**Mean**","**94.667**","91.500","78.889","70.444","**85.556**"],["Std.","±1.675","±1.434","±5.984","±5.967","±4.792"]];
C.push(table([900,1500,1400,1700,1500,1500],rows3,{size:16}));
C.push(gap(60));
C.push(img("image9.png",5.2,{before:20}));
C.push(CAP("**Fig. 6.** Test accuracy of the ten seeds for min–max scaling (red) and Gaussian normalisation (grey) on (a) ORL and (b) Yale (original Yale set-up); thin horizontal lines mark the means."));
C.push(img("fig_seeds.png",4.9,{before:20}));
C.push(CAP("**Fig. 7.** Distribution of the ten per-seed test accuracies (box = quartiles, dots = seeds; mean ± std at right)."));

C.push(H2("4.3 Yale tuning and augmentation study"));
C.push(P("Because the original Yale result was low, pre-processing (full-frame resize, centre square crop, tighter 80% crop), learning rate (10^−4^ or 10^−3^) and epochs (30 or 60) were varied on a validation split (96 training / 24 validation images from the training part of seeds 0–2; test images unused). Fig. 8a shows that the best setting was the square crop with lr 10^−3^ and 60 epochs (76.4%); the training accuracy reached 100% in every case after 60 epochs. On the ten test splits it gave 84.889% (std 6.577); the slightly tighter 85% crop gave the 85.556% used above, within run-to-run variation."));
C.push(P("A further study tested training-time augmentation (random crop, mirror flip, ±10° rotation, brightness/contrast jitter) with optional dropout (0.3) and weight decay (10^−4^), 80 epochs, validation split as before (mean over seeds 0–2, last three epochs). No augmentation scored best, 77.8%; crop+flip gave 71.8%, full augmentation 69.0% and full augmentation with dropout and weight decay 68.1% (Fig. 8b). The gap between clean training accuracy (97–100%) and validation accuracy grew from 22 to 29 points. Augmentation therefore did not reduce the over-fitting; one possible reason is that the large linear head still memorises the training images, but this was not tested."));
C.push(img("fig_yale.png",5.0,{before:20}));
C.push(CAP("**Fig. 8.** Yale validation studies. (a) Pre-processing, learning rate and epochs (96/24 split, seeds 0–2). (b) Augmentation: clean training accuracy against validation accuracy."));

C.push(H2("4.4 Confusion matrices"));
C.push(P("Fig. 9 shows pooled confusion matrices over ten seeds (1,200 ORL and 450 Yale predictions; Yale class *n* is subject *n*+1). On ORL the errors are scattered single confusions with no systematically misclassified subject. On Yale the off-diagonal confusion is larger; in this tuning run subjects 7 and 8 are often predicted as subject 14, and subject 5 as subject 13."));
C.push(new Table({width:{size:9360,type:WidthType.DXA},columnWidths:[4680,4680],alignment:AlignmentType.CENTER,rows:[new TableRow({children:[
 new TableCell({width:{size:4680,type:WidthType.DXA},borders:{top:{style:BorderStyle.NONE},bottom:{style:BorderStyle.NONE},left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE}},children:[new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:0},children:[imgRun("image10.png",2.0)]}),new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:0},children:rich("(a) ORL, mean accuracy 94.67%",{size:18})})]}),
 new TableCell({width:{size:4680,type:WidthType.DXA},borders:{top:{style:BorderStyle.NONE},bottom:{style:BorderStyle.NONE},left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE}},children:[new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:0},children:[imgRun("image11.png",2.0)]}),new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:0},children:rich("(b) Yale (square-crop tuning run), 84.89%",{size:18})})]})]})]}));
C.push(CAP("**Fig. 9.** Aggregate confusion matrices of MG-QCNN over ten seeds.",{before:30}));

C.push(H1("5. Limitations"));
C.push(P("The quantum part is a noise-free classical simulation with shot noise only at test time, so the numbers are not hardware results. The model over-fits on Yale (100% training accuracy on 120 images against about 85% test accuracy) and augmentation did not help. No ablation or noise study has been run yet, and test loss, precision, recall and F1-score are not yet reported. The final epoch is reported on the test set; a validation split was used for the Yale studies only."));

C.push(H1("6. Future Scope"));
C.push(P("Training here uses simulator backpropagation, which is fast but is not how a quantum processor is trained. Mathematically the gradients are identical to those of the parameter-shift rule, but in practice a real implementation must use the latter, and with 17 circuit runs per patch (9,792 per image per step, Eq. 10) training becomes very slow, as is also noted in the reference work [4]. A natural extension is to add a feature-extraction stage (for example a small learned or fixed classical front-end) that compresses the image before the quantum layer. Since the cost scales linearly with the number of patches *M* (Fig. 4a), reducing 576 patches to 144 or 36 would cut the circuit executions by 4× or 16×, and with a pretrained or fixed front-end only the eight quantum parameters would need shifted runs. An ablation should confirm that the quantum layer still contributes. Other extensions are further quantum layers, pooling and stronger regularisation against the Yale over-fitting."));

C.push(H1("7. Work Plan and Expected Outcomes"));
C.push(CAP("**Table 3.** Proposed work plan.",{before:10,after:30,keepNext:true}));
C.push(table([700,1500,7160],[["Phase","Period","Planned work"],
["1","Oct–Nov 2026","Yale over-fitting study (regularisation, split details); test loss, precision, recall and F1-score for both datasets."],
["2","Nov–Dec 2026","Ablations (without R~X~, without R~Z~, without entanglement, 3×3 kernel) and the single-measurement variant, ten seeds, both datasets; end-semester report."],
["3","Jan–Feb 2027","Finite-shot sweeps, noisy-simulator experiments (depolarising, read-out), parameter-shift training on a small subset, trained filter on a cloud backend if access allows; feature-extraction front-end."],
["4","Mar–Apr 2027","Final evaluation, code documentation, final thesis, paper draft and presentation."]]));
C.push(P("**Expected outcomes.** (1) A verified, documented MG-QCNN implementation with an analytical description of its filter. (2) A statistically sound evaluation over ten splits. (3) Ablations of the R~X~ and R~Z~ rotations, entanglement and kernel size; the reference work reports ORL mean accuracies of 95.959% (full model), 92.917% (3×3 filter), 90.333% (no R~Z~), 89.333% (no R~X~) and 88.417% (no entanglement), which will serve as verification targets. (4) A study of finite shots and hardware-like noise, and a test on a noisy or real backend, which [4] leaves open. (5) A reduced-cost design via feature extraction, and a final thesis and paper-ready report.",{before:70}));
C.push(H1("References"));
const refs=[
"M. Wang and W. Deng, “Deep face recognition: A survey,” *Neurocomputing*, vol. 429, pp. 215–244, Mar. 2021.",
"N. C. Thompson, K. Greenewald, K. Lee, and G. F. Manso, “The computational limits of deep learning,” arXiv:2007.05558, 2020.",
"J. Preskill, “Quantum computing in the NISQ era and beyond,” *Quantum*, vol. 2, p. 79, Aug. 2018.",
"Y. Zhu, A. Bouridane, M. E. Celebi, D. Konar, P. Angelov, Q. Ni, and R. Jiang, “Quantum face recognition with multigate quantum convolutional neural network,” *IEEE Trans. Artif. Intell.*, vol. 5, no. 12, pp. 6330–6341, Dec. 2024.",
"Y. LeCun *et al.*, “Backpropagation applied to handwritten zip code recognition,” *Neural Comput.*, vol. 1, no. 4, pp. 541–551, 1989.",
"Y. Taigman, M. Yang, M. Ranzato, and L. Wolf, “DeepFace: Closing the gap to human-level performance in face verification,” in *Proc. IEEE CVPR*, 2014, pp. 1701–1708.",
"M. Cerezo *et al.*, “Variational quantum algorithms,” *Nat. Rev. Phys.*, vol. 3, no. 9, pp. 625–644, 2021.",
"J. R. McClean, S. Boixo, V. N. Smelyanskiy, R. Babbush, and H. Neven, “Barren plateaus in quantum neural network training landscapes,” *Nat. Commun.*, vol. 9, Art. no. 4812, 2018.",
"Z. Holmes, K. Sharma, M. Cerezo, and P. J. Coles, “Connecting ansatz expressibility to gradient magnitudes and barren plateaus,” *PRX Quantum*, vol. 3, no. 1, Art. no. 010313, 2022.",
"I. Cong, S. Choi, and M. D. Lukin, “Quantum convolutional neural networks,” *Nat. Phys.*, vol. 15, no. 12, pp. 1273–1278, 2019.",
"M. Henderson, S. Shakya, S. Pradhan, and T. Cook, “Quanvolutional neural networks: Powering image recognition with quantum circuits,” *Quantum Mach. Intell.*, vol. 2, no. 1, 2020.",
"D. Mattern *et al.*, “Variational quanvolutional neural networks with enhanced image encoding,” arXiv:2106.07327, 2021.",
"S. Oh, J. Choi, and J. Kim, “A tutorial on quantum convolutional neural networks (QCNN),” in *Proc. ICTC*, 2020, pp. 236–239.",
"S. Y.-C. Chen, T.-C. Wei, C. Zhang, H. Yu, and S. Yoo, “Quantum convolutional neural networks for high energy physics data analysis,” *Phys. Rev. Res.*, vol. 4, no. 1, Art. no. 013231, 2022.",
"A. Senokosov, A. Sedykh, A. Sagingalieva, and A. Melnikov, “Quantum machine learning for image classification,” arXiv:2304.09224, 2023.",
"T. Hur, L. Kim, and D. K. Park, “Quantum convolutional neural network for classical data classification,” *Quantum Mach. Intell.*, vol. 4, no. 1, Art. no. 3, 2022.",
"F. S. Samaria and A. C. Harter, “Parameterisation of a stochastic model for human face identification,” in *Proc. IEEE Workshop Appl. Comput. Vis.*, 1994, pp. 138–142.",
"A. S. Georghiades, P. N. Belhumeur, and D. J. Kriegman, “From few to many: Generative models for recognition under variable pose and illumination,” in *Proc. IEEE Int. Conf. Autom. Face Gesture Recognit.*, 2000, pp. 277–284.",
"D. P. Kingma and J. Ba, “Adam: A method for stochastic optimization,” in *Proc. ICLR*, 2015.",
"V. Bergholm *et al.*, “PennyLane: Automatic differentiation of hybrid quantum-classical computations,” arXiv:1811.04968, 2018.",
"A. Paszke *et al.*, “PyTorch: An imperative style, high-performance deep learning library,” in *Proc. NeurIPS*, vol. 32, 2019, pp. 8026–8037.",
"K. Mitarai, M. Negoro, M. Kitagawa, and K. Fujii, “Quantum circuit learning,” *Phys. Rev. A*, vol. 98, no. 3, Art. no. 032309, 2018.",
"M. Schuld, V. Bergholm, C. Gogolin, J. Izaac, and N. Killoran, “Evaluating analytic gradients on quantum hardware,” *Phys. Rev. A*, vol. 99, no. 3, Art. no. 032331, 2019."];
refs.forEach((t,i)=>C.push(new Paragraph({alignment:AlignmentType.JUSTIFIED,spacing:{after:10,line:220},indent:{left:420,hanging:420},children:rich(`[${i+1}]\t${t}`,{size:16})})));

const doc=new Document({
 creator:"Project team",title:"MG-QCNN Mid-Semester Report",
 styles:{default:{document:{run:{font:FONT,size:SZ}}}},
 numbering:{config:[
  {reference:"b",levels:[{level:0,format:D.LevelFormat.BULLET,text:"•",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:540,hanging:270}}}}]},
  {reference:"n",levels:[{level:0,format:D.LevelFormat.DECIMAL,text:"%1.",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:540,hanging:300}}}}]}]},
 sections:[
  {properties:{page:{size:{width:12240,height:15840},margin:{top:1440,bottom:1440,left:1800,right:1800}}},children:CV},
  {properties:{type:D.SectionType.NEXT_PAGE,page:{size:{width:12240,height:15840},margin:{top:900,bottom:900,left:1300,right:1300},pageNumbers:{start:1}}},
   footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({children:[PageNumber.CURRENT],font:FONT,size:18})]})]})},
   children:C}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);console.log("written",OUT)});
