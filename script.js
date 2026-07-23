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
    updateSubmitLabel();
  });
});

customInput.addEventListener('input', () => {
  selectedAmount = parseInt(customInput.value, 10) || 0;
  updateSubmitLabel();
});

function updateSubmitLabel(){
  const amt = selectedAmount > 0 ? `₹${selectedAmount.toLocaleString('en-IN')}` : 'an amount';
  donateSubmit.textContent = `Donate ${amt} now`;
}

// ===== Donate button: Razorpay hookup =====
// SETUP NOTES:
// 1. Sign up at https://razorpay.com and complete KYC for your registered trust/society.
// 2. Get your Key ID from the Razorpay dashboard (Settings -> API Keys).
// 3. Add the Razorpay checkout script to index.html, just before this script tag:
//      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
// 4. Replace 'YOUR_RAZORPAY_KEY_ID' below with your real key.
// 5. For real donations you also need a small server endpoint to create an "order"
//    before checkout opens (Razorpay requires this for security). Their docs walk
//    through this: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
//    Until that's set up, this button will show an alert instead of opening checkout.

donateSubmit.addEventListener('click', () => {
  if (!selectedAmount || selectedAmount <= 0) {
    alert('Please choose or enter a donation amount first.');
    return;
  }

  const RAZORPAY_KEY_ID = 'YOUR_RAZORPAY_KEY_ID';

  if (RAZORPAY_KEY_ID === 'YOUR_RAZORPAY_KEY_ID' || typeof Razorpay === 'undefined') {
    alert(
      `This is a demo button. Once Razorpay is set up (see script.js), this will open ` +
      `a secure checkout for ₹${selectedAmount.toLocaleString('en-IN')}.`
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
