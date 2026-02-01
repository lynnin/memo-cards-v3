/***** Firebase init *****/
const firebaseConfig = {
  apiKey: "AIzaSyCjNsWPJTH5f1O4YhM1jJ32UZXvNZfmXIA",
  authDomain: "memo-cards-v2.firebaseapp.com",
  projectId: "memo-cards-v2",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/***** DOM *****/
const card = document.getElementById("memoDisplay");
const panel = document.getElementById("panel");
const sidebar = document.getElementById("sidebar");
const memoList = document.getElementById("memoList");

const randomBtn = document.getElementById("randomBtn");
const allBtn = document.getElementById("allBtn");
const addBtn = document.getElementById("addBtn");
const archiveBtn = document.getElementById("archiveBtn");
const modal = document.getElementById("modalOverlay");
const modalInput = document.getElementById("modalInput");

let isSidebarVisible = false;
let memos = [];
let currentMemo = null;

/***** Helpers *****/
function renderMarkdown(text) {
  return marked.parse(text);
}

function showCard(markdownText) {
  card.innerHTML = renderMarkdown(markdownText);
  panel.innerHTML = "";
}

/***** Data *****/
async function getAllMemos() {
  const snap = await db.collection("memos").orderBy("created", "desc").get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function updateMemo(memoId, updatedFields) {
  await db.collection("memos").doc(memoId).update(updatedFields);
  renderList();
}

async function deleteMemo(memoId) {
  await db.collection("memos").doc(memoId).delete();
  renderList();
}

/***** Actions *****/
// Show random memo
randomBtn.onclick = async () => {
  const memos = await getAllMemos();
  const filteredMemos = memos.filter(memo => !memo.archived); // exclude archived
  if (!filteredMemos.length) {
    showCard("*(no memo yet)*");
    return;
  }
  const m = filteredMemos[Math.floor(Math.random() * filteredMemos.length)];
  showCard(m.content);
};

// Add new memo
addBtn.onclick = () => {
  currentMemo = null;
  modalInput.value = "";
  modal.classList.add("show");
};

// Show All Memos in sidebar (toggle sidebar)
allBtn.onclick = async () => {
  isSidebarVisible = !isSidebarVisible;
  sidebar.classList.toggle("show", isSidebarVisible);

  const memos = await getAllMemos();
  renderList(memos);
};

// Render list of all memos in sidebar
function renderList(memos) {
  memoList.innerHTML = "";
  memos.forEach(memo => {
    const div = document.createElement("div");
    div.className = "memo-item" + (memo.archived ? " archived" : "");
    div.textContent = memo.content.substring(0, 50) + '...';
    div.onclick = () => {
      currentMemo = memo;
      modalInput.value = memo.content;
      modal.classList.add("show");
    };
    memoList.appendChild(div);
  });
}

// Archive Memo
archiveBtn.onclick = async () => {
  if (currentMemo) {
    await updateMemo(currentMemo.id, { archived: true });
  }
  closeModal();
  renderList(await getAllMemos());
};

// Delete Memo
deleteBtn.onclick = async () => {
  if (currentMemo && confirm("Are you sure you want to delete this memo?")) {
    await deleteMemo(currentMemo.id);
  }
  closeModal();
};

// Save Memo (Create or Edit)
document.getElementById("saveBtn").onclick = async () => {
  const content = modalInput.value.trim();
  if (!content) return;

  if (currentMemo) {
    // Edit existing memo
    await updateMemo(currentMemo.id, { content });
  } else {
    // Add new memo
    await db.collection("memos").add({
      content,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      archived: false,
    });
  }

  closeModal();
  renderList(await getAllMemos());
};

// Close Modal
document.getElementById("closeBtn").onclick = closeModal;

function closeModal() {
  modal.classList.remove("show");
}

// Mouse Hover on Sidebar Area (for Desktop)
document.getElementById("sidebar-hover-zone").onmouseenter = () => {
  if (isSidebarVisible) sidebar.classList.add("show");
};

// Mobile Sidebar Toggle
sidebar.onmouseleave = () => {
  if (isSidebarVisible) sidebar.classList.remove("show");
};
