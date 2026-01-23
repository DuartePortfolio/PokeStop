(function(){
  // Simple reusable modal component (injects styles + markup)
  const style = document.createElement('style');
  style.textContent = `
    :root{--pokeball-red:#E3350D;--modal-bg:rgba(2,6,23,0.6);--modal-white:#fff}
    .global-modal{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:2000}
    .global-modal.hidden{display:none}
    .global-modal .backdrop{position:absolute;inset:0;background:var(--modal-bg)}
    .global-modal .modal-box{position:relative;z-index:2;background:linear-gradient(135deg,#ffffff,#f8f9fb);min-width:320px;max-width:720px;border-radius:12px;padding:18px;box-shadow:0 10px 30px rgba(2,6,23,0.12);color:#0b1220}
    .global-modal .modal-title{font-weight:800;margin-bottom:8px}
    .global-modal .modal-message{margin-bottom:12px}
    .global-modal .modal-input{width:100%;padding:8px;border-radius:8px;border:1px solid #e6eef7;margin-bottom:12px}
    .global-modal .modal-actions{display:flex;gap:8px;justify-content:flex-end}
    .global-modal .btn{padding:8px 12px;border-radius:10px;border:none;background:var(--pokeball-red);color:white;cursor:pointer}
    .global-modal .btn.secondary{background:#eef2f6;color:#111}

    /* Toast notifications */
    .toast-container{position:fixed;top:18px;right:18px;z-index:2200;display:flex;flex-direction:column;gap:10px;align-items:flex-end}
    .toast{min-width:220px;max-width:360px;padding:10px 14px;border-radius:10px;box-shadow:0 8px 24px rgba(2,6,23,0.08);background:linear-gradient(135deg,#ffffff,#fff7f7);border:1px solid rgba(0,0,0,0.06);color:#0b1220;transform:translateX(120%);opacity:0;transition:transform 320ms cubic-bezier(.2,.9,.2,1),opacity 320ms ease}
    .toast.success{border-color:#ef4444;background:linear-gradient(135deg,#fff7f7,#fff)}
    .toast.info{border-color:#d1d5db;background:linear-gradient(135deg,#ffffff,#f8f9fb)}
    .toast.show{transform:translateX(0);opacity:1}
    .toast.hide{transform:translateX(120%);opacity:0}
  `;
  document.head.appendChild(style);

  const modal = document.createElement('div');
  modal.className = 'global-modal hidden';
  modal.setAttribute('role','dialog');
  modal.setAttribute('aria-modal','true');
  modal.innerHTML = `
    <div class="backdrop"></div>
    <div class="modal-box" tabindex="-1">
      <div class="modal-title" id="modalTitle"></div>
      <div class="modal-message" id="modalMessage"></div>
      <input class="modal-input" id="modalInput" style="display:none" />
      <div class="modal-actions">
        <button class="btn secondary" id="modalCancel">Cancel</button>
        <button class="btn" id="modalOk">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const titleEl = modal.querySelector('#modalTitle');
  const messageEl = modal.querySelector('#modalMessage');
  const inputEl = modal.querySelector('#modalInput');
  const okBtn = modal.querySelector('#modalOk');
  const cancelBtn = modal.querySelector('#modalCancel');
  const backdrop = modal.querySelector('.backdrop');

  let resolver = null;
  function hide(){ modal.classList.add('hidden'); inputEl.style.display='none'; messageEl.style.display='block'; titleEl.textContent=''; messageEl.textContent=''; if(resolver) resolver = null; }

  function show(opts){
    return new Promise((resolve)=>{
      resolver = resolve;
      titleEl.textContent = opts.title || '';
      messageEl.textContent = opts.message || '';
      if(opts.input){ inputEl.style.display='block'; inputEl.value = opts.default || ''; setTimeout(()=>inputEl.focus(), 10); } else { inputEl.style.display='none'; }
      modal.classList.remove('hidden');
      setTimeout(()=>{
        (opts.input ? inputEl : okBtn).focus();
      }, 10);

      function cleanup(){
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        backdrop.removeEventListener('click', onCancel);
        document.removeEventListener('keydown', onKey);
      }
      function onOk(){
        cleanup(); modal.classList.add('hidden');
        if(opts.input) resolve(inputEl.value); else resolve(true);
      }
      function onCancel(){
        cleanup(); modal.classList.add('hidden');
        if(opts.input) resolve(null); else resolve(false);
      }
      function onKey(e){ if(e.key === 'Escape') onCancel(); if(e.key === 'Enter' && (document.activeElement === inputEl || document.activeElement === okBtn)) onOk(); }

      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
      backdrop.addEventListener('click', onCancel);
      document.addEventListener('keydown', onKey);
    });
  }

  window.showAlert = async function(msg, title){ await show({ title: title || '', message: msg, input: false, showCancel: false }); };
  window.showConfirm = async function(msg, title){ const res = await show({ title: title || '', message: msg, input: false, showCancel: true }); return !!res; };
  window.showPrompt = async function(msg, defaultValue, title){ const res = await show({ title: title || '', message: msg, input: true, default: defaultValue }); return res; };

  // Toast container
  const toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);

  // notify(message, { type = 'info'|'success'|'error', duration = 3000 })
  window.notify = function(message, opts = {}){
    const { type = 'info', duration = 3000 } = opts;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = message;

    // insert at top so newest is first, older slide down
    toastContainer.insertBefore(t, toastContainer.firstChild);

    // Force layout then show
    requestAnimationFrame(()=>{ t.classList.add('show'); });

    let hideTimeout = setTimeout(()=> startHide(), duration);

    function startHide(){
      t.classList.remove('show');
      t.classList.add('hide');
      t.addEventListener('transitionend', onRemoved);
    }
    function onRemoved(){
      t.removeEventListener('transitionend', onRemoved);
      if(t.parentNode) t.parentNode.removeChild(t);
    }

    // allow click to dismiss early
    t.addEventListener('click', ()=>{
      clearTimeout(hideTimeout);
      startHide();
    });

    return {
      dismiss(){ clearTimeout(hideTimeout); startHide(); }
    };
  };
})();