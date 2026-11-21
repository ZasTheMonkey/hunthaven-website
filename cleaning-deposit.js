// Authenticated, participant-only payment display. Never use booking totals to capture money.
(function(){
  var money = function(n){return '$'+(n/100).toFixed(2);};
  var date = function(d,zone){return new Date(d).toLocaleString('en-US',{timeZone:zone,dateStyle:'medium',timeStyle:'short'})+' ('+zone+')';};
  async function call(sb,id,action,extra){
    var session=(await sb.auth.getSession()).data.session;
    if(!session) throw new Error('Please sign in again.');
    var result=await sb.functions.invoke('cleaning-deposit',{body:Object.assign({booking_id:id,action:action},extra||{}),headers:{Authorization:'Bearer '+session.access_token}});
    if(result.error) {
      var detail; try {detail=await result.error.context.json();} catch(_){}
      throw new Error(detail?.error||result.error.message);
    }
    if(result.data.error) throw new Error(result.data.error);
    return result.data;
  }
  window.cancelCleaningDeposit=async function(sb,id){
    var result=await sb.from('lease_payments').select('id').eq('booking_id',id).maybeSingle();
    if(result.error) throw result.error;
    if(result.data) await call(sb,id,'cancel');
  };
  window.renderCleaningPayments=async function(container,sb,isOwner){
    var nodes=Array.from(container.querySelectorAll('.cleaning-payment'));
    for(var node of nodes){
      var id=node.dataset.bookingId;
      var result=await sb.from('lease_payments').select('booking_id,owner_cents,tax_cents,captured_cents,total_cents,deposit_cents,state,checkin_at,checkout_at,time_zone,hunting_methods,claim_deadline,claim_reason,payment_state,last_error').eq('booking_id',id).maybeSingle();
      if(result.error){node.textContent='Payment status unavailable. Refresh or contact LeaseWild.';continue;}
      var row=result.data;
      if(!row){node.textContent='Existing booking: original payment terms apply.';continue;}
      node.replaceChildren();node.style.cssText='margin-top:1rem;padding:.8rem;border:1px solid var(--color-border);border-radius:8px;font-size:.85rem';
      function line(text){var p=document.createElement('p');p.textContent=text;node.appendChild(p);}
      line('Sales tax (6.5%): '+money(row.tax_cents||0));
      line(isOwner?'Lease payout: '+money(row.owner_cents)+(row.payment_state==='paid'?'':' (payment pending)'):'Lease checkout total: '+money(row.total_cents));
      line('Access: '+date(row.checkin_at,row.time_zone)+' to '+date(row.checkout_at,row.time_zone));
      if(row.hunting_methods?.length)line('Hunting methods: '+row.hunting_methods.join(' and '));
      if(!row.deposit_cents){line('No cleaning deposit.');continue;}
      var labels={scheduled:'Scheduled; not held yet',authorizing:'Authorizing card',held:'Held; not charged',action_required:'Action needed — funds not secured',capturing:'Cleaning charge processing',captured:'Cleaning charged',releasing:'Releasing hold',released:'Released; bank timing varies',not_required:'Not required'};
      line('Cleaning deposit: '+money(row.deposit_cents)+' — '+(labels[row.state]||row.state));
      line('Cleaning claim deadline: '+date(row.claim_deadline,row.time_zone));
      if(row.claim_reason)line('Cleaning explanation: '+row.claim_reason);
      if(row.captured_cents)line('Cleaning charged: '+money(row.captured_cents)+(isOwner?' (100% to you)':''));
      if(row.last_error)line(row.last_error);
      (function(host,bookingId,payment){
        function button(label,fn){var b=document.createElement('button');b.textContent=label;b.type='button';b.style.cssText='margin-top:.6rem;padding:.5rem .8rem;cursor:pointer';b.onclick=async function(){b.disabled=true;try{await fn();}catch(e){alert(e.message);}finally{b.disabled=false;}};host.appendChild(b);}
        if(isOwner && payment.state==='held' && Date.now()>=Date.parse(payment.checkout_at) && Date.now()<Date.parse(payment.claim_deadline)){
          var form=document.createElement('div');
          var amount=document.createElement('input');amount.type='number';amount.min='0.01';amount.max=(payment.deposit_cents/100).toFixed(2);amount.step='0.01';amount.placeholder='Actual cleaning cost ($)';amount.setAttribute('aria-label','Actual cleaning cost in dollars');
          var reason=document.createElement('textarea');reason.placeholder='Describe why cleaning was needed';reason.maxLength=2000;reason.setAttribute('aria-label','Cleaning explanation');
          form.append(amount,reason);host.appendChild(form);
          button('Charge cleaning',async function(){
            var cents=Math.round(Number(amount.value)*100);
            if(!Number.isSafeInteger(cents)||cents<=0||cents>payment.deposit_cents||reason.value.trim().length<10)throw new Error('Enter an amount within the deposit and explain the cleaning needed.');
            if(!confirm('Charge '+money(cents)+' for this cleaning? Any remaining hold will be released.'))return;
            await call(sb,bookingId,'claim',{amount_cents:cents,reason:reason.value});await window.renderCleaningPayments(container,sb,isOwner);
          });
        }
        if(!isOwner && payment.state==='action_required' && Date.now()<Date.parse(payment.claim_deadline))button('Authorize cleaning hold',async function(){var r=await call(sb,bookingId,'authorize');if(r.url)window.location.assign(r.url);});
        button('Refresh payment status',async function(){await call(sb,bookingId,'status');await window.renderCleaningPayments(container,sb,isOwner);});
      })(node,id,row);
    }
  };
})();
