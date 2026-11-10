/* Sandbox messaging bridge: both portals use booking_conversations + booking_messages. */
(function(){
  'use strict';
  const owner = !!document.getElementById('lo-threads-container');
  const api = async (path, options={}) => {
    const {data,error}=await sb.auth.getSession();
    if(error || !data?.session?.access_token) throw Error('Please sign in again to use messages.');
    const response=await fetch(SB_URL+'/rest/v1/'+path,{
      ...options,headers:{apikey:owner?SB_KEY:SB_ANON,Authorization:'Bearer '+data.session.access_token,
      'Content-Type':'application/json',...(options.headers||{})}});
    if(!response.ok) throw Error('Messaging request failed ('+response.status+').');
    return response.status===204?null:response.json();
  };
  const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const openBooking=async id=>{
    const {data,error}=await sb.auth.getSession();
    if(error||!data?.session?.access_token) throw Error('Sign in again to open messages.');
    const res=await fetch(SB_URL+'/rest/v1/rpc/leasewild_sandbox_open_booking_conversation',{
      method:'POST',headers:{apikey:owner?SB_KEY:SB_ANON,Authorization:'Bearer '+data.session.access_token,'Content-Type':'application/json'},
      body:JSON.stringify({p_booking_id:id})});
    if(!res.ok) {const e=await res.json().catch(()=>({}));throw Error(e.message||'Unable to open this booking conversation.');}
    return res.json();
  };
  const list=async()=>{
    const {data}=await sb.auth.getSession();
    const field=owner?'landowner_id':'hunter_id';
    return api('booking_conversations?'+field+'=eq.'+encodeURIComponent(data.session.user.id)+'&order=created_at.desc&select=*');
  };
  const messages=id=>api('booking_messages?conversation_id=eq.'+encodeURIComponent(id)+'&order=created_at.asc&select=*');
  const send=async(id,body)=>{
    const {data}=await sb.auth.getSession();
    return api('booking_messages',{method:'POST',headers:{Prefer:'return=minimal'},
      body:JSON.stringify({conversation_id:id,sender_id:data.session.user.id,body})});
  };
  const fmt=msg=>new Date(msg.created_at).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  const showError=(e)=>{console.error('LeaseWild messaging:',e);alert(e.message||'Messaging is unavailable. Please retry.');};
  if(owner){
    window.loadLoThreads=async function(email){
      loCurrentUserEmail=email;
      const el=document.getElementById('lo-threads-container');
      try{
        const rows=await list();
        el.innerHTML=rows.length?rows.map(t=>'<button type="button" class="lw-message-thread" data-conv="'+safe(t.id)+'" style="display:block;width:100%;text-align:left;padding:1rem;margin-bottom:.5rem;border:1px solid var(--color-border);border-radius:12px;background:var(--color-surface);color:var(--color-text);cursor:pointer">Booking conversation · '+safe(t.booking_id.slice(0,8))+'</button>').join(''):'<p>No messages yet. Open a booking to start a conversation.</p>';
        el.querySelectorAll('[data-conv]').forEach(b=>b.addEventListener('click',()=>window.openLoConversation(b.dataset.conv,'Booking conversation','')));
        document.getElementById('lo-unread-badge').style.display='none';
      }catch(e){el.textContent=e.message;}
    };
    window.openLoConversation=async function(id,subject,guestEmail){
      loCurrentConvId=id;
      document.getElementById('lo-conv-title').textContent=subject;
      document.getElementById('lo-conv-subtitle').textContent=guestEmail?'Guest: '+guestEmail:'';
      document.getElementById('lo-thread-list').style.display='none';
      document.getElementById('lo-conversation').style.display='block';
      await window.loadLoMessages(id);
    };
    window.loadLoMessages=async function(id){
      const el=document.getElementById('lo-messages-container');
      try{
        const rows=await messages(id), {data}=await sb.auth.getSession();
        if(loCurrentConvId!==id)return;
        el.innerHTML=rows.length?rows.map(m=>'<div style="margin:.5rem 0;text-align:'+(m.sender_id===data.session.user.id?'right':'left')+'"><div style="display:inline-block;max-width:85%;padding:.7rem 1rem;border-radius:12px;background:var(--color-surface);border:1px solid var(--color-border);overflow-wrap:anywhere">'+safe(m.body)+'</div><div style="font-size:.7rem;color:var(--color-text-muted)">'+fmt(m)+'</div></div>').join(''):'<p>No messages yet. Say hello!</p>';
        el.scrollTop=el.scrollHeight;
      }catch(e){el.textContent=e.message;}
    };
    window.sendLoMessage=async function(){
      const el=document.getElementById('lo-compose'),btn=document.getElementById('lo-send-btn'),body=el.value.trim();
      if(!body||!loCurrentConvId||btn.disabled)return;
      btn.disabled=true;
      try{await send(loCurrentConvId,body);if(el.value.trim()===body)el.value='';await window.loadLoMessages(loCurrentConvId);}catch(e){showError(e);}finally{btn.disabled=false;}
    };
    window.openLoConversationFromBooking=async function(bookingId,listingId,guestName,guestEmail){
      try{const id=await openBooking(bookingId);await window.openLoConversation(id,'Booking with '+guestName,guestEmail);document.getElementById('messages-section').scrollIntoView({behavior:'smooth'});}catch(e){showError(e);}
    };
  }else{
    window.loadThreads=async function(){
      const el=document.getElementById('threads-container');
      try{
        const rows=await list();
        el.innerHTML=rows.length?rows.map(t=>'<button type="button" class="thread-item" data-conv="'+safe(t.id)+'" data-booking="'+safe(t.booking_id)+'">Booking #'+safe(t.booking_id.slice(0,8).toUpperCase())+'</button>').join(''):'<div class="empty-state">No messages yet. Open a booking to message the landowner.</div>';
        el.querySelectorAll('[data-conv]').forEach(b=>b.addEventListener('click',()=>window.openConversation(b.dataset.booking,null,'Booking conversation',b.dataset.conv)));
      }catch(e){el.textContent=e.message;}
    };
    window.loadUnreadCount=async function(){const b=document.getElementById('unread-badge');if(b)b.style.display='none';};
    window.openConversation=async function(bookingId,listingId,subject,convId){
      try{
        const id=convId||await openBooking(bookingId);
        currentConvId=id;
        document.getElementById('conv-title').textContent=subject||'Booking conversation';
        document.getElementById('thread-list-view').style.display='none';
        document.getElementById('conversation-view').style.display='block';
        await window.loadMessages(id);
      }catch(e){showError(e);}
    };
    window.loadMessages=async function(id){
      const el=document.getElementById('messages-container');
      try{
        const rows=await messages(id),{data}=await sb.auth.getSession();
        if(currentConvId!==id)return;
        el.innerHTML=rows.length?rows.map(m=>'<div class="msg-wrap"><div class="msg-bubble '+(m.sender_id===data.session.user.id?'mine':'theirs')+'">'+safe(m.body)+'</div><div class="msg-meta">'+fmt(m)+'</div></div>').join(''):'<p>No messages yet. Say hello!</p>';
        el.scrollTop=el.scrollHeight;
      }catch(e){el.textContent=e.message;}
    };
    window.sendMessage=async function(){
      const el=document.getElementById('compose-input'),btn=document.getElementById('send-btn'),body=el.value.trim();
      if(!body||!currentConvId||btn.disabled)return;
      btn.disabled=true;
      try{await send(currentConvId,body);if(el.value.trim()===body)el.value='';await window.loadMessages(currentConvId);}catch(e){showError(e);}finally{btn.disabled=false;}
    };
  }
})();