// Generate a public build log from this repository. No account analytics needed.
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const repository='https://github.com/muhammetaycn/muhammet-kirikli-portfolio';
const output=execFileSync(process.env.GIT_BINARY||'git',['log','--max-count=2000','--format=%H\t%cI\t%s','--','.',':(exclude)data/activity.json'],{cwd:root,encoding:'utf8'});
const calendar=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'});
const days=new Map();
for(const line of output.trim().split('\n')){
  const [sha,stamp,...parts]=line.replace(/\r$/,'').split('\t');
  if(!/^[a-f0-9]{40}$/.test(sha)||!Number.isFinite(Date.parse(stamp)))continue;
  const dateParts=calendar.formatToParts(new Date(stamp));
  const get=type=>dateParts.find(part=>part.type===type).value;
  const date=`${get('year')}-${get('month')}-${get('day')}`;
  if(!days.has(date))days.set(date,{date,count:0,events:[]});
  const day=days.get(date);day.count++;day.events.push({sha,title:parts.join('\t').slice(0,180),url:repository+'/commit/'+sha});
}
if(!days.size)throw new Error('No repository commits found; existing activity data was preserved.');
const data={source:'Bu portföyün GitHub geliştirme kayıtları',metric:'repository_commits',repository,generatedAt:new Date().toISOString(),days:[...days.values()].sort((a,b)=>a.date.localeCompare(b.date))};
fs.writeFileSync(path.join(root,'data/activity.json'),JSON.stringify(data,null,2)+'\n');
console.log(`Saved ${data.days.length} build days / ${data.days.reduce((sum,day)=>sum+day.count,0)} source commits.`);
