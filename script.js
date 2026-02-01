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
// 显示 memo 列表（all）
allBtn.onclick = async () => {
  sidebar.style.display = "block";  // 显示侧边栏
  const memos = await getAllMemos();
  memoList.innerHTML = '';

  memos.forEach(memo => {
    const li = document.createElement("li");
    li.innerText = memo.content.substring(0, 50) + '...';
    li.onclick = () => showCard(memo.content);
    memoList.appendChild(li);
  });
};

// 随机显示一个 memo
randomBtn.onclick = async () => {
  const memos = await getAllMemos();
  if (!memos.length) {
    showCard("*(no memo yet)*");
    return;
  }
  const m = memos[Math.floor(Math.random() * memos.length)];
  showCard(m.content);
};

// 添加新 memo
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

// 归档按钮（低概率显示）
archiveBtn.onclick = async () => {
  const memos = await getAllMemos();
  panel.innerHTML = memos
    .filter(memo => memo.weight === 0.2)  // 只显示已归档的 memo
    .map(memo => `<div class="archived-item">${renderMarkdown(memo.content)}</div>`)
    .join("");
};

function showCard(markdownText) {
  card.innerHTML = renderMarkdown(markdownText);
  panel.innerHTML = `
    <button id="editBtn">Edit</button>
    <button id="archiveBtn">Archive</button>
    <button id="deleteBtn">Delete</button>
  `;
  
  const editBtn = document.getElementById("editBtn");
  const archiveBtn = document.getElementById("archiveBtn");
  const deleteBtn = document.getElementById("deleteBtn");

  editBtn.onclick = () => {
    panel.innerHTML = `
      <textarea id="editMemo">${markdownText}</textarea>
      <button id="saveEdit">Save</button>
    `;
    document.getElementById("saveEdit").onclick = async () => {
      const newContent = document.getElementById("editMemo").value.trim();
      await db.collection("memos").doc(memo.id).update({
        content: newContent,
      });
      showCard(newContent);
    };
  };

  // 归档和删除按钮逻辑
  archiveBtn.onclick = async () => {
    await db.collection("memos").doc(memo.id).update({
      weight: 0.2  // 归档：降低随机显示概率
    });
  };

  deleteBtn.onclick = async () => {
    if (confirm("Are you sure you want to delete this memo?")) {
      await db.collection("memos").doc(memo.id).delete();
      showCard("Memo deleted!");
    }
  };
}
