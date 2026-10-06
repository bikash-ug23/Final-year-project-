import numpy as np, matplotlib, sys; matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.rcParams.update({"font.family":["Liberation Serif","DejaVu Serif"],"font.size":13,"axes.grid":True,"grid.alpha":.25,"axes.spines.top":False,"axes.spines.right":False,"savefig.dpi":220,"mathtext.fontset":"stix"})
RD,SL,GY,GN,PK="#C62828","#455A64","#90A4AE","#2E7D32","#FDECEA"
O=sys.argv[1]
# ---- scaling illustration (synthetic) ----
rng=np.random.default_rng(3)
a=np.clip(np.concatenate([rng.normal(70,28,6000),rng.normal(150,45,9000)]),0,255)
mu,sd=a.mean(),a.std()
mm=np.pi*(2*(a-a.min())/(a.max()-a.min())-1)
zz=np.pi*np.clip((a-mu)/sd,-1,1)
sat=np.mean(np.abs((a-mu)/sd)>1)*100
fig,ax=plt.subplots(1,3,figsize=(9.0,2.7))
ax[0].hist(a,bins=40,color=GY);ax[0].axvline(mu,c=SL,lw=1.5);ax[0].set_xlabel("gray level $a$");ax[0].set_ylabel("pixels");ax[0].set_title("(a) pixel values",fontsize=13)
g=np.linspace(0,255,300)
ax[1].plot(g,np.pi*(2*(g-a.min())/(a.max()-a.min())-1),c=RD,lw=2.5,label="min–max")
ax[1].plot(g,np.pi*np.clip((g-mu)/sd,-1,1),c=SL,lw=2.5,ls="--",label="z-score, clipped")
ax[1].axvspan(0,mu-sd,color=PK,alpha=.9);ax[1].axvspan(mu+sd,255,color=PK,alpha=.9)
ax[1].set_xlabel("gray level $a$");ax[1].set_ylabel("angle $x$ (rad)");ax[1].set_yticks([-np.pi,0,np.pi]);ax[1].set_yticklabels(["−π","0","π"]);ax[1].legend(fontsize=10,loc="upper left",frameon=False);ax[1].set_title("(b) pixel → angle",fontsize=13)
b=np.linspace(-np.pi,np.pi,25)
ax[2].hist(mm,bins=b,color=RD,alpha=.85,label="min–max");ax[2].hist(zz,bins=b,color=SL,alpha=.6,label="z-score");ax[2].set_xticks([-np.pi,0,np.pi]);ax[2].set_xticklabels(["−π","0","π"]);ax[2].set_xlabel("angle $x$");ax[2].legend(fontsize=10,frameon=False);ax[2].set_title("(c) angle spread",fontsize=13)
ax[2].set_yticklabels([])
plt.tight_layout(w_pad=1.2);plt.savefig(f"{O}/s_scaling.png");plt.close();print("sat%",sat)
# ---- filter response ----
fig,ax=plt.subplots(1,2,figsize=(9.0,2.5),gridspec_kw={"width_ratios":[1.2,1]})
x=np.linspace(-np.pi,np.pi,400)
for (t,p,c) in [(0.0,0.0,SL),(1.0,0.8,RD),(2.0,-1.2,GN)]:
    ax[0].plot(x,np.cos(p)*np.cos(x)+np.sin(p)*np.sin(t)*np.sin(x),c=c,lw=2.2)
ax[0].set_xlabel("pixel angle $x_i$");ax[0].set_ylabel("$s_i=\\langle Z\\rangle$");ax[0].set_xticks([-np.pi,0,np.pi]);ax[0].set_xticklabels(["−π","0","π"]);ax[0].set_title("(a) one pixel, three parameter settings",fontsize=12)
th=np.array([1.0,.8,-.6,1.3]);g=np.linspace(-np.pi,np.pi,200);X0,X1=np.meshgrid(g,g)
s0=np.cos(th[1])*np.cos(X0)+np.sin(th[1])*np.sin(th[0])*np.sin(X0);s1=np.cos(th[3])*np.cos(X1)+np.sin(th[3])*np.sin(th[2])*np.sin(X1)
im=ax[1].imshow(s0*s1,extent=[-np.pi,np.pi,-np.pi,np.pi],origin="lower",cmap="RdBu_r",vmin=-1,vmax=1,aspect="auto");ax[1].grid(False)
ax[1].set_xlabel("$x_0$");ax[1].set_ylabel("$x_1$");ax[1].set_title("(b) $f_1=s_0s_1$: two pixels combined",fontsize=12)
ax[1].set_xticks([-np.pi,0,np.pi]);ax[1].set_xticklabels(["−π","0","π"]);ax[1].set_yticks([-np.pi,0,np.pi]);ax[1].set_yticklabels(["−π","0","π"])
plt.colorbar(im,ax=ax[1],fraction=.046);plt.tight_layout();plt.savefig(f"{O}/s_filter.png");plt.close()
# ---- seeds ----
orl=[95.83,91.67,94.17,95.00,94.17,97.50,96.67,94.17,95.00,92.50]
yo=[82.22,82.22,68.89,77.78,82.22,86.67,84.44,71.11,82.22,71.11]
yf=[91.11,88.89,82.22,82.22,84.44,91.11,84.44,84.44,91.11,75.56]
fig,ax=plt.subplots(figsize=(9.0,3.0))
data=[orl,yo,yf];lab=["ORL","Yale – original\n(lr 1e-4, 30 ep)","Yale – selected\n(lr 1e-3, 60 ep)"];cols=[SL,GY,RD]
bp=ax.boxplot(data,orientation="horizontal",widths=.5,patch_artist=True,showfliers=False)
for bx,c in zip(bp["boxes"],cols):bx.set_facecolor(c);bx.set_alpha(.25);bx.set_edgecolor(c)
for m in bp["medians"]:m.set_color("k")
r=np.random.default_rng(1)
for i,(d,c) in enumerate(zip(data,cols),1):
    ax.scatter(d,i+r.uniform(-.12,.12,10),c=c,s=34,zorder=3)
    ax.text(100.8,i,["94.67 ± 1.68","78.89 ± 5.98","85.56 ± 4.79"][i-1],va="center",fontsize=13,fontweight="bold",color=c if c!=GY else SL)
