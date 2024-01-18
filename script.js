// APIのベースURL
const apiUrl = 'http://localhost:3000/posts';

// DOM要素の取得
const postsContainer = document.getElementById('posts-container');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const postIdInput = document.getElementById('post-id');
const submitButton = document.querySelector('button[type="submit"]');
let comments = []; // 初期値を空の配列に設定


// ページ読み込み時に投稿を取得
document.addEventListener('DOMContentLoaded', fetchPosts);

// フォームのサブミットイベントのハンドラーを設定
document.getElementById('new-post-form').addEventListener('submit', handleFormSubmit);

// 投稿を取得する関数
async function fetchPosts() {
  try {
    // Fetchを利用してAPIから投稿データを取得
    const postsResponse = await fetch(apiUrl);
    const posts = await postsResponse.json();

    // 投稿データを取得したら、コメントデータを取得
    const commentsResponse = await fetch('http://localhost:3000/comments'); // コメントデータを取得するURLに変更することが必要
    const comments = await commentsResponse.json();

    // 投稿とコメントを表示
    displayPosts(posts, comments);
  } catch (error) {
    console.error('投稿の取得エラー:', error);
  }
}
// 取得した投稿を表示する関数
function displayPosts(posts, comments) {

  if (posts.length === 0) {
    // 投稿がない場合はメッセージを表示
    postsContainer.innerHTML = '<p>投稿がありません</p>';
    return;
  }

  // 投稿のリストを作成し、HTMLに追加
  const postList = posts
    .map(post => {
      // comments から post.id と一致するコメントを取得
      const postComments = comments.filter(comment => comment.postId === post.id.toString());


      const commentsList = postComments.map(comment => `<li>${comment.text}</li>`).join('');
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
        <button onclick="addComment(${post.id})">Add Comment</button>
        <!-- 追加: コメントを表示する部分 -->
        <div>
        <label for="new-comment">New Comment:</label>
        <input type="text" id="new-comment" placeholder="Add a new comment">
        <button onclick="addCommentToPost(${post.id})">Add Comment</button>
        </div>
        </div>
        <hr>
        <hr>
    `;
    })
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


// コメントの追加
async function addComment(postId) {
  const text = prompt('コメントを入力してください:');
  if (text) {
    try {
      const response = await fetch('http://localhost:3000/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          postId: postId.toString(),
        }),
      });
      const data = await response.json();
      fetchPosts();
    } catch (error) {
      console.error('コメントの追加エラー:', error);
    }
  }
}

// コメントの追加（投稿ごと）
async function addCommentToPost(postId) {
  const textInput = document.getElementById('new-comment');
  const text = textInput.value.trim();

  if (text) {
    try {
      const response = await fetch('http://localhost:3000/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          postId: postId.toString(),
        }),
      });
      const data = await response.json();
      fetchPosts(); // 全体の投稿を再取得して表示を更新
    } catch (error) {
      console.error('コメントの追加エラー:', error);
    }
  }
}



