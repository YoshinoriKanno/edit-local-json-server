// APIのベースURL
const apiUrl = 'http://localhost:3000/posts';

// DOM要素の取得
const postsContainer = document.getElementById('posts-container');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const postIdInput = document.getElementById('post-id');
const submitButton = document.querySelector('button[type="submit"]');

// ページ読み込み時に投稿を取得
document.addEventListener('DOMContentLoaded', fetchPosts);

// フォームのサブミットイベントのハンドラーを設定
document.getElementById('new-post-form').addEventListener('submit', handleFormSubmit);

// 投稿を取得する関数
function fetchPosts() {
  try {
    // Fetchを利用してAPIからデータを取得
    fetch(apiUrl)
      .then(response => response.json())
      .then(displayPosts)
      .catch(handleError);
  } catch (error) {
    console.error('投稿の取得エラー:', error);
  }
}

// 取得した投稿を表示する関数
function displayPosts(posts) {
  if (posts.length === 0) {
    // 投稿がない場合はメッセージを表示
    postsContainer.innerHTML = '<p>投稿がありません</p>';
    return;
  }

  // 投稿のリストを作成し、HTMLに追加
  const postList = posts
    .map(post => `
            <div>
              <strong>Title:</strong> ${post.title || 'N/A'}<br>
              <strong>Author:</strong> ${post.author || 'N/A'}<br>
              <strong>ID:</strong> ${post.id || 'N/A'}<br>
              <button onclick="deletePost(${post.id})">Delete</button>
              <button onclick="editPost(${post.id})">Edit</button>
            </div><br>
          `)
    .join('');

  postsContainer.innerHTML = postList;
}

// フォームのサブミットイベントのハンドラー
function handleFormSubmit(event) {
  event.preventDefault();

  // 入力値を取得
  const postData = {
    title: titleInput.value,
    author: authorInput.value,
  };

  // 投稿IDがあれば更新、なければ新規作成
  if (postIdInput.value) {
    updatePost(postIdInput.value, postData);
  } else {
    createPost(postData);
  }

  // フォームをクリア
  clearForm();
  submitButton.innerText = 'Create Post';
}

// 投稿の編集
function editPost(postId) {
  fetch(`${apiUrl}/${postId}`)
    .then(response => response.json())
    .then(post => {
      // 取得した投稿の情報をフォームにセット
      titleInput.value = post.title || '';
      authorInput.value = post.author || '';
      postIdInput.value = post.id;
      submitButton.innerText = 'Update Post';
    })
    .catch(error => {
      console.error(`ID ${postId}の投稿の取得エラー:`, error);
    });
}

// 新しい投稿を作成
async function createPost(newPost) {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPost),
    });
    const data = await response.json();
    fetchPosts();
  } catch (error) {
    console.error('投稿の作成エラー:', error);
  }
}

// 投稿を更新
async function updatePost(postId, updatedPost) {
  try {
    const response = await fetch(`${apiUrl}/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedPost),
    });
    const data = await response.json();
    fetchPosts();
  } catch (error) {
    console.error(`ID ${postId}の投稿の更新エラー:`, error);
  }
}

// 投稿を削除
async function deletePost(postId) {
  try {
    const response = await fetch(`${apiUrl}/${postId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    fetchPosts();
  } catch (error) {
    console.error(`ID ${postId}の投稿の削除エラー:`, error);
  }
}

// フォームをクリアする関数
function clearForm() {
  titleInput.value = '';
  authorInput.value = '';
  postIdInput.value = '';
}

// エラーが発生した場合の処理
function handleError(error) {
  console.error('エラーが発生しました:', error);
}
