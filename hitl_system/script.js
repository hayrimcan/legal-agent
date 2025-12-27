const appState = {
    requirements: [], // { id, text, status, response, timestamp }
    isAdminVisible: false
};

const translations = {
    en: {
        title: "HITL System",
        adminAccess: "Admin Access",
        hideAdmin: "Hide Admin",
        submitRequirement: "Submit Requirement",
        submitDesc: "Describe your needs and our team will review it.",
        placeholder: "e.g., I need a legal contract for a freelance web developer...",
        submitBtn: "Submit Request",
        adminDashboard: "Admin Dashboard",
        adminDesc: "Review pending requirements.",
        noPending: "No pending requirements.",
        yourResults: "Your Results",
        resultsDesc: "Approved and processed requirements.",
        noResults: "No results yet. Submit a request to get started.",
        submitted: "Requirement submitted successfully!",
        provideResponse: "Please provide a response before approving.",
        approved: "Requirement {id} approved.",
        rejected: "Requirement {id} rejected.",
        statusPending: "Pending",
        approveSend: "Approve & Send",
        reject: "Reject",
        statusApproved: "Approved",
        request: "Request:",
        response: "Response:",
        responsePlaceholder: "Type your response here..."
    },
    tr: {
        title: "HITL Sistemi",
        adminAccess: "Yönetici Erişimi",
        hideAdmin: "Yöneticiyi Gizle",
        submitRequirement: "Gereksinim Gönder",
        submitDesc: "İhtiyaçlarınızı açıklayın, ekibimiz inceleyecek.",
        placeholder: "örneğin, serbest web geliştirici için yasal sözleşmeye ihtiyacım var...",
        submitBtn: "İsteği Gönder",
        adminDashboard: "Yönetici Paneli",
        adminDesc: "Bekleyen gereksinimleri inceleyin.",
        noPending: "Bekleyen gereksinim yok.",
        yourResults: "Sonuçlarınız",
        resultsDesc: "Onaylanmış ve işlenmiş gereksinimler.",
        noResults: "Henüz sonuç yok. Başlamak için bir istek gönderin.",
        submitted: "Gereksinim başarıyla gönderildi!",
        provideResponse: "Onaylamadan önce lütfen bir yanıt sağlayın.",
        approved: "Gereksinim {id} onaylandı.",
        rejected: "Gereksinim {id} reddedildi.",
        statusPending: "Bekliyor",
        approveSend: "Onayla ve Gönder",
        reject: "Reddet",
        statusApproved: "Onaylandı",
        request: "İstek:",
        response: "Yanıt:",
        responsePlaceholder: "Yanıtınızı buraya yazın..."
    }
};

let currentLang = 'en';

// DOM Elements
const userSection = document.getElementById('user-section');
const adminSection = document.getElementById('admin-section');
const resultSection = document.getElementById('result-section');
const adminToggleBtn = document.getElementById('admin-toggle');
const requirementForm = document.getElementById('requirement-form');
const requirementInput = document.getElementById('requirement-input');
const adminList = document.getElementById('admin-list');
const resultList = document.getElementById('result-list');
const languageSelect = document.getElementById('language-select');

// --- Event Listeners ---

// Language Select
languageSelect.addEventListener('change', (e) => {
    setLanguage(e.target.value);
});

// Toggle Admin View
adminToggleBtn.addEventListener('click', () => {
    appState.isAdminVisible = !appState.isAdminVisible;
    if (appState.isAdminVisible) {
        adminSection.classList.remove('hidden');
        adminToggleBtn.textContent = translations[currentLang].hideAdmin;
        renderAdminList();
    } else {
        adminSection.classList.add('hidden');
        adminToggleBtn.textContent = translations[currentLang].adminAccess;
    }
});

// Submit Requirement
requirementForm.addEventListener('click', (e) => {
    // Prevent default form submission if it was a form submit event, 
    // but here we are listening to click on the form usually triggers on button click if type=submit
    // Better to listen to 'submit' on form
});

requirementForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = requirementInput.value.trim();
    if (!text) return;

    const newReq = {
        id: generateId(),
        text: text,
        status: 'pending',
        response: null,
        timestamp: new Date()
    };

    appState.requirements.push(newReq);
    requirementInput.value = '';

    showToast(translations[currentLang].submitted);

    // Refresh views
    renderAdminList();
    // In a real app, user might see a "pending" list too, but strictly per requirements:
    // "Final Display: A section that shows the final answer to the user only after approval."
    // So we won't show pending items in the result list based on the prompt interpretation,
    // but we could if we wanted to be friendlier. Sticking to prompt: "only after approval".
    renderResultList();
});

// --- Logic functions ---

function generateId() {
    return 'REQ-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
}

function approveRequirement(id) {
    const inputId = `resp-${id}`;
    const responseText = document.getElementById(inputId).value.trim();

    if (!responseText) {
        alert(translations[currentLang].provideResponse);
        return;
    }

    const req = appState.requirements.find(r => r.id === id);
    if (req) {
        req.status = 'approved';
        req.response = responseText;
        renderAdminList();
        renderResultList();
        showToast(translations[currentLang].approved.replace('{id}', id));
    }
}

function rejectRequirement(id) {
    const req = appState.requirements.find(r => r.id === id);
    if (req) {
        req.status = 'rejected';
        renderAdminList();
        renderResultList();
        showToast(translations[currentLang].rejected.replace('{id}', id));
    }
}

// --- Rendering ---

function setLanguage(lang) {
    currentLang = lang;
    document.querySelector('.logo h1').textContent = translations[lang].title;
    document.getElementById('admin-toggle').textContent = appState.isAdminVisible ? translations[lang].hideAdmin : translations[lang].adminAccess;
    document.querySelector('#user-section .card-header h2').textContent = translations[lang].submitRequirement;
    document.querySelector('#user-section .card-header p').textContent = translations[lang].submitDesc;
    document.getElementById('requirement-input').placeholder = translations[lang].placeholder;
    document.querySelector('#requirement-form button').textContent = translations[lang].submitBtn;
    document.querySelector('#admin-section .card-header h2').textContent = translations[lang].adminDashboard;
    document.querySelector('#admin-section .card-header p').textContent = translations[lang].adminDesc;
    document.querySelector('#result-section .card-header h2').textContent = translations[lang].yourResults;
    document.querySelector('#result-section .card-header p').textContent = translations[lang].resultsDesc;
    renderAdminList();
    renderResultList();
}

function renderAdminList() {
    adminList.innerHTML = '';
    const pending = appState.requirements.filter(r => r.status === 'pending');

    if (pending.length === 0) {
        adminList.innerHTML = '<p class="empty-state">' + translations[currentLang].noPending + '</p>';
        return;
    }

    pending.forEach(req => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="item-header">
                <span class="item-id">${req.id}</span>
                <span class="status-badge status-pending">${translations[currentLang].statusPending}</span>
            </div>
            <div class="item-body">${escapeHtml(req.text)}</div>
            <div class="admin-actions-area">
                <textarea id="resp-${req.id}" class="admin-response-input" placeholder="${translations[currentLang].responsePlaceholder}"></textarea>
                <div class="item-actions">
                    <button onclick="approveRequirement('${req.id}')" class="action-btn approve-btn">${translations[currentLang].approveSend}</button>
                    <button onclick="rejectRequirement('${req.id}')" class="action-btn reject-btn">${translations[currentLang].reject}</button>
                </div>
            </div>
        `;
        adminList.appendChild(item);
    });
}

function renderResultList() {
    resultList.innerHTML = '';
    const approved = appState.requirements.filter(r => r.status === 'approved');

    if (approved.length === 0) {
        resultList.innerHTML = '<p class="empty-state">' + translations[currentLang].noResults + '</p>';
        return;
    }

    approved.forEach(req => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="item-header">
                <span class="item-id">${req.id}</span>
                <span class="status-badge status-approved">${translations[currentLang].statusApproved}</span>
            </div>
            <div class="item-body">
                <strong>${translations[currentLang].request}</strong> ${escapeHtml(req.text)}
            </div>
            <div class="item-response">
                <strong>${translations[currentLang].response}</strong><br>
                ${escapeHtml(req.response)}
            </div>
        `;
        resultList.appendChild(item);
    });
}

// Utility
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--accent-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease-out;
        z-index: 1000;
        font-weight: 500;
    `;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initial render
setLanguage('en');
renderAdminList();
renderResultList();
