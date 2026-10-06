import numpy as np
rng=np.random.default_rng(0)
I=np.eye(2);X=np.array([[0,1],[1,0]],complex);Y=np.array([[0,-1j],[1j,0]]);Z=np.diag([1,-1]).astype(complex)
R=lambda P,a: np.cos(a/2)*I-1j*np.sin(a/2)*P
def kron(*m):
    o=np.eye(1)
    for a in m:o=np.kron(o,a)
    return o
def cnot(c,t,n=4):
    d=2**n;U=np.zeros((d,d),complex)
    for b in range(d):
        bits=[(b>>(n-1-i))&1 for i in range(n)]
        if bits[c]:bits[t]^=1
        U[sum(v<<(n-1-i) for i,v in enumerate(bits)),b]=1
    return U
C=cnot(2,3)@cnot(1,2)@cnot(0,1)
def circuit(x,th):
    psi=np.zeros(16,complex);psi[0]=1
    psi=kron(*[R(Y,x[i]) for i in range(4)])@psi
    psi=kron(*[R(X,th[2*i+1])@R(Z,th[2*i]) for i in range(4)])@psi
    psi=C@psi
    return np.array([np.real(psi.conj()@kron(*[Z if j==k else I for j in range(4)])@psi) for k in range(4)])
def closed(x,th):
    s=np.cos(th[1::2])*np.cos(x)+np.sin(th[1::2])*np.sin(th[0::2])*np.sin(x)
    return np.cumprod(s)
err=0;gerr=0
for _ in range(200):
    x=rng.uniform(-np.pi,np.pi,4);th=rng.normal(size=8)
    err=max(err,np.abs(circuit(x,th)-closed(x,th)).max())
    for m in range(8):
        e=np.zeros(8);e[m]=np.pi/2
        ps=0.5*(circuit(x,th+e)-circuit(x,th-e))
        h=1e-6;e2=np.zeros(8);e2[m]=h
        fd=(closed(x,th+e2)-closed(x,th-e2))/(2*h)
        gerr=max(gerr,np.abs(ps-fd).max())
print("max |circuit - closed form| =",err)
print("max |param-shift - finite diff of closed form| =",gerr)
