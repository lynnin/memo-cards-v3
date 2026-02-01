/***** Firebase init *****/
const firebaseConfig = {
  apiKey: "AIzaSyCjNsWPJTH5f1O4YhM1jJ32UZXvNZfmXIA",
  authDomain: "memo-cards-v2.firebaseapp.com",
  projectId: "memo-cards-v2",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/***** DOM *****/
let memos = [];
let currentMemo = null;
let sidebarOn = false;

const memoDisplay = document.getElementById("memoDisplay");
const memoList = document.getElementById("memoList");
const sidebar = document.getElementById("sidebar");
const modal = document.getElementById("modalOverlay");
const modalInput = document.getElementById("modalInput");

document.getElementById("randomBtn").onclick = () => {
  const pool = memos.filter(m => !m.archived);
  if (!pool.length) return;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  memoDisplay.textContent = pick.text;
};

document.getElementById("addBtn").onclick = () => {
  currentMemo = null;
  modalInput.value = "";
  modal.classList.add("show");
};

document.getElementById("allBtn").onclick = () => {
  sidebarOn = !sidebarOn;
  sidebar.classList.toggle("show", sidebarOn);
};

document.getElementById("sidebar-hover-zone").onmouseenter = () => {
  if (sidebarOn) sidebar.classList.add("show");
};

sidebar.onmouseleave = () => {
  if (sidebarOn) sidebar.classList.remove("show");
};

document.getElementById("saveBtn").onclick = () => {
  if (currentMemo) {
    currentMemo.text = modalInput.value;
  } else {
    memos.push({ text: modalInput.value, archived: false });
  }
  closeModal();
  renderList();
};

document.getElementById("archiveBtn").onclick = () => {
  if (currentMemo) {
    currentMemo.archived = true;
  }
  closeModal();
  renderList();
};

document.getElementById("deleteBtn").onclick = () => {
  memos = memos.filter(m => m !== currentMemo);
  closeModal();
  renderList();
};

document.getElementById("closeBtn").onclick = closeModal;

function closeModal() {
  modal.classList.remove("show");
}

function renderList() {
  memoList.innerHTML = "";
  memos.forEach(m => {
    const div = document.createElement("div");
    div.className = "memo-item" + (m.archived ? " archived" : "");
    div.textContent = m.text;
    div.onclick = () => {
      currentMemo = m;
      modalInput.value = m.text;
      modal.classList.add("show");
    };
    memoList.appendChild(div);
  });
}


