import fs from 'fs';
const s = fs.readFileSync('f:/ec2/frontend/src/pages/Dashboard.jsx','utf8').split('\n');
let paren = 0, brace = 0;
for(let i=0;i<s.length;i++){
  const l = s[i];
  for(const ch of l){ if(ch==='(') paren++; if(ch===')') paren--; if(ch==='{') brace++; if(ch==='}') brace--; }
  if(i>1100) console.log((i+1)+" paren="+paren+" brace="+brace+" | "+l);
}
console.log('final',paren,brace);
