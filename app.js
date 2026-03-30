const patientRoutes = {
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

const fitterRoutes = {
  home: {
    label: "Dashboard",
    title: "Dashboard",
    footer: "Dashboard",
    subtitle: "Review all assigned patients, shipment timing, and current CGM order statuses.",
  },
  signout: {
    label: "Sign Out",
    title: "Signed Out",
    footer: "Sign Out",
    subtitle: "You can safely leave the fitter portal or sign back in when needed.",
  },
};

const pageContent = document.querySelector("#pageContent");
const pageTitle = document.querySelector("#pageTitle");
const pageSubtitle = document.querySelector("#pageSubtitle");
const pageHeaderActions = document.querySelector("#pageHeaderActions");
const portalEyebrow = document.querySelector("#portalEyebrow");
const portalViewSelect = document.querySelector("#portalViewSelect");
const footerLabel = document.querySelector("#footerLabel");
const navButtons = [...document.querySelectorAll(".nav-item")];
const mobileNavButtons = [...document.querySelectorAll(".mobile-tabbar__item")];
const sidebar = document.querySelector("#sidebar");
const menuButton = document.querySelector("#menuButton");
const sidebarOverlay = document.querySelector("#sidebarOverlay");
const modalLayer = document.querySelector("#modalLayer");
const modalBackdrop = document.querySelector("#modalBackdrop");
const modalClose = document.querySelector("#modalClose");
const modalTitle = document.querySelector("#modalTitle");
const modalForm = document.querySelector("#modalForm");
const modalEyebrow = document.querySelector("#modalEyebrow");
const modalSubtitle = document.querySelector("#modalSubtitle");
const modalCard = document.querySelector(".modal-card");
let currentRoute = "profile";
let currentPortal = "patient";
let activeModalTarget = "";
let activePhysicianSlot = "primary";
let physicianResultsPage = 1;
let physicianSearchRequestId = 0;
let physicianSearchDebounce = 0;
const insuranceProviderDataUrl = "./Insurance%20Drop%20Down/insurance_dropdown_full.json";

const profileState = {
  prequalifying: {
    name: "Nick Holroyd",
    email: "nick@quantummedicalsupply.com",
    phone: "512-557-5646",
    dateOfBirth: "02/25/1982",
  },
  insurance: {
    primaryPayer: "United Healthcare",
    providerAccountNumber: "1EG4-TE5-MK73",
    description: "Aetna Medicare Choice (HMO - POS)",
    insuranceType: "Point of Service (POS)",
    coordination: "02/01/2020 - Current",
    inNetworkInitial: "$20 Initial",
    inNetworkRemaining: "$0 Remaining",
    outNetworkInitial: "$100 Initial",
    outNetworkRemaining: "$0 Remaining",
    coInsuranceIn: "0% In-Network",
    coInsuranceOut: "20% Out of Network",
    coPayIn: "$0 In-Network",
    coPayOut: "$10 Out of Network",
    hasSecondary: "No",
    secondaryProvider: "",
    secondaryPolicyNumber: "",
  },
  addresses: {
    billingName: "Nick Holroyd",
    billingStreet: "65 Pin Oak Dr",
    billingCity: "Scituate",
    billingState: "MA",
    billingZip: "02066",
    shippingName: "",
    shippingStreet: "",
    shippingCity: "",
    shippingState: "",
    shippingZip: "",
  },
  personal: {
    name: "Nick Holroyd",
    dateOfBirth: "02/25/1982",
    email: "nick@quantummedicalsupply.com",
    phone: "512-557-5646",
  },
  physician: {
    searchState: "MA",
    searchCity: "",
    searchName: "",
    primary: emptyPhysicianRecord(),
    secondary: emptyPhysicianRecord(),
  },
};

const insuranceProviderState = {
  items: [],
  loaded: false,
  loading: false,
  error: "",
};

const insuranceEditState = {
  manualEntry: false,
  providerInput: profileState.insurance.primaryPayer,
  error: "",
  isSuggestionOpen: false,
};

const physicianSearchState = {
  items: [],
  total: 0,
  loading: false,
  error: "",
  hasSearched: false,
  currentPage: 1,
  sortField: "firstName",
  sortDirection: "asc",
};

const fitterDashboardState = {
  sortField: "nextShipment",
  sortDirection: "asc",
};

const iconMap = {
  home: homeIcon(),
  "browse-shoes": shoeIcon(),
  profile: fontAwesomeIcon("fa-user"),
  aob: documentIcon(),
  orders: fontAwesomeIcon("fa-cart-shopping"),
  records: orderIcon(),
  invoices: documentIcon(),
  support: fontAwesomeIcon("fa-circle-question"),
  security: fontAwesomeIcon("fa-lock"),
  signout: fontAwesomeIcon("fa-right-from-bracket"),
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

const physicianApiBase = "/api/physicians";
const physicianResultsPerPage = 50;
const hiddenPhysicianTitleKeywords = [
  "acupuncturist",
  "advanced practice midwife",
  "anesthesiology",
  "audiologist",
  "behavior analyst",
  "behavior technician",
  "chiropractor",
  "counselor",
  "dentist",
  "developmental therapist",
  "homemaker",
  "interpreter",
  "licensed practical nurse",
  "marriage & family therapist",
  "massage therapist",
  "nurse anesthetist, certified registered",
  "occupational therapist",
  "ophthalmology",
  "peer specialist",
  "pharmacist",
  "physical medicine & rehabilitation",
  "psychologist",
  "social worker",
  "specialist",
  "speech-language pathologist",
  "technician",
].map((title) => title
  .trim()
  .replace(/\s+/g, " ")
  .replace(/&/g, "and")
  .replace(/[/-]/g, " ")
  .toLowerCase());

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

const fitterPatients = [
  ["80046", "BRETT", "SCHISSLER", "04/01/1980", "CGM", "Canceled", "", "", ""],
  ["87648", "GARY", "RESNICK", "04/19/1939", "CGM", "Canceled", "", "", ""],
  ["95219", "KATHERINE", "BIDDIX", "09/08/1959", "CGM", "Canceled", "", "", ""],
  ["100762", "SANDFORD", "GADIENT", "02/07/1936", "CGM", "Insurance Verified", "03/17/2026", "06/15/2026", "1Z2159X70293026505"],
  ["100847", "FRANK", "IOVINE", "06/29/1942", "CGM", "Insurance Verified", "03/18/2026", "06/16/2026", "1Z2159X70291832290"],
  ["99341", "TED", "LEVINE", "01/31/1953", "CGM", "Insurance Verified", "02/26/2026", "05/27/2026", "1Z2159X70290458358"],
  ["102185", "RONALD", "KAPLAN", "02/04/1942", "CGM", "Insurance Verified", "03/15/2026", "06/13/2026", ""],
  ["102626", "LARRY", "PALMER JR", "11/23/1973", "CGM", "Insurance Verified", "01/25/2026", "02/24/2026", "1Z2159X70291297075"],
  ["102935", "MIGUEL", "BRITO", "12/29/1984", "CGM", "Insurance Verified", "03/07/2026", "04/06/2026", "1Z2159X70294271211"],
  ["101345", "PRISCILLA", "ASHLEY", "05/26/1951", "CGM", "Insurance Verified", "03/11/2026", "06/09/2026", "1Z2159X70211457686"],
  ["102855", "BEN", "WEINSTOCK", "08/17/1946", "CGM", "Insurance Verified", "03/19/2026", "06/17/2026", "1Z2159X70296030147"],
];

const fitterColumns = [
  { key: "id", label: "ID" },
  { key: "firstName", label: "Patient First" },
  { key: "lastName", label: "Patient Last" },
  { key: "dob", label: "DOB" },
  { key: "model", label: "CGM Model" },
  { key: "status", label: "Status" },
  { key: "lastShipment", label: "Last Shipment" },
  { key: "nextShipment", label: "Next Shipment" },
  { key: "tracking", label: "Tracking #" },
];

initNav();
void loadInsuranceProviders();
syncRoute();
window.addEventListener("hashchange", syncRoute);
menuButton.addEventListener("click", () => {
  sidebar.classList.toggle("is-open");
  sidebarOverlay.classList.toggle("is-visible");
});
sidebarOverlay.addEventListener("click", closeSidebar);
modalBackdrop.addEventListener("click", closeModal);
modalClose.addEventListener("click", closeModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

function initNav() {
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const routeKey = button.dataset.route;
      if (!routeKey) return;
      window.location.hash = routeKey;
      closeSidebar();
    });
  });

  mobileNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const routeKey = button.dataset.mobileRoute;
      if (!routeKey) return;
      window.location.hash = routeKey;
      closeSidebar();
    });
  });

  portalViewSelect.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLSelectElement)) return;
    currentPortal = event.target.value === "fitter" ? "fitter" : "patient";
    const defaultRoute = getDefaultRoute();
    if (window.location.hash.replace("#", "") !== defaultRoute) {
      window.location.hash = defaultRoute;
      return;
    }
    syncRoute();
  });

  document.addEventListener("input", (event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    if (!event.target.matches("[data-physician-search]")) return;
    const shell = event.target.closest("[data-physician-shell]");
    const query = event.target.value.trim();
    if (!shell) return;
    shell.classList.toggle("is-search-active", query.length > 0);
    schedulePhysicianSearch({ page: 1, openModal: false });
  });

  document.addEventListener("input", (event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    if (!event.target.matches("[data-physician-filter]")) return;
    const field = event.target.dataset.physicianFilter;
    profileState.physician[field] = event.target.value;
    const shell = event.target.closest("[data-physician-shell]");
    const nameInput = shell?.querySelector("[data-physician-search]");
    if (nameInput instanceof HTMLInputElement && shell) {
      shell.classList.toggle("is-search-active", nameInput.value.trim().length > 0);
    }
    if (profileState.physician.searchName.trim().length > 0) {
      schedulePhysicianSearch({ page: 1, openModal: false });
    }
  });

  document.addEventListener("input", (event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    if (!event.target.matches("[data-modal-physician-filter]")) return;
    const field = event.target.dataset.modalPhysicianFilter;
    profileState.physician[field] = event.target.value;
  });

  document.addEventListener("input", (event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    if (!event.target.matches("[data-insurance-provider-input]")) return;
    insuranceEditState.providerInput = event.target.value;
    insuranceEditState.error = "";
    insuranceEditState.isSuggestionOpen = true;
    refreshInsuranceAutocompleteUi();
  });

  document.addEventListener("focusin", (event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    if (!event.target.matches("[data-insurance-provider-input]")) return;
    if (insuranceEditState.manualEntry) return;
    insuranceEditState.isSuggestionOpen = true;
    refreshInsuranceAutocompleteUi();
  });

  document.addEventListener("click", (event) => {
    const physicianShell = document.querySelector("[data-physician-search-region]");
    if (
      physicianShell instanceof HTMLElement &&
      !physicianShell.contains(event.target instanceof Node ? event.target : null)
    ) {
      closePhysicianSuggestions();
    }
    const insurancePicker = document.querySelector("[data-insurance-provider-picker]");
    if (
      insurancePicker instanceof HTMLElement
      && event.target instanceof Node
      && !insurancePicker.contains(event.target)
    ) {
      insuranceEditState.isSuggestionOpen = false;
      refreshInsuranceAutocompleteUi();
    }

    const closeTrigger = event.target.closest("[data-modal-close]");
    if (closeTrigger) {
      closeModal();
      return;
    }
    const secondaryChoice = event.target.closest("[data-secondary-choice]");
    if (secondaryChoice instanceof HTMLElement) {
      const choice = secondaryChoice.dataset.secondaryChoice;
      if (choice === "yes") {
        openModal("supplemental-insurance");
      } else if (choice === "no") {
        profileState.insurance.hasSecondary = "No";
        profileState.insurance.secondaryProvider = "";
        profileState.insurance.secondaryPolicyNumber = "";
        rerenderCurrentRoute();
      }
      return;
    }
    const physicianSearchTrigger = event.target.closest("[data-open-physician-results]");
    if (physicianSearchTrigger) {
      activePhysicianSlot = "primary";
      physicianResultsPage = 1;
      void fetchPhysicians({ page: 1, openModal: true });
      return;
    }
    const physicianEditTrigger = event.target.closest("[data-edit-physician]");
    if (physicianEditTrigger instanceof HTMLElement) {
      const requestedSlot = physicianEditTrigger.dataset.editPhysician;
      activePhysicianSlot = requestedSlot === "secondary" ? "secondary" : "primary";
      openModal("edit-physician");
      return;
    }
    const physicianPickerTrigger = event.target.closest("[data-open-physician-picker]");
    if (physicianPickerTrigger instanceof HTMLElement) {
      const requestedSlot = physicianPickerTrigger.dataset.openPhysicianPicker;
      activePhysicianSlot = requestedSlot === "secondary" ? "secondary" : "primary";
      openPhysicianPicker();
      return;
    }
    const physicianSearchSubmit = event.target.closest("[data-physician-search-submit]");
    if (physicianSearchSubmit) {
      physicianResultsPage = 1;
      void fetchPhysicians({ page: 1, openModal: true });
      return;
    }
    const physicianSortTrigger = event.target.closest("[data-physician-sort]");
    if (physicianSortTrigger instanceof HTMLElement) {
      const requestedSortField = physicianSortTrigger.dataset.physicianSort;
      if (requestedSortField === "city" || requestedSortField === "firstName") {
        if (physicianSearchState.sortField === requestedSortField) {
          physicianSearchState.sortDirection = physicianSearchState.sortDirection === "asc" ? "desc" : "asc";
        } else {
          physicianSearchState.sortField = requestedSortField;
          physicianSearchState.sortDirection = "asc";
        }
        refreshPhysicianSearchUi({ openModal: activeModalTarget === "physician-search-results" });
      }
      return;
    }
    const fitterSortTrigger = event.target.closest("[data-fitter-sort]");
    if (fitterSortTrigger instanceof HTMLElement) {
      const requestedSortField = fitterSortTrigger.dataset.fitterSort;
      if (requestedSortField && fitterColumns.some((column) => column.key === requestedSortField)) {
        if (fitterDashboardState.sortField === requestedSortField) {
          fitterDashboardState.sortDirection = fitterDashboardState.sortDirection === "asc" ? "desc" : "asc";
        } else {
          fitterDashboardState.sortField = requestedSortField;
          fitterDashboardState.sortDirection = "asc";
        }
        rerenderCurrentRoute();
      }
      return;
    }
    const physicianPageTrigger = event.target.closest("[data-physician-page]");
    if (physicianPageTrigger instanceof HTMLElement) {
      const requestedPage = Number(physicianPageTrigger.dataset.physicianPage);
      const totalPages = Math.max(1, Math.ceil(physicianSearchState.total / physicianResultsPerPage));
      physicianResultsPage = Math.min(Math.max(requestedPage, 1), totalPages);
      void fetchPhysicians({ page: physicianResultsPage, openModal: true });
      return;
    }
    const physicianSelectTrigger = event.target.closest("[data-physician-select]");
    if (physicianSelectTrigger instanceof HTMLElement) {
      const physicianId = physicianSelectTrigger.dataset.physicianSelect;
      const physician = physicianSearchState.items.find((item) => item.id === physicianId);
      if (physician) {
        applyPhysicianSelection(physician);
      }
      return;
    }
    const insuranceProviderOption = event.target.closest("[data-insurance-provider-option]");
    if (insuranceProviderOption instanceof HTMLElement) {
      insuranceEditState.providerInput = insuranceProviderOption.dataset.insuranceProviderOption || "";
      insuranceEditState.error = "";
      insuranceEditState.isSuggestionOpen = false;
      syncInsuranceProviderInput();
      refreshInsuranceAutocompleteUi();
      return;
    }
    const insuranceEntryModeTrigger = event.target.closest("[data-insurance-entry-mode]");
    if (insuranceEntryModeTrigger instanceof HTMLElement) {
      insuranceEditState.manualEntry = insuranceEntryModeTrigger.dataset.insuranceEntryMode === "manual";
      insuranceEditState.providerInput = "";
      insuranceEditState.error = "";
      insuranceEditState.isSuggestionOpen = false;
      openModal("insurance");
      return;
    }
    const trigger = event.target.closest("[data-edit-target]");
    if (!(trigger instanceof HTMLElement)) return;
    openModal(trigger.dataset.editTarget || "");
  });

  modalForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(modalForm);
    if (activeModalTarget === "insurance" && !validateInsuranceModalSubmission(formData)) {
      openModal("insurance");
      return;
    }
    applyModalChanges(activeModalTarget, formData);
    closeModal();
    rerenderCurrentRoute();
  });
}

