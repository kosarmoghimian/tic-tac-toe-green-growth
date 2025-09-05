// ساده‌تر شده — هوش‌مصنوعی منطقی اما قابل شکست
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const overlay = document.getElementById('overlay');
const overlayBox = document.getElementById('overlayBox');
const overlayTitle = document.getElementById('overlayTitle');
const overlaySubtitle = document.getElementById('overlaySubtitle');
const resetAllBtn = document.getElementById('resetAll');
const flowerImgs = Array.from(document.querySelectorAll('.flower .stage'));

let board = Array(9).fill(null); // null | 'X' | 'O'
let player = 'X';
let ai = 'O';
let gameOver = false;
let growth = 0; // 0..3

// ساخت برد و جانشین کردن سلول‌ها
function buildBoard(){
  boardEl.innerHTML = '';
  for(let i=0;i<9;i++){
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.addEventListener('click', ()=> onPlayerMove(i));
    boardEl.appendChild(cell);
  }
  updateStatus();
}

// بروزرسانی نمایش وضعیت
function updateStatus(text){
  if(text) statusEl.textContent = text;
  else statusEl.textContent = gameOver ? 'بازی تمام شد' : `نوبت شما (X)`;
}

// نمایش علامت در سلول
function render(){
  const cells = boardEl.querySelectorAll('.cell');
  cells.forEach((el, i)=>{
    el.textContent = board[i] || '';
    if(board[i]) el.classList.add('disabled'); else el.classList.remove('disabled');
  });
}

// بررسی برد/مساوی
const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function checkWinner(b){
  for(const [a,c,d] of wins){
    if(b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  if(b.every(Boolean)) return 'D';
  return null;
}

// در صورت برد/باخت/مساوی - اوورلی را نشان بده
function handleGameEnd(result){
  gameOver = true;
  if(result === player){
    // رشد گل
    if(growth < 3) growth++;
    updateFlower();
    if(growth >= 3){
      showOverlay('🎉 تبریک! رشد سبز کامل شد 🎉', 'کلیک کن تا بازی پاک شود و ادامه بده');
    } else {
      showOverlay('بردی! 👏', 'مرحله بعد (کلیک کن)');
    }
  } else if(result === ai){
    showOverlay('باختی! 😢', 'دوباره امتحان کن (کلیک کن)');
  } else { // مساوی
    showOverlay('مساوی شد! 🤝', 'دوباره امتحان کن (کلیک کن)');
  }
  updateStatus();
}

// آپدیت تصویر گل با فید
function updateFlower(){
  flowerImgs.forEach((img, idx)=>{
    img.classList.toggle('active', idx === growth);
  });
}

// بازیکن کلیک کرد
function onPlayerMove(idx){
  if(gameOver || board[idx]) return;
  board[idx] = player;
  render();
  const res = checkWinner(board);
  if(res) return handleGameEnd(res);
  // نوبت AI
  updateStatus('نوبت حریف (هوش مصنوعی)');
  // کمی تاخیر برای احساس طبیعی
  setTimeout(()=>{
    aiMove();
    render();
    const r2 = checkWinner(board);
    if(r2) return handleGameEnd(r2);
    updateStatus();
  }, 220);
}

// هوش مصنوعی سبک‌تر و قابل شکست‌تر
function aiMove(){
  // 1. اگر می‌تواند ببرد، بزند
  let move = findWinningMove(ai);
  if(move !== null){ board[move] = ai; return; }

  // 2. اگر باید بلاک کند، بلاک کند
  move = findWinningMove(player);
  if(move !== null){
    // کمی شانس برای خطا (تا سختی کمتر شود)
    if(Math.random() < 0.9){ board[move] = ai; return; }
  }

  // 3. اگر مرکز آزاد است، بیشتر وقت‌ها بگیرد
  if(!board[4]){
    if(Math.random() < 0.85){ board[4] = ai; return; }
  }

  // 4. انتخاب گوشه با احتمال بالاتر
  const corners = [0,2,6,8].filter(i=>!board[i]);
  if(corners.length){
    if(Math.random() < 0.9){
      board[randomPick(corners)] = ai; return;
    }
  }

  // 5. در غیر اینصورت یک خانه تصادفی (شامل کناره‌ها)
  const empties = board.map((v,i)=> v? null : i).filter(v=>v!==null);
  if(empties.length){
    board[randomPick(empties)] = ai;
  }
}

// پیدا کردن حرکت برد فوری برای مهرهٔ given
function findWinningMove(mark){
  for(let i=0;i<9;i++){
    if(!board[i]){
      board[i] = mark;
      const res = checkWinner(board);
      board[i] = null;
      if(res === mark) return i;
    }
  }
  return null;
}

function randomPick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

// اوورلی: متن و زیرمتن و کلیک برای پاک‌سازی
و شروع دور بعد
function showOverlay(title, subtitle){
  overlayTitle.textContent = title;
  overlaySubtitle.textContent = subtitle || '';
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden','false');

  // وقتی اوورلی کلیک شد یا با اینتر، بازی پاک می‌شود و دور بعد شروع می‌شود
  function proceed(){
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');
    startNextRound();
    // حذف هندلرها تا از دوبار اجرا جلوگیری شود
    overlayBox.removeEventListener('click', proceed);
    overlayBox.removeEventListener('keydown', onKey);
  }
  function onKey(e){
    if(e.key === 'Enter' || e.key === ' '){
      proceed();
    }
  }
  overlayBox.addEventListener('click', proceed);
  overlayBox.addEventListener('keydown', onKey);
}

// شروع دور بعد (پاک کردن برد اما نگه داشتن رشد)
function startNextRound(){
  board = Array(9).fill(null);
  gameOver = false;
  render();
  updateStatus('نوبت شما (X)');
}

// ریست کامل (شامل رشد گل)
function resetAll(){
  board = Array(9).fill(null);
  growth = 0;
  gameOver = false;
  updateFlower();
  render();
  updateStatus('نوبت شما (X)');
}

// دکمه‌ها و شروع اولیه
resetAllBtn.addEventListener('click', resetAll);

// ساخت و رندر اولیه
buildBoard();
render();
updateFlower();
