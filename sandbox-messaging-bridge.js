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
    if (response.status===204 || options.headers?.Prefer==='return=minimal') return null;
    const raw=await response.text();
    return raw ? JSON.parse(raw) : null;
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
    if(!data?.session?.user?.id) throw Error('Please sign in again to view messages.');
    const field=owner?'landowner_id':'hunter_id';
    return api('booking_conversations?'+field+'=eq.'+encodeURIComponent(data.session.user.id)+'&order=created_at.desc&select=*');
  };
  const conversationLabels=async()=>{const rows=await api('rpc/leasewild_sandbox_conversation_labels',{method:'POST',body:'{}'});return new Map((rows||[]).map(x=>[x.conversation_id,x]));};
  const threadTitle=(t,labels)=>{const x=labels.get(t.id);return x?(x.participant_name+(x.property_location?' · '+x.property_location:'')):'Conversation';};
  const messages=id=>api('booking_messages?conversation_id=eq.'+encodeURIComponent(id)+'&order=created_at.asc&select=*');
  const send=async(id,body)=>{
    const {data}=await sb.auth.getSession();
    if(!data?.session?.user?.id) throw Error('Please sign in again to send messages.');
    return api('booking_messages',{method:'POST',headers:{Prefer:'return=minimal'},
      body:JSON.stringify({conversation_id:id,sender_id:data.session.user.id,body})});
  };
  const fmt=msg=>new Date(msg.created_at).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  const showError=(e)=>{console.error('LeaseWild messaging:',e);alert(e.message||'Messaging is unavailable. Please retry.');};