function syncRoute() {
  const requestedRouteKey = window.location.hash.replace("#", "") || getDefaultRoute();
  const portalRoutes = getRoutes();
  const routeKey = portalRoutes[requestedRouteKey] ? requestedRouteKey : getDefaultRoute();
  if (requestedRouteKey !== routeKey) {
    window.location.hash = routeKey;
    return;
  }

  currentRoute = routeKey;
  renderNavigation();
  const route = portalRoutes[routeKey] ?? portalRoutes[getDefaultRoute()];
  const render = views[routeKey] ?? views[getDefaultRoute()];

  renderPageChrome(routeKey, route);
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
  if (currentPortal === "fitter") {
    return renderFitterDashboard();
  }

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

function renderFitterDashboard() {
  const sortedRows = getSortedFitterPatients();
  const rows = sortedRows
    .map((row) => `
      <tr>
        <td data-label="ID"><span class="fitter-table__link">${row.id}</span></td>
        <td data-label="Patient First"><span class="fitter-table__link">${row.firstName}</span></td>
        <td data-label="Patient Last"><span class="fitter-table__link">${row.lastName}</span></td>
        <td data-label="DOB"><span class="fitter-table__link">${row.dob}</span></td>
        <td data-label="CGM Model"><span class="fitter-table__link">${row.model}</span></td>
        <td data-label="Status" class="${row.status === "Canceled" ? "is-canceled" : ""}">${row.status}</td>
        <td data-label="Last Shipment"><span class="fitter-table__link">${row.lastShipment || "&nbsp;"}</span></td>
        <td data-label="Next Shipment"><span class="fitter-table__link">${row.nextShipment || "&nbsp;"}</span></td>
        <td data-label="Tracking #"><span class="fitter-table__link">${row.tracking || "&nbsp;"}</span></td>
      </tr>
    `)
    .join("");

  const headerCells = fitterColumns
    .map((column) => `
      <th>
        <button
          class="fitter-table__sort${fitterDashboardState.sortField === column.key ? " is-active" : ""}"
          data-fitter-sort="${column.key}"
          type="button"
          aria-pressed="${fitterDashboardState.sortField === column.key ? "true" : "false"}"
        >
          <span>${column.label}</span>
          <span class="fitter-table__sort-icon" aria-hidden="true">${renderFitterSortIcon(column.key)}</span>
        </button>
      </th>
    `)
    .join("");

  return `
    <div class="stack fitter-dashboard">
      <section class="card fitter-toolbar">
        <div class="fitter-toolbar__field">
          <label class="form-label" for="fitterProduct">Product</label>
          <select class="select-shell fitter-toolbar__select" id="fitterProduct">
            <option>CGM Orders</option>
          </select>
        </div>
      </section>

      <section class="card table-card fitter-table-card">
        <div class="fitter-table-wrap">
          <table class="data-table fitter-table">
            <thead>
              <tr>${headerCells}</tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function getSortedFitterPatients() {
  const rows = fitterPatients.map(([id, firstName, lastName, dob, model, status, lastShipment, nextShipment, tracking]) => ({
    id,
    firstName,
    lastName,
    dob,
    model,
    status,
    lastShipment,
    nextShipment,
    tracking,
  }));

  const direction = fitterDashboardState.sortDirection === "asc" ? 1 : -1;
  rows.sort((left, right) => compareFitterValues(left, right, fitterDashboardState.sortField) * direction);
  return rows;
}

function compareFitterValues(left, right, field) {
  if (field === "id") {
    return Number(left.id) - Number(right.id);
  }

  if (field === "dob" || field === "lastShipment" || field === "nextShipment") {
    return compareDates(left[field], right[field]);
  }

  return String(left[field] || "").localeCompare(String(right[field] || ""), undefined, { numeric: true, sensitivity: "base" });
}

function compareDates(left, right) {
  const leftTime = parseUsDate(left);
  const rightTime = parseUsDate(right);
  if (leftTime === rightTime) return 0;
  if (leftTime === null) return 1;
  if (rightTime === null) return -1;
  return leftTime - rightTime;
}

function parseUsDate(value) {
  if (!value) return null;
  const [month, day, year] = value.split("/").map(Number);
  if (!month || !day || !year) return null;
  return new Date(year, month - 1, day).getTime();
}

function renderFitterSortIcon(field) {
  if (fitterDashboardState.sortField !== field) return "↕";
  return fitterDashboardState.sortDirection === "asc" ? "↑" : "↓";
}

function renderProfile() {
  const canContinueToProductSelection = isProfileReadyForProductSelection();
  return `
    <div class="intake-layout">
      <div class="stack intake-main">
        <section class="intake-section">
          <div class="intake-section__heading">
            <h2>Insurance Information</h2>
          </div>
          <div class="card intake-panel">
            <div class="intake-panel__header">
              <h3>Primary Insurance</h3>
              <button class="icon-edit" data-edit-target="insurance" type="button" aria-label="Edit insurance">Edit</button>
            </div>
            <div class="intake-insurance-grid">
              <article class="card intake-data-card">
                <div class="surface-card__header">Primary Insurance Details</div>
                <div class="intake-data-list">
                  ${profileField("Primary Payer", profileState.insurance.primaryPayer)}
                  ${profileField("Provider Account Number", profileState.insurance.providerAccountNumber, true)}
                  ${profileField("Description", profileState.insurance.description)}
                  ${profileField("Insurance Type", profileState.insurance.insuranceType, true)}
                  ${profileField("Coordination of Benefits", profileState.insurance.coordination)}
                </div>
              </article>
              <article class="card intake-data-card">
                <div class="surface-card__header">Plan Details</div>
                <div class="intake-data-list">
                  ${profilePairField("In-Network Deductible", profileState.insurance.inNetworkInitial, profileState.insurance.inNetworkRemaining)}
                  ${profilePairField("Out of Network Deductible", profileState.insurance.outNetworkInitial, profileState.insurance.outNetworkRemaining, true)}
                  ${profilePairField("Co-Insurance", profileState.insurance.coInsuranceIn, profileState.insurance.coInsuranceOut)}
                  ${profilePairField("Co-Pay", profileState.insurance.coPayIn, profileState.insurance.coPayOut, true)}
                </div>
              </article>
            </div>
          </div>

          <div class="card intake-panel intake-question-panel">
            <div class="card__body">
              <p class="intake-question">Do you have a Secondary / Supplemental Insurance?</p>
              <div class="intake-choice-row" role="radiogroup" aria-label="Secondary insurance">
                <button class="choice-pill${profileState.insurance.hasSecondary === "Yes" ? " is-selected" : ""}" data-secondary-choice="yes" type="button" aria-pressed="${profileState.insurance.hasSecondary === "Yes"}">Yes</button>
                <button class="choice-pill${profileState.insurance.hasSecondary === "No" ? " is-selected" : ""}" data-secondary-choice="no" type="button" aria-pressed="${profileState.insurance.hasSecondary === "No"}">No</button>
              </div>
              ${profileState.insurance.hasSecondary === "Yes" ? `
                <div class="secondary-insurance-note">
                  <p><strong>Insurance Provider:</strong> ${profileState.insurance.secondaryProvider}</p>
                  <p><strong>Policy Number:</strong> ${profileState.insurance.secondaryPolicyNumber}</p>
                </div>
              ` : ""}
            </div>
          </div>
        </section>

        <section class="intake-section">
          <div class="intake-section__heading">
            <h2>Confirm Billing Address</h2>
          </div>
          <div class="card intake-panel">
            <div class="intake-address-grid">
              <article class="card intake-data-card">
                <div class="surface-card__header intake-card__header">
                  <span>Billing Address</span>
                  <button class="icon-edit" data-edit-target="billing-address" type="button" aria-label="Edit billing address">Edit</button>
                </div>
                <div class="intake-address-body">
                  <p class="intake-address-label">Address</p>
                  <p>${profileState.addresses.billingName}</p>
                  <p>${profileState.addresses.billingStreet}</p>
                  <p>${formatCityStateZip(profileState.addresses.billingCity, profileState.addresses.billingState, profileState.addresses.billingZip)}</p>
                </div>
              </article>
              ${profileState.addresses.shippingStreet
                ? `
                  <article class="card intake-data-card">
                    <div class="surface-card__header intake-card__header">
                      <span>Shipping Address</span>
                      <button class="icon-edit" data-edit-target="shipping-address" type="button" aria-label="Edit shipping address">Edit</button>
                    </div>
                    <div class="intake-address-body">
                      <p class="intake-address-label">Address</p>
                      <p>${profileState.addresses.shippingName}</p>
                      <p>${profileState.addresses.shippingStreet}</p>
                      <p>${formatCityStateZip(profileState.addresses.shippingCity, profileState.addresses.shippingState, profileState.addresses.shippingZip)}</p>
                    </div>
                  </article>
                `
                : `
                  <article class="card intake-data-card intake-add-card">
                    <div class="surface-card__header">Shipping Address</div>
                    <div class="intake-add-card__body">
                      <p>Add a different Shipping Address</p>
                      <button class="plus-button" data-edit-target="shipping-address" type="button" aria-label="Add shipping address">+</button>
                    </div>
                  </article>
                `}
            </div>
          </div>
        </section>

        <section class="intake-section">
          <div class="intake-section__heading">
            <h2>Physician Information</h2>
          </div>
          ${renderPhysicianSection()}
        </section>

        <button class="intake-continue" type="button"${canContinueToProductSelection ? "" : " disabled"}>Save and continue</button>
      </div>

      <aside class="card intake-summary">
        <div class="intake-summary__header">
          <h3>Your Information</h3>
          <button class="icon-edit" data-edit-target="personal" type="button" aria-label="Edit personal information">Edit</button>
        </div>
        <div class="stack intake-summary__stack">
          ${summaryBox("Name", profileState.personal.name)}
          ${summaryBox("Date of Birth", profileState.personal.dateOfBirth)}
          ${summaryBox("Email", profileState.personal.email)}
          ${summaryBox("Phone", profileState.personal.phone)}
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
        <div class="orders-card__content">
          <article class="orders-product-card orders-product-card--active">
            <div class="orders-product-card__media">
              <img src="./images/cgms.png" alt="Dexcom G7 continuous glucose monitor" />
            </div>
            <div class="orders-product-card__body">
              <p class="orders-product-card__eyebrow">Continuous Glucose Monitor</p>
              <div class="orders-product-card__title-row">
                <h2>Dexcom G7</h2>
                <span class="orders-status-pill">Waiting on Rx</span>
              </div>
              <p class="orders-product-card__copy">Your CGM order is in progress and is waiting for the prescribing physician to send the required prescription.</p>
              <div class="orders-meta">
                <div>
                  <span class="orders-meta__label">Order type</span>
                  <span class="orders-meta__value">Active order</span>
                </div>
                <div>
                  <span class="orders-meta__label">Next step</span>
                  <span class="orders-meta__value">Prescription needed</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="orders-qualify-section">
        <div class="orders-qualify-section__header">
          <h2>Other products you qualify for</h2>
        </div>
        <div class="orders-qualify-grid">
          <article class="card surface-card orders-product-card">
            <div class="orders-product-card__media orders-product-card__media--shoes">
              <img src="./images/shoes.png" alt="Diabetic footwear" />
            </div>
            <div class="orders-product-card__body orders-product-card__body--compact">
              <p class="orders-product-card__eyebrow">Shoes</p>
              <h3>Diabetic Footwear</h3>
              <p class="orders-product-card__copy">Start a request to review qualifying styles and begin the documentation process for diabetic shoes.</p>
              <button class="action-button orders-product-card__action" type="button">Request Product</button>
            </div>
          </article>
          <article class="card surface-card orders-product-card">
            <div class="orders-product-card__media orders-product-card__media--compression">
              <img src="./images/compression.png" alt="Compression garments" />
            </div>
            <div class="orders-product-card__body orders-product-card__body--compact">
              <p class="orders-product-card__eyebrow">Compression</p>
              <h3>Lymphedema</h3>
              <p class="orders-product-card__copy">Request compression products and have the team verify coverage and the documentation needed to proceed.</p>
              <button class="action-button orders-product-card__action" type="button">Request Product</button>
            </div>
          </article>
        </div>
      </section>
    </div>
  `;
}

function renderPlaceholder(routeKey) {
  if (routeKey === "signout") {
    return `
      <section class="card form-card">
        <p class="detail-item__value">You have been signed out of the ${currentPortal === "fitter" ? "fitter" : "patient"} portal preview.</p>
      </section>
    `;
  }

  return `
    <section class="card form-card">
      <p class="detail-item__value">This section is included in the navigation to match the Figma shell. Start building the live ${getRoutes()[routeKey].label.toLowerCase()} flow here.</p>
    </section>
  `;
}

function renderPhysicianSection() {
  const primaryPhysician = getPhysicianRecord("primary");
  if (!hasPhysicianRecord(primaryPhysician)) {
    return `
      <div class="card intake-panel">
        <div class="card__body">
          <div class="physician-search">
            <div class="physician-search__hero" aria-hidden="true">
              <img class="physician-search__hero-image" src="./images/doctor.png" alt="" />
              <p>
                Let's find your physician, or
                <button class="physician-search__hero-link" data-edit-target="create-physician" type="button">create a new one here</button>
              </p>
            </div>
            <div class="physician-search__shell" data-physician-shell>
              <div class="physician-search__filters">
                <div class="physician-search__mini-field">
                  <span class="physician-search__mini-label">State</span>
                  <input type="text" value="${escapeAttribute(profileState.physician.searchState)}" placeholder="State" aria-label="Search by state" data-physician-filter="searchState" />
                </div>
                <div class="physician-search__name-stack" data-physician-search-region>
                  <div class="physician-search__input">
                    <span>${searchIcon()}</span>
                    <input type="text" value="${escapeAttribute(profileState.physician.searchName)}" placeholder="Start typing your physician's name" aria-label="Search for physician" data-physician-filter="searchName" data-physician-search />
                  </div>
                  <div class="card physician-results" data-physician-results-list>
                    ${renderPhysicianSuggestions()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  const secondaryPhysician = getPhysicianRecord("secondary");
  return `
    <div class="card intake-panel">
      <div class="intake-address-grid intake-physician-grid">
        ${renderPhysicianCard("Primary Physician", primaryPhysician, "primary")}
        ${hasPhysicianRecord(secondaryPhysician)
          ? renderPhysicianCard("Second Physician", secondaryPhysician, "secondary")
          : `
            <article class="card intake-data-card intake-add-card">
              <div class="surface-card__header">Second Physician</div>
              <div class="intake-add-card__body">
                <p>Add a second physician</p>
                <button class="plus-button" data-open-physician-picker="secondary" type="button" aria-label="Add second physician">+</button>
              </div>
            </article>
          `}
      </div>
    </div>
  `;
}

function renderPhysicianCard(title, physician, slot) {
  return `
    <article class="card intake-data-card">
      <div class="surface-card__header intake-card__header">
        <span>${title}</span>
        <button class="icon-edit" data-edit-physician="${slot}" type="button" aria-label="Edit ${title.toLowerCase()}">Edit</button>
      </div>
      <div class="intake-address-body intake-physician-body">
        <p class="intake-address-label">Physician</p>
        <p>${physician.firstName} ${physician.lastName}</p>
        <p>${physician.address1}</p>
        ${physician.address2 ? `<p>${physician.address2}</p>` : ""}
        <p>${formatCityStateZip(physician.city, physician.state, physician.zipCode)}</p>
        ${physician.phoneNumber ? `<p>${physician.phoneNumber}</p>` : ""}
      </div>
    </article>
  `;
}

function isProfileReadyForProductSelection() {
  const hasPrimaryInsurance = Boolean(
    profileState.insurance.primaryPayer
    && profileState.insurance.description
    && profileState.insurance.insuranceType,
  );
  const hasBillingAddress = Boolean(
    profileState.addresses.billingName
    && profileState.addresses.billingStreet
    && profileState.addresses.billingCity
    && profileState.addresses.billingState
    && profileState.addresses.billingZip,
  );
  const hasPrimaryPhysician = hasPhysicianRecord(getPhysicianRecord("primary"));

  return hasPrimaryInsurance && hasBillingAddress && hasPrimaryPhysician;
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

function physicianResult(name, meta, physicianId = "") {
  const text = meta ? `<p class="physician-results__meta">${meta}</p>` : "";
  const actionLabel = name === "See All Search Results" ? "Open" : "Select";
  const actionAttr = name === "See All Search Results"
    ? "data-open-physician-results"
    : `data-physician-select="${escapeAttribute(physicianId)}"`;
  return `
    <button class="physician-results__row" ${actionAttr} type="button">
      <div class="physician-results__identity">
        <div>
          <p class="physician-results__name">${name}</p>
          ${text}
        </div>
      </div>
      <span class="physician-results__select">${actionLabel}</span>
    </button>
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

function openModal(target) {
  if (target === "insurance") {
    if (activeModalTarget !== "insurance") {
      initializeInsuranceEditState(profileState.insurance.primaryPayer);
    }
    if (!insuranceProviderState.loaded && !insuranceProviderState.loading) {
      void loadInsuranceProviders();
    }
  }
  const config = modalConfig(target);
  if (!config) return;
  activeModalTarget = target;
  if (modalCard instanceof HTMLElement) {
    modalCard.classList.toggle("modal-card--wide", config.variant === "wide");
    modalCard.classList.toggle("modal-card--physician-results", target === "physician-search-results");
  }
  modalEyebrow.textContent = config.eyebrow || "Edit Details";
  modalTitle.textContent = config.title;
  modalSubtitle.textContent = config.subtitle || "";
  modalSubtitle.hidden = !config.subtitle;
  modalForm.innerHTML = config.body ?? `${config.fields}${modalFooter(config.submitLabel)}`;
  modalLayer.hidden = false;
  document.body.classList.add("is-modal-open");
  const firstInput = modalForm.querySelector("input, select, textarea");
  if (firstInput instanceof HTMLElement) firstInput.focus();
}

function closeModal() {
  activeModalTarget = "";
  modalLayer.hidden = true;
  document.body.classList.remove("is-modal-open");
  if (modalCard instanceof HTMLElement) {
    modalCard.classList.remove("modal-card--wide");
    modalCard.classList.remove("modal-card--physician-results");
  }
  modalEyebrow.textContent = "";
  modalTitle.textContent = "";
  modalSubtitle.textContent = "";
  modalForm.innerHTML = "";
}

function rerenderCurrentRoute() {
  const portalRoutes = getRoutes();
  const fallbackRoute = getDefaultRoute();
  const route = portalRoutes[currentRoute] ?? portalRoutes[fallbackRoute];
  const render = views[currentRoute] ?? views[fallbackRoute];
  renderNavigation();
  renderPageChrome(currentRoute, route);
  pageContent.innerHTML = render(currentRoute);
}

function renderPageChrome(routeKey, route) {
  portalEyebrow.textContent = currentPortal === "fitter" ? "Fitter Portal" : "Patient Portal";
  portalViewSelect.value = currentPortal;
  pageTitle.textContent = route.title;
  pageSubtitle.innerHTML = currentPortal === "patient" && routeKey === "profile"
    ? `${route.subtitle} <button class="page-header__text-link" data-edit-target="prequalifying" type="button">Edit Prequalifying Questions</button>`
    : route.subtitle;
  pageHeaderActions.innerHTML = "";
  footerLabel.textContent = route.footer;
  pageTitle.classList.toggle("home-title", currentPortal === "patient" && routeKey === "home");
}

function getRoutes() {
  return currentPortal === "fitter" ? fitterRoutes : patientRoutes;
}

function getPortalNavRoutes() {
  return currentPortal === "fitter"
    ? ["home", "signout"]
    : ["profile", "orders", "support", "security", "signout"];
}

function getDefaultRoute() {
  return currentPortal === "fitter" ? "home" : "profile";
}

function renderNavigation() {
  const portalRoutes = getRoutes();
  const navRouteKeys = getPortalNavRoutes();

  navButtons.forEach((button, index) => {
    const routeKey = navRouteKeys[index];
    if (!routeKey) {
      button.hidden = true;
      button.dataset.route = "";
      button.innerHTML = "";
      return;
    }

    const route = portalRoutes[routeKey];
    button.hidden = false;
    button.dataset.route = routeKey;
    button.classList.toggle("nav-item--muted", currentPortal === "patient" && ["support", "security", "signout"].includes(routeKey));
    button.innerHTML = `
      <span class="nav-item__icon" aria-hidden="true">${iconMap[routeKey] ?? documentIcon()}</span>
      <span class="nav-item__label">${route.label}</span>
    `;
  });

  mobileNavButtons.forEach((button, index) => {
    const routeKey = navRouteKeys[index];
    if (!routeKey) {
      button.hidden = true;
      button.dataset.mobileRoute = "";
      button.innerHTML = "";
      return;
    }

    const route = portalRoutes[routeKey];
    button.hidden = false;
    button.dataset.mobileRoute = routeKey;
    button.innerHTML = `
      <span class="mobile-tabbar__icon" aria-hidden="true">${iconMap[routeKey] ?? documentIcon()}</span>
      <span class="mobile-tabbar__label">${route.label}</span>
    `;
  });
}

function modalConfig(target) {
  switch (target) {
    case "prequalifying":
      return {
        eyebrow: "Edit Details",
        title: "Edit Prequalifying Questions",
        fields: `
          ${modalField("Full Name", "name", profileState.prequalifying.name)}
          ${modalField("Email", "email", profileState.prequalifying.email, "email")}
          ${modalField("Phone", "phone", profileState.prequalifying.phone, "tel")}
          ${modalField("Date of Birth", "dateOfBirth", profileState.prequalifying.dateOfBirth)}
        `,
      };
    case "insurance":
      return {
        eyebrow: "Edit Details",
        title: "Edit Insurance Details",
        fields: `
          ${renderInsuranceProviderField()}
          ${modalField("Provider Account Number (Medicare Number)", "providerAccountNumber", profileState.insurance.providerAccountNumber)}
        `,
      };
    case "billing-address":
      return {
        eyebrow: "Edit Details",
        title: "Edit Billing Address",
        fields: `
          ${modalField("Billing Name", "billingName", profileState.addresses.billingName)}
          ${modalField("Billing Street", "billingStreet", profileState.addresses.billingStreet)}
          <div class="modal-grid modal-grid--address">
            ${modalField("City", "billingCity", profileState.addresses.billingCity)}
            ${modalField("State", "billingState", profileState.addresses.billingState)}
            ${modalField("Zip", "billingZip", profileState.addresses.billingZip)}
          </div>
        `,
      };
    case "shipping-address":
      return {
        eyebrow: "Edit Details",
        title: profileState.addresses.shippingStreet ? "Edit Shipping Address" : "Add Shipping Address",
        fields: `
          ${modalField("Shipping Name", "shippingName", profileState.addresses.shippingName)}
          ${modalField("Shipping Street", "shippingStreet", profileState.addresses.shippingStreet)}
          <div class="modal-grid modal-grid--address">
            ${modalField("City", "shippingCity", profileState.addresses.shippingCity)}
            ${modalField("State", "shippingState", profileState.addresses.shippingState)}
            ${modalField("Zip", "shippingZip", profileState.addresses.shippingZip)}
          </div>
        `,
      };
    case "personal":
      return {
        eyebrow: "Edit Details",
        title: "Edit Personal Information",
        fields: `
          ${modalField("Full Name", "name", profileState.personal.name)}
          ${modalField("Date of Birth", "dateOfBirth", profileState.personal.dateOfBirth)}
          ${modalField("Email", "email", profileState.personal.email, "email")}
          ${modalField("Phone", "phone", profileState.personal.phone, "tel")}
        `,
      };
    case "supplemental-insurance":
      return {
        eyebrow: "Edit Details",
        title: "Add Supplemental Insurance",
        fields: `
          ${modalField("Insurance Provider", "secondaryProvider", profileState.insurance.secondaryProvider)}
          ${modalField("Policy Number", "secondaryPolicyNumber", profileState.insurance.secondaryPolicyNumber)}
        `,
      };
    case "create-physician":
      {
        const physicianRecord = getPhysicianRecord(activePhysicianSlot);
      return {
        eyebrow: "Create New Physician",
        title: "Create New Physician",
        subtitle: "Patient Address & Demographics",
        fields: `
          <div class="modal-grid modal-grid--physician">
            <div class="modal-stack">
              ${modalField("NPI", "npi", physicianRecord.npi)}
              ${modalField("First Name", "firstName", physicianRecord.firstName)}
              ${modalField("Last Name", "lastName", physicianRecord.lastName)}
            </div>
            <div class="modal-stack">
              ${modalField("Address 1", "address1", physicianRecord.address1)}
              ${modalField("Address 2", "address2", physicianRecord.address2)}
              <div class="modal-grid modal-grid--address">
                ${modalField("City", "city", physicianRecord.city)}
                ${modalField("State", "state", physicianRecord.state)}
                ${modalField("Zip Code", "zipCode", physicianRecord.zipCode)}
              </div>
            </div>
            <div class="modal-stack">
              ${modalField("Phone Number", "phoneNumber", physicianRecord.phoneNumber, "tel")}
            </div>
          </div>
        `,
        submitLabel: "Next",
      };
      }
    case "edit-physician":
      {
        const physicianRecord = getPhysicianRecord(activePhysicianSlot);
        return {
          eyebrow: "Edit Physician",
          title: "Edit Physician Details",
          fields: `
            ${renderSelectedPhysicianField(physicianRecord)}
            ${renderPhysicianLocationField(physicianRecord)}
            <button class="physician-search__hero-link physician-search__hero-link--left" data-open-physician-picker="${activePhysicianSlot}" type="button">Search for a different physician</button>
          `,
        };
      }
    case "physician-search-results":
      return {
        eyebrow: "Search Results",
        title: "Physician Search",
        variant: "wide",
        body: renderPhysicianSearchResultsModal(),
      };
    default:
      return null;
  }
}

function applyModalChanges(target, formData) {
  const values = Object.fromEntries(formData.entries());
  switch (target) {
    case "prequalifying":
      Object.assign(profileState.prequalifying, values);
      Object.assign(profileState.personal, values);
      break;
    case "insurance":
      profileState.insurance.primaryPayer = resolveInsuranceProviderName(values.primaryPayer) || String(values.primaryPayer || "").trim();
      profileState.insurance.providerAccountNumber = String(values.providerAccountNumber || "").trim();
      break;
    case "billing-address":
      profileState.addresses.billingName = values.billingName || "";
      profileState.addresses.billingStreet = values.billingStreet || "";
      profileState.addresses.billingCity = values.billingCity || "";
      profileState.addresses.billingState = values.billingState || "";
      profileState.addresses.billingZip = values.billingZip || "";
      break;
    case "shipping-address":
      profileState.addresses.shippingName = values.shippingName || "";
      profileState.addresses.shippingStreet = values.shippingStreet || "";
      profileState.addresses.shippingCity = values.shippingCity || "";
      profileState.addresses.shippingState = values.shippingState || "";
      profileState.addresses.shippingZip = values.shippingZip || "";
      break;
    case "personal":
      Object.assign(profileState.personal, values);
      break;
    case "supplemental-insurance":
      profileState.insurance.hasSecondary = "Yes";
      profileState.insurance.secondaryProvider = values.secondaryProvider || "";
      profileState.insurance.secondaryPolicyNumber = values.secondaryPolicyNumber || "";
      break;
    case "create-physician":
      setPhysicianRecord(activePhysicianSlot, { ...values, locationId: "", locations: [] });
      break;
    case "edit-physician":
      applyPhysicianLocationSelection(activePhysicianSlot, values.locationId || "");
      break;
    default:
      break;
  }
}

function modalField(label, name, value, type = "text") {
  return `
    <label class="modal-field">
      <span class="modal-field__label">${label}</span>
      <input class="modal-input" type="${type}" name="${name}" value="${escapeAttribute(value)}" />
    </label>
  `;
}

function modalSelect(label, name, value, options) {
  return `
    <label class="modal-field">
      <span class="modal-field__label">${label}</span>
      <select class="modal-input" name="${name}">
        ${options.map((option) => `<option value="${option}"${option === value ? " selected" : ""}>${option}</option>`).join("")}
      </select>
    </label>
  `;
}

function modalFooter(submitLabelOverride = "") {
  const submitLabel = submitLabelOverride || (activeModalTarget === "create-physician" ? "Next" : "Save Changes");
  return `
    <div class="modal-actions">
      <button class="modal-secondary" type="button" data-modal-close>Cancel</button>
      <button class="pill-button" type="submit">${submitLabel}</button>
    </div>
  `;
}

function initializeInsuranceEditState(providerName = "") {
  const submittedProvider = String(providerName || "").trim();
  insuranceEditState.providerInput = submittedProvider;
  insuranceEditState.manualEntry = insuranceProviderState.loaded
    ? !Boolean(resolveInsuranceProviderName(submittedProvider))
    : false;
  insuranceEditState.error = "";
  insuranceEditState.isSuggestionOpen = false;
}

async function loadInsuranceProviders() {
  if (insuranceProviderState.loaded || insuranceProviderState.loading) return;
  insuranceProviderState.loading = true;
  insuranceProviderState.error = "";

  try {
    const response = await fetch(insuranceProviderDataUrl, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Insurance provider lookup failed with status ${response.status}`);
    }
    const data = await response.json();
    insuranceProviderState.items = Array.isArray(data)
      ? data
        .map((item) => item?.display_name)
        .filter((name) => typeof name === "string" && name.trim().length > 0)
        .sort((left, right) => left.localeCompare(right))
      : [];
    insuranceProviderState.loaded = true;
  } catch (error) {
    insuranceProviderState.error = error instanceof Error
      ? error.message
      : "Unable to load the insurance provider list.";
  } finally {
    insuranceProviderState.loading = false;
    if (
      activeModalTarget === "insurance"
      && insuranceProviderState.loaded
      && insuranceEditState.providerInput === profileState.insurance.primaryPayer
      && !resolveInsuranceProviderName(insuranceEditState.providerInput)
    ) {
      insuranceEditState.manualEntry = true;
    }
    if (activeModalTarget === "insurance") {
      openModal("insurance");
    }
  }
}

