// Utility: select
const $ = (q, ctx = document) => ctx.querySelector(q);
const $$ = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

// Mobile nav
const navToggle = $("#navToggle");
const navMenu = $("#navMenu");
if (navToggle && navMenu){
  navToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
}

// Year
$("#year").textContent = new Date().getFullYear();

// Back to top
const toTop = $("#toTop");
window.addEventListener("scroll", () => {
  if (window.scrollY > 500) toTop.classList.add("show");
  else toTop.classList.remove("show");
});
toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// Theme toggle
const themeToggle = $("#themeToggle");
const themeKey = "bk-theme";
function applyTheme(mode){
  document.documentElement.dataset.theme = mode;
  localStorage.setItem(themeKey, mode);
}
applyTheme(localStorage.getItem(themeKey) || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeToggle?.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme;
  applyTheme(current === "dark" ? "light" : "dark");
});

// Animate skill bars on view
const bars = $$(".bar");
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>e.isIntersecting && e.target.classList.add("in-view"));
},{threshold:.6});
bars.forEach(b=>io.observe(b));

// Project filtering + load from JSON
const grid = $("#projectGrid");
const filters = $$(".filter");
let allProjects = [];
function renderProjects(items){
  grid.innerHTML = items.map(p => `
    <article class="project-card" data-tags="${p.tags.join(" ").toLowerCase()}">
      <img src="${p.image}" alt="${p.title} preview" loading="lazy" />
      <div class="pc-body">
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="tags">
          ${p.tags.map(t=>`<span class="tag">${t}</span>`).join("")}
        </div>
        <div class="actions">
          ${p.demo ? `<a class="btn primary" href="${p.demo}" target="_blank" rel="noopener">Live</a>` : ""}
          ${p.source ? `<a class="btn" href="${p.source}" target="_blank" rel="noopener">Code</a>` : ""}
        </div>
      </div>
    </article>
  `).join("");
}
fetch("assets/data/projects.json")
  .then(r=>r.json())
  .then(data => {
    allProjects = data;
    renderProjects(allProjects);
  })
  .catch(()=>{
    // fallback demo projects
    allProjects = [{
      title:"Django CRUD & Auth",
      description:"User auth, role-based access, and CRUD with DRF.",
      tags:["Full‑Stack","Django","REST"],
      demo:"#", source:"#", image:"assets/img/project-1.webp"
    },{
      title:"React + FastAPI",
      description:"SPA with JWT auth and Postgres.",
      tags:["Full‑Stack","React","API"],
      demo:"#", source:"#", image:"assets/img/project-2.webp"
    },{
      title:"Portfolio Website",
      description:"Responsive, accessible, and fast portfolio.",
      tags:["Frontend","HTML","CSS","JS"],
      demo:"#", source:"#", image:"assets/img/project-3.webp"
    }];
    renderProjects(allProjects);
  });

filters.forEach(btn => {
  btn.addEventListener("click", () => {
    filters.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.filter;
    if (f === "all") renderProjects(allProjects);
    else renderProjects(allProjects.filter(p => p.tags.map(t=>t.toLowerCase()).includes(f)));
  });
});

// Contact form (frontend validation only)
const form = $("#contactForm");
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#name");
  const email = $("#email");
  const message = $("#message");
  let ok = true;

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errs = { name:"", email:"", message:"" };

  if (!name.value.trim()) { ok=false; errs.name="Please enter your name"; }
  if (!emailRe.test(email.value)) { ok=false; errs.email="Enter a valid email"; }
  if (message.value.trim().length < 10) { ok=false; errs.message="Tell me a bit more"; }

  $$(".error").forEach(el => el.textContent = "");
  for (const [k,v] of Object.entries(errs)){
    if (v) $(`.error[data-for="${k}"]`).textContent = v;
  }

  const status = $("#formStatus");
  if (ok){
    status.textContent = "Thanks! Your message is ready to be sent.";
    // TODO: Hook this to a backend (Django/Flask) or service like Formspree
    form.reset();
  }else{
    status.textContent = "Please fix the errors above.";
  }
});
