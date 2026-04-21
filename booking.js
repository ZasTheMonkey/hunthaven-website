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
  _appliedCode = null; // reset code when opening a new listing
  _licenseFile = null; _licenseUrl = null; // reset license when opening a new listing
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

    var btnLabel = 'Book Now &rarr;';
    var btnAction = 'submitBookingStripe()';

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
            '<span style="display:flex;align-items:center;gap:.3rem"><span style="width:14px;height:14px;border-radius:3px;background:#ef4444;display:inline-block"></span>Booked</span>' +
          '</div>' +
          '<div style="margin-bottom:.75rem"><label style="'+labelStyle+'">Guests</label>' +
          '<select id="bk-guests" style="'+inputStyle+'">'+guestOpts+'</select></div>' +
          '<div id="bk-price-breakdown" style="display:none;background:var(--color-surface-offset);border-radius:8px;padding:.85rem;margin-bottom:.75rem;font-size:.85rem;flex-direction:column;gap:.4rem"></div>' +
          '<div style="margin-bottom:.75rem">' +
            '<label style="'+labelStyle+'">Promo / Affiliate Code</label>' +
            '<div style="display:flex;gap:.5rem">' +
              '<input type="text" id="bk-code" placeholder="Enter code" style="'+inputStyle+';flex:1;text-transform:uppercase" oninput="this.value=this.value.toUpperCase()" />' +
              '<button type="button" onclick="applyCode()" id="bk-apply-btn" style="padding:.55rem .9rem;background:var(--color-accent);color:#fff;border:none;border-radius:var(--radius-md);font-weight:700;font-family:inherit;font-size:.85rem;cursor:pointer;white-space:nowrap">Apply</button>' +
            '</div>' +
            '<p id="bk-code-msg" style="font-size:.78rem;margin-top:.3rem;display:none"></p>' +
          '</div>' +
          nameEmailHtml +
          '<div style="margin-bottom:.75rem;border:1.5px solid var(--color-border);border-radius:12px;overflow:hidden">' +
            '<div style="background:var(--color-surface-offset);padding:.65rem 1rem;display:flex;align-items:center;gap:.5rem">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
              '<span style="font-size:.78rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.05em">License Required</span>' +
            '</div>' +
            '<div style="padding:.85rem 1rem">' +
              '<p style="font-size:.83rem;color:var(--color-text-muted);margin-bottom:.65rem;line-height:1.55">Florida law requires a valid hunting or fishing license. Upload yours before booking — JPG, PNG, or PDF, max 10MB.</p>' +
              '<div style="display:flex;gap:.5rem;margin-bottom:.65rem">' +
                '<label style="flex:1;display:flex;align-items:center;gap:.4rem;padding:.45rem .7rem;border:1.5px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:.83rem;font-weight:600;transition:border-color .15s" id="lic-type-hunt-label">' +
                  '<input type="radio" name="lic-type" value="hunting" id="lic-type-hunt" style="accent-color:var(--color-primary)" ' + (type !== 'fishing' ? 'checked' : '') + ' onchange="updateLicLabel()" /> Hunting' +
                '</label>' +
                '<label style="flex:1;display:flex;align-items:center;gap:.4rem;padding:.45rem .7rem;border:1.5px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:.83rem;font-weight:600;transition:border-color .15s" id="lic-type-fish-label">' +
                  '<input type="radio" name="lic-type" value="fishing" id="lic-type-fish" style="accent-color:var(--color-primary)" ' + (type === 'fishing' ? 'checked' : '') + ' onchange="updateLicLabel()" /> Fishing' +
                '</label>' +
                '<label style="flex:1;display:flex;align-items:center;gap:.4rem;padding:.45rem .7rem;border:1.5px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:.83rem;font-weight:600;transition:border-color .15s" id="lic-type-both-label">' +
                  '<input type="radio" name="lic-type" value="both" id="lic-type-both" style="accent-color:var(--color-primary)" onchange="updateLicLabel()" /> Both' +
                '</label>' +
              '</div>' +
              '<label id="lic-upload-label" style="display:flex;align-items:center;gap:.6rem;padding:.6rem .85rem;border:1.5px dashed var(--color-border);border-radius:8px;cursor:pointer;font-size:.85rem;color:var(--color-text-muted);background:var(--color-bg);transition:border-color .15s">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
                '<span id="lic-file-name">Tap to upload ' + (type === 'fishing' ? 'fishing' : 'hunting') + ' license</span>' +
                '<input type="file" id="lic-file-input" accept="image/*,.pdf" style="display:none" onchange="handleLicFile(this)" />' +
              '</label>' +
              '<p id="lic-status" style="font-size:.78rem;margin-top:.4rem;display:none"></p>' +
            '</div>' +
          '</div>' +
          '<button onclick="'+btnAction+'" id="bk-btn" style="width:100%;padding:.9rem;background:var(--color-primary);color:#fff;border:none;border-radius:999px;font-family:var(--font-display);font-weight:800;font-size:1.1rem;cursor:pointer">'+btnLabel+'</button>' +
          '<p id="bk-msg" style="font-size:.85rem;text-align:center;margin-top:.5rem;display:none"></p>' +
          '<p style="font-size:.78rem;color:var(--color-text-faint);text-align:center;margin-top:.4rem">Secure checkout powered by Stripe.</p>' +
        '</div>' +
      '</div>';
  }


  // ── Load booked dates and init Flatpickr calendars ────────
  async function initDatePickers() {
    // Fetch confirmed/pre_reserved bookings for this listing
    var bookedDates = [];
    try {
      var SB_URL = 'https://teohfzegpoxzimfsmviy.supabase.co';
      var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlb2hmemVncG94emltZnNtdml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NjU3NTQsImV4cCI6MjA5MjA0MTc1NH0.9AVp5qsV8MFLhRtYuMkgybubLBX7-lA_VC-hyA5HYRw';
      var res = await fetch(SB_URL + "/rest/v1/bookings?listing_id=eq." + encodeURIComponent(l.id) + "&status=in.(pre_reserved,confirmed)&select=check_in,check_out", {
        headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
      });
      var bookings = await res.json();
      // Expand each booking into individual dates
      bookings.forEach(function(b) {
        var cur = new Date(b.check_in);
        var end = new Date(b.check_out);
        while (cur < end) {
          bookedDates.push(cur.toISOString().split('T')[0]);
          cur.setDate(cur.getDate() + 1);
        }
      });
    } catch(e) { console.warn('Could not load booked dates', e); }

    var fpConfig = {
      minDate: '2026-07-01',
      disableMobile: true,
      allowInput: false,
      dateFormat: 'Y-m-d',
      disable: bookedDates,
      onDayCreate: function(dObj, dStr, fp, dayElem) {
        var dateStr = dayElem.dateObj ? dayElem.dateObj.toISOString().split('T')[0] : null;
        if (!dateStr) return;
        var today = new Date(); today.setHours(0,0,0,0);
        var d = new Date(dateStr);
        if (d < today || d < new Date('2026-07-01')) {
          dayElem.style.background = '';
          return;
        }
        if (bookedDates.includes(dateStr)) {
          dayElem.style.background = '#fef2f2';
          dayElem.style.color = '#ef4444';
          dayElem.style.borderRadius = '4px';
          dayElem.title = 'Already booked';
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

// ── License upload state ─────────────────────────────────────
var _licenseFile = null;   // the File object
var _licenseUrl  = null;   // Supabase storage URL after upload

function updateLicLabel() {
  var type = (document.querySelector('input[name="lic-type"]:checked') || {}).value || 'hunting';
  var label = type === 'fishing' ? 'fishing license'
            : type === 'both'    ? 'hunting + fishing licenses'
            : 'hunting license';
  var el = document.getElementById('lic-file-name');
  if (el && !_licenseFile) el.textContent = 'Tap to upload ' + label;
}

function handleLicFile(input) {
  var file = input.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    showLicStatus('File too large — max 10MB.', false);
    input.value = '';
    return;
  }
  _licenseFile = file;
  _licenseUrl  = null; // reset any prior upload
  var nameEl = document.getElementById('lic-file-name');
  if (nameEl) nameEl.textContent = '\u2713 ' + file.name;
  var label = document.getElementById('lic-upload-label');
  if (label) label.style.borderColor = 'var(--color-primary)';
  showLicStatus('', false);
}

function showLicStatus(msg, ok) {
  var el = document.getElementById('lic-status');
  if (!el) return;
  if (!msg) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  el.style.color = ok ? 'var(--color-primary)' : '#c0392b';
  el.style.fontWeight = ok ? '700' : '400';
  el.textContent = msg;
}

async function uploadLicense() {
  if (_licenseUrl) return _licenseUrl; // already uploaded
  if (!_licenseFile) return null;
  try {
    var _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    var ext  = _licenseFile.name.split('.').pop();
    var path = 'licenses/' + Date.now() + '_' + Math.random().toString(36).slice(2) + '.' + ext;
    var { data: upData, error: upErr } = await _sb.storage
      .from('listing-photos') // reuse same bucket
      .upload(path, _licenseFile, { cacheControl: '3600', upsert: false });
    if (upErr) throw upErr;
    var { data: urlData } = _sb.storage.from('listing-photos').getPublicUrl(path);
    _licenseUrl = urlData.publicUrl;
    return _licenseUrl;
  } catch(e) {
    console.warn('License upload failed:', e);
    return null;
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
    } else {
      _appliedCode = { type: 'promo', code: p.code, discount_pct: p.discount_pct, id: p.id };
      showCodeMsg('✓ ' + p.discount_pct + '% discount applied!', true);
      updateBookingPrice();
    }
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
  var svcFee = +(subtotal * 0.15).toFixed(2);
  var discountAmt = 0;
  var discountPct = _appliedCode ? _appliedCode.discount_pct : 0;
  if (discountPct > 0) {
    discountAmt = +((subtotal + svcFee) * (discountPct / 100)).toFixed(2);
  }
  var total = +(subtotal + svcFee + 18 - discountAmt).toFixed(2);
  var bd = document.getElementById('bk-price-breakdown');
  if (!bd) return;
  bd.style.display = 'flex';
  bd.innerHTML =
    '<div style="display:flex;justify-content:space-between"><span>$'+rate+' x '+nights+' night'+(nights>1?'s':'')+'</span><span>$'+(rate*nights).toFixed(2)+'</span></div>' +
    (cleaning ? '<div style="display:flex;justify-content:space-between"><span>Cleaning fee</span><span>$'+cleaning.toFixed(2)+'</span></div>' : '') +
    '<div style="display:flex;justify-content:space-between"><span>Service fee (15%)</span><span>$'+svcFee.toFixed(2)+'</span></div>' +
    '<div style="display:flex;justify-content:space-between"><span>Trip protection</span><span>$18.00</span></div>' +
    (discountAmt > 0 ? '<div style="display:flex;justify-content:space-between;color:var(--color-primary);font-weight:600"><span>Discount ('+discountPct+'% off)</span><span>−$'+discountAmt.toFixed(2)+'</span></div>' : '') +
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
  var svcFee = +(subtotal * 0.15).toFixed(2);
  var discountPct = _appliedCode ? (_appliedCode.discount_pct || 0) : 0;
  var discountAmt = discountPct > 0 ? +((subtotal + svcFee) * (discountPct / 100)).toFixed(2) : 0;
  var total = +(subtotal + svcFee + 18 - discountAmt).toFixed(2);
  // ─ Upload license before saving ─────────────────────
  if (!_licenseFile) {
    msg.style.display = 'block'; msg.style.color = '#c0392b';
    msg.textContent = 'Please upload your hunting or fishing license before submitting.';
    return;
  }
  btn.disabled = true; btn.textContent = 'Uploading license…';
  var licUrl = await uploadLicense();
  if (!licUrl) {
    btn.disabled = false; btn.textContent = 'Pre-reserve my dates — free';
    msg.style.display = 'block'; msg.style.color = '#c0392b';
    msg.textContent = 'License upload failed. Please try again or choose a smaller file.';
    return;
  }
  var licType = (document.querySelector('input[name="lic-type"]:checked') || {}).value || 'hunting';
  btn.textContent = 'Saving...';
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
      discount_code: _appliedCode ? _appliedCode.code : null,
      discount_pct: discountPct || null,
      discount_amt: discountAmt || null,
      affiliate_code: _appliedCode && _appliedCode.type === 'affiliate' ? _appliedCode.code : null,
      total: total,
      license_url: licUrl,
      license_type: licType,
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
    btn.disabled = false; btn.textContent = 'Pre-reserve my dates - free';
    msg.style.display = 'block'; msg.style.color = '#c0392b';
    msg.textContent = 'Error: ' + (e.message || 'Please try again.');
  }
}

// ── Stripe Checkout ──────────────────────────────────────────
// Checks site_settings.checkout_enabled before allowing payment.
// If OFF → falls back to pre-reservation form.
// If ON  → saves booking as 'pending_payment' then redirects to Stripe.
async function submitBookingStripe() {
  var l = _currentListing;
  if (!l) return;
  var cin = document.getElementById('bk-checkin').value;
  var cout = document.getElementById('bk-checkout').value;
  var guests = parseInt((document.getElementById('bk-guests') || {}).value) || 1;
  var btn = document.getElementById('bk-btn');
  var msg = document.getElementById('bk-msg');

  if (!cin || !cout) {
    msg.style.display = 'block'; msg.style.color = '#c0392b';
    msg.textContent = 'Please select check-in and check-out dates.';
    return;
  }
  if (l.min_stay) {
    var _d1 = new Date(cin), _d2 = new Date(cout);
    var _nights = Math.round((_d2 - _d1) / (1000*60*60*24));
    if (_nights < l.min_stay) {
      msg.style.display = 'block'; msg.style.color = '#c0392b';
      msg.textContent = 'This property requires a minimum stay of ' + l.min_stay + ' night' + (l.min_stay > 1 ? 's' : '') + '. Please adjust your dates.';
      return;
    }
  }

  btn.disabled = true; btn.textContent = 'Checking…';

  // ─ 1. Check if checkout is enabled ────────────────────
  var checkoutEnabled = false;
  try {
    var settingsRes = await fetch(
      SUPABASE_URL + '/rest/v1/site_settings?key=eq.checkout_enabled&select=value',
      { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY } }
    );
    var settingsRows = await settingsRes.json();
    checkoutEnabled = settingsRows.length && settingsRows[0].value === 'true';
  } catch(e) { checkoutEnabled = false; }

  // ─ 2. If OFF — block checkout ─────────────────────
  if (!checkoutEnabled) {
    btn.disabled = false; btn.innerHTML = 'Book Now &rarr;';
    msg.style.display = 'block'; msg.style.color = 'var(--color-accent)';
    msg.style.fontWeight = '600';
    msg.innerHTML = 'Online booking opens July 1, 2026. <br>Want to reserve these dates? <button onclick="switchToPreReservation()" style="background:none;border:none;color:var(--color-primary);font-weight:700;cursor:pointer;font-family:inherit;font-size:inherit;text-decoration:underline;padding:0">Pre-reserve for free &rarr;</button>';
    return;
  }

  // ─ 3. Checkout IS enabled — calculate totals ───────
  // ─ Upload license before Stripe checkout ────────────
  if (!_licenseFile) {
    btn.disabled = false; btn.innerHTML = 'Book Now &rarr;';
    msg.style.display = 'block'; msg.style.color = '#c0392b';
    msg.textContent = 'Please upload your hunting or fishing license before booking.';
    return;
  }
  btn.textContent = 'Uploading license…';
  var licUrl = await uploadLicense();
  if (!licUrl) {
    btn.disabled = false; btn.innerHTML = 'Book Now &rarr;';
    msg.style.display = 'block'; msg.style.color = '#c0392b';
    msg.textContent = 'License upload failed. Please try again or choose a smaller file.';
    return;
  }
  var licType = (document.querySelector('input[name="lic-type"]:checked') || {}).value || 'hunting';
  btn.textContent = 'Preparing checkout…';
  var d1 = new Date(cin), d2 = new Date(cout);
  var nights = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  var rate = parseFloat(l.price_per_day) || 0;
  var cleaning = parseFloat(l.cleaning_fee) || 0;
  var subtotal = rate * nights + cleaning;
  var svcFee = +(subtotal * 0.15).toFixed(2);
  var discountPct = _appliedCode ? (_appliedCode.discount_pct || 0) : 0;
  var discountAmt = discountPct > 0 ? +((subtotal + svcFee) * (discountPct / 100)).toFixed(2) : 0;
  var tripProtection = 18;
  // Stripe fee passed to guest: 2.9% + $0.30 on top of everything
  var preStripe = subtotal + svcFee + tripProtection - discountAmt;
  var stripeFee = +((preStripe * 0.029) + 0.30).toFixed(2);
  var total = +(preStripe + stripeFee).toFixed(2);
  var totalCents = Math.round(total * 100);

  // ─ 4. Save booking as pending_payment in Supabase ───
  var bookingId = null;
  try {
    var _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    var result = await _sb.from('bookings').insert({
      listing_id: l.id,
      guest_name: 'Pending',
      guest_email: 'pending@stripe',
      check_in: cin,
      check_out: cout,
      nights: nights,
      guests: guests,
      rate_per_night: rate,
      cleaning_fee: cleaning,
      service_fee: svcFee,
      trip_protection: tripProtection,
      stripe_fee: stripeFee,
      discount_code: _appliedCode ? _appliedCode.code : null,
      discount_pct: discountPct || null,
      discount_amt: discountAmt || null,
      affiliate_code: _appliedCode && _appliedCode.type === 'affiliate' ? _appliedCode.code : null,
      total: total,
      license_url: licUrl,
      license_type: licType,
      status: 'pending_payment'
    }).select();
    if (result.error) throw result.error;
    bookingId = result.data[0].id;
  } catch(e) {
    btn.disabled = false; btn.innerHTML = 'Book Now &rarr;';
    msg.style.display = 'block'; msg.style.color = '#c0392b';
    msg.textContent = 'Error: ' + (e.message || 'Please try again.');
    return;
  }

  // ─ 5. Redirect to Stripe Checkout via payment link ──
  // Stripe Payment Links let you pass custom amounts via query params.
  // We use Stripe's hosted checkout with the total encoded in the URL.
  // The return URL brings the guest back to a confirmation page.
  var listingName = l.county ? l.county + ' Private Land' : 'LeaseWild Booking';
  var description = listingName + ' \u2014 ' + nights + ' night' + (nights > 1 ? 's' : '') + ' (' + cin + ' to ' + cout + ')';

  // Use Stripe Checkout JS to redirect
  // Load Stripe.js if not already loaded
  if (typeof Stripe === 'undefined') {
    var stripeScript = document.createElement('script');
    stripeScript.src = 'https://js.stripe.com/v3/';
    stripeScript.onload = function() { launchStripeCheckout(totalCents, bookingId, description, cin, cout, nights, l); };
    document.head.appendChild(stripeScript);
  } else {
    launchStripeCheckout(totalCents, bookingId, description, cin, cout, nights, l);
  }
}

function switchToPreReservation() {
  // Swap the button/form to show the pre-reservation fields
  var l = _currentListing;
  if (!l) return;
  // Re-render the booking area with pre-reservation mode
  var msg = document.getElementById('bk-msg');
  if (msg) { msg.style.display = 'none'; }
  var btnEl = document.getElementById('bk-btn');
  if (!btnEl) return;
  var inputStyle = 'width:100%;padding:.65rem .75rem;border:1.5px solid var(--color-border);border-radius:8px;background:var(--color-bg);color:var(--color-text);font-size:1rem;font-family:inherit;outline:none;box-sizing:border-box';
  // Insert name/email/phone fields above the button
  var noteDiv = document.createElement('div');
  noteDiv.style.cssText = 'margin-bottom:.75rem';
  noteDiv.innerHTML =
    '<p style="font-size:.85rem;color:var(--color-text-muted);margin-bottom:.75rem;line-height:1.6">Pre-reserve your dates — no payment until bookings open July 1, 2026. We\'ll confirm by email.</p>' +
    '<input id="bk-name" type="text" placeholder="Your full name" style="' + inputStyle + ';margin-bottom:.6rem" />' +
    '<input id="bk-email" type="email" placeholder="Email address" style="' + inputStyle + ';margin-bottom:.6rem" />' +
    '<input id="bk-phone" type="tel" placeholder="Phone (optional)" style="' + inputStyle + ';margin-bottom:.6rem" />';
  btnEl.parentNode.insertBefore(noteDiv, btnEl);
  btnEl.innerHTML = 'Pre-reserve my dates — free';
  btnEl.onclick = submitPreReservation;
}

async function launchStripeCheckout(totalCents, bookingId, description, cin, cout, nights, listing) {
  // No-backend approach: use Stripe Payment Links.
  // Since we cannot create checkout sessions client-side securely,
  // we redirect to a Stripe Payment Link with the pre-built product.
  // The link is configured in Stripe dashboard as a "variable amount" link.
  // For now, redirect to a Stripe payment link page with metadata in the URL.
  //
  // IMPORTANT: You must create a Stripe Payment Link in your dashboard:
  //   1. Go to dashboard.stripe.com/payment-links/create
  //   2. Set it to collect custom amount OR create a one-time product
  //   3. Paste the link below
  //
  // For a clean flow with dynamic pricing, the ideal solution is a
  // small Stripe Checkout server (e.g. Supabase Edge Function).
  // We'll wire that up and redirect accordingly.

  var btn = document.getElementById('bk-btn');
  var msg = document.getElementById('bk-msg');

  // Attempt to call our Supabase Edge Function to create a Checkout session
  try {
    var res = await fetch('https://teohfzegpoxzimfsmviy.supabase.co/functions/v1/stripe-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({
        booking_id: bookingId,
        amount_cents: totalCents,
        description: description,
        checkin: cin,
        checkout: cout,
        nights: nights,
        listing_title: listing.county ? listing.county + ' Private Land' : 'LeaseWild',
        success_url: window.location.origin + '/guest-portal.html?booking=' + bookingId + '&payment=success',
        cancel_url: window.location.href
      })
    });
    var data = await res.json();
    if (data && data.url) {
      window.location.href = data.url;
      return;
    }
    throw new Error(data.error || 'No checkout URL returned');
  } catch(e) {
    if (btn) { btn.disabled = false; btn.innerHTML = 'Book Now &rarr;'; }
    if (msg) {
      msg.style.display = 'block'; msg.style.color = '#c0392b';
      msg.textContent = 'Checkout error: ' + (e.message || 'Please try again.');
    }
  }
}

function closeListingDetail() {
  document.getElementById('listing-detail-modal').style.display = 'none';
  document.body.style.overflow = '';
  _currentListing = null;
}