function renderInsuranceProviderField() {
  const providerValue = insuranceEditState.providerInput;
  const helperText = insuranceEditState.manualEntry
    ? "Enter the provider name exactly as it appears on the card."
    : insuranceProviderState.loading
      ? "Loading the provider list..."
      : insuranceProviderState.error
        ? "The provider list is unavailable right now. You can enter it manually."
        : "Search the provider list, then select the closest match.";
  const toggleLabel = insuranceEditState.manualEntry ? "Use provider list instead" : "Can't find it? Enter manually";
  const toggleMode = insuranceEditState.manualEntry ? "list" : "manual";
  const suggestionsMarkup = renderInsuranceProviderSuggestions();

  return `
    <div class="insurance-provider-picker" data-insurance-provider-picker>
      <label class="modal-field">
        <span class="modal-field__label">Insurance Provider</span>
        <input
          class="modal-input"
          type="text"
          name="primaryPayer"
          value="${escapeAttribute(providerValue)}"
          autocomplete="off"
          data-insurance-provider-input
        />
      </label>
      <div class="insurance-provider-picker__suggestions" data-insurance-provider-suggestions>
        ${suggestionsMarkup}
      </div>
      <div class="insurance-provider-picker__footer">
        <p class="insurance-provider-picker__helper">${helperText}</p>
        <button class="insurance-provider-picker__toggle" data-insurance-entry-mode="${toggleMode}" type="button">${toggleLabel}</button>
      </div>
      ${insuranceEditState.error ? `<p class="insurance-provider-picker__error">${insuranceEditState.error}</p>` : ""}
    </div>
  `;
}

