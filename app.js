(() => {
  "use strict";

  const config = window.SITE_CONFIG;
  if (!config) return;

  const { company } = config;
  const selectAll = (selector) => document.querySelectorAll(selector);
  const setText = (selector, value) => selectAll(selector).forEach((element) => { element.textContent = value; });
  const whatsappUrl = (message) => `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(message)}`;

  setText("[data-company-name]", company.name);
  setText("[data-tagline]", company.tagline);
  setText("[data-subtitle]", company.subtitle);
  setText("[data-email]", company.email);
  setText("[data-phone]", company.phoneDisplay);
  setText("[data-country]", company.country);
  setText("[data-address]", company.address);
  setText("[data-business-hours]", company.businessHours);
  selectAll("[data-email-link]").forEach((link) => { link.href = `mailto:${company.email}`; });
  selectAll("[data-phone-link]").forEach((link) => { link.href = `tel:${company.phoneDial}`; });

  const welcomeMessage = `Hello ${company.name}, I would like to know more about your business solutions.`;
  [document.getElementById("whatsapp-float"), document.getElementById("footer-whatsapp")].forEach((link) => {
    if (link) link.href = whatsappUrl(welcomeMessage);
  });

  const mapLink = document.getElementById("map-link");
  if (company.mapUrl && mapLink) {
    mapLink.href = company.mapUrl;
    mapLink.hidden = false;
  }

  const visibleProducts = config.products.filter((product) => product.visible);
  const interestSelect = document.getElementById("interest-select");
  if (interestSelect) {
    [...visibleProducts.map((product) => product.name), ...config.enquiryOptions].forEach((label) => {
      interestSelect.add(new Option(label, label));
    });
  }

  const footerProducts = document.getElementById("footer-products");
  if (footerProducts) {
    visibleProducts.forEach((product) => {
      const link = document.createElement("a");
      link.href = "#products";
      link.textContent = product.name;
      footerProducts.appendChild(link);
    });
  }

  const productGrid = document.getElementById("product-grid");
  if (productGrid) {
    productGrid.innerHTML = visibleProducts.map((product) => `
      <article class="product-card reveal" style="--card-color:${product.color};--card-soft:${product.soft};--card-glow:${product.glow}">
        <div class="product-top"><span class="product-icon">${product.code}</span><span class="product-label">${product.eyebrow}</span></div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <ul class="feature-list">${product.features.map((feature) => `<li>${feature}</li>`).join("")}</ul>
        <a class="text-link" href="#contact">Explore ${product.name.replace("DigiBillMate ", "")} <span aria-hidden="true">→</span></a>
        <span class="product-industries">${product.industries}</span>
      </article>
    `).join("");
  }

  const customerGrid = document.getElementById("customer-grid");
  if (customerGrid) {
    customerGrid.innerHTML = config.customers.map((customer) => `
      <article class="customer-card reveal" style="--customer-color:${customer.color};--customer-soft:${customer.soft}">
        ${customer.logo ? `<img class="customer-logo" src="${customer.logo}" alt="${customer.name} logo" loading="lazy">` : `<div class="customer-logo" aria-hidden="true">${customer.initials}</div>`}
        <h3>${customer.name}</h3>
        <span class="industry">${customer.industry}</span>
        <blockquote>“${customer.message}”</blockquote>
      </article>
    `).join("");
  }

  const productIds = new Set(visibleProducts.map((product) => product.id));
  const pricingGrid = document.getElementById("pricing-grid");
  if (pricingGrid) {
    pricingGrid.innerHTML = config.pricing.filter((plan) => productIds.has(plan.productId)).map((plan) => `
      <article class="price-card ${plan.popular ? "popular" : ""} reveal">
        ${plan.popular ? '<span class="popular-badge">Popular</span>' : ""}
        <h3>${plan.title}</h3>
        <p class="price">${plan.priceLabel}</p>
        <p class="price-detail">${plan.detail}</p>
        <ul class="price-features">${plan.features.map((feature) => `<li>${feature}</li>`).join("")}</ul>
        <a class="button" href="#contact">Request a quote</a>
      </article>
    `).join("");
  }

  const faqList = document.getElementById("faq-list");
  if (faqList) {
    faqList.innerHTML = config.faqs.map((item, index) => `
      <details class="faq-item reveal" ${index === 0 ? "open" : ""}>
        <summary>${item.question}</summary>
        <p>${item.answer}</p>
      </details>
    `).join("");
  }

  const socialLabels = { facebook: "f", instagram: "ig", linkedin: "in", x: "x" };
  const socialLinks = document.getElementById("social-links");
  if (socialLinks) {
    const activeLinks = Object.entries(config.socialLinks).filter(([, url]) => Boolean(url));
    socialLinks.innerHTML = activeLinks.map(([network, url]) => `<a href="${url}" target="_blank" rel="noopener" aria-label="${network}">${socialLabels[network]}</a>`).join("");
    socialLinks.hidden = activeLinks.length === 0;
  }

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.getElementById("primary-nav");
  const closeMenu = () => {
    if (!menuButton || !nav) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
    nav.classList.remove("open");
    document.body.classList.remove("menu-open");
  };

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
      nav.classList.toggle("open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });
    window.addEventListener("resize", () => { if (window.innerWidth > 840) closeMenu(); });
  }

  const sectionLinks = Array.from(document.querySelectorAll('.primary-nav a[href^="#"]'));
  const navigationSections = sectionLinks.map((link) => ({
    link,
    section: document.querySelector(link.getAttribute("href"))
  })).filter((item) => item.section);
  let navigationFramePending = false;

  const markActiveSection = (activeLink) => {
    sectionLinks.forEach((link) => {
      const isActive = link === activeLink;
      link.classList.toggle("active", isActive);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  const updateActiveNavigation = () => {
    if (!navigationSections.length) return;
    const marker = window.scrollY + Math.max(120, window.innerHeight * 0.3);
    let current = navigationSections[0];
    navigationSections.forEach((item) => {
      if (item.section.offsetTop <= marker) current = item;
    });
    const pageBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    if (pageBottom) current = navigationSections[navigationSections.length - 1];
    markActiveSection(current.link);
  };

  const scheduleNavigationUpdate = () => {
    if (navigationFramePending) return;
    navigationFramePending = true;
    window.requestAnimationFrame(() => {
      updateActiveNavigation();
      navigationFramePending = false;
    });
  };

  sectionLinks.forEach((link) => link.addEventListener("click", () => markActiveSection(link)));
  window.addEventListener("scroll", scheduleNavigationUpdate, { passive: true });
  window.addEventListener("resize", scheduleNavigationUpdate);
  updateActiveNavigation();

  const form = document.getElementById("enquiry-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const message = [
        `Hello ${company.name},`,
        "",
        "I would like to discuss a business solution.",
        `Name: ${data.get("name")}`,
        `Business: ${data.get("business")}`,
        `Phone: ${data.get("phone")}`,
        `Interested in: ${data.get("interest")}`,
        `Requirement: ${data.get("message")}`
      ].join("\n");
      window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
    });
  }

  const year = document.getElementById("current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: "https://digibillmate.pages.dev/",
    logo: "https://digibillmate.pages.dev/home.png",
    email: company.email,
    telephone: company.phoneDial,
    address: { "@type": "PostalAddress", addressCountry: "IN" }
  };
  const schema = document.createElement("script");
  schema.type = "application/ld+json";
  schema.textContent = JSON.stringify(structuredData);
  document.head.appendChild(schema);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || !("IntersectionObserver" in window)) {
    selectAll(".reveal").forEach((element) => element.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: "0px 0px -30px" });
    selectAll(".reveal").forEach((element) => observer.observe(element));
  }
})();
