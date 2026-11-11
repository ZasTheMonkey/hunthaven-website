/* LeaseWild sandbox: outfitter booking actions, shared by hunter/outfitter portals. */
(function(){
 function el(tag,text){var n=document.createElement(tag);if(text!=null)n.textContent=text;return n;}
 function openDialog(db,bookingId,mode,paid,onDone){
  var cover=el('div');cover.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px';
  var panel=el('section');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label',mode==='cancel'?'Cancel outfitter booking':'Outfitter messages');panel.style.cssText='background:#1b2c22;color:#fff;width:min(100%,520px);max-height:85vh;overflow:auto;padding:20px;border-radius:14px;font:16px system-ui';
  var title=el('h2',mode==='cancel'?'Cancel reservation':'Messages about this trip');panel.append(title);
  var close=el('button','Close');close.type='button';close.style.cssText='padding:9px 15px;margin-bottom:12px';close.onclick=function(){cover.remove()};panel.append(close);
  var status=el('p','');status.setAttribute('role','status');panel.append(status);
  var list=el('div');list.style.cssText='max-height:40vh;overflow:auto;display:grid;gap:10px;margin:12px 0';panel.append(list);
  var input=el('textarea');input.placeholder='Write a message about this booking';input.rows=3;input.maxLength=2000;input.style.cssText='width:100%;padding:12px;border-radius:8px;color:#111';panel.append(input);
  var send=el('button',mode==='cancel'&&paid?'Request cancellation':'Send message');send.style.cssText='margin-top:12px;padding:12px 16px;background:#b6d5bc;color:#14251b;border:0;border-radius:8px;font-weight:bold';panel.append(send);
  async function load(){
   var r=await db.from('outfitter_booking_messages').select('sender_id,body,created_at').eq('booking_id',bookingId).order('created_at',{ascending:true}).limit(100);
   list.replaceChildren();
   if(r.error){status.textContent='Could not load messages: '+r.error.message;return;}
   if(!r.data.length)list.append(el('p','No messages yet.'));
   r.data.forEach(function(m){var p=el('p',m.body);p.style.cssText='padding:10px;border:1px solid #55705b;border-radius:8px;overflow-wrap:anywhere;white-space:pre-wrap';list.append(p)});
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
  if(mode!=='cancel'||paid)load();
  close.focus();
 }
 window.leasewildOutfitterBookingActions=openDialog;
})();