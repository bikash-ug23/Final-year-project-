import numpy as np, matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.rcParams.update({"font.family":"serif","font.size":9,"axes.grid":True,"grid.alpha":.3,"axes.spines.top":False,"axes.spines.right":False,"savefig.dpi":220})
BL,RD,GR,GY="#1f4e9c","#c62828","#2e7d32","#8a8f98"
O=__import__("sys").argv[1]

# Fig A: filter response
fig,ax=plt.subplots(1,2,figsize=(6.6,2.25),gridspec_kw={"width_ratios":[1.15,1]})
x=np.linspace(-np.pi,np.pi,400)
for (t,p,c) in [(0.0,0.0,BL),(1.0,0.8,RD),(2.0,-1.2,GR)]:
    ax[0].plot(x,np.cos(p)*np.cos(x)+np.sin(p)*np.sin(t)*np.sin(x),c=c,label=fr"$\theta_Z={t:.1f},\ \theta_X={p:.1f}$")
ax[0].set_xlabel("pixel angle $x_i$ (rad)");ax[0].set_ylabel(r"single-qubit $s_i=\langle Z\rangle$");ax[0].legend(fontsize=7,loc="lower center",ncol=1);ax[0].set_title("(a) per-pixel response",fontsize=9)
th=np.array([1.0,.8,-.6,1.3])  # RZ,RX for qubit0 and qubit1
g=np.linspace(-np.pi,np.pi,200);X0,X1=np.meshgrid(g,g)
s0=np.cos(th[1])*np.cos(X0)+np.sin(th[1])*np.sin(th[0])*np.sin(X0)
s1=np.cos(th[3])*np.cos(X1)+np.sin(th[3])*np.sin(th[2])*np.sin(X1)
im=ax[1].imshow(s0*s1,extent=[-np.pi,np.pi,-np.pi,np.pi],origin="lower",cmap="RdBu_r",vmin=-1,vmax=1,aspect="auto")
ax[1].grid(False);ax[1].set_xlabel("$x_0$");ax[1].set_ylabel("$x_1$");ax[1].set_title(r"(b) $f_1=s_0\,s_1$ (entangled)",fontsize=9)
plt.colorbar(im,ax=ax[1],fraction=.046);plt.tight_layout();plt.savefig(f"{O}/fig_filter.png");plt.close()

# Fig B: cost + shots
fig,ax=plt.subplots(1,2,figsize=(6.6,2.25))
S=np.array([8,12,16,24,32,48]);P=(S//2)**2;runs=17*P
ax[0].loglog(P,runs,"o-",c=BL,label="parameter shift: $17M$")
ax[0].loglog(P,P,"s--",c=GY,label="forward pass only: $M$")
ax[0].annotate("48×48: 9,792",(576,9792),(40,6000),fontsize=7,arrowprops=dict(arrowstyle="->",lw=.6))
ax[0].set_xticks([16,36,64,144,256,576]);ax[0].set_xticklabels(["16","36","64","144","256","576"],fontsize=7);ax[0].minorticks_off()
ax[0].set_xlabel("patches per image $M$");ax[0].set_ylabel("circuit runs / image / step");ax[0].legend(fontsize=7);ax[0].set_title("(a) cost on hardware",fontsize=9)
N=np.logspace(1,4.5,200)
for f,c in [(0.0,RD),(0.6,BL),(0.9,GR)]:
    ax[1].loglog(N,np.sqrt((1-f**2)/N),c=c,label=f"$f={f}$")
ax[1].axvline(1000,c="k",lw=.8,ls=":");ax[1].text(1100,0.2,"1000 shots\n$\\sigma\\leq0.032$",fontsize=7)
ax[1].set_xlabel("shots $N_s$");ax[1].set_ylabel(r"std. dev. of estimate of $f$");ax[1].legend(fontsize=7,loc="lower left");ax[1].set_title("(b) shot noise",fontsize=9)
plt.tight_layout();plt.savefig(f"{O}/fig_cost.png");plt.close()

# Fig C: per-seed accuracy
orl=[95.83,91.67,94.17,95.00,94.17,97.50,96.67,94.17,95.00,92.50]
yo=[82.22,82.22,68.89,77.78,82.22,86.67,84.44,71.11,82.22,71.11]
yf=[91.11,88.89,82.22,82.22,84.44,91.11,84.44,84.44,91.11,75.56]
fig,ax=plt.subplots(figsize=(6.6,2.0))
data=[orl,yo,yf];lab=["ORL\n(30 ep, lr 1e-3)","Yale original\n(30 ep, lr 1e-4)","Yale selected\n(60 ep, lr 1e-3)"];cols=[BL,GY,RD]
bp=ax.boxplot(data,orientation="horizontal",widths=.5,patch_artist=True,showfliers=False)
for b,c in zip(bp["boxes"],cols):b.set_facecolor(c);b.set_alpha(.25);b.set_edgecolor(c)
for m in bp["medians"]:m.set_color("k")
r=np.random.default_rng(1)
for i,(d,c) in enumerate(zip(data,cols),1):
    ax.scatter(d,i+r.uniform(-.12,.12,len(d)),c=c,s=16,zorder=3)
    ax.text(100.5,i,["94.67 ± 1.68","78.89 ± 5.98","85.56 ± 4.79"][i-1],va="center",fontsize=8)
ax.set_yticks([1,2,3]);ax.set_yticklabels(lab,fontsize=8);ax.set_xlim(65,108);ax.set_xlabel("test accuracy (%), 1000 shots, 10 seeds");ax.invert_yaxis()
plt.tight_layout();plt.savefig(f"{O}/fig_seeds.png");plt.close()

# Fig D: Yale tuning + augmentation
fig,ax=plt.subplots(1,2,figsize=(6.6,2.35),gridspec_kw={"width_ratios":[1.25,1]})
cfg=["resize\n1e-4","resize\n1e-3","square\n1e-4","square\n1e-3","tight\n1e-4","tight\n1e-3"]
v30=[65.3,73.6,69.4,73.6,70.8,73.6];v60=[73.6,73.6,72.2,76.4,75.0,73.6]
i=np.arange(6);ax[0].bar(i-.2,v30,.4,color=GY,label="30 epochs");ax[0].bar(i+.2,v60,.4,color=BL,label="60 epochs")
ax[0].set_xticks(i);ax[0].set_xticklabels(cfg,fontsize=7);ax[0].set_ylim(60,80);ax[0].set_ylabel("validation accuracy (%)");ax[0].legend(fontsize=7,loc="upper left");ax[0].set_title("(a) crop / learning-rate / epochs",fontsize=9)
nm=["none","crop\n+flip","full","full+drop\n+wd"];val=[77.8,71.8,69.0,68.1];tr=[100,100,97.9,97.2]
j=np.arange(4);ax[1].bar(j-.2,tr,.4,color=GR,label="clean train");ax[1].bar(j+.2,val,.4,color=RD,label="validation")
for k in range(4):ax[1].text(k+.2,val[k]+1,f"{val[k]:.1f}",ha="center",fontsize=7)
ax[1].set_xticks(j);ax[1].set_xticklabels(nm,fontsize=7);ax[1].set_ylim(50,118);ax[1].set_yticks([50,60,70,80,90,100]);ax[1].legend(fontsize=7,loc="upper center",ncol=2,frameon=False);ax[1].set_title("(b) augmentation (Yale)",fontsize=9)
plt.tight_layout();plt.savefig(f"{O}/fig_yale.png");plt.close()
print("ok")