function validateInsuranceModalSubmission(formData) {
  const values = Object.fromEntries(formData.entries());
  const submittedProvider = String(values.primaryPayer || "").trim();
  insuranceEditState.providerInput = submittedProvider;
  insuranceEditState.error = "";

  if (!submittedProvider) {
    insuranceEditState.error = "Enter the insurance provider or choose it from the list.";
    return false;
  }

  if (!insuranceEditState.manualEntry && !resolveInsuranceProviderName(submittedProvider)) {
    insuranceEditState.error = "Choose a provider from the list, or switch to manual entry if it is not listed.";
    return false;
  }

  return true;
}

function renderInsuranceProviderSuggestions() {
  if (insuranceEditState.manualEntry || !insuranceProviderState.loaded || !insuranceEditState.isSuggestionOpen) {
    return "";
  }

  const suggestions = getInsuranceProviderSuggestions(insuranceEditState.providerInput);
  if (!suggestions.length) {
    return '<p class="insurance-provider-picker__empty">No matching providers found.</p>';
  }

  return suggestions
    .map((provider) => `
      <button
        class="insurance-provider-picker__option"
        data-insurance-provider-option="${escapeAttribute(provider)}"
        type="button"
      >${escapeAttribute(provider)}</button>
    `)
    .join("");
}

