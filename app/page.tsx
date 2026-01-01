"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PostItem from "@/components/PostItem";

type Post = any; 

// A8.net 広告バナー
const ADS_BANNER = {
  title: "PING値を下げろ",
  text: "勝てない原因は回線かも？FPS専用「高速回線」をチェック",
  url: "https://px.a8.net/svt/ejp?a8mat=45KRG0+BQPSAA+3SPO+CKJSMQ", 
  color: "bg-gradient-to-r from-slate-800 to-slate-900 border border-cyan-500/30"
};

// Amazon おすすめデバイス
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

const ID_TYPES = ["Discord", "Riot ID", "PSN ID", "Steam ID", "その他"];

// ★修正：人数タグを追加して、先頭に持ってきました（選びやすいように）
const AVAILABLE_TAGS = [
  "@1", "@2", "@3", 
  "初心者歓迎", "雰囲気重視", "怒らない人", "エンジョイ", "ガチ勢",
  "聞き専OK", "VC必須", "PC", "CS(PS5/Switch)", "クロスプレイ",
  "社会人限定", "学生OK", "20歳以上", "女子歓迎", "主婦/主夫",
  "ランクマ", "カジュアル/アンレ", "固定メンバー募集", "サブ垢", "キャリーして"
];

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // 入力用ステート
  const [inputGame, setInputGame] = useState("APEX");
  const [inputRank, setInputRank] = useState(GAME_RANKS["APEX"][0]);
  const [inputMessage, setInputMessage] = useState("");
  const [inputIdType, setInputIdType] = useState("Discord");
  const [inputContact, setInputContact] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [activeFilter, setActiveFilter] = useState("すべて");

  // オートリロード（10秒ごと）
  useEffect(() => {
    fetchPosts(); 
    const timer = setInterval(() => { fetchPosts(); }, 10000); 
    return () => clearInterval(timer); 
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!error && data) setPosts(data);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleAddPost = async () => {
    if (!inputMessage || !inputContact) return alert("入力してください");
    
    const fullContact = `[${inputIdType}] ${inputContact}`;
    
    const { error } = await supabase.from('posts').insert([{
      game: inputGame, 
      rank: inputRank, 
      message: inputMessage, 
      contact_info: fullContact, 
      tags: selectedTags.length > 0 ? selectedTags : ["募集中"],
    }]);

    if (error) {
      alert("エラーが発生しました");
    } else {
      // Xシェア用文章生成
      const tagText = selectedTags.map(t => `#${t.replace('@', '')}`).join(' '); // @はハッシュタグに使えない場合があるのでケアしてもいいが、Xは#@1もいける場合がある。念のためそのままで。
      const xTagText = selectedTags.map(t => t.startsWith('@') ? t : `#${t}`).join(' '); // @1はハッシュタグにせずそのまま表示したほうが文化に合う
      
      const text = `【${inputGame}】${inputRank}募集\n${xTagText}\n\n「${inputMessage}」\n\n#FPS募集 #掲示板\n`;
      const encodedText = encodeURIComponent(text);
      setShareUrl(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodeURIComponent(window.location.href)}`);
      
      await fetchPosts();
      setIsModalOpen(false);
      setInputMessage(""); setInputContact(""); setSelectedTags([]);
    }
  };

  const filteredPosts = activeFilter === "すべて" ? posts : posts.filter((p: any) => p.game === activeFilter);

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-24">
      <header className="bg-slate-800 p-4 sticky top-0 z-30 border-b border-slate-700 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold text-cyan-400 font-sans tracking-tight">FPS-BOARD</h1>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <div className="text-[10px] text-slate-500 font-mono">LIVE CONNECT</div>
        </div>
      </header>

      {/* Xシェア ポップアップ */}
      {shareUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-cyan-500 p-6 rounded-2xl shadow-2xl w-full max-w-sm relative transform transition-all scale-100">
            <button 
              onClick={() => setShareUrl("")} 
              className="absolute top-2 right-3 text-slate-500 hover:text-white text-xl"
            >×</button>
            
            <div className="text-center">
              <div className="text-4xl mb-2">📢</div>
              <h3 className="text-lg font-bold text-white mb-1">投稿完了！</h3>
              <p className="text-xs text-slate-400 mb-4">X (Twitter) にも投稿して<br/>集まりやすくしますか？</p>
              
              <a 
                href={shareUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => setShareUrl("")} 
                className="block w-full py-3 bg-[#1DA1F2] hover:bg-[#1a91da] text-white rounded-xl font-bold text-sm shadow-lg transition-transform active:scale-95"
              >
                𝕏 で募集を拡散する
              </a>
              
              <button onClick={() => setShareUrl("")} className="mt-3 text-xs text-slate-500 hover:text-slate-300 underline">
                掲示板のみ（Xには投稿しない）
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Amazonおすすめデバイス */}
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
      <div className="p-4 flex gap-2 overflow-x-auto sticky top-[61px] bg-slate-900 z-10 border-b border-slate-800/50">
        {["すべて", "APEX", "VALORANT", "OW2"].map((tag) => (
          <button key={tag} onClick={() => setActiveFilter(tag)} className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all ${activeFilter === tag ? "bg-cyan-600 shadow-cyan-900/50 shadow-lg scale-105" : "bg-slate-800 text-slate-400"}`}>{tag}</button>
        ))}
      </div>

      {/* 投稿一覧 */}
      <div className="px-4 space-y-4 mt-4">
        {filteredPosts.map((post: any) => (
          <PostItem key={post.id} post={post} currentUserId={undefined} onDelete={fetchPosts} />
        ))}
      </div>

      {/* 投稿ボタン（＋） */}
      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-6 right-6 bg-cyan-500 hover:bg-cyan-400 text-white w-14 h-14 rounded-full shadow-2xl text-3xl font-light flex items-center justify-center z-20 transition-transform active:scale-90">＋</button>

      {/* 投稿用モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-800 p-6 rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">新規募集</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <select value={inputGame} onChange={(e) => setInputGame(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm">{Object.keys(GAME_RANKS).map(g => <option key={g} value={g}>{g}</option>)}</select>
              <select value={inputRank} onChange={(e) => setInputRank(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm">{GAME_RANKS[inputGame].map(r => <option key={r} value={r}>{r}</option>)}</select>
            </div>

            {/* タグ選択 */}
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {AVAILABLE_TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${selectedTags.includes(tag) ? "bg-cyan-600 border-cyan-400 text-white" : "bg-slate-900 border-slate-700 text-slate-500"}`}>{tag}</button>
              ))}
            </div>

            <textarea value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="募集メッセージ (例: @1 まったりやりましょう)" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm focus:border-cyan-500 outline-none h-24 resize-none" />
            
            <div className="flex gap-2">
              <select value={inputIdType} onChange={(e) => setInputIdType(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-[10px] w-28 font-bold">{ID_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
              <input value={inputContact} onChange={(e) => setInputContact(e.target.value)} placeholder="IDを入力" className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none" />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-700 rounded-xl text-sm font-bold">やめる</button>
              <button onClick={handleAddPost} className="flex-1 py-3 bg-cyan-600 rounded-xl text-sm font-bold shadow-lg shadow-cyan-900/20">投稿する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}