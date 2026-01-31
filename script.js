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

const randomBtn = document.getElementById("randomBtn");
const allBtn = document.getElementById("allBtn");
const addBtn = document.getElementById("addBtn");

/***** Helpers *****/
// 这是你的 Markdown 解析函数
function renderMarkdown(text) {
  return marked.parse(text);
}

function showCard(markdownText) {
  // 使用 innerHTML 来确保 Markdown 转换的 HTML 渲染正确
  card.innerHTML = renderMarkdown(markdownText);
  panel.innerHTML = "";
}

/***** Data *****/
async function getAllMemos() {
  const snap = await db.collection("memos").orderBy("created", "desc").get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/***** Actions *****/
randomBtn.onclick = async () => {
  const memos = await getAllMemos();
  if (!memos.length) {
    showCard("*(no memo yet)*");
    return;
  }
  const m = memos[Math.floor(Math.random() * memos.length)];
  showCard(m.content);
};

allBtn.onclick = async () => {
  const memos = await getAllMemos();
  panel.innerHTML = memos
    .map(m => `<div class="list-item">${renderMarkdown(m.content)}</div>`)
    .join("");
};

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

/***** Init *****/
randomBtn.click();
