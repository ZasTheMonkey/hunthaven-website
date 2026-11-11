/* Shared sandbox navigation. Does not persist location or account data. */
(function(){
function init(){
 if(document.getElementById('lw-site-menu'))return;
 const nav=document.createElement('div');nav.id='lw-site-menu';
 nav.innerHTML='<button id="lw-site-menu-toggle" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="lw-site-menu-panel"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>'+
 '<nav id="lw-site-menu-panel" aria-label="LeaseWild site navigation" hidden>'+
 '<a href="/index.html">Home</a><a href="/listings.html">Browse land</a><a href="/index.html?activity=hunt#listings-section">Hunting</a><a href="/index.html?activity=fish#listings-section">Fishing</a>'+
 '<a href="/outfitters.html">Outfitters</a><a href="/list-your-land.html">List your land</a><a href="/about.html">About LeaseWild</a>'+
 '<div class="lw-menu-account" id="lw-menu-account"><span class="lw-menu-heading">Account</span><a href="/guest-portal.html">Hunter account / Sign in</a><a href="/landowner-portal.html">Landowner account / Sign in</a><a href="/outfitter-portal.html">Outfitter account / Sign in</a></div>'+
 '<div id="lw-menu-signed-in" hidden><span class="lw-menu-heading">Your account</span><a href="/guest-portal.html?tab=bookings">My bookings</a><a href="/guest-portal.html?tab=messages">Messages</a><a href="/guest-portal.html?tab=map">My live map</a><a href="/landowner-portal.html">Manage my listings</a></div>'+
 '</nav>';
 document.body.appendChild(nav);
 const btn=document.getElementById('lw-site-menu-toggle'),panel=document.getElementById('lw-site-menu-panel');
 function close(){panel.hidden=true;btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-label','Open navigation menu')}
 btn.addEventListener('click',function(){const open=panel.hidden;panel.hidden=!open;btn.setAttribute('aria-expanded',String(open));btn.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu')});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'){close();btn.focus()}});
 document.addEventListener('click',function(e){if(!nav.contains(e.target))close()});
 // Resolve the same sandbox session on every route, including portals using SB_URL/SB_ANON.
 // The prior implementation relied on globals absent from portal pages and silently showed Sign in.
 async function checkSession(){
  try{
   if(typeof supabase==='undefined'||typeof supabase.createClient!=='function')return;
   const url='https://kbkdfpmlyggfijkyjxoi.supabase.co';
   const key='sb_publishable_Q_jURQQCTqad2iY5KXXEew_-s70fPLm';
   const client=(typeof sb!=='undefined'&&sb&&sb.auth)?sb:supabase.createClient(url,key);
   const result=await client.auth.getSession();
   const signedIn=!!(result.data&&result.data.session);
   document.getElementById('lw-menu-signed-in').hidden=!signedIn;
   const account=document.getElementById('lw-menu-account');
   account.querySelector('.lw-menu-heading').textContent=signedIn?'Switch account area':'Account';
   account.querySelectorAll('a').forEach(function(a){
    a.textContent=a.textContent.replace(' / Sign in','');
    if(!signedIn)a.textContent+=' / Sign in';
   });
   if(!nav.dataset.authListener){
    nav.dataset.authListener='true';
    client.auth.onAuthStateChange(function(){setTimeout(checkSession,0)});
   }
  }catch(e){document.getElementById('lw-menu-signed-in').hidden=true}
 }
 checkSession();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();