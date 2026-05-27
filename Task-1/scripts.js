document.addEventListener('DOMContentLoaded',()=>{
  AOS.init({duration:700,once:true});
  initTheme();
  initCounters();
  initProjectGrid();
  initFilters();
  initScrollProgress();
  // fetchGitHubStats('rayidikavya'); // replace with your GitHub username
  initParticles();
});

function initTheme(){
  const btn=document.getElementById('theme-toggle');
  const current=localStorage.getItem('theme')||'dark';
  setTheme(current);
  if(btn){
    btn.addEventListener('click',()=>{ setTheme(document.documentElement.dataset.theme==='dark' ? 'light' : 'dark'); });
    btn.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); } });
  }
}
function setTheme(t){
  document.documentElement.dataset.theme=t;
  // mirror as class for easier selectors if needed
  document.documentElement.classList.toggle('light-theme', t === 'light');
  localStorage.setItem('theme',t);
  const btn = document.getElementById('theme-toggle');
  if(btn){
    btn.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
    btn.innerHTML = t==='dark'?'<i class="fa-solid fa-moon"></i>':'<i class="fa-solid fa-sun"></i>';
  }
}

function initCounters(){
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.querySelectorAll('.counter').forEach(el=>animateCounter(el));
        obs.unobserve(entry.target);
      }
    });
  },{threshold:0.3});
  document.querySelectorAll('#skills .skills-grid').forEach(s=>obs.observe(s));
}
function animateCounter(el){
  const card=el.closest('.skill-card');
  const target=+card.dataset.target||+el.dataset.target||75;
  let val=0;const step=Math.ceil(target/60);
  const iv=setInterval(()=>{val+=step;el.textContent=val+'%';if(val>=target){el.textContent=target+'%';clearInterval(iv)}},16);
}

const PROJECTS = [
  {title:'Portfolio Website',desc:'Personal portfolio with animations',tags:['web'],live:'#',repo:'#'},
  {title:'ML Classifier',desc:'Model predicting X using Python',tags:['ml'],live:'#',repo:'#'},
  {title:'Task Manager',desc:'Full stack Node.js app',tags:['web'],live:'#',repo:'#'}
];

function initProjectGrid(){
  const grid=document.getElementById('projects-grid');
  grid.innerHTML='';
  PROJECTS.forEach(p=>{
    const div=document.createElement('div');div.className='project-card glass-card';
    div.dataset.tags=p.tags.join(' ');
    div.innerHTML=`<h4>${p.title}</h4><p>${p.desc}</p><p><a class='btn ghost' href='${p.live}'>Live Demo</a> <a class='btn ghost' href='${p.repo}'>Source</a></p>`;
    grid.appendChild(div);
  });
}

function initFilters(){
  document.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f=btn.dataset.filter;
      document.querySelectorAll('.project-card').forEach(card=>{
        if(f==='all' || card.dataset.tags.includes(f)) card.style.display='block'; else card.style.display='none';
      });
    });
  });
}

function initScrollProgress(){
  const bar=document.getElementById('progress-bar');
  window.addEventListener('scroll',()=>{
    const h=document.documentElement;const percent=(h.scrollTop/(h.scrollHeight - h.clientHeight))*100||0;
    bar.style.width = percent + '%';
  },{passive:true});
}

async function fetchGitHubStats(username){
  const el=document.getElementById('github-stats');
  try{
    const u = await fetch(`https://api.github.com/users/${username}`); if(!u.ok) throw 0;
    const data=await u.json();
    el.innerHTML = `<strong>@${data.login}</strong><div>${data.public_repos} repos • ${data.followers} followers</div><a href='${data.html_url}' class='btn ghost' target='_blank' rel='noopener'>View GitHub</a>`;
  }catch(e){el.textContent='GitHub stats unavailable — replace username.'}
}

function initParticles(){
  if(window.particlesJS){
    particlesJS('particles-js',{particles:{number:{value:50},color:{value:['#8b5cf6','#06b6d4']},opacity:{value:0.6},size:{value:3},line_linked:{enable:true,color:'#6366f1'}},interactivity:{events:{onhover:{enable:true,mode:'repulse'}}}});
  }
}
