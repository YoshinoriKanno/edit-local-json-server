// APIのベースURL
const apiUrl = 'http://localhost:3000/posts';
const commentsUrl = 'http://localhost:3000/comments';

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

// データを取得する共通関数
async function fetchData(url) {
  try {
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    // エラーが発生した場合はログを出力
    handleError(`データの取得エラー (${url}):`, error);
    throw error; // エラーを再スローして呼び出し元に伝播
  }
}

// 投稿を取得する関数
async function fetchPosts() {
  try {
    const posts = await fetchData(apiUrl);
    const comments = await fetchData(commentsUrl);

    // 投稿とコメントを表示
    displayPosts(posts, comments);
  } catch (error) {
    // エラーが発生した場合はログを出力
    handleError('投稿の取得エラー:', error);
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
  const postList = posts.map(post => {
    // comments から post.id と一致するコメントを取得
    const postComments = comments.filter(comment => comment.postId === post.id.toString());

    const commentsList = postComments.map(comment => {
      return `
              <li>
                  ${comment.text}
                  <button onclick="deleteComment(${comment.id}, ${post.id})">Delete Comment</button>
              </li>
          `;
    }).join('');

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
              <!-- 追加: コメントを表示する部分 -->
              <div>
                  <label for="new-comment-${post.id}">New Comment:</label>
                  <input type="text" id="new-comment-${post.id}" placeholder="Add a new comment">
                  <button onclick="addCommentToPost(${post.id})">Add Comment</button>
              </div>
          </div>
          <hr>
          <hr>
      `;
  }).join('');
  postsContainer.innerHTML = postList;
}

// コメントの削除
async function deleteComment(commentId, postId) {
  try {
    const response = await fetch(`${commentsUrl}/${commentId}`, {
      method: 'DELETE',
    });
    fetchPosts(); // 全体の投稿を再取得して表示を更新
  } catch (error) {
    // エラーが発生した場合はログを出力
    handleError(`ID ${commentId}のコメントの削除エラー:`, error);
  }
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
async function editPost(postId) {
  try {
    console.log('1. 開始');

    const response = await fetch(`${apiUrl}/${postId}`);

    console.log('2. レスポンス取得完了');

    const post = await response.json();

    // 取得した投稿の情報をフォームにセット
    titleInput.value = post.title || '';
    authorInput.value = post.author || '';
    postIdInput.value = post.id;
    submitButton.innerText = 'Update Post';

    // 編集ボタンをクリックしたときに呼ばれる新しいハンドラーを設定
    submitButton.onclick = async () => {
      const updatedPostData = {
        title: titleInput.value,
        author: authorInput.value,
      };

      try {
        const updateResponse = await fetch(`${apiUrl}/${postId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedPostData),
        });

        const updatedPost = await updateResponse.json();

        // 更新が成功したらフォームをクリアして元の状態に戻す
        clearForm();
        submitButton.innerText = 'Create Post';
        submitButton.onclick = handleFormSubmit; // 元のハンドラーに戻す

        // 更新後の投稿を反映するために再取得
        fetchPosts();

        console.log('3. fetchPosts 完了');

      } catch (error) {
        handleError(`ID ${postId}の投稿の更新エラー:`, error);
      }
    };
  } catch (error) {
    // エラーが発生した場合はログを出力
    handleError(`ID ${postId}の投稿の取得エラー:`, error);

  }
}
// 新しい投稿を作成
async function createPost(newPost) {
  try {
    const response = await postData(apiUrl, newPost);
    fetchPosts();
  } catch (error) {
    // エラーが発生した場合はログを出力
    handleError('投稿の作成エラー:', error);
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

    // レスポンスが成功でない場合はエラーをスロー
    if (!response.ok) {
      throw new Error(`Failed to update post with ID ${postId}`);
    }

    fetchPosts();
  } catch (error) {
    handleError(`ID ${postId}の投稿の更新エラー:`, error);
  }
}

// 投稿を削除
async function deletePost(postId) {
  try {
    const response = await fetch(`${apiUrl}/${postId}`, {
      method: 'DELETE',
    });
    fetchPosts();
  } catch (error) {
    // エラーが発生した場合はログを出力
    handleError(`ID ${postId}の投稿の削除エラー:`, error);
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

// コメントの追加
async function addCommentToPost(postId) {
  const textInput = document.getElementById(`new-comment-${postId}`);
  const text = textInput.value.trim();

  if (text) {
    try {
      // postData 関数を追加
      const response = await postData(commentsUrl, { text, postId: postId.toString() });
      fetchPosts();
    } catch (error) {
      // エラーが発生した場合はログを出力
      handleError('コメントの追加エラー:', error);
    }
  }
}

// 新しく追加した postData 関数
async function postData(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}
