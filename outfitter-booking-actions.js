/* LeaseWild sandbox: outfitter booking actions, shared by hunter/outfitter portals. */
(function(){
 function el(tag,text){var n=document.createElement(tag);if(text!=null)n.textContent=text;return n;}
 async function paidCancellationDialog(db,bookingId,onDone){
  var overlay=el('div');overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px';
  var panel=el('section');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Cancel outfitter reservation');panel.style.cssText='box-sizing:border-box;background:#1b2c22;color:white;width:min(100%,520px);max-height:85dvh;overflow-y:auto;padding:24px;border-radius:16px;font:16px/1.5 system-ui';
  var title=el('h2','Cancel Reservation');title.style.cssText='margin:0 0 10px;font-size:25px;line-height:1.2';panel.append(title);
  var description=el('p','Review your reservation and cancellation terms.');description.style.margin='0 0 14px';panel.append(description);
  var details=el('div');details.style.cssText='padding:14px;border:1px solid #607667;border-radius:10px;margin-bottom:14px';panel.append(details);
  var policy=el('p','Checking cancellation policy…');policy.style.cssText='padding:14px;background:#31432f;border-radius:10px;margin-bottom:14px';panel.append(policy);
  var status=el('p','');status.setAttribute('role','status');panel.append(status);
  var confirm=el('button','Yes, cancel my reservation');confirm.type='button';confirm.style.cssText='display:none;width:100%;padding:14px 18px;margin-top:12px;border:0;border-radius:999px;background:#d94c44;color:white;font-weight:800;font-size:16px;min-height:48px';panel.append(confirm);
  var close=el('button','Keep my reservation');close.type='button';close.style.cssText='display:block;width:100%;min-height:48px;padding:12px 16px;margin-top:12px;border:1px solid #a9b7ac;border-radius:999px;background:transparent;color:white;font-size:16px;font-weight:700';close.onclick=function(){overlay.remove()};panel.append(close);
  overlay.append(panel);document.body.append(overlay);close.focus();
  async function call(action){
   var session=(await db.auth.getSession()).data.session;
   if(!session)throw Error('Sign in to cancel.');
   var r=await fetch(SUPABASE_URL+'/functions/v1/sandbox-outfitter-cancel',{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_ANON_KEY,Authorization:'Bearer '+session.access_token},body:JSON.stringify({action:action,booking_id:bookingId})});
   var data=await r.json();if(!r.ok)throw Error(data.error||'Cancellation unavailable');return data;
  }
  try{
   var preview=await call('preview');
   var b=preview.booking;
   details.replaceChildren();
   var date=el('p','Trip date: '+new Date(b.trip_date+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}));date.style.margin='0 0 6px';details.append(date);
   var guests=el('p','Guests: '+b.guest_count);guests.style.margin='0 0 6px';details.append(guests);
   var total=el('p','Booking total: '+new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format((b.amount_cents||0)/100));total.style.margin=0;details.append(total);
   policy.textContent=preview.refund_type==='full_refund'?'Under the 48-hour flexible policy, this Stripe TEST payment qualifies for a full refund.':'Under the 48-hour flexible policy, this trip is inside the 48-hour window and does not qualify for an automatic refund.';
   if(preview.existing_request)status.textContent='Existing cancellation request: '+preview.existing_request.replace(/_/g,' ')+'. You can confirm cancellation below.';
   confirm.style.display='block';
   confirm.onclick=async function(){
    confirm.disabled=true;confirm.textContent='Cancelling…';status.textContent='Processing cancellation and any eligible Stripe TEST refund…';
    try{
     var result=await call('cancel');
     confirm.style.display='none';
     title.textContent='Reservation Cancelled';
     status.textContent=result.result==='full_refund_issued'?'Your reservation is cancelled and the full Stripe TEST refund was initiated.':'Your reservation is cancelled. No refund applies under the 48-hour policy.';
     close.textContent='Done';if(onDone)onDone();
    }catch(e){status.textContent=e.message;confirm.disabled=false;confirm.textContent='Yes, cancel my reservation';}
   };
  }catch(e){policy.textContent='Cancellation preview unavailable';status.textContent=e.message;}
 }
 function openDialog(db,bookingId,mode,paid,onDone){
  if(mode==='cancel'&&paid){paidCancellationDialog(db,bookingId,onDone);return;}
  var cover=el('div');cover.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px';
  var panel=el('section');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label',mode==='cancel'?'Cancel outfitter booking':'Outfitter messages');panel.style.cssText='background:#1b2c22;color:#fff;width:min(100%,520px);max-height:85vh;overflow:auto;padding:20px;border-radius:14px;font:16px system-ui';
  var title=el('h2',mode==='cancel'?'Cancel reservation':'Messages about this trip');panel.append(title);
  var close=el('button','Close');close.type='button';close.style.cssText='padding:9px 15px;margin-bottom:12px';var pollTimer=null,channel=null,closed=false,loading=false,lastSignature=null;
  function cleanup(){closed=true;if(pollTimer)clearInterval(pollTimer);document.removeEventListener('visibilitychange',onVisible);if(channel)db.removeChannel(channel).catch(function(){})}
  function onVisible(){if(!document.hidden)load()}
  close.onclick=function(){cleanup();cover.remove()};panel.append(close);
  var status=el('p','');status.setAttribute('role','status');panel.append(status);
  var list=el('div');list.style.cssText='max-height:40vh;overflow:auto;display:grid;gap:10px;margin:12px 0';panel.append(list);
  var input=el('textarea');input.placeholder='Write a message about this booking';input.rows=3;input.maxLength=2000;input.style.cssText='width:100%;padding:12px;border-radius:8px;color:#111';panel.append(input);
  var send=el('button',mode==='cancel'&&paid?'Request cancellation':'Send message');send.style.cssText='margin-top:12px;padding:12px 16px;background:#b6d5bc;color:#14251b;border:0;border-radius:8px;font-weight:bold';panel.append(send);
  async function load(){
   if(closed||loading||document.hidden)return;
   loading=true;
   var r=await db.from('outfitter_booking_messages').select('sender_id,body,created_at').eq('booking_id',bookingId).order('created_at',{ascending:true}).limit(100);
   loading=false;
   if(closed)return;
   if(r.error){status.textContent='Could not refresh messages: '+r.error.message;return;}
   var signature=JSON.stringify(r.data.map(function(m){return [m.sender_id,m.created_at,m.body]}));
   if(signature===lastSignature)return;
   lastSignature=signature;
   var nearBottom=list.scrollHeight-list.scrollTop-list.clientHeight<80;
   list.replaceChildren();
   if(!r.data.length)list.append(el('p','No messages yet.'));
   r.data.forEach(function(m){var p=el('p',m.body);p.style.cssText='padding:10px;border:1px solid #55705b;border-radius:8px;overflow-wrap:anywhere;white-space:pre-wrap';list.append(p)});
   if(nearBottom)list.scrollTop=list.scrollHeight;
  }
  send.onclick=async function(){
   var body=input.value.trim();
   if(mode==='cancel'&&paid)body='CANCELLATION REQUEST (Stripe TEST payment already recorded): '+(body||'Please contact me about cancellation and any eligible refund.');
   if(!body){status.textContent='Enter a message first.';return;}
   send.disabled=true;status.textContent='Sending…';
   var user=(await db.auth.getUser()).data.user;
   var result=await db.from('outfitter_booking_messages').insert({booking_id:bookingId,sender_id:user.id,body:body});
   send.disabled=false;
   if(result.error){status.textContent=result.error.message;return;}
   input.value='';status.textContent=mode==='cancel'&&paid?'Cancellation request sent. Reservation remains paid until refund and cancellation are processed.':'Message sent.';
   await load();
  };
  if(mode==='cancel'&&!paid){
   input.style.display='none';send.textContent='Confirm cancellation';
   send.onclick=async function(){
    if(!confirm('Cancel this unpaid outfitter reservation?'))return;
    send.disabled=true;
    var r=await db.from('outfitter_booking_requests').update({status:'cancelled'}).eq('id',bookingId).eq('status','accepted').in('payment_status',['unpaid','not_started']).select('id');
    if(r.error||!r.data?.length){status.textContent=r.error?.message||'Cancellation unavailable; refresh your booking.';send.disabled=false;return;}
    status.textContent='Reservation cancelled.';send.remove();if(onDone)onDone();
   };
  }
  cover.append(panel);document.body.append(cover);
  if(mode!=='cancel'||paid){
   load();
   // Realtime INSERT events where enabled; polling ensures delivery even if
   // Realtime publication or WebSocket connectivity is unavailable.
   try{channel=db.channel('outfitter-trip-'+bookingId+'-'+Math.random().toString(36).slice(2)).on('postgres_changes',{event:'INSERT',schema:'public',table:'outfitter_booking_messages',filter:'booking_id=eq.'+bookingId},function(){load()}).subscribe()}catch(e){console.warn('Realtime unavailable; using polling',e)}
   pollTimer=setInterval(load,3000);
   document.addEventListener('visibilitychange',onVisible);
  }
  close.focus();
 }
 window.leasewildOutfitterBookingActions=openDialog;
})();