ax.set_yticks([1,2,3]);ax.set_yticklabels(lab);ax.set_xlim(65,109);ax.set_xlabel("test accuracy (%) per seed, 10 seeds, 1000 shots");ax.invert_yaxis()
plt.tight_layout();plt.savefig(f"{O}/s_seeds.png");plt.close()
# ---- yale ----
fig,ax=plt.subplots(1,2,figsize=(9.0,3.1),gridspec_kw={"width_ratios":[1.25,1]})
cfg=["resize\n1e-4","resize\n1e-3","square\n1e-4","square\n1e-3","tight\n1e-4","tight\n1e-3"]
v30=[65.3,73.6,69.4,73.6,70.8,73.6];v60=[73.6,73.6,72.2,76.4,75.0,73.6];i=np.arange(6)
ax[0].bar(i-.2,v30,.4,color=GY,label="30 epochs");ax[0].bar(i+.2,v60,.4,color=[RD if k==3 else SL for k in range(6)],label="60 epochs")
ax[0].set_xticks(i);ax[0].set_xticklabels(cfg,fontsize=10);ax[0].set_ylim(60,80);ax[0].set_ylabel("validation accuracy (%)");ax[0].set_title("(a) crop · learning rate · epochs",fontsize=12)
ax[0].legend(fontsize=10,loc="upper left",frameon=False)
nm=["none","crop\n+flip","full","full+drop\n+wd"];val=[77.8,71.8,69.0,68.1];tr=[100,100,97.9,97.2];j=np.arange(4)
ax[1].bar(j-.2,tr,.4,color=GY,label="clean train");ax[1].bar(j+.2,val,.4,color=RD,label="validation")
for k in range(4):ax[1].text(k+.2,val[k]+1.2,f"{val[k]:.1f}",ha="center",fontsize=11)
ax[1].set_xticks(j);ax[1].set_xticklabels(nm,fontsize=10);ax[1].set_ylim(50,118);ax[1].set_yticks([50,60,70,80,90,100]);ax[1].legend(fontsize=10,loc="upper center",ncol=2,frameon=False);ax[1].set_title("(b) augmentation",fontsize=12)
plt.tight_layout();plt.savefig(f"{O}/s_yale.png");plt.close()
# ---- cost ----
fig,ax=plt.subplots(1,2,figsize=(9.0,3.0))
P=np.array([16,36,64,144,256,576])
ax[0].loglog(P,17*P,"o-",c=RD,lw=2.5,label="parameter shift: 17·M");ax[0].loglog(P,P,"s--",c=SL,lw=2,label="forward only: M")
ax[0].annotate("48×48 image\n9,792 runs",(576,9792),(26,2800),fontsize=11,arrowprops=dict(arrowstyle="->",lw=1))
ax[0].set_xticks(P);ax[0].set_xticklabels([str(p) for p in P],fontsize=10);ax[0].minorticks_off();ax[0].set_xlabel("patches per image $M$");ax[0].set_ylabel("circuit runs per step");ax[0].legend(fontsize=10,loc="lower right",frameon=False);ax[0].set_title("(a) cost grows with patches",fontsize=12)
N=np.logspace(1,4.5,200)
for f,c in [(0.0,RD),(0.6,SL),(0.9,GN)]:ax[1].loglog(N,np.sqrt((1-f**2)/N),c=c,lw=2.2,label=f"f = {f}")
ax[1].axvline(1000,c="k",lw=1,ls=":");ax[1].text(1150,.2,"1000 shots\nσ ≤ 0.032",fontsize=11)
ax[1].set_xlabel("shots $N_s$");ax[1].set_ylabel("std. dev. of estimate");ax[1].legend(fontsize=10,loc="lower left",frameon=False);ax[1].set_title("(b) shot noise",fontsize=12)
plt.tight_layout();plt.savefig(f"{O}/s_cost.png");plt.close()
print("done")
