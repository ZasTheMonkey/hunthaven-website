// ── BOOKING FLOW ──────────────────────────────────────────
var _currentListing = null;
var LAUNCH_DATE = new Date('2026-07-01T00:00:00');

function isLaunched() { return new Date() >= LAUNCH_DATE; }
function daysUntilLaunch() { return Math.ceil((LAUNCH_DATE - new Date()) / (1000*60*60*24)); }

function openListingById(id) {
  var sid = String(id);
  // Search allListings first, then fall back to map data (_currentMapData)
  var l = allListings.find(function(x){ return String(x.id) === sid; })
       || (typeof _currentMapData !== 'undefined' && _currentMapData.find(function(x){ return String(x.id) === sid; }));
  if (l) openListingDetail(l);
}

function openListingDetail(l) {
  if (!l) return;
  _currentListing = l;
  _appliedCode = null; // reset code when opening a new listing
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
      photos.map(function(u,i){ var safeUrl=typeof u==='string'&&u.startsWith('https://')&&!/[\s"'<>]/.test(u)?u.replace(/&/g,'&amp;'):''; return safeUrl?'<img src="'+safeUrl+'" alt="Property photo '+(i+1)+'" loading="lazy" decoding="async" style="height:210px;min-width:300px;object-fit:cover;border-radius:12px;flex-shrink:0" />':''; }).join('') +
      '</div>'
    : '<div style="height:180px;border-radius:12px;background:' + (isHunt ? 'linear-gradient(160deg,#2a4a30,#4a7040)' : 'linear-gradient(160deg,#0d2840,#2a90b0)') + '"></div>';

  // Only HTTPS video URLs are allowed in generated markup. Escape HTML attribute metacharacters.
  var safeVideoUrl = typeof l.video_url === 'string' && /^https:\/\/[^\s"'<>]+$/i.test(l.video_url)
    ? l.video_url.replace(/&/g, '&amp;') : '';
  var videoHtml = safeVideoUrl
    ? '<div style="margin-top:.75rem"><video src="'+safeVideoUrl+'" controls preload="metadata" playsinline style="width:100%;border-radius:12px;max-height:220px"></video></div>'
    : '';

  var details = [];
  if (l.max_guests) details.push('<span style="padding:.3rem .7rem;background:var(--color-surface-offset);border-radius:999px;font-size:.85rem">Up to '+l.max_guests+' guests</span>');
  if (l.num_beds) details.push('<span style="padding:.3rem .7rem;background:var(--color-surface-offset);border-radius:999px;font-size:.85rem">'+l.num_beds+' bed'+(l.num_beds>1?'s':'')+'</span>');
  if (l.min_stay) details.push('<span style="padding:.3rem .7rem;background:var(--color-surface-offset);border-radius:999px;font-size:.85rem">Min '+l.min_stay+' night'+(l.min_stay>1?'s':'')+'</span>');
  if (l.cleaning_fee) details.push('<span style="padding:.3rem .7rem;background:var(--color-surface-offset);border-radius:999px;font-size:.85rem">+$'+l.cleaning_fee+' cleaning</span>');
  if (l.allow_out_of_state) details.push('<span style="padding:.3rem .7rem;background:var(--color-surface-offset);border-radius:999px;font-size:.85rem">Out-of-state welcome</span>');

  // Harvest limits block — displayed when allowed_zone has harvest data
  var harvestHtml = '';
  if (l.allowed_zone && typeof l.allowed_zone === 'object' && Object.keys(l.allowed_zone).length > 0) {
    var limitsHtml = Object.entries(l.allowed_zone).map(function(entry) {
      var animal = entry[0], limit = entry[1];
      var limitStr = (limit === 0 || limit === null || limit === undefined) ? 'No limit' : limit + ' per booking';
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:.35rem 0;border-bottom:1px solid var(--color-border)">' +
        '<span style="font-size:.88rem;color:var(--color-text)">&#128290; ' + escHtml(animal) + '</span>' +
        '<span style="font-size:.85rem;font-weight:700;color:var(--color-primary)">' + escHtml(String(limitStr)) + '</span>' +
      '</div>';
    }).join('');
    harvestHtml = '<div style="margin-top:.75rem;margin-bottom:.75rem;background:var(--color-surface-offset);border-radius:12px;padding:.85rem 1rem">' +
      '<p style="font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--color-text-muted);margin-bottom:.5rem">Harvest Limits</p>' +
      limitsHtml +
    '</div>';
  }

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

    var noteHtml = '';
    var nameEmailHtml = '';

    var btnLabel = launched ? 'Book Now &rarr;' : 'Join waitlist &rarr;';
    var btnAction = launched ? 'submitBookingStripe()' : 'event.stopPropagation();closeListingDetail();openWaitlist()';

    bookingHtml =
      '<div style="margin-top:1.25rem;border:1.5px solid var(--color-border);border-radius:16px;overflow:hidden">' +
        headerHtml +
        '<div style="padding:1.25rem">' +
          noteHtml +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-bottom:.75rem">' +
            '<div><label style="'+labelStyle+'">Check-in</label><input type="text" id="bk-checkin" placeholder="Select date" style="'+inputStyle+';cursor:pointer" /></div>' +
            '<div><label style="'+labelStyle+'">Check-out</label><input type="text" id="bk-checkout" placeholder="Select date" style="'+inputStyle+';cursor:pointer" /></div>' +
          '</div>' +
          '<div id="bk-calendar-legend" style="display:flex;gap:1rem;font-size:.75rem;color:var(--color-text-muted);margin-bottom:.75rem;align-items:center">' +
            '<span style="display:flex;align-items:center;gap:.3rem"><span style="width:14px;height:14px;border-radius:3px;background:#22c55e;display:inline-block"></span>Available</span>' +
            '<span style="display:flex;align-items:center;gap:.3rem"><span style="width:14px;height:14px;border-radius:3px;background:#ef4444;display:inline-block"></span>Unavailable (booked or pending)</span>' +
          '</div>' +
          '<div style="margin-bottom:.75rem"><label style="'+labelStyle+'">Guests</label>' +
          '<select id="bk-guests" style="'+inputStyle+'">'+guestOpts+'</select></div>' +
          '<div id="bk-price-breakdown" style="display:none;background:var(--color-surface-offset);border-radius:8px;padding:.85rem;margin-bottom:.75rem;font-size:.85rem;flex-direction:column;gap:.4rem"></div>' +
          '<div id="bk-trip-protection-row" style="display:none;align-items:center;gap:.6rem;margin-bottom:.75rem;background:var(--color-surface-offset);border-radius:8px;padding:.7rem .85rem;font-size:.85rem">' +
            '<input type="checkbox" id="bk-trip-protection" onchange="updatePriceBreakdown()" style="width:16px;height:16px;accent-color:var(--color-primary);cursor:pointer" />' +
            '<label for="bk-trip-protection" style="cursor:pointer;flex:1">Add trip protection <span style="color:var(--color-text-muted)">+$18.00</span></label>' +
          '</div>' +
          '<div style="margin-bottom:.75rem">' +
            '<label style="'+labelStyle+'">Promo / Affiliate Code</label>' +
            '<div style="display:flex;gap:.5rem">' +
              '<input type="text" id="bk-code" placeholder="Enter code" style="'+inputStyle+';flex:1;text-transform:uppercase" oninput="this.value=this.value.toUpperCase()" />' +
              '<button type="button" onclick="applyCode()" id="bk-apply-btn" style="padding:.55rem .9rem;background:var(--color-accent);color:#fff;border:none;border-radius:var(--radius-md);font-weight:700;font-family:inherit;font-size:.85rem;cursor:pointer;white-space:nowrap">Apply</button>' +
            '</div>' +
            '<p id="bk-code-msg" style="font-size:.78rem;margin-top:.3rem;display:none"></p>' +
          '</div>' +
          nameEmailHtml +
          '<button type="button" onclick="'+btnAction+'" id="bk-btn" style="width:100%;padding:.9rem;background:var(--color-primary);color:#fff;border:none;border-radius:999px;font-family:var(--font-display);font-weight:800;font-size:1.1rem;cursor:pointer">'+btnLabel+'</button>' +
          '<p id="bk-msg" style="font-size:.85rem;text-align:center;margin-top:.5rem;display:none"></p>' +
          '<p style="font-size:.78rem;color:var(--color-text-faint);text-align:center;margin-top:.4rem">Test card only · Your card is authorized now and charged only if the landowner accepts within 24 hours. Declined or expired requests release the hold; banks may take extra time to show it.</p>' +
        '</div>' +
      '</div>';
  }


  // ── Load booked dates and init Flatpickr calendars ────────
  async function initDatePickers() {
    // Sandbox-only availability: never query the live database.
    var bookedDates = [], pendingDates = [], unavailable = new Set(), loadFailed = false;
    try {
      var res = await fetch(SUPABASE_URL + '/functions/v1/sandbox-listing-availability?listing_id=' + encodeURIComponent(l.id), {
        headers: { 'apikey': SUPABASE_ANON_KEY }, cache:'no-store'
      });
      if (!res.ok) throw new Error('Availability service unavailable');
      var payload = await res.json();
      if (!Array.isArray(payload.ranges)) throw new Error('Invalid availability response');
      payload.ranges.forEach(function(range) {
        var cur = new Date(range.start + 'T00:00:00Z'), end = new Date(range.end + 'T00:00:00Z');
        while (cur < end) {
          var day = cur.toISOString().slice(0,10);
          unavailable.add(day);
          (range.type === 'pending' ? pendingDates : bookedDates).push(day);
          cur.setUTCDate(cur.getUTCDate()+1);
        }
      });
    } catch(e) {
      loadFailed = true;
      console.warn('Sandbox availability unavailable',e);
      var warning=document.getElementById('bk-msg');
      if(warning){warning.style.display='block';warning.textContent='Availability is temporarily unavailable. Please try again later.';}
      var requestButton=document.getElementById('bk-btn');
      if(requestButton)requestButton.disabled=true;
    }
    var fpConfig = {
      minDate: 'today',
      disableMobile: true,
      allowInput: false,
      dateFormat: 'Y-m-d',
      disable: loadFailed ? [function(){return true;}] : Array.from(unavailable),
      onDayCreate: function(dObj, dStr, fp, dayElem) {
        var dateStr = dayElem.dateObj ? dayElem.dateObj.toISOString().split('T')[0] : null;
        if (!dateStr) return;
        var today = new Date(); today.setHours(0,0,0,0);
        var d = new Date(dateStr);
        if (d < today || d < new Date('2026-07-01')) {
          dayElem.style.background = '';
          return;
        }
        if (unavailable.has(dateStr)) {
          dayElem.style.background = '#fef2f2';
          dayElem.style.color = '#ef4444';
          dayElem.style.borderRadius = '4px';
          dayElem.title = pendingDates.includes(dateStr) ? 'Pending landowner approval' : 'Confirmed booking';
        } else {
          dayElem.style.background = '#f0fdf4';
          dayElem.style.color = '#166534';
          dayElem.style.borderRadius = '4px';
        }
      },
      onChange: function() { updateBookingPrice(); }
    };

    // Wait for DOM elements to be available (poll up to 1s)
    var cinEl, coutEl;
    for (var i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 60));
      cinEl = document.getElementById('bk-checkin');
      coutEl = document.getElementById('bk-checkout');
      if (cinEl && coutEl) break;
    }
    if (!cinEl || !coutEl) { console.warn('bk-checkin/bk-checkout not found'); return; }

    var fpOut; // declared first so fpIn's onChange closure can reference it
    var fpIn = flatpickr(cinEl, Object.assign({}, fpConfig, {
      onChange: function(dates, str) {
        if (dates[0] && fpOut) {
          var next = new Date(dates[0]); next.setDate(next.getDate() + 1);
          fpOut.set('minDate', next.toISOString().split('T')[0]);
        }
        updateBookingPrice();
      }
    }));
    fpOut = flatpickr(coutEl, Object.assign({}, fpConfig, {
      onChange: function() { updateBookingPrice(); }
    }));
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
        (typeof getFLRegulationsHtml === 'function' ? getFLRegulationsHtml(l) : '') +
        harvestHtml +
        bookingHtml +
      '</div>' +
    '</div>';

  document.getElementById('listing-detail-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Init Flatpickr after DOM is ready
  if (priceNum) {
    if (typeof flatpickr !== 'undefined') {
      initDatePickers();
    } else {
      // Flatpickr not yet loaded — wait for it
      var fpWait = setInterval(function() {
        if (typeof flatpickr !== 'undefined') {
          clearInterval(fpWait);
          initDatePickers();
        }
      }, 100);
    }
  }
}

// ── Active code state ────────────────────────────────────────
var _appliedCode = null; // { type:'promo'|'affiliate', code, discount_pct, commission_pct, id }

async function applyCode() {
  var input = document.getElementById('bk-code');
  var msgEl = document.getElementById('bk-code-msg');
  var btn   = document.getElementById('bk-apply-btn');
  var code  = (input.value || '').trim().toUpperCase();
  if (!code) return;

  // Clear previous
  _appliedCode = null;
  msgEl.style.display = 'none';
  btn.disabled = true; btn.textContent = 'Checking…';

  var SB = SUPABASE_URL, KEY = SUPABASE_ANON_KEY;

  // Check promo codes first
  var res = await fetch(SB + '/rest/v1/promo_codes?code=eq.' + encodeURIComponent(code) + '&active=eq.true&select=*', {
    headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY }
  });
  var promos = await res.json();
  if (promos.length) {
    var p = promos[0];
    if (p.max_uses && p.uses >= p.max_uses) {
      showCodeMsg('This code has reached its usage limit.', false);
      btn.disabled = false; btn.textContent = 'Apply';
      return;
    }
    // Check listing-specific scope
    var listingId = window._currentListingId || null;
    if (p.listing_ids && p.listing_ids.length > 0 && listingId && !p.listing_ids.includes(String(listingId))) {
      showCodeMsg('This code is not valid for this listing.', false);
      btn.disabled = false; btn.textContent = 'Apply';
      return;
    }
    // Check expiry
    if (p.expires_at && new Date(p.expires_at) < new Date()) {
      showCodeMsg('This promo code has expired.', false);
      btn.disabled = false; btn.textContent = 'Apply';
      return;
    }
    var discType = p.discount_type || 'percent';
    var discAmt = discType === 'fixed' ? parseFloat(p.discount_amount || 0) : parseFloat(p.discount_pct || 0);
    _appliedCode = { type: 'promo', code: p.code, discount_type: discType, discount_pct: discType === 'percent' ? discAmt : 0, discount_fixed: discType === 'fixed' ? discAmt : 0, id: p.id };
    var discLabel = discType === 'fixed' ? '$' + discAmt.toFixed(0) + ' off' : discAmt + '% off';
    showCodeMsg('✓ ' + discLabel + ' applied!', true);
    updateBookingPrice();
    btn.disabled = false; btn.textContent = 'Apply';
    return;
  }

  // Check affiliate codes
  var res2 = await fetch(SB + '/rest/v1/affiliate_codes?code=eq.' + encodeURIComponent(code) + '&active=eq.true&select=*', {
    headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY }
  });
  var affiliates = await res2.json();
  if (affiliates.length) {
    var a = affiliates[0];
    _appliedCode = { type: 'affiliate', code: a.code, discount_pct: a.guest_discount_pct || 0, commission_pct: a.commission_pct, id: a.id };
    var msg = a.guest_discount_pct > 0
      ? '✓ Affiliate code applied — ' + a.guest_discount_pct + '% off!'
      : '✓ Affiliate code applied!';
    showCodeMsg(msg, true);
    updateBookingPrice();
    btn.disabled = false; btn.textContent = 'Apply';
    return;
  }

  // Not found
  showCodeMsg('Code not found or inactive.', false);
  btn.disabled = false; btn.textContent = 'Apply';
}

function showCodeMsg(text, success) {
  var el = document.getElementById('bk-code-msg');
  if (!el) return;
  el.style.display = 'block';
  el.style.color = success ? 'var(--color-primary)' : '#c0392b';
  el.style.fontWeight = success ? '700' : '400';
  el.textContent = text;
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
  var svcFee = 0; // LeaseWild takes 20% from landowner payout — not charged to guest
  var discountAmt = 0;
  var discountPct = _appliedCode ? (_appliedCode.discount_pct || 0) : 0;
  var discountFixed = _appliedCode ? (_appliedCode.discount_fixed || 0) : 0;
  if (discountFixed > 0) {
    discountAmt = Math.min(discountFixed, subtotal + svcFee);
  } else if (discountPct > 0) {
    discountAmt = +((subtotal + svcFee) * (discountPct / 100)).toFixed(2);
  }
  var discountLabel = discountFixed > 0 ? '$' + discountFixed.toFixed(0) + ' off' : discountPct + '% off';
  var bd = document.getElementById('bk-price-breakdown');
  if (!bd) return;
  // Show trip protection toggle row
  var tpRow = document.getElementById('bk-trip-protection-row');
  if (tpRow) tpRow.style.display = 'flex';
  var tpChecked = document.getElementById('bk-trip-protection');
  var tripProtection = (tpChecked && tpChecked.checked) ? 18 : 0;
  var total = +(subtotal + svcFee + tripProtection - discountAmt).toFixed(2);
  bd.style.display = 'flex';
  bd.innerHTML =
    '<div style="display:flex;justify-content:space-between"><span>$'+rate+' x '+nights+' night'+(nights>1?'s':'')+'</span><span>$'+(rate*nights).toFixed(2)+'</span></div>' +
    (cleaning ? '<div style="display:flex;justify-content:space-between"><span>Cleaning fee</span><span>$'+cleaning.toFixed(2)+'</span></div>' : '') +
    (tripProtection > 0 ? '<div style="display:flex;justify-content:space-between"><span>Trip protection</span><span>$18.00</span></div>' : '') +
    (discountAmt > 0 ? '<div style="display:flex;justify-content:space-between;color:var(--color-primary);font-weight:600"><span>Discount ('+discountLabel+')</span><span>−$'+discountAmt.toFixed(2)+'</span></div>' : '') +
    '<div style="display:flex;justify-content:space-between;font-weight:700;border-top:1px solid var(--color-border);padding-top:.4rem;margin-top:.25rem"><span>Total</span><span>$'+total.toFixed(2)+'</span></div>';
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
  if (l.min_stay && nights < l.min_stay) { msg.style.display='block'; msg.style.color='#c0392b'; msg.textContent='This property requires a minimum stay of '+l.min_stay+' night'+(l.min_stay>1?'s':'')+'. Please adjust your dates.'; return; }
  var rate = parseFloat(l.price_per_day) || 0;
  var cleaning = parseFloat(l.cleaning_fee) || 0;
  var subtotal = rate * nights + cleaning;
  var svcFee = 0; // LeaseWild takes 20% from landowner payout — not charged to guest
  var discountPct = _appliedCode ? (_appliedCode.discount_pct || 0) : 0;
  var discountFixed2 = _appliedCode ? (_appliedCode.discount_fixed || 0) : 0;
  var discountAmt = discountFixed2 > 0 ? Math.min(discountFixed2, subtotal + svcFee) : (discountPct > 0 ? +((subtotal + svcFee) * (discountPct / 100)).toFixed(2) : 0);
  var tpBox = document.getElementById('bk-trip-protection');
  var tripProtectionAmt = (tpBox && tpBox.checked) ? 18 : 0;
  var total = +(subtotal + svcFee + tripProtectionAmt - discountAmt).toFixed(2);
  btn.disabled = true; btn.textContent = 'Saving...'
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
      trip_protection: tripProtectionAmt,
      discount_code: _appliedCode ? _appliedCode.code : null,
      discount_pct: discountPct || null,
      discount_amt: discountAmt || null,
      affiliate_code: _appliedCode && _appliedCode.type === 'affiliate' ? _appliedCode.code : null,
      total: total,
      status: 'pre_reserved'
    }).select();
    // Increment code use count
    if (_appliedCode && result.data) {
      var tbl = _appliedCode.type === 'promo' ? 'promo_codes' : 'affiliate_codes';
      await fetch(SUPABASE_URL + '/rest/v1/' + tbl + '?id=eq.' + _appliedCode.id, {
        method: 'PATCH',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ uses: (_appliedCode.uses || 0) + 1 })
      });
    }
    if (result.error) throw result.error;
    btn.style.display = 'none';
    msg.style.display = 'block';
    msg.style.color = 'var(--color-primary)';
    msg.style.fontWeight = '700';
    msg.style.fontSize = '1rem';
    msg.innerHTML = 'Pre-reservation saved! We\'ll email <strong>' + email + '</strong> when bookings open July 1.<br><a href="cancel.html?id=' + result.data[0].id + '" style="color:#ef4444;font-size:.8rem">Need to cancel? Click here.</a>';
  } catch(e) {
    btn.disabled = false; btn.textContent = 'Saving…';
    msg.style.display = 'block'; msg.style.color = '#c0392b';
    msg.textContent = 'Error: ' + (e.message || 'Please try again.');
  }
}