function getInsuranceProviderSuggestions(query) {
  const normalizedQuery = normalizeInsuranceProviderName(query);
  const startsWith = [];
  const contains = [];

  for (const provider of insuranceProviderState.items) {
    const normalizedProvider = normalizeInsuranceProviderName(provider);
    if (!normalizedQuery) {
      startsWith.push(provider);
      if (startsWith.length >= 8) break;
      continue;
    }
    if (normalizedProvider.startsWith(normalizedQuery)) {
      startsWith.push(provider);
      continue;
    }
    if (normalizedProvider.includes(normalizedQuery)) {
      contains.push(provider);
    }
  }

  return [...startsWith, ...contains].slice(0, 8);
}

function refreshInsuranceAutocompleteUi() {
  const suggestions = document.querySelector("[data-insurance-provider-suggestions]");
  if (suggestions) {
    suggestions.innerHTML = renderInsuranceProviderSuggestions();
  }
}

function syncInsuranceProviderInput() {
  const providerInput = document.querySelector("[data-insurance-provider-input]");
  if (providerInput instanceof HTMLInputElement) {
    providerInput.value = insuranceEditState.providerInput;
  }
}

function resolveInsuranceProviderName(providerName) {
  const normalizedName = normalizeInsuranceProviderName(providerName);
  if (!normalizedName) return "";
  return insuranceProviderState.items.find((provider) => normalizeInsuranceProviderName(provider) === normalizedName) || "";
}

