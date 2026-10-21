const $ = s => document.querySelector(s);
const KEY = 'libraryreg_members';
const AK = 'libraryreg_auth';

const seed = [
  {
    id: 1,
    nama: 'Aulia Rahman',
    nomor: '5025251001',
    prodi: 'Teknik Informatika',
    alamat: 'Surabaya',
    telp: '081234567890',
    email: 'aulia@student.its.ac.id',
    jenis: 'Mahasiswa',
  },
  {
    id: 2,
    nama: 'Dr. Budi Santoso',
    nomor: '197501012000121001',
    prodi: 'Sistem Informasi',
    alamat: 'Sidoarjo',
    telp: '082233445566',
    email: 'budi@its.ac.id',
    jenis: 'Dosen',
  },
  {
    id: 3,
    nama: 'Citra Lestari',
    nomor: '198803152010122002',
    prodi: 'Administrasi Akademik',
    alamat: 'Gresik',
    telp: '085612345678',
    email: 'citra@its.ac.id',
    jenis: 'Tenaga Kependidikan',
  },
];

let mem = seed.slice();
let authed = false;

try {
  const r = localStorage.getItem(KEY);
  if (r) mem = JSON.parse(r);
  else localStorage.setItem(KEY, JSON.stringify(seed));
  authed = localStorage.getItem(AK) === '1';
} catch (e) {}

const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(mem));
  } catch (e) {}
};

const esc = s =>
  String(s).replace(/[&<>"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
  }[c]));

function toast(m, err) {
  const t = document.createElement('div');
  t.className = 't' + (err ? ' e' : '');
  t.textContent = m;
  $('#toast').append(t);
  setTimeout(() => t.remove(), 3200);
}

/* routing */
const routes = ['beranda', 'tentang', 'layanan', 'anggota', 'daftar', 'login'];

function route() {
  let r = location.hash.slice(1);
  if (!routes.includes(r)) r = 'beranda';

  routes.forEach(x => $('#v-' + x).classList.toggle('on', x === r));
  document
    .querySelectorAll('.links a')
    .forEach(a => a.classList.toggle('active', a.dataset.r === r));
  $('#links').classList.remove('open');
  window.scrollTo(0, 0);

  if (r === 'anggota') render();
  if (r === 'beranda') count();
}

addEventListener('hashchange', route);
$('#burger').onclick = () => $('#links').classList.toggle('open');

function count() {
  $('#cm').textContent = mem.length;
  const el = $('#cnt');
  let n = 0;
  const iv = setInterval(() => {
    n = Math.min(10000, n + 400);
    el.textContent = n;
    if (n >= 10000) clearInterval(iv);
  }, 25);
}

/* form */
const JENIS = ['Mahasiswa', 'Dosen', 'Tenaga Kependidikan'];

function fields(p, m = {}) {
  return `<div class="fr">
<div><label for="${p}nama">Nama lengkap *</label><input id="${p}nama" value="${esc(m.nama || '')}"><div class="fe"></div></div>
<div><label for="${p}nomor">NIM/NIP *</label><input id="${p}nomor" inputmode="numeric" value="${esc(m.nomor || '')}"><div class="fe"></div></div>
<div><label for="${p}prodi">Program studi *</label><input id="${p}prodi" value="${esc(m.prodi || '')}"><div class="fe"></div></div>
<div><label for="${p}telp">Nomor telepon *</label><input id="${p}telp" inputmode="tel" value="${esc(m.telp || '')}"><div class="fe"></div></div>
<div><label for="${p}email">Email *</label><input id="${p}email" type="email" value="${esc(m.email || '')}"><div class="fe"></div></div>
<div><label for="${p}jenis">Jenis keanggotaan *</label><select id="${p}jenis"><option value="">Pilih…</option>${JENIS.map(j => `<option${m.jenis === j ? ' selected' : ''}>${j}</option>`).join('')}</select><div class="fe"></div></div></div>
<label for="${p}alamat">Alamat *</label><textarea id="${p}alamat" rows="2">${esc(m.alamat || '')}</textarea><div class="fe"></div>`;
}

function validate(p, skipId) {
  let ok = true;
  const v = {};

  ['nama', 'nomor', 'prodi', 'alamat', 'telp', 'email', 'jenis'].forEach(k => {
    const el = $('#' + p + k);
    const fe = el.nextElementSibling;
    let msg = '';
    v[k] = el.value.trim();

    if (!v[k]) msg = 'Wajib diisi.';
    else if (k === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v[k])) {
      msg = 'Format email tidak valid.';
    } else if (k === 'telp' && !/^\+?[0-9]{8,15}$/.test(v[k])) {
      msg = 'Nomor telepon 8–15 digit.';
    } else if (k === 'nomor' && mem.some(m => m.nomor === v[k] && m.id !== skipId)) {
      msg = 'NIM/NIP sudah terdaftar.';
    }

    fe.textContent = msg;
    el.classList.toggle('inv', !!msg);
    if (msg) ok = false;
  });

  return ok ? v : null;
}

