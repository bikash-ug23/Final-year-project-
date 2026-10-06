import zipfile,re,sys,shutil
src,dst=sys.argv[1],sys.argv[2]
def sub(lbl):
    if '_' in lbl:
        b,s=lbl.split('_');return f'<m:sSub><m:sSubPr/><m:e><m:r><m:t>{b}</m:t></m:r></m:e><m:sub><m:r><m:t>{s}</m:t></m:r></m:sub></m:sSub>'
    return f'<m:r><m:t>{lbl}</m:t></m:r>'
def ket(m):
    return f'<m:d><m:dPr><m:begChr m:val="|"/><m:endChr m:val="⟩"/></m:dPr><m:e>{sub(m.group(1))}</m:e></m:d>'
bra='<m:d><m:dPr><m:begChr m:val="⟨"/><m:sepChr m:val="|"/><m:endChr m:val="⟩"/></m:dPr><m:e><m:r><m:t>ψ</m:t></m:r></m:e><m:e><m:sSub><m:sSubPr/><m:e><m:r><m:t>Z</m:t></m:r></m:e><m:sub><m:r><m:t>k</m:t></m:r></m:sub></m:sSub></m:e><m:e><m:r><m:t>ψ</m:t></m:r></m:e></m:d>'
zin=zipfile.ZipFile(src);zout=zipfile.ZipFile(dst,'w',zipfile.ZIP_DEFLATED)
n=0
for it in zin.infolist():
    d=zin.read(it.filename)
    if it.filename=='word/document.xml':
        x=d.decode('utf8')
        x,n1=re.subn(r'<m:r><m:t[^>]*>§KET:(.*?)§</m:t></m:r>',ket,x)
        x,n2=re.subn(r'<m:r><m:t[^>]*>§BRAKET§</m:t></m:r>',lambda m:bra,x)
        assert '§' not in x; print('kets',n1,'braket',n2); d=x.encode('utf8')
    zout.writestr(it,d)
zout.close()
