"use client";

import { useState } from "react";
import { supabase } from '@/lib/supabase';

type Post = {
  id: number;
  message: string | null;
  game: string | null;
  rank: string | null;
  user_id: string | null;
  tags: string[] | null;
  created_at: string;
  contact_info: string | null;
};

type Props = {
  post: Post;
  currentUserId: string | undefined;
  onDelete: (id: number) => void;
};

export default function PostItem({ post, currentUserId, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(post.message || "");
  const [showContact, setShowContact] = useState(false);
  // ★追加：コピーしたかどうかの状態
  const [isCopied, setIsCopied] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('ja-JP').slice(5, -3);
    } catch (e) {
      return "";
    }
  };

  const handleUpdate = async () => {
    const { error } = await supabase
      .from("posts")
      .update({ message: message })
      .eq("id", post.id);

    if (error) {
      alert("エラーが発生しました: " + error.message);
    } else {
      setIsEditing(false);
      window.location.reload();
    }
  };

  // ★追加：クリップボードにコピーする機能
  const handleCopy = () => {
    if (!post.contact_info) return;
    
    // クリップボードに書き込む
    navigator.clipboard.writeText(post.contact_info)
      .then(() => {
        setIsCopied(true);
        // 2秒後に元の表示に戻す
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        alert("コピーに失敗しました");
      });
  };

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md relative animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-center mb-2">
        <span className="bg-cyan-900 text-cyan-200 text-xs px-2 py-1 rounded font-bold">
          {post.game}
        </span>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-xs">
            {formatDate(post.created_at)}
          </span>

          {currentUserId === post.user_id && !isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-slate-500 hover:text-cyan-400 text-xs underline transition bg-slate-900 px-2 py-1 rounded border border-slate-700"
              >
                編集
              </button>
              <button
                onClick={() => onDelete(post.id)}
                className="text-slate-500 hover:text-red-500 transition w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-700"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="font-bold text-lg mb-1">{post.rank}帯</div>

      {isEditing ? (
        // 編集モード
        <div className="mt-2 mb-4">
          <textarea
            className="w-full p-2 text-white bg-slate-900 border border-slate-600 rounded focus:border-cyan-500 outline-none resize-none"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button
              onClick={() => setIsEditing(false)}
              className="bg-slate-600 text-white px-3 py-1 rounded text-sm hover:bg-slate-500 transition"
            >
              キャンセル
            </button>
            <button
              onClick={handleUpdate}
              className="bg-cyan-600 text-white px-3 py-1 rounded text-sm hover:bg-cyan-500 transition"
            >
              保存する
            </button>
          </div>
        </div>
      ) : (
        // 通常モード
        <>
          <p className="text-slate-300 text-sm mb-3 whitespace-pre-wrap">{post.message}</p>
          
          <div className="flex gap-2 flex-wrap mb-4">
            {post.tags?.map((tag) => (
              <span key={tag} className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                # {tag}
              </span>
            ))}
          </div>

          {showContact ? (
            // ■■■ コピー機能付きの表示エリア ■■■
            <div className="bg-slate-900 p-3 rounded border border-cyan-900 text-center animate-in zoom-in-95 duration-200">
              <p className="text-xs text-slate-400 mb-1">連絡先 (タップしてコピー)</p>
              
              <button 
                onClick={handleCopy}
                className="w-full flex flex-col items-center justify-center group"
              >
                <span className={`font-bold text-lg transition-all duration-200 ${isCopied ? "text-green-400 scale-110" : "text-cyan-400 group-hover:text-cyan-300"}`}>
                  {isCopied ? "コピーしました！" : (post.contact_info || "ID未設定")}
                </span>
                
                {/* コピーアイコン風の装飾 */}
                {!isCopied && (
                  <span className="text-[10px] text-slate-500 mt-1">
                    📋 タップしてコピー
                  </span>
                )}
              </button>
            </div>
          ) : (
            // 参加ボタン
            <button 
              onClick={() => setShowContact(true)}
              className="w-full py-2 bg-slate-700 hover:bg-cyan-600 rounded-lg text-sm font-bold transition shadow-sm active:scale-95"
            >
              参加を希望する（IDを表示）
            </button>
          )}
        </>
      )}
    </div>
  );
}