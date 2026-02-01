/***** Firebase init *****/
const firebaseConfig = {
  apiKey: "AIzaSyCjNsWPJTH5f1O4YhM1jJ32UZXvNZfmXIA",
  authDomain: "memo-cards-v2.firebaseapp.com",
  projectId: "memo-cards-v2",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/***** DOM *****/
const card = document.getElementById("card");
const panel = document.getElementById("panel");
const sidebar = document.getElementById("sidebar");
const memoList = document.getElementById("memoList");

const randomBtn = document.getElementById("randomBtn");
const allBtn = document.getElementById("allBtn");
const addBtn = document.getElementById("addBtn");
const archiveBtn = document.getElementById("archiveBtn");

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

/***** Actions *****/
// Toggle sidebar visibility and change button color when clicked
let isSidebarVisible = false;

allBtn.onclick = async () => {
  isSidebarVisible = !isSidebarVisible; // Toggle sidebar visibility

  if (isSidebarVisible) {
    sidebar.style.display = "block"; // Show sidebar
    allBtn.style.backgroundColor = "#888"; // Change button color when activated
  } else {
    sidebar.style.display = "none"; // Hide sidebar
    allBtn.style.backgroundColor = ""; // Restore original button color
  }

  const memos = await getAllMemos();
  memoList.innerHTML = '';

  memos.forEach(memo => {
    const li = document.createElement("li");
    li.innerText = memo.content.substring(0, 50) + '...';
    li.onclick = () => showCard(memo);  // Show full content when clicked
    memoList.appendChild(li);
  });
};

// Display a random memo
randomBtn.onclick = async () => {
  const memos = await getAllMemos();
  if (!memos.length) {
    showCard("*(no memo yet)*");
    return;
  }
  const m = memos[Math.floor(Math.random() * memos.length)];
  showCard(m.content);
};

// Add a new memo
addBtn.onclick = () => {
  panel.innerHTML = `
    <textarea id="newMemo" placeholder="write markdown here..."></textarea>
    <button id="saveMemo">save</button>
  `;

  document.getElementById("saveMemo").onclick = async () => {
    const content = document.getElementById("newMemo").value.trim();
    if (!content) return;

    await db.collection("memos").add({
      content,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      key: "6d4a5fbb293f02d1ebfbb914b8eae6e7d9a0e5e6"
    });

    showCard(content);
  };
};

// Archive a memo
archiveBtn.onclick = async () => {
  const memos = await getAllMemos();
  panel.innerHTML = memos
    .filter(memo => memo.weight === 0.2)  // Display archived memos only
    .map(memo => `<div class="archived-item">${renderMarkdown(memo.content)}</div>`)
    .join("");
};

// Popup functionality for full memo view
function showCard(memo) {
  // Hide main buttons
  randomBtn.style.display = "none";
  allBtn.style.display = "none";
  addBtn.style.display = "none";

  // Display full view
  card.classList.add("full-view");
  card.innerHTML = renderMarkdown(memo.content);
  panel.innerHTML = `
    <button id="closePopup" class="close-popup">×</button>
    <button id="editBtn">Edit</button>
    <button id="archiveBtn">Archive</button>
    <button id="deleteBtn">Delete</button>
  `;

  const closePopup = document.getElementById("closePopup");
  closePopup.onclick = () => {
    // Close popup and restore main buttons
    card.classList.remove("full-view");
    panel.innerHTML = "";

    randomBtn.style.display = "inline-block";
    allBtn.style.display = "inline-block";
    addBtn.style.display = "inline-block";
  };

  // Handle edit, archive, and delete
  document.getElementById("editBtn").onclick = () => {
    panel.innerHTML = `
      <textarea id="editMemo">${memo.content}</textarea>
      <button id="saveEdit">Save</button>
    `;
    document.getElementById("saveEdit").onclick = async () => {
      const newContent = document.getElementById("editMemo").value.trim();
      await db.collection("memos").doc(memo.id).update({ content: newContent });
      showCard({ ...memo, content: newContent });
    };
  };

  document.getElementById("archiveBtn").onclick = async () => {
    await db.collection("memos").doc(memo.id).update({ weight: 0.2 });
  };

  document.getElementById("deleteBtn").onclick = async () => {
    if (confirm("Are you sure you want to delete this memo?")) {
      await db.collection("memos").doc(memo.id).delete();
      showCard("Memo deleted!");
    }
  };
};

