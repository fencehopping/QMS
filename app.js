const routes = {
  home: {
    label: "Home",
    title: "Welcome Back Nick Holroyd",
    footer: "Home",
    subtitle: "Review profile progress, eligibility, and the next products available through your portal.",
  },
  "browse-shoes": {
    label: "Browse Shoes",
    title: "Browse Shoes",
    footer: "Browse Shoes",
    subtitle: "Explore the current footwear catalog, jump by category, and open the full PDF when you want the complete print layout.",
  },
  profile: {
    label: "View Profile",
    title: "Prequalifying Questions",
    footer: "Profile",
    subtitle: "Review insurance, confirm billing details, and connect the physician information needed to start your order.",
  },
  aob: {
    label: "AOB Form",
    title: "Assignment of Benefits",
    footer: "Assignment of Benefits",
    subtitle: "Confirm required Medicare acknowledgements to keep monthly shipments moving without delay.",
  },
  orders: {
    label: "My Orders",
    title: "Order Status",
    footer: "My Orders",
    subtitle: "Track shipments, delivery status, and any supply activity tied to your account.",
  },
  records: {
    label: "Medical Records",
    title: "Medical Records",
    footer: "Medical Records",
    subtitle: "Review uploaded documentation and paperwork associated with your care.",
  },
  invoices: {
    label: "My Invoices",
    title: "Invoices",
    footer: "Invoices",
    subtitle: "View billing summaries, payment history, and claim-related documents.",
  },
  support: {
    label: "Support",
    title: "Support",
    footer: "Support",
    subtitle: "Get help with portal questions, shipments, and account issues.",
  },
  security: {
    label: "Login & Security",
    title: "Login & Security",
    footer: "Login & Security",
    subtitle: "Manage sign-in details and account access settings.",
  },
  signout: {
    label: "Sign Out",
    title: "Signed Out",
    footer: "Sign Out",
    subtitle: "You can safely leave the portal or sign back in when needed.",
  },
};

const pageContent = document.querySelector("#pageContent");
const pageTitle = document.querySelector("#pageTitle");
const pageSubtitle = document.querySelector("#pageSubtitle");
const footerLabel = document.querySelector("#footerLabel");
const navButtons = [...document.querySelectorAll(".nav-item")];
const mobileNavButtons = [...document.querySelectorAll(".mobile-tabbar__item")];
const sidebar = document.querySelector("#sidebar");
const menuButton = document.querySelector("#menuButton");
const sidebarOverlay = document.querySelector("#sidebarOverlay");

const iconMap = {
  home: homeIcon(),
  "browse-shoes": shoeIcon(),
  profile: profileIcon(),
  aob: documentIcon(),
  orders: orderIcon(),
  records: orderIcon(),
  invoices: documentIcon(),
  support: supportIcon(),
  security: supportIcon(),
  signout: signoutIcon(),
};

const views = {
  home: renderHome,
  "browse-shoes": renderBrowseShoes,
  profile: renderProfile,
  aob: renderAob,
  orders: renderOrders,
  records: renderPlaceholder,
  invoices: renderPlaceholder,
  support: renderPlaceholder,
  security: renderPlaceholder,
  signout: renderPlaceholder,
};

const checklistItems = [
  "I authorize QMS to contact me regarding my supplies and dispense them as prescribed by my physician in accordance with physician orders and, when applicable, in compliance with CMS guidelines.",
  "I am assigning my benefits for any Medicare, Medicaid, or private insurance benefits to QMS, for medical items sent to me. I am authorizing QMS to directly bill my insurer on my behalf understanding the charges and expected reimbursement and financial responsibility.",
  "I am agreeing to allow my medical information to be released or obtained by QMS to determine benefits and process claims.",
  "I am authorizing QMS to contact me by telephone (including voice mail messages) or mail regarding my medical items and/or medication orders.",
  "I have received the following documents: The Welcome Letter, Notice of Privacy Practices, Patient rights and Responsibilities, QMS Return Policy, the Medicare Supplier Standards, Fee Schedule, Emergency Prep, Infection Control, Plan of Service, Confidentiality and the Warranty Information.",
  "If Diabetic Shoes have been ordered, I assume all responsibility for the preventative care of my feet and will not hold QMS responsible for any past, present, or future foot problems.",
  "To immediately notify Quantum Medical Supply PRIOR TO any change or cancellation of my health insurance coverage or joining a Health Maintenance Organization, Preferred Provider Plan or other managed care group.",
];

