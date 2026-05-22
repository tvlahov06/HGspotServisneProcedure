// ===== UČITAVANJE BAZE PODATAKA IZ JSON-a =====
let brandDatabase = [];

async function loadBrandDatabase() {
    try {
        const response = await fetch('brandDatabase.json');
        if (!response.ok) throw new Error('Nije moguće učitati bazu podataka');
        brandDatabase = await response.json();
        console.log(`✅ Učitano ${brandDatabase.length} brandova`);
    } catch (error) {
        console.error('❌ Greška pri učitavanju baze:', error);
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <div class="no-results">
                    <h3>Greška pri učitavanju podataka</h3>
                    <p>Molimo osvježite stranicu ili pokušajte kasnije.</p>
                </div>
            `;
            resultsDiv.classList.add('show');
        }
    }
}

loadBrandDatabase();

// ===== FORMAT KONTAKT =====
function formatContact(contact) {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    return contact.replace(emailRegex, function(email) {
        return `<a href="mailto:${email}" class="email-link">${email}</a>`;
    });
}

// ===== SEARCH =====
const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');

searchInput.addEventListener('input', function() {
    const searchTerm = this.value.trim().toLowerCase();

    if (searchTerm === '') {
        resultsDiv.classList.remove('show');
        resultsDiv.innerHTML = '';
        return;
    }

    const matches = brandDatabase.filter(item =>
        item.brand.toLowerCase().includes(searchTerm)
    );

    displayResults(matches);
});

// ===== PRIKAZ REZULTATA =====
function displayResults(matches) {
    if (matches.length === 0) {
        resultsDiv.innerHTML = `
            <div class="no-results">
                <h3>Nema rezultata</h3>
                <p>Nismo pronašli brand koji ste tražili. Pokušajte s drugim nazivom.</p>
            </div>
        `;
        resultsDiv.classList.add('show');
        return;
    }

    let html = '';
    matches.forEach(item => {
        html += `<div class="result-card">
            <div class="brand-name">${item.brand}</div>`;

        if (item.servisi && item.servisi.length > 0) {
            item.servisi.forEach((servis, index) => {
                if (index > 0) html += `<hr style="margin: 20px 0; border: 1px solid #e0e0e0;">`;
                html += `
                    <div class="info-row">
                        <div class="info-label"><span class="icon">🏢</span> Servis:</div>
                        <div class="info-value">${servis.service}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label"><span class="icon">📍</span> Adresa:</div>
                        <div class="info-value">${servis.address}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label"><span class="icon">✉️</span> Kontakt:</div>
                        <div class="info-value">${formatContact(servis.kontakt)}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label"><span class="icon">💬</span> Napomena:</div>
                        <div class="info-value">${servis.napomena}</div>
                    </div>`;
            });
        }

        if (item.documents && item.documents.length > 0) {
            html += `<div class="info-row">
                <div class="info-label"><span class="icon">📄</span> Dokumenti:</div>
                <div class="info-value">`;
            item.documents.forEach(doc => {
                html += `<a href="${doc.url}" class="download-btn" download="${doc.name}">📥 ${doc.name}</a>`;
            });
            html += `</div></div>`;
        }

        if (item.website) {
            html += `<div class="info-row">
                <div class="info-label"><span class="icon">🔗</span> Link:</div>
                <div class="info-value"><a href="${item.website}" target="_blank" class="web-link">${item.website}</a></div>
            </div>`;
        }

        html += `</div>`;
    });

    resultsDiv.innerHTML = html;
    resultsDiv.classList.add('show');
}

// ===== FOCUS =====
window.addEventListener('load', () => searchInput.focus());

// ===== SERVICE WORKER =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('✅ Service Worker registriran'))
            .catch(err => console.log('❌ Service Worker greška:', err));
    });
}
