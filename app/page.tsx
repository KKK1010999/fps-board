"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Session } from '@supabase/supabase-js';
import PostItem from "@/components/PostItem";

type Post = {
  id: number;
  game: string;
  rank: string;
  message: string;
  tags: string[];
  created_at: string;
  user_id: string;
  contact_info: string | null; // ★追加
};

const GAME_RANKS: { [key: string]: string[] } = {
  "APEX": ["ルーキー", "ブロンズ", "シルバー", "ゴールド", "プラチナ", "ダイヤ", "マスター", "プレデター"],
  "VALORANT": ["アイアン", "ブロンズ", "シルバー", "ゴールド", "プラチナ", "ダイヤ", "アセンダント", "イモータル", "レディアント"],
  "OW2": ["ブロンズ", "シルバー", "ゴールド", "プラチナ", "ダイヤ", "マスター", "グランドマスター", "チャンピオン", "TOP500"],
};

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputGame, setInputGame] = useState("APEX");
  const [inputRank, setInputRank] = useState(GAME_RANKS["APEX"][0]);
  const [inputMessage, setInputMessage] = useState("");
  const [inputContact, setInputContact] = useState(""); // ★追加：連絡先入力用
  const [activeFilter, setActiveFilter] = useState("すべて");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (GAME_RANKS[inputGame]) {
      setInputRank(GAME_RANKS[inputGame][0]);
    }
  }, [inputGame]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setPosts(data || []);
    }
  };

  const handleAddPost = async () => {
    // 連絡先がないと投稿できないようにする
    if (!inputMessage || !inputContact || !session) {
      alert("メッセージと連絡先を入力してください");
      return;
    }

    const newPostData = {
      game: inputGame,
      rank: inputRank,
      message: inputMessage,
      contact_info: inputContact, // ★追加：データベースに保存
      tags: ["募集中"],
      user_id: session.user.id,
    };

    const { error } = await supabase.from('posts').insert([newPostData]);

    if (error) {
      alert("エラー: " + error.message);
    } else {
      await fetchPosts();
      setIsModalOpen(false);
      setInputMessage("");
      setInputContact(""); // リセット
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm("本当に削除しますか？")) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
      alert("削除できませんでした");
    } else {
      await fetchPosts();
    }
  };

  const filteredPosts = activeFilter === "すべて" 
    ? posts 
    : posts.filter((post) => post.game === activeFilter);

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-cyan-400 mb-6 text-center">FPS募集掲示板</h1>
          <p className="text-slate-400 text-sm mb-6 text-center">投稿するにはログインしてください</p>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            theme="dark"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <header className="bg-slate-800 p-4 sticky top-0 z-10 border-b border-slate-700 shadow-lg flex justify-between items-center">
        <h1 className="text-xl font-bold text-cyan-400">FPS掲示板</h1>
        <button 
          onClick={() => supabase.auth.signOut()} 
          className="text-xs bg-slate-700 px-3 py-1 rounded hover:bg-slate-600 transition"
        >
          ログアウト
        </button>
      </header>

      <div className="p-4 flex gap-2 overflow-x-auto">
        {["すべて", "APEX", "VALORANT", "OW2"].map((tag) => (
          <button 
            key={tag} 
            onClick={() => setActiveFilter(tag)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition font-bold ${
              activeFilter === tag 
                ? "bg-cyan-600 text-white shadow-lg scale-105" 
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-4">
        {filteredPosts.length === 0 ? (
          <p className="text-center text-slate-500 py-10">まだ募集がありません</p>
        ) : (
          filteredPosts.map((post) => (
            <PostItem 
              key={post.id} 
              post={post} 
              currentUserId={session?.user?.id}
              onDelete={handleDeletePost}
            />
          ))
        )}
      </div>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-cyan-500 hover:bg-cyan-400 text-white w-14 h-14 rounded-full shadow-lg text-2xl font-bold flex items-center justify-center transition transform hover:scale-105 z-20"
      >
        ＋
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">新規募集を作成</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">ゲームタイトル</label>
                <select 
                  value={inputGame}
                  onChange={(e) => setInputGame(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-cyan-500 outline-none"
                >
                  {Object.keys(GAME_RANKS).map((game) => (
                    <option key={game} value={game}>{game}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">現在のランク</label>
                <select 
                  value={inputRank}
                  onChange={(e) => setInputRank(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-cyan-500 outline-none"
                >
                  {GAME_RANKS[inputGame].map((rank) => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">募集メッセージ</label>
                <textarea 
                  rows={3} 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="例: @1 楽しくできる方！" 
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-cyan-500 outline-none"
                ></textarea>
              </div>
              
              {/* ★ここに入力欄を追加しました */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Discord ID / ゲームID</label>
                <input 
                  type="text"
                  value={inputContact}
                  onChange={(e) => setInputContact(e.target.value)}
                  placeholder="例: user_name#1234" 
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-cyan-500 outline-none"
                />
              </div>

            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition">キャンセル</button>
              <button onClick={handleAddPost} className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold transition">投稿する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}