function normalizeInsuranceProviderName(providerName) {
  return String(providerName || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function emptyPhysicianRecord() {
  return {
    npi: "",
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
    locationId: "",
    locations: [],
  };
}

function getPhysicianRecord(slot = "primary") {
  return slot === "secondary"
    ? profileState.physician.secondary
    : profileState.physician.primary;
}

function setPhysicianRecord(slot, values) {
  const record = getPhysicianRecord(slot);
  record.npi = values.npi || "";
  record.firstName = values.firstName || "";
  record.lastName = values.lastName || "";
  record.address1 = values.address1 || "";
  record.address2 = values.address2 || "";
  record.city = values.city || "";
  record.state = values.state || "";
  record.zipCode = values.zipCode || "";
  record.phoneNumber = values.phoneNumber || values.phone || "";
  record.locationId = values.locationId || record.locationId || "";
  if (Array.isArray(values.locations)) {
    record.locations = values.locations.map((location) => ({ ...location }));
  } else if (!Array.isArray(record.locations)) {
    record.locations = [];
  }
}

function applyPhysicianLocationSelection(slot, locationId) {
  const record = getPhysicianRecord(slot);
  if (!Array.isArray(record.locations) || !record.locations.length) return;
  const selectedLocation = record.locations.find((location) => location.id === locationId) || record.locations[0];
  if (!selectedLocation) return;
  record.locationId = selectedLocation.id;
  record.address1 = selectedLocation.address1 || "";
  record.address2 = selectedLocation.address2 || "";
  record.city = selectedLocation.city || "";
  record.state = selectedLocation.state || "";
  record.zipCode = selectedLocation.zipCode || "";
  record.phoneNumber = selectedLocation.phone || "";
}

function renderSelectedPhysicianField(physicianRecord) {
  const name = [physicianRecord.firstName, physicianRecord.lastName].filter(Boolean).join(" ");
  return `
    <div class="physician-selected-card">
      <p class="modal-field__label">Selected Physician</p>
      <div class="physician-selected-card__body">
        <p class="physician-selected-card__name">${name || "No physician selected"}</p>
        ${physicianRecord.npi ? `<p class="physician-selected-card__meta">NPI: ${physicianRecord.npi}</p>` : ""}
        ${physicianRecord.address1 ? `<p class="physician-selected-card__meta">${physicianRecord.address1}</p>` : ""}
        ${physicianRecord.address2 ? `<p class="physician-selected-card__meta">${physicianRecord.address2}</p>` : ""}
        ${(physicianRecord.city || physicianRecord.state || physicianRecord.zipCode) ? `<p class="physician-selected-card__meta">${formatCityStateZip(physicianRecord.city, physicianRecord.state, physicianRecord.zipCode)}</p>` : ""}
      </div>
    </div>
  `;
}

function renderPhysicianLocationField(physicianRecord) {
  const locations = Array.isArray(physicianRecord.locations) ? physicianRecord.locations : [];
  const selectedLocationId = physicianRecord.locationId || locations[0]?.id || "";

  if (locations.length <= 1) {
    return `
      <input type="hidden" name="locationId" value="${escapeAttribute(selectedLocationId)}" />
      <div class="physician-selected-card physician-selected-card--compact">
        <p class="modal-field__label">Location</p>
        <div class="physician-selected-card__body">
          <p class="physician-selected-card__meta">${locations.length ? formatPhysicianLocationLabel(locations[0]) : "One location on file"}</p>
        </div>
      </div>
    `;
  }

  return `
    <label class="modal-field">
      <span class="modal-field__label">Location</span>
      <select class="modal-input" name="locationId">
        ${locations.map((location) => `
          <option value="${escapeAttribute(location.id)}"${location.id === selectedLocationId ? " selected" : ""}>
            ${escapeAttribute(formatPhysicianLocationLabel(location))}
          </option>
        `).join("")}
      </select>
    </label>
  `;
}

function formatPhysicianLocationLabel(location) {
  return [
    [location.address1, location.address2].filter(Boolean).join(" "),
    [location.city, location.state].filter(Boolean).join(", "),
  ].filter(Boolean).join(" • ");
}

function hasPhysicianRecord(physician) {
  return Boolean(
    physician
    && (physician.npi || physician.firstName || physician.lastName || physician.address1),
  );
}

function formatCityStateZip(city, state, zip) {
  return [city, state].filter(Boolean).join(", ") + (zip ? ` ${zip}` : "");
}

function renderPhysicianSearchResultsModal() {
  const results = getSortedPhysicianResults();
  const totalResults = physicianSearchState.total;
  const perPage = physicianResultsPerPage;
  const totalPages = Math.max(1, Math.ceil(totalResults / perPage));
  const currentPage = Math.min(physicianResultsPage, totalPages);
  physicianResultsPage = currentPage;
  const start = (currentPage - 1) * perPage;
  const pagedResults = results.slice(start, start + perPage);
  const end = Math.min(start + pagedResults.length, totalResults);
  const lastPage = totalPages;
  const sortLabel = physicianSearchState.sortField === "city" ? "City" : "First Name";
  const sortDirectionLabel = physicianSearchState.sortDirection === "asc" ? "Ascending" : "Descending";

  const rows = physicianSearchState.loading
    ? `
      <div class="physician-modal__empty">
        <p>Searching the physician directory...</p>
      </div>
    `
    : !physicianSearchState.hasSearched
      ? `
        <div class="physician-modal__empty">
          <p>Enter search criteria to find a physician.</p>
        </div>
      `
    : physicianSearchState.error
      ? `
        <div class="physician-modal__empty">
          <p>${physicianSearchState.error}</p>
        </div>
      `
      : pagedResults.length
        ? pagedResults
        .map(
          (physician) => `
            <article class="physician-modal__row">
              <div class="physician-modal__identity">
                <p class="physician-modal__name">${physician.name}</p>
                <p class="physician-modal__meta">${physician.street}</p>
                <p class="physician-modal__meta">${physician.city}, ${physician.state}</p>
              </div>
              <div class="physician-modal__details">
                <div>
                  <p class="physician-modal__title">${physician.title}</p>
                  <p class="physician-modal__phone">${physician.phone}</p>
                </div>
                <button class="physician-modal__select" data-physician-select="${escapeAttribute(physician.id)}" type="button">Select <span aria-hidden="true">›</span></button>
              </div>
            </article>
          `,
        )
        .join("")
        : `
          <div class="physician-modal__empty">
            <p>No physicians match the current search.</p>
            <button class="physician-create-link physician-create-link--inline" data-edit-target="create-physician" type="button">Create a new physician instead -></button>
          </div>
        `;

  return `
    <section class="physician-modal">
      <div class="physician-modal__topbar">
        <div class="physician-modal__filters">
          <label class="modal-field">
            <span class="modal-field__label">State</span>
            <input class="modal-input" type="text" value="${escapeAttribute(profileState.physician.searchState)}" name="searchState" data-modal-physician-filter="searchState" />
          </label>
          <label class="modal-field">
            <span class="modal-field__label">City</span>
            <input class="modal-input" type="text" value="${escapeAttribute(profileState.physician.searchCity)}" name="searchCity" data-modal-physician-filter="searchCity" />
          </label>
          <label class="modal-field physician-modal__name-field">
            <span class="modal-field__label">Last Name</span>
            <div class="physician-modal__search">
              <input class="modal-input" type="text" value="${escapeAttribute(profileState.physician.searchName)}" name="searchName" data-modal-physician-filter="searchName" />
              <button class="pill-button physician-modal__search-button" data-physician-search-submit type="button">Search</button>
            </div>
          </label>
        </div>
        <div class="physician-modal__sortbar">
          <p class="physician-modal__sort-label">Sort: ${sortLabel} (${sortDirectionLabel})</p>
          <div class="physician-modal__sort-actions">
            ${renderPhysicianSortButton("firstName", "First Name")}
            ${renderPhysicianSortButton("city", "City")}
          </div>
        </div>
      </div>
      <div class="physician-modal__scroll-region">
        <div class="physician-modal__results">
          ${rows}
        </div>
        <div class="physician-modal__footer">
          <p>Showing ${totalResults ? start + 1 : 0}-${end} of ${totalResults} entries</p>
          ${renderPhysicianPagination(currentPage, totalPages, lastPage)}
        </div>
      </div>
    </section>
  `;
}

function renderPhysicianSortButton(field, label) {
  const isActive = physicianSearchState.sortField === field;
  const direction = isActive ? physicianSearchState.sortDirection : "asc";
  const arrow = direction === "asc" ? "↑" : "↓";
  return `
    <button class="physician-modal__sort-button${isActive ? " is-active" : ""}" data-physician-sort="${field}" type="button" aria-pressed="${isActive ? "true" : "false"}">
      ${label} <span aria-hidden="true">${arrow}</span>
    </button>
  `;
}

function renderPhysicianPagination(currentPage, totalPages, lastPage) {
  if (!physicianSearchState.total) return "";
  const prevDisabled = currentPage === 1;
  const nextDisabled = currentPage === totalPages;
  const pageNumbers = new Set([1, currentPage - 1, currentPage, currentPage + 1, lastPage]);
  const visiblePages = [...pageNumbers]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
  const pageButtons = visiblePages
    .map((page, index) => {
      const previousPage = visiblePages[index - 1];
      const needsEllipsis = previousPage && page - previousPage > 1;
      return `${needsEllipsis ? '<span class="physician-modal__ellipsis">...</span>' : ""}${renderPhysicianPageButton(page, currentPage)}`;
    })
    .join("");

  return `
    <div class="physician-modal__pagination">
      <button class="physician-modal__pager${prevDisabled ? " is-disabled" : ""}" data-physician-page="${Math.max(currentPage - 1, 1)}" type="button"${prevDisabled ? " disabled" : ""}>Prev</button>
      <div class="physician-modal__pages">
        ${pageButtons}
      </div>
      <button class="physician-modal__pager${nextDisabled ? " is-disabled" : ""}" data-physician-page="${Math.min(currentPage + 1, totalPages)}" type="button"${nextDisabled ? " disabled" : ""}>Next</button>
    </div>
  `;
}

function renderPhysicianPageButton(page, currentPage) {
  return `
    <button class="physician-modal__page${page === currentPage ? " is-active" : ""}" data-physician-page="${page}" type="button">${page}</button>
  `;
}

function getSortedPhysicianResults() {
  const items = [...physicianSearchState.items];
  const direction = physicianSearchState.sortDirection === "desc" ? -1 : 1;

  items.sort((left, right) => {
    const leftValue = getPhysicianSortValue(left, physicianSearchState.sortField);
    const rightValue = getPhysicianSortValue(right, physicianSearchState.sortField);
    const primaryComparison = leftValue.localeCompare(rightValue, undefined, { sensitivity: "base" });
    if (primaryComparison !== 0) {
      return primaryComparison * direction;
    }
    return left.name.localeCompare(right.name, undefined, { sensitivity: "base" }) * direction;
  });

  return items;
}

function getPhysicianSortValue(physician, field) {
  if (field === "city") return physician.city || "";
  if (field === "firstName") return physician.firstName || physician.name || "";
  return physician.lastName || physician.name || "";
}

function renderPhysicianSuggestions() {
  if (physicianSearchState.loading) {
    return '<div class="physician-results__empty"><p>Searching the physician directory...</p></div>';
  }
  if (physicianSearchState.error) {
    return `<div class="physician-results__empty"><p>${physicianSearchState.error}</p></div>`;
  }
  if (!physicianSearchState.hasSearched || !profileState.physician.searchName.trim()) {
    return "";
  }
  if (!physicianSearchState.items.length) {
    return '<div class="physician-results__empty"><p>No physicians found. Try a different city, state, or last name.</p></div>';
  }

  const suggestionRows = physicianSearchState.items
    .slice(0, 2)
    .map((physician) => physicianResult(physician.name, formatPhysicianMeta(physician), physician.id))
    .join("");
  const searchAllRow = physicianSearchState.total > 2 ? physicianResult("See All Search Results", "") : "";
  return `${suggestionRows}${searchAllRow}`;
}

function formatPhysicianMeta(physician) {
  const location = [physician.street, [physician.city, physician.state].filter(Boolean).join(", ")].filter(Boolean).join(". ");
  return location;
}

function schedulePhysicianSearch({ page = 1, openModal = false } = {}) {
  window.clearTimeout(physicianSearchDebounce);
  physicianSearchDebounce = window.setTimeout(() => {
    void fetchPhysicians({ page, openModal });
  }, 280);
}

async function fetchPhysicians({ page = 1, openModal = false } = {}) {
  const query = profileState.physician.searchName.trim();
  physicianResultsPage = page;

  if (query.length < 2) {
    physicianSearchState.items = [];
    physicianSearchState.total = 0;
    physicianSearchState.loading = false;
    physicianSearchState.error = "";
    physicianSearchState.hasSearched = false;
    refreshPhysicianSearchUi({ openModal });
    return;
  }

  physicianSearchState.loading = true;
  physicianSearchState.error = "";
  physicianSearchState.currentPage = page;
  refreshPhysicianSearchUi({ openModal });

  const requestId = ++physicianSearchRequestId;

  try {
    const response = await fetch(buildPhysicianSearchUrl(), {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Physician lookup failed with status ${response.status}`);
    }
    const data = await response.json();
    if (requestId !== physicianSearchRequestId) return;
    if (Array.isArray(data.Errors) && data.Errors.length) {
      throw new Error(data.Errors[0].description || "The CMS lookup did not return physician results.");
    }

    physicianSearchState.items = Array.isArray(data.results)
      ? data.results.map(mapPhysicianResult).filter(shouldShowPhysicianResult)
      : [];
    physicianSearchState.total = physicianSearchState.items.length;
    physicianSearchState.loading = false;
    physicianSearchState.error = "";
    physicianSearchState.hasSearched = true;
    physicianSearchState.currentPage = page;
  } catch (error) {
    if (requestId !== physicianSearchRequestId) return;
    physicianSearchState.items = [];
    physicianSearchState.total = 0;
    physicianSearchState.loading = false;
    physicianSearchState.hasSearched = true;
    physicianSearchState.error = error instanceof Error
      ? error.message
      : "We couldn't reach the CMS physician directory right now.";
  }

  refreshPhysicianSearchUi({ openModal });
}

function refreshPhysicianSearchUi({ openModal: shouldOpenModal = false } = {}) {
  const suggestionList = document.querySelector("[data-physician-results-list]");
  if (suggestionList) {
    suggestionList.innerHTML = renderPhysicianSuggestions();
  }
  const shell = document.querySelector("[data-physician-shell]");
  const shouldOpen = profileState.physician.searchName.trim().length > 0;
  if (shell) {
    shell.classList.toggle("is-search-active", shouldOpen);
  }
  if (shouldOpenModal || activeModalTarget === "physician-search-results") {
    openModal("physician-search-results");
  }
}

function closePhysicianSuggestions() {
  const shell = document.querySelector("[data-physician-shell]");
  if (shell) {
    shell.classList.remove("is-search-active");
  }
}

function openPhysicianPicker() {
  physicianResultsPage = 1;
  physicianSearchState.items = [];
  physicianSearchState.total = 0;
  physicianSearchState.loading = false;
  physicianSearchState.error = "";
  physicianSearchState.hasSearched = false;
  openModal("physician-search-results");
}

function buildPhysicianSearchUrl() {
  const params = new URLSearchParams({
    version: "2.1",
    enumeration_type: "NPI-1",
  });

  if (profileState.physician.searchState.trim()) {
    params.set("state", profileState.physician.searchState.trim().toUpperCase());
  }
  if (profileState.physician.searchCity.trim()) {
    params.set("city", profileState.physician.searchCity.trim());
  }

  const tokens = profileState.physician.searchName.trim().split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    params.set("first_name", `${tokens[0]}*`);
    params.set("last_name", `${tokens.slice(1).join(" ")}*`);
    params.set("use_first_name_alias", "true");
  } else if (tokens.length === 1) {
    params.set("last_name", `${tokens[0]}*`);
  }

  return `${physicianApiBase}?${params.toString()}`;
}

function mapPhysicianResult(result) {
  const basic = result.basic || {};
  const taxonomies = result.taxonomies || [];
  const address = (result.addresses || []).find((item) => item.address_purpose === "LOCATION")
    || (result.addresses || [])[0]
    || {};
  const taxonomy = taxonomies.find((item) => item.primary)
    || taxonomies[0]
    || {};
  const name = [basic.first_name, basic.last_name].filter(Boolean).join(" ")
    || basic.organization_name
    || "Unknown Physician";
  const postalCode = String(address.postal_code || "").slice(0, 5);

  return {
    id: String(result.number || name),
    npi: String(result.number || ""),
    name,
    firstName: basic.first_name || "",
    lastName: basic.last_name || "",
    title: taxonomy.desc || "Physician",
    taxonomyTitles: taxonomies.map((item) => item.desc || "").filter(Boolean),
    street: [address.address_1, address.address_2].filter(Boolean).join(" "),
    address1: address.address_1 || "",
    address2: address.address_2 || "",
    city: address.city || "",
    state: address.state || "",
    zipCode: postalCode,
    phone: address.telephone_number || "",
    locationId: "",
    locations: mapPhysicianLocations(result),
  };
}

function mapPhysicianLocations(result) {
  const addresses = Array.isArray(result.addresses) ? result.addresses : [];
  const locationAddresses = addresses.filter((item) => item.address_purpose === "LOCATION");
  const sourceAddresses = locationAddresses.length ? locationAddresses : addresses.slice(0, 1);
  const deduped = [];
  const seen = new Set();

  sourceAddresses.forEach((address, index) => {
    const postalCode = String(address.postal_code || "").slice(0, 5);
    const key = [
      address.address_1 || "",
      address.address_2 || "",
      address.city || "",
      address.state || "",
      postalCode,
      address.telephone_number || "",
    ].join("|");
    if (seen.has(key)) return;
    seen.add(key);
    deduped.push({
      id: `${result.number || "location"}-${index + 1}`,
      address1: address.address_1 || "",
      address2: address.address_2 || "",
      city: address.city || "",
      state: address.state || "",
      zipCode: postalCode,
      phone: address.telephone_number || "",
    });
  });

  return deduped;
}

function shouldShowPhysicianResult(physician) {
  const titles = [physician.title, ...(physician.taxonomyTitles || [])]
    .map(normalizePhysicianTitle)
    .filter(Boolean);
  return !titles.some((title) => hiddenPhysicianTitleKeywords.some((keyword) => title.includes(keyword)));
}

function normalizePhysicianTitle(title) {
  return String(title || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/&/g, "and")
    .replace(/[/-]/g, " ")
    .toLowerCase();
}

function applyPhysicianSelection(physician) {
  setPhysicianRecord(activePhysicianSlot, {
    npi: physician.npi,
    firstName: physician.firstName,
    lastName: physician.lastName,
    address1: physician.address1,
    address2: physician.address2,
    city: physician.city,
    state: physician.state,
    zipCode: physician.zipCode,
    phone: physician.phone,
    locationId: physician.locationId || physician.locations?.[0]?.id || "",
    locations: physician.locations || [],
  });
  applyPhysicianLocationSelection(activePhysicianSlot, physician.locationId || physician.locations?.[0]?.id || "");
  profileState.physician.searchCity = physician.city || profileState.physician.searchCity;
  profileState.physician.searchState = physician.state || profileState.physician.searchState;
  profileState.physician.searchName = physician.lastName || physician.name;
  closeModal();
  rerenderCurrentRoute();
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

function fontAwesomeIcon(iconClassName) {
  return `<i class="fa-solid ${iconClassName}" aria-hidden="true"></i>`;
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
