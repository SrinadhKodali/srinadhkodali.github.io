
(() => {
  const $ = (selector) => document.querySelector(selector);

  const esc = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);

  const url = (value) => {
    const v = String(value || "").trim();
    return /^(https?:\/\/|\/|[\w.-]+\.pdf$)/i.test(v) ? v : "";
  };

  const pct = (value) =>
    Number.isFinite(Number(value))
      ? Math.max(0, Math.min(100, Number(value)))
      : 50;

  const load = (name) =>
    fetch("data/" + name + ".json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw Error(name);
        return response.json();
      });

  Promise.all([
    "site",
    "research",
    "experience",
    "education",
    "publications"
  ].map(load))
    .then(([s, r, x, e, p]) => {

      // Website title and navigation
      document.title =
        (s.name || "Srinadh Kodali") + " | Plant & Soil Scientist";

      $(".brand").innerHTML =
        esc(s.name || "Srinadh Kodali") + "<span>.</span>";

      // Homepage
      $(".hero .eyebrow").textContent = s.eyebrow || "";
      $(".hero h1").textContent = s.name || "";
      $(".hero p").textContent = s.headline || "";
      $(".hero .meta").textContent = s.role || "";

      $(".hero .button.secondary").href =
        url(s.resume) || "Kodali_WREC_Resume.pdf";

      // Homepage background image positioning
      if (s.hero_image) {
        $(".hero").style.backgroundImage =
          `linear-gradient(
            90deg,
            rgba(16,30,41,.93),
            rgba(16,30,41,.64)
          ),url("${encodeURI(s.hero_image)}")`;

        $(".hero").style.backgroundSize = "cover";

        $(".hero").style.backgroundPosition =
          `${pct(s.hero_position_x)}% ${pct(s.hero_position_y)}%`;
      }

      // About section
      $("#about h2").textContent = s.about_heading || "";
      $("#about .lead").textContent = s.about_intro || "";
      $("#about .lead + p").textContent = s.about_more || "";

      // Education card
      const edu = $("#about .card");

      edu.innerHTML =
        '<div class="section-label">Education</div>' +
        e.map((z) => `
          <h3 style="margin-top:20px">${esc(z.degree)}</h3>
          <p>${esc(z.institution)} · ${esc(z.date)}</p>
        `).join("") +
        `<div style="
          border-top:1px solid var(--border);
          margin-top:26px;
          padding-top:20px
        ">
          <strong>Research focus</strong>
          <p id="research-focus-text"></p>
        </div>`;

      // Research Focus: dynamically updated from Pages CMS
      const researchFocus = document.getElementById(
        "research-focus-text"
      );

      if (researchFocus) {
        researchFocus.textContent =
          s.research_focus ??
          "Soil fertility · Crop nutrition · Cropping systems · Data-driven decision support";
      }

      // Research projects
      $("#research .lead").textContent =
        s.research_intro || "";

      $("#research .grid").innerHTML = r.map((z) => `
        <article class="card">
          ${z.image
            ? `<img
                class="project-img"
                src="${esc(url(z.image))}"
                alt="${esc(z.title)}"
                loading="lazy"
              >`
            : ""
          }
          <span class="tag">${esc(z.category)}</span>
          <h3>${esc(z.title)}</h3>
          <p>${esc(z.description)}</p>
        </article>
      `).join("");

      // Professional experience
      $("#experience .timeline").innerHTML = x.map((z) => `
        <div class="entry">
          <strong>${esc(z.title)}</strong>
          <small>
            ${esc(z.organization)} · ${esc(z.period)}
          </small>
          <p>${esc(z.description)}</p>
        </div>
      `).join("");

      // Technical skills
      $("#experience .skills").innerHTML =
        (s.skills || []).map((z) =>
          `<span>${esc(z)}</span>`
        ).join("");

      // Extension and outreach
      $("#experience .card p").textContent =
        s.extension || "";

      // Publications
      $("#publications .container").innerHTML =
        '<div class="section-label">Scholarship</div>' +
        '<h2>Selected peer-reviewed publications</h2>' +
        p.map((z) => `
          <div class="pub">
            <strong>${esc(z.authors)}</strong>
            <div>
              ${esc(z.title)}
              <em>${esc(z.journal)}</em>
            </div>
            ${url(z.url)
              ? `<a
                  href="${esc(url(z.url))}"
                  target="_blank"
                  rel="noopener"
                >Read publication ↗</a>`
              : ""
            }
          </div>
        `).join("");

      // Contact information
      $("#contact p:nth-of-type(2)").innerHTML =
        `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a> · ${esc(s.location)}`;

      $("#contact .button").href = "mailto:" + s.email;

      $("#contact .button.secondary").href =
        url(s.resume) || "Kodali_WREC_Resume.pdf";

      // Professional headshot
      if (s.headshot) {
        const img = document.createElement("img");

        img.src = url(s.headshot);
        img.alt = "Portrait of " + s.name;
        img.className = "headshot";

        img.style.objectPosition =
          `${pct(s.headshot_position_x)}% ${pct(s.headshot_position_y)}%`;

        edu.prepend(img);
      }

    })
    .catch((err) =>
      console.warn("Using built-in content until JSON loads", err)
    );

  // Teaching courses: dynamically updated from Pages CMS
  load("teaching")
    .then((courses) => {
      const grid = $("#teaching-courses");

      if (!grid || !Array.isArray(courses)) return;

      grid.innerHTML = courses.map((z) => `
        <article class="card">
          <span class="tag">
            ${esc(z.course_number || "Course")}
          </span>
          <h3>${esc(z.title)}</h3>
          <p>${esc(z.description)}</p>
        </article>
      `).join("");
    })
    .catch((err) =>
      console.warn("Teaching data could not be loaded", err)
    );

})();
