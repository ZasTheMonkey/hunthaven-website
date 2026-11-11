/* LeaseWild sandbox: outfitter booking actions, shared by hunter/outfitter portals. */
(function(){
 function el(tag,text){var n=document.createElement(tag);if(text!=null)n.textContent=text;return n;}
 async function paidCancellationDialog(db,bookingId,onDone){
  var overlay=el('div');overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px';
  var panel=el('section');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Request trip cancellation');panel.style.cssText='background:#1b2c22;color:white;width:min(100%,520px);max-height:85vh;overflow:auto;padding:20px;border-radius:14px;font:16px system-ui';
  var heading=el('h2','Request trip cancellation');panel.append(heading);
  var close=el('button','Close');close.type='button';close.onclick=function(){overlay.remove()};panel.append(close);
  var explanation=el('p','Your trip is paid. A cancellation request does not cancel the reservation or issue a refund. Refund eligibility must be reviewed before a Stripe TEST refund is processed.');panel.append(explanation);
  var status=el('p','Checking request status…');status.setAttribute('role','status');panel.append(status);
  var reason=el('textarea');reason.rows=3;reason.maxLength=2000;reason.placeholder='Why would you like to cancel?';reason.setAttribute('aria-label','Cancellation reason');reason.style.cssText='display:none;width:100%;padding:12px;border-radius:8px;color:#111';panel.append(reason);
  var submit=el('button','Submit cancellation request');submit.type='button';submit.style.cssText='display:none;margin-top:12px;padding:12px 16px;background:#b6d5bc;color:#14251b;border:0;border-radius:8px;font-weight:bold';panel.append(submit);
  overlay.append(panel);document.body.append(overlay);close.focus();
  async function check(){
   var r=await db.from('outfitter_cancellation_requests').select('status,refund_status,requested_at').eq('booking_id',bookingId).maybeSingle();
   if(r.error){status.textContent='Could not check cancellation status: '+r.error.message;return;}
   if(r.data){status.textContent='Cancellation status: '+r.data.status.replace(/_/g,' ')+' · Refund: '+r.data.refund_status.replace(/_/g,' ')+'.';reason.style.display='none';submit.style.display='none';return;}
   status.textContent='No cancellation request has been submitted.';
   reason.style.display='block';submit.style.display='inline-block';
  }
  submit.onclick=async function(){
   var value=reason.value.trim();if(!value){status.textContent='Please enter a cancellation reason.';return;}
   submit.disabled=true;status.textContent='Submitting request…';
   var booking=await db.from('outfitter_booking_requests').select('hunter_id,outfitter_id,status,payment_status').eq('id',bookingId).single();
   if(booking.error||!booking.data||booking.data.status!=='accepted'||booking.data.payment_status!=='paid'){status.textContent='This booking is not eligible for the paid cancellation request flow.';submit.disabled=false;return;}
   var user=(await db.auth.getUser()).data.user;
   if(!user||user.id!==booking.data.hunter_id){status.textContent='Only the booking hunter can request cancellation.';submit.disabled=false;return;}
   var r=await db.from('outfitter_cancellation_requests').insert({booking_id:bookingId,hunter_id:user.id,outfitter_id:booking.data.outfitter_id,reason:value});
   if(r.error){status.textContent=r.error.code==='23505'?'A cancellation request already exists.':'Could not submit request: '+r.error.message;await check();return;}
   status.textContent='Cancellation request submitted. Your booking remains paid until review and any eligible refund are completed.';
   reason.style.display='none';submit.style.display='none';if(onDone)onDone();
  };
  await check();
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