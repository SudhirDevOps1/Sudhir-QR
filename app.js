/*
 * Sudhir QR - Smart QR Code Generator & Scanner
 * Main JavaScript Application
 * Author: SudhirDevOps1
 * Version: 2.0.0
 * © 2026 All Rights Reserved
 */

// ===== Global Variables =====
let currentQRType = 'url';
let currentQRData = '';
let qrHistory = JSON.parse(localStorage.getItem('qrHistory')) || [];
let html5QrCode = null;

// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initNavigation();
    initQRTypeSelection();
    initSizeSlider();
    initHistory();
    initScanner();
});

// ===== Theme Management =====
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        updateThemeIcon();
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    if (icon) {
        if (document.body.classList.contains('dark')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
}

// ===== Mobile Menu =====
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-overlay');
    
    if (menu) {
        menu.classList.toggle('open');
    }
    if (overlay) {
        overlay.classList.toggle('open');
    }
}

// ===== Navigation =====
function initNavigation() {
    // Handle clicks outside mobile menu
    const overlay = document.getElementById('mobile-overlay');
    if (overlay) {
        overlay.addEventListener('click', toggleMobileMenu);
    }
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    // Show target section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    // Update nav links
    document.querySelectorAll('.navbar-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        }
    });
    
    // Close mobile menu if open
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && mobileMenu.classList.contains('open')) {
        toggleMobileMenu();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== QR Type Selection =====
function initQRTypeSelection() {
    selectQRType('url');
}

function selectQRType(type) {
    currentQRType = type;
    
    // Update buttons
    document.querySelectorAll('.qr-type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });
    
    // Show corresponding form
    document.querySelectorAll('.qr-form').forEach(form => form.classList.add('hidden'));
    const form = document.getElementById(`form-${type}`);
    if (form) {
        form.classList.remove('hidden');
    }
}

// ===== Size Slider =====
function initSizeSlider() {
    const sizeSlider = document.getElementById('qr-size');
    if (sizeSlider) {
        sizeSlider.addEventListener('input', function() {
            const sizeValue = document.getElementById('size-value');
            if (sizeValue) {
                sizeValue.textContent = this.value;
            }
        });
    }
}

// ===== Password Toggle =====
function togglePassword() {
    const input = document.getElementById('input-password');
    const icon = document.getElementById('password-toggle-icon');
    
    if (input && icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

// ===== Validation Functions =====
function isValidURL(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    const cleaned = phone.replace(/\s/g, '').replace(/[^0-9+]/g, '');
    return cleaned.length >= 10;
}

function isValidUPI(upi) {
    return /^[\w.-]+@[\w]+$/.test(upi);
}

function isValidCoordinates(lat, lng) {
    return !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
}

// ===== Generate QR Code =====
function generateQR() {
    let data = '';
    let isValid = true;
    let errorMessage = '';
    
    // Get data based on type
    switch (currentQRType) {
        case 'url':
            data = document.getElementById('input-url').value.trim();
            if (!data) {
                isValid = false;
                errorMessage = 'Please enter a valid URL';
            } else if (!isValidURL(data)) {
                isValid = false;
                errorMessage = 'Invalid URL format. Include http:// or https://';
            }
            break;
            
        case 'whatsapp':
            const waPhone = document.getElementById('input-whatsapp').value.replace(/\s/g, '').replace(/[^0-9+]/g, '');
            const waMsg = document.getElementById('input-whatsapp-msg').value;
            if (!isValidPhone(waPhone)) {
                isValid = false;
                errorMessage = 'Please enter a valid WhatsApp number with country code';
            } else {
                const cleanPhone = waPhone.replace('+', '');
                data = `https://wa.me/${cleanPhone}${waMsg ? '?text=' + encodeURIComponent(waMsg) : ''}`;
            }
            break;
            
        case 'sms':
            const smsPhone = document.getElementById('input-sms-phone').value.replace(/\s/g, '');
            const smsMsg = document.getElementById('input-sms-msg').value;
            if (!isValidPhone(smsPhone)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            } else {
                data = `sms:${smsPhone}${smsMsg ? '?body=' + encodeURIComponent(smsMsg) : ''}`;
            }
            break;
            
        case 'email':
            const email = document.getElementById('input-email').value.trim();
            const subject = document.getElementById('input-email-subject').value;
            const body = document.getElementById('input-email-body').value;
            if (!email || !isValidEmail(email)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            } else {
                data = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }
            break;
            
        case 'text':
            data = document.getElementById('input-text').value.trim();
            if (!data) {
                isValid = false;
                errorMessage = 'Please enter some text';
            }
            break;
            
        case 'credentials':
            const username = document.getElementById('input-username').value.trim();
            const password = document.getElementById('input-password').value;
            if (!username || !password) {
                isValid = false;
                errorMessage = 'Please enter both username and password';
            } else {
                data = `Username: ${username}\nPassword: ${password}`;
            }
            break;
            
        case 'applink':
            data = document.getElementById('input-applink').value.trim();
            if (!data) {
                isValid = false;
                errorMessage = 'Please enter an app store link';
            } else if (!isValidURL(data)) {
                isValid = false;
                errorMessage = 'Please enter a valid app store URL';
            }
            break;
            
        case 'upi':
            const upiId = document.getElementById('input-upi-id').value.trim();
            const upiName = document.getElementById('input-upi-name').value.trim();
            const upiAmount = document.getElementById('input-upi-amount').value.trim();
            const upiNote = document.getElementById('input-upi-note').value.trim();
            
            if (!upiId) {
                isValid = false;
                errorMessage = 'Please enter UPI ID';
            } else if (!isValidUPI(upiId)) {
                isValid = false;
                errorMessage = 'Invalid UPI ID format (e.g., name@upi)';
            } else {
                data = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName || 'User')}`;
                if (upiAmount) data += `&am=${upiAmount}`;
                if (upiNote) data += `&tn=${encodeURIComponent(upiNote)}`;
                data += '&cu=INR';
            }
            break;
            
        case 'location':
            const lat = parseFloat(document.getElementById('input-lat').value);
            const lng = parseFloat(document.getElementById('input-lng').value);
            const locName = document.getElementById('input-loc-name').value.trim();
            
            if (!isValidCoordinates(lat, lng)) {
                isValid = false;
                errorMessage = 'Please enter valid coordinates (-90 to 90 for lat, -180 to 180 for lng)';
            } else {
                data = `geo:${lat},${lng}`;
                if (locName) data += `?q=${encodeURIComponent(locName)}`;
            }
            break;
            
        case 'wifi':
            const ssid = document.getElementById('input-wifi-ssid').value.trim();
            const wifiPass = document.getElementById('input-wifi-pass').value;
            const wifiType = document.getElementById('input-wifi-type').value;
            const hidden = document.getElementById('input-wifi-hidden').checked;
            
            if (!ssid) {
                isValid = false;
                errorMessage = 'Please enter WiFi network name (SSID)';
            } else {
                data = `WIFI:T:${wifiType};S:${ssid};`;
                if (wifiPass) data += `P:${wifiPass};`;
                if (hidden) data += 'H:true;';
                data += ';';
            }
            break;
            
        case 'vcard':
            const vcardName = document.getElementById('input-vcard-name').value.trim();
            const vcardPhone = document.getElementById('input-vcard-phone').value.trim();
            const vcardEmail = document.getElementById('input-vcard-email').value.trim();
            const vcardOrg = document.getElementById('input-vcard-org').value.trim();
            const vcardTitle = document.getElementById('input-vcard-title').value.trim();
            const vcardUrl = document.getElementById('input-vcard-url').value.trim();
            
            if (!vcardName) {
                isValid = false;
                errorMessage = 'Please enter contact name';
            } else {
                data = 'BEGIN:VCARD\nVERSION:3.0\n';
                data += `N:${vcardName}\n`;
                data += `FN:${vcardName}\n`;
                if (vcardPhone) data += `TEL:${vcardPhone}\n`;
                if (vcardEmail) data += `EMAIL:${vcardEmail}\n`;
                if (vcardOrg) data += `ORG:${vcardOrg}\n`;
                if (vcardTitle) data += `TITLE:${vcardTitle}\n`;
                if (vcardUrl) data += `URL:${vcardUrl}\n`;
                data += 'END:VCARD';
            }
            break;
            
        case 'event':
            const eventTitle = document.getElementById('input-event-title').value.trim();
            const eventStart = document.getElementById('input-event-start').value;
            const eventEnd = document.getElementById('input-event-end').value;
            const eventLoc = document.getElementById('input-event-location').value.trim();
            const eventDesc = document.getElementById('input-event-desc').value.trim();
            
            if (!eventTitle || !eventStart) {
                isValid = false;
                errorMessage = 'Please enter event title and start date/time';
            } else {
                const startDate = new Date(eventStart).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                let endDate = startDate;
                if (eventEnd) {
                    endDate = new Date(eventEnd).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                }
                
                data = 'BEGIN:VEVENT\n';
                data += `SUMMARY:${eventTitle}\n`;
                data += `DTSTART:${startDate}\n`;
                data += `DTEND:${endDate}\n`;
                if (eventLoc) data += `LOCATION:${eventLoc}\n`;
                if (eventDesc) data += `DESCRIPTION:${eventDesc}\n`;
                data += 'END:VEVENT';
            }
            break;
            
        case 'phone':
            const phoneNum = document.getElementById('input-phone').value.replace(/\s/g, '');
            if (!isValidPhone(phoneNum)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            } else {
                data = `tel:${phoneNum}`;
            }
            break;
            
        case 'custom':
            data = document.getElementById('input-custom').value.trim();
            if (!data) {
                isValid = false;
                errorMessage = 'Please enter custom data';
            }
            break;
    }
    
    // Display result
    displayQRResult(data, isValid, errorMessage);
}

function displayQRResult(data, isValid, errorMessage) {
    const qrContainer = document.getElementById('qr-result');
    const size = parseInt(document.getElementById('qr-size').value);
    const color = document.getElementById('qr-color').value;
    const bgColor = document.getElementById('qr-bg-color').value;
    const errorLevel = document.getElementById('qr-error').value;
    
    if (!isValid) {
        // Show error
        qrContainer.innerHTML = `
            <div class="text-center p-4">
                <div class="w-48 h-48 mx-auto bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                    <div class="text-center">
                        <i class="fas fa-times-circle text-4xl text-red-500 mb-2"></i>
                        <p class="text-red-600 dark:text-red-300 font-semibold text-sm">NOT VALID DATA</p>
                        <p class="text-red-500 text-xs mt-1">${errorMessage}</p>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('qr-actions').classList.add('hidden');
        document.getElementById('qr-data-display').classList.add('hidden');
        document.getElementById('scan-guide').classList.add('hidden');
        showToast('❌ ' + errorMessage, 'error');
        return;
    }
    
    // Create QR Code
    try {
        const typeNumber = 0;
        const errorCorrectionLevel = errorLevel;
        const qr = qrcode(typeNumber, errorCorrectionLevel);
        qr.addData(data);
        qr.make();
        
        // Create canvas
        const moduleCount = qr.getModuleCount();
        const cellSize = Math.floor(size / moduleCount);
        const actualSize = cellSize * moduleCount;
        
        const canvas = document.createElement('canvas');
        canvas.width = actualSize;
        canvas.height = actualSize;
        canvas.id = 'qr-canvas';
        const ctx = canvas.getContext('2d');
        
        // Draw background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, actualSize, actualSize);
        
        // Draw QR modules
        ctx.fillStyle = color;
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr.isDark(row, col)) {
                    ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                }
            }
        }
        
        qrContainer.innerHTML = '';
        qrContainer.appendChild(canvas);
        canvas.style.borderRadius = '10px';
        
        currentQRData = data;
        document.getElementById('encoded-data').textContent = data;
        document.getElementById('qr-data-display').classList.remove('hidden');
        document.getElementById('qr-actions').classList.remove('hidden');
        document.getElementById('scan-guide').classList.remove('hidden');
        
        showToast('✅ QR Code generated successfully!', 'success');
    } catch (e) {
        qrContainer.innerHTML = `
            <div class="text-center text-red-500">
                <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
                <p>Error generating QR code</p>
                <p class="text-sm">${e.message}</p>
            </div>
        `;
        showToast('❌ Error generating QR code', 'error');
    }
}