const catalogSections = [
  {
    id: "cover",
    title: "Catalog Cover",
    blurb: "The current Quantum footwear catalog cover with the featured introductory styles.",
    pages: [{ title: "Footwear Catalog", description: "Catalog cover and lead image.", image: "./images/catalog/page-01.png" }],
  },
  {
    id: "getting-started",
    title: "How It Works",
    blurb: "A quick overview of the no-cost insurance route and the discounted direct-purchase route.",
    pages: [{ title: "2 Ways to Receive Your Shoes", description: "No-cost qualification steps and low-cost purchase path.", image: "./images/catalog/page-02.png" }],
  },
  {
    id: "mens",
    title: "Men's Shoes",
    blurb: "Running, casual, dress, and double-depth styles across pages 3 through 6 of the catalog.",
    pages: [
      { title: "Men's Shoes: Core Styles", description: "Anodyne and Dr. Comfort athletic and walking shoes.", image: "./images/catalog/page-03.png" },
      { title: "Men's Shoes: Everyday Comfort", description: "Performance, Carter, Roger, Brian, and more.", image: "./images/catalog/page-04.png" },
      { title: "Men's Shoes: Dress & Casual", description: "Wing, Frank, Mike, William, Douglas, and Fisherman styles.", image: "./images/catalog/page-05.png" },
      { title: "Men's Shoes: Double Depth", description: "Ranger, Ruk, double-depth shoes, and wider-fit options.", image: "./images/catalog/page-06.png" },
    ],
  },
  {
    id: "womens",
    title: "Women's Shoes",
    blurb: "Women’s athletic, casual, mary jane, and double-depth styles across pages 7 through 10.",
    pages: [
      { title: "Women's Shoes: Everyday Styles", description: "Anodyne and Dr. Comfort casual and walking options.", image: "./images/catalog/page-07.png" },
      { title: "Women's Shoes: Casual & Slip-On", description: "Annie, Breeze, Betty, Lulu, and related styles.", image: "./images/catalog/page-08.png" },
      { title: "Women's Shoes: Athletic", description: "Riley, Katy, Victory, Refresh, Diane, and performance styles.", image: "./images/catalog/page-09.png" },
      { title: "Women's Shoes: Double Depth", description: "Spirit, Lucie X, Mallory, Grace, and wider-fit options.", image: "./images/catalog/page-10.png" },
    ],
  },
  {
    id: "extras",
    title: "Additional Products",
    blurb: "The catalog also calls out CGM coverage and closes with contact information and therapeutic footwear benefits.",
    pages: [
      { title: "CGM Coverage", description: "Additional products covered by insurance, including CGM benefits.", image: "./images/catalog/page-11.png" },
      { title: "Benefits & Contact", description: "Therapeutic footwear benefits, orthotic support, and contact details.", image: "./images/catalog/page-12.png" },
    ],
  },
];

initNav();
syncRoute();
window.addEventListener("hashchange", syncRoute);
menuButton.addEventListener("click", () => {
  sidebar.classList.toggle("is-open");
  sidebarOverlay.classList.toggle("is-visible");
});
sidebarOverlay.addEventListener("click", closeSidebar);

function initNav() {
  navButtons.forEach((button) => {
    const routeKey = button.dataset.route;
    const route = routes[routeKey];
    button.innerHTML = `
      <span class="nav-item__icon" aria-hidden="true">${iconMap[routeKey] ?? documentIcon()}</span>
      <span class="nav-item__label">${route.label}</span>
    `;
    button.addEventListener("click", () => {
      window.location.hash = routeKey;
      closeSidebar();
    });
  });

  mobileNavButtons.forEach((button) => {
    const routeKey = button.dataset.mobileRoute;
    const route = routes[routeKey];
    button.innerHTML = `
      <span class="mobile-tabbar__icon" aria-hidden="true">${iconMap[routeKey] ?? documentIcon()}</span>
      <span class="mobile-tabbar__label">${route.label}</span>
    `;
    button.addEventListener("click", () => {
      window.location.hash = routeKey;
      closeSidebar();
    });
  });

  document.addEventListener("input", (event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    if (!event.target.matches("[data-physician-search]")) return;
    const shell = event.target.closest("[data-physician-shell]");
    const query = event.target.value.trim();
    if (!shell) return;
    shell.classList.toggle("is-search-active", query.length > 0);
  });
}

