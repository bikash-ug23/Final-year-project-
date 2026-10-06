import numpy as np, matplotlib, sys; matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.rcParams.update({"font.family":["Liberation Serif","DejaVu Serif"],"font.size":13,"axes.grid":True,"grid.alpha":.25,"axes.spines.top":False,"axes.spines.right":False,"savefig.dpi":220})
RD,SL,GY="#C62828","#455A64","#90A4AE"
O=sys.argv[1]
orl=[95.83,91.67,94.17,95.00,94.17,97.50,96.67,94.17,95.00,92.50]
yf=[91.11,88.89,82.22,82.22,84.44,91.11,84.44,84.44,91.11,75.56]
fig,ax=plt.subplots(1,2,figsize=(9.0,2.6),gridspec_kw={"width_ratios":[1.15,1]})
a=ax[0];data=[orl,yf];cols=[SL,RD]
bp=a.boxplot(data,orientation="horizontal",widths=.5,patch_artist=True,showfliers=False)
for b,c in zip(bp["boxes"],cols):b.set_facecolor(c);b.set_alpha(.25);b.set_edgecolor(c)
for m in bp["medians"]:m.set_color("k")
r=np.random.default_rng(1)
for i,(d,c) in enumerate(zip(data,cols),1):
    a.scatter(d,i+r.uniform(-.12,.12,10),c=c,s=30,zorder=3)
a.set_yticks([1,2]);a.set_yticklabels(["ORL\n94.67 ± 1.68","Yale\n85.56 ± 4.79"]);a.set_xlim(72,100);a.set_xlabel("test accuracy (%), 10 seeds");a.invert_yaxis();a.set_title("(a) per-seed accuracy",fontsize=12)
nm=["none","crop\n+flip","full","full+drop\n+wd"];val=[77.8,71.8,69.0,68.1];tr=[100,100,97.9,97.2];j=np.arange(4)
b=ax[1];b.bar(j-.2,tr,.4,color=GY,label="clean train");b.bar(j+.2,val,.4,color=RD,label="validation")
for k in range(4):b.text(k+.2,val[k]+1.2,f"{val[k]:.1f}",ha="center",fontsize=11)
b.set_xticks(j);b.set_xticklabels(nm,fontsize=10);b.set_ylim(50,118);b.set_yticks([50,60,70,80,90,100]);b.legend(fontsize=10,loc="upper center",ncol=2,frameon=False);b.set_title("(b) Yale augmentation study",fontsize=12)
plt.tight_layout();plt.savefig(f"{O}/s_yale2.png");plt.close();print("ok")
