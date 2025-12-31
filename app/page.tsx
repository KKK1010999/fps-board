"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PostItem from "@/components/PostItem";

type Post = any; 

const GAME_RANKS: { [key: string]: string[] } = {
  "APEX": ["ルーキー", "ブロンズ", "シルバー", "ゴールド", "プラチナ", "ダイヤ", "マスター", "プレデター"],
  "VALORANT": ["アイアン", "ブロンズ", "シルバー", "ゴールド", "プラチナ", "ダイヤ", "アセンダント", "イモータル", "レディアント"],
  "OW2": ["ブロンズ", "シルバー", "ゴールド", "プラチナ", "ダイヤ", "マスター", "グランドマスター", "チャンピオン", "TOP500"],
};

const ID_TYPES = ["Discord", "Riot ID", "PSN ID", "Steam ID", "その他"];
const AVAILABLE_TAGS = ["初心者歓迎", "聞き専OK", "社会人限定", "ガチ勢", "まったり"];

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

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!error) setPosts(data || []);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleAddPost = async () => {
    if (!inputMessage || !inputContact) return alert("入力してください");
    
    // データベースへの登録（IDタイプをメッセージの先頭に付与して保存）
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
      // Xシェア用のURL作成
      const text = `${inputGame}で${inputRank}募集！\n${selectedTags.join(' ')}\n「${inputMessage}」\n#FPS募集 #掲示板\n`;
      const encodedText = encodeURIComponent(text);
      setShareUrl(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodeURIComponent(window.location.href)}`);
      
      await fetchPosts();
      setIsModalOpen(false);
      // リセット
      setInputMessage(""); setInputContact(""); setSelectedTags([]);
    }
  };

  const filteredPosts = activeFilter === "すべて" ? posts : posts.filter((p: any) => p.game === activeFilter);

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-24">
      <header className="bg-slate-800 p-4 sticky top-0 z-30 border-b border-slate-700 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold text-cyan-400 font-sans tracking-tight">FPS-BOARD</h1>
        <div className="text-[10px] text-slate-500 font-mono">2025.12.31 15:52</div>
      </header>

      {/* Xシェア誘導バナー（投稿直後のみ表示） */}
      {shareUrl && (
        <div className="m-4 p-4 bg-cyan-900/30 border border-cyan-500 rounded-xl animate-bounce">
          <div className="text-sm font-bold text-cyan-400 mb-2">🎉 募集を投稿しました！</div>
          <a href={shareUrl} target="_blank" className="block w-full py-2 bg-black text-white text-center rounded-lg font-bold text-sm">
            𝕏 (Twitter) でさらに拡散する
          </a>
          <button onClick={() => setShareUrl("")} className="w-full mt-2 text-[10px] text-slate-500">とじる</button>
        </div>
      )}

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
            <div className="flex flex-wrap gap-2">
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