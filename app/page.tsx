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
  contact_info: string | null;
};

// ★稼ぐためのアフィリエイト商品データ（後で自分のAmazonリンクに書き換えられます）
const RECOMMEND_ITEMS = [
  { id: 1, name: "Logicool G PRO X", price: "¥9,000", img: "🖱️", desc: "最強の定番マウス", url: "https://amzn.to/4syG3Sy" },
  { id: 2, name: "SteelSeries Arctis", price: "¥6,500", img: "🎧", desc: "コスパ最強", url: "https://amzn.to/3YhUjkA" },
  { id: 3, name: "Razer Huntsman v3", price: "¥15,000", img: "⌨️", desc: "反応爆速キーボード", url: "https://amzn.to/3MZqQtl" },

];// 稼ぐための「高単価」バナー（後でA8.netなどのリンクに書き換えます）
const ADS_BANNER = {
 title: "PING値を下げろ",
  text: "勝てない原因は回線かも？FPS専用「高速回線」をチェック",
  url: "https://px.a8.net/...", // ※ここは自分のリンクのままにしておいてね！
  color: "bg-gradient-to-r from-slate-800 to-slate-900 border border-cyan-500/30"
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
  const [inputContact, setInputContact] = useState("");
  const [activeFilter, setActiveFilter] = useState("すべて");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!error) setPosts(data || []);
  };

  const handleAddPost = async () => {
    if (!inputMessage || !inputContact || !session) return alert("入力してください");
    const { error } = await supabase.from('posts').insert([{
      game: inputGame, rank: inputRank, message: inputMessage, contact_info: inputContact, tags: ["募集中"], user_id: session.user.id,
    }]);
    if (error) alert(error.message);
    else { await fetchPosts(); setIsModalOpen(false); setInputMessage(""); setInputContact(""); }
  };

  const filteredPosts = activeFilter === "すべて" ? posts : posts.filter((p) => p.game === activeFilter);

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-cyan-400 mb-6 text-center">FPS募集掲示板</h1>
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={[]} theme="dark" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <header className="bg-slate-800 p-4 sticky top-0 z-30 border-b border-slate-700 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold text-cyan-400">FPS掲示板</h1>
        <button onClick={() => supabase.auth.signOut()} className="text-xs bg-slate-700 px-3 py-1 rounded">ログアウト</button>
      </header>

      {/* 修正版：スタイリッシュな広告バナー */}
      <a href={ADS_BANNER.url} target="_blank" className={`block mx-4 mt-4 p-4 rounded-xl ${ADS_BANNER.color} text-slate-200 shadow-lg group hover:border-cyan-500 transition relative overflow-hidden`}>
        {/* 背景のキラッとする装飾 */}
        <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-cyan-500/10 to-transparent skew-x-12 transform translate-x-10 group-hover:translate-x-0 transition duration-500"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="text-lg font-bold text-cyan-400 flex items-center gap-2">
              <span className="text-xl">⚡️</span> {ADS_BANNER.title}
            </div>
            <div className="text-xs text-slate-400 mt-1">{ADS_BANNER.text}</div>
          </div>
          <div className="bg-cyan-900/50 text-cyan-300 px-3 py-1 rounded text-xs font-bold border border-cyan-700">
            CHECK ▶︎
          </div>
        </div>
      </a>

      {/* ★追加：稼ぐための「おすすめデバイス」広告セクション */}
      <div className="p-4 bg-slate-900">
        <h2 className="text-xs font-bold text-slate-500 mb-2 tracking-widest uppercase">Special Deals / おすすめデバイス</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {RECOMMEND_ITEMS.map((item) => (
            <a 
              key={item.id} 
              href={item.url} 
              target="_blank" 
              className="min-w-[200px] bg-slate-800 border border-slate-700 p-3 rounded-lg hover:border-cyan-500 transition shadow-md flex items-center gap-3"
            >
              <div className="text-3xl bg-slate-700 w-12 h-12 flex items-center justify-center rounded-md">
                {item.img}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate text-slate-200">{item.name}</div>
                <div className="text-[10px] text-slate-400 truncate mb-1">{item.desc}</div>
                <div className="text-xs font-bold text-cyan-400">{item.price}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="p-4 flex gap-2 overflow-x-auto sticky top-[64px] bg-slate-900 z-10 border-b border-slate-800/50">
        {["すべて", "APEX", "VALORANT", "OW2"].map((tag) => (
          <button key={tag} onClick={() => setActiveFilter(tag)} className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${activeFilter === tag ? "bg-cyan-600 shadow-lg scale-105" : "bg-slate-700 text-slate-400"}`}>{tag}</button>
        ))}
      </div>

      <div className="px-4 space-y-4 mt-4">
        {filteredPosts.map((post) => (
          <PostItem key={post.id} post={post} currentUserId={session?.user?.id} onDelete={fetchPosts} />
        ))}
      </div>

      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-6 right-6 bg-cyan-500 hover:bg-cyan-400 text-white w-14 h-14 rounded-full shadow-lg text-2xl font-bold flex items-center justify-center z-20 transition transform hover:rotate-90">＋</button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">新規募集</h2>
            <div className="space-y-4">
              <select value={inputGame} onChange={(e) => setInputGame(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white">
                {Object.keys(GAME_RANKS).map((game) => <option key={game} value={game}>{game}</option>)}
              </select>
              <select value={inputRank} onChange={(e) => setInputRank(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white">
                {GAME_RANKS[inputGame].map((rank) => <option key={rank} value={rank}>{rank}</option>)}
              </select>
              <textarea rows={3} value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="メッセージ" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
              <input type="text" value={inputContact} onChange={(e) => setInputContact(e.target.value)} placeholder="Discord ID" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-700 rounded-lg">キャンセル</button>
              <button onClick={handleAddPost} className="flex-1 py-2 bg-cyan-600 rounded-lg">投稿する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}