function syncRoute() {
  const routeKey = window.location.hash.replace("#", "") || "profile";
  const route = routes[routeKey] ?? routes.home;
  const render = views[routeKey] ?? views.home;

  pageTitle.textContent = route.title;
  pageSubtitle.textContent = route.subtitle;
  footerLabel.textContent = route.footer;
  pageTitle.classList.toggle("home-title", routeKey === "home");
  pageContent.innerHTML = render(routeKey);

  navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.route === routeKey);
  });
  mobileNavButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mobileRoute === routeKey);
  });
  closeSidebar();
}

function closeSidebar() {
  sidebar.classList.remove("is-open");
  sidebarOverlay.classList.remove("is-visible");
}

function renderHome() {
  return `
    <div class="stack">
      <div class="hero-banner">
        <img src="./Banner.png" alt="Slip-on styles promotion" />
      </div>

      <div class="home-grid">
        <article class="card profile-spotlight">
          <img class="card__image" src="./images/demographics.jpg" alt="Patient demographics" />
          <div class="card__body">
            <p class="card__eyebrow">Profile Snapshot</p>
            <h2 class="card__title">Keep your intake information up to date</h2>
            <p class="card__copy">Verify personal details, confirm communication preferences, and update shipping information before your next order.</p>
            <button class="pill-button card__cta" type="button">My Profile</button>
          </div>
        </article>

        <div class="stack home-content">
          <h2 class="eligibility-copy">Did you know you may be eligible for the following products at no or little cost to you?</h2>
          <div class="muted-rule"></div>
          <div class="product-grid">
            <article class="card product-card">
              <img class="card__image" src="./images/shoes.jpg" alt="Diabetic shoes" />
              <div class="card__body">
                <p class="card__eyebrow">Footwear</p>
                <button class="pill-button" type="button">Diabetic Shoes</button>
              </div>
            </article>
            <article class="card product-card">
              <img class="card__image" src="./images/cgms.png" alt="Continuous glucose monitor" />
              <div class="card__body">
                <p class="card__eyebrow">Monitoring</p>
                <button class="pill-button" type="button">Continuous Glucose Monitor</button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProfile() {
  return `
    <div class="intake-layout">
      <div class="stack intake-main">
        <section class="card intake-welcome">
          <div class="card__body">
            <p class="intake-welcome__name">Hi Nick,</p>
            <p class="card__copy">Welcome to the Quantum Medical Supply Portal. Come back here any time to review your order status, order new products, and get help with your order. Let's finish getting you qualified for your medical devices. If you'd like to update any answers from the initial questions, you can do that now.</p>
            <button class="intake-link" type="button">Edit Prequalifying Questions</button>
          </div>
        </section>

        <section class="intake-section">
          <div class="intake-section__heading">
            <h2>Insurance Information</h2>
          </div>
          <div class="card intake-panel">
            <div class="intake-panel__header">
              <h3>Primary Insurance</h3>
              <button class="icon-edit" type="button" aria-label="Edit insurance">Edit</button>
            </div>
            <div class="intake-insurance-grid">
              <article class="card intake-data-card">
                <div class="surface-card__header">Primary Insurance Details</div>
                <div class="intake-data-list">
                  ${profileField("Primary Payer", "United Healthcare")}
                  ${profileField("Description", "Aetna Medicare Choice (HMO - POS)", true)}
                  ${profileField("Insurance Type", "Point of Service (POS)")}
                  ${profileField("Coordination of Benefits", "02/01/2020 - Current", true)}
                </div>
              </article>
              <article class="card intake-data-card">
                <div class="surface-card__header">Plan Details</div>
                <div class="intake-data-list">
                  ${profilePairField("In-Network Deductible", "$20 Initial", "$0 Remaining")}
                  ${profilePairField("Out of Network Deductible", "$100 Initial", "$0 Remaining", true)}
                  ${profilePairField("Co-Insurance", "0% In-Network", "20% Out of Network")}
                  ${profilePairField("Co-Pay", "$0 In-Network", "$10 Out of Network", true)}
                </div>
              </article>
            </div>
          </div>

          <div class="card intake-panel intake-question-panel">
            <div class="card__body">
              <p class="intake-question">Do you have a Secondary / Supplemental Insurance?</p>
              <div class="intake-choice-row" role="radiogroup" aria-label="Secondary insurance">
                <button class="choice-pill" type="button" aria-pressed="false">Yes</button>
                <button class="choice-pill is-selected" type="button" aria-pressed="true">No</button>
              </div>
            </div>
          </div>
        </section>

        <section class="intake-section">
          <div class="intake-section__heading">
            <h2>Confirm Billing Address</h2>
          </div>
          <div class="card intake-panel">
            <div class="intake-panel__header">
              <div></div>
              <button class="icon-edit" type="button" aria-label="Edit addresses">Edit</button>
            </div>
            <div class="intake-address-grid">
              <article class="card intake-data-card">
                <div class="surface-card__header">Billing Address</div>
                <div class="intake-address-body">
                  <p class="intake-address-label">Address</p>
                  <p>Nick Holroyd</p>
                  <p>65 Pin Oak Dr</p>
                  <p>Scituate, MA 02066</p>
                </div>
              </article>
              <article class="card intake-data-card intake-add-card">
                <div class="surface-card__header">Shipping Address</div>
                <div class="intake-add-card__body">
                  <p>Add a different Shipping Address</p>
                  <button class="plus-button" type="button" aria-label="Add shipping address">+</button>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section class="intake-section">
          <div class="intake-section__heading">
            <h2>Physician Information</h2>
          </div>
          <div class="card intake-panel">
            <div class="card__body">
              <p class="intake-question">Please confirm/update your physician information:</p>
              <div class="physician-search">
                <div class="physician-search__hero" aria-hidden="true">
                  <img class="physician-search__hero-image" src="./images/doctor.png" alt="" />
                  <p>Let's find your physician</p>
                </div>
                <div class="physician-search__shell" data-physician-shell>
                <div class="physician-search__input">
                  <span>${searchIcon()}</span>
                  <input type="text" value="" placeholder="Start typing your physician's name" aria-label="Search for physician" data-physician-search />
                </div>
                <div class="card physician-results">
                  ${physicianResult("Marc Vanna", "65 Pin Oak Dr. Scituate, MA")}
                  ${physicianResult("Marc Vetrano", "65 Pin Oak Dr. Scituate, MA")}
                  ${physicianResult("See All Search Results", "")}
                  <div class="physician-results__empty">
                    <p>Don't see your physician?</p>
                    <button class="mini-action" type="button">Create a New Physician</button>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <button class="intake-continue" type="button">Continue to Product Selection</button>
      </div>

      <aside class="card intake-summary">
        <div class="intake-summary__header">
          <h3>Your Information</h3>
          <button class="icon-edit" type="button" aria-label="Edit personal information">Edit</button>
        </div>
        <div class="stack intake-summary__stack">
          ${summaryBox("Name", "Nick Holroyd")}
          ${summaryBox("Date of Birth", "02/25/1982")}
          ${summaryBox("Email", "nick@quantummedicalsupply.com")}
          ${summaryBox("Phone", "512-557-5646")}
        </div>
      </aside>
    </div>
  `;
}

function renderBrowseShoes() {
  const sectionLinks = catalogSections
    .map((section) => `<a class="browse-chip" href="#catalog-${section.id}">${section.title}</a>`)
    .join("");

  const sections = catalogSections
    .map(
      (section) => `
        <section class="browse-section" id="catalog-${section.id}">
          <div class="browse-section__header">
            <div>
              <p class="card__eyebrow">Catalog Section</p>
              <h2 class="browse-section__title">${section.title}</h2>
            </div>
            <p class="browse-section__copy">${section.blurb}</p>
          </div>
          <div class="catalog-grid">
            ${section.pages
              .map(
                (page) => `
                  <article class="card catalog-card">
                    <img class="catalog-card__image" src="${page.image}" alt="${page.title}" />
                    <div class="card__body">
                      <p class="card__eyebrow">${section.title}</p>
                      <h3 class="catalog-card__title">${page.title}</h3>
                      <p class="card__copy">${page.description}</p>
                      <a class="pill-button catalog-card__button" href="https://portal.quantummedicalsupply.com/assets/organization_3/Best_Selling_Shoe_Catalog.pdf" target="_blank" rel="noreferrer">Open Full PDF</a>
                    </div>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>
      `,
    )
    .join("");

  return `
    <div class="stack browse-page">
      <section class="browse-hero">
        <div class="browse-hero__content">
          <p class="card__eyebrow">2024 Footwear Catalog</p>
          <h2 class="browse-hero__title">A cleaner way to browse the full Quantum shoe lineup.</h2>
          <p class="browse-hero__copy">This experience turns the print catalog into a mobile-friendly browse flow. Jump between sections below, review catalog spreads, then open the original PDF if you want the full brochure layout.</p>
          <div class="browse-actions">
            <a class="pill-button" href="https://portal.quantummedicalsupply.com/assets/organization_3/Best_Selling_Shoe_Catalog.pdf" target="_blank" rel="noreferrer">Open Catalog PDF</a>
            <a class="browse-link" href="#catalog-mens">Jump to Men's Shoes</a>
            <a class="browse-link" href="#catalog-womens">Jump to Women's Shoes</a>
          </div>
        </div>
        <div class="browse-hero__preview">
          <img src="./images/catalog/page-01.png" alt="Quantum footwear catalog cover" />
        </div>
      </section>

      <section class="browse-chip-row">
        ${sectionLinks}
      </section>

      ${sections}
    </div>
  `;
}

function renderAob() {
  const rows = checklistItems
    .map((item, index) => {
      const extra = index === 4 ? '<a class="download-link" href="#">Click here to download documents</a>' : "";
      return `
        <div class="check-row">
          <span class="checkbox-mark" aria-hidden="true"></span>
          <div>
            <p>${item}</p>
            ${extra}
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="stack">
      <section class="card aob-card">
        <p class="aob-intro">To continue receiving your monthly CGM shipments, please read and confirm the required Medicare document.</p>
        <div class="checklist">${rows}</div>
      </section>

      <section class="card form-card">
        <label class="form-label" for="fillingFor">I am filling this form out for:</label>
        <select class="select-shell" id="fillingFor">
          <option>Please select answer</option>
          <option>Self</option>
          <option>Caregiver</option>
          <option>Legal Representative</option>
        </select>
      </section>
    </div>
  `;
}

function renderOrders() {
  return `
    <div class="stack">
      <section class="card surface-card orders-card">
        <div class="surface-card__header">My Orders</div>
        <div class="footer-rule"></div>
        <div class="empty-state">
          <img src="./Icons/processingorder.png" alt="Orders icon" />
          <div>
            <h2>No active orders</h2>
            <p>Your current design is an empty state. Add shipment cards or a tracking table here when you start building the live portal workflow.</p>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderPlaceholder(routeKey) {
  return `
    <section class="card form-card">
      <p class="detail-item__value">This section is included in the navigation to match the Figma shell. Start building the live ${routes[routeKey].label.toLowerCase()} flow here.</p>
    </section>
  `;
}

function infoCard(title, items, actionLabel) {
  return `
    <section class="card surface-card">
      <div class="surface-card__header">${title}</div>
      <div class="surface-card__content">
        <div class="detail-grid">${items.join("")}</div>
      </div>
      <div class="card-actions">
        <button class="action-button" type="button">${actionLabel}</button>
      </div>
    </section>
  `;
}

function detail(icon, label, value) {
  const safeValue = value || "&nbsp;";
  return `
    <div class="detail-item">
      <span class="detail-item__icon" aria-hidden="true">${detailIcon(icon)}</span>
      <div>
        <span class="detail-item__label">${label}</span>
        <span class="detail-item__value">${safeValue}</span>
      </div>
    </div>
  `;
}

function tableCard(title, columns, rows, actionLabel) {
  const bodyRows =
    rows.length > 0
      ? rows
          .map(
            (row) => `
          <tr>${row.map((cell, index) => `<td data-label="${columns[index]}">${cell}</td>`).join("")}</tr>
        `,
          )
          .join("")
      : `<tr class="data-table__empty"><td colspan="${columns.length}">No entries yet</td></tr>`;

  return `
    <section class="card table-card">
      <div class="surface-card__header">${title}</div>
      <table class="data-table">
        <thead>
          <tr>${columns.map((column) => `<th>${column}</th>`).join("")}</tr>
        </thead>
        <tbody>${bodyRows}</tbody>
      </table>
      <div class="card-actions">
        <button class="action-button" type="button">${actionLabel}</button>
      </div>
    </section>
  `;
}

function profileField(label, value, striped = false) {
  return `
    <div class="intake-row${striped ? " is-striped" : ""}">
      <span class="detail-item__label">${label}</span>
      <span class="detail-item__value">${value}</span>
    </div>
  `;
}

function profilePairField(label, left, right, striped = false) {
  return `
    <div class="intake-row${striped ? " is-striped" : ""}">
      <span class="detail-item__label">${label}</span>
      <div class="intake-row__pair">
        <span class="detail-item__value">${left}</span>
        <span class="detail-item__value">${right}</span>
      </div>
    </div>
  `;
}

function physicianResult(name, meta) {
  const text = meta ? `<p class="physician-results__meta">${meta}</p>` : "";
  return `
    <div class="physician-results__row">
      <div class="physician-results__identity">
        <span class="physician-results__icon">${doctorIcon()}</span>
        <div>
          <p class="physician-results__name">${name}</p>
          ${text}
        </div>
      </div>
      <button class="physician-results__select" type="button">Select</button>
    </div>
  `;
}

function summaryBox(label, value) {
  return `
    <div class="intake-summary__box">
      <p class="intake-summary__label">${label}</p>
      <p class="intake-summary__value">${value}</p>
    </div>
  `;
}

function detailIcon(type) {
  switch (type) {
    case "home":
      return `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 7.2 8 2l6 5.2V14H2V7.2Zm2 .8V12h8V8L8 4.6 4 8Z" fill="currentColor"/></svg>`;
    case "mail":
      return `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 3h12v10H2V3Zm1.4 1.3v.1L8 7.9l4.6-3.5v-.1H3.4Zm9.2 7.4V6.2L8 9.6 3.4 6.2v5.5h9.2Z" fill="currentColor"/></svg>`;
    case "calendar":
      return `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 1h1.4v2H4V1Zm6.6 0H12v2h-1.4V1ZM2 3h12v11H2V3Zm1.4 3.2v6.4h9.2V6.2H3.4Zm0-1.4h9.2V4.4H3.4v.4Z" fill="currentColor"/></svg>`;
    case "device":
      return `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 1.5h8A1.5 1.5 0 0 1 13.5 3v10A1.5 1.5 0 0 1 12 14.5H4A1.5 1.5 0 0 1 2.5 13V3A1.5 1.5 0 0 1 4 1.5Zm0 1A.5.5 0 0 0 3.5 3v10c0 .3.2.5.5.5h8c.3 0 .5-.2.5-.5V3a.5.5 0 0 0-.5-.5H4Zm2.2 1.2h3.6v.8H6.2v-.8Zm1.8 8.5a.85.85 0 1 1 0 1.7.85.85 0 0 1 0-1.7Z" fill="currentColor"/></svg>`;
    case "person":
      return `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0-1a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm0 2c-2.6 0-4.9 1.5-5.7 3.8l.9.3C3.9 11.1 5.8 10 8 10s4.1 1.1 4.8 3.1l.9-.3C12.9 10.5 10.6 9 8 9Z" fill="currentColor"/></svg>`;
    case "gender":
      return `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M9.8 1h4.2v4.2h-1V2.7L10.7 5A4.5 4.5 0 1 1 10 4.3l2.3-2.3H9.8V1ZM6.5 5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" fill="currentColor"/></svg>`;
    case "group":
      return `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5.2 7A2.2 2.2 0 1 0 5.2 2.6 2.2 2.2 0 0 0 5.2 7ZM10.8 6.4a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8Zm0 .8c-1 0-1.9.3-2.6.8.9.7 1.6 1.7 1.9 2.8h3.4c0-1.8-1.2-3.6-2.7-3.6Zm-5.6.2C2.8 7.4 1 9.2 1 11.5V12h8.4v-.5c0-2.3-1.8-4.1-4.2-4.1Z" fill="currentColor"/></svg>`;
    default:
      return documentIcon();
  }
}

function homeIcon() {
  return `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 6.8 8 2l6 4.8V14H2V6.8Zm1.4.7v5.1h9.2V7.5L8 3.8 3.4 7.5Zm2.1 5.1V8.7h5v3.9h-5Z" fill="currentColor"/></svg>`;
}

function profileIcon() {
  return `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M1.5 3.5h13v9h-13v-9Zm1 1v7h11v-7h-11Zm5.5.8a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm0 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM4.2 11c.6-1.4 2-2.2 3.8-2.2 1.8 0 3.2.8 3.8 2.2h-1.2c-.5-.8-1.4-1.2-2.6-1.2s-2.1.4-2.6 1.2H4.2Z" fill="currentColor"/></svg>`;
}

function documentIcon() {
  return `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 1.5h5.5L13 5v9.5H4v-13Zm1 1v11h7V5.4L9.1 2.5H5Zm3.2.2v2.9h2.9" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>`;
}

function orderIcon() {
  return `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m5 4.5 1.2 5h5.9l1.1-3.7H6.6M4.7 3H2.6v1h1.3l1.5 6.4h7.1v-1H6.2M7 12.4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" fill="currentColor"/></svg>`;
}

function supportIcon() {
  return `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2a5 5 0 0 0-5 5v2.4c0 .8.6 1.4 1.4 1.4H5V7.4H4A4 4 0 0 1 8 3a4 4 0 0 1 4 4.4h-1v3.4h.6c.8 0 1.4-.6 1.4-1.4V7A5 5 0 0 0 8 2Zm-2 5.4h-.9v3.4H6V7.4Zm5 0h-.9v3.4h.9V7.4ZM8 14c-1 0-1.7-.4-1.7-1.1h1c0 .2.3.3.7.3s.7-.1.7-.3h1c0 .7-.7 1.1-1.7 1.1Z" fill="currentColor"/></svg>`;
}

function signoutIcon() {
  return `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2Zm0 1a5 5 0 1 1 0 10A5 5 0 0 1 8 3Zm2.8 2.5-.7-.7L8 7 5.9 4.8l-.7.7L7.3 7.7l-2.1 2.1.7.7L8 8.4l2.1 2.1.7-.7-2.1-2.1 2.1-2.2Z" fill="currentColor"/></svg>`;
}

function shoeIcon() {
  return `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 10.2c.8-.2 1.4-.6 1.8-1.1l1.2-1.7 1.6.7c.8.3 1.6.5 2.5.5h2.1c1.7 0 2.8.8 2.8 2v1H2v-1.4Zm11 .4c-.2-.5-.8-.8-1.8-.8H9.1c-1 0-2-.2-3-.6l-.7-.3-.6.9c-.4.5-.9 1-1.6 1.3H13v-.5ZM11.3 5.1l.5-1 1.7.8-.5 1-1.7-.8Z" fill="currentColor"/></svg>`;
}

function searchIcon() {
  return `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M7 2.5a4.5 4.5 0 1 0 2.84 8l2.83 2.82.71-.7-2.83-2.84A4.5 4.5 0 0 0 7 2.5Zm0 1A3.5 3.5 0 1 1 7 10.5 3.5 3.5 0 0 1 7 3.5Z" fill="currentColor"/></svg>`;
}

function doctorIcon() {
  return `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2a2.3 2.3 0 1 0 0 4.6A2.3 2.3 0 0 0 8 2Zm0 1a1.3 1.3 0 1 1 0 2.6A1.3 1.3 0 0 1 8 3Zm-3.2 8.6c.2-1.8 1.5-3 3.2-3s3 1.2 3.2 3h1c-.1-1.5-.9-2.8-2.1-3.5l.9-.9V6h-2V4.8H7V6H5v1.2l.9.9a4.4 4.4 0 0 0-2.1 3.5h1Z" fill="currentColor"/></svg>`;
}
