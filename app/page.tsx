"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PostItem from "@/components/PostItem";

// ★修正点：user_id を復活させました（これでエラーが消えます）
type Post = {
  id: number;
  game: string;
  rank: string;
  message: string;
  tags: string[];
  created_at: string;
  user_id: string; // 👈 ここを復活！
  contact_info: string | null;
};

// 広告データ
const ADS_BANNER = {
  title: "PING値を下げろ",
  text: "勝てない原因は回線かも？FPS専用「高速回線」をチェック",
  url: "https://px.a8.net/svt/ejp?a8mat=45KRG0+BQPSAA+3SPO+CKJSMQ", 
  color: "bg-gradient-to-r from-slate-800 to-slate-900 border border-cyan-500/30"
};

// おすすめデバイス
const RECOMMEND_ITEMS = [
  { id: 1, name: "G703h LIGHTSPEED HERO", price: "¥9,000", img: "🖱️", desc: "最強の定番マウス", url: "https://amzn.to/4jnuadS" },
  { id: 2, name: "Razer BlackShark V2 X", price: "¥6,000", img: "🎧", desc: "足音が超聞こえる", url: "https://amzn.to/48ZO2Af" },
  { id: 3, name: "Logicool G PRO", price: "¥1,5000", img: "⌨️", desc: "反応爆速キーボード", url: "https://amzn.to/44SePvX" },
];

const GAME_RANKS: { [key: string]: string[] } = {
  "APEX": ["ルーキー", "ブロンズ", "シルバー", "ゴールド", "プラチナ", "ダイヤ", "マスター", "プレデター"],
  "VALORANT": ["アイアン", "ブロンズ", "シルバー", "ゴールド", "プラチナ", "ダイヤ", "アセンダント", "イモータル", "レディアント"],
  "OW2": ["ブロンズ", "シルバー", "ゴールド", "プラチナ", "ダイヤ", "マスター", "グランドマスター", "チャンピオン", "TOP500"],
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [inputGame, setInputGame] = useState("APEX");
  const [inputRank, setInputRank] = useState(GAME_RANKS["APEX"][0]);
  const [inputMessage, setInputMessage] = useState("");
  const [inputContact, setInputContact] = useState("");
  const [activeFilter, setActiveFilter] = useState("すべて");

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!error) setPosts(data || []);
  };

  const handleAddPost = async () => {
    if (!inputMessage || !inputContact) return alert("メッセージと連絡先を入力してください");
    
    // 匿名投稿なので user_id は入れずに送信する
    const { error } = await supabase.from('posts').insert([{
      game: inputGame, 
      rank: inputRank, 
      message: inputMessage, 
      contact_info: inputContact, 
      tags: ["募集中"], 
      // user_id はDB側で自動またはNULLになるので送らなくてOK
    }]);

    if (error) {
      console.error(error);
      alert("投稿エラー：しばらく経ってから試してください");
    } else { 
      await fetchPosts(); 
      setIsModalOpen(false); 
      setInputMessage(""); 
      setInputContact(""); 
    }
  };

  const filteredPosts = activeFilter === "すべて" ? posts : posts.filter((p) => p.game === activeFilter);

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <header className="bg-slate-800 p-4 sticky top-0 z-30 border-b border-slate-700 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold text-cyan-400">FPS掲示板</h1>
        <div className="text-xs text-slate-500 font-mono">Anonymous Mode</div>
      </header>

      {/* 広告バナー */}
      <a href={ADS_BANNER.url} target="_blank" className={`block mx-4 mt-4 p-4 rounded-xl ${ADS_BANNER.color} text-slate-200 shadow-lg group hover:border-cyan-500 transition relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-cyan-500/10 to-transparent skew-x-12 transform translate-x-10 group-hover:translate-x-0 transition duration-500"></div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="text-lg font-bold text-cyan-400 flex items-center gap-2">
              <span className="text-xl">⚡️</span> {ADS_BANNER.title}
            </div>
            <div className="text-xs text-slate-400 mt-1">{ADS_BANNER.text}</div>
          </div>
          <div className="bg-cyan-900/50 text-cyan-300 px-3 py-1 rounded text-xs font-bold border border-cyan-700">CHECK ▶︎</div>
        </div>
      </a>

      {/* デバイス紹介 */}
      <div className="p-4 bg-slate-900 mt-2">
        <h2 className="text-xs font-bold text-slate-500 mb-2 tracking-widest uppercase">Amazon / おすすめデバイス</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {RECOMMEND_ITEMS.map((item) => (
            <a key={item.id} href={item.url} target="_blank" className="min-w-[200px] bg-slate-800 border border-slate-700 p-3 rounded-lg hover:border-cyan-500 transition shadow-md flex items-center gap-3">
              <div className="w-12 h-12 flex-shrink-0 bg-slate-700 rounded overflow-hidden flex items-center justify-center text-2xl">
                 {item.img.startsWith('http') ? <img src={item.img} alt={item.name} className="w-full h-full object-contain" /> : <span className="text-2xl">{item.img}</span>}
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

      {/* フィルター */}
      <div className="p-4 flex gap-2 overflow-x-auto sticky top-[64px] bg-slate-900 z-10 border-b border-slate-800/50">
        {["すべて", "APEX", "VALORANT", "OW2"].map((tag) => (
          <button key={tag} onClick={() => setActiveFilter(tag)} className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${activeFilter === tag ? "bg-cyan-600 shadow-lg scale-105" : "bg-slate-700 text-slate-400"}`}>{tag}</button>
        ))}
      </div>

      {/* 投稿一覧 */}
      <div className="px-4 space-y-4 mt-4">
        {filteredPosts.map((post) => (
          // 修正点：currentUserId に undefined を渡すように変更
          <PostItem key={post.id} post={post} currentUserId={undefined} onDelete={fetchPosts} />
        ))}
        {filteredPosts.length === 0 && (
          <div className="text-center text-slate-500 py-10">まだ投稿がありません。<br/>自由に募集しよう！</div>
        )}
      </div>

      {/* 投稿ボタン */}
      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-6 right-6 bg-cyan-500 hover:bg-cyan-400 text-white w-14 h-14 rounded-full shadow-lg text-2xl font-bold flex items-center justify-center z-20 transition transform hover:rotate-90">＋</button>

      {/* 投稿用モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">新規募集（匿名）</h2>
            <div className="space-y-4">
              <select value={inputGame} onChange={(e) => setInputGame(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white">
                {Object.keys(GAME_RANKS).map((game) => <option key={game} value={game}>{game}</option>)}
              </select>
              <select value={inputRank} onChange={(e) => setInputRank(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white">
                {GAME_RANKS[inputGame].map((rank) => <option key={rank} value={rank}>{rank}</option>)}
              </select>
              <textarea rows={3} value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="メッセージ (例: @1 ゴールド帯)" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
              <input type="text" value={inputContact} onChange={(e) => setInputContact(e.target.value)} placeholder="Discord ID (例: user#1234)" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
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