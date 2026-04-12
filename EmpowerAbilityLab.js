// Empower Ability Labs SPA interactions
// Main features:
// 1. Single-page navigation
// 2. Focus management and dynamic page titles
// 3. Accessible modal dialog with focus trap
// 4. Accessible switch control
// 5. Conditional show/hide of event details field
// 6. Accessible form validation and user notifications

function knowledgeRunner() {
    const viewConfig = {
        "#home-view": {
            section: document.getElementById("home-view"),
            nav: document.getElementById("nav-home"),
            title: "Home - Empower Ability Labs",
            focusTarget: document.getElementById("home-heading")
        },
        "#services-view": {
            section: document.getElementById("services-view"),
            nav: document.getElementById("nav-services"),
            title: "Services - Empower Ability Labs",
            focusTarget: document.getElementById("services-heading")
        },
        "#schedule-view": {
            section: document.getElementById("schedule-view"),
            nav: document.getElementById("nav-schedule"),
            title: "Schedule a Call - Empower Ability Labs",
            focusTarget: document.getElementById("schedule-heading")
        }
    };

    const mainContent = document.getElementById("main-content");

    const modal = document.getElementById("community-modal");
    const openModalBtn = document.getElementById("open-modal-btn");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const closeModalFooterBtn = document.getElementById("close-modal-footer-btn");

    const speakerCheckbox = document.getElementById("topic-speaker");
    const eventDetailsSection = document.getElementById("event-details-section");
    const eventDetailsField = document.getElementById("event-details");

    const emailUpdatesSwitch = document.getElementById("email-updates-switch");
    const switchImg = document.getElementById("switch-img");

    const form = document.getElementById("schedule-form");
    const formAnnouncements = document.getElementById("form-announcements");
    const businessName = document.getElementById("business-name");
    const phoneNumber = document.getElementById("phone-number");
    const emailAddress = document.getElementById("email-address");

    const businessNameError = document.getElementById("business-name-error");
    const phoneError = document.getElementById("phone-error");
    const emailError = document.getElementById("email-error");

    let lastFocusedElement = null;

    function getCurrentHash() {
        return viewConfig[window.location.hash] ? window.location.hash : "#home-view";
    }

    function updateNavState(activeHash) {
        Object.entries(viewConfig).forEach(([hash, config]) => {
            const isActive = hash === activeHash;
            config.nav.setAttribute("aria-current", isActive ? "page" : "false");
            config.nav.classList.toggle("active", isActive);
        });
    }

    function showView(hash, options = {}) {
        const { updateHistory = true, moveFocus = true } = options;
        const targetHash = viewConfig[hash] ? hash : "#home-view";

        Object.entries(viewConfig).forEach(([viewHash, config]) => {
            config.section.hidden = viewHash !== targetHash;
        });

        updateNavState(targetHash);
        document.title = viewConfig[targetHash].title;

        if (updateHistory && window.location.hash !== targetHash) {
            history.pushState({ view: targetHash }, "", targetHash);
        }

        if (moveFocus) {
            const focusTarget = viewConfig[targetHash].focusTarget || mainContent;
            focusTarget.setAttribute("tabindex", "-1");
            focusTarget.focus();
        }
    }

    function handleNavActivation(event) {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;

        const hash = link.getAttribute("href");
        if (!viewConfig[hash]) return;

        event.preventDefault();
        showView(hash, { updateHistory: true, moveFocus: true });
    }

    function getFocusableElements(container) {
        const selectors = [
            'a[href]',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ];

        return Array.from(container.querySelectorAll(selectors.join(',')))
            .filter((element) => !element.hidden && element.offsetParent !== null);
    }

    function openModal() {
        lastFocusedElement = document.activeElement;
        modal.hidden = false;
        document.body.classList.add("modal-open");
        openModalBtn.setAttribute("aria-expanded", "true");

        const focusableElements = getFocusableElements(modal);
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    function closeModal() {
        modal.hidden = true;
        document.body.classList.remove("modal-open");
        openModalBtn.setAttribute("aria-expanded", "false");

        if (lastFocusedElement) {
            lastFocusedElement.focus();
        } else {
            openModalBtn.focus();
        }
    }

    function trapFocusInModal(event) {
        if (modal.hidden || event.key !== "Tab") return;

        const focusableElements = getFocusableElements(modal);
        if (focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function handleGlobalKeydown(event) {
        if (!modal.hidden) {
            if (event.key === "Escape") {
                event.preventDefault();
                closeModal();
                return;
            }
            trapFocusInModal(event);
        }

        if (
            document.activeElement === emailUpdatesSwitch &&
            (event.key === " " || event.key === "Enter")
        ) {
            event.preventDefault();
            toggleSwitch();
        }
    }

    function syncEventDetailsVisibility(moveFocus = false) {
        const isChecked = speakerCheckbox.checked;
        eventDetailsSection.hidden = !isChecked;
        speakerCheckbox.setAttribute("aria-expanded", String(isChecked));

        if (!isChecked) {
            eventDetailsField.value = "";
            eventDetailsField.removeAttribute("required");
        } else {
            eventDetailsField.setAttribute("required", "required");
            if (moveFocus) {
                eventDetailsField.focus();
            }
        }
    }

    function toggleSwitch() {
        const isOn = emailUpdatesSwitch.getAttribute("aria-checked") === "true";
        const newState = !isOn;

        emailUpdatesSwitch.setAttribute("aria-checked", String(newState));
        switchImg.src = newState
            ? "images/switch-on.png"
            : "images/switch-off.png";

        switchImg.alt = newState
            ? "Email updates switch is on"
            : "Email updates switch is off";
    }

    emailUpdatesSwitch.addEventListener("click", toggleSwitch);


    function clearErrors() {
        [businessName, phoneNumber, emailAddress, eventDetailsField].forEach((field) => {
            field.classList.remove("is-invalid");
            field.removeAttribute("aria-invalid");
        });

        businessNameError.textContent = "";
        phoneError.textContent = "";
        emailError.textContent = "";

        const eventDetailsError = document.getElementById("event-details-error");
        if (eventDetailsError) {
            eventDetailsError.textContent = "";
        }
    }

    function showFieldError(field, errorElement, message) {
        field.classList.add("is-invalid");
        field.setAttribute("aria-invalid", "true");
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    function showFormAnnouncement(message, isSuccess) {
        formAnnouncements.textContent = message;
        formAnnouncements.classList.remove("d-none", "alert-success", "alert-danger");
        formAnnouncements.classList.add(isSuccess ? "alert-success" : "alert-danger");
        formAnnouncements.focus();
    }

    function validateForm() {
        clearErrors();

        let isValid = true;
        let firstInvalidField = null;

        const businessValue = businessName.value.trim();
        const phoneValue = phoneNumber.value.trim();
        const emailValue = emailAddress.value.trim();
        const eventDetailsValue = eventDetailsField.value.trim();

        const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (businessValue === "") {
            showFieldError(businessName, businessNameError, "Please enter your business name.");
            isValid = false;
            firstInvalidField ??= businessName;
        }

        if (phoneValue === "") {
            showFieldError(phoneNumber, phoneError, "Please enter your phone number.");
            isValid = false;
            firstInvalidField ??= phoneNumber;
        } else if (!phonePattern.test(phoneValue)) {
            showFieldError(phoneNumber, phoneError, "Enter the phone number in this format: 613-123-1234.");
            isValid = false;
            firstInvalidField ??= phoneNumber;
        }

        if (emailValue === "") {
            showFieldError(emailAddress, emailError, "Email is required.");
            isValid = false;
            firstInvalidField ??= emailAddress;
        } else if (!emailPattern.test(emailValue)) {
            showFieldError(emailAddress, emailError, "Please enter a valid email address.");
            isValid = false;
            firstInvalidField ??= emailAddress;
        }

        if (speakerCheckbox.checked && eventDetailsValue === "") {
            let eventDetailsError = document.getElementById("event-details-error");
            if (!eventDetailsError) {
                eventDetailsError = document.createElement("div");
                eventDetailsError.id = "event-details-error";
                eventDetailsError.className = "invalid-feedback";
                eventDetailsError.setAttribute("aria-live", "polite");
                eventDetailsField.insertAdjacentElement("afterend", eventDetailsError);
                eventDetailsField.setAttribute("aria-describedby", "event-details-error");
            }

            showFieldError(eventDetailsField, eventDetailsError, "Please tell us about your event.");
            isValid = false;
            firstInvalidField ??= eventDetailsField;
        }

        return { isValid, firstInvalidField };
    }

    function handleFormSubmit(event) {
        event.preventDefault();

        const { isValid, firstInvalidField } = validateForm();

        if (!isValid) {
            showFormAnnouncement(
                "There are errors in the form. Please review the highlighted fields.",
                false
            );
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
            return;
        }

        const emailUpdatesEnabled = emailUpdatesSwitch.getAttribute("aria-checked") === "true";

        showFormAnnouncement(
            emailUpdatesEnabled
                ? "Thank you. Your call request has been submitted, and you are signed up for email updates."
                : "Thank you. Your call request has been submitted.",
            true
        );

        form.reset();
        emailUpdatesSwitch.setAttribute("aria-checked", "false");
        if (switchImg) {
            switchImg.src = "images/switch-off.png";
            switchImg.alt = "Email updates switch is off";
        }
        syncEventDetailsVisibility(false);
        clearErrors();
    }

    document.addEventListener("click", (event) => {
        handleNavActivation(event);

        if (event.target === openModalBtn) {
            openModal();
            return;
        }

        if (
            event.target === closeModalBtn ||
            event.target === closeModalFooterBtn ||
            event.target === modal
        ) {
            closeModal();
            return;
        }

        if (event.target === emailUpdatesSwitch) {
            toggleSwitch();
        }
    });

    window.addEventListener("popstate", () => {
        showView(getCurrentHash(), { updateHistory: false, moveFocus: true });
    });

    document.addEventListener("keydown", handleGlobalKeydown);

    speakerCheckbox.addEventListener("change", () => {
        syncEventDetailsVisibility(true);
    });

    formAnnouncements.setAttribute("tabindex", "-1");
    form.addEventListener("submit", handleFormSubmit);

    // Initial state setup
    syncEventDetailsVisibility(false);
    showView(getCurrentHash(), { updateHistory: false, moveFocus: false });
}

knowledgeRunner();