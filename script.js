// APIのベースURL
const apiUrl = 'http://localhost:3000/posts';
const commentsUrl = 'http://localhost:3000/comments';

// DOM要素の取得
const postsContainer = document.getElementById('posts-container');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const postIdInput = document.getElementById('post-id');
const submitButton = document.querySelector('button[type="submit"]');
const newPostForm = document.getElementById('new-post-form');

// ページ読み込み時に投稿を取得
document.addEventListener('DOMContentLoaded', fetchAndDisplayPosts);

// フォームのサブミットイベントのハンドラーを設定
newPostForm.addEventListener('submit', handleFormSubmit);

// データを取得して投稿を表示する関数
async function fetchAndDisplayPosts() {
  try {
    const posts = await fetchData(apiUrl);
    const comments = await fetchData(commentsUrl);
    displayPosts(posts, comments);
  } catch (error) {
    handleError('投稿の取得エラー:', error);
  }
}

// 投稿を表示する関数
function displayPosts(posts, comments) {
  if (posts.length === 0) {
    postsContainer.innerHTML = '<p>投稿がありません</p>';
    return;
  }

  const postList = posts.map(post => {
    const postComments = comments.filter(comment => comment.postId === post.id.toString());
    const commentsList = postComments.map(comment => `
      <li>
        ${comment.text}
        <button onclick="deleteComment(${comment.id}, ${post.id})">Delete Comment</button>
      </li>`).join('');

    return `
      <div>
        <strong>Title:</strong> ${post.title || 'N/A'}<br>
        <strong>Author:</strong> ${post.author || 'N/A'}<br>
        <strong>ID:</strong> ${post.id || 'N/A'}<br>
        <hr>
        <h3>Comments</h3>
        <ul>${commentsList}</ul>
        <button onclick="deletePost(${post.id})">Delete</button>
        <button onclick="editPost(${post.id})">Edit</button>
        <div>
          <label for="new-comment-${post.id}">New Comment:</label>
          <input type="text" id="new-comment-${post.id}" placeholder="Add a new comment">
          <button onclick="addCommentToPost(${post.id})">Add Comment</button>
        </div>
      </div>
      <hr>
      <hr>`;
  }).join('');
  postsContainer.innerHTML = postList;
}

// コメントの削除
async function deleteComment(commentId, postId) {
  try {
    await fetchAndDelete(`${commentsUrl}/${commentId}`);
  } catch (error) {
    handleError(`ID ${commentId}のコメントの削除エラー:`, error);
  }
}

// フォームのサブミットイベントのハンドラー
function handleFormSubmit(event) {
  event.preventDefault();
  const postData = {
    title: titleInput.value,
    author: authorInput.value,
  };

  if (postIdInput.value) {
    updatePost(postIdInput.value, postData);
  } else {
    createPost(postData);
  }

  clearForm();
  submitButton.innerText = 'Create Post';
}

// 投稿の編集
async function editPost(postId) {
  try {
    const post = await fetchAndGetData(`${apiUrl}/${postId}`);
    setFormValues(post);
    setUpdateButtonHandler(postId);
  } catch (error) {
    handleError(`ID ${postId}の投稿の取得エラー:`, error);
  }
}

// 新しい投稿を作成
async function createPost(newPost) {
  try {
    await fetchAndPost(apiUrl, newPost);
  } catch (error) {
    handleError('投稿の作成エラー:', error);
  }
}

// 投稿を更新
async function updatePost(postId, updatedPost) {
  try {
    await fetchAndPut(`${apiUrl}/${postId}`, updatedPost);
  } catch (error) {
    handleError(`ID ${postId}の投稿の更新エラー:`, error);
  }
}

// 投稿を削除
async function deletePost(postId) {
  try {
    await fetchAndDelete(`${apiUrl}/${postId}`);
  } catch (error) {
    handleError(`ID ${postId}の投稿の削除エラー:`, error);
  }
}

// コメントの追加
async function addCommentToPost(postId) {
  const textInput = document.getElementById(`new-comment-${postId}`);
  const text = textInput.value.trim();

  if (text) {
    try {
      await fetchAndPost(commentsUrl, { text, postId: postId.toString() });
    } catch (error) {
      handleError('コメントの追加エラー:', error);
    }
  }
}

// フォームをクリアする関数
function clearForm() {
  titleInput.value = '';
  authorInput.value = '';
  postIdInput.value = '';
}

// エラーが発生した場合の処理
function handleError(message, error) {
  console.error(`${message}`, error);
}

// 共通のデータ取得関数
async function fetchData(url) {
  try {
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    handleError(`データの取得エラー (${url}):`, error);
    throw error;
  }
}

// 共通のデータ削除関数
async function fetchAndDelete(url) {
  await fetch(url, { method: 'DELETE' });
  fetchAndDisplayPosts();
}

// 共通のデータ取得関数（データを返す）
async function fetchAndGetData(url) {
  const response = await fetch(url);
  return response.json();
}

// 共通のデータ更新関数
async function fetchAndPut(url, data) {
  await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  fetchAndDisplayPosts();
}

// 共通のデータ作成関数
async function fetchAndPost(url, data) {
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  fetchAndDisplayPosts();
}

// フォームに値をセットする関数
function setFormValues(post) {
  titleInput.value = post.title || '';
  authorInput.value = post.author || '';
  postIdInput.value = post.id;
  submitButton.innerText = 'Update Post';
}

// Updateボタンのハンドラーをセットする関数
function setUpdateButtonHandler(postId) {
  submitButton.onclick = async () => {
    const updatedPostData = {
      title: titleInput.value,
      author: authorInput.value,
    };

    try {
      await fetchAndPut(`${apiUrl}/${postId}`, updatedPostData);
      clearForm();
      submitButton.innerText = 'Create Post';
      submitButton.onclick = handleFormSubmit;
    } catch (error) {
      handleError(`ID ${postId}の投稿の更新エラー:`, error);
    }
  };
}