// ── Stripe Checkout ──────────────────────────────────────────
// Checks site_settings.checkout_enabled before allowing payment.
// If OFF → falls back to pre-reservation form.
// If ON  → saves booking as 'pending_payment' then redirects to Stripe.
async function submitBookingStripe() {
  const l = _currentListing;
  const btn = document.getElementById('bk-btn');
  const msg = document.getElementById('bk-msg');
  if (!l || !btn || !msg) return;
  const check_in = document.getElementById('bk-checkin')?.value;
  const check_out = document.getElementById('bk-checkout')?.value;
  const guests = Number(document.getElementById('bk-guests')?.value || 1);
  const trip_protection = !!document.getElementById('bk-trip-protection')?.checked;
  msg.style.display = 'none';
  if (!check_in || !check_out) {
    msg.style.display = 'block'; msg.textContent = 'Choose your dates first.'; return;
  }
  btn.disabled = true; btn.textContent = 'Opening secure test authorization…';
  try {
  // Re-check the entire stay, not just the check-in and check-out dates.
  const availabilityResponse = await fetch(SUPABASE_URL + '/functions/v1/sandbox-listing-availability?listing_id=' + encodeURIComponent(l.id),{headers:{apikey:SUPABASE_ANON_KEY},cache:'no-store'});
  if(!availabilityResponse.ok)throw new Error('Availability could not be verified. Try again.');
  const availability = await availabilityResponse.json();
  if(!Array.isArray(availability.ranges))throw new Error('Availability could not be verified.');
  if(availability.ranges.some(r=>r.start < check_out && r.end > check_in))throw new Error('These dates are booked or awaiting approval. Please choose other dates.');
    const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { session } } = await client.auth.getSession();
    if (!session) throw new Error('Sign in to your sandbox hunter account before booking.');
    const res = await fetch('https://kbkdfpmlyggfijkyjxoi.supabase.co/functions/v1/sandbox-booking-checkout', {
      method: 'POST',
      headers: {'Content-Type':'application/json', apikey:SUPABASE_ANON_KEY, Authorization:'Bearer '+session.access_token},
      body: JSON.stringify({action:'request',listing_id:l.id, check_in, check_out, guests, trip_protection})
    });
    const data = await res.json();
    if (!res.ok || data.status !== 'authorization_pending' || !/^https:\/\/checkout\.stripe\.com\//.test(data.url || '')) throw new Error(data.error || 'Unable to authorize your card.');
    window.location.href = data.url;
  } catch (e) {
    msg.style.display = 'block'; msg.style.color = '#c0392b';
    msg.textContent = e.message || 'Sandbox checkout failed.';
  } finally {
    btn.disabled = false; btn.innerHTML = 'Request Booking — No Charge Yet &rarr;';
  }
}

function switchToPreReservation() { openWaitlist(); }

function closeListingDetail() {
  document.getElementById('listing-detail-modal').style.display = 'none';
  document.body.style.overflow = '';
  _currentListing = null;
}