// ===== Download QR =====
function downloadQR(format) {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) {
        showToast('❌ No QR code to download', 'error');
        return;
    }
    
    const timestamp = new Date().toISOString().slice(0, 10);
    
    if (format === 'png') {
        const link = document.createElement('a');
        link.download = `sudhir-qr-${timestamp}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('✅ PNG downloaded!', 'success');
    } else if (format === 'svg') {
        const size = canvas.width;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, size, size);
        const bgColor = document.getElementById('qr-bg-color').value;
        const color = document.getElementById('qr-color').value;
        
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">`;
        svg += `<rect width="100%" height="100%" fill="${bgColor}"/>`;
        
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const i = (y * size + x) * 4;
                if (imageData.data[i] < 128) {
                    svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`;
                }
            }
        }
        svg += '</svg>';
        
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.download = `sudhir-qr-${timestamp}.svg`;
        link.href = URL.createObjectURL(blob);
        link.click();
        showToast('✅ SVG downloaded!', 'success');
    }
}

// ===== Copy Data =====
function copyData() {
    if (!currentQRData) {
        showToast('❌ No data to copy', 'error');
        return;
    }
    navigator.clipboard.writeText(currentQRData).then(() => {
        showToast('✅ Data copied to clipboard!', 'success');
    });
}

// ===== History Functions =====
function initHistory() {
    renderHistory();
}

function addToHistory() {
    if (!currentQRData) {
        showToast('❌ No QR code to save', 'error');
        return;
    }
    
    const canvas = document.getElementById('qr-canvas');
    const historyItem = {
        id: Date.now(),
        type: currentQRType,
        data: currentQRData,
        image: canvas.toDataURL('image/png'),
        date: new Date().toLocaleDateString()
    };
    
    qrHistory.unshift(historyItem);
    if (qrHistory.length > 10) qrHistory.pop();
    localStorage.setItem('qrHistory', JSON.stringify(qrHistory));
    renderHistory();
    showToast('✅ Saved to history!', 'success');
}

function renderHistory() {
    const container = document.getElementById('history-list');
    if (!container) return;
    
    if (qrHistory.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-4">No history yet</p>';
        return;
    }
    
    container.innerHTML = qrHistory.map(item => `
        <div class="history-item" onclick="loadFromHistory('${item.id}')">
            <img src="${item.image}" alt="QR" class="w-12 h-12 rounded">
            <div class="history-item-info">
                <p class="history-item-type">${item.type}</p>
                <p class="history-item-data">${item.data.substring(0, 30)}...</p>
            </div>
            <span class="history-item-date">${item.date}</span>
        </div>
    `).join('');
}

function loadFromHistory(id) {
    const item = qrHistory.find(h => h.id == id);
    if (!item) return;
    
    currentQRType = item.type;
    currentQRData = item.data;
    
    const qrContainer = document.getElementById('qr-result');
    qrContainer.innerHTML = `<img src="${item.image}" alt="QR Code" class="rounded-xl" id="qr-canvas-img">`;
    
    document.getElementById('encoded-data').textContent = item.data;
    document.getElementById('qr-data-display').classList.remove('hidden');
    document.getElementById('qr-actions').classList.remove('hidden');
    document.getElementById('scan-guide').classList.remove('hidden');
    
    showToast('✅ Loaded from history!', 'success');
}

function clearHistory() {
    qrHistory = [];
    localStorage.removeItem('qrHistory');
    renderHistory();
    showToast('✅ History cleared!', 'success');
}

// ===== Clear Form =====
function clearForm() {
    document.querySelectorAll('input[type="text"], input[type="url"], input[type="email"], input[type="tel"], input[type="number"], input[type="password"], input[type="datetime-local"], textarea').forEach(el => {
        el.value = '';
    });
    document.querySelectorAll('input[type="checkbox"]').forEach(el => {
        el.checked = false;
    });
    
    const qrContainer = document.getElementById('qr-result');
    qrContainer.innerHTML = `
        <div class="qr-placeholder">
            <i class="fas fa-qrcode"></i>
            <p>Your QR code will appear here</p>
        </div>
    `;
    document.getElementById('qr-actions').classList.add('hidden');
    document.getElementById('qr-data-display').classList.add('hidden');
    document.getElementById('scan-guide').classList.add('hidden');
    currentQRData = '';
    showToast('✅ Form cleared!', 'success');
}

// ===== Scanner Functions =====
function initScanner() {
    // Create hidden element for file scanning
    if (!document.getElementById('reader-file')) {
        document.body.insertAdjacentHTML('beforeend', '<div id="reader-file" style="display:none;"></div>');
    }
}

function startCameraScan() {
    const cameraContainer = document.getElementById('camera-container');
    const dropZone = document.getElementById('drop-zone');
    const scanResult = document.getElementById('scan-result');
    
    if (cameraContainer) cameraContainer.classList.remove('hidden');
    if (dropZone) dropZone.classList.add('hidden');
    if (scanResult) scanResult.classList.add('hidden');
    
    html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        onScanFailure
    ).catch(err => {
        showToast('❌ Camera access denied or not available', 'error');
        stopCameraScan();
    });
}

function stopCameraScan() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            const cameraContainer = document.getElementById('camera-container');
            const dropZone = document.getElementById('drop-zone');
            if (cameraContainer) cameraContainer.classList.add('hidden');
            if (dropZone) dropZone.classList.remove('hidden');
        }).catch(err => console.log(err));
    }
}

function onScanSuccess(decodedText, decodedResult) {
    stopCameraScan();
    displayScanResult(decodedText);
}

function onScanFailure(error) {
    // Ignore continuous scan failures
}

function scanFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const html5QrCodeScanner = new Html5Qrcode("reader-file");
    html5QrCodeScanner.scanFile(file, true)
        .then(decodedText => {
            displayScanResult(decodedText);
        })
        .catch(err => {
            showToast('❌ No QR code found in image', 'error');
        });
}

function displayScanResult(text) {
    const scanResult = document.getElementById('scan-result');
    const scanResultText = document.getElementById('scan-result-text');
    const openLinkBtn = document.getElementById('open-link-btn');
    
    if (scanResult) scanResult.classList.remove('hidden');
    if (scanResultText) scanResultText.textContent = text;
    
    if (openLinkBtn) {
        if (isValidURL(text)) {
            openLinkBtn.classList.remove('hidden');
        } else {
            openLinkBtn.classList.add('hidden');
        }
    }
    
    showToast('✅ QR Code scanned successfully!', 'success');
}

function copyScanResult() {
    const text = document.getElementById('scan-result-text').textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast('✅ Copied to clipboard!', 'success');
    });
}

function openScanResult() {
    const text = document.getElementById('scan-result-text').textContent;
    if (isValidURL(text)) {
        window.open(text, '_blank');
    }
}

// ===== Drag & Drop =====
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const html5QrCodeScanner = new Html5Qrcode("reader-file");
        html5QrCodeScanner.scanFile(file, true)
            .then(decodedText => {
                displayScanResult(decodedText);
            })
            .catch(err => {
                showToast('❌ No QR code found in image', 'error');
            });
    }
}

// ===== FAQ Toggle =====
function toggleFAQ(element) {
    element.classList.toggle('open');
}

// ===== Get Current Location =====
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showToast('❌ Geolocation not supported by browser', 'error');
        return;
    }
    
    showToast('📍 Getting your location...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            document.getElementById('input-lat').value = position.coords.latitude.toFixed(6);
            document.getElementById('input-lng').value = position.coords.longitude.toFixed(6);
            showToast('✅ Location captured!', 'success');
        },
        (error) => {
            showToast('❌ Could not get location: ' + error.message, 'error');
        }
    );
}

// ===== Toast Notification =====
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== Utility Functions =====
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Export functions for global access
window.toggleTheme = toggleTheme;
window.toggleMobileMenu = toggleMobileMenu;
window.showSection = showSection;
window.selectQRType = selectQRType;
window.togglePassword = togglePassword;
window.generateQR = generateQR;
window.downloadQR = downloadQR;
window.copyData = copyData;
window.addToHistory = addToHistory;
window.loadFromHistory = loadFromHistory;
window.clearHistory = clearHistory;
window.clearForm = clearForm;
window.startCameraScan = startCameraScan;
window.stopCameraScan = stopCameraScan;
window.scanFromFile = scanFromFile;
window.copyScanResult = copyScanResult;
window.openScanResult = openScanResult;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleDrop = handleDrop;
window.toggleFAQ = toggleFAQ;
window.getCurrentLocation = getCurrentLocation;
