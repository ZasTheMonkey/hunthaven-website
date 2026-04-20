// ── BOOKING FLOW ──────────────────────────────────────────
var _currentListing = null;
var LAUNCH_DATE = new Date('2026-07-01T00:00:00');

function isLaunched() { return new Date() >= LAUNCH_DATE; }
function daysUntilLaunch() { return Math.ceil((LAUNCH_DATE - new Date()) / (1000*60*60*24)); }

function openListingById(id) {
  var l = allListings.find(function(x){ return String(x.id) === String(id); });
  if (l) openListingDetail(l);
}

function openListingDetail(l) {
  if (!l) return;
  _currentListing = l;
  var type = getType(l);
  var isHunt = type === 'hunting';
  var color = isHunt ? 'var(--color-primary)' : 'var(--color-water)';
  var acreage = l.acreage ? l.acreage + ' acres' : '';
  var location = l.street_address || [l.county, l.state].filter(Boolean).join(', ') || 'Florida';
  var priceNum = parseInt(l.price_per_day) || 0;
  var priceLabel = priceNum ? '$' + priceNum + ' / day' : 'Contact for pricing';
  var activities = (l.activities || []).join(' \xb7 ');
  var photos = l.photo_urls && l.photo_urls.length ? l.photo_urls : [];

  var photoHtml = photos.length
    ? '<div style="display:flex;gap:.5rem;overflow-x:auto;padding-bottom:.5rem;scrollbar-width:none;-webkit-overflow-scrolling:touch">' +
      photos.map(function(u){ return '<img src="'+u+'" style="height:210px;min-width:300px;object-fit:cover;border-radius:12px;flex-shrink:0" />'; }).join('') +
      '</div>'
    : '<div style="height:180px;border-radius:12px;background:' + (isHunt ? 'linear-gradient(160deg,#2a4a30,#4a7040)' : 'linear-gradient(160deg,#0d2840,#2a90b0)') + '"></div>';

  var videoHtml = l.video_url
    ? '<div style="margin-top:.75rem"><video src="'+l.video_url+'" controls style="width:100%;border-radius:12px;max-height:220px"></video></div>'
    : '';

  var details = [];
  if (l.max_guests) details.push('<span style="padding:.3rem .7rem;background:var(--color-surface-offset);border-radius:999px;font-size:.85rem">Up to '+l.max_guests+' guests</span>');
  if (l.num_beds) details.push('<span style="padding:.3rem .7rem;background:var(--color-surface-offset);border-radius:999px;font-size:.85rem">'+l.num_beds+' bed'+(l.num_beds>1?'s':'')+'</span>');
  if (l.min_stay) details.push('<span style="padding:.3rem .7rem;background:var(--color-surface-offset);border-radius:999px;font-size:.85rem">Min '+l.min_stay+' night'+(l.min_stay>1?'s':'')+'</span>');
  if (l.cleaning_fee) details.push('<span style="padding:.3rem .7rem;background:var(--color-surface-offset);border-radius:999px;font-size:.85rem">+$'+l.cleaning_fee+' cleaning</span>');
  if (l.allow_out_of_state) details.push('<span style="padding:.3rem .7rem;background:var(--color-surface-offset);border-radius:999px;font-size:.85rem">Out-of-state welcome</span>');

  var launched = isLaunched();
  var days = daysUntilLaunch();
  var guestOpts = [1,2,3,4,5,6,7,8].map(function(n){ return '<option value="'+n+'">'+n+' guest'+(n>1?'s':'')+'</option>'; }).join('');
  var inputStyle = 'width:100%;padding:.65rem .75rem;border:1.5px solid var(--color-border);border-radius:8px;background:var(--color-bg);color:var(--color-text);font-size:1rem;font-family:inherit;outline:none;box-sizing:border-box';
  var labelStyle = 'font-size:.8rem;font-weight:700;color:var(--color-text-muted);display:block;margin-bottom:.3rem;letter-spacing:.05em;text-transform:uppercase';

  var bookingHtml = '';
  if (!priceNum) {
    bookingHtml = '<div style="padding:1rem;background:var(--color-surface-offset);border-radius:12px;text-align:center;margin-top:1rem"><p style="font-size:.95rem;color:var(--color-text-muted)">Contact landowner for pricing</p></div>';
  } else {
    var headerHtml = !launched
      ? '<div style="background:var(--color-primary);padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between">' +
          '<div><p style="color:rgba(255,255,255,.8);font-size:.75rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase">Bookings open</p>' +
          '<p style="color:#fff;font-family:var(--font-display);font-weight:800;font-size:1.3rem">July 1, 2026</p></div>' +
          '<div style="text-align:right"><p style="color:rgba(255,255,255,.75);font-size:.75rem">Days until launch</p>' +
          '<p style="color:#fff;font-family:var(--font-display);font-weight:800;font-size:2rem">'+days+'</p></div>' +
        '</div>'
      : '';

    var noteHtml = !launched
      ? '<p style="font-size:.85rem;color:var(--color-text-muted);margin-bottom:1rem;line-height:1.6">Pre-reserve your dates now \u2014 no payment until July 1. We\u2019ll confirm by email when bookings open.</p>'
      : '';

    var nameEmailHtml = !launched
      ? '<input id="bk-name" type="text" placeholder="Your full name" style="'+inputStyle+';margin-bottom:.6rem" />' +
        '<input id="bk-email" type="email" placeholder="Email address" style="'+inputStyle+';margin-bottom:.6rem" />' +
        '<input id="bk-phone" type="tel" placeholder="Phone (optional)" style="'+inputStyle+';margin-bottom:.85rem" />'
      : '';

    var btnLabel = launched ? 'Book Now &rarr;' : 'Pre-reserve my dates &mdash; free';
    var btnAction = launched ? 'submitBookingStripe()' : 'submitPreReservation()';

    bookingHtml =
      '<div style="margin-top:1.25rem;border:1.5px solid var(--color-border);border-radius:16px;overflow:hidden">' +
        headerHtml +
        '<div style="padding:1.25rem">' +
          noteHtml +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-bottom:.75rem">' +
            '<div><label style="'+labelStyle+'">Check-in</label><input type="date" id="bk-checkin" min="2026-07-01" style="'+inputStyle+'" onchange="updateBookingPrice()" /></div>' +
            '<div><label style="'+labelStyle+'">Check-out</label><input type="date" id="bk-checkout" min="2026-07-02" style="'+inputStyle+'" onchange="updateBookingPrice()" /></div>' +
          '</div>' +
          '<div style="margin-bottom:.75rem"><label style="'+labelStyle+'">Guests</label>' +
          '<select id="bk-guests" style="'+inputStyle+'">'+guestOpts+'</select></div>' +
          '<div id="bk-price-breakdown" style="display:none;background:var(--color-surface-offset);border-radius:8px;padding:.85rem;margin-bottom:.85rem;font-size:.85rem;flex-direction:column;gap:.4rem"></div>' +
          nameEmailHtml +
          '<button onclick="'+btnAction+'" id="bk-btn" style="width:100%;padding:.9rem;background:var(--color-primary);color:#fff;border:none;border-radius:999px;font-family:var(--font-display);font-weight:800;font-size:1.1rem;cursor:pointer">'+btnLabel+'</button>' +
          '<p id="bk-msg" style="font-size:.85rem;text-align:center;margin-top:.5rem;display:none"></p>' +
          (!launched ? '<p style="font-size:.78rem;color:var(--color-text-faint);text-align:center;margin-top:.4rem">No payment now. We confirm when bookings open July 1.</p>' : '') +
        '</div>' +
      '</div>';
  }

  document.getElementById('listing-detail-content').innerHTML =
    '<div style="padding:1.5rem">' +
      photoHtml + videoHtml +
      '<div style="margin-top:1.25rem">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem;margin-bottom:.4rem">' +
          '<h2 style="font-family:var(--font-display);font-weight:800;font-size:1.4rem">' + escHtml(l.county ? l.county + ' Private Land' : 'Private Land') + '</h2>' +
          '<span style="font-family:var(--font-display);font-weight:800;font-size:1.3rem;color:'+color+'">' + priceLabel + '</span>' +
        '</div>' +
        '<p style="font-size:.95rem;color:var(--color-text-muted);margin-bottom:.6rem">&#128205; ' + escHtml(location) + (acreage ? '  &middot;  ' + acreage : '') + '</p>' +
        (activities ? '<p style="font-size:.95rem;color:var(--color-text-muted);margin-bottom:.6rem">' + escHtml(activities) + '</p>' : '') +
        (details.length ? '<div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.75rem">' + details.join('') + '</div>' : '') +
        (l.description ? '<p style="font-size:.95rem;color:var(--color-text-muted);line-height:1.65;margin-bottom:.75rem">' + escHtml(l.description) + '</p>' : '') +
        bookingHtml +
      '</div>' +
    '</div>';

  document.getElementById('listing-detail-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function updateBookingPrice() {
  var l = _currentListing;
  if (!l || !l.price_per_day) return;
  var cin = document.getElementById('bk-checkin');
  var cout = document.getElementById('bk-checkout');
  if (!cin || !cout || !cin.value || !cout.value) return;
  var d1 = new Date(cin.value), d2 = new Date(cout.value);
  if (d2 <= d1) { cout.value = ''; return; }
  var nights = Math.round((d2 - d1) / (1000*60*60*24));
  var rate = parseFloat(l.price_per_day) || 0;
  var cleaning = parseFloat(l.cleaning_fee) || 0;
  var subtotal = rate * nights + cleaning;
  var svcFee = +(subtotal * 0.15).toFixed(2);
  var total = +(subtotal + svcFee + 18).toFixed(2);
  var bd = document.getElementById('bk-price-breakdown');
  if (!bd) return;
  bd.style.display = 'flex';
  bd.innerHTML =
    '<div style="display:flex;justify-content:space-between"><span>$'+rate+' x '+nights+' night'+(nights>1?'s':'')+'</span><span>$'+(rate*nights).toFixed(2)+'</span></div>' +
    (cleaning ? '<div style="display:flex;justify-content:space-between"><span>Cleaning fee</span><span>$'+cleaning.toFixed(2)+'</span></div>' : '') +
    '<div style="display:flex;justify-content:space-between"><span>Service fee (15%)</span><span>$'+svcFee.toFixed(2)+'</span></div>' +
    '<div style="display:flex;justify-content:space-between"><span>Trip protection</span><span>$18.00</span></div>' +
    '<div style="display:flex;justify-content:space-between;font-weight:700;border-top:1px solid var(--color-border);padding-top:.4rem;margin-top:.25rem"><span>Total (due at launch)</span><span>$'+total.toFixed(2)+'</span></div>';
}

async function submitPreReservation() {
  var l = _currentListing;
  if (!l) return;
  var cin = document.getElementById('bk-checkin').value;
  var cout = document.getElementById('bk-checkout').value;
  var name = (document.getElementById('bk-name') || {}).value || '';
  var email = (document.getElementById('bk-email') || {}).value || '';
  var phone = (document.getElementById('bk-phone') || {}).value || '';
  var guests = parseInt((document.getElementById('bk-guests') || {}).value) || 1;
  var btn = document.getElementById('bk-btn');
  var msg = document.getElementById('bk-msg');
  name = name.trim(); email = email.trim(); phone = phone.trim();
  if (!cin || !cout) { msg.style.display='block'; msg.style.color='#c0392b'; msg.textContent='Please select check-in and check-out dates.'; return; }
  if (!name || !email) { msg.style.display='block'; msg.style.color='#c0392b'; msg.textContent='Please enter your name and email.'; return; }
  var d1 = new Date(cin), d2 = new Date(cout);
  var nights = Math.round((d2-d1)/(1000*60*60*24));
  var rate = parseFloat(l.price_per_day) || 0;
  var cleaning = parseFloat(l.cleaning_fee) || 0;
  var subtotal = rate * nights + cleaning;
  var svcFee = +(subtotal * 0.15).toFixed(2);
  var total = +(subtotal + svcFee + 18).toFixed(2);
  btn.disabled = true; btn.textContent = 'Saving...';
  try {
    var _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    var result = await _sb.from('bookings').insert({
      listing_id: l.id,
      guest_name: name,
      guest_email: email,
      guest_phone: phone || null,
      check_in: cin,
      check_out: cout,
      nights: nights,
      guests: guests,
      rate_per_night: rate,
      cleaning_fee: cleaning,
      service_fee: svcFee,
      trip_protection: 18,
      total: total,
      status: 'pre_reserved'
    });
    if (result.error) throw result.error;
    btn.style.display = 'none';
    msg.style.display = 'block';
    msg.style.color = 'var(--color-primary)';
    msg.style.fontWeight = '700';
    msg.style.fontSize = '1rem';
    msg.textContent = 'Pre-reservation saved! We\'ll email ' + email + ' when bookings open July 1.';
  } catch(e) {
    btn.disabled = false; btn.textContent = 'Pre-reserve my dates - free';
    msg.style.display = 'block'; msg.style.color = '#c0392b';
    msg.textContent = 'Error: ' + (e.message || 'Please try again.');
  }
}

function submitBookingStripe() {
  alert('Full Stripe checkout coming at launch. Pre-reserve your dates for now!');
}

function closeListingDetail() {
  document.getElementById('listing-detail-modal').style.display = 'none';
  document.body.style.overflow = '';
  _currentListing = null;
}
