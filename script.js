// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===== Stat rings: animate count + ring fill when scrolled into view =====
const statRings = document.querySelectorAll('.stat-ring');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const ring = entry.target;
    ring.classList.add('in-view');
    const numEl = ring.querySelector('.stat-num');
    const target = parseInt(numEl.dataset.count, 10);
    animateCount(numEl, target);
    statObserver.unobserve(ring);
  });
}, { threshold: 0.4 });
statRings.forEach(ring => statObserver.observe(ring));

function animateCount(el, target){
  const duration = 1400;
  const start = performance.now();
  function tick(now){
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ===== Donation amount selection =====
const amountButtons = document.querySelectorAll('.amount-btn');
const customRow = document.getElementById('customAmountRow');
const customInput = document.getElementById('customAmountInput');
const customBtn = document.getElementById('customAmountBtn');
const donateSubmit = document.getElementById('donateSubmit');
 
let selectedAmount = 500;
 
amountButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    amountButtons.forEach(b => b.classList.remove('is-selected'));
    btn.classList.add('is-selected');
 
    if (btn === customBtn) {
      customRow.hidden = false;
      customInput.focus();
      selectedAmount = parseInt(customInput.value, 10) || 0;
    } else {
      customRow.hidden = true;
      selectedAmount = parseInt(btn.dataset.amount, 10);
    }
    updateUpiPanel(selectedAmount);
    updateRazorpayPanel(selectedAmount);
  });
});
 
customInput.addEventListener('input', () => {
  selectedAmount = parseInt(customInput.value, 10) || 0;
  updateUpiPanel(selectedAmount);
  updateRazorpayPanel(selectedAmount);
});
 
// ===== UPI donation setup =====
// Replace this with your real UPI ID (e.g. 'yourname@okaxis', 'yourname@ybl', etc.)
const UPI_ID = 'rajsridhar27@okhdfcbank';
const PAYEE_NAME = 'Unstarve';
 
document.getElementById('upiIdText').textContent = UPI_ID;
 
function buildUpiLink(amount){
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: PAYEE_NAME,
    am: amount > 0 ? String(amount) : '',
    cu: 'INR',
    tn: 'Donation to Unstarve'
  });
  return `upi://pay?${params.toString()}`;
}
 
function updateUpiPanel(amount){
  const link = buildUpiLink(amount);
  donateSubmit.href = link;
  const amt = amount > 0 ? `₹${amount.toLocaleString('en-IN')}` : '';
  donateSubmit.textContent = `Pay ${amt} via UPI app`;
 
  // QR code via a free public QR-generation API — encodes the same UPI link.
  const qrData = encodeURIComponent(link);
  document.getElementById('upiQr').src =
    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrData}`;
}
 
// ===== Copy UPI ID to clipboard =====
const upiCopyBtn = document.getElementById('upiCopyBtn');
upiCopyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(UPI_ID);
    upiCopyBtn.textContent = 'Copied!';
    upiCopyBtn.classList.add('copied');
    setTimeout(() => {
      upiCopyBtn.textContent = 'Copy';
      upiCopyBtn.classList.remove('copied');
    }, 1800);
  } catch (err) {
    alert(`Copy this UPI ID manually: ${UPI_ID}`);
  }
});
 
// Render the QR code and link right away for the default selected amount (₹500)
updateUpiPanel(selectedAmount);
 
// ===== Payment method tabs (UPI / Razorpay) =====
const tabButtons = document.querySelectorAll('.tab-btn');
const panelUpi = document.getElementById('panel-upi');
const panelRazorpay = document.getElementById('panel-razorpay');
 
tabButtons.forEach(tab => {
  tab.addEventListener('click', () => {
    tabButtons.forEach(t => {
      t.classList.remove('is-selected');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('is-selected');
    tab.setAttribute('aria-selected', 'true');
 
    const showUpi = tab.id === 'tabUpi';
    panelUpi.hidden = !showUpi;
    panelRazorpay.hidden = showUpi;
  });
});
 
// ===== Razorpay (card / netbanking) =====
// SETUP NOTES:
// 1. Sign up at https://razorpay.com and complete KYC for your registered trust/society
//    (Razorpay will not activate live payments for an unregistered individual).
// 2. Get your Key ID from the Razorpay dashboard (Settings -> API Keys).
// 3. Replace 'YOUR_RAZORPAY_KEY_ID' below with your real key.
// 4. For real donations you also need a small server endpoint to create an "order"
//    before checkout opens (Razorpay requires this for security). Their docs walk
//    through this: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
//    Until both of these are done, this button shows a demo message instead of a real checkout.
 
const RAZORPAY_KEY_ID = 'YOUR_RAZORPAY_KEY_ID';
const razorpaySubmit = document.getElementById('razorpaySubmit');
 
function updateRazorpayPanel(amount){
  const amt = amount > 0 ? `₹${amount.toLocaleString('en-IN')}` : 'via card / netbanking';
  razorpaySubmit.textContent = amount > 0 ? `Pay ${amt} via card / netbanking` : 'Pay via card / netbanking';
}
updateRazorpayPanel(selectedAmount);
 
razorpaySubmit.addEventListener('click', () => {
  if (!selectedAmount || selectedAmount <= 0) {
    alert('Please choose or enter a donation amount first.');
    return;
  }
 
  if (RAZORPAY_KEY_ID === 'YOUR_RAZORPAY_KEY_ID' || typeof Razorpay === 'undefined') {
    alert(
      `This is a demo button. Once your Razorpay key is added (see script.js), this will ` +
      `open a secure checkout for ₹${selectedAmount.toLocaleString('en-IN')}.`
    );
    return;
  }
 
  const options = {
    key: RAZORPAY_KEY_ID,
    amount: selectedAmount * 100, // Razorpay expects paise
    currency: 'INR',
    name: 'Unstarve',
    description: 'Donation — a plate, a place, every night',
    handler: function (response) {
      alert('Thank you! Payment ID: ' + response.razorpay_payment_id);
    },
    theme: { color: '#E8A33D' }
  };
 
  const rzp = new Razorpay(options);
  rzp.open();
});