const style=document.createElement('style');
  style.textContent=`
  .lw-inbox{display:flex;flex-direction:column;gap:9px}
  .lw-inbox-heading{font-size:1.15rem;font-weight:800;letter-spacing:-.025em;margin:0 0 12px;color:var(--color-text,#252822)}
  .lw-message-thread{display:flex!important;align-items:center!important;gap:14px!important;width:100%!important;text-align:left!important;padding:15px!important;margin:0!important;border:1px solid var(--color-border,#ddd)!important;border-radius:17px!important;background:var(--color-surface,#fff)!important;color:var(--color-text,#222)!important;cursor:pointer!important;transition:background .15s,border-color .15s!important;min-height:82px}
  .lw-message-thread:hover,.lw-message-thread:focus-visible{background:var(--color-bg,#f7f6f2)!important;border-color:#8da68a!important;outline-offset:2px}
  .lw-avatar{display:grid;place-items:center;flex:0 0 48px;width:48px;height:48px;border-radius:50%;background:#dce7d6;color:#29442d;font-weight:800;font-size:17px}
  .lw-thread-body{min-width:0;flex:1}
  .lw-thread-name{display:block;font-weight:800;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .lw-thread-preview{display:block;margin-top:5px;font-size:13px;color:var(--color-text-muted,#777);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .lw-thread-date{align-self:flex-start;white-space:nowrap;font-size:11px;color:var(--color-text-muted,#777)}
  .lw-chat-messages{display:flex;flex-direction:column;gap:10px;padding:18px 8px;min-height:240px;max-height:55vh;overflow-y:auto;overscroll-behavior:contain}
  .lw-chat-row{display:flex;flex-direction:column;align-items:flex-start;max-width:100%}
  .lw-chat-row.mine{align-items:flex-end}
  .lw-chat-bubble{max-width:min(84%,440px);padding:11px 15px;border-radius:18px 18px 18px 5px;background:var(--color-surface,#fff);border:1px solid var(--color-border,#ddd);color:var(--color-text,#222);line-height:1.5;overflow-wrap:anywhere;white-space:pre-wrap}
  .lw-chat-row.mine .lw-chat-bubble{background:#365d41;color:#fff;border-color:#365d41;border-radius:18px 18px 5px 18px}
  .lw-chat-time{font-size:11px;color:var(--color-text-muted,#777);margin:4px 5px 0}
  .lw-chat-empty{text-align:center;padding:50px 15px;color:var(--color-text-muted,#777)}
  #lo-compose,#compose-input{border-radius:16px!important;min-height:48px}
  #lo-send-btn,#send-btn{border-radius:14px!important;min-height:48px}
  @media(max-width:600px){.lw-message-thread{padding:13px!important}.lw-chat-messages{max-height:48vh}.lw-avatar{flex-basis:42px;width:42px;height:42px}}
  `;
  document.head.appendChild(style);
  const initials=name=>name.split(/[\s·,]+/).filter(Boolean).slice(0,2).map(x=>x[0].toUpperCase()).join('');
  const threadCard=(t,title,last)=>'<button type="button" class="lw-message-thread" data-conv="'+safe(t.id)+'" data-booking="'+safe(t.booking_id)+'" data-title="'+safe(title)+'"><span class="lw-avatar" aria-hidden="true">'+safe(initials(title))+'</span><span class="lw-thread-body"><span class="lw-thread-name">'+safe(title)+'</span><span class="lw-thread-preview">'+safe(last?.body||'Start a conversation')+'</span></span><span class="lw-thread-date">'+safe(last?new Date(last.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'')+'</span></button>';
  const threadPreview=async t=>{const x=await api('booking_messages?conversation_id=eq.'+encodeURIComponent(t.id)+'&order=created_at.desc&limit=1&select=body,created_at');return x?.[0]||null;};
  const chatMarkup=(rows,myId)=>rows.length?rows.map(m=>'<div class="lw-chat-row '+(m.sender_id===myId?'mine':'')+'"><div class="lw-chat-bubble">'+safe(m.body)+'</div><span class="lw-chat-time">'+safe(fmt(m))+'</span></div>').join(''):'<div class="lw-chat-empty">No messages yet.<p>Say hello and start the conversation.</p></div>';
    if(owner){
    let ownerInboxRequest=0;
    let ownerMessageRequest=0;
    const ownerDrafts=new Map();
    const ownerComposer=document.getElementById('lo-compose');
    if(ownerComposer)ownerComposer.addEventListener('input',()=>{if(loCurrentConvId)ownerDrafts.set(loCurrentConvId,ownerComposer.value);});
    window.loadLoThreads=async function(email){
      const request=++ownerInboxRequest;
      loCurrentUserEmail=email;
      const el=document.getElementById('lo-threads-container');
      try{
        const rows=await list();
        const labels=await conversationLabels();
        const titles=rows.map(t=>threadTitle(t,labels));
        const previews=await Promise.all(rows.map(threadPreview));
        if(request!==ownerInboxRequest)return;
        el.classList.add('lw-inbox');
        el.removeAttribute('role');
        el.innerHTML=rows.length?rows.map((t,i)=>threadCard(t,titles[i],previews[i])).join(''):'<div class="lw-chat-empty">No conversations yet. Open a booking to message your guest.</div>';
        el.querySelectorAll('[data-conv]').forEach(b=>b.addEventListener('click',()=>window.openLoConversation(b.dataset.conv,b.dataset.title,'')));
        const unreadBadge=document.getElementById('lo-unread-badge');
        if(unreadBadge)unreadBadge.style.display='none';
      }catch(e){if(request===ownerInboxRequest){
        el.setAttribute('role','alert');
        el.replaceChildren();
        const message=document.createElement('p');
        message.textContent='Unable to load conversations. '+(e.message||'Please retry.');
        const retry=document.createElement('button');
        retry.type='button';retry.textContent='Retry loading conversations';
        retry.addEventListener('click',()=>window.loadLoThreads(loCurrentUserEmail));
        el.append(message,retry);
      }}
    };
    let ownerOpenRequest=0;
    window.openLoConversation=async function(id,subject,guestEmail){
      ++ownerOpenRequest;
      if(loCurrentConvId&&ownerComposer)ownerDrafts.set(loCurrentConvId,ownerComposer.value);
      loCurrentConvId=id;
      if(ownerComposer)ownerComposer.value=ownerDrafts.get(id)||'';
      document.getElementById('lo-conv-title').textContent=subject;
      document.getElementById('lo-conv-subtitle').textContent=guestEmail?'Guest: '+guestEmail:'';
      document.getElementById('lo-thread-list').style.display='none';
      document.getElementById('lo-conversation').style.display='block';
      await window.loadLoMessages(id);
    };
    window.loadLoMessages=async function(id){
      const request=++ownerMessageRequest;
      const el=document.getElementById('lo-messages-container');
      try{
        const rows=await messages(id), {data}=await sb.auth.getSession();
        if(loCurrentConvId!==id||request!==ownerMessageRequest)return;
        el.classList.add('lw-chat-messages');
        el.removeAttribute('role');
        if(!data?.session?.user?.id) throw Error('Please sign in again to view messages.');
        const nearBottom=el.scrollHeight-el.scrollTop-el.clientHeight<80;
        const previousHeight=el.scrollHeight,previousTop=el.scrollTop;
        el.innerHTML=chatMarkup(rows,data.session.user.id);
        if(nearBottom)el.scrollTop=el.scrollHeight;
        else el.scrollTop=previousTop+(el.scrollHeight-previousHeight);
      }catch(e){if(loCurrentConvId===id&&request===ownerMessageRequest){el.setAttribute('role','alert');el.replaceChildren();const notice=document.createElement('p');notice.textContent='Unable to load messages. '+(e.message||'Please retry.');const retry=document.createElement('button');retry.type='button';retry.textContent='Retry loading messages';retry.addEventListener('click',()=>window.loadLoMessages(id));el.append(notice,retry);}}
    };
    window.sendLoMessage=async function(){
      const el=document.getElementById('lo-compose'),btn=document.getElementById('lo-send-btn'),body=el.value.trim();
      if(!body||!loCurrentConvId||btn.disabled)return;
      const sendingConvId=loCurrentConvId;
      btn.disabled=true;
      try{await send(sendingConvId,body);if(loCurrentConvId===sendingConvId){if(el.value.trim()===body){el.value='';ownerDrafts.set(sendingConvId,'');}await window.loadLoMessages(sendingConvId);}}catch(e){if(loCurrentConvId===sendingConvId)showError(e);}finally{btn.disabled=false;}
    };
    window.openLoConversationFromBooking=async function(bookingId,listingId,guestName,guestEmail){
      const request=++ownerOpenRequest;
      try{
        const id=await openBooking(bookingId);
        if(request!==ownerOpenRequest)return;
        await window.openLoConversation(id,'Conversation with '+guestName,guestEmail);
        if(request+1!==ownerOpenRequest)return;
        document.getElementById('messages-section').scrollIntoView({behavior:'smooth'});
      }catch(e){if(request===ownerOpenRequest)showError(e);}
    };
  }else{
    let hunterInboxRequest=0;
    let hunterMessageRequest=0;
    let hunterOpenRequest=0;
    const hunterDrafts=new Map();
    const hunterComposer=document.getElementById('compose-input');
    if(hunterComposer)hunterComposer.addEventListener('input',()=>{if(currentConvId)hunterDrafts.set(currentConvId,hunterComposer.value);});
    window.loadThreads=async function(){
      const request=++hunterInboxRequest;
      const el=document.getElementById('threads-container');
      try{
        const rows=await list();
        const labels=await conversationLabels();
        const titles=rows.map(t=>threadTitle(t,labels));
        const previews=await Promise.all(rows.map(threadPreview));
        if(request!==hunterInboxRequest)return;
        el.classList.add('lw-inbox');
        el.removeAttribute('role');
        el.innerHTML=rows.length?rows.map((t,i)=>threadCard(t,titles[i],previews[i])).join(''):'<div class="lw-chat-empty">No conversations yet. Open a booking to message the landowner.</div>';
        el.querySelectorAll('[data-conv]').forEach(b=>b.addEventListener('click',()=>window.openConversation(b.dataset.booking,null,b.dataset.title,b.dataset.conv)));
      }catch(e){if(request===hunterInboxRequest){
        el.setAttribute('role','alert');
        el.replaceChildren();
        const message=document.createElement('p');
        message.textContent='Unable to load conversations. '+(e.message||'Please retry.');
        const retry=document.createElement('button');
        retry.type='button';retry.textContent='Retry loading conversations';
        retry.addEventListener('click',()=>window.loadThreads());
        el.append(message,retry);
      }}
    };
    window.loadUnreadCount=async function(){const b=document.getElementById('unread-badge');if(b)b.style.display='none';};
    window.openConversation=async function(bookingId,listingId,subject,convId){
      const openRequest=++hunterOpenRequest;
      try{
        const id=convId||await openBooking(bookingId);
        if(openRequest!==hunterOpenRequest)return;
        if(currentConvId&&hunterComposer)hunterDrafts.set(currentConvId,hunterComposer.value);
        currentConvId=id;
        // Booking cards live on the Bookings tab; reveal Messages before opening the thread.
        // Otherwise the conversation is opened inside a hidden panel and the tap appears inert.
        if(typeof switchDashTab==='function')switchDashTab('messages');
        if(hunterComposer)hunterComposer.value=hunterDrafts.get(id)||'';
        document.getElementById('conv-title').textContent=subject||'Booking conversation';
        document.getElementById('thread-list-view').style.display='none';
        document.getElementById('conversation-view').style.display='block';
        await window.loadMessages(id);
      }catch(e){if(openRequest===hunterOpenRequest)showError(e);}
    };
    window.loadMessages=async function(id){
      const request=++hunterMessageRequest;
      const el=document.getElementById('messages-container');
      try{
        const rows=await messages(id),{data}=await sb.auth.getSession();
        if(currentConvId!==id||request!==hunterMessageRequest)return;
        el.classList.add('lw-chat-messages');
        el.removeAttribute('role');
        if(!data?.session?.user?.id) throw Error('Please sign in again to view messages.');
        const nearBottom=el.scrollHeight-el.scrollTop-el.clientHeight<80;
        const previousHeight=el.scrollHeight,previousTop=el.scrollTop;
        el.innerHTML=chatMarkup(rows,data.session.user.id);
        if(nearBottom)el.scrollTop=el.scrollHeight;
        else el.scrollTop=previousTop+(el.scrollHeight-previousHeight);
      }catch(e){if(currentConvId===id&&request===hunterMessageRequest){el.setAttribute('role','alert');el.replaceChildren();const notice=document.createElement('p');notice.textContent='Unable to load messages. '+(e.message||'Please retry.');const retry=document.createElement('button');retry.type='button';retry.textContent='Retry loading messages';retry.addEventListener('click',()=>window.loadMessages(id));el.append(notice,retry);}}
    };
    window.sendMessage=async function(){
      const el=document.getElementById('compose-input'),btn=document.getElementById('send-btn'),body=el.value.trim();
      if(!body||!currentConvId||btn.disabled)return;
      const sendingConvId=currentConvId;
      btn.disabled=true;
      try{await send(sendingConvId,body);if(currentConvId===sendingConvId){if(el.value.trim()===body){el.value='';hunterDrafts.set(sendingConvId,'');}await window.loadMessages(sendingConvId);}}catch(e){if(currentConvId===sendingConvId)showError(e);}finally{btn.disabled=false;}
    };
  }
})();