$('#rf').innerHTML =
  fields('r') +
  '<p><button class="btn" type="submit">Daftar</button> <button class="btn o" type="reset">Reset</button></p>';

$('#rf').addEventListener('submit', e => {
  e.preventDefault();
  const v = validate('r');
  if (!v) {
    toast('Periksa kembali isian formulir.', 1);
    return;
  }

  mem.push({ id: Date.now(), ...v });
  save();
  e.target.reset();
  toast('Pendaftaran berhasil. Selamat bergabung!');
  location.hash = '#anggota';
});

$('#rf').addEventListener('reset', () =>
  document.querySelectorAll('#rf .fe').forEach(f => (f.textContent = ''))
);

/* table */
function render() {
  const q = $('#q').value.trim().toLowerCase();
  const rows = mem.filter(
    m => m.nama.toLowerCase().includes(q) || m.nomor.toLowerCase().includes(q)
  );

  $('#tb').innerHTML = rows.length
    ? rows
        .map(
          (m, i) =>
            `<tr><td>${i + 1}</td><td>${esc(m.nama)}</td><td>${esc(m.nomor)}</td><td>${esc(m.prodi)}</td><td><span class="tag">${esc(m.jenis)}</span></td><td><button class="btn sm o" data-a="d" data-id="${m.id}">Detail</button> <button class="btn sm" data-a="e" data-id="${m.id}">Edit</button> <button class="btn sm d" data-a="h" data-id="${m.id}">Hapus</button></td></tr>`
        )
        .join('')
    : '<tr><td colspan="6">Tidak ada anggota ditemukan.</td></tr>';

  $('#auth').textContent = authed
    ? 'Petugas aktif'
    : 'Mode pengunjung: login untuk edit/hapus';
}

$('#q').oninput = render;

const dlg = $('#dlg');

$('#tb').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;

  const m = mem.find(x => x.id == b.dataset.id);
  if (!m) return;

  if (b.dataset.a === 'd') {
    dlg.innerHTML = `<h3 style="font-size:1.3rem;margin-bottom:14px">Detail Anggota</h3><div class="dl">${[['Nama', m.nama], ['NIM/NIP', m.nomor], ['Prodi', m.prodi], ['Alamat', m.alamat], ['Telepon', m.telp], ['Email', m.email], ['Jenis', m.jenis]].map(([k, v]) => `<b>${k}</b><span>${esc(v)}</span>`).join('')}</div><div class="acts"><button class="btn o" onclick="dlg.close()">Tutup</button></div>`;
    dlg.showModal();
    return;
  }

  if (!authed) {
    toast('Login petugas diperlukan untuk aksi ini.', 1);
    location.hash = '#login';
    return;
  }

  if (b.dataset.a === 'e') {
    dlg.innerHTML = `<h3 style="font-size:1.3rem">Edit Anggota</h3><form id="ef" novalidate>${fields('e', m)}<div class="acts"><button type="button" class="btn o" onclick="dlg.close()">Batal</button><button class="btn">Simpan</button></div></form>`;
    dlg.showModal();
    $('#ef').onsubmit = ev => {
      ev.preventDefault();
      const v = validate('e', m.id);
      if (!v) {
        toast('Periksa kembali isian.', 1);
        return;
      }

      Object.assign(m, v);
      save();
      dlg.close();
      render();
      toast('Data anggota diperbarui.');
    };
  } else {
    dlg.innerHTML = `<h3 style="font-size:1.3rem">Hapus Anggota?</h3><p>Data <b>${esc(m.nama)}</b> akan dihapus permanen.</p><div class="acts"><button class="btn o" onclick="dlg.close()">Batal</button><button class="btn d" id="yes">Ya, hapus</button></div>`;
    dlg.showModal();
    $('#yes').onclick = () => {
      mem = mem.filter(x => x.id !== m.id);
      save();
      dlg.close();
      render();
      toast('Anggota berhasil dihapus.');
    };
  }
});

/* login */
function authUI() {
  $('#loginLink').textContent = authed ? 'Logout (Petugas)' : 'Login Petugas';
}

$('#lf').addEventListener('submit', e => {
  e.preventDefault();
  if (authed) {
    authed = false;
    try {
      localStorage.setItem(AK, '0');
    } catch (x) {}
    authUI();
    toast('Anda telah logout.');
    return;
  }

  if ($('#lu').value.trim() === 'petugas' && $('#lp').value === 'admin123') {
    authed = true;
    try {
      localStorage.setItem(AK, '1');
    } catch (x) {}
    $('#le').textContent = '';
    authUI();
    toast('Login berhasil.');
    location.hash = '#anggota';
  } else {
    $('#le').textContent = 'Username atau password salah.';
    toast('Login gagal.', 1);
  }
});

$('#loginLink').addEventListener('click', e => {
  if (authed) {
    e.preventDefault();
    authed = false;
    try {
      localStorage.setItem(AK, '0');
    } catch (x) {}
    authUI();
    toast('Anda telah logout.');
    route();
  }
});

authUI();
route();
