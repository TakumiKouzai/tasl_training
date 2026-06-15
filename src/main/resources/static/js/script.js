document.addEventListener('DOMContentLoaded', function () {

  /* -------------------------
     テーマ切替 / 永続化 (localStorage)
     ------------------------- */
  function applyTheme(theme) {
    document.body.classList.remove('theme-blue','theme-dark','theme-green');
    if (!theme || theme === 'blue') {
      document.body.classList.add('theme-blue');
    } else if (theme === 'dark') {
      document.body.classList.add('theme-dark');
    } else if (theme === 'green') {
      document.body.classList.add('theme-green');
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.add(prefersDark ? 'theme-dark' : 'theme-blue');
    }
  }

  const savedTheme = localStorage.getItem('taskpro:theme') || 'system';
  applyTheme(savedTheme);

  document.querySelectorAll('.theme-option').forEach(el => {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      const t = el.getAttribute('data-theme');
      localStorage.setItem('taskpro:theme', t);
      applyTheme(t);
    });
  });

  // システム設定が変わったら反映（system選択時のみ）
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      if (localStorage.getItem('taskpro:theme') === 'system') applyTheme('system');
    });
  }

  /* -------------------------
     既存: 削除確認モーダル
     ------------------------- */
  const deleteModalEl = document.getElementById('deleteConfirmModal');
  let selectedForm = null;
  if (deleteModalEl) {
    const deleteModal = new bootstrap.Modal(deleteModalEl);
    const titleEl = document.getElementById('deleteTaskTitle');

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const title = btn.getAttribute('data-task-title') || '（無題）';
        const formId = btn.getAttribute('data-form-id');
        selectedForm = document.getElementById(formId);
        if (titleEl) titleEl.textContent = title;
        deleteModal.show();
      });
    });

    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn?.addEventListener('click', () => {
      if (selectedForm) selectedForm.submit();
    });
  }

  /* -------------------------
     新規モーダルで自動フォーカス
     ------------------------- */
  const createModalEl = document.getElementById('createTaskModal');
  if (createModalEl) {
    createModalEl.addEventListener('shown.bs.modal', () => {
      const input = document.getElementById('createTitle');
      if (input) input.focus();
    });
  }

  /* -------------------------
      検索 & フィルタ（フロント側） + ハイライト
     ------------------------- */
  const input = document.getElementById('taskSearch');
  const filterPriority = document.getElementById('filterPriority');
  const filterStatus = document.getElementById('filterStatus');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

  function escapeHtml(s){ return String(s).replace(/[&"'<>]/g, function(c){ return {'&':'&amp;','"':'&quot;',"'":'&#39;','<':'&lt;','>':'&gt;'}[c]; }); }

  function highlightText(el, q){
    if(!el) return;
    const text = el.textContent || '';
    if(!q) { el.innerHTML = escapeHtml(text); return; }
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if(idx === -1){ el.innerHTML = escapeHtml(text); return; }
    const before = escapeHtml(text.slice(0, idx));
    const match = escapeHtml(text.slice(idx, idx + q.length));
    const after = escapeHtml(text.slice(idx + q.length));
    el.innerHTML = before + '<mark class="search-mark">' + match + '</mark>' + after;
  }

  function filterRows() {
    const q = input ? input.value.trim() : '';
    const p = filterPriority ? filterPriority.value : '';
    const s = filterStatus ? filterStatus.value : '';

    document.querySelectorAll('.task-table tbody tr').forEach(tr => {
      const titleEl = tr.querySelector('.task-title');
      if (!titleEl) return;
      const title = titleEl.textContent || '';
      const descEl = tr.querySelector('.task-description');
      const desc = descEl ? descEl.textContent || '' : '';
      const rowPriority = tr.dataset.priority || '';
      const rowStatus = tr.dataset.status || '';
      const matchesQuery = !q || title.toLowerCase().includes(q.toLowerCase()) || desc.toLowerCase().includes(q.toLowerCase());
      const matchesPriority = !p || rowPriority === p;
      const matchesStatus = !s || rowStatus === s;
      tr.style.display = (matchesQuery && matchesPriority && matchesStatus) ? '' : 'none';
      highlightText(titleEl, q);
      if(descEl) highlightText(descEl, q);
    });
  }

  function debounce(fn, ms){ let t; return function(...args){ clearTimeout(t); t = setTimeout(()=> fn.apply(this,args), ms); }; }
  input?.addEventListener('input', debounce(filterRows, 200));
  filterPriority?.addEventListener('change', filterRows);
  filterStatus?.addEventListener('change', filterRows);
  clearSearchBtn?.addEventListener('click', function(){ if(input){ input.value=''; filterRows(); input.focus(); } });

  /* -------------------------
     CSV出力（クライアント側） — 表示されている行を出力
     ------------------------- */
  const exportBtn = document.getElementById('exportCsvBtn');
  exportBtn?.addEventListener('click', () => {
    const rows = Array.from(document.querySelectorAll('.task-table tbody tr'))
      .filter(tr => tr.querySelector('.task-title') && tr.style.display !== 'none');

    if (rows.length === 0) {
      alert('出力対象のタスクがありません。');
      return;
    }

    const lines = [['ID','タイトル','説明','優先度','ステータス']];
    rows.forEach(tr => {
      const id = (tr.querySelector('td')?.textContent || '').trim();
      const title = (tr.querySelector('.task-title')?.textContent || '').trim();
      const desc = (tr.querySelector('.task-description')?.textContent || '').trim();
      const pr = tr.dataset.priority || '';
      const st = tr.dataset.status || (tr.querySelector('td:nth-child(4)')?.textContent || '').trim();
      lines.push([id, title, desc, pr, st]);
    });

    const csv = lines.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks-' + new Date().toISOString().slice(0,10) + '.csv';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  });

  /* -------------------------
     行の入場アニメ（既存）
     ------------------------- */
  const fadeItems = document.querySelectorAll('.fade-in-up');
  fadeItems.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 80 * (i % 8));
  });

  /* -------------------------
     ヒーローチャート描画（表示中のタスクをステータス別に集計）
     - 単一のセグメント化されたプログレスバーへ変更
     ------------------------- */
  function renderHeroChart(){
    const container = document.getElementById('heroChart');
    if(!container) return;
    const rows = Array.from(document.querySelectorAll('.task-table tbody tr'))
      .filter(tr => tr.querySelector('.task-title') && tr.style.display !== 'none');
    const counts = {"未着手":0, "進行中":0, "完了":0};
    rows.forEach(tr => {
      const s = tr.dataset.status || (tr.querySelector('td:nth-child(4)')?.textContent || '').trim();
      if(counts[s]!==undefined) counts[s]++;
    });

    const total = counts['未着手'] + counts['進行中'] + counts['完了'];
    const pctNot = total > 0 ? Math.round(counts['未着手'] * 100 / total) : 0;
    const pctIn = total > 0 ? Math.round(counts['進行中'] * 100 / total) : 0;
    const pctDone = total > 0 ? 100 - pctNot - pctIn : 0;

    // テキスト更新
    const heroTotalEl = document.getElementById('heroTotal');
    if(heroTotalEl) heroTotalEl.textContent = total;
    const cNot = document.getElementById('countNotStarted');
    const cIn = document.getElementById('countInProgress');
    const cDone = document.getElementById('countDone');
    if(cNot) cNot.textContent = counts['未着手'];
    if(cIn) cIn.textContent = counts['進行中'];
    if(cDone) cDone.textContent = counts['完了'];
    const statDoneEl = document.getElementById('statDone');
    if(statDoneEl) statDoneEl.textContent = counts['完了'];

    // プログレスバー更新（Bootstrapの進捗バー）
    const pgNot = document.getElementById('pgNotStarted');
    const pgIn = document.getElementById('pgInProgress');
    const pgDone = document.getElementById('pgDone');
    if(pgNot) { pgNot.style.width = pctNot + '%'; pgNot.setAttribute('aria-valuenow', pctNot); pgNot.setAttribute('title', `未着手 ${counts['未着手']} (${pctNot}%)`); }
    if(pgIn) { pgIn.style.width = pctIn + '%'; pgIn.setAttribute('aria-valuenow', pctIn); pgIn.setAttribute('title', `進行中 ${counts['進行中']} (${pctIn}%)`); }
    if(pgDone) { pgDone.style.width = pctDone + '%'; pgDone.setAttribute('aria-valuenow', pctDone); pgDone.setAttribute('title', `完了 ${counts['完了']} (${pctDone}%)`); }
  }
  // 初期描画
  renderHeroChart();
  // フィルタ・検索で表示が変わったら再描画
  [input, filterPriority, filterStatus].forEach(el => { if(el) el.addEventListener('input', renderHeroChart); if(el) el.addEventListener('change', renderHeroChart); });
});