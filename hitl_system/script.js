const appState = {
    requirements: [], // { id, text, status, response, timestamp }
    isAdminVisible: false
};

// DOM Elements
const userSection = document.getElementById('user-section');
const adminSection = document.getElementById('admin-section');
const resultSection = document.getElementById('result-section');
const adminToggleBtn = document.getElementById('admin-toggle');
const requirementForm = document.getElementById('requirement-form');
const requirementInput = document.getElementById('requirement-input');
const adminList = document.getElementById('admin-list');
const resultList = document.getElementById('result-list');

// --- Event Listeners ---

// Toggle Admin View
adminToggleBtn.addEventListener('click', () => {
    appState.isAdminVisible = !appState.isAdminVisible;
    if (appState.isAdminVisible) {
        adminSection.classList.remove('hidden');
        adminToggleBtn.textContent = 'Hide Admin';
        renderAdminList();
    } else {
        adminSection.classList.add('hidden');
        adminToggleBtn.textContent = 'Admin Access';
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

    showToast('Requirement submitted successfully!');

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
        alert("Please provide a response before approving.");
        return;
    }

    const req = appState.requirements.find(r => r.id === id);
    if (req) {
        req.status = 'approved';
        req.response = responseText;
        renderAdminList();
        renderResultList();
        showToast(`Requirement ${id} approved.`);
    }
}

function rejectRequirement(id) {
    const req = appState.requirements.find(r => r.id === id);
    if (req) {
        req.status = 'rejected';
        renderAdminList();
        renderResultList();
        showToast(`Requirement ${id} rejected.`);
    }
}

// --- Rendering ---

function renderAdminList() {
    adminList.innerHTML = '';
    const pending = appState.requirements.filter(r => r.status === 'pending');

    if (pending.length === 0) {
        adminList.innerHTML = '<p class="empty-state">No pending requirements.</p>';
        return;
    }

    pending.forEach(req => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="item-header">
                <span class="item-id">${req.id}</span>
                <span class="status-badge status-pending">Pending</span>
            </div>
            <div class="item-body">${escapeHtml(req.text)}</div>
            <div class="admin-actions-area">
                <textarea id="resp-${req.id}" class="admin-response-input" placeholder="Type your response here..."></textarea>
                <div class="item-actions">
                    <button onclick="approveRequirement('${req.id}')" class="action-btn approve-btn">Approve & Send</button>
                    <button onclick="rejectRequirement('${req.id}')" class="action-btn reject-btn">Reject</button>
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
        resultList.innerHTML = '<p class="empty-state">No approved results yet.</p>';
        return;
    }

    approved.forEach(req => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="item-header">
                <span class="item-id">${req.id}</span>
                <span class="status-badge status-approved">Approved</span>
            </div>
            <div class="item-body">
                <strong>Request:</strong> ${escapeHtml(req.text)}
            </div>
            <div class="item-response">
                <strong>Response:</strong><br>
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
renderAdminList();
renderResultList();
